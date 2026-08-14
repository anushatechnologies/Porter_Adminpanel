import React, { useState, useEffect, useContext } from 'react';
import { Eye, Car, ShieldAlert, Award, FileText, CheckCircle2, Search, Trash2 } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function VehiclesModule() {
  const { drivers, vehicles: initialVehicles, deleteVehicle } = useContext(AppStateContext);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('porter_vehicles_active_tab') || 'all';
  });

  useEffect(() => {
    localStorage.setItem('porter_vehicles_active_tab', activeTab);
    window.dispatchEvent(new Event('storage-update'));
  }, [activeTab]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');



  // Map driver verification status to vehicle status
  const vehicles = initialVehicles.map(veh => {
    const ownerDriver = drivers.find(d => d.name === veh.owner);
    let status = 'Verified';
    if (ownerDriver) {
      if (ownerDriver.status === 'rejected') {
        status = 'Rejected';
      } else if (!ownerDriver.docs?.verified) {
        status = 'Pending Verification';
      }
    }
    return {
      ...veh,
      status
    };
  });

  const filteredVehicles = vehicles.filter(veh => {
    if (activeTab === 'pending' && veh.status !== 'Pending Verification') return false;

    const query = searchQuery.toLowerCase();
    return (
      String(veh.id || '').toLowerCase().includes(query) ||
      String(veh.model || '').toLowerCase().includes(query) ||
      String(veh.plate || '').toLowerCase().includes(query) ||
      String(veh.owner || '').toLowerCase().includes(query) ||
      String(veh.type || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="animate-fade">
      <div className="tab-group">
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => { setActiveTab('all'); setSearchQuery(''); }}>All Vehicles ({vehicles.length})</button>
        <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => { setActiveTab('pending'); setSearchQuery(''); }}>Pending Verification ({vehicles.filter(v => v.status === 'Pending Verification').length})</button>
      </div>

      <div className="table-container">
        <div className="table-header-controls">
          <div className="search-input-wrapper">
            <Search className="header-search-icon" size={14} />
            <input
              type="text"
              placeholder="Search vehicles by model, plate, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Model</th>
              <th>Type</th>
              <th>License Plate</th>
              <th>Owner Name</th>
              <th>Trips Completed</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlignment: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No vehicles found.
                </td>
              </tr>
            ) : (
              filteredVehicles.map(veh => (
                <tr key={veh.id}>
                  <td style={{ fontWeight: '700' }}>{veh.id}</td>
                  <td style={{ fontWeight: '600' }}>{veh.model}</td>
                  <td>{veh.type}</td>
                  <td style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>{veh.plate}</td>
                  <td>{veh.owner}</td>
                  <td>{veh.trips}</td>
                  <td>{veh.capacity}</td>
                  <td>
                    <span className={`badge ${veh.status === 'Verified' ? 'badge-online' : veh.status === 'Rejected' ? 'badge-cancelled' : 'badge-pending'}`}>
                      {veh.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-row" style={{ display: 'flex', gap: '6px' }}>
                      <button className="action-btn btn-view" onClick={() => setSelectedVehicle(veh)} title="View Documents">
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn"
                        style={{ color: '#EF4444', backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}
                        title="Delete Vehicle"
                        onClick={() => deleteVehicle(veh.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedVehicle && (
        <div className="modal-backdrop" onClick={() => setSelectedVehicle(null)}>
          <div className="modal-container" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Vehicle Verification Info - {selectedVehicle.id}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedVehicle(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Car size={32} color="var(--primary)" />
                <div>
                  <h4 style={{ fontSize: '16px' }}>{selectedVehicle.model}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Plate No: {selectedVehicle.plate} • Owner: {selectedVehicle.owner}</p>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', marginBottom: '8px' }}>Documents checklist</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Registration Certificate (RC)</span>
                    <span className="badge badge-online">Verified</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Commercial Road Permit</span>
                    <span className="badge badge-online">Verified</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Vehicle Insurance Certificate</span>
                    <span className="badge" style={{
                      backgroundColor: selectedVehicle.status === 'Verified' ? '#D1FAE5' : selectedVehicle.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                      color: selectedVehicle.status === 'Verified' ? '#10B981' : selectedVehicle.status === 'Rejected' ? '#EF4444' : '#F59E0B'
                    }}>
                      {selectedVehicle.status === 'Verified' ? 'Verified' : selectedVehicle.status === 'Rejected' ? 'Rejected' : 'Pending Review'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', marginBottom: '12px' }}>Uploaded document scans</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  {/* Registration Certificate (RC) Scan */}
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 16px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>Registration Certificate (RC)</span>
                      <span className="badge badge-online">Verified</span>
                    </div>
                    <div style={{ height: '140px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(() => {
                        const ownerDriver = drivers.find(d => d.name === selectedVehicle.owner);
                        const url = ownerDriver?.docs?.rcUrl || 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=500';
                        return <img src={url} alt="RC scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                      })()}
                    </div>
                  </div>

                  {/* Commercial Road Permit Scan */}
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 16px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>Commercial Permit</span>
                      <span className="badge badge-online">Verified</span>
                    </div>
                    <div style={{ height: '140px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=500" alt="Permit Scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>

                  {/* Insurance Certificate Scan */}
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 16px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>Insurance Certificate</span>
                      <span className="badge" style={{
                        backgroundColor: selectedVehicle.status === 'Verified' ? '#D1FAE5' : selectedVehicle.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                        color: selectedVehicle.status === 'Verified' ? '#10B981' : selectedVehicle.status === 'Rejected' ? '#EF4444' : '#F59E0B'
                      }}>{selectedVehicle.status === 'Verified' ? 'Verified' : selectedVehicle.status === 'Rejected' ? 'Rejected' : 'Pending'}</span>
                    </div>
                    <div style={{ height: '140px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500" alt="Insurance Scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedVehicle(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}