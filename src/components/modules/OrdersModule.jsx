import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, UserCheck, Ban, RefreshCw, X, MapPin, Phone, CreditCard, Clock, Truck, ShieldCheck, User, Search, Edit2 } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function OrdersModule() {
  const { orders, drivers, assignDriver, updateOrderStatus, setDriverVehicleType, rechargeDriverWallet } = useContext(AppStateContext);

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
  const [assignCategoryFilter, setAssignCategoryFilter] = useState('MATCHED'); // 'MATCHED' | 'ALL'
  const [editingDriverId, setEditingDriverId] = useState(null);

  const isVehicleCategoryMatch = (driverVeh, orderCategory) => {
    if (!driverVeh || !orderCategory) return false;
    const dv = String(driverVeh).toLowerCase().replace(/[^a-z0-9]/g, '');
    const oc = String(orderCategory).toLowerCase().replace(/[^a-z0-9]/g, '');

    if (dv.includes(oc) || oc.includes(dv)) return true;

    // 2 Wheeler / Scooter / Bike / Courier
    const twoWheelerKeys = ['scooter', 'bike', 'scooty', '2wheeler', 'twowheeler', 'courier', 'motorcycle', 'bick', 'bikecourier', '2wheelerbikecourier'];
    const isDriver2W = twoWheelerKeys.some(k => dv.includes(k));
    const isOrder2W = twoWheelerKeys.some(k => oc.includes(k));
    if (isDriver2W && isOrder2W) return true;

    // 3 Wheeler / Auto / Piaggio
    const threeWheelerKeys = ['3wheeler', 'threewheeler', 'auto', 'ape', 'champion', 'loader'];
    const isDriver3W = threeWheelerKeys.some(k => dv.includes(k));
    const isOrder3W = threeWheelerKeys.some(k => oc.includes(k));
    if (isDriver3W && isOrder3W) return true;

    // Tata Ace / Mini Truck / 750kg
    const aceKeys = ['tataace', 'ace', 'chotahathi', '750kg', 'minitruck', 'superace', 'bolero'];
    const isDriverAce = aceKeys.some(k => dv.includes(k));
    const isOrderAce = aceKeys.some(k => oc.includes(k));
    if (isDriverAce && isOrderAce) return true;

    // 8ft Pickup / 1200kg
    const pickupKeys = ['pickup8ft', 'pickup', '8ft', '1200kg', 'boleropickup', 'dost'];
    const isDriverPickup = pickupKeys.some(k => dv.includes(k));
    const isOrderPickup = pickupKeys.some(k => oc.includes(k));
    if (isDriverPickup && isOrderPickup) return true;

    // Tata 407 / 2500kg / Heavy Truck
    const heavyKeys = ['tata407', '407', '2500kg', 'eicher', 'heavytruck', 'truck', 'commercial'];
    const isDriverHeavy = heavyKeys.some(k => dv.includes(k));
    const isOrderHeavy = heavyKeys.some(k => oc.includes(k));
    if (isDriverHeavy && isOrderHeavy) return true;

    return false;
  };

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
    if (activeTab === 'scheduled' && !isPendingStatus(status)) return false;
    if (activeTab === 'completed' && status !== 'completed') return false;
    if (activeTab === 'cancelled' && status !== 'cancelled') return false;

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
    setAssignCategoryFilter('MATCHED');
  };

  const handleAssignDriver = async (driverId) => {
    const result = await assignDriver(assigningOrderId, driverId);
    if (result && result.success === false) {
      // Backend returned INSUFFICIENT_WALLET_BALANCE or other errors — do not close modal
      return;
    }
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

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return addr.length > 40 ? addr.slice(0, 37) + '...' : addr;
  };


  const assigningOrder = orders.find(o => o.id === assigningOrderId);
  const targetCategory = assigningOrder?.serviceName || assigningOrder?.vehicleType || assigningOrder?.category || 'Commercial Vehicle';

  // REQUIREMENT: Drivers with empty/zero wallet balance (<= 0) are NOT shown on the Assign Driver list
  const onlineDrivers = drivers
    .filter(d => {
      const isOnline = d.status && d.status.toLowerCase() === 'online';
      const walletBal = d.walletBalance != null ? Number(d.walletBalance) : (d.wallet != null ? Number(d.wallet) : 0);
      return isOnline && walletBal > 0;
    })
    .map(d => {
      // Calculate a pseudo-distance since we don't have lat/lng geocoding
      const pseudoHash = ((d.id || 0).toString().charCodeAt(0) + (assigningOrderId || '').toString().charCodeAt(0) || 0) % 15;
      const distanceKm = pseudoHash + parseFloat((Math.random() * 2).toFixed(1));
      const isMatched = isVehicleCategoryMatch(d.vehicleType || d.vehicle, targetCategory);
      return { ...d, distanceKm: parseFloat(distanceKm.toFixed(1)), isMatched };
    })
    .sort((a, b) => {
      if (a.isMatched && !b.isMatched) return -1;
      if (!a.isMatched && b.isMatched) return 1;
      return a.distanceKm - b.distanceKm;
    });

  const lowBalanceOnlineDrivers = drivers.filter(d => {
    const isOnline = d.status && d.status.toLowerCase() === 'online';
    const walletBal = d.walletBalance != null ? Number(d.walletBalance) : (d.wallet != null ? Number(d.wallet) : 0);
    return isOnline && walletBal <= 0;
  });

  const matchedDrivers = onlineDrivers.filter(d => d.isMatched);
  const displayedDrivers = assignCategoryFilter === 'MATCHED' && matchedDrivers.length > 0 ? matchedDrivers : onlineDrivers;

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
                  <td title={order.pickup}>{truncateAddress(order.pickup)}</td>
                  <td title={order.drop}>{truncateAddress(order.drop)}</td>
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
                {/* Fare & Commission Accounting Breakdown */}
                {(() => {
                  const fare = Number(selectedOrder.amount || 0);
                  const commission = parseFloat((fare * 0.05).toFixed(2));
                  const driverEarnings = parseFloat((fare - commission).toFixed(2));
                  return (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                        Trip Accounting & Commission Breakdown (5%)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', backgroundColor: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Total Fare Collected</span>
                          <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>₹{fare.toLocaleString()}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>5% Platform Cut</span>
                          <strong style={{ fontSize: '14px', color: '#DC2626' }}>-₹{commission.toLocaleString()}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Driver Net Earning</span>
                          <strong style={{ fontSize: '14px', color: '#059669' }}>+₹{driverEarnings.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })()}
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
          <div className="modal-container" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0 }}>Assign Driver - #{assigningOrderId}</h3>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setAssigningOrderId(null)}><X size={20} /></button>
            </div>

            <div className="modal-body" style={{ padding: '0px' }}>
              {/* Customer Selected Category Info Banner */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                    Customer Selected Service Category
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Truck size={16} />
                    <span>{targetCategory}</span>
                  </div>
                </div>

                {assigningOrder && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>
                    <div>Customer: <strong>{assigningOrder.customer}</strong></div>
                    <div>Fare: <strong>₹{assigningOrder.amount}</strong> <span style={{ fontSize: '10px', color: '#059669', fontWeight: '700' }}>(5% Comm: ₹{parseFloat((assigningOrder.amount * 0.05).toFixed(2))})</span></div>
                  </div>
                )}
              </div>

              {/* Commission Cut & Low Wallet Notice Banner */}
              <div style={{ padding: '8px 20px', backgroundColor: 'rgba(59, 130, 246, 0.06)', borderBottom: '1px solid var(--border-color)', fontSize: '11px', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <span>⚡ <strong>5% Platform Commission Cut on Ride Completion:</strong> Deducted from driver wallet automatically after order is delivered.</span>
                {lowBalanceOnlineDrivers.length > 0 && (
                  <span style={{ fontWeight: '700', color: '#D97706', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '10px' }}>
                    ⚠️ {lowBalanceOnlineDrivers.length} online driver(s) hidden (₹0 Wallet — must recharge first)
                  </span>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div style={{ display: 'flex', padding: '10px 20px', gap: '8px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                <button
                  type="button"
                  className={`tab-btn ${assignCategoryFilter === 'MATCHED' ? 'active' : ''}`}
                  style={{
                    fontSize: '12px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontWeight: assignCategoryFilter === 'MATCHED' ? '700' : '500'
                  }}
                  onClick={() => setAssignCategoryFilter('MATCHED')}
                >
                  ✓ Matching Category ({matchedDrivers.length})
                </button>

                <button
                  type="button"
                  className={`tab-btn ${assignCategoryFilter === 'ALL' ? 'active' : ''}`}
                  style={{
                    fontSize: '12px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontWeight: assignCategoryFilter === 'ALL' ? '700' : '500'
                  }}
                  onClick={() => setAssignCategoryFilter('ALL')}
                >
                  All Online Fleet ({onlineDrivers.length})
                </button>
              </div>

              {/* Drivers List */}
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {displayedDrivers.length === 0 ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Truck size={32} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>
                      No {targetCategory} Drivers Online
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      There are currently no online drivers registered under <strong>{targetCategory}</strong>.
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ marginTop: '12px', fontSize: '12px' }}
                      onClick={() => setAssignCategoryFilter('ALL')}
                    >
                      View All Available Drivers ({onlineDrivers.length})
                    </button>
                  </div>
                ) : (
                  displayedDrivers.map(driver => (
                    <div
                      key={driver.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 20px',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: driver.isMatched ? 'rgba(16, 185, 129, 0.04)' : undefined,
                        transition: 'background-color 0.15s ease'
                      }}
                      className="driver-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: driver.isMatched ? '#DCFCE7' : '#F1F5F9', color: driver.isMatched ? '#15803D' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '700', fontSize: '14px' }}>{driver.name}</span>
                            {driver.isMatched ? (
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: '#DCFCE7',
                                  color: '#15803D',
                                  border: '1px solid #86EFAC',
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  fontWeight: '700'
                                }}
                              >
                                ✓ Category Match
                              </span>
                            ) : (
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: 'var(--bg-main)',
                                  color: 'var(--text-muted)',
                                  border: '1px solid var(--border-color)',
                                  fontSize: '10px',
                                  padding: '2px 6px'
                                }}
                              >
                                Other Fleet
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <select
                              value={driver.vehicle || driver.vehicleType || 'Unregistered Vehicle'}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                if (setDriverVehicleType) {
                                  setDriverVehicleType(driver.id || driver.driverId, e.target.value);
                                }
                              }}
                              style={{
                                padding: '2px 6px',
                                fontSize: '11px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-main)',
                                fontWeight: '600',
                                color: 'var(--text-main)',
                                cursor: 'pointer'
                              }}
                              title="Click to change driver vehicle category"
                            >
                              <option value="Unregistered Vehicle">❓ Unregistered Vehicle</option>
                              <option value="2 Wheeler (Bike Courier)">🛵 2 Wheeler (Bike Courier)</option>
                              <option value="Tata Ace (750kg)">🚚 Tata Ace (750kg)</option>
                              <option value="3 Wheeler (500kg)">🛺 3 Wheeler (500kg)</option>
                              <option value="Pickup 8ft (1200kg)">🚚 Pickup 8ft (1200kg)</option>
                              <option value="Tata 407 (2500kg)">🚚 Tata 407 (2500kg)</option>
                            </select>

                            <span>•</span>
                            <code>{driver.vehicleNo}</code>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge badge-online">Online</span>
                          <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700', marginTop: '2px' }}>
                            Wallet: ₹{(driver.walletBalance != null ? driver.walletBalance : (driver.wallet || 0)).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                            Rating: {driver.rating} ★ • {driver.distanceKm} km
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{
                            padding: '6px 14px',
                            fontSize: '12px',
                            fontWeight: '700',
                            backgroundColor: driver.isMatched ? 'var(--primary)' : 'var(--bg-main)',
                            color: driver.isMatched ? '#FFFFFF' : 'var(--text-main)',
                            border: driver.isMatched ? 'none' : '1px solid var(--border-color)'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignDriver(driver.id);
                          }}
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Click any driver card to instantly assign to Order <strong>#{assigningOrderId}</strong>.
              </div>
              <button className="btn btn-secondary" onClick={() => setAssigningOrderId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}