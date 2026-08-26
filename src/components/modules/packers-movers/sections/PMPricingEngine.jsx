import React, { useState, useContext } from 'react';
import { Calculator, Check, Settings, Sparkles, HelpCircle } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMPricingEngine() {
  const { pricingRules, setPricingRules } = useContext(PackersMoversContext);
  const [form, setForm] = useState(pricingRules);
  const [isSaved, setIsSaved] = useState(false);

  // Live Interactive Simulator State
  const [simDistance, setSimDistance] = useState(15);
  const [simBaseTruck, setSimBaseTruck] = useState(3200);
  const [simLabour, setSimLabour] = useState(2400);
  const [simPacking, setSimPacking] = useState(1500);
  const [simHandling, setSimHandling] = useState(600);
  const [simFloors, setSimFloors] = useState(300);
  const [simCoupon, setSimCoupon] = useState(500);

  const subTotal = (parseFloat(simBaseTruck) || 0) +
                   ((parseFloat(simDistance) || 0) * 28) +
                   (parseFloat(simLabour) || 0) +
                   (parseFloat(simPacking) || 0) +
                   (parseFloat(simHandling) || 0) +
                   (parseFloat(simFloors) || 0) -
                   (parseFloat(simCoupon) || 0);

  const gst = Math.round(subTotal * (form.gstPercentage / 100));
  const simFinal = Math.max(form.minBookingCharge || 2500, Math.round(subTotal * (form.surgeMultiplier || 1.0) + gst));

  const handleSave = (e) => {
    e.preventDefault();
    setPricingRules(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={20} color="var(--primary)" /> Packers & Movers Pricing Calculation Engine
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
          Configure dynamic algorithm formula, GST rates, platform cut %, minimum billing limits and surge multipliers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Core Formula Configuration */}
        <form onSubmit={handleSave} noValidate className="card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={16} /> Dynamic Pricing Rules & Multipliers
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>GST Tax Rate (%)</label>
              <input type="number" value={form.gstPercentage} onChange={(e) => setForm(p => ({ ...p, gstPercentage: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Platform Commission Cut (%)</label>
              <input type="number" value={form.porterPlatformCutPercent} onChange={(e) => setForm(p => ({ ...p, porterPlatformCutPercent: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Minimum Move Order Value (₹)</label>
              <input type="number" value={form.minBookingCharge} onChange={(e) => setForm(p => ({ ...p, minBookingCharge: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Peak Surge Multiplier (1.0 = Normal)</label>
              <input type="number" step="0.1" value={form.surgeMultiplier} onChange={(e) => setForm(p => ({ ...p, surgeMultiplier: parseFloat(e.target.value) || 1.0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Weekend Multiplier (e.g. 1.1)</label>
              <input type="number" step="0.05" value={form.weekendMultiplier} onChange={(e) => setForm(p => ({ ...p, weekendMultiplier: parseFloat(e.target.value) || 1.0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Night Move Surcharge (%)</label>
              <input type="number" value={form.nightMoveSurchargePercent} onChange={(e) => setForm(p => ({ ...p, nightMoveSurchargePercent: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '11px', lineHeight: '1.6' }}>
            <strong>🧮 Engine Pricing Formula:</strong><br />
            <code>Customer Fare = ((Base Fare + (Distance Km × Per Km) + Vehicle + Labour + Packing + Handling + Floor/Stairs + Dismantling/Reassembly) - Coupon) × Surge Multiplier + GST (18%)</code>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {isSaved ? <Check size={16} /> : null}
            {isSaved ? 'Rules Updated in Real Time!' : 'Save Pricing Engine Parameters'}
          </button>
        </form>

        {/* Live Interactive Pricing Simulator */}
        <div className="card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--bg-main)' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} /> Live Quote Calculator Simulator
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Distance (Km)</label>
              <input type="number" value={simDistance} onChange={(e) => setSimDistance(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Base Truck (₹)</label>
              <input type="number" value={simBaseTruck} onChange={(e) => setSimBaseTruck(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Labour Package (₹)</label>
              <input type="number" value={simLabour} onChange={(e) => setSimLabour(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Packing Charge (₹)</label>
              <input type="number" value={simPacking} onChange={(e) => setSimPacking(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Handling & Dismantle (₹)</label>
              <input type="number" value={simHandling} onChange={(e) => setSimHandling(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Coupon Discount (₹)</label>
              <input type="number" value={simCoupon} onChange={(e) => setSimCoupon(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--card-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Calculated Subtotal:</span>
              <span>₹{subTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Applicable GST (18%):</span>
              <span>₹{gst.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#15803D', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
              <span>Simulated Estimate:</span>
              <span>₹{simFinal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
