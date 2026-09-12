import React, { useState, useContext } from 'react';
import {
  Car, Plus, Edit, Users, Briefcase, IndianRupee,
  CheckCircle2, AlertTriangle, ShieldCheck, Search, Filter,
  ArrowUpDown, SlidersHorizontal, Eye
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function PCVehiclesConfig({ onOpenCategoryModal }) {
  const { pricingConfig, drivers, formatRupee } = useContext(PassengerCarContext);
  const [activeSubTab, setActiveSubTab] = useState('categories'); // 'categories' | 'fleet'
  const [searchQuery, setSearchQuery] = useState('');

  const vehicleCategories = Object.values(pricingConfig.vehicles || {}).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="tab-group" style={{ margin: 0 }}>
          <button
            className={`tab-btn ${activeSubTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('categories')}
          >
            Vehicle Categories ({vehicleCategories.length})
          </button>
          <button
            className={`tab-btn ${activeSubTab === 'fleet' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('fleet')}
          >
            Registered Car Fleet ({drivers.length})
          </button>
        </div>

        {activeSubTab === 'categories' && (
          <button
            className="btn btn-primary"
            onClick={() => onOpenCategoryModal(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            Add Vehicle Category
          </button>
        )}
      </div>

      {activeSubTab === 'categories' ? (
        /* Vehicle Categories Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {vehicleCategories.map(cat => (
            <div
              key={cat.id}
              className="card"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={cat.image}
                        alt={cat.name}
                        style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>{cat.name}</h4>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: cat.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                          color: cat.status === 'active' ? '#047857' : '#B91C1C',
                          fontWeight: '700'
                        }}>
                          {cat.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {cat.displayName}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenCategoryModal(cat)}
                    className="action-btn"
                    title="Edit Category & Capacity"
                    style={{ padding: '6px' }}
                  >
                    <Edit size={16} />
                  </button>
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 16px' }}>
                  {cat.description}
                </p>

                {/* Capacity Rules Badge Container */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  backgroundColor: 'var(--bg-main)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} color="var(--primary)" />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Passenger Limit</div>
                      <div style={{ fontSize: '13px', fontWeight: '700' }}>
                        Max {cat.maxPassengers} Pax
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={16} color="#8B5CF6" />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Luggage Limit</div>
                      <div style={{ fontSize: '13px', fontWeight: '700' }}>
                        {cat.maxLuggage} Suitcases
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Parameters Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ backgroundColor: 'var(--bg-card)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Base Fare</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
                      {formatRupee(cat.baseFare)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>First {cat.minKm} KM</div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-card)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Per KM Rate</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#10B981', marginTop: '2px' }}>
                      {formatRupee(cat.perKm)}/km
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>After {cat.minKm} KM</div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-card)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Allowance</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#F59E0B', marginTop: '2px' }}>
                      {formatRupee(cat.driverAllowance)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Driver Daily</div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)',
                fontSize: '12px'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Active Drivers: <strong>{drivers.filter(d => d.vehicleCategory === cat.id).length}</strong>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  Est. ETA: <strong>{cat.etaMinutes || 5} mins</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Registered Car Fleet Table */
        <div className="table-container">
          <div className="table-header-controls">
            <div className="search-input-wrapper">
              <Search className="header-search-icon" size={14} />
              <input
                type="text"
                placeholder="Search fleet by driver, model, plate, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>Driver & Vehicle</th>
                <th>Category</th>
                <th>License Plate</th>
                <th>Current Status</th>
                <th>Location</th>
                <th>Trips</th>
                <th>Rating</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {drivers
                .filter(d =>
                  d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  d.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  d.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(d => {
                  const statusColors = {
                    available: { bg: '#D1FAE5', color: '#047857' },
                    assigned: { bg: '#EDE9FE', color: '#6D28D9' },
                    on_trip: { bg: '#DBEAFE', color: '#1D4ED8' },
                    offline: { bg: '#E2E8F0', color: '#475569' },
                    maintenance: { bg: '#FEF3C7', color: '#B45309' },
                    blocked: { bg: '#FEE2E2', color: '#B91C1C' }
                  }[d.status] || { bg: '#E2E8F0', color: '#475569' };

                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ fontWeight: '700' }}>{d.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.vehicleModel}</div>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                          {d.vehicleCategory}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>
                          {d.vehiclePlate}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          backgroundColor: statusColors.bg,
                          color: statusColors.color,
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {d.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '12.5px' }}>{d.currentLocation}</td>
                      <td style={{ fontWeight: '600' }}>{d.totalTrips}</td>
                      <td>
                        <span style={{ color: '#F59E0B', fontWeight: '700' }}>★ {d.rating}</span>
                      </td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{d.distanceKm} KM away</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
