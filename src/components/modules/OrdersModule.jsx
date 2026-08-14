import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, UserCheck, Ban, RefreshCw, X, MapPin, Phone, CreditCard, Clock, Truck, ShieldCheck, User, Search } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function OrdersModule() {
  const { orders, drivers, assignDriver, updateOrderStatus } = useContext(AppStateContext);

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || searchParams.get('customer') || '';

  const [activeTab, setActiveTab] = useState(() => {
    return initialSearch ? 'all' : (localStorage.getItem('porter_orders_active_tab') || 'all');
  });

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
      setActiveTab('all');
    }
  }, [initialSearch]);

  useEffect(() => {
    localStorage.setItem('porter_orders_active_tab', activeTab);
    window.dispatchEvent(new Event('storage-update'));
  }, [activeTab]);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assigningOrderId, setAssigningOrderId] = useState(null);

  const isPendingStatus = (s) => ['pending', 'searching', 'created'].includes(s);
  const isAssignedStatus = (s) => ['assigned', 'driver_assigned', 'accepted'].includes(s);
  const isTransitStatus = (s) => ['transit', 'pickup_started', 'on_way', 'in_transit'].includes(s);
  const isCompletedStatus = (s) => ['completed', 'delivered', 'finished', 'done', 'success'].includes(s);
  const isCancelledStatus = (s) => ['cancelled', 'rejected', 'failed'].includes(s);
  const isActiveStatus = (s) => isPendingStatus(s) || isAssignedStatus(s) || isTransitStatus(s) || s === 'active';

  // Filters logic
  const filteredOrders = orders.filter(order => {
    // Tab filtering
    const status = (order.status || order.rawStatus || '').toLowerCase();
    if (activeTab === 'active' && !isActiveStatus(status)) return false;
    if (activeTab === 'cancelled' && !isCancelledStatus(status)) return false;
    if (activeTab === 'scheduled' && !isPendingStatus(status)) return false;
    if (activeTab === 'completed' && !isCompletedStatus(status)) return false;

    // Search query filtering
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (order.id || '').toLowerCase().includes(query) ||
      (order.customer || '').toLowerCase().includes(query) ||
      (order.pickup || '').toLowerCase().includes(query) ||
      (order.drop || '').toLowerCase().includes(query);
    if (!matchesSearch) return false;

    // Status select filtering
    if (statusFilter !== 'All') {
      const sf = statusFilter.toLowerCase();
      if (sf === 'pending' && !isPendingStatus(status)) return false;
      if (sf === 'assigned' && !isAssignedStatus(status)) return false;
      if (sf === 'transit' && !isTransitStatus(status)) return false;
      if (sf === 'completed' && status !== 'completed') return false;
      if (sf === 'cancelled' && status !== 'cancelled') return false;
    }

    return true;
  });

  const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (isPendingStatus(s)) return 'badge-pending';
    if (isTransitStatus(s)) return 'badge-transit';
    if (s === 'completed') return 'badge-completed';
    if (isAssignedStatus(s)) return 'badge-assigned';
    return 'badge-cancelled';
  };

  const handleOpenAssignModal = (orderId) => {
    setAssigningOrderId(orderId);
  };

  const handleAssignDriver = (driverId) => {
    assignDriver(assigningOrderId, driverId);
    setAssigningOrderId(null);
    // If details modal is open, refresh its data
    if (selectedOrder && selectedOrder.id === assigningOrderId) {
      const updated = orders.find(o => o.id === assigningOrderId);
      setSelectedOrder({ ...updated, driver: drivers.find(d => d.id === driverId)?.name, status: 'assigned' });
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const availableDrivers = drivers
    .filter(d => d.status && d.status.toLowerCase() === 'online')
    .map(d => {
      // Calculate a pseudo-distance since we don't have lat/lng geocoding
      const pseudoHash = ((d.id || 0).toString().charCodeAt(0) + (assigningOrderId || '').toString().charCodeAt(0) || 0) % 15;
      const distanceKm = pseudoHash + (Math.random() * 2).toFixed(1); // e.g. 3.4 km
      return { ...d, distanceKm: parseFloat(distanceKm) };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const allCount = orders.length;
  const activeCount = orders.filter(o => isActiveStatus((o.status || o.rawStatus || '').toLowerCase())).length;
  const scheduledCount = orders.filter(o => isPendingStatus((o.status || o.rawStatus || '').toLowerCase())).length;
  const completedCount = orders.filter(o => (o.status || o.rawStatus || '').toLowerCase() === 'completed').length;
  const cancelledCount = orders.filter(o => (o.status || o.rawStatus || '').toLowerCase() === 'cancelled').length;

  return (
    <div className="animate-fade">
      {/* Tabs */}
      <div className="tab-group">
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => { setActiveTab('all'); setSearchQuery(''); }}>All Orders ({allCount})</button>
        <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => { setActiveTab('active'); setSearchQuery(''); }}>Active Orders ({activeCount})</button>
        <button className={`tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`} onClick={() => { setActiveTab('scheduled'); setSearchQuery(''); }}>Scheduled Orders ({scheduledCount})</button>
        <button className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => { setActiveTab('completed'); setSearchQuery(''); }}>Completed Orders ({completedCount})</button>
        <button className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => { setActiveTab('cancelled'); setSearchQuery(''); }}>Cancelled Orders ({cancelledCount})</button>
      </div>

      {/* Filters bar */}
      <div className="table-container">
        <div className="table-header-controls">
          <div className="search-input-wrapper">
            <Search className="header-search-icon" size={14} />
            <input
              type="text"
              placeholder="Search by Order ID, customer, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            <select
              className="custom-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="transit">In Transit</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table grid */}
        <table className="custom-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Pickup Address</th>
              <th>Drop Address</th>
              <th>Driver</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlignment: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No matching orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: '700' }}>#{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.pickup}</td>
                  <td>{order.drop}</td>
                  <td>{order.driver ? order.driver : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>}</td>
                  <td style={{ fontWeight: '600' }}>₹{order.amount}</td>
                  <td>
                    <span className={`badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-row">
                      <button
                        className="action-btn btn-view"
                        title="View Details"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={16} />
                      </button>

                      {!order.driver && order.status !== 'cancelled' && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '11px', color: '#8B5CF6', backgroundColor: '#EDE9FE', borderColor: '#C084FC', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Assign Driver"
                          onClick={() => handleOpenAssignModal(order.id)}
                        >
                          <UserCheck size={14} /> Assign Driver
                        </button>
                      )}

                      {order.status !== 'cancelled' && order.status !== 'completed' && (
                        <button
                          className="action-btn"
                          style={{ color: '#EF4444', backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}
                          title="Cancel Order"
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                        >
                          <Ban size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Order Information - #{selectedOrder.id}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {/* Top summary row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Delivery Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <span className={`badge ${getStatusClass(selectedOrder.status)}`}>{selectedOrder.status}</span>
                    {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && selectedOrder.driver && (
                      <select
                        className="custom-select"
                        style={{ padding: '2px 8px', fontSize: '12px' }}
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      >
                        <option value="assigned">Assigned</option>
                        <option value="transit">In Transit</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}
                  </div>
                </div>
                <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Payment Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700' }}>₹{selectedOrder.amount}</span>
                    <span className="badge" style={{ backgroundColor: selectedOrder.payment === 'Paid' ? '#D1FAE5' : '#FEF3C7', color: selectedOrder.payment === 'Paid' ? '#10B981' : '#F59E0B' }}>
                      {selectedOrder.payment}
                    </span>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} color="var(--primary)" /> Route Info</h4>
                <div style={{ position: 'relative', paddingLeft: '24px' }}>
                  <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', backgroundColor: '#CBD5E1', borderStyle: 'dashed' }}></div>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--primary)', position: 'absolute', left: '0px', border: '3px solid white', boxShadow: '0 0 0 1px var(--primary)' }}></div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pickup Point</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '2px' }}>{selectedOrder.pickup}</div>
                  </div>
                  <div>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#10B981', position: 'absolute', left: '0px', border: '3px solid white', boxShadow: '0 0 0 1px #10B981' }}></div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Destination Point</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '2px' }}>{selectedOrder.drop}</div>
                  </div>
                </div>
              </div>

              {/* Customer & Driver info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={15} color="var(--primary)" /> Customer Information
                  </h4>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{selectedOrder.customer}</div>
                  {(selectedOrder.customerPhone || selectedOrder.phone) && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={12} color="var(--primary)" /> {selectedOrder.customerPhone || selectedOrder.phone}
                    </div>
                  )}
                  {selectedOrder.customerEmail && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {selectedOrder.customerEmail}
                    </div>
                  )}
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={15} color="var(--primary)" /> Driver Partner
                  </h4>
                  {selectedOrder.driver ? (
                    <>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{selectedOrder.driver}</div>
                      {selectedOrder.driverPhone && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={12} color="#10B981" /> {selectedOrder.driverPhone}
                        </div>
                      )}
                      {selectedOrder.driverVehicleNumber && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Vehicle No: <strong style={{ color: 'var(--text-main)' }}>{selectedOrder.driverVehicleNumber}</strong>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', display: 'block' }}>No driver assigned</span>
                      {selectedOrder.status !== 'cancelled' && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '11px', marginTop: '6px', width: 'auto' }}
                          onClick={() => {
                            handleOpenAssignModal(selectedOrder.id);
                          }}
                        >
                          Assign Driver Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Logistics Specification Card */}
              <div style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} color="var(--primary)" /> Logistics & Payment Overview
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600' }}>Vehicle Category</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{selectedOrder.serviceName || selectedOrder.vehicleName || 'Commercial Vehicle'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600' }}>Payment Mode</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{selectedOrder.paymentMethod || 'Online UPI'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600' }}>Database ID</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>#{selectedOrder.backendId || selectedOrder.bookingId || selectedOrder.id}</span>
                  </div>
                </div>
                {(selectedOrder.houseSize || selectedOrder.heavyItems || selectedOrder.loadAssist) && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)', display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {selectedOrder.houseSize && <span><strong>House Size:</strong> {selectedOrder.houseSize}</span>}
                    {selectedOrder.heavyItems && <span><strong>Items:</strong> {selectedOrder.heavyItems}</span>}
                    {selectedOrder.loadAssist && <span><strong>Load Assist:</strong> {selectedOrder.loadAssist}</span>}
                  </div>
                )}
              </div>

              {/* Activity Timeline */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  <Clock size={16} color="var(--primary)" /> Activity Logs & Delivery Milestones
                </h4>
                <div style={{ position: 'relative', paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--border-color)' }}></div>
                  {(() => {
                    const logs = Array.isArray(selectedOrder.timeline) && selectedOrder.timeline.length > 0
                      ? selectedOrder.timeline
                      : [{ time: '10:30 AM', text: 'Order Created & Placed by Customer' }];

                    return logs.map((event, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', fontSize: '12px', position: 'relative', zIndex: 1 }}>
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: idx === logs.length - 1 ? '#10B981' : 'var(--primary)',
                          border: '2px solid var(--bg-card)',
                          marginTop: '3px',
                          boxShadow: '0 0 0 2px var(--border-color)',
                          flexShrink: 0
                        }}></div>
                        <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '13px' }}>{event.text}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '500' }}>{event.time}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {assigningOrderId && (
        <div className="modal-backdrop" style={{ zIndex: 215 }} onClick={() => setAssigningOrderId(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assign Driver - #{assigningOrderId}</h3>
              <button className="modal-close-btn" onClick={() => setAssigningOrderId(null)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '0px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', fontSize: '13px', color: 'var(--text-muted)' }}>
                Select an online driver from the fleet to assign to this delivery.
              </div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {availableDrivers.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No drivers available.
                  </div>
                ) : (
                  availableDrivers.map(driver => (
                    <div
                      key={driver.id}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                      onClick={() => handleAssignDriver(driver.id)}
                      className="driver-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justify: 'center' }}>
                          <User size={20} color="var(--text-muted)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>{driver.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {driver.vehicle} • {driver.vehicleNo}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="badge badge-online">Available</span>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Rating: {driver.rating} ★</div>
                        <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px', fontWeight: '500' }}>
                          <MapPin size={10} style={{ display: 'inline', marginRight: '2px', verticalAlign: 'middle' }} />
                          {driver.distanceKm} km away
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAssigningOrderId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}