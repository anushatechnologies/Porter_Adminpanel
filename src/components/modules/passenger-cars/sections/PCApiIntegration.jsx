import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  Zap, Car, MapPin, DollarSign, CheckCircle2, Navigation, Star,
  ChevronDown, ChevronRight, Send, RefreshCw, Clock, Phone, Copy,
  AlertTriangle, XCircle, ShieldCheck, Info, Play, StopCircle
} from 'lucide-react';
import { AppStateContext } from '../../../../context/AppState';
import {
  getPassengerCategories,
  getPassengerFareEstimate,
  createPassengerBooking,
  getPassengerBookingStatus,
  cancelPassengerBooking,
  submitPassengerReview
} from '../../../../services/passengerApi';

// ── Helpers ──────────────────────────────────────────────────────
const METHOD_COLORS = { GET: '#10B981', POST: '#3B82F6', PUT: '#F59E0B', DELETE: '#EF4444' };

function EndpointBadge({ method, path }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
      <span style={{
        backgroundColor: METHOD_COLORS[method] || '#6B7280',
        color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: '800', fontSize: '11px'
      }}>{method}</span>
      <span style={{ color: 'var(--text-muted)' }}>{path}</span>
    </div>
  );
}

function ResponseViewer({ data, error, loading }) {
  if (loading) return (
    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
      <div style={{ width: '20px', height: '20px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
      Calling API…
    </div>
  );
  if (error) return (
    <div style={{ padding: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#B91C1C', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      ❌ {error}
    </div>
  );
  if (!data) return null;
  return (
    <div style={{ backgroundColor: '#0F172A', borderRadius: '8px', padding: '14px', overflow: 'auto', maxHeight: '320px' }}>
      <pre style={{ margin: 0, fontSize: '11px', color: '#86EFAC', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function StepCard({ step, icon: Icon, color, title, subtitle, endpointMethod, endpointPath, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left'
        }}
      >
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
              Step {step}: {title}
            </span>
            <EndpointBadge method={endpointMethod} path={endpointPath} />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</div>
        </div>
        {open ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
      </button>
      {open && <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-color)' }}>{children}</div>}
    </div>
  );
}

// ── Step 1: Categories ────────────────────────────────────────────
function Step1Categories() {
  const { authFetch } = useContext(AppStateContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const call = async () => {
    setLoading(true); setError(null);
    try { setData(await getPassengerCategories(authFetch)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Called on screen mount to populate the vehicle category carousel (Hatchback, Sedan, SUV, EV Cab, Auto). Store the <code style={{ backgroundColor: 'var(--bg-main)', padding: '1px 5px', borderRadius: '4px' }}>code</code> field to use in fare estimate requests.
      </p>
      <button onClick={call} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
        <Send size={13} /> Send Request
      </button>
      <ResponseViewer data={data} error={error} loading={loading} />
      {data?.data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginTop: '8px' }}>
          {data.data.map(cat => (
            <div key={cat.id} style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '10px', backgroundColor: 'var(--bg-main)' }}>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>{cat.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0' }}>{cat.description}</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#10B981' }}>₹{cat.basePrice} base + ₹{cat.perKmRate}/km</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>👥 {cat.passengerCapacity} pax · 🧳 {cat.luggageCapacity} bags</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 2: Fare Estimate ─────────────────────────────────────────
function Step2FareEstimate({ onFareToken }) {
  const { authFetch } = useContext(AppStateContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [tokenSecondsLeft, setTokenSecondsLeft] = useState(null);
  const timerRef = useRef(null);

  const [form, setForm] = useState({
    serviceType: 'ONE_WAY',
    vehicleCategoryCode: 'SEDAN',
    pickupAddress: 'Koramangala 4th Block, Bangalore',
    dropAddress: 'Indiranagar 100ft Road, Bangalore',
    pickupLatitude: 12.9352, pickupLongitude: 77.6245,
    dropLatitude: 12.9784, dropLongitude: 77.6408,
    passengerCount: 2, luggageCount: 1,
    couponCode: 'WELCOME100', stops: []
  });

  const startTokenTimer = (expiresAt) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
      setTokenSecondsLeft(diff);
      if (diff === 0) clearInterval(timerRef.current);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  };

  const call = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getPassengerFareEstimate(authFetch, form);
      setData(res);
      if (res.fareToken) {
        onFareToken && onFareToken(res.fareToken);
        startTokenTimer(res.tokenExpiresAt);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const F = ({ label, k, type = 'text' }) => (
    <div>
      <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>{label}</label>
      <input type={type} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Returns a <strong>fareToken</strong> that locks the estimated price for <strong>10 minutes</strong>. Store this token and pass it to the booking creation step.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Service Type</label>
          <select value={form.serviceType} onChange={e => setForm(p => ({ ...p, serviceType: e.target.value }))}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            {['ONE_WAY', 'ROUND_TRIP', 'RENTAL'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Vehicle Category</label>
          <select value={form.vehicleCategoryCode} onChange={e => setForm(p => ({ ...p, vehicleCategoryCode: e.target.value }))}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            {['HATCHBACK', 'SEDAN', 'SUV', 'EV_CAB', 'AUTO'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <F label="Pickup Address" k="pickupAddress" />
        <F label="Drop Address" k="dropAddress" />
        <F label="Pickup Lat" k="pickupLatitude" type="number" />
        <F label="Pickup Lng" k="pickupLongitude" type="number" />
        <F label="Drop Lat" k="dropLatitude" type="number" />
        <F label="Drop Lng" k="dropLongitude" type="number" />
        <F label="Passengers" k="passengerCount" type="number" />
        <F label="Luggage Bags" k="luggageCount" type="number" />
        <F label="Coupon Code" k="couponCode" />
      </div>

      <button onClick={call} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
        <Send size={13} /> Calculate Fare
      </button>

      <ResponseViewer data={data} error={error} loading={loading} />

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* Fare Token Lock */}
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: tokenSecondsLeft > 0 ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${tokenSecondsLeft > 0 ? '#BBF7D0' : '#FCA5A5'}` }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: tokenSecondsLeft > 0 ? '#15803D' : '#B91C1C', marginBottom: '6px' }}>
              🔐 FARE TOKEN {tokenSecondsLeft > 0 ? 'LOCKED' : 'EXPIRED'}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all', marginBottom: '6px' }}>{data.fareToken}</div>
            {tokenSecondsLeft !== null && (
              <div style={{ fontSize: '13px', fontWeight: '800', color: tokenSecondsLeft > 60 ? '#15803D' : '#D97706' }}>
                ⏱ {Math.floor(tokenSecondsLeft / 60)}m {tokenSecondsLeft % 60}s remaining
              </div>
            )}
          </div>

          {/* Breakdown Table */}
          <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '10px' }}>📊 FARE BREAKDOWN</div>
            {data.breakdown && Object.entries(data.breakdown).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0', borderBottom: k === 'discount' ? '1px solid var(--border-color)' : 'none', fontWeight: k === 'totalFare' ? '800' : '400', color: k === 'totalFare' ? '#10B981' : k === 'discount' ? '#EF4444' : 'var(--text-main)' }}>
                <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                <span>₹{Number(v).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
              📍 {data.distanceKm} km · ⏱ {data.durationMinutes} min
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Create Booking ────────────────────────────────────────
function Step3CreateBooking({ fareToken, onBookingCreated }) {
  const { authFetch } = useContext(AppStateContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    fareToken: fareToken || 'ft_991823a8f17c4b',
    serviceType: 'ONE_WAY',
    vehicleCategoryCode: 'SEDAN',
    pickupAddress: 'Koramangala 4th Block, Bangalore',
    dropAddress: 'Indiranagar 100ft Road, Bangalore',
    pickupLatitude: 12.9352, pickupLongitude: 77.6245,
    dropLatitude: 12.9784, dropLongitude: 77.6408,
    passengerName: 'Anusha R',
    passengerPhone: '+919876543210',
    passengerCount: 2, luggageCount: 1,
    paymentMode: 'CASH', stops: []
  });

  useEffect(() => { if (fareToken) setForm(p => ({ ...p, fareToken })); }, [fareToken]);

  const call = async () => {
    setLoading(true); setError(null);
    try {
      const res = await createPassengerBooking(authFetch, form);
      setData(res);
      onBookingCreated && onBookingCreated(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Creates the booking. Returns a <strong>4-digit startOtp</strong> — show this prominently to the passenger so they can share it with the driver before trip start.
      </p>
      {fareToken && (
        <div style={{ padding: '8px 12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '11px', color: '#1D4ED8' }}>
          🔐 Using fareToken from Step 2: <code style={{ fontFamily: 'monospace' }}>{fareToken}</code>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        {[['Fare Token', 'fareToken'], ['Passenger Name', 'passengerName'], ['Phone', 'passengerPhone']].map(([lbl, k]) => (
          <div key={k}>
            <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>{lbl}</label>
            <input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
              style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
          </div>
        ))}
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Payment Mode</label>
          <select value={form.paymentMode} onChange={e => setForm(p => ({ ...p, paymentMode: e.target.value }))}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            {['CASH', 'UPI', 'CARD', 'WALLET'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <button onClick={call} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
        <Send size={13} /> Confirm Booking
      </button>
      <ResponseViewer data={data} error={error} loading={loading} />

      {data?.startOtp && (
        <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1E293B', border: '2px solid #3B82F6', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '6px', letterSpacing: '2px' }}>SHARE WITH DRIVER</div>
          <div style={{ fontSize: '42px', fontWeight: '900', color: '#60A5FA', letterSpacing: '12px', fontFamily: 'monospace' }}>
            {data.startOtp}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>4-digit Start OTP • PIN: {data.startOtp}</div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#94A3B8' }}>
            Booking: <span style={{ fontFamily: 'monospace', color: '#60A5FA' }}>{data.bookingNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 4: Live Tracking ─────────────────────────────────────────
const STATUS_CONFIG = {
  DRIVER_SEARCHING: { color: '#F59E0B', label: '🔍 Searching for drivers…', bg: '#FEF3C7' },
  DRIVER_ASSIGNED: { color: '#3B82F6', label: '✅ Driver assigned', bg: '#EFF6FF' },
  DRIVER_ARRIVED: { color: '#8B5CF6', label: '📍 Driver arrived at pickup', bg: '#F5F3FF' },
  IN_TRIP: { color: '#10B981', label: '🚗 Trip in progress', bg: '#F0FDF4' },
  COMPLETED: { color: '#065F46', label: '✔️ Trip completed', bg: '#D1FAE5' },
  CANCELLED: { color: '#B91C1C', label: '❌ Cancelled', bg: '#FEE2E2' },
};

function Step4LiveTracking({ bookingId: initialId }) {
  const { authFetch } = useContext(AppStateContext);
  const [bookingId, setBookingId] = useState(initialId || '102');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef(null);

  const call = async (id) => {
    setLoading(true); setError(null);
    try { setData(await getPassengerBookingStatus(authFetch, id || bookingId)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const togglePolling = () => {
    if (polling) {
      clearInterval(pollRef.current);
      setPolling(false);
    } else {
      call(bookingId);
      pollRef.current = setInterval(() => call(bookingId), 7000);
      setPolling(true);
    }
  };

  useEffect(() => { if (initialId) { setBookingId(initialId); } }, [initialId]);
  useEffect(() => () => clearInterval(pollRef.current), []);

  const booking = data?.booking;
  const statusCfg = booking ? (STATUS_CONFIG[booking.status] || { color: '#6B7280', label: booking.status, bg: '#F3F4F6' }) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Poll every 5–10 seconds (or use WebSocket) to get live driver location and booking lifecycle status.
      </p>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Booking ID / bookingNumber / trackingNumber</label>
          <input value={bookingId} onChange={e => setBookingId(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <button onClick={() => call(bookingId)} className="btn btn-secondary" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Send size={13} /> Fetch Once
        </button>
        <button onClick={togglePolling} className={`btn ${polling ? 'btn-danger' : 'btn-primary'}`} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {polling ? <><StopCircle size={13} /> Stop Polling</> : <><Play size={13} /> Start Poll (7s)</>}
        </button>
      </div>
      {polling && <div style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 1.5s ease-in-out infinite' }} /> Polling every 7 seconds…</div>}

      <ResponseViewer data={data} error={error} loading={loading} />

      {booking && statusCfg && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: statusCfg.bg, border: `1px solid ${statusCfg.color}44` }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: statusCfg.color, marginBottom: '12px' }}>
              {statusCfg.label}
            </div>
            {booking.driverName && (
              <>
                <div style={{ fontSize: '13px', fontWeight: '700' }}>{booking.driverName}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{booking.vehicleModel} · {booking.vehicleNumber}</div>
                <div style={{ fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Phone size={12} /> {booking.driverPhone}
                </div>
                {booking.etaMinutes && (
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#3B82F6', marginTop: '8px' }}>
                    ⏱ ETA: {booking.etaMinutes} min
                  </div>
                )}
              </>
            )}
          </div>
          <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-muted)' }}>LIFECYCLE STATUSES</div>
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '11px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: booking.status === status ? cfg.color : '#E2E8F0', flexShrink: 0 }} />
                <span style={{ fontWeight: booking.status === status ? '700' : '400', color: booking.status === status ? cfg.color : 'var(--text-muted)' }}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 5: Cancel ────────────────────────────────────────────────
function Step5Cancel({ bookingId: initId }) {
  const { authFetch } = useContext(AppStateContext);
  const [bookingId, setBookingId] = useState(initId || '102');
  const [reason, setReason] = useState('Driver delayed / taking too long');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const call = async () => {
    setLoading(true); setError(null);
    try { setData(await cancelPassengerBooking(authFetch, bookingId, { reason, cancelledBy: 'CUSTOMER' })); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Customer-initiated cancellation. Returns <code>cancellationFee</code> (₹0 in free window, ₹100 after driver arrival).
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Booking ID</label>
          <input value={bookingId} onChange={e => setBookingId(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Cancellation Reason</label>
          <input value={reason} onChange={e => setReason(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
      </div>
      <button onClick={call} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#EF4444', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
        <XCircle size={13} /> Cancel Booking
      </button>
      <ResponseViewer data={data} error={error} loading={loading} />
      {data?.success && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '13px', color: '#15803D', fontWeight: '600' }}>
          ✅ {data.message} — Cancellation fee: ₹{data.cancellationFee ?? 0}
        </div>
      )}
    </div>
  );
}

// ── Step 6: Review ────────────────────────────────────────────────
function Step6Review({ bookingId: initId }) {
  const { authFetch } = useContext(AppStateContext);
  const [bookingId, setBookingId] = useState(initId || '102');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('Clean car and very polite driver!');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const call = async () => {
    setLoading(true); setError(null);
    try { setData(await submitPassengerReview(authFetch, bookingId, { rating, feedback })); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Post-ride rating and feedback. Called after <code>COMPLETED</code> status is detected.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', alignItems: 'start' }}>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Booking ID</label>
          <input value={bookingId} onChange={e => setBookingId(e.target.value)}
            style={{ width: '140px', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Feedback</label>
          <input value={feedback} onChange={e => setFeedback(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>Rating:</span>
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} onClick={() => setRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
            <Star size={22} fill={s <= rating ? '#FBBF24' : 'none'} color={s <= rating ? '#FBBF24' : '#D1D5DB'} />
          </button>
        ))}
        <span style={{ fontSize: '12px', fontWeight: '700' }}>{rating}/5</span>
      </div>
      <button onClick={call} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
        <Send size={13} /> Submit Review
      </button>
      <ResponseViewer data={data} error={error} loading={loading} />
      {data?.success && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '13px', color: '#15803D', fontWeight: '600' }}>
          ⭐ {data.message}
        </div>
      )}
    </div>
  );
}

// ── TypeScript Interfaces Panel ──────────────────────────────────
function TSInterfaces() {
  const [open, setOpen] = useState(false);
  const code = `// Passenger Ride Models
export interface PassengerCategory {
  id: string;
  code: 'HATCHBACK' | 'SEDAN' | 'SUV' | 'EV_CAB' | 'AUTO';
  name: string; description: string; imageUrl: string;
  passengerCapacity: number; luggageCapacity: number;
  basePrice: number; perKmRate: number;
  isActive: boolean; displayOrder: number;
}

export interface PassengerFareEstimate {
  fareToken: string; tokenExpiresAt: string;
  distanceKm: number; durationMinutes: number;
  estimatedFare: number;
  breakdown: {
    baseFare: number; distanceFare: number; timeFare: number;
    taxes: number; tollFee: number; discount: number; totalFare: number;
  };
}

export type BookingStatus =
  | 'DRIVER_SEARCHING' | 'DRIVER_ASSIGNED' | 'DRIVER_ARRIVED'
  | 'IN_TRIP' | 'COMPLETED' | 'CANCELLED';

export interface PassengerBookingResponse {
  success: boolean; id: string;
  bookingNumber: string; trackingNumber: string;
  status: BookingStatus; startOtp: string;
  booking: any;
}`;
  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', textAlign: 'left' }}>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />} TypeScript Interfaces (Frontend Reference)
      </button>
      {open && (
        <div style={{ backgroundColor: '#0F172A', padding: '14px' }}>
          <pre style={{ margin: 0, fontSize: '11px', color: '#93C5FD', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{code}</pre>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function PCApiIntegration() {
  const [fareToken, setFareToken] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  const bookingId = bookingData?.id || bookingData?.booking?.id || null;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} color="var(--primary)" />
          Flow 1 — Passengers Ride: Complete API Integration Guide
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
          Live API tester for all 6 steps of the customer ride flow. Data flows automatically between steps (fareToken, bookingId).
        </p>
      </div>

      {/* Flow diagram */}
      <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#0F172A', border: '1px solid #1E293B', fontSize: '11px', fontFamily: 'monospace', color: '#94A3B8', lineHeight: '1.8' }}>
        <span style={{ color: '#60A5FA' }}>[1: Categories]</span> → <span style={{ color: '#34D399' }}>[2: Fare Estimate + Token]</span> → <span style={{ color: '#FBBF24' }}>[3: Confirm Booking + OTP]</span> → <span style={{ color: '#A78BFA' }}>[4: Live Tracking]</span>
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span style={{ color: '#F87171' }}>(optional: [5: Cancel])</span>
        <br />
        <span style={{ color: '#34D399' }}>[6: Review]</span> ←──────────────────────────────────────────────────────
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <StepCard step={1} icon={Car} color="#3B82F6" title="Select Ride Category" subtitle="Populate vehicle carousel on screen mount" endpointMethod="GET" endpointPath="/api/passenger/categories" defaultOpen>
          <Step1Categories />
        </StepCard>

        <StepCard step={2} icon={DollarSign} color="#10B981" title="Fare Estimate & Price Lock" subtitle="Lock fare for 10 min with fareToken" endpointMethod="POST" endpointPath="/api/passenger/fare-estimate">
          <Step2FareEstimate onFareToken={setFareToken} />
        </StepCard>

        <StepCard step={3} icon={CheckCircle2} color="#F59E0B" title="Create Booking" subtitle="Confirm ride — get 4-digit startOtp" endpointMethod="POST" endpointPath="/api/passenger/bookings">
          <Step3CreateBooking fareToken={fareToken} onBookingCreated={setBookingData} />
        </StepCard>

        <StepCard step={4} icon={Navigation} color="#8B5CF6" title="Live Trip Tracking & Polling" subtitle="Poll booking status · show driver location + ETA" endpointMethod="GET" endpointPath="/api/passenger/bookings/{id}">
          <Step4LiveTracking bookingId={bookingId} />
        </StepCard>

        <StepCard step={5} icon={XCircle} color="#EF4444" title="Cancel Ride" subtitle="Customer-initiated cancellation with fee calculation" endpointMethod="POST" endpointPath="/api/passenger/bookings/{id}/cancel">
          <Step5Cancel bookingId={bookingId} />
        </StepCard>

        <StepCard step={6} icon={Star} color="#FBBF24" title="Ride Review & Rating" subtitle="Post-ride feedback and star rating" endpointMethod="POST" endpointPath="/api/passenger/bookings/{id}/review">
          <Step6Review bookingId={bookingId} />
        </StepCard>
      </div>

      <TSInterfaces />
    </div>
  );
}
