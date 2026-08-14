import React, { useState, useContext } from 'react';
import { Building, MapPin, Users, ShoppingBag, Plus, X, ShieldCheck } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function FranchiseModule() {
  const { franchises, setFranchises, authFetch } = useContext(AppStateContext);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: 'Hyderabad',
    manager: '',
    address: '',
    driversCount: 15,
    dailyOrders: 120,
    revenue: '₹1,50,000'
  });

  const handleRegisterHub = async (e) => {
    e.preventDefault();
    const newHub = {
      id: `FR-${String(franchises.length + 1).padStart(2, '0')}`,
      name: formData.name,
      city: formData.city,
      head: formData.manager || 'Regional Hub Manager',
      address: formData.address || `${formData.city} Central Depot`,
      driversCount: parseInt(formData.driversCount) || 10,
      dailyOrders: parseInt(formData.dailyOrders) || 50,
      revenue: formData.revenue || '₹1,00,000',
      status: 'Active'
    };

    try {
      if (authFetch) {
        await authFetch('/api/franchises', {
          method: 'POST',
          body: JSON.stringify(newHub)
        }).catch(() => {});
      }
    } catch (err) {}

    setFranchises(prev => [...prev, newHub]);
    setShowModal(false);
    setFormData({
      name: '',
      city: 'Hyderabad',
      manager: '',
      address: '',
      driversCount: 15,
      dailyOrders: 120,
      revenue: '₹1,50,000'
    });
  };

  return (
    <div className="animate-fade">
      {/* Header controls */}
      <div className="table-container" style={{ marginBottom: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>Franchise Partners & Regional Depots</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Manage regional logistics hubs, active driver allocation, and depot revenue</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ gap: '6px', fontSize: '12px', fontWeight: '600', padding: '8px 16px' }}
        >
          <Plus size={16} /> Register New Depot
        </button>
      </div>

      {franchises.length === 0 ? (
        <div className="table-container" style={{ padding: '60px 20px', textAlignment: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={28} color="var(--primary)" />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>No Franchise Depots Registered</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '400px' }}>
              Register your regional partner hubs and depot managers to assign drivers and track localized order volume.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ gap: '6px' }}>
            <Plus size={16} /> Add First Franchise Hub
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {franchises.map(frn => (
            <div key={frn.id} className="dashboard-card" style={{ borderLeft: '4px solid var(--primary)', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)' }}>#{frn.id}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>{frn.name}</h3>
                </div>
                <span className="badge badge-online">{frn.status || 'Active'}</span>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                <MapPin size={14} />
                <span>{frn.address || `${frn.city || 'Hyderabad'} Regional Depot`}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ACTIVE FLEET</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={12} color="var(--primary)" /> {frn.driversCount || 12} Drivers
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>DAILY DELIVERIES</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShoppingBag size={12} color="var(--primary)" /> {frn.dailyOrders || frn.ordersCount || 85} Orders
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Hub Director</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', marginTop: '2px' }}>{frn.head || frn.manager || 'Rajesh Goud'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Mtd Hub Revenue</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#10B981', marginTop: '2px' }}>{frn.revenue || '₹2,40,000'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Franchise Depot</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleRegisterHub} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Hub / Depot Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kukatpally Logistics Hub"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>City</label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Hub Manager</label>
                  <input
                    type="text"
                    placeholder="e.g. Suresh Varma"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Full Address</label>
                <input
                  type="text"
                  placeholder="e.g. Plot 42, Phase 3, Hitech City, Hyderabad"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Active Drivers</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={formData.driversCount}
                    onChange={(e) => setFormData({ ...formData, driversCount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>MTD Revenue</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹2,50,000"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Depot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}