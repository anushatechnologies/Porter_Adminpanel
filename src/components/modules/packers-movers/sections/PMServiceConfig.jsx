import React, { useState, useContext } from 'react';
import { Layers, Plus, Edit, Trash2, CheckCircle2, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMServiceConfig() {
  const { serviceTypes, updateServiceType, addServiceType, deleteServiceType } = useContext(PackersMoversContext);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '📦',
    isActive: true,
    sortOrder: serviceTypes.length + 1
  });

  const handleEdit = (service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description,
      icon: service.icon || '📦',
      isActive: service.isActive,
      sortOrder: service.sortOrder || 1
    });
    setShowAddForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      updateServiceType(editingId, form);
    } else {
      addServiceType(form);
    }
    setEditingId(null);
    setShowAddForm(false);
    setForm({ name: '', description: '', icon: '📦', isActive: true, sortOrder: serviceTypes.length + 1 });
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="var(--primary)" /> Packers & Movers Service Types
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Configure customer-facing relocation categories shown on customer mobile app home screen.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => { setEditingId(null); setForm({ name: '', description: '', icon: '📦', isActive: true, sortOrder: serviceTypes.length + 1 }); setShowAddForm(!showAddForm); }} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> {showAddForm ? 'Cancel' : 'Add New Service Type'}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSave} noValidate className="card" style={{ padding: '16px 20px', borderRadius: '8px', border: '2px solid var(--primary)', backgroundColor: 'var(--bg-main)' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700' }}>
            {editingId ? 'Edit Service Type' : 'Create New Relocation Service'}
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '80px 2fr 3fr 100px', gap: '12px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Icon / Emoji</label>
              <input type="text" value={form.icon} onChange={(e) => setForm(p => ({ ...p, icon: e.target.value }))} style={{ width: '100%', padding: '8px', textAlign: 'center', fontSize: '16px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Service Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Home Shifting" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Customer App Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief summary of service" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 1 }))} style={{ width: '100%', padding: '8px', textAlign: 'center', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))} />
              Enable on Customer App
            </label>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)} style={{ fontSize: '12px' }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '12px' }}>{editingId ? 'Update Service' : 'Save Service'}</button>
            </div>
          </div>
        </form>
      )}

      {/* Services Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Order</th>
              <th style={{ width: '60px' }}>Icon</th>
              <th>Service Name</th>
              <th>Description</th>
              <th>Customer Visibility</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {serviceTypes.sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1)).map(service => (
              <tr key={service.id}>
                <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--primary)' }}>{service.sortOrder}</td>
                <td style={{ fontSize: '20px' }}>{service.icon}</td>
                <td style={{ fontWeight: '700', fontSize: '13px' }}>{service.name}</td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{service.description}</td>
                <td>
                  <button
                    onClick={() => updateServiceType(service.id, { isActive: !service.isActive })}
                    style={{
                      border: 'none',
                      background: service.isActive ? '#DCFCE7' : '#FEE2E2',
                      color: service.isActive ? '#15803D' : '#B91C1C',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {service.isActive ? '🟢 Active' : '⚪ Disabled'}
                  </button>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button className="action-btn btn-view" onClick={() => handleEdit(service)} title="Edit"><Edit size={14} /></button>
                    <button className="action-btn" style={{ color: '#EF4444' }} onClick={() => { if (confirm(`Delete ${service.name}?`)) deleteServiceType(service.id); }} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
