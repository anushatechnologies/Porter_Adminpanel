import React, { useState, useContext } from 'react';
import {
  Tag, Plus, Edit, Trash2, CheckCircle2, XCircle,
  Calendar, DollarSign, Percent, Search
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function PCCoupons() {
  const { coupons, saveCoupon, formatRupee } = useContext(PassengerCarContext);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'fixed'
  const [discountValue, setDiscountValue] = useState(15);
  const [minFare, setMinFare] = useState(500);
  const [maxDiscount, setMaxDiscount] = useState(200);
  const [usageLimit, setUsageLimit] = useState(5000);
  const [validUntil, setValidUntil] = useState('2026-12-31');

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setTitle('');
    setDiscountType('percentage');
    setDiscountValue(15);
    setMinFare(500);
    setMaxDiscount(200);
    setUsageLimit(5000);
    setValidUntil('2026-12-31');
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingCoupon(c);
    setCode(c.code);
    setTitle(c.title);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinFare(c.minFare);
    setMaxDiscount(c.maxDiscount);
    setUsageLimit(c.usageLimit);
    setValidUntil(c.validUntil);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveCoupon({
      id: editingCoupon ? editingCoupon.id : undefined,
      code: code.trim().toUpperCase(),
      title,
      discountType,
      discountValue: Number(discountValue),
      minFare: Number(minFare),
      maxDiscount: Number(maxDiscount),
      usageLimit: Number(usageLimit),
      validUntil,
      enabled: true
    });
    setShowModal(false);
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Coupons & Promo Codes Management</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Configure percentage and flat discount vouchers with minimum fare rules and usage caps
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          Create New Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="table-container">
        <div className="table-header-controls">
          <div className="search-input-wrapper">
            <Search className="header-search-icon" size={14} />
            <input
              type="text"
              placeholder="Search coupons by code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Campaign Name</th>
              <th>Discount Value</th>
              <th>Min Fare</th>
              <th>Max Discount</th>
              <th>Usage Count</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.map(c => (
              <tr key={c.id}>
                <td>
                  <span style={{
                    fontFamily: 'monospace',
                    fontWeight: '800',
                    fontSize: '13px',
                    color: 'var(--primary)',
                    backgroundColor: '#EFF6FF',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {c.code}
                  </span>
                </td>
                <td style={{ fontWeight: '600' }}>{c.title}</td>
                <td>
                  <span style={{ fontWeight: '700', color: '#059669' }}>
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                  </span>
                </td>
                <td>{formatRupee(c.minFare)}</td>
                <td>{formatRupee(c.maxDiscount)}</td>
                <td>
                  <div style={{ fontWeight: '600' }}>{c.usedCount} / {c.usageLimit}</div>
                </td>
                <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{c.validUntil}</td>
                <td>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: c.enabled ? '#D1FAE5' : '#FEE2E2',
                    color: c.enabled ? '#047857' : '#B91C1C'
                  }}>
                    {c.enabled ? 'ACTIVE' : 'EXPIRED'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => openEditModal(c)}
                    className="action-btn"
                    title="Edit Coupon"
                  >
                    <Edit size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Coupon Code (Uppercase)</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FESTIVAL25"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700', textTransform: 'uppercase' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Festival Season Bonanza"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Flat (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Discount Value</label>
                    <input
                      type="number"
                      required
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Minimum Fare (₹)</label>
                    <input
                      type="number"
                      value={minFare}
                      onChange={(e) => setMinFare(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Usage Limit (Total)</label>
                    <input
                      type="number"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Expiry Date</label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCoupon ? 'Save Changes' : 'Create Coupon'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
