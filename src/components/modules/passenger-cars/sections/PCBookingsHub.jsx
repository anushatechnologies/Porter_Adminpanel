import React, { useState, useContext } from 'react';
import {
  ShoppingBag, Search, Filter, Eye, UserCheck, AlertTriangle,
  CheckCircle2, Clock, Car, MapPin, DollarSign, X, ChevronRight,
  ShieldCheck, RefreshCw, ArrowRight
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function PCBookingsHub({ onSelectBooking, onOpenDriverAssign }) {
  const { bookings, advanceBookingStatus, cancelBooking, formatRupee } = useContext(PassengerCarContext);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'completed' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    if (activeFilter === 'active') {
      if (!['REQUESTED', 'DRIVER_SEARCHING', 'DRIVER_ASSIGNED', 'DRIVER_ACCEPTED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'TRIP_STARTED'].includes(b.status)) {
        return false;
      }
    } else if (activeFilter === 'completed') {
      if (b.status !== 'TRIP_COMPLETED') return false;
    } else if (activeFilter === 'cancelled') {
      if (!b.status.startsWith('CANCELLED')) return false;
    }

    const q = searchQuery.toLowerCase();
    return (
      (b.id || '').toLowerCase().includes(q) ||
      (b.customer?.name || '').toLowerCase().includes(q) ||
      (b.customer?.phone || '').toLowerCase().includes(q) ||
      (b.pickup || '').toLowerCase().includes(q) ||
      (b.drop || '').toLowerCase().includes(q) ||
      (b.vehicleName || '').toLowerCase().includes(q)
    );
  });

  // State machine helper for quick button
  const getNextStatusAction = (currentStatus) => {
    switch (currentStatus) {
      case 'REQUESTED':
        return { target: 'DRIVER_SEARCHING', label: 'Start Driver Search' };
      case 'DRIVER_SEARCHING':
        return { target: 'ASSIGN_DRIVER', label: 'Assign Driver' };
      case 'DRIVER_ASSIGNED':
        return { target: 'DRIVER_ARRIVING', label: 'Mark Arriving' };
      case 'DRIVER_ARRIVING':
        return { target: 'DRIVER_ARRIVED', label: 'Mark Arrived' };
      case 'DRIVER_ARRIVED':
        return { target: 'TRIP_STARTED', label: 'Start Ride (OTP)' };
      case 'TRIP_STARTED':
        return { target: 'TRIP_COMPLETED', label: 'Complete Ride' };
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Status Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
            Passenger Bookings & Dispatch Center
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Monitor trip state machine, assign drivers, verify locked pricing snapshots, and handle cancellations
          </p>
        </div>

        <div className="tab-group" style={{ margin: 0 }}>
          <button
            className={`tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Trips ({bookings.length})
          </button>
          <button
            className={`tab-btn ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            Active Rides ({bookings.filter(b => !['TRIP_COMPLETED', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'].includes(b.status)).length})
          </button>
          <button
            className={`tab-btn ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            Completed ({bookings.filter(b => b.status === 'TRIP_COMPLETED').length})
          </button>
          <button
            className={`tab-btn ${activeFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveFilter('cancelled')}
          >
            Cancelled ({bookings.filter(b => b.status.startsWith('CANCELLED')).length})
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="table-container">
        <div className="table-header-controls">
          <div className="search-input-wrapper">
            <Search className="header-search-icon" size={14} />
            <input
              type="text"
              placeholder="Search by Booking ID, Passenger Name, Phone, Route, or Vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Service & Vehicle</th>
              <th>Route Details</th>
              <th>Distance / Pax</th>
              <th>Customer Fare</th>
              <th>Assigned Driver</th>
              <th>Trip Status</th>
              <th>Lifecycle Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No passenger bookings found matching your search.
                </td>
              </tr>
            ) : (
              filteredBookings.map(b => {
                const statusInfo = {
                  REQUESTED: { bg: '#FEF3C7', color: '#D97706', label: 'Requested' },
                  DRIVER_SEARCHING: { bg: '#FEF3C7', color: '#B45309', label: 'Searching Driver' },
                  DRIVER_ASSIGNED: { bg: '#EDE9FE', color: '#6D28D9', label: 'Driver Assigned' },
                  DRIVER_ARRIVING: { bg: '#DBEAFE', color: '#1D4ED8', label: 'Driver Arriving' },
                  DRIVER_ARRIVED: { bg: '#DBEAFE', color: '#1E40AF', label: 'Driver Arrived' },
                  TRIP_STARTED: { bg: '#E0F2FE', color: '#0369A1', label: 'Trip Started' },
                  TRIP_COMPLETED: { bg: '#D1FAE5', color: '#047857', label: 'Trip Completed' },
                  CANCELLED_BY_CUSTOMER: { bg: '#FEE2E2', color: '#B91C1C', label: 'Cancelled (Customer)' },
                  CANCELLED_BY_ADMIN: { bg: '#FEE2E2', color: '#B91C1C', label: 'Cancelled (Admin)' }
                }[b.status] || { bg: '#E2E8F0', color: '#475569', label: b.status };

                const nextAction = getNextStatusAction(b.status);

                return (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: '800', fontFamily: 'monospace', color: 'var(--primary)' }}>
                        {b.id}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '600' }}>{b.customer?.name || 'Customer'}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{b.customer?.phone || b.phone || 'N/A'}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{b.vehicleName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.serviceName}</div>
                    </td>

                    <td style={{ maxWidth: '220px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        📍 {b.pickup}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        🏁 {b.drop}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{b.distanceKm} KM</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>👤 {b.passengerCount} Passengers</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '800', fontSize: '14.5px', color: 'var(--text-main)' }}>
                        {formatRupee(b.pricingSnapshot?.totalFare)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '600' }}>
                        {b.payment?.status === 'PAID' ? '✓ Paid' : 'Cash on Arrival'}
                      </div>
                    </td>

                    <td>
                      {b.driver ? (
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '12.5px' }}>{b.driver.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {b.driver.vehiclePlate}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11.5px', color: '#F59E0B', fontWeight: '600' }}>
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color
                      }}>
                        {statusInfo.label}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {nextAction && (
                          <button
                            onClick={() => {
                              if (nextAction.target === 'ASSIGN_DRIVER') {
                                onOpenDriverAssign(b);
                              } else {
                                advanceBookingStatus(b.id, nextAction.target);
                              }
                            }}
                            className="btn btn-primary"
                            style={{ fontSize: '11.5px', padding: '5px 10px', whiteSpace: 'nowrap' }}
                          >
                            {nextAction.label}
                          </button>
                        )}

                        <button
                          onClick={() => onSelectBooking(b)}
                          className="action-btn btn-view"
                          title="View Fare Snapshot & Details"
                        >
                          <Eye size={15} />
                        </button>

                        {!b.status.startsWith('CANCELLED') && b.status !== 'TRIP_COMPLETED' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Cancel booking ${b.id}?`)) {
                                cancelBooking(b.id, 'Admin cancelled via dispatch console', 'ADMIN');
                              }
                            }}
                            className="action-btn"
                            style={{ color: '#EF4444' }}
                            title="Cancel Booking"
                          >
                            <X size={15} />
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
    </div>
  );
}
