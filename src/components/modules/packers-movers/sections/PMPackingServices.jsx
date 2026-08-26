import React, { useState, useContext } from 'react';
import { ShieldCheck, Edit, CheckCircle2, DollarSign } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMPackingServices() {
  const { packingServices, updatePackingService } = useContext(PackersMoversContext);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    priceType: 'per_item',
    price: 60,
    minCharge: 600,
    materialCharge: 300,
    labourCharge: 300
  });

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      priceType: p.priceType,
      price: p.price,
      minCharge: p.minCharge,
      materialCharge: p.materialCharge,
      labourCharge: p.labourCharge
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      updatePackingService(editingId, form);
      setEditingId(null);
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="var(--primary)" /> Packing Quality & Material Services
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
          Configure customer packing tiers, per-item material charges, bubble wrap and carton boxes costing.
        </p>
      </div>

      {editingId && (
        <form onSubmit={handleSave} noValidate className="card" style={{ padding: '16px 20px', borderRadius: '8px', border: '2px solid var(--primary)', backgroundColor: 'var(--bg-main)' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700' }}>Edit Packing Tier Rates</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Packing Tier Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Unit Rate (₹)</label>
              <input type="number" value={form.price} onChange={(e) => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Min Charge (₹)</label>
              <input type="number" value={form.minCharge} onChange={(e) => setForm(p => ({ ...p, minCharge: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Material (₹)</label>
              <input type="number" value={form.materialCharge} onChange={(e) => setForm(p => ({ ...p, materialCharge: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Labour (₹)</label>
              <input type="number" value={form.labourCharge} onChange={(e) => setForm(p => ({ ...p, labourCharge: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)} style={{ fontSize: '12px' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '12px' }}>Save Packing Tier</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {packingServices.map(pack => (
          <div key={pack.id} className="card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)' }}>{pack.name}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', backgroundColor: pack.isActive ? '#DCFCE7' : '#FEE2E2', color: pack.isActive ? '#15803D' : '#B91C1C' }}>
                  {pack.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '8px 0 14px' }}>{pack.description}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Price Type</div>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>{pack.priceType === 'per_item' ? '₹' + pack.price + ' per item' : 'Fixed Rate'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Minimum Charge</div>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>₹{pack.minCharge}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Material Component</div>
                  <div style={{ fontSize: '12px', fontWeight: '600' }}>₹{pack.materialCharge}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Labour Component</div>
                  <div style={{ fontSize: '12px', fontWeight: '600' }}>₹{pack.labourCharge}</div>
                </div>
              </div>
            </div>

            <button className="btn btn-secondary" onClick={() => handleEdit(pack)} style={{ width: '100%', fontSize: '12px', padding: '6px' }}>
              <Edit size={13} style={{ marginRight: '6px' }} /> Edit Pricing Structure
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
