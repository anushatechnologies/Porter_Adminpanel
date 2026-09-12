import React, { useState, useEffect, useContext } from 'react';
import {
  Zap, Radio, Volume2, VolumeX, Smartphone, MapPin, Truck,
  Clock, CheckCircle, XCircle, AlertTriangle, ShieldCheck,
  Send, RefreshCw, Layers, Bell, ArrowRight, UserCheck, Play,
  Pause, RotateCcw, Copy, Check, Info, Settings, Code, Compass,
  Sliders, ChevronRight, Phone, Navigation, DollarSign, Wallet
} from 'lucide-react';
import { tieredDispatchEngine, soundSynthesizer, isStrictVehicleMatching } from '../../../services/dispatch/TieredDispatchEngine';
import { AppStateContext } from '../../../context/AppState';

export default function TieredDispatchModule() {
  const { walletSettings, updateWalletSettings } = useContext(AppStateContext);

  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'config' | 'docs'
  const [engineState, setEngineState] = useState(() => ({
    config: tieredDispatchEngine.config,
    activeBookings: Array.from(tieredDispatchEngine.activeBookings.values()),
    drivers: tieredDispatchEngine.drivers
  }));
  const [eventLogs, setEventLogs] = useState(() => [...tieredDispatchEngine.eventLogs]);
  const [isMuted, setIsMuted] = useState(soundSynthesizer.isMuted);
  const [toastMessage, setToastMessage] = useState(null);

  // Customer Form state
  const [serviceName, setServiceName] = useState('2 Wheeler');
  const [pickupAddress, setPickupAddress] = useState('Cyber Towers, Hitech City, Hyderabad');
  const [dropAddress, setDropAddress] = useState('DLF Cyber City, Gachibowli, Hyderabad');
  const [fareAmount, setFareAmount] = useState(99.00);
  const [distanceKm, setDistanceKm] = useState(3.5);
  const [activeBookingId, setActiveBookingId] = useState(null);

  // Active customer polling state
  const [customerTracking, setCustomerTracking] = useState(null);

  // Driver UI states (dynamic selector between fleet drivers)
  const [selectedDriverAId, setSelectedDriverAId] = useState(10); // Ankit Sharma - 2 Wheeler
  const [selectedDriverBId, setSelectedDriverBId] = useState(12); // Ramesh Kumar - Tata Ace
  const [driverAOffers, setDriverAOffers] = useState([]);
  const [driverBOffers, setDriverBOffers] = useState([]);
  const [driverStatuses, setDriverStatuses] = useState({ 10: 'online', 12: 'online', 20: 'online', 25: 'online', 30: 'online', 34: 'online' });
  const [driverError, setDriverError] = useState({});

  // Sync with engine
  useEffect(() => {
    const unsubscribe = tieredDispatchEngine.subscribe((event, data, log) => {
      setEngineState({
        config: { ...tieredDispatchEngine.config },
        activeBookings: Array.from(tieredDispatchEngine.activeBookings.values()),
        drivers: [...tieredDispatchEngine.drivers]
      });
      setEventLogs(prev => [log, ...prev].slice(0, 100));

      if (event === 'driver:offer:stop' && data.reason === 'ACCEPTED_BY_ANOTHER') {
        showToast('⚠️ Ride taken by another partner');
      }

      if (event === 'tier:expanded') {
        showToast(`⚡ Tier 1 expired! Dispatch expanded by +${data.expandedByKm}km to Tier 2 (<= ${data.newRadiusKm}km)`);
      }

      if (event === 'booking:assigned') {
        showToast(`🎉 Driver ${data.driver.name} accepted booking #${data.bookingId}!`);
      }
    });

    const interval = setInterval(() => {
      if (activeBookingId) {
        const track = tieredDispatchEngine.getBookingTracking(activeBookingId);
        setCustomerTracking(track);
      }
      setDriverAOffers(tieredDispatchEngine.getActiveOffers(selectedDriverAId));
      setDriverBOffers(tieredDispatchEngine.getActiveOffers(selectedDriverBId));
    }, 500);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [activeBookingId, selectedDriverAId, selectedDriverBId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleMute = () => {
    const muted = soundSynthesizer.toggleMute();
    setIsMuted(muted);
  };

  // 1. Customer creates booking
  const handleCreateBooking = (e) => {
    e.preventDefault();
    const res = tieredDispatchEngine.createBooking({
      serviceName,
      pickupAddress,
      dropAddress,
      amount: fareAmount,
      distanceKm
    });

    setActiveBookingId(res.bookingId);
    setCustomerTracking({
      success: true,
      bookingId: res.bookingId,
      status: 'searching',
      stageNumber: 1,
      driverNotFound: false
    });

    showToast(`🚀 Booking #${res.bookingId} created! Tier 1 broadcast started.`);
  };

  // Customer cancels booking
  const handleCancelBooking = () => {
    if (!activeBookingId) return;
    const res = tieredDispatchEngine.cancelBooking(activeBookingId);
    showToast(res.message);
  };

  // Driver responds to offer (Accept / Reject)
  const handleDriverRespond = (driverId, bookingId, accept) => {
    const res = tieredDispatchEngine.respondToOffer(bookingId, driverId, accept);
    if (!accept) {
      showToast('❌ Offer rejected.');
      return;
    }

    if (res.status === 'ASSIGNED') {
      showToast(`✅ You Won! Booking assigned.`);
    } else if (res.status === 'TOO_LATE') {
      showToast('⚠️ Another driver partner has already accepted this booking (409 Conflict).');
    }
  };

  // Driver goes online / offline
  const handleDriverStatusToggle = (driverId, targetStatus) => {
    const res = tieredDispatchEngine.setDriverStatus(driverId, targetStatus);
    if (res.success) {
      setDriverStatuses(prev => ({ ...prev, [driverId]: targetStatus }));
      setDriverError(prev => ({ ...prev, [driverId]: null }));
      showToast(`Driver status set to ${targetStatus}`);
    } else {
      setDriverError(prev => ({ ...prev, [driverId]: res.message }));
      showToast(`⚠️ ${res.message}`);
    }
  };

  // Active booking helper
  const activeBooking = activeBookingId 
    ? engineState.activeBookings.find(b => b.bookingId === activeBookingId)
    : null;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: '#1E293B',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: '600',
          borderLeft: '4px solid #3B82F6'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #1E40AF 100%)',
        color: '#FFFFFF',
        borderRadius: '16px',
        padding: '22px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px rgba(30, 64, 175, 0.25)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{
              background: 'rgba(255,255,255,0.18)',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}>
              RAPIDO / SWIGGY STYLE DISPATCH
            </span>
            <span style={{
              backgroundColor: engineState.config.minWalletBalanceToOnline === 0 ? '#10B981' : '#F59E0B',
              color: '#FFFFFF',
              padding: '3px 9px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700'
            }}>
              {engineState.config.minWalletBalanceToOnline === 0 ? '₹0 Wallet Online: ACTIVE' : `Min Wallet: ₹${engineState.config.minWalletBalanceToOnline}`}
            </span>
          </div>
          <h2 style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={24} color="#FBBF24" /> Tiered Auto-Assignment & Dispatch Hub
          </h2>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '13px', maxWidth: '650px' }}>
            Multi-tiered radial broadcast (Tier 1 &le; 5km &rarr; 60s &rarr; Tier 2 &le; 10km), instant siren ringer, atomic conflict resolution (first accept wins, second receives 409 Conflict), and silent push dismissals.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Audio Siren Control */}
          <button
            onClick={handleToggleMute}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.25)',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            {isMuted ? 'Siren Muted' : 'Siren Audio ON'}
          </button>

          {/* Speed Multiplier Toggle */}
          <button
            onClick={() => {
              const newMult = engineState.config.speedMultiplier === 1 ? 6 : 1;
              tieredDispatchEngine.updateConfig({ speedMultiplier: newMult });
              showToast(newMult === 6 ? '⚡ Fast-Forward Demo Mode (6x timer speed)' : '⏱️ Real-time Mode (1x speed - 60s timers)');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: engineState.config.speedMultiplier > 1 ? '#F59E0B' : 'rgba(255,255,255,0.1)',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <Clock size={16} />
            {engineState.config.speedMultiplier > 1 ? 'Demo Speed: 6x (10s)' : 'Timer Speed: 1x (60s)'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        {[
          { id: 'simulator', label: 'Interactive 3-Device Simulator', icon: Smartphone },
          { id: 'config', label: 'Dispatch Radius & Wallet Policy', icon: Sliders },
          { id: 'docs', label: 'Frontend Integration Guide & API Explorer', icon: Code },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: isActive ? '700' : '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-main)',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: INTERACTIVE 3-DEVICE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Flow Diagram Overview */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={18} color="var(--primary)" />
              <span style={{ fontWeight: '700', fontSize: '13px' }}>Current Dispatch Pipeline:</span>
            </div>

            {activeBooking ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '13px' }}>
                <span className="badge" style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '4px 10px', fontWeight: '700' }}>
                  Booking #{activeBooking.bookingId}
                </span>

                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <strong style={{
                  color: activeBooking.status === 'assigned' ? '#10B981' : activeBooking.status === 'searching' ? '#3B82F6' : '#EF4444'
                }}>
                  {activeBooking.status.toUpperCase()}
                </strong>

                {activeBooking.status === 'searching' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      backgroundColor: activeBooking.currentTier === 1 ? '#FEF3C7' : '#DCFCE7',
                      color: activeBooking.currentTier === 1 ? '#B45309' : '#15803D',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      Broadcast Tier {activeBooking.currentTier} ({activeBooking.currentTier === 1 ? '<= 5km' : '<= 10km'})
                    </span>

                    <span style={{ fontWeight: '800', color: 'var(--primary)' }}>
                      ⏱️ {activeBooking.currentTier === 1 ? `${activeBooking.tier1RemainingSeconds}s left` : `${activeBooking.tier2RemainingSeconds}s left`}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No active booking in dispatch. Submit the Customer Form below to start the live tiered auto-assignment!
              </span>
            )}
          </div>

          {/* 3 Devices Side-by-Side Mockup */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* DEVICE 1: CUSTOMER APP */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '2px solid #3B82F6',
              borderRadius: '20px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.08)'
            }}>
              {/* Phone Status Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3B82F6' }}></div>
                  <span style={{ fontWeight: '800', fontSize: '14px' }}>Customer Mobile App</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>POST /api/bookings</span>
              </div>

              {!activeBooking || activeBooking.status === 'cancelled' || activeBooking.status === 'no_driver_found' ? (
                /* Customer Booking Form */
                <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', fontWeight: '700' }}>Service / Vehicle Required</label>
                    <select
                      value={serviceName}
                      onChange={e => {
                        const val = e.target.value;
                        setServiceName(val);
                        if (val === '2 Wheeler') setFareAmount(99.00);
                        else if (val === '3 Wheeler') setFareAmount(180.00);
                        else if (val === 'Tata Ace') setFareAmount(350.00);
                        else if (val === 'Pickup 8ft') setFareAmount(550.00);
                        else if (val === 'Tata 407') setFareAmount(850.00);
                      }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                    >
                      <option value="2 Wheeler">2 Wheeler (Bike / Scooter) - ₹99</option>
                      <option value="3 Wheeler">3 Wheeler (Auto Rickshaw) - ₹180</option>
                      <option value="Tata Ace">Tata Ace (850kg capacity) - ₹350</option>
                      <option value="Pickup 8ft">Pickup 8ft (1200kg) - ₹550</option>
                      <option value="Tata 407">Tata 407 (14ft Truck) - ₹850</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '12px', fontWeight: '700' }}>Pickup Location</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#10B981' }} />
                      <input
                        type="text"
                        value={pickupAddress}
                        onChange={e => setPickupAddress(e.target.value)}
                        style={{ width: '100%', paddingLeft: '32px', fontSize: '12px', height: '36px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '12px', fontWeight: '700' }}>Drop-off Location</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#EF4444' }} />
                      <input
                        type="text"
                        value={dropAddress}
                        onChange={e => setDropAddress(e.target.value)}
                        style={{ width: '100%', paddingLeft: '32px', fontSize: '12px', height: '36px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', fontWeight: '700' }}>Distance (KM)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={distanceKm}
                        onChange={e => setDistanceKm(Number(e.target.value))}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', fontWeight: '700' }}>Estimated Fare (₹)</label>
                      <input
                        type="number"
                        value={fareAmount}
                        onChange={e => setFareAmount(Number(e.target.value))}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      marginTop: 'auto',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: '800',
                      fontSize: '14px'
                    }}
                  >
                    <Send size={16} /> Book & Start Auto-Assignment
                  </button>
                </form>
              ) : activeBooking.status === 'searching' ? (
                /* Customer Searching Radar Screen */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px 0', textAlign: 'center' }}>
                  {/* Radar animation circle */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '3px solid #3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    animation: 'pulse 1.5s infinite'
                  }}>
                    <Radio size={42} color="#3B82F6" />
                  </div>

                  <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                    Searching for Nearby Partners...
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Broadcasting in <strong>Tier {activeBooking.currentTier} ({activeBooking.currentTier === 1 ? '<= 5km' : '<= 10km'})</strong>
                  </div>

                  <div style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    fontSize: '12px',
                    color: '#2563EB',
                    fontWeight: '600'
                  }}>
                    Polling: <code>GET /api/bookings/{activeBooking.bookingId}/tracking</code>
                  </div>

                  <div style={{ marginTop: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleCancelBooking}
                      className="btn btn-secondary"
                      style={{ color: '#EF4444', borderColor: '#FCA5A5', width: '100%' }}
                    >
                      <XCircle size={16} /> Cancel Ride (Immediate Stop)
                    </button>
                  </div>
                </div>
              ) : (
                /* Customer Assigned Driver Card */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  <div style={{
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <CheckCircle size={20} color="#059669" />
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: '#065F46' }}>Driver Assigned!</div>
                      <div style={{ fontSize: '11px', color: '#047857' }}>OTP for delivery: <strong>{activeBooking.deliveryOtp}</strong></div>
                    </div>
                  </div>

                  {activeBooking.assignedDriver && (
                    <div style={{
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: '12px',
                      padding: '14px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={activeBooking.assignedDriver.avatar}
                          alt=""
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '800', fontSize: '15px' }}>{activeBooking.assignedDriver.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⭐ {activeBooking.assignedDriver.rating} &bull; {activeBooking.assignedDriver.vehicleLabel}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Vehicle Plate</div>
                          <strong style={{ fontFamily: 'monospace' }}>{activeBooking.assignedDriver.vehicleNumber}</strong>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Contact</div>
                          <strong>{activeBooking.assignedDriver.phone}</strong>
                        </div>
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', padding: '8px', borderRadius: '8px' }}>
                        📍 Live GPS: <strong>{activeBooking.assignedDriver.latitude}, {activeBooking.assignedDriver.longitude}</strong>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveBookingId(null)}
                    className="btn btn-secondary"
                    style={{ marginTop: 'auto', width: '100%', fontSize: '13px' }}
                  >
                    Reset Customer App (Test Another Ride)
                  </button>
                </div>
              )}
            </div>

            {/* DEVICE 2: DRIVER PARTNER A (DYNAMIC FLEET SELECTOR) */}
            {(() => {
              const driver = engineState.drivers.find(d => d.id === selectedDriverAId) || engineState.drivers[0];
              const offers = driverAOffers;
              const status = driverStatuses[driver.id] || 'online';
              const isVehicleMatch = activeBooking ? isStrictVehicleMatching(activeBooking.serviceName, driver.vehicleCategory || driver.vehicleLabel) : true;
              return (
                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  border: offers.length > 0 ? '2px solid #EF4444' : '2px solid #10B981',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: offers.length > 0 ? '0 8px 24px rgba(239, 68, 68, 0.15)' : '0 8px 24px rgba(16, 185, 129, 0.08)'
                }}>
                  {/* Driver Selector & Status Bar */}
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>DRIVER PHONE A</span>
                      <button
                        onClick={() => handleDriverStatusToggle(driver.id, status === 'online' ? 'offline' : 'online')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: status === 'online' ? '#10B981' : '#64748B',
                          color: '#FFFFFF'
                        }}
                      >
                        {status === 'online' ? 'ONLINE' : 'OFFLINE'}
                      </button>
                    </div>

                    <select
                      value={selectedDriverAId}
                      onChange={e => setSelectedDriverAId(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-main)',
                        color: 'var(--text-main)',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {engineState.drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} &bull; {d.vehicleCategory || d.vehicleLabel} (₹{d.walletBalance.toFixed(2)})
                        </option>
                      ))}
                    </select>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>📍 {driver.distanceKm} km away ({driver.distanceKm <= 5 ? 'Tier 1' : 'Tier 2'})</span>
                      <span>Wallet: <strong>₹{driver.walletBalance.toFixed(2)}</strong></span>
                    </div>
                  </div>

                  {driverError[driver.id] && (
                    <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '11px', marginBottom: '12px' }}>
                      {driverError[driver.id]}
                    </div>
                  )}

                  {/* Offers / Mismatch / Active Ride / Standby */}
                  {offers.length > 0 ? (
                    /* Ringing Offer Card */
                    <div style={{
                      backgroundColor: '#FEF2F2',
                      border: '2px solid #EF4444',
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      animation: 'pulse 1.2s infinite'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          backgroundColor: '#EF4444',
                          color: '#FFFFFF',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Bell size={12} /> INCOMING OFFER ({offers[0].serviceName})
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#EF4444' }}>
                          ⏱️ {offers[0].remainingSeconds}s
                        </span>
                      </div>

                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937' }}>
                        ₹{offers[0].offeredFare.toFixed(2)}
                        <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '6px' }}>
                          ({offers[0].distanceKm} km ride)
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <MapPin size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ color: '#111827', fontWeight: '600' }}>{offers[0].pickupAddress}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <MapPin size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ color: '#4B5563' }}>{offers[0].dropAddress}</span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                        <button
                          onClick={() => handleDriverRespond(driver.id, offers[0].bookingId, true)}
                          style={{
                            padding: '10px',
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          ✓ ACCEPT
                        </button>
                        <button
                          onClick={() => handleDriverRespond(driver.id, offers[0].bookingId, false)}
                          style={{
                            padding: '10px',
                            backgroundColor: '#EF4444',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          ✕ REJECT
                        </button>
                      </div>
                    </div>
                  ) : activeBooking && activeBooking.assignedDriver?.id === driver.id ? (
                    /* Driver Won & On Trip Screen */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '24px 0', textAlign: 'center', gap: '10px' }}>
                      <CheckCircle size={44} color="#10B981" />
                      <div style={{ fontWeight: '800', fontSize: '15px', color: '#10B981' }}>Ride Accepted! (You Won)</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Navigating to customer pickup: <strong>{activeBooking.pickupAddress}</strong>
                      </div>
                    </div>
                  ) : activeBooking && activeBooking.status === 'searching' && !isVehicleMatch ? (
                    /* STRICT VEHICLE TYPE MISMATCH BANNER */
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '14px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '8px',
                      margin: 'auto 0'
                    }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                        <VolumeX size={18} />
                      </div>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: '#EF4444' }}>
                        Silent: Vehicle Type Mismatch
                      </div>
                      <div style={{ fontSize: '12px', color: '#F87171' }}>
                        Booking requires: <strong>{activeBooking.serviceName}</strong>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Driver registered with: <strong>{driver.vehicleCategory}</strong>
                      </div>
                      <div style={{ fontSize: '10px', backgroundColor: 'rgba(0,0,0,0.25)', padding: '4px 8px', borderRadius: '6px', color: '#94A3B8', marginTop: '4px' }}>
                        🚫 Zero notifications &bull; Siren ringer silent
                      </div>
                    </div>
                  ) : activeBooking && activeBooking.status === 'searching' && driver.distanceKm > (activeBooking.currentTier === 1 ? 5 : 10) ? (
                    /* Radius Standby */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '24px 0', textAlign: 'center', gap: '8px' }}>
                      <Clock size={32} color="#F59E0B" />
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#B45309' }}>Outside Current Radius ({driver.distanceKm}km)</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '220px' }}>
                        Will receive offer if Tier 1 expands to Tier 2 in <strong>{activeBooking.tier1RemainingSeconds}s</strong>.
                      </div>
                    </div>
                  ) : (
                    /* Idle Standby */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Truck size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#var(--text-main)' }}>
                        {status === 'online' ? 'Online & Waiting for Rides' : 'Driver is Offline'}
                      </div>
                      <div style={{ fontSize: '11px', marginTop: '4px' }}>
                        Registered: <strong>{driver.vehicleCategory}</strong> &bull; {driver.distanceKm}km away
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* DEVICE 3: DRIVER PARTNER B (DYNAMIC FLEET SELECTOR) */}
            {(() => {
              const driver = engineState.drivers.find(d => d.id === selectedDriverBId) || engineState.drivers[1];
              const offers = driverBOffers;
              const status = driverStatuses[driver.id] || 'online';
              const isVehicleMatch = activeBooking ? isStrictVehicleMatching(activeBooking.serviceName, driver.vehicleCategory || driver.vehicleLabel) : true;
              return (
                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  border: offers.length > 0 ? '2px solid #EF4444' : '2px solid #F59E0B',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: offers.length > 0 ? '0 8px 24px rgba(239, 68, 68, 0.15)' : '0 8px 24px rgba(245, 158, 11, 0.08)'
                }}>
                  {/* Driver Selector & Status Bar */}
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>DRIVER PHONE B</span>
                      <button
                        onClick={() => handleDriverStatusToggle(driver.id, status === 'online' ? 'offline' : 'online')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: status === 'online' ? '#10B981' : '#64748B',
                          color: '#FFFFFF'
                        }}
                      >
                        {status === 'online' ? 'ONLINE' : 'OFFLINE'}
                      </button>
                    </div>

                    <select
                      value={selectedDriverBId}
                      onChange={e => setSelectedDriverBId(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-main)',
                        color: 'var(--text-main)',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {engineState.drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} &bull; {d.vehicleCategory || d.vehicleLabel} (₹{d.walletBalance.toFixed(2)})
                        </option>
                      ))}
                    </select>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>📍 {driver.distanceKm} km away ({driver.distanceKm <= 5 ? 'Tier 1' : 'Tier 2'})</span>
                      <span>Wallet: <strong>₹{driver.walletBalance.toFixed(2)}</strong></span>
                    </div>
                  </div>

                  {driverError[driver.id] && (
                    <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '11px', marginBottom: '12px' }}>
                      {driverError[driver.id]}
                    </div>
                  )}

                  {/* Offers / Mismatch / Active Ride / Standby */}
                  {offers.length > 0 ? (
                    /* Ringing Offer Card */
                    <div style={{
                      backgroundColor: '#FEF2F2',
                      border: '2px solid #EF4444',
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      animation: 'pulse 1.2s infinite'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          backgroundColor: '#EF4444',
                          color: '#FFFFFF',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Bell size={12} /> INCOMING OFFER ({offers[0].serviceName})
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#EF4444' }}>
                          ⏱️ {offers[0].remainingSeconds}s
                        </span>
                      </div>

                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937' }}>
                        ₹{offers[0].offeredFare.toFixed(2)}
                        <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '6px' }}>
                          ({offers[0].distanceKm} km ride)
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <MapPin size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ color: '#111827', fontWeight: '600' }}>{offers[0].pickupAddress}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <MapPin size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ color: '#4B5563' }}>{offers[0].dropAddress}</span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                        <button
                          onClick={() => handleDriverRespond(driver.id, offers[0].bookingId, true)}
                          style={{
                            padding: '10px',
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          ✓ ACCEPT
                        </button>
                        <button
                          onClick={() => handleDriverRespond(driver.id, offers[0].bookingId, false)}
                          style={{
                            padding: '10px',
                            backgroundColor: '#EF4444',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          ✕ REJECT
                        </button>
                      </div>
                    </div>
                  ) : activeBooking && activeBooking.assignedDriver?.id === driver.id ? (
                    /* Driver Won & On Trip Screen */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '24px 0', textAlign: 'center', gap: '10px' }}>
                      <CheckCircle size={44} color="#10B981" />
                      <div style={{ fontWeight: '800', fontSize: '15px', color: '#10B981' }}>Ride Accepted! (You Won)</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Navigating to customer pickup: <strong>{activeBooking.pickupAddress}</strong>
                      </div>
                    </div>
                  ) : activeBooking && activeBooking.status === 'searching' && !isVehicleMatch ? (
                    /* STRICT VEHICLE TYPE MISMATCH BANNER */
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '14px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '8px',
                      margin: 'auto 0'
                    }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                        <VolumeX size={18} />
                      </div>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: '#EF4444' }}>
                        Silent: Vehicle Type Mismatch
                      </div>
                      <div style={{ fontSize: '12px', color: '#F87171' }}>
                        Booking requires: <strong>{activeBooking.serviceName}</strong>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Driver registered with: <strong>{driver.vehicleCategory}</strong>
                      </div>
                      <div style={{ fontSize: '10px', backgroundColor: 'rgba(0,0,0,0.25)', padding: '4px 8px', borderRadius: '6px', color: '#94A3B8', marginTop: '4px' }}>
                        🚫 Zero notifications &bull; Siren ringer silent
                      </div>
                    </div>
                  ) : activeBooking && activeBooking.status === 'searching' && driver.distanceKm > (activeBooking.currentTier === 1 ? 5 : 10) ? (
                    /* Radius Standby */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '24px 0', textAlign: 'center', gap: '8px' }}>
                      <Clock size={32} color="#F59E0B" />
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#B45309' }}>Outside Current Radius ({driver.distanceKm}km)</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '220px' }}>
                        Will receive offer if Tier 1 expands to Tier 2 in <strong>{activeBooking.tier1RemainingSeconds}s</strong>.
                      </div>
                    </div>
                  ) : (
                    /* Idle Standby */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Truck size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                      <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>
                        {status === 'online' ? 'Online & Waiting for Rides' : 'Driver is Offline'}
                      </div>
                      <div style={{ fontSize: '11px', marginTop: '4px' }}>
                        Registered: <strong>{driver.vehicleCategory}</strong> &bull; {driver.distanceKm}km away
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Real-Time WebSocket Telemetry Log Stream */}
          <div style={{
            backgroundColor: '#0F172A',
            color: '#E2E8F0',
            borderRadius: '16px',
            padding: '16px 20px',
            fontFamily: 'monospace',
            fontSize: '12px',
            maxHeight: '260px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontWeight: '700' }}>
                <Radio size={14} /> WebSocket Telemetry Stream (ws://&lt;domain&gt;/ws/telemetry)
              </div>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>{eventLogs.length} events logged</span>
            </div>

            {eventLogs.length === 0 ? (
              <div style={{ color: '#64748B', padding: '20px', textAlign: 'center' }}>
                Waiting for dispatch events... Submit the Customer form above to watch live WebSocket payloads.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {eventLogs.slice(0, 15).map(log => (
                  <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: '1.4' }}>
                    <span style={{ color: '#64748B' }}>[{log.timestamp}]</span>
                    <span style={{
                      fontWeight: '700',
                      color: log.event === 'driver:offer:new' ? '#34D399'
                           : log.event === 'driver:offer:stop' ? '#F87171'
                           : log.event === 'tier:expanded' ? '#FBBF24'
                           : log.event === 'booking:assigned' ? '#60A5FA'
                           : '#A78BFA'
                    }}>
                      {log.event}
                    </span>
                    <span style={{ color: '#CBD5E1', wordBreak: 'break-all' }}>
                      {JSON.stringify(log.data)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DISPATCH CONFIGURATION & WALLET POLICY */}
      {activeTab === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="dashboard-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>
              Radial Tier Escalation Parameters
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Configure the initial search radius, wait timeouts, and expansion distance before cascading to wider driver fleets.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: '700' }}>Tier 1 Initial Radius (KM)</label>
                <input
                  type="number"
                  step="0.5"
                  value={engineState.config.tier1RadiusKm}
                  onChange={e => tieredDispatchEngine.updateConfig({ tier1RadiusKm: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Default: 5.0 km from pickup point</p>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: '700' }}>Tier 1 Timeout Duration (Seconds)</label>
                <input
                  type="number"
                  value={engineState.config.tier1DurationSec}
                  onChange={e => tieredDispatchEngine.updateConfig({ tier1DurationSec: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Default: 60 seconds (countdown before expanding to Tier 2)</p>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: '700' }}>Tier 2 Expanded Radius (KM)</label>
                <input
                  type="number"
                  step="0.5"
                  value={engineState.config.tier2RadiusKm}
                  onChange={e => tieredDispatchEngine.updateConfig({ tier2RadiusKm: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Default: 10.0 km (+5km expansion)</p>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: '700' }}>Tier 2 Timeout Duration (Seconds)</label>
                <input
                  type="number"
                  value={engineState.config.tier2DurationSec}
                  onChange={e => tieredDispatchEngine.updateConfig({ tier2DurationSec: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Default: 60 seconds before showing "No Driver Found"</p>
              </div>
            </div>
          </div>

          {/* ₹0 Wallet Policy Settings */}
          <div className="dashboard-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Wallet size={22} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                Driver Wallet Online Policy (Rapido / Swiggy Model)
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              When set to <strong>₹0.00</strong>, drivers can come online and take orders even with zero wallet balance. 
              Platform commission is tracked and deducted upon trip settlement.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Option A: ₹0 Model */}
              <div
                onClick={() => {
                  tieredDispatchEngine.updateConfig({ minWalletBalanceToOnline: 0 });
                  if (updateWalletSettings) updateWalletSettings({ minimumBalance: 0 });
                  showToast('✅ Rapido / Swiggy ₹0 Wallet Online Policy Enabled');
                }}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${engineState.config.minWalletBalanceToOnline === 0 ? 'var(--primary)' : 'var(--border-color)'}`,
                  backgroundColor: engineState.config.minWalletBalanceToOnline === 0 ? 'rgba(30, 93, 255, 0.04)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '14px', color: 'var(--primary)' }}>₹0.00 Minimum Balance (Recommended)</strong>
                  {engineState.config.minWalletBalanceToOnline === 0 && <CheckCircle size={18} color="var(--primary)" />}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                  Drivers with ₹0.00 wallet can go online freely. Maximize fleet availability and customer fulfillment speed.
                </p>
              </div>

              {/* Option B: Enforced Minimum Balance */}
              <div
                onClick={() => {
                  tieredDispatchEngine.updateConfig({ minWalletBalanceToOnline: 500 });
                  if (updateWalletSettings) updateWalletSettings({ minimumBalance: 500 });
                  showToast('⚠️ Enforced ₹500 Minimum Balance to go online');
                }}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${engineState.config.minWalletBalanceToOnline > 0 ? 'var(--primary)' : 'var(--border-color)'}`,
                  backgroundColor: engineState.config.minWalletBalanceToOnline > 0 ? 'rgba(30, 93, 255, 0.04)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '14px' }}>Custom Threshold (e.g. ₹500.00)</strong>
                  {engineState.config.minWalletBalanceToOnline > 0 && <CheckCircle size={18} color="var(--primary)" />}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                  Drivers with balance below ₹{engineState.config.minWalletBalanceToOnline || 500} receive <code>WALLET_EMPTY</code> error when going online.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FRONTEND INTEGRATION GUIDE & INTERACTIVE API EXPLORER */}
      {activeTab === 'docs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Architecture Summary */}
          <div className="dashboard-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>
              Frontend Integration Specification & Flow Summary
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Reference guide for Mobile App engineers (React Native / Flutter / Android / iOS).
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Payload / Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Driver Go Online (₹0 Policy)</strong></td>
                    <td><code>PUT</code></td>
                    <td><code>/api/drivers/me/status</code></td>
                    <td><code>{`{ "status": "online" }`}</code> (Allows ₹0 wallet when min=0)</td>
                  </tr>
                  <tr>
                    <td><strong>Active Offers List</strong></td>
                    <td><code>GET</code></td>
                    <td><code>/api/driver/offers/active</code></td>
                    <td>Returns array of active ringing offers with <code>remainingSeconds</code></td>
                  </tr>
                  <tr>
                    <td><strong>Accept / Reject Offer</strong></td>
                    <td><code>POST</code></td>
                    <td><code>/api/driver/offers/{'{bookingId}'}/respond</code></td>
                    <td><code>{`{ "accept": true }`}</code> &rarr; 200 OK (Won) or 409 Conflict (TOO_LATE)</td>
                  </tr>
                  <tr>
                    <td><strong>Create Booking</strong></td>
                    <td><code>POST</code></td>
                    <td><code>/api/bookings</code></td>
                    <td>Creates booking &rarr; starts 60s Tier 1 radial broadcast</td>
                  </tr>
                  <tr>
                    <td><strong>Customer Live Tracking</strong></td>
                    <td><code>GET</code></td>
                    <td><code>/api/bookings/{'{bookingId}'}/tracking</code></td>
                    <td>Poll every 2-3s (<code>searching</code> &rarr; <code>assigned</code> with driver details)</td>
                  </tr>
                  <tr>
                    <td><strong>Customer Cancel</strong></td>
                    <td><code>POST</code></td>
                    <td><code>/api/bookings/{'{bookingId}'}/cancel</code></td>
                    <td>Cancels ride and silences all driver ringers immediately</td>
                  </tr>
                  <tr>
                    <td><strong>WebSocket Telemetry</strong></td>
                    <td><code>WS</code></td>
                    <td><code>/ws/telemetry</code></td>
                    <td>Emits <code>driver:offer:new</code> and <code>driver:offer:stop</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PART 2: STRICT VEHICLE TYPE DISPATCH SPECIFICATION */}
          <div className="dashboard-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', background: '#3B82F6', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>PART 2</span>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>
                Strict Vehicle Type Dispatch & Notification Protocol
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              The auto-assignment engine enforces strict vehicle-type matching. Drivers with mismatched vehicle types receive <strong>zero sound and zero notifications</strong>.
            </p>

            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table className="custom-table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-main)' }}>
                    <th>User Selected Vehicle</th>
                    <th>Send in <code>serviceName</code> (or <code>vehicleId</code>)</th>
                    <th>Who gets notified within the radius?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>2 Wheeler</strong></td>
                    <td><code>"2 Wheeler"</code> or <code>"Bike"</code> or <code>"two_wheeler"</code></td>
                    <td><strong style={{ color: '#10B981' }}>Only</strong> active drivers registered with <code>Bike</code>, <code>2 Wheeler</code></td>
                  </tr>
                  <tr>
                    <td><strong>3 Wheeler</strong></td>
                    <td><code>"3 Wheeler"</code> or <code>"3 Wheeler / Auto"</code> or <code>"auto_rickshaw"</code></td>
                    <td><strong style={{ color: '#10B981' }}>Only</strong> active drivers registered with <code>3 Wheeler</code>, <code>Auto</code></td>
                  </tr>
                  <tr>
                    <td><strong>Tata Ace</strong></td>
                    <td><code>"Tata Ace"</code> or <code>"tata_ace"</code></td>
                    <td><strong style={{ color: '#10B981' }}>Only</strong> active drivers registered with <code>Tata Ace</code></td>
                  </tr>
                  <tr>
                    <td><strong>Pickup 8ft</strong></td>
                    <td><code>"Pickup 8ft"</code> or <code>"pickup_8ft"</code></td>
                    <td><strong style={{ color: '#10B981' }}>Only</strong> active drivers registered with <code>Pickup 8ft</code></td>
                  </tr>
                  <tr>
                    <td><strong>Tata 407</strong></td>
                    <td><code>"Tata 407"</code> or <code>"tata_407"</code> or <code>"14ft Truck"</code></td>
                    <td><strong style={{ color: '#10B981' }}>Only</strong> active drivers registered with <code>Tata 407</code>, <code>Truck</code></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '6px', color: '#60A5FA' }}>
                  1. Sample Order Creation Payload (POST /api/orders)
                </h4>
                <pre style={{ backgroundColor: '#0F172A', color: '#38BDF8', padding: '12px', borderRadius: '8px', fontSize: '11px', overflowX: 'auto' }}>
{`{
  "pickupAddress": "Cyber Towers, Hitech City, Hyderabad",
  "dropAddress": "DLF Cyber City, Gachibowli, Hyderabad",
  "pickupLat": 17.4504,
  "pickupLng": 78.3811,
  "dropLat": 17.4474,
  "dropLng": 78.3565,
  "serviceName": "2 Wheeler",
  "amount": 99.00,
  "paymentMethod": "Cash"
}`}
                </pre>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '6px', color: '#34D399' }}>
                  2. Driver Incoming Offer Notification Payload (Push & WebSocket)
                </h4>
                <pre style={{ backgroundColor: '#0F172A', color: '#34D399', padding: '12px', borderRadius: '8px', fontSize: '11px', overflowX: 'auto' }}>
{`{
  "type": "ORDER_OFFER",
  "bookingId": "ANP102934",
  "serviceName": "2 Wheeler",
  "pickupAddress": "Cyber Towers, Hitech City",
  "dropAddress": "DLF Cyber City, Gachibowli",
  "amount": 99.00,
  "sound": "order_alert.mp3"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* FCM Silent Push Code Sample */}
          <div className="dashboard-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '8px' }}>
              FCM Silent Push Payload & Mobile Dismissal Handler
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              When a competitor accepts the ride, this data payload arrives in background to immediately kill background audio & vibration.
            </p>
            <pre style={{ backgroundColor: '#0F172A', color: '#38BDF8', padding: '16px', borderRadius: '10px', fontSize: '12px', overflowX: 'auto' }}>
{`// Android (FirebaseMessagingService) & iOS (UNNotificationServiceExtension)
{
  "data": {
    "action": "STOP_DRIVER_OFFER",
    "bookingId": "ANP882910",
    "reason": "ACCEPTED_BY_ANOTHER"
  }
}

// Mobile Client Handler:
if (remoteMessage.data.action === 'STOP_DRIVER_OFFER') {
  SoundPlayer.stopRingtone();
  Vibration.cancel();
  NotificationManager.cancel(remoteMessage.data.bookingId);
  OfferStore.removeOffer(remoteMessage.data.bookingId);
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
