import React, { useState, useContext } from 'react';
import { Settings2, ArrowUp, Building2, Wrench, Layers, Check } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMAmbientServices() {
  const { ambientServices, updateAmbientServices } = useContext(PackersMoversContext);
  const [form, setForm] = useState(ambientServices);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
    setIsSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateAmbientServices(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} noValidate className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} color="var(--primary)" /> Additional Services & Handling Charges Matrix
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Configure carpentry dismantling, reassembly, unpacking, heavy item handling, floor stairs and lift handling rules.
          </p>
        </div>

        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isSaved ? <Check size={16} /> : null}
          {isSaved ? 'Rates Saved Successfully!' : 'Save Pricing Matrix'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Carpentry & Add-on Services */}
        <div className="card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wrench size={16} /> Carpentry & Extra Services
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Furniture Dismantling (₹/item)</label>
              <input type="number" value={form.dismantlingRatePerItem} onChange={(e) => handleChange('dismantlingRatePerItem', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Furniture Reassembly (₹/item)</label>
              <input type="number" value={form.reassemblyRatePerItem} onChange={(e) => handleChange('reassemblyRatePerItem', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Full Destination Unpacking (₹)</label>
              <input type="number" value={form.unpackingFixedRate} onChange={(e) => handleChange('unpackingFixedRate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Extra Labour Helper (₹/hour)</label>
              <input type="number" value={form.extraLabourRatePerHour} onChange={(e) => handleChange('extraLabourRatePerHour', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Heavy Item Handling Surcharge (₹)</label>
              <input type="number" value={form.heavyItemHandlingFee} onChange={(e) => handleChange('heavyItemHandlingFee', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Fragile Glass Packaging Fee (₹)</label>
              <input type="number" value={form.fragileHandlingFee} onChange={(e) => handleChange('fragileHandlingFee', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Long Carry Distance Surcharge (&gt;50m parking) (₹)</label>
              <input type="number" value={form.longCarryChargeAbove50m} onChange={(e) => handleChange('longCarryChargeAbove50m', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>
        </div>

        {/* Floor, Stairs & Lift Handling */}
        <div className="card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} /> Floor, Stairs & Lift Charge Engine
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Ground Floor Charge (₹)</label>
              <input type="number" value={form.groundFloorCharge} onChange={(e) => handleChange('groundFloorCharge', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>1st Floor (No Lift) (₹)</label>
              <input type="number" value={form.firstFloorCharge} onChange={(e) => handleChange('firstFloorCharge', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>2nd Floor (No Lift) (₹)</label>
              <input type="number" value={form.secondFloorCharge} onChange={(e) => handleChange('secondFloorCharge', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>3rd Floor (No Lift) (₹)</label>
              <input type="number" value={form.thirdFloorCharge} onChange={(e) => handleChange('thirdFloorCharge', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>4th+ Floor per floor (No Lift) (₹)</label>
              <input type="number" value={form.fourthPlusFloorCharge} onChange={(e) => handleChange('fourthPlusFloorCharge', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Lift Available Charge (₹)</label>
              <input type="number" value={form.liftAvailableDiscountOrFree} onChange={(e) => handleChange('liftAvailableDiscountOrFree', e.target.value)} placeholder="0 (Free)" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>

          <div style={{ padding: '10px 14px', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-muted)' }}>
            💡 <strong>Note:</strong> When a customer indicates "Lift Available = Yes", the floor stairs surcharge is waived automatically.
          </div>
        </div>
      </div>
    </form>
  );
}
