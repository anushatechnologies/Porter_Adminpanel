import React, { useState, useContext, useEffect } from 'react';
import {
  Zap, Package, Tag, Clock, Calculator, DollarSign, Navigation,
  ShieldCheck, RefreshCw, XCircle, Star, ChevronDown, ChevronRight,
  Send, CheckCircle2, Truck, Phone, MapPin, AlertTriangle
} from 'lucide-react';
import { AppStateContext } from '../../../../context/AppState';
import {
  getPackerServices,
  getPackerAddons,
  getPackerSlots,
  calculatePackersPricing,
  createPackersBooking,
  getPackersTracking,
  verifyPackersOtp,
  reschedulePackersBooking,
  cancelPackersBooking,
  submitPackersReview
} from '../../../../services/packersApi';

// ── Reusable helpers ─────────────────────────────────────────────
const METHOD_COLORS = { GET: '#10B981', POST: '#3B82F6' };

function EndpointBadge({ method, path }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace', fontSize: '11px' }}>
      <span style={{ backgroundColor: METHOD_COLORS[method] || '#6B7280', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>{method}</span>
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
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>Step {step}: {title}</span>
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

// ── Step 1: House Size Selection ─────────────────────────────────
function Step1Services({ onServiceSelect }) {
  const { authFetch } = useContext(AppStateContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const call = async () => {
    setLoading(true); setError(null);
    try { setData(await getPackerServices(authFetch)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Fetch all house-size shifting packages (1RK, 1BHK, 2BHK, 3BHK). The selected <code>id</code> is passed to slots & pricing endpoints.
      </p>
      <button onClick={call} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
        <Send size={13} /> Fetch Services
      </button>
      <ResponseViewer data={data} error={error} loading={loading} />
      {data?.services && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginTop: '4px' }}>
          {data.services.map(s => (
            <div key={s.id} onClick={() => { setSelected(s.id); onServiceSelect && onServiceSelect(s.id, s.basePrice); }}
              style={{ padding: '16px', border: `2px solid ${selected === s.id ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: '10px', cursor: 'pointer', backgroundColor: selected === s.id ? 'rgba(99,102,241,0.08)' : 'var(--bg-main)', transition: 'all 0.15s' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>{s.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{s.description}</div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#10B981', marginBottom: '8px' }}>{s.priceLabel}</div>
              <div style={{ fontSize: '11px', color: '#3B82F6' }}>⏱ {s.estimatedDuration}</div>
              <ul style={{ margin: '8px 0 0', padding: '0 0 0 14px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                {s.features?.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              {selected === s.id && <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: '700', color: 'var(--primary)' }}>✓ Selected</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 2: Addons ───────────────────────────────────────────────
function Step2Addons({ onAddonsSelect }) {
  const { authFetch } = useContext(AppStateContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);

  const toggleAddon = (id) => {
    const next = selected.includes(id) ? selected.filter(a => a !== id) : [...selected, id];
    setSelected(next);
    onAddonsSelect && onAddonsSelect(next);
  };

  const call = async () => {
    setLoading(true); setError(null);
    try { setData(await getPackerAddons(authFetch)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Multi-select addon checklist. Selected <code>id</code>s are passed to pricing calculation.
      </p>
      <button onClick={call} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
        <Send size={13} /> Fetch Addons
      </button>
      <ResponseViewer data={data} error={error} loading={loading} />
      {data?.data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.data.map(addon => {
            const isOn = selected.includes(addon.id);
            return (
              <div key={addon.id} onClick={() => toggleAddon(addon.id)}
                style={{ padding: '12px 16px', border: `1px solid ${isOn ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isOn ? 'rgba(99,102,241,0.08)' : 'var(--bg-main)', transition: 'all 0.15s' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>{addon.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{addon.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                  <div style={{ fontWeight: '800', color: '#10B981', fontSize: '13px' }}>₹{addon.price}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{addon.unit}</div>
                  {isOn && <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary)' }}>✓ Added</div>}
                </div>
              </div>
            );
          })}
          {selected.length > 0 && <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)' }}>Selected: {selected.join(', ')}</div>}
        </div>
      )}
    </div>
  );
}

// ── Step 3: Slot Picker ─────────────────────────────────────────
function Step3Slots({ serviceId: initServiceId, onSlotSelect }) {
  const { authFetch } = useContext(AppStateContext);
  const [serviceId, setServiceId] = useState(initServiceId || 'pm-1bhk');
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => { if (initServiceId) setServiceId(initServiceId); }, [initServiceId]);

  const call = async () => {
    setLoading(true); setError(null);
    try { setData(await getPackerSlots(authFetch, serviceId, date)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Service ID</label>
          <select value={serviceId} onChange={e => setServiceId(e.target.value)}
            style={{ padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            {['pm-1rk', 'pm-1bhk', 'pm-2bhk', 'pm-3bhk'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <button onClick={call} className="btn btn-primary" style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
          <Send size={13} /> Fetch Slots
        </button>
      </div>
      <ResponseViewer data={data} error={error} loading={loading} />
      {data?.slots && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {data.slots.map(slot => (
            <div key={slot.id} onClick={() => { if (!slot.isAvailable) return; setSelected(slot.id); onSlotSelect && onSlotSelect(slot.slot); }}
              style={{ padding: '14px', border: `1px solid ${selected === slot.id ? 'var(--primary)' : slot.isAvailable ? 'var(--border-color)' : '#FCA5A5'}`, borderRadius: '8px', cursor: slot.isAvailable ? 'pointer' : 'not-allowed', opacity: slot.isAvailable ? 1 : 0.5, backgroundColor: selected === slot.id ? 'rgba(99,102,241,0.08)' : 'var(--bg-main)', transition: 'all 0.15s' }}>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>{slot.time}</div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                {slot.isAvailable ? <span style={{ color: '#10B981' }}>✓ Available</span> : <span style={{ color: '#EF4444' }}>✗ Booked</span>}
                {slot.surgeFee > 0 && <span style={{ color: '#F59E0B', marginLeft: '6px' }}>+₹{slot.surgeFee} surge</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 4: Pricing Breakdown ───────────────────────────────────
function Step4Pricing({ serviceId: initServiceId, addonIds: initAddons, onPricing }) {
  const { authFetch } = useContext(AppStateContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    serviceId: initServiceId || 'pm-1bhk',
    distanceKm: 14.5,
    pickupFloor: 3, dropFloor: 2,
    hasPickupLift: false, hasDropLift: true,
    addonIds: initAddons || ['addon-bubble-wrap', 'addon-dismantle-bed'],
    couponCode: 'SHIFT10'
  });

  useEffect(() => { if (initServiceId) setForm(p => ({ ...p, serviceId: initServiceId })); }, [initServiceId]);
  useEffect(() => { if (initAddons?.length) setForm(p => ({ ...p, addonIds: initAddons })); }, [initAddons?.join(',')]);

  const call = async () => {
    setLoading(true); setError(null);
    try { const res = await calculatePackersPricing(authFetch, form); setData(res); onPricing && onPricing(res.pricing); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Floor charge rule: ₹200 per floor when <code>hasLift = false</code>. Floor 3 without lift = 3 × ₹200 = ₹600.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Service ID</label>
          <select value={form.serviceId} onChange={e => setForm(p => ({ ...p, serviceId: e.target.value }))}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            {['pm-1rk', 'pm-1bhk', 'pm-2bhk', 'pm-3bhk'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        {[['Distance (km)', 'distanceKm', 'number'], ['Pickup Floor', 'pickupFloor', 'number'], ['Drop Floor', 'dropFloor', 'number'], ['Coupon Code', 'couponCode', 'text']].map(([lbl, k, t]) => (
          <div key={k}>
            <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>{lbl}</label>
            <input type={t} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: t === 'number' ? Number(e.target.value) : e.target.value }))}
              style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
          </div>
        ))}
        {[['Pickup Has Lift', 'hasPickupLift'], ['Drop Has Lift', 'hasDropLift']].map(([lbl, k]) => (
          <div key={k} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>{lbl}</label>
            <button onClick={() => setForm(p => ({ ...p, [k]: !p[k] }))}
              style={{ padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: form[k] ? '#DCFCE7' : 'var(--bg-main)', color: form[k] ? '#166534' : 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}>
              {form[k] ? '✓ Yes' : '✗ No'}
            </button>
          </div>
        ))}
      </div>
      <button onClick={call} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
        <Send size={13} /> Calculate Pricing
      </button>
      <ResponseViewer data={data} error={error} loading={loading} />
      {data?.pricing && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '10px' }}>📊 PRICING BREAKDOWN</div>
            {[['Base Price', 'basePrice'], ['Distance Charge', 'distanceCharge'], ['Floor Charge', 'floorCharge'], ['Addons Total', 'addonsTotal'], ['Subtotal', 'subtotal'], ['Discount', 'discount'], ['GST (18%)', 'gst']].map(([lbl, k]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0', borderBottom: k === 'gst' ? '1px solid var(--border-color)' : 'none', color: k === 'discount' ? '#EF4444' : 'var(--text-main)' }}>
                <span>{lbl}</span><span style={{ fontWeight: '600' }}>₹{Number(data.pricing[k] || 0).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', color: '#10B981', marginTop: '6px' }}>
              <span>TOTAL</span><span>₹{data.pricing.totalPrice?.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#1D4ED8', marginBottom: '4px' }}>💳 ADVANCE PAYABLE NOW</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#1D4ED8' }}>₹{data.pricing.advancePayable?.toFixed(2)}</div>
              <div style={{ fontSize: '11px', color: '#3B82F6', marginTop: '4px' }}>Pay via Razorpay / UPI to confirm slot</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>🚛 REMAINING ON DELIVERY</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#92400E' }}>₹{data.pricing.remainingPayable?.toFixed(2)}</div>
              <div style={{ fontSize: '11px', color: '#B45309', marginTop: '4px' }}>Pay to shifting supervisor after move</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 5: Confirm Booking ─────────────────────────────────────
function Step5Confirm({ serviceId: initId, pricing: initPricing, selectedSlot, onBookingCreated }) {
  const { authFetch } = useContext(AppStateContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    serviceId: initId || 'pm-1bhk',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    scheduledSlot: selectedSlot || '08:00 AM – 10:00 AM',
    pickup: { address: 'Flat 302, Green Glen Layout, Bellandur, Bangalore', latitude: 12.9260, longitude: 77.6762, floor: 3, hasLift: false },
    drop: { address: 'Villa 14, Prestige Silver Oak, Whitefield, Bangalore', latitude: 12.9698, longitude: 77.7499, floor: 1, hasLift: true },
    selectedAddons: ['addon-bubble-wrap', 'addon-dismantle-bed'],
    pricing: initPricing || { basePrice: 5499, distanceCharge: 362.50, floorCharge: 600, addonsTotal: 1300, gst: 1307.07, discount: 500, totalAmount: 8568.57, advancePaid: 500, remainingAmount: 8068.57 },
    payment: { method: 'UPI', advanceAmount: 500, transactionId: `pay_${Date.now()}` }
  });

  const call = async () => {
    setLoading(true); setError(null);
    try { const res = await createPackersBooking(authFetch, form); setData(res); onBookingCreated && onBookingCreated(res.bookingId); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Pay ₹500 advance to lock the slot. Returns a <strong>bookingId</strong> used for all subsequent tracking, OTP and review calls.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Scheduled Date</label>
          <input type="date" value={form.scheduledDate} onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Scheduled Slot</label>
          <input value={form.scheduledSlot} onChange={e => setForm(p => ({ ...p, scheduledSlot: e.target.value }))}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Payment Method</label>
          <select value={form.payment.method} onChange={e => setForm(p => ({ ...p, payment: { ...p.payment, method: e.target.value } }))}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            {['UPI', 'CARD', 'NET_BANKING', 'WALLET'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <button onClick={call} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
        <Send size={13} /> Confirm & Pay ₹500 Advance
      </button>
      <ResponseViewer data={data} error={error} loading={loading} />
      {data?.success && (
        <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#15803D', marginBottom: '8px' }}>✅ {data.message}</div>
          <div style={{ fontSize: '12px', color: '#166534' }}>
            Booking ID: <code style={{ fontFamily: 'monospace', fontWeight: '700' }}>{data.bookingId}</code><br />
            Status: <strong>{data.status}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 6: 8-Stage Tracking ────────────────────────────────────
function Step6Tracking({ bookingId: initId }) {
  const { authFetch } = useContext(AppStateContext);
  const [bookingId, setBookingId] = useState(initId || 'PM-1724501234');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { if (initId) setBookingId(initId); }, [initId]);

  const call = async () => {
    setLoading(true); setError(null);
    try { setData(await getPackersTracking(authFetch, bookingId)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const timeline = data?.timeline || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Renders the 8-stage stepper dynamically. Display <strong>deliveryOtp</strong> prominently — the supervisor asks for this code to mark the move complete.
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Booking ID</label>
          <input value={bookingId} onChange={e => setBookingId(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <button onClick={call} className="btn btn-primary" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Send size={13} /> Fetch Tracking
        </button>
      </div>
      <ResponseViewer data={data} error={error} loading={loading} />
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* 8-Stage Stepper */}
          <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-muted)' }}>📦 8-STAGE MOVE TIMELINE</div>
            {timeline.map((item, i) => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: i < timeline.length - 1 ? '0' : '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: item.completed ? '#10B981' : 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.completed ? <CheckCircle2 size={14} color="#fff" /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />}
                  </div>
                  {i < timeline.length - 1 && <div style={{ width: '2px', height: '24px', backgroundColor: item.completed ? '#10B981' : 'var(--border-color)', marginTop: '2px' }} />}
                </div>
                <div style={{ paddingBottom: i < timeline.length - 1 ? '12px' : '0' }}>
                  <div style={{ fontSize: '12px', fontWeight: item.completed ? '700' : '500', color: item.completed ? 'var(--text-main)' : 'var(--text-muted)' }}>{item.title}</div>
                  {item.timestamp && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(item.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery OTP + Supervisor card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.deliveryOtp && (
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1E293B', border: '2px solid #10B981', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '6px', letterSpacing: '2px' }}>DELIVERY OTP — SHARE WITH SUPERVISOR</div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#34D399', letterSpacing: '12px', fontFamily: 'monospace' }}>
                  {data.deliveryOtp}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>Supervisor will ask for this code on delivery</div>
              </div>
            )}
            {data.driver && (
              <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-muted)' }}>🚛 SUPERVISOR & TRUCK</div>
                <div style={{ fontSize: '13px', fontWeight: '700' }}>{data.driver.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{data.driver.vehicleType} · {data.driver.vehicleNumber}</div>
                <div style={{ fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Phone size={12} /> {data.driver.phone}
                </div>
                <div style={{ fontSize: '11px', color: '#F59E0B', marginTop: '4px' }}>👷 {data.driver.helpersCount} helpers · ⭐ {data.driver.rating}</div>
                {data.eta && <div style={{ fontSize: '13px', fontWeight: '800', color: '#3B82F6', marginTop: '8px' }}>⏱ ETA: {data.eta}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 7: Verify OTP ─────────────────────────────────────────
function Step7VerifyOtp({ bookingId: initId }) {
  const { authFetch } = useContext(AppStateContext);
  const [bookingId, setBookingId] = useState(initId || 'PM-1724501234');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { if (initId) setBookingId(initId); }, [initId]);

  const call = async () => {
    if (otp.length !== 4) return;
    setLoading(true); setError(null);
    try { setData(await verifyPackersOtp(authFetch, bookingId, otp)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        The supervisor enters the delivery OTP shown on the customer's screen to mark the move as complete.
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Booking ID</label>
          <input value={bookingId} onChange={e => setBookingId(e.target.value)}
            style={{ width: '200px', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>4-Digit Delivery OTP</label>
          <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="e.g. 6194" maxLength={4}
            style={{ width: '120px', padding: '7px 10px', fontSize: '20px', fontWeight: '700', fontFamily: 'monospace', letterSpacing: '6px', textAlign: 'center', borderRadius: '6px', border: `1px solid ${otp.length === 4 ? '#10B981' : 'var(--border-color)'}`, backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <button onClick={call} disabled={otp.length !== 4} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', opacity: otp.length !== 4 ? 0.5 : 1 }}>
          <ShieldCheck size={13} /> Verify OTP
        </button>
      </div>
      <ResponseViewer data={data} error={error} loading={loading} />
      {data?.success && (
        <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '13px', fontWeight: '700', color: '#15803D' }}>
          ✅ {data.message}
        </div>
      )}
    </div>
  );
}

// ── Step 8: Reschedule ─────────────────────────────────────────
function Step8Reschedule({ bookingId: initId }) {
  const { authFetch } = useContext(AppStateContext);
  const [bookingId, setBookingId] = useState(initId || 'PM-1724501234');
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('11:00 AM – 01:00 PM');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { if (initId) setBookingId(initId); }, [initId]);

  const call = async () => {
    setLoading(true); setError(null);
    try { setData(await reschedulePackersBooking(authFetch, bookingId, { newDate, newSlot })); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Customer can reschedule slot before the notice period. Returns SMS confirmation.
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Booking ID</label>
          <input value={bookingId} onChange={e => setBookingId(e.target.value)}
            style={{ width: '200px', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>New Date</label>
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
            style={{ padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>New Slot</label>
          <select value={newSlot} onChange={e => setNewSlot(e.target.value)}
            style={{ padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            {['08:00 AM – 10:00 AM', '11:00 AM – 01:00 PM', '02:00 PM – 04:00 PM', '05:00 PM – 07:00 PM'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={call} className="btn btn-primary" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Send size={13} /> Reschedule
        </button>
      </div>
      <ResponseViewer data={data} error={error} loading={loading} />
      {data?.success && <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '13px', fontWeight: '600', color: '#15803D' }}>✅ {data.message}</div>}
    </div>
  );
}

// ── Step 9: Cancel ─────────────────────────────────────────────
function Step9Cancel({ bookingId: initId }) {
  const { authFetch } = useContext(AppStateContext);
  const [bookingId, setBookingId] = useState(initId || 'PM-1724501234');
  const [reason, setReason] = useState('Found alternative mover');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { if (initId) setBookingId(initId); }, [initId]);

  const call = async () => {
    setLoading(true); setError(null);
    try { setData(await cancelPackersBooking(authFetch, bookingId, { reason })); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Cancel shifting booking and initiate ₹500 advance refund (if within policy window).
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Booking ID</label>
          <input value={bookingId} onChange={e => setBookingId(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <div style={{ flex: 2, minWidth: '220px' }}>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Cancellation Reason</label>
          <input value={reason} onChange={e => setReason(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <button onClick={call} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#EF4444', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
          <XCircle size={13} /> Cancel Booking
        </button>
      </div>
      <ResponseViewer data={data} error={error} loading={loading} />
      {data?.success && (
        <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', fontSize: '13px', fontWeight: '700', color: '#92400E' }}>
          ✅ {data.message} — Refund: ₹{data.refundAmount ?? 500}
        </div>
      )}
    </div>
  );
}

// ── Step 10: Review ────────────────────────────────────────────
function Step10Review({ bookingId: initId }) {
  const { authFetch } = useContext(AppStateContext);
  const [bookingId, setBookingId] = useState(initId || 'PM-1724501234');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('Ramesh and team were extremely polite and handled glass items with great care.');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { if (initId) setBookingId(initId); }, [initId]);

  const call = async () => {
    setLoading(true); setError(null);
    try { setData(await submitPackersReview(authFetch, bookingId, { rating, feedback })); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ minWidth: '180px' }}>
          <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '3px', color: 'var(--text-muted)' }}>Booking ID</label>
          <input value={bookingId} onChange={e => setBookingId(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
        </div>
        <div style={{ flex: 1, minWidth: '260px' }}>
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
      {data?.success && <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '13px', fontWeight: '600', color: '#15803D' }}>⭐ {data.message}</div>}
    </div>
  );
}

// ── TypeScript Interfaces ─────────────────────────────────────
function TSInterfaces() {
  const [open, setOpen] = useState(false);
  const code = `export type PackerServiceId = 'pm-1rk' | 'pm-1bhk' | 'pm-2bhk' | 'pm-3bhk';

export interface PackerService {
  id: PackerServiceId; name: string; description: string;
  basePrice: number; priceLabel: string; icon: string;
  estimatedDuration: string; features: string[];
}
export interface PackerAddon {
  id: string; name: string; category: string;
  price: number; unit: string; description: string; icon: string;
}
export interface PackerSlot {
  id: string; time: string; slot: string;
  isAvailable: boolean; surgeFee: number;
}
export interface PackerPricingBreakdown {
  basePrice: number; distanceCharge: number; floorCharge: number;
  addonsTotal: number; subtotal: number; discount: number;
  gst: number; advancePayable: number; remainingPayable: number; totalPrice: number;
}
export interface PackerTrackingTimeline {
  id: number; title: string; completed: boolean; timestamp?: string;
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

// ── Main Component ────────────────────────────────────────────
export default function PMApiIntegration() {
  const [serviceId, setServiceId] = useState(null);
  const [basePrice, setBasePrice] = useState(null);
  const [addonIds, setAddonIds] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [bookingId, setBookingId] = useState(null);

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} color="var(--primary)" />
          Flow 2 — Packers & Movers: Complete API Integration Guide (10 Steps)
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
          Live API tester for all 10 steps of the P&M customer flow. ServiceId, addonIds, slot, pricing and bookingId flow automatically between steps.
        </p>
      </div>

      {/* Flow diagram */}
      <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#0F172A', border: '1px solid #1E293B', fontSize: '11px', fontFamily: 'monospace', color: '#94A3B8', lineHeight: '2' }}>
        <span style={{ color: '#60A5FA' }}>[1: House Size]</span> → <span style={{ color: '#34D399' }}>[2: Addons]</span> → <span style={{ color: '#FBBF24' }}>[3: Date Slot]</span> → <span style={{ color: '#A78BFA' }}>[4: Pricing]</span> → <span style={{ color: '#F87171' }}>[5: Pay ₹500]</span>
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
        <br />
        <span style={{ color: '#34D399' }}>[10: Review]</span> ← <span style={{ color: '#60A5FA' }}>[9: Cancel]</span> ← <span style={{ color: '#FBBF24' }}>[8: Reschedule]</span> ← <span style={{ color: '#A78BFA' }}>[7: Verify OTP]</span> ← <span style={{ color: '#F87171' }}>[6: 8-Stage Tracking]</span>
      </div>

      {bookingId && (
        <div style={{ padding: '8px 14px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '12px', color: '#1D4ED8', fontWeight: '600' }}>
          📦 Active Booking: <code style={{ fontFamily: 'monospace' }}>{bookingId}</code> — auto-filled in steps 6–10
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <StepCard step={1} icon={Package} color="#3B82F6" title="Select House Size" subtitle="1RK, 1BHK, 2BHK, 3BHK service packages" endpointMethod="GET" endpointPath="/api/customer/services?category=packers" defaultOpen>
          <Step1Services onServiceSelect={(id, price) => { setServiceId(id); setBasePrice(price); }} />
        </StepCard>

        <StepCard step={2} icon={Tag} color="#8B5CF6" title="Choose Shifting Addons" subtitle="Multi-select: bubble wrap, AC removal, bed assembly" endpointMethod="GET" endpointPath="/api/addons?category=packers">
          <Step2Addons onAddonsSelect={setAddonIds} />
        </StepCard>

        <StepCard step={3} icon={Clock} color="#F59E0B" title="Select Shifting Slot" subtitle="Date & time slot picker with surge fees" endpointMethod="GET" endpointPath="/api/services/{id}/slots?date=YYYY-MM-DD">
          <Step3Slots serviceId={serviceId} onSlotSelect={setSelectedSlot} />
        </StepCard>

        <StepCard step={4} icon={Calculator} color="#10B981" title="Calculate Pricing Breakdown" subtitle="Floor charges, addons, GST, advance vs remaining split" endpointMethod="POST" endpointPath="/api/pricing/packers">
          <Step4Pricing serviceId={serviceId} addonIds={addonIds} onPricing={setPricing} />
        </StepCard>

        <StepCard step={5} icon={DollarSign} color="#EC4899" title="Confirm Booking — Pay ₹500 Advance" subtitle="Lock slot with advance payment via UPI/Razorpay" endpointMethod="POST" endpointPath="/api/bookings">
          <Step5Confirm serviceId={serviceId} pricing={pricing} selectedSlot={selectedSlot} onBookingCreated={setBookingId} />
        </StepCard>

        <StepCard step={6} icon={Navigation} color="#6366F1" title="8-Stage Shifting Tracking" subtitle="Live stepper + truck location + deliveryOtp display" endpointMethod="GET" endpointPath="/api/bookings/{id}/tracking">
          <Step6Tracking bookingId={bookingId} />
        </StepCard>

        <StepCard step={7} icon={ShieldCheck} color="#10B981" title="Verify Delivery OTP" subtitle="4-digit OTP to mark move as completed" endpointMethod="POST" endpointPath="/api/bookings/{id}/verify-otp">
          <Step7VerifyOtp bookingId={bookingId} />
        </StepCard>

        <StepCard step={8} icon={RefreshCw} color="#F59E0B" title="Reschedule Shifting Slot" subtitle="Change date & time slot before notice period" endpointMethod="POST" endpointPath="/api/bookings/{id}/reschedule">
          <Step8Reschedule bookingId={bookingId} />
        </StepCard>

        <StepCard step={9} icon={XCircle} color="#EF4444" title="Cancel Packers Booking" subtitle="Cancel with advance refund initiation" endpointMethod="POST" endpointPath="/api/bookings/{id}/cancel">
          <Step9Cancel bookingId={bookingId} />
        </StepCard>

        <StepCard step={10} icon={Star} color="#FBBF24" title="Review Shifting Service" subtitle="Post-move crew rating and feedback" endpointMethod="POST" endpointPath="/api/bookings/{id}/review">
          <Step10Review bookingId={bookingId} />
        </StepCard>
      </div>

      <TSInterfaces />
    </div>
  );
}
