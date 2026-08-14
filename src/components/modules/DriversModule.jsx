import React, { useState, useEffect, useContext } from 'react';
import { Eye, Check, X, ShieldAlert, Phone, Truck, Star, Award, Wallet, Calendar, ListFilter, Search, Trash2 } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function DriversModule() {
  const { drivers, orders, vehicles, approveDriverVerification, rejectDriverVerification, deleteDriver } = useContext(AppStateContext);

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('porter_drivers_active_tab') || 'all';
  });

  useEffect(() => {
    localStorage.setItem('porter_drivers_active_tab', activeTab);
    window.dispatchEvent(new Event('storage-update'));
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // overview, trips, docs, earnings

  // Filter drivers
  const filteredDrivers = drivers.filter(driver => {
    if (activeTab === 'online' && driver.status !== 'online') return false;
    if (activeTab === 'verification' && driver.status !== 'verification_requests') return false;

    const query = searchQuery.toLowerCase();
    return (
      driver.name.toLowerCase().includes(query) ||
      driver.phone.includes(query) ||
      driver.vehicleNo.toLowerCase().includes(query)
    );
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'online': return 'badge-online';
      case 'offline': return 'badge-offline';
      case 'rejected': return 'badge-cancelled';
      default: return 'badge-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'rejected': return 'Rejected';
      default: return 'Pending Verification';
    }
  };

  const handleOpenDetails = (driver) => {
    setSelectedDriver(driver);
    setDetailTab('overview');
  };

  const handleApprove = (id) => {
    approveDriverVerification(id);
    if (selectedDriver && selectedDriver.id === id) {
      setSelectedDriver(prev => ({ ...prev, status: 'online', docs: { ...prev.docs, verified: true, license: 'Verified', rc: 'Verified' } }));
    }
  };

  const handleReject = (id) => {
    rejectDriverVerification(id);
    if (selectedDriver && selectedDriver.id === id) {
      setSelectedDriver(prev => ({ ...prev, status: 'rejected', docs: { ...prev.docs, verified: false, license: 'Rejected', rc: 'Rejected' } }));
    }
  };

  // Get completed orders for selected driver
  const getDriverTrips = (name) => {
    return orders.filter(o => o.driver === name);
  };

  return (
    <div className="animate-fade">
      {/* Tabs */}
      <div className="tab-group">
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => { setActiveTab('all'); setSearchQuery(''); }}>All Drivers ({drivers.length})</button>
        <button className={`tab-btn ${activeTab === 'online' ? 'active' : ''}`} onClick={() => { setActiveTab('online'); setSearchQuery(''); }}>Online Drivers ({drivers.filter(d => d.status === 'online').length})</button>
        <button className={`tab-btn ${activeTab === 'verification' ? 'active' : ''}`} onClick={() => { setActiveTab('verification'); setSearchQuery(''); }}>Verification Requests ({drivers.filter(d => d.status === 'verification_requests').length})</button>
      </div>

      {/* Grid Filters */}
      <div className="table-container">
        <div className="table-header-controls">
          <div className="search-input-wrapper">
            <Search className="header-search-icon" size={14} />
            <input
              type="text"
              placeholder="Search drivers by name, phone, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table list */}
        <table className="custom-table">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>Phone</th>
              <th>Vehicle Type</th>
              <th>Plate Number</th>
              <th>Status</th>
              <th>Trips</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlignment: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No drivers found.
                </td>
              </tr>
            ) : (
              filteredDrivers.map(driver => (
                <tr key={driver.id}>
                  <td style={{ fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#F1F5F9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {driver.profilePhotoUri && !driver.profilePhotoUri.startsWith('blob:')
                          ? <img src={driver.profilePhotoUri} alt={driver.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }}/>
                          : <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{(driver.name || '?')[0].toUpperCase()}</span>
                        }
                      </div>
                      {driver.name}
                    </div>
                  </td>
                  <td>{driver.phone}</td>
                  <td>{driver.vehicleType || driver.vehicle || 'N/A'}</td>
                  <td>{driver.vehicleNo}</td>
                  <td>
                    <span className={`badge ${getStatusClass(driver.status)}`}>
                      {getStatusText(driver.status)}
                    </span>
                  </td>
                  <td>{driver.trips}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <Star size={14} fill="#F59E0B" color="#F59E0B" /> {driver.rating > 0 ? driver.rating : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="action-row">
                      <button
                        className="action-btn btn-view"
                        title="View Details"
                        onClick={() => handleOpenDetails(driver)}
                      >
                        <Eye size={16} />
                      </button>

                      {driver.status === 'verification_requests' && (
                        <>
                          <button
                            className="action-btn"
                            style={{ color: '#10B981', backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' }}
                            title="Approve Driver"
                            onClick={() => handleApprove(driver.id)}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="action-btn"
                            style={{ color: '#EF4444', backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}
                            title="Reject Driver"
                            onClick={() => handleReject(driver.id)}
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}

                      <button
                        className="action-btn"
                        style={{ color: '#EF4444', backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}
                        title="Delete Driver"
                        onClick={() => deleteDriver(driver.id)}
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

      {/* Driver Detail Drawer / Modal */}
      {selectedDriver && (
        <div className="modal-backdrop" onClick={() => setSelectedDriver(null)}>
          <div className="modal-container" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Driver Profile - {selectedDriver.name}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedDriver(null)}><X size={20} /></button>
            </div>

            {/* Modal Sub-Tabs */}
            <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
              <button className={`tab-btn ${detailTab === 'overview' ? 'active' : ''}`} style={{ fontSize: '13px', padding: '10px 14px' }} onClick={() => setDetailTab('overview')}>Overview</button>
              <button className={`tab-btn ${detailTab === 'trips' ? 'active' : ''}`} style={{ fontSize: '13px', padding: '10px 14px' }} onClick={() => setDetailTab('trips')}>Trips History</button>
              <button className={`tab-btn ${detailTab === 'docs' ? 'active' : ''}`} style={{ fontSize: '13px', padding: '10px 14px' }} onClick={() => setDetailTab('docs')}>Documents</button>
              <button className={`tab-btn ${detailTab === 'earnings' ? 'active' : ''}`} style={{ fontSize: '13px', padding: '10px 14px' }} onClick={() => setDetailTab('earnings')}>Earnings</button>
            </div>

            <div className="modal-body" style={{ minHeight: '300px' }}>
              {detailTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                      {selectedDriver.profilePhotoUri ? (
                        <img
                          src={selectedDriver.profilePhotoUri}
                          alt={selectedDriver.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div style={{ display: selectedDriver.profilePhotoUri ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={36} color="var(--primary)" />
                      </div>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '18px' }}>{selectedDriver.name}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{selectedDriver.phone}</p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <span className={`badge ${getStatusClass(selectedDriver.status)}`}>{getStatusText(selectedDriver.status)}</span>
                        {selectedDriver.docs?.verified && <span className="badge badge-online">Verified Partner</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rating</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Star size={16} fill="#F59E0B" color="#F59E0B" /> {selectedDriver.rating > 0 ? selectedDriver.rating : 'N/A'}
                      </div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trips Completed</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '4px' }}>{selectedDriver.trips || 0}</div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Earnings</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '4px' }}>₹{(selectedDriver.earnings || 0).toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Vehicle Specifications</h4>
                    <table className="custom-table" style={{ border: '1px solid var(--border-color)' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)', width: '30%' }}>Vehicle Type</td>
                          <td>{selectedDriver.vehicleType || selectedDriver.vehicle || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>License Plate</td>
                          <td>{selectedDriver.vehicleNo}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Onboarding Date</td>
                          <td>2026-02-14</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {detailTab === 'trips' && (
                <div>
                  <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Recent Order Logs</h4>
                  {getDriverTrips(selectedDriver.name).length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No active or completed orders logged for this driver.
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Route</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getDriverTrips(selectedDriver.name).map(trip => (
                            <tr key={trip.id}>
                              <td style={{ fontWeight: '700' }}>#{trip.id}</td>
                              <td>{trip.customer}</td>
                              <td>{trip.pickup.split(',')[0]} → {trip.drop.split(',')[0]}</td>
                              <td>₹{trip.amount}</td>
                              <td>
                                <span className={`badge ${getStatusClass(trip.status)}`}>{trip.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'docs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ fontSize: '14px' }}>Uploaded Verification Scans</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    {/* Driver License Card */}
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ padding: '10px 16px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>Driver License (DL)</span>
                        <span className="badge" style={{
                          backgroundColor: selectedDriver.docs?.license === 'Verified' ? '#D1FAE5' : selectedDriver.docs?.license === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                          color: selectedDriver.docs?.license === 'Verified' ? '#10B981' : selectedDriver.docs?.license === 'Rejected' ? '#EF4444' : '#F59E0B'
                        }}>{selectedDriver.docs?.license || 'Pending'}</span>
                      </div>
                      <div style={{ height: '160px', backgroundColor: '#E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {selectedDriver.docs?.licenseUrl ? (
                          <>
                            <img 
                              src={selectedDriver.docs.licenseUrl} 
                              alt="License Scan" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', textAlign: 'center' }}>
                              <ShieldAlert size={28} color="#F59E0B" />
                              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Scan Uploaded (S3 Protected)</span>
                              <a href={selectedDriver.docs.licenseUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'underline' }}>Open Image Link</a>
                            </div>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No document scan uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Registration Certificate Card */}
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ padding: '10px 16px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>Registration Certificate (RC)</span>
                        <span className="badge" style={{
                          backgroundColor: selectedDriver.docs?.rc === 'Verified' ? '#D1FAE5' : selectedDriver.docs?.rc === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                          color: selectedDriver.docs?.rc === 'Verified' ? '#10B981' : selectedDriver.docs?.rc === 'Rejected' ? '#EF4444' : '#F59E0B'
                        }}>{selectedDriver.docs?.rc || 'Pending'}</span>
                      </div>
                      <div style={{ height: '160px', backgroundColor: '#E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {selectedDriver.docs?.rcUrl ? (
                          <>
                            <img 
                              src={selectedDriver.docs.rcUrl} 
                              alt="RC Scan" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', textAlign: 'center' }}>
                              <ShieldAlert size={28} color="#F59E0B" />
                              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Scan Uploaded (S3 Protected)</span>
                              <a href={selectedDriver.docs.rcUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'underline' }}>Open Image Link</a>
                            </div>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No document scan uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Commercial Road Permit Card */}
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ padding: '10px 16px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>Commercial Road Permit</span>
                        <span className="badge" style={{
                          backgroundColor: selectedDriver.docs?.rc === 'Verified' ? '#D1FAE5' : selectedDriver.docs?.rc === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                          color: selectedDriver.docs?.rc === 'Verified' ? '#10B981' : selectedDriver.docs?.rc === 'Rejected' ? '#EF4444' : '#F59E0B'
                        }}>{selectedDriver.docs?.rc || 'Pending'}</span>
                      </div>
                      <div style={{ height: '160px', backgroundColor: '#E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedDriver.docs?.rcUrl ? (
                          <img src={selectedDriver.docs.rcUrl} alt="Permit Scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
                        ) : null}
                        <div style={{ display: selectedDriver.docs?.rcUrl ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <Truck size={28} color="var(--primary)" />
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Commercial Permit Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedDriver.status === 'verification_requests' && (
                    <div style={{ padding: '16px', border: '1px solid #C084FC', backgroundColor: '#EDE9FE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <ShieldAlert size={20} color="#8B5CF6" />
                        <span style={{ fontSize: '13px', color: '#6B21A8', fontWeight: '500' }}>This driver is awaiting document verification.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => handleApprove(selectedDriver.id)}>Approve</button>
                        <button className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => handleReject(selectedDriver.id)}>Reject</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'earnings' && (
                <div className="tab-pane">
                  <div className="dashboard-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', width: '48px', height: '48px' }}>
                      <Wallet size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600' }}>Payout Settlement Overview</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Wallet ledger and pending cash collections.</p>
                    </div>
                  </div>

                  {(() => {
                    const vehicleMatch = vehicles?.find(v => v.vehicleId === selectedDriver.vehicleType || v.name === selectedDriver.vehicle);
                    const commPct = vehicleMatch?.commissionPercentage != null ? vehicleMatch.commissionPercentage : 5.0;
                    const adminCut = Math.round(selectedDriver.earnings * (commPct / 100));
                    const driverBalance = selectedDriver.earnings - adminCut;
                    return (
                      <table className="custom-table" style={{ border: '1px solid var(--border-color)' }}>
                        <tbody>
                          <tr>
                            <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)', width: '40%' }}>Total Partner Earnings</td>
                            <td style={{ fontWeight: '700' }}>₹{selectedDriver.earnings.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Admin Commission ({commPct}%)</td>
                            <td>₹{adminCut.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Pending Cash collection</td>
                            <td>₹0</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Current Balance</td>
                            <td style={{ color: '#10B981', fontWeight: '700' }}>₹{driverBalance.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedDriver(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}