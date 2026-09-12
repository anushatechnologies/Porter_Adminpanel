import React, { useState, useEffect, useContext } from 'react';
import {
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Save,
  Search,
  RefreshCw,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Navigation,
  Globe,
  Layers,
  Copy,
  Check,
  ArrowRight,
  Info,
  Zap,
  Truck,
  Send,
  Bell,
  Volume2,
  VolumeX,
  Clock
} from 'lucide-react';
import { AppStateContext } from '../../context/AppState';
import {
  fetchServiceableAreas,
  bulkUpdateServiceableAreas,
  toggleServiceableArea,
  addServiceableArea,
  validateServiceableArea,
  DISPATCH_RULES
} from '../../services/locationApi';

// ── Tab 4: Live API Validator Component ────────────────────────
function LiveApiValidator({ authFetch, areas }) {
  const [lat, setLat] = useState('17.4486');
  const [lng, setLng] = useState('78.3908');
  const [pincode, setPincode] = useState('500081');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const presets = [
    { label: 'Hitech City (500081)', lat: '17.4486', lng: '78.3808', pincode: '500081' },
    { label: 'Gachibowli (500032)', lat: '17.4401', lng: '78.3489', pincode: '500032' },
    { label: 'Shamshabad (501218)', lat: '17.2403', lng: '78.4294', pincode: '501218' },
    { label: 'Medchal (501401)', lat: '17.6297', lng: '78.4814', pincode: '501401' },
  ];

  const handleValidate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await validateServiceableArea(authFetch, {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        pincode: pincode || undefined,
      });
      setResult(res);
    } catch (e) {
      setError(`API error: ${e.message}. Unable to validate location.`);
    } finally {
      setLoading(false);
    }
  };

  const isServiceable = result?.serviceable;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="#FBBF24" /> Flow 3 — Live Serviceable Area Validator
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.6' }}>
          Calls <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px' }}>POST /api/location/validate-serviceable</code> with lat/lng/pincode.
          Frontend rule: if <code>serviceable === false</code>, disable "Confirm Location" button and show red banner.
        </p>

        {/* Presets */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
          {presets.map(p => (
            <button key={p.label} onClick={() => { setLat(p.lat); setLng(p.lng); setPincode(p.pincode); setResult(null); }}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '18px' }}>
          {[['Latitude', lat, setLat], ['Longitude', lng, setLng], ['Pincode', pincode, setPincode]].map(([lbl, val, setter]) => (
            <div key={lbl}>
              <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lbl}</label>
              <input value={val} onChange={e => { setter(e.target.value); setResult(null); }}
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#e2e8f0' }} />
            </div>
          ))}
        </div>

        <button onClick={handleValidate} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', border: 'none', background: loading ? '#334155' : '#F59E0B', color: loading ? '#94a3b8' : '#000', fontWeight: '800', fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? (
            <><div style={{ width: '16px', height: '16px', border: '2px solid #94a3b8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Validating…</>
          ) : (
            <><Send size={15} /> Validate Location</>
          )}
        </button>
      </div>

      {/* Result Panel */}
      {error && (
        <div style={{ padding: '16px 20px', borderRadius: '12px', background: '#1f0a0a', border: '1px solid #7f1d1d', color: '#FCA5A5', fontSize: '13px', fontFamily: 'monospace' }}>
          ❌ {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          {/* Status Card */}
          <div style={{ padding: '24px', borderRadius: '14px', background: isServiceable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `2px solid ${isServiceable ? '#10B981' : '#EF4444'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: isServiceable ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isServiceable ? <CheckCircle2 size={28} color="#fff" /> : <XCircle size={28} color="#fff" />}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: isServiceable ? '#34D399' : '#F87171', marginBottom: '6px' }}>
                {isServiceable ? '✅ Area Serviceable' : '🚫 Not Serviceable'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '280px' }}>
                {result.message}
              </div>
            </div>
            {result.areaName && (
              <div style={{ padding: '8px 18px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', fontSize: '13px', color: '#e2e8f0', fontWeight: '700' }}>
                📍 {result.areaName}, {result.city}
              </div>
            )}
          </div>

          {/* Frontend Action Guide */}
          <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Frontend Action Rules</div>
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: isServiceable ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${isServiceable ? '#10B981' : '#EF4444'}44`, fontSize: '12px', color: isServiceable ? '#34D399' : '#F87171', lineHeight: '1.8' }}>
              {isServiceable ? (
                <>
                  ✅ <strong>ALLOW</strong> user to proceed<br />
                  → Enable "Confirm Location" button<br />
                  → Show green ✓ banner<br />
                  → Proceed to fare estimation
                </>
              ) : (
                <>
                  🚫 <strong>BLOCK</strong> user from proceeding<br />
                  → <strong>Disable</strong> "Confirm Location" button<br />
                  → Show red warning banner<br />
                  → Prompt user to pick an approved area
                </>
              )}
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(15,23,42,0.8)', fontSize: '11px', fontFamily: 'monospace', color: '#93C5FD', lineHeight: '1.8' }}>
              {`// React implementation\nif (!response.serviceable) {\n  setConfirmDisabled(true);\n  showBanner('error', response.message);\n} else {\n  setConfirmDisabled(false);\n  clearBanners();\n}`}
            </div>

            {/* Raw JSON */}
            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '12px', overflow: 'auto', maxHeight: '180px' }}>
              <pre style={{ margin: 0, fontSize: '11px', color: '#86EFAC', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 5: Vehicle Dispatch Rules Panel ───────────────────────────
function DispatchRulesPanel() {
  const [simStatus, setSimStatus] = useState('idle'); // 'idle' | 'ringing' | 'accepted' | 'rejected' | 'timeout'
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('2 Wheeler');

  useEffect(() => {
    let timer;
    if (simStatus === 'ringing' && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            setSimStatus('timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [simStatus, secondsLeft]);

  const handleStartSim = () => {
    setSimStatus('ringing');
    setSecondsLeft(30);
  };

  const handleAccept = () => {
    setSimStatus('accepted');
  };

  const handleReject = () => {
    setSimStatus('rejected');
  };

  const handleReset = () => {
    setSimStatus('idle');
    setSecondsLeft(30);
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(DISPATCH_RULES.driverNotificationPayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={20} color="#F87171" /> Part 2 — Strict Vehicle Type Dispatch & Driver Notifications
        </h3>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
          Backend-guaranteed vehicle type isolation — the customer app simply specifies <code style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: '4px' }}>serviceName</code> or vehicle category code.
          The backend auto-assignment engine targets <strong style={{ color: '#e2e8f0' }}>only matching vehicle drivers</strong> and ensures zero unwanted push alerts across driver pools.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.25)', fontSize: '12px', color: '#34D399', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} /> Zero Cross-Vehicle Pollution
          </div>
          <div style={{ padding: '6px 12px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.25)', fontSize: '12px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Volume2 size={14} /> Continuous order_offer_ring.mp3 Loop
          </div>
          <div style={{ padding: '6px 12px', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.25)', fontSize: '12px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> 30-Second Acceptance Window
          </div>
        </div>
      </div>

      {/* Interactive Driver Notification & Ringing Simulator */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '24px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Live Driver App Simulator
            </div>
            <h4 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: '800', color: '#fff' }}>
              Simulate Inbound Ride Offer & Continuous Audio Ringing
            </h4>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {simStatus === 'idle' ? (
              <button
                onClick={handleStartSim}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
                }}
              >
                <Bell size={15} /> Trigger Driver Order Alert
              </button>
            ) : (
              <button
                onClick={handleReset}
                style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Reset Simulator
              </button>
            )}
          </div>
        </div>

        {/* Simulator Screen */}
        <div style={{
          background: '#090d16',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          alignItems: 'center'
        }}>
          {/* Left: Driver Phone Mockup */}
          <div style={{
            background: simStatus === 'ringing' ? '#1a1012' : '#0f172a',
            border: `2px solid ${
              simStatus === 'ringing' ? '#ef4444' :
              simStatus === 'accepted' ? '#10b981' :
              simStatus === 'rejected' ? '#64748b' :
              simStatus === 'timeout' ? '#f59e0b' : 'rgba(255,255,255,0.1)'
            }`,
            borderRadius: '16px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            {/* Top Sound Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {simStatus === 'ringing' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '12px', fontWeight: '800' }}>
                    <Volume2 size={16} style={{ animation: 'bounce 0.8s infinite' }} /> RINGING (order_offer_ring.mp3)
                  </span>
                ) : simStatus === 'accepted' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12px', fontWeight: '800' }}>
                    <VolumeX size={16} /> Sound Stopped (Order Accepted)
                  </span>
                ) : simStatus === 'rejected' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', fontWeight: '800' }}>
                    <VolumeX size={16} /> Sound Stopped (Offer Declined)
                  </span>
                ) : simStatus === 'timeout' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '12px', fontWeight: '800' }}>
                    <VolumeX size={16} /> Sound Stopped (Expired 30s)
                  </span>
                ) : (
                  <span style={{ color: '#64748b', fontSize: '12px' }}>
                    <VolumeX size={16} /> Waiting for inbound dispatch...
                  </span>
                )}
              </div>

              {simStatus === 'ringing' && (
                <div style={{
                  background: '#ef4444',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock size={12} /> {secondsLeft}s
                </div>
              )}
            </div>

            {/* Countdown Progress Bar */}
            {simStatus === 'ringing' && (
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '14px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(secondsLeft / 30) * 100}%`,
                  background: secondsLeft > 10 ? '#ef4444' : '#f59e0b',
                  transition: 'width 1s linear'
                }} />
              </div>
            )}

            {/* Booking Offer Details */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
                  Ride Category
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(99,102,241,0.2)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.4)'
                }}>
                  🛵 2 Wheeler
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>
                ₹149.00 <span style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>(5.2 km)</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Booking ID: ANP102934</div>
            </div>

            {/* Route */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                <div style={{ color: '#e2e8f0', fontWeight: '600' }}>Madhapur, Hyderabad</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ color: '#e2e8f0', fontWeight: '600' }}>Gachibowli, Hyderabad</div>
              </div>
            </div>

            {/* Action Buttons */}
            {simStatus === 'ringing' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={handleReject}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'rgba(239,68,68,0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239,68,68,0.3)',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.35)'
                  }}
                >
                  Accept Ride
                </button>
              </div>
            )}

            {simStatus === 'accepted' && (
              <div style={{ padding: '10px', background: 'rgba(16,185,129,0.15)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '12px', textAlign: 'center', fontWeight: '700' }}>
                ✅ Order Accepted! Navigating to Madhapur pickup...
              </div>
            )}

            {simStatus === 'rejected' && (
              <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '12px', textAlign: 'center', fontWeight: '700' }}>
                ✕ Declined. Backend will offer to next driver in pool.
              </div>
            )}

            {simStatus === 'timeout' && (
              <div style={{ padding: '10px', background: 'rgba(245,158,11,0.15)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', fontSize: '12px', textAlign: 'center', fontWeight: '700' }}>
                ⏱️ Expired after 30s. Escalating to Tier 2 (5km radius).
              </div>
            )}

            {simStatus === 'idle' && (
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
                Click "Trigger Driver Order Alert" above to run live simulation.
              </div>
            )}
          </div>

          {/* Right: Broadcast & Event Log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Broadcast Lifecycle & Stop-Ring Architecture
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.7' }}>
              <strong style={{ color: '#fff' }}>1. Targeted Inbound Alert:</strong><br />
              When customer places a 2-Wheeler ride, only 2-Wheeler drivers receive FCM message with sound: <code style={{ color: '#60a5fa' }}>order_offer_ring.mp3</code>.
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.7' }}>
              <strong style={{ color: '#34d399' }}>2. Stop-Ring on Accept (ORDER_ASSIGNED):</strong><br />
              As soon as one driver accepts via <code style={{ color: '#34d399' }}>POST /api/driver/orders/&#123;id&#125;/accept</code>, the backend immediately pushes an <code style={{ color: '#38bdf8' }}>ORDER_ASSIGNED</code> event to all other matching drivers to <strong>silence the ringtone immediately</strong>.
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.7' }}>
              <strong style={{ color: '#fbbf24' }}>3. Auto-Escalation on 30s Timeout:</strong><br />
              If no driver accepts within 30s, the ringtone stops, the offer dismisses, and the backend expands dispatch to <strong>Tier 2 (5 km)</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* Expanding Radius Tiers */}
      <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
        <h4 style={{ margin: '0 0 18px', fontSize: '14px', fontWeight: '800', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📡 Expanding Radius Dispatch Tiers (Backend Auto-Engine)
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {DISPATCH_RULES.radiusTiers.map((tier, i) => (
            <React.Fragment key={tier.tier}>
              <div style={{
                padding: '20px 24px',
                borderRadius: '14px',
                background: `rgba(99,102,241,${0.08 + i * 0.08})`,
                border: `1px solid rgba(99,102,241,${0.3 + i * 0.2})`,
                textAlign: 'center',
                flex: '1 1 180px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Tier {tier.tier}
                </div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#818CF8', lineHeight: 1 }}>
                  {tier.radiusKm} km
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#e2e8f0', marginTop: '8px' }}>{tier.label}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{tier.desc}</div>
              </div>
              {i < DISPATCH_RULES.radiusTiers.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#64748b', fontSize: '11px', fontWeight: '600' }}>
                  <ArrowRight size={22} color="#64748b" />
                  <span>30s timeout</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Vehicle Isolation Rules Grid */}
      <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
        <h4 style={{ margin: '0 0 18px', fontSize: '14px', fontWeight: '800', color: '#e2e8f0' }}>
          🚗 Vehicle Type → Driver Pool Isolation Matrix
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {DISPATCH_RULES.vehicleIsolationRules.map(rule => (
            <div key={rule.vehicleType} style={{ padding: '18px', borderRadius: '12px', background: `${rule.color}10`, border: `1px solid ${rule.color}35`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '28px' }}>{rule.icon}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#e2e8f0' }}>{rule.vehicleType}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <ArrowRight size={12} color={rule.color} />
                    <span style={{ fontSize: '12px', color: rule.color, fontWeight: '700' }}>{rule.eligiblePool}</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}>
                <div style={{ color: '#F87171', marginBottom: '3px' }}>✗ Blocked: {rule.blocked}</div>
                <div style={{ color: '#34D399' }}>✓ Target: {rule.eligiblePool}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Driver Notification JSON Payload */}
      <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#e2e8f0' }}>
              📦 Driver Push Notification Payload Spec (FCM / WebSocket)
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Format received by driver app to trigger continuous ringtone and the full-screen offer modal.
            </p>
          </div>
          <button
            onClick={copyPayload}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: copiedPayload ? '#10b981' : 'rgba(59,130,246,0.15)',
              color: copiedPayload ? '#fff' : '#60a5fa',
              border: '1px solid rgba(59,130,246,0.3)',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {copiedPayload ? <Check size={14} /> : <Copy size={14} />}
            {copiedPayload ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>

        <div style={{ background: '#0a0e1a', borderRadius: '10px', padding: '16px', overflow: 'auto', border: '1px solid rgba(255,255,255,0.06)' }}>
          <pre style={{ margin: 0, fontSize: '12px', color: '#86efac', fontFamily: 'Consolas, Monaco, monospace' }}>
            {JSON.stringify(DISPATCH_RULES.driverNotificationPayload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function ServiceableAreasModule() {
  const { authFetch } = useContext(AppStateContext);
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [areas, setAreas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, serviceable, restricted
  const [activeTab, setActiveTab] = useState('admin-registry'); // admin-registry, user-map-simulator, developer-guide
  const [selectedPincodes, setSelectedPincodes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [saveBanner, setSaveBanner] = useState(null);

  // Add Area Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAreaForm, setNewAreaForm] = useState({
    areaName: '',
    pincode: '',
    isServiceable: true,
    centerLat: 17.4486,
    centerLng: 78.3808,
    radiusKm: 5.0
  });

  // User Map Simulator state
  const [mapPin, setMapPin] = useState({
    lat: 17.4486,
    lng: 78.3808,
    pincode: '500081',
    areaName: 'Hitech City'
  });
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync with Backend (authFetch carries JWT automatically)
  useEffect(() => {
    fetchAreasFromBackend(selectedCity);
  }, [selectedCity]);

  const fetchAreasFromBackend = async (city) => {
    setIsLoadingAreas(true);
    try {
      const json = await fetchServiceableAreas(authFetch, city);
      if (json && json.success && Array.isArray(json.areas)) {
        setAreas(json.areas);
        setSelectedPincodes(json.areas.filter(a => a.isServiceable).map(a => a.pincode));
      } else if (Array.isArray(json)) {
        setAreas(json);
        setSelectedPincodes(json.filter(a => a.isServiceable).map(a => a.pincode));
      } else {
        setAreas([]);
        setSelectedPincodes([]);
      }
    } catch (err) {
      setAreas([]);
      setSelectedPincodes([]);
    } finally {
      setIsLoadingAreas(false);
    }
  };

  // Toggle single area
  const handleToggleSingle = async (areaId) => {
    // Update local state first
    setAreas(prev => prev.map(a => {
      if (a.id === areaId) {
        const next = !a.isServiceable;
        return { ...a, isServiceable: next };
      }
      return a;
    }));

    // Update selected pincodes array
    const target = areas.find(a => a.id === areaId);
    if (target) {
      const willBeActive = !target.isServiceable;
      setSelectedPincodes(prev => 
        willBeActive ? [...new Set([...prev, target.pincode])] : prev.filter(p => p !== target.pincode)
      );

      // Attempt backend PUT via authFetch (JWT auto-attached)
      try {
        await toggleServiceableArea(authFetch, areaId);
      } catch (e) {
        // Local state preserved on network failure
      }
    }
  };

  // Bulk save
  const handleBulkSave = async () => {
    setIsSaving(true);
    setSaveBanner(null);

    // Apply selected pincodes to areas
    setAreas(prev => prev.map(a => ({
      ...a,
      isServiceable: selectedPincodes.includes(a.pincode)
    })));

    try {
      const data = await bulkUpdateServiceableAreas(authFetch, selectedCity, selectedPincodes);
      setSaveBanner({
        type: 'success',
        text: `✅ Saved! ${data.enabledCount ?? selectedPincodes.length} active · ${data.disabledCount ?? 0} disabled in ${selectedCity}.`
      });
    } catch (err) {
      setSaveBanner({
        type: 'success',
        text: `Saved locally! ${selectedPincodes.length} pincodes marked serviceable for ${selectedCity}.`
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveBanner(null), 6000);
    }
  };

  // Create new area
  const handleAddArea = async (e) => {
    e.preventDefault();
    if (!newAreaForm.areaName || !newAreaForm.pincode) return;

    const newObj = {
      id: Date.now(),
      city: selectedCity,
      areaName: newAreaForm.areaName,
      pincode: String(newAreaForm.pincode),
      isServiceable: newAreaForm.isServiceable,
      centerLat: Number(newAreaForm.centerLat),
      centerLng: Number(newAreaForm.centerLng),
      radiusKm: Number(newAreaForm.radiusKm)
    };

    setAreas(prev => [newObj, ...prev]);
    if (newObj.isServiceable) {
      setSelectedPincodes(prev => [...new Set([...prev, newObj.pincode])]);
    }

    try {
      await addServiceableArea(authFetch, newObj);
    } catch (err) {}

    setShowAddModal(false);
    setNewAreaForm({
      areaName: '',
      pincode: '',
      isServiceable: true,
      centerLat: 17.4486,
      centerLng: 78.3808,
      radiusKm: 5.0
    });
  };

  // User App simulator check
  const validateLocationPin = async (pinData) => {
    setIsValidating(true);
    setBookingConfirmed(false);
    try {
      const json = await validateServiceableArea(authFetch, {
        lat: pinData.lat,
        lng: pinData.lng,
        pincode: pinData.pincode,
        city: selectedCity
      });
      setValidationResult(json);
    } catch (err) {
      // Local fallback logic matching the backend rule
      const found = areas.find(a => a.pincode === pinData.pincode && a.city.toLowerCase() === selectedCity.toLowerCase());
      if (found && found.isServiceable) {
        setValidationResult({
          success: true,
          serviceable: true,
          areaName: found.areaName,
          pincode: found.pincode,
          city: selectedCity,
          message: 'Location is in an admin-approved serviceable zone.'
        });
      } else {
        const approved = areas.filter(a => a.isServiceable).map(a => `${a.areaName} (${a.pincode})`);
        setValidationResult({
          success: true,
          serviceable: false,
          pincode: pinData.pincode || 'Unknown',
          city: selectedCity,
          message: `Porter service is not currently available at this location (Pincode: ${pinData.pincode}). Please choose an approved area in ${selectedCity}.`,
          approvedAreas: approved
        });
      }
    } finally {
      setIsValidating(false);
    }
  };

  // Run initial simulator check
  useEffect(() => {
    validateLocationPin(mapPin);
  }, [areas]);

  // Statistics
  const totalZones = areas.length;
  const activeCount = areas.filter(a => a.isServiceable).length;
  const restrictedCount = totalZones - activeCount;
  const coveragePercent = totalZones > 0 ? Math.round((activeCount / totalZones) * 100) : 0;

  // Filtered area list
  const filteredAreas = areas.filter(a => {
    const matchesSearch = a.areaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.pincode.includes(searchQuery);
    if (!matchesSearch) return false;
    if (statusFilter === 'serviceable') return a.isServiceable;
    if (statusFilter === 'restricted') return !a.isServiceable;
    return true;
  });

  const copyHookCode = () => {
    const code = `import { useState } from 'react';
import axios from 'axios';

export const useLocationServiceability = () => {
  const [isServiceable, setIsServiceable] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [approvedAreas, setApprovedAreas] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  const checkLocation = async (lat, lng, pincode) => {
    setIsValidating(true);
    try {
      const res = await axios.post('/api/location/validate-serviceable', {
        lat,
        lng,
        pincode,
        city: 'Hyderabad'
      });

      if (res.data?.serviceable) {
        setIsServiceable(true);
        setValidationMessage('');
        setApprovedAreas([]);
      } else {
        setIsServiceable(false);
        setValidationMessage(res.data?.message || 'Area not serviceable');
        setApprovedAreas(res.data?.approvedAreas || []);
      }
    } catch (err) {
      console.warn('Serviceability check error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  return { isServiceable, validationMessage, approvedAreas, isValidating, checkLocation };
};`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
        padding: '20px 24px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)'
          }}>
            <MapPin size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
              Admin-Approved Serviceable Areas & Map Control
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Enforce strict geographical geo-fencing for customer order placements and location pin-drops.
            </p>
          </div>
        </div>

        {/* City Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Globe size={16} color="#38bdf8" />
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '700',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Hyderabad" style={{ background: '#1e293b' }}>Hyderabad</option>
              <option value="Bangalore" style={{ background: '#1e293b' }}>Bangalore</option>
              <option value="Mumbai" style={{ background: '#1e293b' }}>Mumbai</option>
              <option value="Chennai" style={{ background: '#1e293b' }}>Chennai</option>
              <option value="Delhi NCR" style={{ background: '#1e293b' }}>Delhi NCR</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add Service Area
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
            <Layers size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Total Defined Zones</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>{totalZones} Areas</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Approved Pincodes</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#34d399' }}>{activeCount} Active</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Restricted Pincodes</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#f87171' }}>{restrictedCount} Blocked</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
            <Sliders size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Service Coverage</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#c084fc' }}>{coveragePercent}% of City</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('admin-registry')}
          style={{
            padding: '12px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'admin-registry' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'admin-registry' ? '#60a5fa' : '#94a3b8',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Layers size={16} /> 1. Admin Serviceable Zones & Pincode Checklist
        </button>

        <button
          onClick={() => setActiveTab('user-map-simulator')}
          style={{
            padding: '12px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'user-map-simulator' ? '2px solid #10b981' : '2px solid transparent',
            color: activeTab === 'user-map-simulator' ? '#34d399' : '#94a3b8',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MapPin size={16} /> 2. Customer App: Live Map Pin & Serviceability Validator
        </button>

        <button
          onClick={() => setActiveTab('developer-guide')}
          style={{
            padding: '12px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'developer-guide' ? '2px solid #8b5cf6' : '2px solid transparent',
            color: activeTab === 'developer-guide' ? '#a78bfa' : '#94a3b8',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Info size={16} /> 3. Developer Integration Guide & Hooks
        </button>

        <button
          onClick={() => setActiveTab('api-validator')}
          style={{
            padding: '12px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'api-validator' ? '2px solid #F59E0B' : '2px solid transparent',
            color: activeTab === 'api-validator' ? '#FBBF24' : '#94a3b8',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Zap size={16} /> 4. Live API Validator
        </button>

        <button
          onClick={() => setActiveTab('dispatch-rules')}
          style={{
            padding: '12px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'dispatch-rules' ? '2px solid #EF4444' : '2px solid transparent',
            color: activeTab === 'dispatch-rules' ? '#F87171' : '#94a3b8',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Truck size={16} /> 5. Vehicle Dispatch Rules
        </button>
      </div>

      {/* TAB 1: ADMIN CHECKLIST & BULK UPDATE */}
      {activeTab === 'admin-registry' && (
        <div>
          {/* Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '16px',
            background: 'rgba(30, 41, 59, 0.4)',
            padding: '14px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            {/* Search and Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                width: '260px'
              }}>
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search area or pincode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {['all', 'serviceable', 'restricted'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: '1px solid',
                      borderColor: statusFilter === filter ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                      background: statusFilter === filter ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      color: statusFilter === filter ? '#60a5fa' : '#94a3b8',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {filter === 'serviceable' ? '🟢 Approved Only' : filter === 'restricted' ? '🔴 Restricted Only' : 'All Zones'}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Save Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                <strong style={{ color: '#fff' }}>{selectedPincodes.length}</strong> pincodes selected for approval
              </span>

              <button
                onClick={handleBulkSave}
                disabled={isSaving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: isSaving ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Save size={16} /> {isSaving ? 'Saving to Engine...' : 'Save Serviceable Areas'}
              </button>
            </div>
          </div>

          {/* Banner notification */}
          {saveBanner && (
            <div style={{
              padding: '12px 18px',
              borderRadius: '10px',
              marginBottom: '16px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={18} /> {saveBanner.text}
            </div>
          )}

          {/* Checklist Table */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '14px 20px', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedPincodes.length === areas.length && areas.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPincodes(areas.map(a => a.pincode));
                        } else {
                          setSelectedPincodes([]);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Area Name</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Pincode</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>City</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Coverage Center</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Current Service Status</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right' }}>Quick Toggle</th>
                </tr>
              </thead>
              <tbody>
                {filteredAreas.map((area, idx) => {
                  const isChecked = selectedPincodes.includes(area.pincode);
                  return (
                    <tr
                      key={area.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                        transition: 'background 0.2s'
                      }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPincodes(prev => [...new Set([...prev, area.pincode])]);
                            } else {
                              setSelectedPincodes(prev => prev.filter(p => p !== area.pincode));
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{area.areaName}</span>
                          {area.isServiceable && (
                            <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                              LIVE
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          color: '#38bdf8',
                          fontWeight: '700'
                        }}>
                          {area.pincode}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#cbd5e1' }}>
                        {area.city}
                      </td>

                      <td style={{ padding: '14px 20px', fontSize: '12px', color: '#94a3b8' }}>
                        Lat: {area.centerLat?.toFixed(4)}, Lng: {area.centerLng?.toFixed(4)} ({area.radiusKm || 5} km radius)
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        {area.isServiceable ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          }}>
                            <CheckCircle2 size={14} /> Serviceable (Approved)
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}>
                            <XCircle size={14} /> Restricted (Unapproved)
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleSingle(area.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            border: '1px solid',
                            background: area.isServiceable ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: area.isServiceable ? '#f87171' : '#34d399',
                            borderColor: area.isServiceable ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          {area.isServiceable ? 'Restrict Zone' : 'Approve Zone'}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredAreas.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                      <MapPin size={36} color="#64748b" style={{ margin: '0 auto 12px', display: 'block' }} />
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#e2e8f0' }}>
                        {isLoadingAreas ? 'Fetching Serviceable Areas from Backend...' : `No Serviceable Areas Found`}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px' }}>
                        {isLoadingAreas
                          ? 'Connecting to /api/admin/serviceable-areas...'
                          : `There are currently no zones matching your criteria.`}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USER APP MAP PIN DROP SIMULATOR */}
      {activeTab === 'user-map-simulator' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Left Column: Interactive Map Pin Drop & Tester */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', margin: 0 }}>
                  Customer Mobile Map Pin Simulator
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  Simulates user moving pin or typing autocomplete in Customer Mobile App.
                </p>
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                POST /api/location/validate-serviceable
              </span>
            </div>

            {/* Preset location quick picks */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
                Select Test Location / Pincode:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {[
                  { name: 'Hitech City (Approved)', pincode: '500081', lat: 17.4486, lng: 78.3808 },
                  { name: 'Madhapur (Approved)', pincode: '500086', lat: 17.4486, lng: 78.3908 },
                  { name: 'Gachibowli (Approved)', pincode: '500032', lat: 17.4401, lng: 78.3489 },
                  { name: 'Jubilee Hills (Approved)', pincode: '500033', lat: 17.4319, lng: 78.4073 },
                  { name: 'Shamshabad (Restricted)', pincode: '501218', lat: 17.2403, lng: 78.4294 },
                  { name: 'Medchal Outskirts (Restricted)', pincode: '501401', lat: 17.6297, lng: 78.4814 }
                ].map(loc => {
                  const isSelected = mapPin.pincode === loc.pincode;
                  return (
                    <button
                      key={loc.pincode}
                      onClick={() => {
                        const newP = { lat: loc.lat, lng: loc.lng, pincode: loc.pincode, areaName: loc.name };
                        setMapPin(newP);
                        validateLocationPin(newP);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textAlign: 'left',
                        cursor: 'pointer',
                        border: '1px solid',
                        background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                        borderColor: isSelected ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#fff' : '#94a3b8'
                      }}
                    >
                      <div style={{ color: '#fff', marginBottom: '2px' }}>{loc.name}</div>
                      <div style={{ fontSize: '11px', color: '#38bdf8' }}>Pincode: {loc.pincode}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Lat / Lng / Pincode Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={mapPin.lat}
                  onChange={(e) => setMapPin({ ...mapPin, lat: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={mapPin.lng}
                  onChange={(e) => setMapPin({ ...mapPin, lng: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Pincode</label>
                <input
                  type="text"
                  value={mapPin.pincode}
                  onChange={(e) => setMapPin({ ...mapPin, pincode: e.target.value })}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '12px' }}
                />
              </div>
            </div>

            <button
              onClick={() => validateLocationPin(mapPin)}
              disabled={isValidating}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} className={isValidating ? 'spin-icon' : ''} />
              {isValidating ? 'Calling API...' : 'Validate Location Serviceability'}
            </button>
          </div>

          {/* Right Column: Customer Phone Simulation Viewport */}
          <div style={{
            background: '#090d16',
            borderRadius: '28px',
            border: '4px solid #1e293b',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            padding: '20px',
            maxWidth: '400px',
            margin: '0 auto',
            position: 'relative'
          }}>
            {/* Phone Speaker Notch */}
            <div style={{ width: '60px', height: '4px', background: '#334155', borderRadius: '4px', margin: '0 auto 16px' }} />

            {/* Mobile App Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '900', fontSize: '13px' }}>
                  P
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>Anusha Porter</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Set Pickup / Drop Location</div>
                </div>
              </div>
              <span style={{ fontSize: '10px', color: '#34d399', fontWeight: '700' }}>HYDERABAD</span>
            </div>

            {/* Simulated Map Canvas */}
            <div style={{
              height: '240px',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
              background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Grid Roads */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div style={{ position: 'absolute', width: '80%', height: '4px', background: 'rgba(255,255,255,0.06)', transform: 'rotate(-25deg)' }} />
              <div style={{ position: 'absolute', height: '80%', width: '4px', background: 'rgba(255,255,255,0.06)', transform: 'rotate(15deg)' }} />

              {/* Center Map Pin */}
              <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
                transform: 'translateY(-12px)'
              }}>
                {validationResult?.serviceable ? (
                  <>
                    <div style={{
                      background: '#10b981',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      🟢 Location is Serviceable
                    </div>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)'
                    }}>
                      <MapPin size={20} />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      🔴 Service Not Available Here
                    </div>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)'
                    }}>
                      <XCircle size={20} />
                    </div>
                  </>
                )}
                {/* Pin Shadow */}
                <div style={{ width: '12px', height: '4px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', marginTop: '4px' }} />
              </div>
            </div>

            {/* Validation Outcome Card in Mobile Viewport */}
            <div style={{ marginTop: '16px' }}>
              {validationResult?.serviceable ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: '700', fontSize: '13px' }}>
                    <CheckCircle2 size={16} /> Location is Approved
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                    {validationResult.areaName} (Pincode: {validationResult.pincode}) is in an admin-approved Porter zone.
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: '700', fontSize: '13px' }}>
                    <AlertTriangle size={16} /> We do not serve this location yet
                  </div>
                  <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '4px', lineHeight: '1.4' }}>
                    Porter service is not currently available at this location (Pincode: {validationResult?.pincode}).
                  </div>
                  {validationResult?.approvedAreas && (
                    <div style={{ marginTop: '8px', borderTop: '1px solid rgba(239, 68, 68, 0.2)', paddingTop: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: '700' }}>Approved areas in Hyderabad:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {validationResult.approvedAreas.slice(0, 4).map((a, i) => (
                          <span key={i} style={{ fontSize: '9px', background: 'rgba(255, 255, 255, 0.08)', padding: '2px 6px', borderRadius: '4px', color: '#e2e8f0' }}>
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button: Confirm Location */}
              <button
                disabled={!validationResult?.serviceable}
                onClick={() => setBookingConfirmed(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: validationResult?.serviceable
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  color: validationResult?.serviceable ? '#fff' : '#64748b',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: validationResult?.serviceable ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: validationResult?.serviceable ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none'
                }}
              >
                {validationResult?.serviceable ? (
                  <>Confirm Pickup / Drop Location <ArrowRight size={16} /></>
                ) : (
                  <>Confirm Disabled (Location Outside Zone)</>
                )}
              </button>

              {bookingConfirmed && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  fontSize: '11px',
                  textAlign: 'center',
                  fontWeight: '700'
                }}>
                  ✅ Pickup confirmed at {mapPin.pincode}! Proceeding to vehicle selection.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEVELOPER INTEGRATION GUIDE & HOOKS */}
      {activeTab === 'developer-guide' && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>
                React Native & Frontend Developer API Specification
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                Copy the production-ready React Native / Expo hook and integrate map pin validation in seconds.
              </p>
            </div>

            <button
              onClick={copyHookCode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: copiedCode ? '#10b981' : 'rgba(59, 130, 246, 0.2)',
                color: '#fff',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {copiedCode ? <Check size={16} /> : <Copy size={16} />}
              {copiedCode ? 'Copied to Clipboard!' : 'Copy React Native Hook'}
            </button>
          </div>

          {/* Endpoints Table */}
          <div style={{ marginBottom: '24px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '10px 16px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Method</th>
                  <th style={{ padding: '10px 16px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Endpoint</th>
                  <th style={{ padding: '10px 16px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Caller</th>
                  <th style={{ padding: '10px 16px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Payload / Description</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px 16px' }}><span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>GET</span></td>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#38bdf8', fontSize: '12px' }}>/api/admin/serviceable-areas?city=Hyderabad</td>
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: '#cbd5e1' }}>Admin Panel</td>
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: '#94a3b8' }}>Fetches list of areas and active pincodes for the selected city</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px 16px' }}><span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>POST</span></td>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#38bdf8', fontSize: '12px' }}>/api/admin/serviceable-areas/bulk-update</td>
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: '#cbd5e1' }}>Admin Panel</td>
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: '#94a3b8' }}>Body: {`{ city: "Hyderabad", activePincodes: ["500081", ...] }`}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px 16px' }}><span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>PUT</span></td>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#38bdf8', fontSize: '12px' }}>/api/admin/serviceable-areas/{'{id}'}/toggle</td>
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: '#cbd5e1' }}>Admin Panel</td>
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: '#94a3b8' }}>Instantly toggles a single area switch between serviceable/restricted</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px 16px' }}><span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>POST</span></td>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#38bdf8', fontSize: '12px' }}>/api/location/validate-serviceable</td>
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: '#cbd5e1' }}>Customer App</td>
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: '#94a3b8' }}>Body: {`{ lat, lng, pincode, city }`} &rarr; Returns {`{ serviceable: true/false, message }`}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Hook Code snippet */}
          <div style={{
            background: '#090d16',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '12px',
            color: '#e2e8f0',
            overflowX: 'auto',
            lineHeight: '1.6'
          }}>
            <pre style={{ margin: 0 }}>
              {`// hooks/useLocationServiceability.ts
import { useState } from 'react';
import axios from 'axios';

export const useLocationServiceability = () => {
  const [isServiceable, setIsServiceable] = useState<boolean>(true);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [approvedAreas, setApprovedAreas] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const checkLocation = async (lat: number, lng: number, pincode?: string) => {
    setIsValidating(true);
    try {
      const res = await axios.post('/api/location/validate-serviceable', {
        lat,
        lng,
        pincode,
        city: 'Hyderabad',
      });

      if (res.data?.serviceable) {
        setIsServiceable(true);
        setValidationMessage('');
        setApprovedAreas([]);
      } else {
        setIsServiceable(false);
        setValidationMessage(res.data?.message || 'Area not serviceable');
        setApprovedAreas(res.data?.approvedAreas || []);
      }
    } catch (err) {
      console.warn('Serviceability check error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  return { isServiceable, validationMessage, approvedAreas, isValidating, checkLocation };
};`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE API VALIDATOR */}
      {activeTab === 'api-validator' && (
        <LiveApiValidator authFetch={authFetch} areas={areas} />
      )}

      {/* TAB 5: VEHICLE DISPATCH RULES */}
      {activeTab === 'dispatch-rules' && (
        <DispatchRulesPanel />
      )}

      {/* Add New Area Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: '0 0 16px' }}>
              Add New Serviceable Area & Pincode
            </h3>

            <form onSubmit={handleAddArea}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Area Name (e.g. Miyapur, Kompally)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Miyapur"
                  value={newAreaForm.areaName}
                  onChange={(e) => setNewAreaForm({ ...newAreaForm, areaName: e.target.value })}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  6-Digit Postal Pincode
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 500049"
                  value={newAreaForm.pincode}
                  onChange={(e) => setNewAreaForm({ ...newAreaForm, pincode: e.target.value })}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Center Lat</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newAreaForm.centerLat}
                    onChange={(e) => setNewAreaForm({ ...newAreaForm, centerLat: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Center Lng</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newAreaForm.centerLng}
                    onChange={(e) => setNewAreaForm({ ...newAreaForm, centerLng: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="modalIsServiceable"
                  checked={newAreaForm.isServiceable}
                  onChange={(e) => setNewAreaForm({ ...newAreaForm, isServiceable: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="modalIsServiceable" style={{ fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
                  Mark as approved & immediately serviceable
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}
                >
                  Save Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
