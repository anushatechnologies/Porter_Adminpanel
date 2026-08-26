import React, { useState, useContext } from 'react';
import { Truck, Users, Plus, Trash2, Edit } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMVehiclesLabour() {
  const { vehicles, updateVehicle, addVehicle, deleteVehicle, labourTiers, updateLabourTier } = useContext(PackersMoversContext);
  const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles' | 'labour'
  const [showVehForm, setShowVehForm] = useState(false);

  const [vehForm, setVehForm] = useState({
    name: '',
    capacityCuFt: 700,
    capacityKg: 2500,
    baseFare: 3000,
    perKmFare: 28,
    minFare: 3000,
    driverCharge: 600,
    loadingCharge: 800,
    unloadingCharge: 800,
    image: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
    isActive: true
  });

  const handleSaveVehicle = (e) => {
    e.preventDefault();
    if (!vehForm.name.trim()) return;
    addVehicle(vehForm);
    setVehForm({ name: '', capacityCuFt: 700, capacityKg: 2500, baseFare: 3000, perKmFare: 28, minFare: 3000, driverCharge: 600, loadingCharge: 800, unloadingCharge: 800, image: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', isActive: true });
    setShowVehForm(false);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={20} color="var(--primary)" /> Dedicated P&M Trucks & Labour Slabs
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Configure containerized moving truck capacities (cu.ft / kg) and helper worker slabs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveTab('vehicles')} className={`btn ${activeTab === 'vehicles' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '12px' }}>
            Truck Fleet ({vehicles.length})
          </button>
          <button onClick={() => setActiveTab('labour')} className={`btn ${activeTab === 'labour' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '12px' }}>
            Labour Crew Tiers ({labourTiers.length})
          </button>
        </div>
      </div>

      {activeTab === 'vehicles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>Configured Moving Trucks</span>
            <button className="btn btn-primary" onClick={() => setShowVehForm(!showVehForm)} style={{ fontSize: '12px', padding: '6px 12px' }}>
              <Plus size={14} /> Add New Truck Type
            </button>
          </div>

          {showVehForm && (
            <form onSubmit={handleSaveVehicle} noValidate className="card" style={{ padding: '16px 20px', borderRadius: '8px', border: '2px solid var(--primary)', backgroundColor: 'var(--bg-main)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700' }}>Add Relocation Truck Model</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Truck Name *</label>
                  <input type="text" required value={vehForm.name} onChange={(e) => setVehForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. 19 FT Container" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Vol. Cap (cu.ft)</label>
                  <input type="number" value={vehForm.capacityCuFt} onChange={(e) => setVehForm(p => ({ ...p, capacityCuFt: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Payload (kg)</label>
                  <input type="number" value={vehForm.capacityKg} onChange={(e) => setVehForm(p => ({ ...p, capacityKg: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Base Fare (₹)</label>
                  <input type="number" value={vehForm.baseFare} onChange={(e) => setVehForm(p => ({ ...p, baseFare: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Per Km (₹)</label>
                  <input type="number" value={vehForm.perKmFare} onChange={(e) => setVehForm(p => ({ ...p, perKmFare: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowVehForm(false)} style={{ fontSize: '12px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ fontSize: '12px' }}>Save Truck Model</button>
              </div>
            </form>
          )}

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Truck Model</th>
                  <th>Volume Capacity</th>
                  <th>Weight Capacity</th>
                  <th>Base Fare</th>
                  <th>Per KM</th>
                  <th>Driver Allowance</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: '700' }}>{v.name}</td>
                    <td>{v.capacityCuFt} cu.ft</td>
                    <td>{v.capacityKg} kg</td>
                    <td style={{ fontWeight: '600' }}>₹{v.baseFare}</td>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>₹{v.perKmFare}/km</td>
                    <td>₹{v.driverCharge}</td>
                    <td>
                      <button
                        onClick={() => updateVehicle(v.id, { isActive: !v.isActive })}
                        style={{ border: 'none', background: v.isActive ? '#DCFCE7' : '#FEE2E2', color: v.isActive ? '#15803D' : '#B91C1C', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        {v.isActive ? 'Active' : 'Off'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="action-btn" style={{ color: '#EF4444' }} onClick={() => deleteVehicle(v.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'labour' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {labourTiers.map(tier => (
            <div key={tier.id} className="card" style={{ padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '800' }}>{tier.label}</span>
                <span className="badge" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>{tier.workers} Helpers</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Base Package Charge</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#15803D' }}>₹{tier.baseCharge}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Included Window</div>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>{tier.minHours} Hours</div>
                </div>
                <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Extra Hour Surcharge</div>
                  <div style={{ fontSize: '12px', fontWeight: '600' }}>+ ₹{tier.perHourExtra} / extra hour</div>
                </div>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  const newBase = prompt('Enter new base charge (₹):', tier.baseCharge);
                  if (newBase) updateLabourTier(tier.id, { baseCharge: parseFloat(newBase) || tier.baseCharge });
                }}
                style={{ width: '100%', fontSize: '12px', padding: '6px' }}
              >
                <Edit size={13} style={{ marginRight: '6px' }} /> Edit Labour Slab Price
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
