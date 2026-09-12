import React, { useState, useContext, useEffect } from 'react';
import {
  Calculator, Car, MapPin, Clock, Users, ArrowRight,
  ShieldCheck, AlertCircle, CheckCircle2, Sliders, DollarSign,
  Info, RefreshCw, Tag
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function PCPricingPreview() {
  const { pricingConfig, services, coupons, calculateLiveFare, formatRupee } = useContext(PassengerCarContext);

  // Input states initialized to Section 39 & 40 example
  const [serviceType, setServiceType] = useState('one_way');
  const [vehicleCategoryId, setVehicleCategoryId] = useState('sedan');
  const [distance, setDistance] = useState(25);
  const [duration, setDuration] = useState(60);
  const [bookingTime, setBookingTime] = useState('20:30'); // 8:30 PM
  const [passengerCount, setPassengerCount] = useState(3);
  const [waitingMinutes, setWaitingMinutes] = useState(0);
  const [additionalStops, setAdditionalStops] = useState(0);
  const [rentalPackageId, setRentalPackageId] = useState('pkg-8-80');
  const [selectedCouponCode, setSelectedCouponCode] = useState('');
  const [surgeOverride, setSurgeOverride] = useState('');

  // Result state
  const [fareBreakdown, setFareBreakdown] = useState(null);

  const runCalculation = () => {
    const selectedCoupon = coupons.find(c => c.code === selectedCouponCode) || null;
    const result = calculateLiveFare({
      serviceType,
      vehicleCategoryId,
      distance: Number(distance),
      duration: Number(duration),
      bookingTime,
      passengerCount: Number(passengerCount),
      waitingMinutes: Number(waitingMinutes),
      additionalStops: Number(additionalStops),
      rentalPackageId,
      coupon: selectedCoupon,
      surgeMode: surgeOverride ? Number(surgeOverride) : null
    });
    setFareBreakdown(result);
  };

  // Run calculation initially and whenever inputs change
  useEffect(() => {
    runCalculation();
  }, [
    serviceType,
    vehicleCategoryId,
    distance,
    duration,
    bookingTime,
    passengerCount,
    waitingMinutes,
    additionalStops,
    rentalPackageId,
    selectedCouponCode,
    surgeOverride,
    pricingConfig
  ]);

  const activeVehicle = pricingConfig.vehicles[vehicleCategoryId] || {};

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{
        padding: '20px 24px',
        borderRadius: '12px',
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#1E40AF' }}>
              Dynamic Pricing Sandbox & Preview Tool (Section 39)
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: '#1E3A8A', margin: '4px 0 0' }}>
            Verify exact mathematical fare breakdowns before publishing or responding to customer pricing audits.
          </p>
        </div>

        <button
          onClick={runCalculation}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} />
          Recalculate Preview
        </button>
      </div>

      {/* Main Sandbox Grid: Inputs Left, Receipt Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.1fr', gap: '24px' }}>
        {/* Left Side: Test Parameters Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '18px' }}>
            Trip Simulation Parameters
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Service & Vehicle Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Service Type
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                >
                  <option value="one_way">One-Way Ride</option>
                  <option value="round_trip">Round Trip</option>
                  <option value="rental">Local Rental Package</option>
                  <option value="airport">Airport Transfer</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Vehicle Category
                </label>
                <select
                  value={vehicleCategoryId}
                  onChange={(e) => setVehicleCategoryId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                >
                  {Object.values(pricingConfig.vehicles || {}).map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Max {v.maxPassengers} Pax)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* If Rental Package selected */}
            {serviceType === 'rental' && (
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Select Rental Package
                </label>
                <select
                  value={rentalPackageId}
                  onChange={(e) => setRentalPackageId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                >
                  {pricingConfig.rentalPackages?.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — Base ₹{pkg.baseFare}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Distance & Duration Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Total Distance (KM)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                />
              </div>
            </div>

            {/* Time & Passenger Count Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Trip Time (24h)
                </label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Passenger Count (Capacity: {activeVehicle.maxPassengers || 4})
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: Number(passengerCount) > (activeVehicle.maxPassengers || 4) ? '2px solid #EF4444' : '1px solid var(--border-color)',
                    fontWeight: '700'
                  }}
                />
              </div>
            </div>

            {/* Waiting Time & Additional Stops Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Driver Waiting Time (Mins)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={waitingMinutes}
                  onChange={(e) => setWaitingMinutes(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Free allowance: {pricingConfig.waitingRules.freeMinutes} mins
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Additional Stops Count
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={additionalStops}
                  onChange={(e) => setAdditionalStops(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  1st stop free, then ₹{pricingConfig.stopRules.ratePerStop}/stop
                </div>
              </div>
            </div>

            {/* Promo Coupon & Surge Override Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Apply Coupon Code
                </label>
                <select
                  value={selectedCouponCode}
                  onChange={(e) => setSelectedCouponCode(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                >
                  <option value="">-- No Coupon Applied --</option>
                  {coupons.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Surge Override (Optional)
                </label>
                <select
                  value={surgeOverride}
                  onChange={(e) => setSurgeOverride(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                >
                  <option value="">Default ({pricingConfig?.surgeRules?.currentMultiplier ?? pricingConfig?.surgeRules?.multipliers?.[pricingConfig?.surgeRules?.activeMode] ?? 1.0}x)</option>
                  <option value="1.0">1.0x (Normal)</option>
                  <option value="1.15">1.15x (Night)</option>
                  <option value="1.2">1.2x (Peak Hour)</option>
                  <option value="1.25">1.25x (Rain Surge)</option>
                  <option value="1.3">1.3x (Festival Peak)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Fare Receipt & Explanatory Breakdown */}
        <div>
          {fareBreakdown && !fareBreakdown.isValid ? (
            /* Error Card: Passenger Capacity Guard (Section 4) */
            <div className="card" style={{ padding: '28px', borderLeft: '5px solid #EF4444', backgroundColor: '#FEF2F2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#B91C1C', marginBottom: '12px' }}>
                <AlertCircle size={28} />
                <h4 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>Capacity Restriction</h4>
              </div>
              <p style={{ fontSize: '14px', color: '#991B1B', lineHeight: '1.6', fontWeight: '500' }}>
                {fareBreakdown.error}
              </p>
              <div style={{ marginTop: '16px', fontSize: '12.5px', color: '#7F1D1D' }}>
                💡 Recommendation: Select <strong>SUV</strong> (max 6 pax) or <strong>Premium SUV</strong> (max 7 pax) for larger groups.
              </div>
            </div>
          ) : fareBreakdown ? (
            /* Complete Itemized Fare Receipt (Section 5, 6, 19) */
            <div className="card" style={{ padding: '24px', border: '1px solid #1E5DFF', boxShadow: '0 8px 24px rgba(30,93,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)' }}>
                    Itemized Fare Calculation
                  </span>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '2px 0 0' }}>
                    {activeVehicle.name} — {serviceType.replace('_', ' ').toUpperCase()}
                  </h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pricing Version</div>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '700' }}>{fareBreakdown.pricingVersion}</div>
                </div>
              </div>

              {/* Step by Step Breakdown Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Base Fare (First {activeVehicle.minKm} KM):</span>
                  <span style={{ fontWeight: '600' }}>{formatRupee(fareBreakdown.baseFare)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Distance Fare ({Math.max(0, distance - (activeVehicle.minKm || 10))} KM × ₹{activeVehicle.perKm}):
                  </span>
                  <span style={{ fontWeight: '600' }}>{formatRupee(fareBreakdown.distanceFare)}</span>
                </div>

                {fareBreakdown.timeFare > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Time Fare ({duration} mins):</span>
                    <span style={{ fontWeight: '600' }}>{formatRupee(fareBreakdown.timeFare)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Driver Daily Allowance:</span>
                  <span style={{ fontWeight: '600' }}>{formatRupee(fareBreakdown.driverAllowance)}</span>
                </div>

                {fareBreakdown.waitingCharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Waiting Charges ({waitingMinutes} mins):</span>
                    <span style={{ fontWeight: '600' }}>{formatRupee(fareBreakdown.waitingCharge)}</span>
                  </div>
                )}

                {fareBreakdown.additionalStopCharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Additional Stops ({additionalStops}):</span>
                    <span style={{ fontWeight: '600' }}>{formatRupee(fareBreakdown.additionalStopCharge)}</span>
                  </div>
                )}

                {fareBreakdown.toll > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Toll Booth Charges:</span>
                    <span style={{ fontWeight: '600' }}>{formatRupee(fareBreakdown.toll)}</span>
                  </div>
                )}

                {fareBreakdown.parking > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Parking Fee:</span>
                    <span style={{ fontWeight: '600' }}>{formatRupee(fareBreakdown.parking)}</span>
                  </div>
                )}

                {fareBreakdown.nightCharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Night Travel Surcharge ({bookingTime}):</span>
                    <span style={{ fontWeight: '600', color: '#8B5CF6' }}>{formatRupee(fareBreakdown.nightCharge)}</span>
                  </div>
                )}

                {fareBreakdown.surgeCharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#D97706' }}>Surge Surcharge ({fareBreakdown.surgeMultiplier}x):</span>
                    <span style={{ fontWeight: '700', color: '#D97706' }}>+{formatRupee(fareBreakdown.surgeCharge)}</span>
                  </div>
                )}

                {/* Subtotal */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  marginTop: '4px',
                  borderTop: '1px dashed var(--border-color)',
                  fontWeight: '700'
                }}>
                  <span>Subtotal:</span>
                  <span>{formatRupee(fareBreakdown.subtotal)}</span>
                </div>

                {/* Coupon Discount */}
                {fareBreakdown.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '700' }}>
                    <span>Coupon Discount ({fareBreakdown.couponCode}):</span>
                    <span>-{formatRupee(fareBreakdown.discount)}</span>
                  </div>
                )}

                {/* Taxes */}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Taxes (GST {fareBreakdown.taxPercentage}%):</span>
                  <span>{formatRupee(fareBreakdown.tax)}</span>
                </div>

                {/* Final Customer Total */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  marginTop: '6px',
                  borderTop: '2px solid var(--text-main)',
                  fontSize: '18px',
                  fontWeight: '900',
                  color: 'var(--primary)'
                }}>
                  <span>Total Customer Fare:</span>
                  <span>{formatRupee(fareBreakdown.totalFare)}</span>
                </div>
              </div>

              {/* Commission & Driver Split Banner (Section 28) */}
              <div style={{
                marginTop: '20px',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Driver Partner Net Earning
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#10B981', marginTop: '2px' }}>
                    {formatRupee(fareBreakdown.driverEarnings)}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>80% Ride Share</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Company Platform Take
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#8B5CF6', marginTop: '2px' }}>
                    {formatRupee(fareBreakdown.companyCommission)}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>20% Platform Margin</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
