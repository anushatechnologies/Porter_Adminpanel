import React, { useState, useEffect, useContext } from 'react';
import { Eye, Check, X, ShieldAlert, Phone, Truck, Star, Award, Wallet, Calendar, ListFilter, Search, Trash2 } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function DriversModule() {
  const { drivers, orders, vehicles, approveDriverVerification, rejectDriverVerification, deleteDriver, rechargeDriverWallet, getDriverWalletHistory } = useContext(AppStateContext);

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

  // Live Wallet & Transaction Ledger State
  const [driverWalletLedger, setDriverWalletLedger] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Recharge Modal State
  const [rechargeModalDriver, setRechargeModalDriver] = useState(null);
  const [rechargeAmount, setRechargeAmount] = useState('500');
  const [rechargeNotes, setRechargeNotes] = useState('Admin Wallet Top-up');
  const [rechargeRef, setRechargeRef] = useState('');
  const [rechargeProcessing, setRechargeProcessing] = useState(false);

  // Fetch wallet history when earnings/wallet tab is selected
  useEffect(() => {
    if (selectedDriver && detailTab === 'earnings' && getDriverWalletHistory) {
      setLoadingLedger(true);
      getDriverWalletHistory(selectedDriver.id || selectedDriver.driverId)
        .then(data => {
          if (data) setDriverWalletLedger(data);
        })
        .finally(() => setLoadingLedger(false));
    }
  }, [selectedDriver, detailTab]);

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

        {/* Commission Policy & Wallet Header Notice */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#2563EB', fontWeight: '700' }}>
              ⚡ 5% Platform Commission
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Drivers require <strong>Wallet &gt; ₹0</strong> to appear on the Order Assignment list. 5% commission cut applies per trip.
            </span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Total Fleet Available Balance: {(() => {
              const total = drivers.reduce((sum, d) => sum + (d.walletBalance != null ? Number(d.walletBalance) : (Number(d.wallet) || 0)), 0);
              return (
                <strong style={{ color: total >= 0 ? '#059669' : '#DC2626' }}>
                  {total < 0 ? `-₹${Math.abs(total).toFixed(2)}` : `₹${total.toFixed(2)}`}
                </strong>
              );
            })()}
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
              <th>Available Wallet Balance</th>
              <th>Status</th>
              <th>Trips</th>
              <th>Rating</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
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
                    {(() => {
                      const bal = driver.walletBalance != null ? Number(driver.walletBalance) : (Number(driver.wallet) || 0);
                      const isPositive = bal > 0;
                      const formatted = bal < 0 
                        ? `-₹${Math.abs(bal).toFixed(2)}`
                        : `₹${bal.toFixed(2)}`;

                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: '700', color: isPositive ? '#059669' : '#DC2626', fontSize: '13px' }}>
                            {formatted}
                          </span>
                          {!isPositive && (
                            <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '10px', padding: '2px 6px', fontWeight: '700' }}>
                              {bal < 0 ? 'Negative (Recharge Required)' : '₹0 (Hidden from Assign)'}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td>
                    <span className={`badge ${getStatusClass(driver.status)}`}>
                      {getStatusText(driver.status)}
                    </span>
                  </td>
                  <td>{driver.trips}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <Star size={14} fill="#F59E0B" color="#F59E0B" /> {driver.rating > 0 ? parseFloat(driver.rating).toFixed(1) : 'N/A'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-row" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="action-btn"
                        style={{ color: '#2563EB', backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', padding: '4px 8px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
                        title="Recharge Driver Wallet"
                        onClick={() => {
                          setRechargeModalDriver(driver);
                          setRechargeAmount('500');
                        }}
                      >
                        <Wallet size={14} /> Recharge
                      </button>

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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rating</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Star size={15} fill="#F59E0B" color="#F59E0B" /> {selectedDriver.rating > 0 ? parseFloat(selectedDriver.rating).toFixed(1) : 'N/A'}
                      </div>
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trips Completed</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>{selectedDriver.trips || 0}</div>
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wallet Balance</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px', color: (selectedDriver.walletBalance || selectedDriver.wallet || 0) > 0 ? '#059669' : '#DC2626' }}>
                        ₹{(selectedDriver.walletBalance || selectedDriver.wallet || 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trip Earnings</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', color: '#2563EB' }}>
                        ₹{(selectedDriver.earnings || 0).toLocaleString()}
                      </div>
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
                          <td>{selectedDriver.vehicleNo || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Onboarding Date</td>
                          <td>{selectedDriver.createdAt ? new Date(selectedDriver.createdAt).toLocaleDateString() : '2026-02-14'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Address Details */}
                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px', marginTop: '16px' }}>Address Details</h4>
                    <table className="custom-table" style={{ border: '1px solid var(--border-color)' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)', width: '30%' }}>Email</td>
                          <td>{selectedDriver.email || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Full Address</td>
                          <td style={{ whiteSpace: 'normal' }}>{selectedDriver.addressLine1 || selectedDriver.address || selectedDriver.homeAddress || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>City</td>
                          <td>{selectedDriver.city || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>State</td>
                          <td>{selectedDriver.state || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Pincode</td>
                          <td>{selectedDriver.pincode || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Additional KYC Info */}
                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px', marginTop: '16px' }}>Identity & Bank Details</h4>
                    <table className="custom-table" style={{ border: '1px solid var(--border-color)' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)', width: '30%' }}>Date of Birth</td>
                          <td>{selectedDriver.dob || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Gender</td>
                          <td>{selectedDriver.gender || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Aadhaar Number</td>
                          <td>{selectedDriver.aadhaarNumber || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>License Number</td>
                          <td>{selectedDriver.licenseNumber || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>RC Number</td>
                          <td>{selectedDriver.rcNumber || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Bank Name</td>
                          <td>{selectedDriver.bankName || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Account Holder</td>
                          <td>{selectedDriver.accountHolderName || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Account Number</td>
                          <td>{selectedDriver.accountNumber || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>IFSC Code</td>
                          <td>{selectedDriver.ifscCode || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</td>
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

              {detailTab === 'earnings' && (() => {
                const recentTxns = driverWalletLedger?.recentTransactions || [];
                const totalRecharges = recentTxns.filter(t => t.type === 'RECHARGE').reduce((s, t) => s + (Number(t.amount) || 0), 0);
                const totalTripEarnings = recentTxns.filter(t => t.type === 'ORDER_EARNING').reduce((s, t) => s + (Number(t.amount) || 0), 0);
                const totalCommissionDeductions = recentTxns.filter(t => t.type === 'COMMISSION_DEDUCTION').reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0);
                const currentBal = selectedDriver.walletBalance != null ? Number(selectedDriver.walletBalance) : (Number(selectedDriver.wallet) || 0);

                return (
                  <div className="tab-pane">
                    <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--surface)', padding: '16px 20px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', width: '48px', height: '48px' }}>
                          <Wallet size={24} />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700' }}>Driver Wallet & Earnings Account</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                            Current Available Balance: <strong style={{ color: currentBal > 0 ? '#059669' : '#DC2626', fontSize: '14px' }}>₹{currentBal.toLocaleString()}</strong>
                            {currentBal > 0 ? (
                              <span className="badge" style={{ backgroundColor: '#DCFCE7', color: '#15803D', marginLeft: '8px', fontSize: '10px', fontWeight: '700' }}>● Eligible for Orders</span>
                            ) : (
                              <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', marginLeft: '8px', fontSize: '10px', fontWeight: '700' }}>● Recharge Needed (Hidden from Assign)</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                        onClick={() => {
                          setRechargeModalDriver(selectedDriver);
                          setRechargeAmount('500');
                          setRechargeRef(`PAY_REF_${Date.now()}`);
                        }}
                      >
                        <Wallet size={15} /> + Recharge Driver Wallet
                      </button>
                    </div>

                    {/* Breakdown Summary Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Current Balance</div>
                        <div style={{ fontSize: '17px', fontWeight: '800', marginTop: '4px', color: currentBal > 0 ? '#059669' : '#DC2626' }}>₹{currentBal.toLocaleString()}</div>
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Admin Recharges</div>
                        <div style={{ fontSize: '17px', fontWeight: '800', marginTop: '4px', color: '#2563EB' }}>+₹{totalRecharges.toLocaleString()}</div>
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Trip Earnings Credited</div>
                        <div style={{ fontSize: '17px', fontWeight: '800', marginTop: '4px', color: '#059669' }}>+₹{totalTripEarnings.toLocaleString()}</div>
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>5% Platform Fees</div>
                        <div style={{ fontSize: '17px', fontWeight: '800', marginTop: '4px', color: '#DC2626' }}>-₹{totalCommissionDeductions.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Breakdown Formula Notice */}
                    <div style={{ padding: '10px 14px', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '16px', fontSize: '11px', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>💡</span>
                      <span><strong>Wallet Breakdown:</strong> Balance (₹{currentBal.toLocaleString()}) = Admin Recharges (+₹{totalRecharges.toLocaleString()}) + Trip Earnings (+₹{totalTripEarnings.toLocaleString()}) - 5% Platform Fees (-₹{totalCommissionDeductions.toLocaleString()}).</span>
                    </div>

                    {/* Real Transaction Ledger from GET /api/drivers/{id}/wallet */}
                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ListFilter size={16} color="var(--primary)" /> Wallet Transaction History & Commission Ledger
                    </h4>

                    {loadingLedger ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading live wallet ledger...</div>
                    ) : recentTxns.length > 0 ? (
                      <table className="custom-table" style={{ border: '1px solid var(--border-color)', fontSize: '12px' }}>
                        <thead>
                          <tr>
                            <th>Txn ID</th>
                            <th>Transaction Type</th>
                            <th>Amount</th>
                            <th>Order Ref</th>
                            <th>Balance After</th>
                            <th>Date & Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentTxns.map(tx => {
                            const isRecharge = tx.type === 'RECHARGE';
                            const isEarning = tx.type === 'ORDER_EARNING';
                            const isCommission = tx.type === 'COMMISSION_DEDUCTION';

                            const badgeBg = isRecharge ? '#EFF6FF' : isEarning ? '#DCFCE7' : isCommission ? '#FEF2F2' : '#F1F5F9';
                            const badgeColor = isRecharge ? '#2563EB' : isEarning ? '#15803D' : isCommission ? '#DC2626' : 'var(--text-main)';
                            const label = isRecharge ? '💰 Admin Recharge' : isEarning ? '🚚 Trip Fare Credited' : isCommission ? '⚡ 5% Platform Fee' : tx.type;

                            return (
                              <tr key={tx.id}>
                                <td><code>{tx.id}</code></td>
                                <td>
                                  <span className="badge" style={{
                                    backgroundColor: badgeBg,
                                    color: badgeColor,
                                    fontSize: '11px',
                                    fontWeight: '700'
                                  }}>
                                    {label}
                                  </span>
                                </td>
                                <td style={{ fontWeight: '700', color: tx.amount > 0 ? '#059669' : '#DC2626' }}>
                                  {tx.amount > 0 ? `+₹${tx.amount.toLocaleString()}` : `-₹${Math.abs(tx.amount).toLocaleString()}`}
                                </td>
                                <td>{tx.orderId ? <code>#{tx.orderId}</code> : '—'}</td>
                                <td style={{ fontWeight: '700' }}>₹{tx.balanceAfter != null ? tx.balanceAfter.toLocaleString() : '—'}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', fontSize: '12px' }}>
                        No wallet transactions recorded yet for this driver. Click <strong>+ Recharge Driver Wallet</strong> to add funds.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedDriver(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Driver Wallet Modal */}
      {rechargeModalDriver && (
        <div className="modal-backdrop" onClick={() => !rechargeProcessing && setRechargeModalDriver(null)}>
          <div className="modal-container" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={18} />
                </div>
                <h3 className="modal-title" style={{ margin: 0 }}>Recharge Driver Wallet</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => !rechargeProcessing && setRechargeModalDriver(null)}><X size={20} /></button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const amt = parseFloat(rechargeAmount);
                if (isNaN(amt) || amt <= 0) {
                  alert('Please enter a valid recharge amount (> ₹0).');
                  return;
                }
                setRechargeProcessing(true);
                const res = await rechargeDriverWallet(rechargeModalDriver.id || rechargeModalDriver.driverId, amt, rechargeNotes, rechargeRef);
                setRechargeProcessing(false);
                if (res?.success) {
                  const txnMsg = res.transactionId ? `\nTransaction ID: ${res.transactionId}` : '';
                  const balMsg = res.newBalance != null ? `\nNew Wallet Balance: ₹${res.newBalance.toLocaleString()}` : '';
                  alert(`✅ Wallet recharged successfully with ₹${amt.toLocaleString()} for ${rechargeModalDriver.name}!${balMsg}${txnMsg}`);
                  setRechargeModalDriver(null);
                  if (selectedDriver && getDriverWalletHistory) {
                    getDriverWalletHistory(selectedDriver.id || selectedDriver.driverId).then(d => d && setDriverWalletLedger(d));
                  }
                } else {
                  alert(`Recharge failed: ${res?.message || res?.error || 'Server error'}`);
                }
              }}
              className="modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{rechargeModalDriver.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {rechargeModalDriver.driverId || rechargeModalDriver.id} • {rechargeModalDriver.phone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Current Wallet</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: (rechargeModalDriver.wallet || 0) > 0 ? '#059669' : '#DC2626' }}>
                    ₹{(rechargeModalDriver.wallet || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Select Quick Amount (₹)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
                  {['100', '500', '1000', '2000'].map(val => (
                    <button
                      key={val}
                      type="button"
                      className="btn"
                      style={{
                        backgroundColor: rechargeAmount === val ? 'var(--primary)' : 'var(--bg-main)',
                        color: rechargeAmount === val ? '#FFF' : 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        fontWeight: '700',
                        fontSize: '13px',
                        padding: '8px 0'
                      }}
                      onClick={() => setRechargeAmount(val)}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>

                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Custom Recharge Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="Enter recharge amount..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Recharge Reference / Note</label>
                <input
                  type="text"
                  value={rechargeNotes}
                  onChange={(e) => setRechargeNotes(e.target.value)}
                  placeholder="e.g. UPI / Cash Payment Received"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', fontSize: '11px', color: '#2563EB' }}>
                ⚡ Recharging driver wallet enables them to appear on the <strong>Order Assignment List</strong>. 5% platform commission cut applies automatically per trip.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRechargeModalDriver(null)}
                  disabled={rechargeProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={rechargeProcessing}
                >
                  {rechargeProcessing ? 'Processing...' : 'Confirm Wallet Recharge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}