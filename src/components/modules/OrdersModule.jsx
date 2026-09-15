import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, UserCheck, Ban, RefreshCw, X, MapPin, Phone, CreditCard, Clock, Truck, ShieldCheck, User, Search, Car, Box, Calendar, Key } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function OrdersModule() {
  const { orders, drivers, assignDriver, updateOrderStatus, setDriverVehicleType, retrySearchBooking } = useContext(AppStateContext);

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || searchParams.get('customer') || '';

  // 4 Core Tabs as specified in Section 1.1:
  // 'all' | 'passenger' | 'packers_movers' | 'passengers_and_movers'
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

  const isVehicleCategoryMatch = (driverVeh, orderCategory) => {
    if (!driverVeh || !orderCategory) return false;
    const dv = String(driverVeh).toLowerCase().replace(/[^a-z0-9]/g, '');
    const oc = String(orderCategory).toLowerCase().replace(/[^a-z0-9]/g, '');

    if (dv.includes(oc) || oc.includes(dv)) return true;

    // Passenger Cabs / Sedans / Hatchback / SUV
    const cabKeys = ['cab', 'sedan', 'cabsedan', 'hatchback', 'suv', 'prime', 'mini', 'car'];
    if (cabKeys.some(k => dv.includes(k)) && cabKeys.some(k => oc.includes(k))) return true;

    // 2 Wheeler / Scooter / Bike / Courier
    const twoWheelerKeys = ['scooter', 'bike', 'scooty', '2wheeler', 'twowheeler', 'courier', 'motorcycle', 'bick', 'bikecourier', '2wheelerbikecourier'];
    if (twoWheelerKeys.some(k => dv.includes(k)) && twoWheelerKeys.some(k => oc.includes(k))) return true;

    // 3 Wheeler / Auto / Piaggio
    const threeWheelerKeys = ['3wheeler', 'threewheeler', 'auto', 'ape', 'champion', 'loader'];
    if (threeWheelerKeys.some(k => dv.includes(k)) && threeWheelerKeys.some(k => oc.includes(k))) return true;

    // Tata Ace / Mini Truck / 750kg
    const aceKeys = ['tataace', 'ace', 'chotahathi', '750kg', 'minitruck', 'superace', 'bolero'];
    if (aceKeys.some(k => dv.includes(k)) && aceKeys.some(k => oc.includes(k))) return true;

    // 8ft Pickup / 1200kg
    const pickupKeys = ['pickup8ft', 'pickup', '8ft', '1200kg', 'boleropickup', 'dost'];
    if (pickupKeys.some(k => dv.includes(k)) && pickupKeys.some(k => oc.includes(k))) return true;

    // Tata 407 / 2500kg / Heavy Truck / Packers Movers
    const heavyKeys = ['tata407', '407', '2500kg', 'eicher', 'heavytruck', 'truck', 'commercial', 'packers', 'movers'];
    if (heavyKeys.some(k => dv.includes(k)) && heavyKeys.some(k => oc.includes(k))) return true;

    return false;
  };

  const isPendingStatus = (s) => ['pending', 'searching', 'created'].includes(s);
  const isAssignedStatus = (s) => ['assigned', 'driver_assigned', 'accepted', 'confirmed'].includes(s);
  const isTransitStatus = (s) => ['transit', 'pickup_started', 'on_way', 'in_transit', 'trip_started'].includes(s);
  const isCompletedStatus = (s) => ['completed', 'delivered', 'finished', 'done', 'success', 'trip_completed'].includes(s);
  const isCancelledStatus = (s) => ['cancelled', 'rejected', 'failed'].includes(s);
  const isActiveStatus = (s) => isPendingStatus(s) || isAssignedStatus(s) || isTransitStatus(s) || s === 'active';

  // Helper to categorize orders
  const isPassengerOrder = (o) => {
    const sc = (o.serviceCategory || '').toLowerCase();
    const st = (o.serviceType || '').toLowerCase();
    const sn = (o.serviceName || '').toLowerCase();
    return sc === 'passenger' || st === 'passenger' || !!o.passengerCount || sn.includes('sedan') || sn.includes('cab');
  };

  const isMoversOrder = (o) => {
    const sc = (o.serviceCategory || '').toLowerCase();
    const st = (o.serviceType || '').toLowerCase();
    const sn = (o.serviceName || '').toLowerCase();
    return sc === 'packers_movers' || st === 'packers_movers' || !!o.houseSize || sn.includes('shifting') || sn.includes('packers');
  };

  // Filters logic
  const filteredOrders = orders.filter(order => {
    // 1. Service Type Tab Filtering
    if (activeTab === 'passenger' && !isPassengerOrder(order)) return false;
    if (activeTab === 'packers_movers' && !isMoversOrder(order)) return false;
    if (activeTab === 'passengers_and_movers' && !isPassengerOrder(order) && !isMoversOrder(order)) return false;

    // 2. Status Filter
    const status = (order.status || order.rawStatus || '').toLowerCase();
    if (statusFilter !== 'All') {
      const sf = statusFilter.toLowerCase();
      if (sf === 'active' && !isActiveStatus(status)) return false;
      if (sf === 'pending' && !isPendingStatus(status)) return false;
      if ((sf === 'assigned' || sf === 'confirmed') && !isAssignedStatus(status)) return false;
      if ((sf === 'transit' || sf === 'trip_started') && !isTransitStatus(status)) return false;
      if ((sf === 'completed' || sf === 'trip_completed') && !isCompletedStatus(status)) return false;
      if (sf === 'cancelled' && !isCancelledStatus(status)) return false;
    }

    // 3. Search query filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (order.id || '').toLowerCase().includes(query) ||
        (order.bookingId || '').toLowerCase().includes(query) ||
        (order.customer || '').toLowerCase().includes(query) ||
        (order.customerPhone || order.phone || '').includes(query) ||
        (order.customerEmail || '').toLowerCase().includes(query) ||
        (order.driver || '').toLowerCase().includes(query) ||
        (order.pickup || '').toLowerCase().includes(query) ||
        (order.drop || '').toLowerCase().includes(query) ||
        (order.serviceName || '').toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    return true;
  });

  const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (isPendingStatus(s)) return 'badge-pending';
    if (isTransitStatus(s)) return 'badge-transit';
    if (isCompletedStatus(s)) return 'badge-completed';
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
      return;
    }
    setAssigningOrderId(null);
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
    return addr.length > 36 ? addr.slice(0, 33) + '...' : addr;
  };

  const assigningOrder = orders.find(o => o.id === assigningOrderId);
  const targetCategory = assigningOrder?.serviceName || assigningOrder?.vehicleCategory || assigningOrder?.vehicleType || 'Commercial Vehicle';

  // Online drivers available for assignment (Wallet check completely removed)
  const onlineDrivers = drivers
    .filter(d => d.status && d.status.toLowerCase() === 'online')
    .map(d => {
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

  const matchedDrivers = onlineDrivers.filter(d => d.isMatched);
  const displayedDrivers = assignCategoryFilter === 'MATCHED' && matchedDrivers.length > 0 ? matchedDrivers : onlineDrivers;

  // Counts for tabs
  const allCount = orders.length;
  const passengerCount = orders.filter(isPassengerOrder).length;
  const packersCount = orders.filter(isMoversOrder).length;
  const specialCount = orders.filter(o => isPassengerOrder(o) || isMoversOrder(o)).length;

  return (
    <div className="animate-fade">
      {/* 4 Unified/Service Tabs as specified in Section 1.1 */}
      <div className="tab-group" style={{ flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
        >
          All Orders ({allCount})
        </button>

        <button
          className={`tab-btn ${activeTab === 'passenger' ? 'active' : ''}`}
          onClick={() => { setActiveTab('passenger'); setSearchQuery(''); }}
        >
          🚗 Passenger Rides ({passengerCount})
        </button>

        <button
          className={`tab-btn ${activeTab === 'packers_movers' ? 'active' : ''}`}
          onClick={() => { setActiveTab('packers_movers'); setSearchQuery(''); }}
        >
          📦 Packers & Movers ({packersCount})
        </button>

        <button
          className={`tab-btn ${activeTab === 'passengers_and_movers' ? 'active' : ''}`}
          onClick={() => { setActiveTab('passengers_and_movers'); setSearchQuery(''); }}
          title="Passenger Cabs & Packers/Movers only (Excludes Freight Trucks)"
        >
          ✨ Special (Both Only) ({specialCount})
        </button>
      </div>

      {/* Filters bar */}
      <div className="table-container">
        <div className="table-header-controls">
          <div className="search-input-wrapper" style={{ flex: 1, maxWidth: '460px' }}>
            <Search className="header-search-icon" size={14} />
            <input
              type="text"
              placeholder="Search by Booking ID, customer, phone, driver, route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-selects" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              className="custom-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="active">Active (Ongoing)</option>
              <option value="pending">Pending / Searching</option>
              <option value="assigned">Assigned / Confirmed</option>
              <option value="transit">In Transit / Trip Started</option>
              <option value="completed">Trip Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table grid */}
        <table className="custom-table">
          <thead>
            <tr>
              <th>Booking ID & OTP</th>
              <th>Service Category</th>
              <th>Customer</th>
              <th>Pickup Address</th>
              <th>Drop Address</th>
              <th>Driver & Vehicle</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No orders found matching the selected filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const isPass = isPassengerOrder(order);
                const isMover = isMoversOrder(order);

                return (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>#{order.bookingId || order.id}</div>
                      {order.startOtp && (
                        <div style={{ marginTop: '3px' }}>
                          <span style={{ fontSize: '10px', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                            OTP: {order.startOtp}
                          </span>
                        </div>
                      )}
                    </td>

                    <td>
                      {isPass ? (
                        <div>
                          <span className="badge" style={{ backgroundColor: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', fontWeight: '700' }}>
                            🚗 {order.serviceName || 'Cab Sedan'}
                          </span>
                          {order.passengerCount && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {order.passengerCount} Passengers
                            </div>
                          )}
                        </div>
                      ) : isMover ? (
                        <div>
                          <span className="badge" style={{ backgroundColor: '#FAF5FF', color: '#7E22CE', border: '1px solid #E9D5FF', fontWeight: '700' }}>
                            📦 {order.houseSize || 'Packers & Movers'}
                          </span>
                          {order.scheduledSlot && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {order.scheduledSlot}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="badge" style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
                            🚚 {order.serviceName || 'Goods Truck'}
                          </span>
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: '600' }}>{order.customer || 'Customer'}</div>
                      {(order.customerPhone || order.phone) && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {order.customerPhone || order.phone}
                        </div>
                      )}
                    </td>

                    <td title={order.pickup}>{truncateAddress(order.pickup)}</td>
                    <td title={order.drop}>{truncateAddress(order.drop)}</td>

                    <td>
                      {order.driver ? (
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{order.driver}</div>
                          {(order.vehicleNumber || order.driverVehicleNumber) && (
                            <code style={{ fontSize: '10px' }}>{order.vehicleNumber || order.driverVehicleNumber}</code>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px' }}>Unassigned</span>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>₹{order.amount}</div>
                      <div style={{ fontSize: '10px', color: order.paymentStatus === 'PAID' ? '#059669' : '#D97706', fontWeight: '700' }}>
                        {order.paymentStatus || order.payment}
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="action-row" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn btn-view"
                          title="View Details"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye size={16} />
                        </button>

                        {!order.driver && order.status !== 'cancelled' && (
                          <>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '11px', color: '#8B5CF6', backgroundColor: '#EDE9FE', borderColor: '#C084FC', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              title="Manual Driver Assignment"
                              onClick={() => handleOpenAssignModal(order.id)}
                            >
                              <UserCheck size={14} /> Assign
                            </button>
                            {retrySearchBooking && (
                              <button
                                className="action-btn"
                                style={{ color: 'var(--primary)', backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}
                                title="Restart Driver Auto-Search (Radar Broadcaster)"
                                onClick={() => retrySearchBooking(order.id)}
                              >
                                <RefreshCw size={14} />
                              </button>
                            )}
                          </>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Booking Information - #{selectedOrder.bookingId || selectedOrder.id}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {/* Top summary row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Delivery / Trip Status</div>
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

                <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Payment Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>₹{selectedOrder.amount}</span>
                    <span className="badge" style={{ backgroundColor: selectedOrder.paymentStatus === 'PAID' ? '#DCFCE7' : '#FEF3C7', color: selectedOrder.paymentStatus === 'PAID' ? '#15803D' : '#D97706', fontWeight: '700' }}>
                      {selectedOrder.paymentStatus || selectedOrder.payment || 'PAID'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Start OTP & Trip Info */}
              {selectedOrder.startOtp && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Key size={20} color="#1D4ED8" />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase' }}>Start / Verification OTP</div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#1D4ED8', letterSpacing: '2px', marginTop: '2px' }}>
                        {selectedOrder.startOtp}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: '600' }}>Payment Method</div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E40AF' }}>
                      {selectedOrder.paymentMethod || 'UPI'}
                    </span>
                  </div>
                </div>
              )}

              {/* Specialized Section for Packers & Movers */}
              {isMoversOrder(selectedOrder) && (
                <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#7E22CE', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Box size={16} /> Packers & Movers Specifications
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600' }}>House Size</span>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{selectedOrder.houseSize || '2BHK'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600' }}>Scheduled Date & Slot</span>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                        {selectedOrder.scheduledDate || 'Flexible'} {selectedOrder.scheduledSlot ? `(${selectedOrder.scheduledSlot})` : ''}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600' }}>Heavy Items</span>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{selectedOrder.heavyItems || 'Fridge, Washing Machine'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Specialized Section for Passenger Rides */}
              {isPassengerOrder(selectedOrder) && (
                <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#15803D', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Car size={16} /> Passenger Cab Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600' }}>Vehicle Category</span>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{selectedOrder.vehicleCategory || selectedOrder.serviceName || 'CAB_SEDAN'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600' }}>Passenger Count</span>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{selectedOrder.passengerCount || 2} Passengers</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600' }}>Distance Est.</span>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{selectedOrder.distanceKm ? `${selectedOrder.distanceKm} km` : 'Direct Route'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses */}
              <div style={{ marginBottom: '20px' }}>
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
                      {(selectedOrder.vehicleNumber || selectedOrder.driverVehicleNumber) && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Vehicle: <strong style={{ color: 'var(--text-main)' }}>{selectedOrder.vehicleNumber || selectedOrder.driverVehicleNumber}</strong>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', display: 'block' }}>No driver assigned</span>
                      {selectedOrder.status !== 'cancelled' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '11px', width: 'auto' }}
                            onClick={() => {
                              handleOpenAssignModal(selectedOrder.id);
                            }}
                          >
                            Assign Driver Now
                          </button>
                          {retrySearchBooking && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '4px 10px', fontSize: '11px', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => {
                                retrySearchBooking(selectedOrder.id);
                              }}
                              title="Restart driver search radar / auto-assignment"
                            >
                              <RefreshCw size={12} /> Restart Driver Search
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  <Clock size={16} color="var(--primary)" /> Activity Logs & Delivery Milestones
                </h4>
                <div style={{ position: 'relative', paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

      {/* Driver Assignment Modal (Cleaned of all wallet dependencies) */}
      {assigningOrderId && (
        <div className="modal-backdrop" onClick={() => setAssigningOrderId(null)}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Assign Driver Partner</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Booking ID: #{assigningOrderId}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setAssigningOrderId(null)}><X size={20} /></button>
            </div>

            <div className="modal-body" style={{ padding: '0' }}>
              {/* Target Service Badge */}
              <div style={{ padding: '12px 20px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                    Required Vehicle Category
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Truck size={16} />
                    <span>{targetCategory}</span>
                  </div>
                </div>

                {assigningOrder && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>
                    <div>Customer: <strong>{assigningOrder.customer}</strong></div>
                    <div>Fare: <strong>₹{assigningOrder.amount}</strong></div>
                  </div>
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
                              <option value="Sedan Cab">🚗 Sedan Cab</option>
                              <option value="2 Wheeler (Bike Courier)">🛵 2 Wheeler (Bike Courier)</option>
                              <option value="Tata Ace (750kg)">🚚 Tata Ace (750kg)</option>
                              <option value="3 Wheeler (500kg)">🛺 3 Wheeler (500kg)</option>
                              <option value="Pickup 8ft (1200kg)">🚚 Pickup 8ft (1200kg)</option>
                              <option value="Tata 407 (2500kg)">🚚 Tata 407 (2500kg)</option>
                            </select>

                            <span>•</span>
                            <code>{driver.vehicleNo || driver.vehicleNumber}</code>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge badge-online">Online</span>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Rating: {driver.rating || 5.0} ★ • {driver.distanceKm} km
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

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Showing {displayedDrivers.length} online driver partner(s)
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAssigningOrderId(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}