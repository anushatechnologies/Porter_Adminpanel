import React, { useState, useContext } from 'react';
import { MapPin, Navigation, Plus, Trash2, Edit, CheckCircle2, XCircle } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMServiceAreas() {
  const {
    withinCityAreas, addWithinCityArea, updateWithinCityArea, deleteWithinCityArea,
    intercityRoutes, addIntercityRoute, updateIntercityRoute, deleteIntercityRoute
  } = useContext(PackersMoversContext);

  const [activeTab, setActiveTab] = useState('within_city'); // 'within_city' | 'intercity'
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [showRouteForm, setShowRouteForm] = useState(false);

  // Area Form State
  const [areaForm, setAreaForm] = useState({ city: 'Hyderabad', areaName: '', zone: 'West Zone', isActive: true });

  // Route Form State
  const [routeForm, setRouteForm] = useState({
    sourceCity: 'Hyderabad',
    destCity: '',
    baseDistanceKm: 300,
    baseFare: 8000,
    pricePerKm: 30,
    minFare: 8000,
    estimatedHours: '6-8 hrs',
    isActive: true
  });

  const handleSaveArea = (e) => {
    e.preventDefault();
    if (!areaForm.areaName.trim()) return;
    addWithinCityArea(areaForm);
    setAreaForm({ city: 'Hyderabad', areaName: '', zone: 'West Zone', isActive: true });
    setShowAreaForm(false);
  };

  const handleSaveRoute = (e) => {
    e.preventDefault();
    if (!routeForm.destCity.trim()) return;
    addIntercityRoute(routeForm);
    setRouteForm({ sourceCity: 'Hyderabad', destCity: '', baseDistanceKm: 300, baseFare: 8000, pricePerKm: 30, minFare: 8000, estimatedHours: '6-8 hrs', isActive: true });
    setShowRouteForm(false);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Sub-Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="var(--primary)" /> Service Area & Route Management
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Define operating zones for local within-city moves and configure inter-city corridor routes with custom per-km pricing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('within_city')}
            className={`btn ${activeTab === 'within_city' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px' }}
          >
            Within City Local Areas ({withinCityAreas.length})
          </button>
          <button
            onClick={() => setActiveTab('intercity')}
            className={`btn ${activeTab === 'intercity' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px' }}
          >
            Between Cities Routes ({intercityRoutes.length})
          </button>
        </div>
      </div>

      {/* 1. Within City Local Areas */}
      {activeTab === 'within_city' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>Active Localities in Hyderabad ({withinCityAreas.length})</span>
            <button className="btn btn-primary" onClick={() => setShowAreaForm(!showAreaForm)} style={{ fontSize: '12px', padding: '6px 12px' }}>
              <Plus size={14} /> Add Local Area
            </button>
          </div>

          {showAreaForm && (
            <form onSubmit={handleSaveArea} noValidate className="card" style={{ padding: '14px 18px', borderRadius: '8px', border: '2px solid var(--primary)', backgroundColor: 'var(--bg-main)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>City</label>
                  <input type="text" value={areaForm.city} onChange={(e) => setAreaForm(p => ({ ...p, city: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Locality / Area Name *</label>
                  <input type="text" required value={areaForm.areaName} onChange={(e) => setAreaForm(p => ({ ...p, areaName: e.target.value }))} placeholder="e.g. Manikonda, Miyapur" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Zone</label>
                  <select value={areaForm.zone} onChange={(e) => setAreaForm(p => ({ ...p, zone: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
                    <option value="West Zone">West Zone</option>
                    <option value="North Zone">North Zone</option>
                    <option value="Central Zone">Central Zone</option>
                    <option value="East Zone">East Zone</option>
                    <option value="South Zone">South Zone</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 16px' }}>Save Area</button>
              </div>
            </form>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {withinCityAreas.map(area => (
              <div key={area.id} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '13px' }}>{area.areaName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{area.city} • {area.zone}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => updateWithinCityArea(area.id, { isActive: !area.isActive })}
                    style={{ border: 'none', background: area.isActive ? '#DCFCE7' : '#FEE2E2', color: area.isActive ? '#15803D' : '#B91C1C', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {area.isActive ? 'Active' : 'Off'}
                  </button>
                  <button className="action-btn" style={{ color: '#EF4444' }} onClick={() => deleteWithinCityArea(area.id)}><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Between Cities Inter-city Routes */}
      {activeTab === 'intercity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>Inter-City Highways & Corridors ({intercityRoutes.length} Routes)</span>
            <button className="btn btn-primary" onClick={() => setShowRouteForm(!showRouteForm)} style={{ fontSize: '12px', padding: '6px 12px' }}>
              <Plus size={14} /> Add Inter-City Route
            </button>
          </div>

          {showRouteForm && (
            <form onSubmit={handleSaveRoute} noValidate className="card" style={{ padding: '16px 20px', borderRadius: '8px', border: '2px solid var(--primary)', backgroundColor: 'var(--bg-main)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700' }}>Configure Inter-City Pricing Corridor</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Source City</label>
                  <input type="text" value={routeForm.sourceCity} onChange={(e) => setRouteForm(p => ({ ...p, sourceCity: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Destination City *</label>
                  <input type="text" required value={routeForm.destCity} onChange={(e) => setRouteForm(p => ({ ...p, destCity: e.target.value }))} placeholder="e.g. Vijayawada" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Est. Distance (Km)</label>
                  <input type="number" value={routeForm.baseDistanceKm} onChange={(e) => setRouteForm(p => ({ ...p, baseDistanceKm: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Base Fare (₹)</label>
                  <input type="number" value={routeForm.baseFare} onChange={(e) => setRouteForm(p => ({ ...p, baseFare: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Per Km Rate (₹)</label>
                  <input type="number" value={routeForm.pricePerKm} onChange={(e) => setRouteForm(p => ({ ...p, pricePerKm: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Minimum Fare (₹)</label>
                  <input type="number" value={routeForm.minFare} onChange={(e) => setRouteForm(p => ({ ...p, minFare: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRouteForm(false)} style={{ fontSize: '12px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ fontSize: '12px' }}>Save Route</button>
              </div>
            </form>
          )}

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Route Origin ➔ Destination</th>
                  <th>Base Distance</th>
                  <th>Base Fare</th>
                  <th>Per KM Fare</th>
                  <th>Min Fare</th>
                  <th>Est. Transit Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {intercityRoutes.map(route => (
                  <tr key={route.id}>
                    <td style={{ fontWeight: '700' }}>
                      <span style={{ color: 'var(--primary)' }}>{route.sourceCity}</span> ➔ <strong>{route.destCity}</strong>
                    </td>
                    <td>{route.baseDistanceKm} km</td>
                    <td style={{ fontWeight: '600' }}>₹{route.baseFare.toLocaleString()}</td>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>₹{route.pricePerKm}/km</td>
                    <td>₹{route.minFare.toLocaleString()}</td>
                    <td>{route.estimatedHours}</td>
                    <td>
                      <button
                        onClick={() => updateIntercityRoute(route.id, { isActive: !route.isActive })}
                        style={{ border: 'none', background: route.isActive ? '#DCFCE7' : '#FEE2E2', color: route.isActive ? '#15803D' : '#B91C1C', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        {route.isActive ? '🟢 Active' : '⚪ Disabled'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="action-btn" style={{ color: '#EF4444' }} onClick={() => { if (confirm('Delete route?')) deleteIntercityRoute(route.id); }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
