import React, { useState, useContext } from 'react';
import { Tag, Plus, Trash2, Edit, CheckCircle2, XCircle } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMCoupons() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useContext(PackersMoversContext);
  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discountType: 'fixed',
    discountVal: 500,
    minBooking: 5000,
    maxDiscount: 500,
    validFrom: '2026-08-01',
    validUntil: '2026-12-31',
    applicableCity: 'Hyderabad',
    usageLimit: 100,
    isActive: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    addCoupon({ ...form, code: form.code.toUpperCase() });
    setForm({ code: '', discountType: 'fixed', discountVal: 500, minBooking: 5000, maxDiscount: 500, validFrom: '2026-08-01', validUntil: '2026-12-31', applicableCity: 'Hyderabad', usageLimit: 100, isActive: true });
    setShowAddForm(false);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={20} color="var(--primary)" /> Packers & Movers Coupon & Promo Codes
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Configure promotional discount vouchers, city restrictions and minimum booking limits.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> {showAddForm ? 'Cancel' : 'Create New Coupon'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} noValidate className="card" style={{ padding: '16px 20px', borderRadius: '8px', border: '2px solid var(--primary)', backgroundColor: 'var(--bg-main)' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700' }}>Create Relocation Coupon Voucher</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Coupon Code *</label>
              <input type="text" required value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="MOVE500" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', textTransform: 'uppercase', fontWeight: '700' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Discount Type</label>
              <select value={form.discountType} onChange={(e) => setForm(p => ({ ...p, discountType: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
                <option value="fixed">Flat Amount (₹)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Discount Value</label>
              <input type="number" value={form.discountVal} onChange={(e) => setForm(p => ({ ...p, discountVal: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Min Booking (₹)</label>
              <input type="number" value={form.minBooking} onChange={(e) => setForm(p => ({ ...p, minBooking: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Max Cap (₹)</label>
              <input type="number" value={form.maxDiscount} onChange={(e) => setForm(p => ({ ...p, maxDiscount: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>City Scope</label>
              <input type="text" value={form.applicableCity} onChange={(e) => setForm(p => ({ ...p, applicableCity: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)} style={{ fontSize: '12px' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '12px' }}>Save Promo Code</button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount</th>
              <th>Min Booking</th>
              <th>Max Cap</th>
              <th>City</th>
              <th>Redemptions</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(cpn => (
              <tr key={cpn.id}>
                <td style={{ fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px' }}>{cpn.code}</td>
                <td style={{ fontWeight: '700' }}>{cpn.discountType === 'percent' ? `${cpn.discountVal}% OFF` : `₹${cpn.discountVal} Flat`}</td>
                <td>₹{cpn.minBooking}</td>
                <td>₹{cpn.maxDiscount}</td>
                <td><span className="badge" style={{ backgroundColor: '#F1F5F9' }}>{cpn.applicableCity}</span></td>
                <td>{cpn.usedCount} / {cpn.usageLimit}</td>
                <td>
                  <button
                    onClick={() => updateCoupon(cpn.id, { isActive: !cpn.isActive })}
                    style={{ border: 'none', background: cpn.isActive ? '#DCFCE7' : '#FEE2E2', color: cpn.isActive ? '#15803D' : '#B91C1C', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {cpn.isActive ? 'Active' : 'Expired'}
                  </button>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="action-btn" style={{ color: '#EF4444' }} onClick={() => deleteCoupon(cpn.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
