import React, { useState, useContext, useEffect } from 'react';
import {
  Car, MapPin, Calendar, Clock, Users, ArrowRight,
  ShieldCheck, Tag, CreditCard, CheckCircle2, AlertCircle,
  Star, Navigation, RefreshCw, ChevronRight, Phone, MessageSquare
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function PCCustomerSimulator({ onBookingCreated }) {
  const {
    services,
    pricingConfig,
    coupons,
    drivers,
    calculateLiveFare,
    createBooking,
    advanceBookingStatus,
    assignDriverToBooking,
    submitRating,
    formatRupee,
    POPULAR_LANDMARKS,
    calculateRouteEstimate
  } = useContext(PassengerCarContext);

  // Step state: 'form' | 'breakdown' | 'tracking' | 'review'
  const [step, setStep] = useState('form');

  // Customer form inputs
  const [customerName, setCustomerName] = useState('Ananya Sen');
  const [customerPhone, setCustomerPhone] = useState('+91 98450 11223');
  const [serviceType, setServiceType] = useState('one_way');
  const [pickup, setPickup] = useState(POPULAR_LANDMARKS[1].name); // Hitec City
  const [drop, setDrop] = useState(POPULAR_LANDMARKS[0].name); // Airport RGIA
  const [passengerCount, setPassengerCount] = useState(2);
  const [selectedVehicleId, setSelectedVehicleId] = useState('sedan');
  const [bookingTime, setBookingTime] = useState('14:30');
  const [additionalStops, setAdditionalStops] = useState([]);
  const [newStopInput, setNewStopInput] = useState('');
  const [couponCode, setCouponCode] = useState('WELCOME100');
  const [appliedCoupon, setAppliedCoupon] = useState(coupons.find(c => c.code === 'WELCOME100') || null);
  const [couponMsg, setCouponMsg] = useState({ text: 'WELCOME100 applied successfully!', type: 'success' });
  const [paymentMethod, setPaymentMethod] = useState('UPI (Instant)');

  // Active simulated booking
  const [simulatedBooking, setSimulatedBooking] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('Excellent on-time service and very neat car!');

  // Route calculation
  const [routeData, setRouteData] = useState(() => calculateRouteEstimate(pickup, drop, additionalStops));

  useEffect(() => {
    setRouteData(calculateRouteEstimate(pickup, drop, additionalStops));
  }, [pickup, drop, additionalStops]);

  // Handle coupon apply
  const handleApplyCoupon = () => {
    const found = coupons.find(c => c.code.trim().toUpperCase() === couponCode.trim().toUpperCase());
    if (found && found.enabled) {
      setAppliedCoupon(found);
      setCouponMsg({ text: `Coupon ${found.code} applied!`, type: 'success' });
    } else {
      setAppliedCoupon(null);
      setCouponMsg({ text: 'Invalid or expired coupon code.', type: 'error' });
    }
  };

  // Calculate live fare for selected vehicle
  const currentFareEstimate = calculateLiveFare({
    serviceType,
    vehicleCategoryId: selectedVehicleId,
    distance: routeData.distanceKm,
    duration: routeData.durationMinutes,
    passengerCount: Number(passengerCount),
    bookingTime,
    additionalStops: additionalStops.length,
    coupon: appliedCoupon
  });

  // Handle vehicle card selection with Capacity Guard (Section 4)
  const handleVehicleSelect = (vId) => {
    setSelectedVehicleId(vId);
  };

  // Add stop
  const handleAddStop = () => {
    if (newStopInput.trim()) {
      setAdditionalStops(prev => [...prev, newStopInput.trim()]);
      setNewStopInput('');
    }
  };

  // Confirm booking
  const handleConfirmBooking = () => {
    const res = createBooking({
      customer: {
        name: customerName,
        phone: customerPhone,
        email: `${customerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        rating: 4.9
      },
      serviceType,
      vehicleCategoryId: selectedVehicleId,
      passengerCount: Number(passengerCount),
      pickupLocation: pickup,
      dropLocation: drop,
      additionalStops,
      distance: routeData.distanceKm,
      duration: routeData.durationMinutes,
      bookingTime,
      coupon: appliedCoupon,
      paymentMethod
    });

    if (res.success) {
      setSimulatedBooking(res.booking);
      setStep('tracking');
      if (onBookingCreated) onBookingCreated(res.booking);

      // Auto-assign suitable driver after 2.5 seconds for realistic experience
      setTimeout(() => {
        const availableDriver = drivers.find(d => d.vehicleCategory === selectedVehicleId && d.status === 'available') || drivers[0];
        if (availableDriver) {
          assignDriverToBooking(res.booking.id, availableDriver.id);
          setSimulatedBooking(prev => ({
            ...prev,
            status: 'DRIVER_ASSIGNED',
            driver: availableDriver
          }));
        }
      }, 2500);
    }
  };

  // Advance tracking simulation
  const handleSimulateArrival = () => {
    advanceBookingStatus(simulatedBooking.id, 'DRIVER_ARRIVED');
    setSimulatedBooking(prev => ({ ...prev, status: 'DRIVER_ARRIVED' }));
  };

  const handleSimulateStart = () => {
    advanceBookingStatus(simulatedBooking.id, 'TRIP_STARTED');
    setSimulatedBooking(prev => ({ ...prev, status: 'TRIP_STARTED' }));
  };

  const handleSimulateComplete = () => {
    advanceBookingStatus(simulatedBooking.id, 'TRIP_COMPLETED');
    setSimulatedBooking(prev => ({ ...prev, status: 'TRIP_COMPLETED' }));
    setStep('review');
  };

  const handleSubmitReview = () => {
    submitRating(simulatedBooking.id, ratingStars, ratingFeedback);
    alert('Thank you for rating your Anusha Porter ride!');
    setStep('form');
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
            Passenger Booking & Ride Experience Simulator
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Realistic 14-step customer app flow with live route detection, vehicle cards, capacity validation, and interactive trip state machine.
          </p>
        </div>

        {step !== 'form' && (
          <button
            onClick={() => setStep('form')}
            className="btn btn-secondary"
            style={{ fontSize: '12px' }}
          >
            ← Start New Booking
          </button>
        )}
      </div>

      {step === 'form' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.1fr', gap: '24px' }}>
          {/* Left Column: Customer Inputs & Vehicle Picker */}
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
              1. Trip Details & Locations
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Customer Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Passenger Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                  />
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Select Service</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '4px' }}>
                  {services.filter(s => s.enabled).map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceType(s.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: `1.5px solid ${serviceType === s.id ? 'var(--primary)' : 'var(--border-color)'}`,
                        backgroundColor: serviceType === s.id ? '#EFF6FF' : 'var(--bg-main)',
                        color: serviceType === s.id ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pickup & Drop */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pickup Location</label>
                <select
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600', marginTop: '4px' }}
                >
                  {POPULAR_LANDMARKS.map(l => (
                    <option key={l.id} value={l.name}>{l.name} ({l.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Drop Destination</label>
                <select
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600', marginTop: '4px' }}
                >
                  {POPULAR_LANDMARKS.map(l => (
                    <option key={l.id} value={l.name}>{l.name} ({l.city})</option>
                  ))}
                </select>
              </div>

              {/* Multi-stop support */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Additional Stops (Optional)</label>
                  <span style={{ fontSize: '11px', color: 'var(--primary)' }}>First stop free</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="text"
                    placeholder="Enter intermediate stop..."
                    value={newStopInput}
                    onChange={(e) => setNewStopInput(e.target.value)}
                    style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12.5px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    + Add Stop
                  </button>
                </div>

                {additionalStops.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {additionalStops.map((stop, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11.5px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: '#EDE9FE',
                          color: '#6D28D9',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        Stop {idx + 1}: {stop}
                        <button
                          onClick={() => setAdditionalStops(prev => prev.filter((_, i) => i !== idx))}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6D28D9', fontWeight: 'bold' }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Passenger Count & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Passenger Count</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pickup Time</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                  />
                </div>
              </div>

              {/* Vehicle Selection Cards (Section 18) */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', margin: '14px 0 8px' }}>
                  2. Select Vehicle Category
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.values(pricingConfig.vehicles || {}).map(veh => {
                    const isSelected = selectedVehicleId === veh.id;
                    const isOverCapacity = Number(passengerCount) > (veh.maxPassengers || 4);

                    // Dynamic price estimate for this category
                    const categoryEst = calculateLiveFare({
                      serviceType,
                      vehicleCategoryId: veh.id,
                      distance: routeData.distanceKm,
                      duration: routeData.durationMinutes,
                      passengerCount: Number(passengerCount),
                      bookingTime,
                      coupon: appliedCoupon
                    });

                    return (
                      <div
                        key={veh.id}
                        onClick={() => handleVehicleSelect(veh.id)}
                        style={{
                          padding: '14px 16px',
                          borderRadius: '12px',
                          border: `2px solid ${isSelected ? 'var(--primary)' : isOverCapacity ? '#FCA5A5' : 'var(--border-color)'}`,
                          backgroundColor: isSelected ? '#EFF6FF' : isOverCapacity ? '#FEF2F2' : 'var(--bg-main)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img
                            src={veh.image}
                            alt={veh.name}
                            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {veh.name}
                              {isOverCapacity && (
                                <span style={{
                                  fontSize: '10.5px',
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  backgroundColor: '#EF4444',
                                  color: '#FFFFFF'
                                }}>
                                  Capacity Exceeded
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              👤 {veh.maxPassengers} Passengers • 🧳 {veh.maxLuggage} Bags • ETA {veh.etaMinutes || 5} mins
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                            {categoryEst.isValid ? formatRupee(categoryEst.totalFare) : '—'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Starting from
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Fare Breakdown, Capacity Validation & Confirmation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Route Summary Card */}
            <div className="card" style={{ padding: '20px' }}>
              <h5 style={{ fontSize: '14.5px', fontWeight: '700', margin: '0 0 10px' }}>Route & Traffic Estimate</h5>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Distance:</span>
                <span style={{ fontWeight: '700' }}>{routeData.distanceKm} KM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Duration:</span>
                <span style={{ fontWeight: '700' }}>{routeData.durationMinutes} Minutes</span>
              </div>
              {routeData.isAirportTrip && (
                <div style={{ fontSize: '11.5px', color: '#1E40AF', backgroundColor: '#EFF6FF', padding: '6px 10px', borderRadius: '6px', marginTop: '6px' }}>
                  ✈️ Airport Express Highway Toll & Terminal Parking Included
                </div>
              )}
            </div>

            {/* Capacity Guard Warning if Exceeded (Section 4) */}
            {!currentFareEstimate.isValid ? (
              <div className="card" style={{ padding: '22px', borderLeft: '5px solid #EF4444', backgroundColor: '#FEF2F2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#B91C1C', marginBottom: '8px' }}>
                  <AlertCircle size={24} />
                  <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Cannot Proceed with Booking</h4>
                </div>
                <p style={{ fontSize: '13.5px', color: '#991B1B', fontWeight: '600', margin: 0 }}>
                  {currentFareEstimate.error}
                </p>
                <p style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '8px' }}>
                  Please click on <strong>SUV</strong> (6 Passengers) or <strong>Premium SUV</strong> (7 Passengers) above to continue.
                </p>
              </div>
            ) : (
              /* Itemized Fare Receipt (Section 6 & 19) */
              <div className="card" style={{ padding: '24px', border: '1px solid #1E5DFF' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px', color: 'var(--text-main)' }}>
                  Trip Fare Breakdown
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Base Fare</span>
                    <span style={{ fontWeight: '600' }}>{formatRupee(currentFareEstimate.baseFare)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Distance Fare</span>
                    <span style={{ fontWeight: '600' }}>{formatRupee(currentFareEstimate.distanceFare)}</span>
                  </div>

                  {currentFareEstimate.driverAllowance > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Driver Allowance</span>
                      <span style={{ fontWeight: '600' }}>{formatRupee(currentFareEstimate.driverAllowance)}</span>
                    </div>
                  )}

                  {currentFareEstimate.additionalStopCharge > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Additional Stops</span>
                      <span style={{ fontWeight: '600' }}>{formatRupee(currentFareEstimate.additionalStopCharge)}</span>
                    </div>
                  )}

                  {currentFareEstimate.toll > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Toll</span>
                      <span style={{ fontWeight: '600' }}>{formatRupee(currentFareEstimate.toll)}</span>
                    </div>
                  )}

                  {currentFareEstimate.parking > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Parking</span>
                      <span style={{ fontWeight: '600' }}>{formatRupee(currentFareEstimate.parking)}</span>
                    </div>
                  )}

                  {currentFareEstimate.surgeCharge > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                      <span>Surge Demand ({currentFareEstimate.surgeMultiplier}x)</span>
                      <span style={{ fontWeight: '700' }}>+{formatRupee(currentFareEstimate.surgeCharge)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', fontWeight: '700' }}>
                    <span>Subtotal</span>
                    <span>{formatRupee(currentFareEstimate.subtotal)}</span>
                  </div>

                  {currentFareEstimate.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '700' }}>
                      <span>Coupon Discount ({currentFareEstimate.couponCode})</span>
                      <span>-{formatRupee(currentFareEstimate.discount)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Taxes (GST 5%)</span>
                    <span>{formatRupee(currentFareEstimate.tax)}</span>
                  </div>

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
                    <span>Total Amount</span>
                    <span>{formatRupee(currentFareEstimate.totalFare)}</span>
                  </div>
                </div>

                {/* Coupon Input Box */}
                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Have a promo coupon?
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g. WELCOME100"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', textTransform: 'uppercase', fontWeight: '700' }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 14px' }}
                    >
                      Apply
                    </button>
                  </div>
                  {couponMsg && (
                    <div style={{ fontSize: '11px', marginTop: '4px', color: couponMsg.type === 'success' ? '#059669' : '#DC2626', fontWeight: '600' }}>
                      {couponMsg.text}
                    </div>
                  )}
                </div>

                {/* Payment Selection */}
                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                  >
                    <option value="UPI (Instant)">Instant UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Credit / Debit Card">Credit / Debit Card (Razorpay)</option>
                    <option value="Anusha Porter Wallet">Anusha Porter Wallet Balance</option>
                    <option value="Cash to Driver">Cash to Driver upon Completion</option>
                  </select>
                </div>

                {/* Confirm & Book Button */}
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '12px',
                    fontSize: '15px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldCheck size={18} />
                  Confirm & Lock Fare ({formatRupee(currentFareEstimate.totalFare)})
                </button>
                <div style={{ fontSize: '11px', textAlign: 'center', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Fare locked for 5 minutes with snapshot guarantee
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step: Live Ride Tracking Simulation */}
      {step === 'tracking' && simulatedBooking && (
        <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
          <div className="card" style={{ padding: '28px', border: '2px solid var(--primary)' }}>
            {/* Status Radar Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '800',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: '#EFF6FF',
                color: 'var(--primary)',
                letterSpacing: '0.5px'
              }}>
                BOOKING CONFIRMED: {simulatedBooking.id}
              </span>

              <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '12px 0 4px' }}>
                {simulatedBooking.status === 'DRIVER_SEARCHING' && 'Searching for Nearby Drivers...'}
                {simulatedBooking.status === 'DRIVER_ASSIGNED' && 'Driver Assigned & Heading to Pickup'}
                {simulatedBooking.status === 'DRIVER_ARRIVED' && 'Driver Has Arrived at Pickup!'}
                {simulatedBooking.status === 'TRIP_STARTED' && 'Ride in Progress to Destination'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                {simulatedBooking.vehicleName} • {simulatedBooking.serviceName} • {formatRupee(simulatedBooking.pricingSnapshot?.totalFare)}
              </p>
            </div>

            {/* Assigned Driver Card */}
            {simulatedBooking.driver ? (
              <div style={{
                padding: '16px 20px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#1E5DFF',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '18px'
                  }}>
                    {simulatedBooking.driver.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{simulatedBooking.driver.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {simulatedBooking.driver.vehicleModel} • <strong style={{ color: 'var(--text-main)' }}>{simulatedBooking.driver.vehiclePlate}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#F59E0B', fontWeight: '800', fontSize: '14px' }}>
                    ★ {simulatedBooking.driver.rating}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {simulatedBooking.driver.phone}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                textAlign: 'center',
                fontSize: '13px',
                marginBottom: '20px',
                fontWeight: '600'
              }}>
                Connecting with nearest driver partner...
              </div>
            )}

            {/* Route Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', fontSize: '13px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981', marginTop: '3px' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PICKUP</div>
                  <div style={{ fontWeight: '600' }}>{simulatedBooking.pickup}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444', marginTop: '3px' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DESTINATION</div>
                  <div style={{ fontWeight: '600' }}>{simulatedBooking.drop}</div>
                </div>
              </div>
            </div>

            {/* Simulation Controller Action Buttons */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Interactive Trip Lifecycle Controls:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleSimulateArrival}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '8px' }}
                  disabled={simulatedBooking.status === 'DRIVER_SEARCHING' || simulatedBooking.status === 'TRIP_STARTED'}
                >
                  1. Driver Arrived
                </button>

                <button
                  type="button"
                  onClick={handleSimulateStart}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '8px' }}
                  disabled={simulatedBooking.status !== 'DRIVER_ARRIVED'}
                >
                  2. Start Ride
                </button>

                <button
                  type="button"
                  onClick={handleSimulateComplete}
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '8px', fontWeight: '700' }}
                  disabled={simulatedBooking.status !== 'TRIP_STARTED'}
                >
                  3. Complete Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step: Rating & Review Modal (Section 17) */}
      {step === 'review' && simulatedBooking && (
        <div style={{ maxWidth: '520px', margin: '0 auto', width: '100%' }}>
          <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#D1FAE5',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 6px' }}>
              You Have Arrived!
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '0 0 20px' }}>
              Total fare paid: <strong>{formatRupee(simulatedBooking.pricingSnapshot?.totalFare)}</strong> via {simulatedBooking.payment?.method}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                Rate your driver ({simulatedBooking.driver?.name || 'Driver'})
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingStars(star)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: '28px',
                      color: star <= ratingStars ? '#F59E0B' : '#D1D5DB'
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows="3"
              placeholder="Leave feedback on car cleanliness, AC, or driver behavior..."
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', marginBottom: '20px' }}
            />

            <button
              type="button"
              onClick={handleSubmitReview}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontWeight: '700' }}
            >
              Submit Rating & Finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
