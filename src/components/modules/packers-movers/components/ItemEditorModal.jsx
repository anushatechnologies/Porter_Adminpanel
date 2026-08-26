import React, { useState } from 'react';
import { X, Package, CheckCircle2 } from 'lucide-react';

export default function ItemEditorModal({ item, categories, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    categoryId: item?.categoryId || categories[0]?.id || 'living-room',
    defaultQty: item?.defaultQty || 1,
    volumeCuFt: item?.volumeCuFt || 50,
    weightKg: item?.weightKg || 60,
    packingRequired: item?.packingRequired !== undefined ? item.packingRequired : true,
    dismantlingAvailable: item?.dismantlingAvailable !== undefined ? item.dismantlingAvailable : true,
    isFragile: item?.isFragile !== undefined ? item.isFragile : false,
    baseHandling: item?.baseHandling || 300,
    packingPrice: item?.packingPrice || 250,
    dismantlingPrice: item?.dismantlingPrice || 200,
    reassemblyPrice: item?.reassemblyPrice || 200,
    image: item?.image || 'https://cdn-icons-png.flaticon.com/512/2663/2663580.png',
    isActive: item?.isActive !== undefined ? item.isActive : true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter an item name');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={20} color="var(--primary)" />
            <h3 className="modal-title">{item ? `Edit Item — ${item.name}` : 'Add New Inventory Item'}</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Item Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., L-Shape 5-Seater Sofa"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Volume (cu.ft)</label>
              <input
                type="number"
                value={formData.volumeCuFt}
                onChange={(e) => setFormData(prev => ({ ...prev, volumeCuFt: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Est. Weight (kg)</label>
              <input
                type="number"
                value={formData.weightKg}
                onChange={(e) => setFormData(prev => ({ ...prev, weightKg: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Default Qty</label>
              <input
                type="number"
                value={formData.defaultQty}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultQty: parseInt(e.target.value) || 1 }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Handling (₹)</label>
              <input
                type="number"
                value={formData.baseHandling}
                onChange={(e) => setFormData(prev => ({ ...prev, baseHandling: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Packing (₹)</label>
              <input
                type="number"
                value={formData.packingPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, packingPrice: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Dismantle (₹)</label>
              <input
                type="number"
                value={formData.dismantlingPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, dismantlingPrice: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Reassemble (₹)</label>
              <input
                type="number"
                value={formData.reassemblyPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, reassemblyPrice: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Icon / 3D Image URL</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="https://cdn.anushaporter.com/items/sofa.png"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            />
          </div>

          {/* Feature toggles */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', backgroundColor: 'var(--bg-main)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.packingRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, packingRequired: e.target.checked }))}
              />
              Packing Mandatory
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.dismantlingAvailable}
                onChange={(e) => setFormData(prev => ({ ...prev, dismantlingAvailable: e.target.checked }))}
              />
              Dismantling Available
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#D97706' }}>
              <input
                type="checkbox"
                checked={formData.isFragile}
                onChange={(e) => setFormData(prev => ({ ...prev, isFragile: e.target.checked }))}
              />
              Fragile / Glass
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#15803D' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              Active in User App
            </label>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Save Catalogue Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
