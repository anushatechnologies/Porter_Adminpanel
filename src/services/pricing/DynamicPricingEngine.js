/**
 * Dynamic Pricing Engine for Anusha Porter Passenger Car Services
 * 
 * Implements centralized pricing calculation with integer minor unit (paise) precision
 * to avoid floating-point inaccuracies.
 * Exposes a modular calculation pipeline with itemized fare breakdown.
 */

// Helper: Convert Rupee to Paise (integer)
export const toPaise = (rupees) => Math.round(Number(rupees || 0) * 100);

// Helper: Convert Paise to Rupee (2 decimal places number)
export const toRupees = (paise) => Math.round(Number(paise || 0)) / 100;

// Helper: Format currency in Indian Rupees format (₹)
export const formatRupee = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(num);
};

/**
 * Check if a given time falls within the night window (e.g. 23:00 to 05:00)
 */
export const isNightTime = (timeStr, nightStart = '23:00', nightEnd = '05:00') => {
  if (!timeStr) {
    const now = new Date();
    timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  const [tHours, tMins] = timeStr.split(':').map(Number);
  const timeVal = tHours * 60 + tMins;

  const [sHours, sMins] = nightStart.split(':').map(Number);
  const startVal = sHours * 60 + sMins;

  const [eHours, eMins] = nightEnd.split(':').map(Number);
  const endVal = eHours * 60 + eMins;

  if (startVal > endVal) {
    // Crosses midnight, e.g. 23:00 to 05:00
    return timeVal >= startVal || timeVal < endVal;
  }
  return timeVal >= startVal && timeVal < endVal;
};

/**
 * Core Fare Calculation Engine
 * 
 * @param {Object} params Trip parameters
 * @param {Object} pricingConfig Active pricing configuration snapshot
 * @returns {Object} Complete itemized fare breakdown and commission split
 */
export const calculateFare = (params, pricingConfig) => {
  const {
    serviceType = 'one_way',      // 'one_way' | 'round_trip' | 'rental' | 'airport'
    vehicleCategoryId = 'sedan',  // 'hatchback' | 'sedan' | 'suv' | 'premium' | 'luxury'
    distance = 0,                 // in KM
    duration = 0,                 // in Minutes
    passengerCount = 1,
    bookingTime = '',             // 'HH:mm'
    rentalPackageId = '',         // package ID if rental
    additionalStops = 0,          // count of extra stops
    waitingMinutes = 0,           // waiting time in minutes
    airportTransferType = 'drop', // 'pickup' | 'drop'
    zoneId = null,                // optional zone identifier
    coupon = null,                // applied coupon object
    manualToll = null,
    manualParking = null,
    surgeMode = null              // manual surge override e.g. 'peak' | 'festival' | 1.2
  } = params;

  // 1. Resolve vehicle pricing & capacity specs
  const vehicleConfig = pricingConfig?.vehicles?.[vehicleCategoryId] || {
    baseFare: 300,
    minKm: 10,
    perKm: 14,
    perMinute: 1.5,
    driverAllowance: 100,
    maxPassengers: 4,
    maxLuggage: 2
  };

  // Passenger capacity guard
  const maxCapacity = vehicleConfig.maxPassengers || 4;
  if (passengerCount > maxCapacity) {
    return {
      isValid: false,
      error: `Please select a larger vehicle for this number of passengers. Maximum capacity for this vehicle is ${maxCapacity} passengers.`,
      capacityExceeded: true,
      maxCapacity,
      passengerCount
    };
  }

  // Common pricing components from config
  const waitingRules = pricingConfig?.waitingRules || { freeMinutes: 15, ratePer15Min: 50, airportFreeMinutes: 30 };
  const nightRules = pricingConfig?.nightRules || { enabled: true, start: '23:00', end: '05:00', fixedCharge: 150, type: 'fixed' };
  const surgeRules = pricingConfig?.surgeRules || { currentMultiplier: 1.0, activeMode: 'normal' };
  const stopRules = pricingConfig?.stopRules || { freeStops: 1, ratePerStop: 50 };
  const taxRules = pricingConfig?.taxRules || { enabled: true, percentage: 5, name: 'GST' };
  const commissionRules = pricingConfig?.commissionRules || { companyRatePercent: 20 };

  // All monetary intermediate values stored in PAISE for zero floating-point drift
  let baseFarePaise = 0;
  let distanceFarePaise = 0;
  let timeFarePaise = 0;
  let driverAllowancePaise = 0;
  let extraKmPaise = 0;
  let extraHoursPaise = 0;

  // 2. Service Specific Fare Logic
  if (serviceType === 'rental') {
    // Rental Package Logic
    const packages = pricingConfig?.rentalPackages || [];
    const pkg = packages.find(p => p.id === rentalPackageId) || packages[0] || {
      id: 'pkg-8-80',
      name: '8 Hours / 80 KM',
      baseFare: 1800,
      includedKm: 80,
      includedHours: 8,
      extraKmRate: 18,
      extraHourRate: 150,
      driverAllowance: 300
    };

    baseFarePaise = toPaise(pkg.baseFare);
    driverAllowancePaise = toPaise(pkg.driverAllowance || 0);

    const extraKm = Math.max(0, distance - pkg.includedKm);
    const extraKmRate = pkg.extraKmRate || vehicleConfig.perKm || 18;
    extraKmPaise = toPaise(extraKm * extraKmRate);
    distanceFarePaise = extraKmPaise;

    const actualHours = duration / 60;
    const extraHours = Math.max(0, Math.ceil(actualHours - pkg.includedHours));
    const extraHourRate = pkg.extraHourRate || 150;
    extraHoursPaise = toPaise(extraHours * extraHourRate);
    timeFarePaise = extraHoursPaise;

  } else if (serviceType === 'round_trip') {
    // Round Trip Logic: Return distance = distance * 2 (or route total), minimum KM & per KM
    const roundTripConfig = pricingConfig?.roundTrip || { minKm: 50, perKm: vehicleConfig.perKm || 14, driverAllowance: 300, nightStayCharge: 500 };
    const effectiveDistance = distance * 2;
    const minKm = roundTripConfig.minKm || 50;
    const perKmRate = roundTripConfig.perKm || vehicleConfig.perKm || 14;

    baseFarePaise = toPaise(vehicleConfig.baseFare || 300);
    driverAllowancePaise = toPaise(roundTripConfig.driverAllowance || 300);

    if (effectiveDistance <= minKm) {
      distanceFarePaise = toPaise(minKm * perKmRate);
    } else {
      distanceFarePaise = toPaise(effectiveDistance * perKmRate);
    }

  } else if (serviceType === 'airport') {
    // Airport Transfer Logic
    const airportConfig = pricingConfig?.airportTransfer || {
      pickupFee: 150,
      dropFee: 100,
      parkingFee: 100,
      baseFare: vehicleConfig.baseFare || 300,
      minKm: vehicleConfig.minKm || 10,
      perKm: vehicleConfig.perKm || 14
    };

    baseFarePaise = toPaise(airportConfig.baseFare || vehicleConfig.baseFare || 300);
    const airportSurcharge = airportTransferType === 'pickup' ? (airportConfig.pickupFee || 150) : (airportConfig.dropFee || 100);
    baseFarePaise += toPaise(airportSurcharge);

    const minKm = vehicleConfig.minKm || 10;
    const perKmRate = vehicleConfig.perKm || 14;
    if (distance > minKm) {
      const extraKm = distance - minKm;
      distanceFarePaise = toPaise(extraKm * perKmRate);
    }

    driverAllowancePaise = toPaise(vehicleConfig.driverAllowance || 100);

  } else {
    // Standard One-Way Ride
    // Formula: If distance <= minKm => Base Fare.
    // If distance > minKm => Base Fare + ((distance - minKm) * perKm)
    const baseFare = vehicleConfig.baseFare || 300;
    const minKm = vehicleConfig.minKm || 10;
    const perKmRate = vehicleConfig.perKm || 14;

    baseFarePaise = toPaise(baseFare);

    if (distance > minKm) {
      const extraKm = distance - minKm;
      distanceFarePaise = toPaise(extraKm * perKmRate);
    } else {
      distanceFarePaise = 0;
    }

    driverAllowancePaise = toPaise(vehicleConfig.driverAllowance || 100);

    // Configurable time fare (if enabled)
    if (vehicleConfig.perMinute && duration > 0) {
      timeFarePaise = toPaise(duration * vehicleConfig.perMinute);
    }
  }

  // 3. Waiting Charges
  let waitingChargePaise = 0;
  const freeMins = serviceType === 'airport' && airportTransferType === 'pickup'
    ? (waitingRules.airportFreeMinutes || 30)
    : (waitingRules.freeMinutes || 15);

  if (waitingMinutes > freeMins) {
    const chargeableMins = waitingMinutes - freeMins;
    const unitsOf15 = Math.ceil(chargeableMins / 15);
    waitingChargePaise = toPaise(unitsOf15 * (waitingRules.ratePer15Min || 50));
  }

  // 4. Additional Stop Charges
  let stopsChargePaise = 0;
  const freeStops = stopRules.freeStops || 1;
  if (additionalStops > freeStops) {
    const extraStops = additionalStops - freeStops;
    stopsChargePaise = toPaise(extraStops * (stopRules.ratePerStop || 50));
  }

  // 5. Toll & Parking Charges
  const tollRules = pricingConfig?.tollRules || { mode: 'actual', defaultEstimate: 0 };
  const parkingRules = pricingConfig?.parkingRules || { mode: 'actual', defaultEstimate: 0 };

  let tollPaise = 0;
  if (manualToll !== null && manualToll !== undefined) {
    tollPaise = toPaise(manualToll);
  } else if (tollRules.mode === 'fixed') {
    tollPaise = toPaise(tollRules.fixedAmount ?? 80);
  } else if (tollRules.mode === 'estimated') {
    tollPaise = toPaise(tollRules.defaultEstimate ?? 80);
  } else if (tollRules.mode === 'actual' || tollRules.mode === 'customer_pays') {
    tollPaise = toPaise(tollRules.defaultEstimate ?? 0);
  }

  let parkingPaise = 0;
  if (manualParking !== null && manualParking !== undefined) {
    parkingPaise = toPaise(manualParking);
  } else if (serviceType === 'airport') {
    parkingPaise = toPaise(pricingConfig?.airportTransfer?.parkingFee ?? 100);
  } else if (parkingRules.mode === 'fixed') {
    parkingPaise = toPaise(parkingRules.fixedAmount ?? 50);
  } else if (parkingRules.mode === 'estimated') {
    parkingPaise = toPaise(parkingRules.defaultEstimate ?? 50);
  }

  // 6. Permit / Interstate Charges (if applicable)
  const permitChargesPaise = toPaise(pricingConfig?.interstatePermitCharge || 0);

  // 7. Night Charges
  let nightChargePaise = 0;
  const inNightWindow = isNightTime(bookingTime, nightRules.start, nightRules.end);
  if (nightRules.enabled && inNightWindow) {
    if (nightRules.type === 'percentage') {
      const pct = (nightRules.percentage || 15) / 100;
      nightChargePaise = Math.round((baseFarePaise + distanceFarePaise) * pct);
    } else if (nightRules.type === 'per_km') {
      nightChargePaise = toPaise(distance * (nightRules.ratePerKm || 3));
    } else {
      // Default: Fixed Amount e.g. ₹150
      nightChargePaise = toPaise(nightRules.fixedCharge || 150);
    }
  }

  // 8. Zone Specific Adjustments
  let zoneAdjustmentPaise = 0;
  if (zoneId && pricingConfig?.zones?.[zoneId]) {
    const zone = pricingConfig.zones[zoneId];
    if (zone.surcharge) {
      zoneAdjustmentPaise = toPaise(zone.surcharge);
    }
  }

  // 9. Subtotal before Surge
  const subtotalBeforeSurgePaise = baseFarePaise + distanceFarePaise + timeFarePaise +
    driverAllowancePaise + waitingChargePaise + stopsChargePaise +
    tollPaise + parkingPaise + permitChargesPaise + nightChargePaise + zoneAdjustmentPaise;

  // 10. Surge Pricing Calculation
  let surgeMultiplier = 1.0;
  let surgeModeActive = 'normal';

  if (surgeMode) {
    if (typeof surgeMode === 'number') {
      surgeMultiplier = surgeMode;
      surgeModeActive = 'custom';
    } else if (pricingConfig?.surgeRules?.modes?.[surgeMode]) {
      surgeMultiplier = pricingConfig.surgeRules.modes[surgeMode].multiplier || 1.0;
      surgeModeActive = surgeMode;
    }
  } else if (surgeRules.activeMode && surgeRules.modes?.[surgeRules.activeMode]) {
    surgeMultiplier = surgeRules.modes[surgeRules.activeMode].multiplier || 1.0;
    surgeModeActive = surgeRules.activeMode;
  } else if (surgeRules.currentMultiplier) {
    surgeMultiplier = surgeRules.currentMultiplier;
  }

  // Surge applies on Base + Distance fare
  const surgeApplicablePaise = baseFarePaise + distanceFarePaise;
  let surgeChargePaise = 0;
  if (surgeMultiplier > 1.0) {
    surgeChargePaise = Math.round(surgeApplicablePaise * (surgeMultiplier - 1.0));
  }

  // 11. Gross Fare
  const grossFarePaise = subtotalBeforeSurgePaise + surgeChargePaise;

  // 12. Coupon & Promotional Discounts
  let couponDiscountPaise = 0;
  let appliedCouponCode = null;

  if (coupon && coupon.code) {
    const grossRupees = toRupees(grossFarePaise);
    const minFare = coupon.minFare || 0;
    const isEligible = grossRupees >= minFare;

    if (isEligible) {
      appliedCouponCode = coupon.code;
      if (coupon.discountType === 'percentage') {
        const discPaise = Math.round(grossFarePaise * ((coupon.discountValue || 10) / 100));
        const maxDiscPaise = coupon.maxDiscount ? toPaise(coupon.maxDiscount) : Infinity;
        couponDiscountPaise = Math.min(discPaise, maxDiscPaise);
      } else {
        couponDiscountPaise = toPaise(coupon.discountValue || 0);
      }
      couponDiscountPaise = Math.min(couponDiscountPaise, grossFarePaise);
    }
  }

  // 13. Tax Calculation
  const taxableFarePaise = Math.max(0, grossFarePaise - couponDiscountPaise);
  let taxPaise = 0;
  if (taxRules.enabled && taxRules.percentage > 0) {
    taxPaise = Math.round(taxableFarePaise * (taxRules.percentage / 100));
  }

  // 14. Final Customer Fare
  const totalFarePaise = taxableFarePaise + taxPaise;

  // 15. Driver Earnings & Company Commission Split
  // Company commission is calculated on ride fare excluding tolls/parking/permits
  const commissionablePaise = Math.max(0, (baseFarePaise + distanceFarePaise + timeFarePaise + surgeChargePaise) - couponDiscountPaise);
  const companyCommissionPaise = Math.round(commissionablePaise * ((commissionRules.companyRatePercent || 20) / 100));
  const driverEarningsPaise = totalFarePaise - companyCommissionPaise - taxPaise;

  // Return standard, verified, fully transparent breakdown
  return {
    isValid: true,
    pricingVersion: pricingConfig?.versionId || 'PV-2026-09-07-01',
    serviceType,
    vehicleCategoryId,
    passengerCount,
    distanceKm: distance,
    durationMinutes: duration,

    // Itemized Rupee values for UI & APIs
    baseFare: toRupees(baseFarePaise),
    distanceFare: toRupees(distanceFarePaise),
    timeFare: toRupees(timeFarePaise),
    driverAllowance: toRupees(driverAllowancePaise),
    waitingCharge: toRupees(waitingChargePaise),
    additionalStopCharge: toRupees(stopsChargePaise),
    toll: toRupees(tollPaise),
    parking: toRupees(parkingPaise),
    permitCharges: toRupees(permitChargesPaise),
    nightCharge: toRupees(nightChargePaise),
    surgeCharge: toRupees(surgeChargePaise),
    surgeMultiplier,
    surgeMode: surgeModeActive,
    zoneAdjustment: toRupees(zoneAdjustmentPaise),

    subtotal: toRupees(grossFarePaise),
    discount: toRupees(couponDiscountPaise),
    couponCode: appliedCouponCode,
    taxableFare: toRupees(taxableFarePaise),
    tax: toRupees(taxPaise),
    taxPercentage: taxRules.percentage || 0,
    totalFare: toRupees(totalFarePaise),

    // Driver & Commission Split
    driverEarnings: toRupees(driverEarningsPaise),
    companyCommission: toRupees(companyCommissionPaise),

    // Quote Validity
    quoteExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5-minute fare lock
  };
};
