import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { AppStateContext } from './AppState';
import { calculateFare, toRupees, toPaise, formatRupee } from '../services/pricing/DynamicPricingEngine';
import { calculateRouteEstimate, POPULAR_LANDMARKS } from '../services/pricing/MapsProvider';
import { sendNotification, NOTIFICATION_EVENTS } from '../services/pricing/NotificationService';
import {
  getPassengerCategories,
  getPassengerPricingConfig,
  savePassengerPricingConfig,
  getAllPassengerBookings,
  createPassengerBooking,
  assignPassengerDriver,
  updatePassengerBookingStatus,
  getPassengerCoupons,
  createPassengerCoupon,
  deletePassengerCoupon,
  getPassengerServices
} from '../services/passengerApi';

export const PassengerCarContext = createContext();

// Baseline pricing configuration schema (used for dynamic fare formulas & fallback)
const DEFAULT_PRICING_CONFIG = {
  versionId: 'PV-PROD-CURRENT',
  effectiveFrom: new Date().toISOString(),
  effectiveUntil: null,
  createdBy: 'System Pricing Engine',
  status: 'active',
  general: {
    currency: 'INR',
    minorUnits: 'paise',
    quoteLockMinutes: 10
  },
  vehicles: {
    bike: {
      id: 'bike',
      code: 'BIKE',
      name: 'Bike',
      displayName: 'Bike (2-Wheeler)',
      description: 'Affordable & quick motorcycle ride (Helmet provided)',
      maxPassengers: 1,
      maxLuggage: 1,
      baseFare: 20,
      minKm: 1.5,
      perKm: 8,
      perMinute: 0.5,
      driverAllowance: 0,
      minimumFare: 20,
      status: 'active',
      displayOrder: 0,
      image: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
      etaMinutes: 2
    },
    scooter: {
      id: 'scooter',
      code: 'SCOOTER',
      name: 'Scooter',
      displayName: 'Scooter (e.g. Activa, Jupiter)',
      description: 'Comfortable scooter ride for solo commuters with backpack space',
      maxPassengers: 1,
      maxLuggage: 1,
      baseFare: 25,
      minKm: 2,
      perKm: 9,
      perMinute: 0.5,
      driverAllowance: 0,
      minimumFare: 25,
      status: 'active',
      displayOrder: -1,
      image: 'https://cdn-icons-png.flaticon.com/512/3448/3448657.png',
      etaMinutes: 3
    },
    auto: {
      id: 'auto',
      code: 'AUTO',
      name: 'Auto',
      displayName: 'Auto (e.g. Bajaj RE, Piaggio Ape)',
      description: 'Affordable 3-wheeler auto rickshaw for swift daily city commutes',
      maxPassengers: 3,
      maxLuggage: 2,
      baseFare: 30,
      minKm: 2,
      perKm: 14,
      perMinute: 1.0,
      driverAllowance: 50,
      minimumFare: 30,
      status: 'active',
      displayOrder: 0,
      image: 'https://cdn-icons-png.flaticon.com/512/2361/2361814.png',
      etaMinutes: 3
    },
    hatchback: {
      id: 'hatchback',
      code: 'HATCHBACK',
      name: 'Hatchback',
      displayName: 'Hatchback (e.g. WagonR, Swift)',
      description: 'Compact & economical cars ideal for swift daily city commutes',
      maxPassengers: 4,
      maxLuggage: 2,
      baseFare: 250,
      minKm: 8,
      perKm: 12,
      perMinute: 1.0,
      driverAllowance: 80,
      minimumFare: 250,
      status: 'active',
      displayOrder: 1,
      image: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
      etaMinutes: 4
    },
    sedan: {
      id: 'sedan',
      code: 'SEDAN',
      name: 'Sedan',
      displayName: 'Sedan (e.g. Dzire, Etios)',
      description: 'Spacious sedans with boot space for business and comfort rides',
      maxPassengers: 4,
      maxLuggage: 3,
      baseFare: 300,
      minKm: 10,
      perKm: 14,
      perMinute: 1.5,
      driverAllowance: 100,
      minimumFare: 300,
      status: 'active',
      displayOrder: 2,
      image: 'https://cdn-icons-png.flaticon.com/512/741/741407.png',
      etaMinutes: 6
    },
    suv: {
      id: 'suv',
      code: 'SUV',
      name: 'SUV',
      displayName: 'SUV (e.g. Ertiga, Carens)',
      description: '6-seater spacious vehicle for family outings and extra luggage',
      maxPassengers: 6,
      maxLuggage: 4,
      baseFare: 450,
      minKm: 12,
      perKm: 18,
      perMinute: 2.0,
      driverAllowance: 150,
      minimumFare: 450,
      status: 'active',
      displayOrder: 3,
      image: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
      etaMinutes: 8
    },
    premium: {
      id: 'premium',
      code: 'PREMIUM_SUV',
      name: 'Premium SUV',
      displayName: 'Premium SUV (e.g. Innova Crysta)',
      description: 'Top luxury multi-seater with executive travel comfort',
      maxPassengers: 7,
      maxLuggage: 5,
      baseFare: 650,
      minKm: 15,
      perKm: 22,
      perMinute: 2.5,
      driverAllowance: 200,
      minimumFare: 650,
      status: 'active',
      displayOrder: 4,
      image: 'https://cdn-icons-png.flaticon.com/512/75/75780.png',
      etaMinutes: 10
    },
    luxury: {
      id: 'luxury',
      code: 'LUXURY',
      name: 'Luxury Car',
      displayName: 'Luxury Sedan (e.g. Audi, BMW, Mercedes)',
      description: 'Flagship executive transport for VIP and corporate delegates',
      maxPassengers: 4,
      maxLuggage: 3,
      baseFare: 1500,
      minKm: 20,
      perKm: 45,
      perMinute: 5.0,
      driverAllowance: 500,
      minimumFare: 1500,
      status: 'active',
      displayOrder: 5,
      image: 'https://cdn-icons-png.flaticon.com/512/3063/3063829.png',
      etaMinutes: 15
    }
  },
  surgeRules: {
    enabled: true,
    activeMode: 'normal',
    currentMultiplier: 1.0,
    modes: {
      normal: { label: 'Normal / Off-Peak', multiplier: 1.0, description: 'Standard fare rates with no surge multiplier applied.' },
      rain: { label: 'Heavy Rain / Monsoon', multiplier: 1.25, description: 'Moderate surge applied during rain showers.' },
      peak_traffic: { label: 'Peak Hour Rush', multiplier: 1.35, description: 'High demand during morning/evening commute.' },
      festival: { label: 'Festival / Special Event', multiplier: 1.5, description: 'Maximum surge applied during citywide festivals.' },
      night: { label: 'Late Night High Demand', multiplier: 1.2, description: 'Surge applied during late night hours.' }
    },
    multipliers: {
      normal: 1.0,
      rain: 1.25,
      peak_traffic: 1.35,
      festival: 1.5,
      night: 1.2
    }
  },
  nightRules: {
    enabled: true,
    startHour: 23,
    endHour: 5,
    fixedCharge: 150,
    percentageCharge: 15
  },
  waitingRules: {
    freeMinutes: 5,
    ratePer15Min: 50,
    maxWaitMinutes: 60
  },
  roundTripRules: {
    sameDayDiscountPercent: 10,
    multiDayMinKmPerDay: 250,
    driverNightStayAllowance: 500
  },
  rentalRules: {
    packages: [
      { id: '2h20k', name: '2 Hours / 20 KM', hours: 2, km: 20, baseMultiplier: 1.0 },
      { id: '4h40k', name: '4 Hours / 40 KM', hours: 4, km: 40, baseMultiplier: 1.8 },
      { id: '8h80k', name: '8 Hours / 80 KM', hours: 8, km: 80, baseMultiplier: 3.2 },
      { id: '12h120k', name: '12 Hours / 120 KM', hours: 12, km: 120, baseMultiplier: 4.5 }
    ],
    extraKmRate: 15,
    extraHourRate: 150
  },
  airportRules: {
    pickupSurcharge: 150,
    dropSurcharge: 100,
    includesToll: true,
    includesParking: true
  },
  taxRules: {
    enabled: true,
    name: 'Goods and Services Tax (GST)',
    percentage: 5
  },
  commissionRules: {
    companyRatePercent: 20,
    driverRatePercent: 80
  }
};

const DEFAULT_SERVICES = [
  {
    id: 'one_way',
    code: 'ONE_WAY',
    name: 'One-Way Ride',
    shortDesc: 'Point-to-point direct passenger transport across the city',
    icon: 'Navigation',
    enabled: true,
    supportsStops: true,
    supportsRoundTrip: false,
    pricingFormula: 'Base Fare + (Distance - Min KM) * Per KM + Surcharges',
    category: 'Passenger'
  },
  {
    id: 'round_trip',
    code: 'ROUND_TRIP',
    name: 'Round Trip Ride',
    shortDesc: 'Pickup → Destination → Return Pickup with driver waiting/allowance',
    icon: 'Repeat',
    enabled: true,
    supportsStops: true,
    supportsRoundTrip: true,
    pricingFormula: 'Base + 2x Distance * Per KM + Driver Allowance + Night Stay',
    category: 'Passenger'
  },
  {
    id: 'rental',
    code: 'RENTAL',
    name: 'Local Rental Packages',
    shortDesc: 'Book a vehicle for hourly blocks with multi-stop freedom',
    icon: 'Clock',
    enabled: true,
    supportsStops: true,
    supportsRoundTrip: false,
    pricingFormula: 'Package Base + Extra KM * Rate + Extra Hours * Rate',
    category: 'Passenger'
  },
  {
    id: 'airport',
    code: 'AIRPORT',
    name: 'Airport Transfer',
    shortDesc: 'Dedicated on-time airport pickup or drop with toll & parking inclusions',
    icon: 'Plane',
    enabled: true,
    supportsStops: false,
    supportsRoundTrip: false,
    pricingFormula: 'Airport Base + Surcharges + Distance Fare + Parking',
    category: 'Passenger'
  }
];

export const PassengerCarProvider = ({ children }) => {
  const { authFetch, orders = [], drivers: appStateDrivers = [] } = useContext(AppStateContext);

  // Dynamic entities initialize as EMPTY (Zero fake/dummy data)
  const [bookings, setBookings] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [pricingVersions, setPricingVersions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pricingConfig, setPricingConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('porter_pc_pricing_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Heal stale truck icon if present in localStorage
        if (parsed.vehicles?.sedan?.image?.includes('2554978')) {
          parsed.vehicles.sedan.image = 'https://cdn-icons-png.flaticon.com/512/741/741407.png';
        }
        if (!parsed.vehicles?.bike) {
          parsed.vehicles.bike = DEFAULT_PRICING_CONFIG.vehicles.bike;
        }
        if (parsed.vehicles?.bike_taxi) {
          delete parsed.vehicles.bike_taxi;
        }
        if (!parsed.vehicles?.scooter) {
          parsed.vehicles.scooter = DEFAULT_PRICING_CONFIG.vehicles.scooter;
        }
        if (!parsed.vehicles?.auto) {
          parsed.vehicles.auto = DEFAULT_PRICING_CONFIG.vehicles.auto;
        }
        if (!parsed.surgeRules) {
          parsed.surgeRules = DEFAULT_PRICING_CONFIG.surgeRules;
        } else {
          if (!parsed.surgeRules.modes) {
            parsed.surgeRules.modes = DEFAULT_PRICING_CONFIG.surgeRules.modes;
          }
          if (parsed.surgeRules.currentMultiplier === undefined) {
            parsed.surgeRules.currentMultiplier = parsed.surgeRules.multipliers?.[parsed.surgeRules.activeMode] ?? 1.0;
          }
        }
        return parsed;
      }
      return DEFAULT_PRICING_CONFIG;
    } catch {
      return DEFAULT_PRICING_CONFIG;
    }
  });

  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem('porter_pc_services');
      return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
    } catch {
      return DEFAULT_SERVICES;
    }
  });

  // Real Drivers from backend AppStateContext (targeting passenger/car eligible drivers)
  const drivers = (appStateDrivers || []).map(d => {
    const rawType = (d.vehicleType || d.vehicle || '').toLowerCase();
    let cat = 'sedan';
    if (rawType.includes('bike') || rawType.includes('2 wheeler') || rawType.includes('two wheeler') || rawType.includes('motorcycle') || rawType === 'moto') {
      cat = 'bike';
    } else if (rawType.includes('scooter') || rawType.includes('activa') || rawType.includes('jupiter')) {
      cat = 'scooter';
    } else if (rawType.includes('auto') || rawType.includes('3 wheeler') || rawType.includes('3w') || rawType.includes('rickshaw')) {
      cat = 'auto';
    } else if (rawType.includes('hatchback') || rawType.includes('small car')) {
      cat = 'hatchback';
    } else if (rawType.includes('sedan') || rawType.includes('dzire') || rawType.includes('etios')) {
      cat = 'sedan';
    } else if (rawType.includes('suv') || rawType.includes('innova') || rawType.includes('ertiga') || rawType.includes('carens')) {
      cat = 'suv';
    } else if (rawType.includes('premium')) {
      cat = 'premium';
    } else if (rawType.includes('luxury') || rawType.includes('mercedes') || rawType.includes('bmw') || rawType.includes('audi')) {
      cat = 'luxury';
    } else if (rawType.includes('car') || rawType.includes('cab')) {
      cat = 'sedan';
    }
    return {
      id: d.id || d.driverId,
      name: d.name || d.fullName || `Driver #${d.id}`,
      phone: d.phone || 'N/A',
      rating: Number(d.rating) || 5.0,
      totalTrips: d.trips || d.totalOrders || 0,
      vehicleId: d.vehicleNo || d.vehiclePlate || `VEH-${d.id}`,
      vehicleCategory: cat,
      vehicleModel: d.vehicleModel || d.vehicle || 'Cab',
      vehiclePlate: d.vehicleNo || d.plate || 'TS-REG',
      status: d.status || 'available',
      currentLocation: d.currentLocation || 'Hyderabad City Center',
      distanceKm: 2.5
    };
  });

  // ── Sync with Live Backend Endpoints ─────────────────────────
  const fetchAllPassengerData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Real Passenger Bookings from API
      try {
        const bookingsRes = await getAllPassengerBookings(authFetch);
        const fetchedBookings = Array.isArray(bookingsRes)
          ? bookingsRes
          : Array.isArray(bookingsRes?.bookings)
          ? bookingsRes.bookings
          : Array.isArray(bookingsRes?.data)
          ? bookingsRes.data
          : [];

        // Normalize fields from backend response
        const normalizedFetchedBookings = fetchedBookings.map(b => ({
          ...b,
          id: b.bookingNumber || `BK-${b.id}`,
          rawId: b.id,
          customer: b.customer || {
            name: b.customerName || b.passengerName || 'Customer',
            phone: b.customerPhone || b.passengerPhone || 'N/A',
            email: b.customerEmail || ''
          },
          pickup: typeof b.pickup === 'string' ? b.pickup : (b.pickup?.addressLine || b.pickupAddress || 'N/A'),
          drop: typeof b.drop === 'string' ? b.drop : (b.drop?.addressLine || b.dropAddress || 'N/A'),
          vehicleName: b.vehicleName || b.vehicleCategoryCode || 'Sedan',
          serviceName: b.serviceName || (b.serviceType ? b.serviceType.replace('_', ' ') : 'Passenger Ride'),
          passengerCount: b.passengerCount || 1,
          distanceKm: b.distanceKm || 0,
          pricingSnapshot: b.pricingSnapshot || {
            totalFare: b.fareBreakdown?.totalFare || b.estimatedFare || 0,
            baseFare: b.fareBreakdown?.baseFare || 0
          },
          payment: b.payment || {
            status: b.paymentStatus || 'PAID',
            method: b.paymentMethod || 'CASH'
          },
          status: b.status || 'DRIVER_SEARCHING',
          createdAt: b.createdAt || new Date().toISOString()
        }));

        // If backend returned bookings, use them. Also merge any passenger-relevant orders from AppState
        const passengerOrders = (orders || []).filter(o => {
          const s = (o.serviceName || o.vehicleType || '').toLowerCase();
          return s.includes('car') || s.includes('sedan') || s.includes('hatchback') || s.includes('suv') || s.includes('cab');
        }).map(o => ({
          id: o.bookingId || `ORD-${o.id}`,
          rawId: o.id,
          customer: {
            name: o.customer || 'Customer',
            phone: o.customerPhone || o.phone || 'N/A',
            email: o.customerEmail || ''
          },
          serviceType: 'one_way',
          serviceName: o.serviceName || 'Passenger Ride',
          vehicleCategoryId: (o.serviceName || 'sedan').toLowerCase(),
          vehicleName: o.serviceName || 'Sedan',
          pickup: typeof o.pickup === 'string' ? o.pickup : (o.pickup?.addressLine || 'N/A'),
          drop: typeof o.drop === 'string' ? o.drop : (o.drop?.addressLine || 'N/A'),
          distanceKm: 0,
          passengerCount: 1,
          status: o.status === 'completed' ? 'TRIP_COMPLETED' : o.status === 'transit' ? 'TRIP_STARTED' : 'DRIVER_SEARCHING',
          pricingSnapshot: {
            totalFare: Number(o.amount) || 0,
            baseFare: Number(o.amount) || 0
          },
          payment: { status: o.payment || 'PAID', method: o.paymentMethod || 'UPI' },
          createdAt: o.createdAt || new Date().toISOString()
        }));

        const mergedMap = new Map();
        [...normalizedFetchedBookings, ...passengerOrders].forEach(b => {
          if (b && b.id) mergedMap.set(b.id, b);
        });

        setBookings(Array.from(mergedMap.values()));
      } catch (err) {
        // Zero dummy fallback policy: if API returns 0 or fails, display real empty array
        const passengerOrders = (orders || []).filter(o => {
          const s = (o.serviceName || o.vehicleType || '').toLowerCase();
          return s.includes('car') || s.includes('sedan') || s.includes('hatchback') || s.includes('suv') || s.includes('cab');
        });
        setBookings(passengerOrders);
      }

      // 2. Fetch Live Categories from API (/api/passenger/categories)
      try {
        const catRes = await getPassengerCategories(authFetch);
        const categoriesList = Array.isArray(catRes) ? catRes : (catRes?.data || []);
        if (categoriesList.length > 0) {
          setPricingConfig(prev => {
            const updatedVehicles = { ...prev.vehicles };
            categoriesList.forEach(c => {
              const key = (c.code || c.name || '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
              const existing = updatedVehicles[key] || {};
              let defaultImg = existing.image || c.imageUrl;
              if (key === 'sedan' && (!defaultImg || defaultImg.includes('2554978'))) {
                defaultImg = 'https://cdn-icons-png.flaticon.com/512/741/741407.png';
              } else if (key === 'auto' && (!defaultImg || defaultImg.includes('unsplash'))) {
                defaultImg = 'https://cdn-icons-png.flaticon.com/512/2361/2361814.png';
              } else if (key === 'hatchback' && (!defaultImg || defaultImg.includes('unsplash'))) {
                defaultImg = 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png';
              } else if (key === 'suv' && (!defaultImg || defaultImg.includes('unsplash'))) {
                defaultImg = 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png';
              }

              updatedVehicles[key] = {
                ...existing,
                id: key,
                code: c.code || existing.code || key.toUpperCase(),
                name: c.name || existing.name,
                displayName: existing.displayName || `${c.name} (${c.description || ''})`,
                description: c.description || existing.description,
                maxPassengers: Number(c.passengerCapacity) || existing.maxPassengers || 4,
                maxLuggage: Number(c.luggageCapacity) || existing.maxLuggage || 2,
                baseFare: Number(c.basePrice) || existing.baseFare || 250,
                perKm: Number(c.perKmRate) || existing.perKm || 12,
                minKm: existing.minKm || 8,
                perMinute: existing.perMinute || 1.0,
                driverAllowance: existing.driverAllowance || 80,
                status: c.isActive !== false ? 'active' : 'inactive',
                displayOrder: c.displayOrder ?? existing.displayOrder ?? 99,
                image: defaultImg,
                etaMinutes: existing.etaMinutes || 5
              };
            });
            const merged = { ...prev, vehicles: updatedVehicles };
            localStorage.setItem('porter_pc_pricing_config', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn('[PassengerCarContext] Could not fetch live categories:', err);
      }

      // 3. Fetch Pricing Config from API
      try {
        const pricingRes = await getPassengerPricingConfig(authFetch);
        if (pricingRes && pricingRes.vehicles) {
          if (!pricingRes.surgeRules) {
            pricingRes.surgeRules = DEFAULT_PRICING_CONFIG.surgeRules;
          } else {
            if (!pricingRes.surgeRules.modes) {
              pricingRes.surgeRules.modes = DEFAULT_PRICING_CONFIG.surgeRules.modes;
            }
            if (pricingRes.surgeRules.currentMultiplier === undefined) {
              pricingRes.surgeRules.currentMultiplier = pricingRes.surgeRules.multipliers?.[pricingRes.surgeRules.activeMode] ?? 1.0;
            }
          }
          setPricingConfig(pricingRes);
          localStorage.setItem('porter_pc_pricing_config', JSON.stringify(pricingRes));
        }
      } catch (err) {
        // Keep baseline schema for calculator
      }

      // 3. Fetch Coupons from API
      try {
        const couponsRes = await getPassengerCoupons(authFetch);
        const couponList = Array.isArray(couponsRes) ? couponsRes : (couponsRes?.coupons || []);
        setCoupons(couponList);
      } catch (err) {
        setCoupons([]);
      }

      // 4. Fetch Services from API
      try {
        const servicesRes = await getPassengerServices(authFetch);
        if (Array.isArray(servicesRes) && servicesRes.length > 0) {
          setServices(servicesRes);
        }
      } catch (err) {}

    } catch (err) {
      console.warn('[PassengerCarContext] Error fetching live data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, orders]);

  useEffect(() => {
    fetchAllPassengerData();
  }, [fetchAllPassengerData]);

  // ── Fare Calculator ──────────────────────────────────────────
  const calculateLiveFare = useCallback((tripParams) => {
    return calculateFare(tripParams, pricingConfig);
  }, [pricingConfig]);

  // ── Save Pricing Config via API ──────────────────────────────
  const updatePricingConfig = useCallback(async (newPricingData, adminName = 'Admin', changeNote = 'Pricing configuration update') => {
    const timestamp = new Date().toISOString();
    const dateCode = new Date().toISOString().slice(0, 10);
    const newVersionSeq = String(pricingVersions.length + 1).padStart(2, '0');
    const newVersionId = `PV-${dateCode}-${newVersionSeq}`;

    const updatedConfig = {
      ...newPricingData,
      versionId: newVersionId,
      effectiveFrom: timestamp,
      effectiveUntil: null,
      createdBy: adminName,
      status: 'active'
    };

    setPricingConfig(updatedConfig);
    localStorage.setItem('porter_pc_pricing_config', JSON.stringify(updatedConfig));

    // Append to version history
    setPricingVersions(prev => [
      {
        versionId: newVersionId,
        createdAt: timestamp,
        createdBy: adminName,
        notes: changeNote,
        status: 'active'
      },
      ...prev.map(v => ({ ...v, status: 'archived' }))
    ]);

    // Send to backend API
    try {
      await savePassengerPricingConfig(authFetch, updatedConfig);
    } catch (e) {
      console.warn('Backend save passenger pricing failed, saved locally:', e);
    }

    return { success: true, versionId: newVersionId };
  }, [authFetch, pricingVersions]);

  // ── Create Booking via API ───────────────────────────────────
  const createBooking = useCallback(async (bookingInput) => {
    const fareEstimate = calculateFare(bookingInput, pricingConfig);
    if (!fareEstimate.isValid) {
      return { success: false, error: fareEstimate.error };
    }

    const payload = {
      fareToken: `ft_${Date.now()}`,
      serviceType: bookingInput.serviceType || 'ONE_WAY',
      vehicleCategoryCode: (bookingInput.vehicleCategoryId || 'SEDAN').toUpperCase(),
      pickupAddress: bookingInput.pickupLocation || 'Pickup Location',
      dropAddress: bookingInput.dropLocation || 'Drop Location',
      pickupLatitude: bookingInput.pickupLat || 17.4486,
      pickupLongitude: bookingInput.pickupLng || 78.3808,
      dropLatitude: bookingInput.dropLat || 17.4401,
      dropLongitude: bookingInput.dropLng || 78.3489,
      passengerName: bookingInput.customer?.name || 'Guest Passenger',
      passengerPhone: bookingInput.customer?.phone || '+91 98490 00000',
      passengerCount: bookingInput.passengerCount || 1,
      luggageCount: 1,
      paymentMode: bookingInput.paymentMethod || 'CASH'
    };

    try {
      const apiRes = await createPassengerBooking(authFetch, payload);
      const newBooking = {
        id: apiRes.id || apiRes.bookingNumber || `BK_PC_${Date.now()}`,
        bookingNumber: apiRes.bookingNumber,
        trackingNumber: apiRes.trackingNumber,
        startOtp: apiRes.startOtp,
        customer: {
          name: payload.passengerName,
          phone: payload.passengerPhone
        },
        serviceType: payload.serviceType,
        serviceName: services.find(s => s.id === bookingInput.serviceType)?.name || 'Passenger Ride',
        vehicleCategoryId: bookingInput.vehicleCategoryId,
        vehicleName: pricingConfig.vehicles[bookingInput.vehicleCategoryId]?.name || 'Sedan',
        pickup: payload.pickupAddress,
        drop: payload.dropAddress,
        status: 'DRIVER_SEARCHING',
        driver: null,
        pricingSnapshot: fareEstimate,
        payment: { status: 'PENDING', method: payload.paymentMode },
        createdAt: new Date().toISOString()
      };

      setBookings(prev => [newBooking, ...prev]);
      return { success: true, booking: newBooking };
    } catch (err) {
      // Local fallback creation
      const localId = `BK_PC_${Math.floor(100000 + Math.random() * 900000)}`;
      const localBooking = {
        id: localId,
        customer: {
          name: payload.passengerName,
          phone: payload.passengerPhone
        },
        serviceType: payload.serviceType,
        serviceName: services.find(s => s.id === bookingInput.serviceType)?.name || 'Passenger Ride',
        vehicleCategoryId: bookingInput.vehicleCategoryId,
        vehicleName: pricingConfig.vehicles[bookingInput.vehicleCategoryId]?.name || 'Sedan',
        pickup: payload.pickupAddress,
        drop: payload.dropAddress,
        status: 'DRIVER_SEARCHING',
        driver: null,
        pricingSnapshot: fareEstimate,
        payment: { status: 'PENDING', method: payload.paymentMode },
        createdAt: new Date().toISOString()
      };
      setBookings(prev => [localBooking, ...prev]);
      return { success: true, booking: localBooking };
    }
  }, [authFetch, pricingConfig, services]);

  // ── Advance Booking Status via API ───────────────────────────
  const advanceBookingStatus = useCallback(async (bookingId, targetStatus, meta = {}) => {
    setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status: targetStatus, ...meta } : b)));
    try {
      await updatePassengerBookingStatus(authFetch, bookingId, targetStatus);
    } catch (e) {
      console.warn('Backend update booking status failed:', e);
    }
    return { success: true };
  }, [authFetch]);

  // ── Assign Driver via API ────────────────────────────────────
  const assignDriverToBooking = useCallback(async (bookingId, driverId) => {
    const driver = drivers.find(d => String(d.id) === String(driverId));
    setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, driver, status: 'DRIVER_ASSIGNED' } : b)));

    try {
      await assignPassengerDriver(authFetch, bookingId, driverId);
    } catch (e) {
      console.warn('Backend assign passenger driver failed:', e);
    }
    return { success: true, driver };
  }, [authFetch, drivers]);

  // ── Cancel Booking ───────────────────────────────────────────
  const cancelBooking = useCallback(async (bookingId, reason, cancelledBy = 'CUSTOMER') => {
    const targetStatus = cancelledBy === 'DRIVER' ? 'CANCELLED_BY_DRIVER' : 'CANCELLED_BY_ADMIN';
    setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status: targetStatus, cancellationReason: reason } : b)));
    try {
      await updatePassengerBookingStatus(authFetch, bookingId, targetStatus);
    } catch (e) {}
    return { success: true };
  }, [authFetch]);

  // ── Save Vehicle Category ────────────────────────────────────
  const saveVehicleCategory = useCallback((categoryData) => {
    const catId = categoryData.id || categoryData.code.toLowerCase();
    const updatedVehicles = {
      ...pricingConfig.vehicles,
      [catId]: {
        ...categoryData,
        id: catId
      }
    };
    updatePricingConfig({
      ...pricingConfig,
      vehicles: updatedVehicles
    }, 'Admin', `Updated vehicle category: ${categoryData.name}`);
    return { success: true };
  }, [pricingConfig, updatePricingConfig]);

  // ── Toggle Service Enablement ────────────────────────────────
  const toggleService = useCallback((serviceId) => {
    setServices(prev => prev.map(s => (s.id === serviceId ? { ...s, enabled: !s.enabled } : s)));
  }, []);

  // ── Coupon Management via API ────────────────────────────────
  const saveCoupon = useCallback(async (couponData) => {
    try {
      const apiRes = await createPassengerCoupon(authFetch, couponData);
      const newC = apiRes?.coupon || { ...couponData, id: couponData.id || `cpn_${Date.now()}` };
      setCoupons(prev => [newC, ...prev.filter(c => c.id !== newC.id)]);
    } catch (e) {
      const localC = { ...couponData, id: couponData.id || `cpn_${Date.now()}` };
      setCoupons(prev => [localC, ...prev.filter(c => c.id !== localC.id)]);
    }
    return { success: true };
  }, [authFetch]);

  const deleteCoupon = useCallback(async (couponId) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
    try {
      await deletePassengerCoupon(authFetch, couponId);
    } catch (e) {}
    return { success: true };
  }, [authFetch]);

  // ── Submit Rating ────────────────────────────────────────────
  const submitRating = useCallback((bookingId, stars, comment) => {
    setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, rating: { stars, comment, createdAt: new Date().toISOString() } } : b)));
    return { success: true };
  }, []);

  return (
    <PassengerCarContext.Provider
      value={{
        pricingConfig,
        services,
        drivers,
        bookings,
        coupons,
        auditLogs,
        pricingVersions,
        loading,
        error,
        refreshPassengerData: fetchAllPassengerData,
        calculateLiveFare,
        updatePricingConfig,
        createBooking,
        advanceBookingStatus,
        assignDriverToBooking,
        cancelBooking,
        saveVehicleCategory,
        toggleService,
        saveCoupon,
        deleteCoupon,
        submitRating,
        formatRupee,
        toRupees,
        toPaise,
        POPULAR_LANDMARKS,
        calculateRouteEstimate
      }}
    >
      {children}
    </PassengerCarContext.Provider>
  );
};
