import React, { useState, useContext } from 'react';
import { ShoppingBag, Search, Eye, Users, Edit, Plus, Filter, Calendar } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';
import BookingDetailModal from '../components/BookingDetailModal';
import TeamAssignModal from '../components/TeamAssignModal';
import QuoteEditorModal from '../components/QuoteEditorModal';

const LIFECYCLE_TABS = [
  { id: 'ALL', label: 'All Bookings' },
  { id: 'NEW', label: 'New' },
  { id: 'QUOTE_PENDING', label: 'Quote Pending' },
  { id: 'AWAITING_PAYMENT', label: 'Awaiting Payment' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'TEAM_ASSIGNED', label: 'Team Assigned' },
  { id: 'PACKING', label: 'Packing' },
  { id: 'LOADING', label: 'Loading' },
  { id: 'TRANSIT', label: 'Transit' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' }
];

export default function PMBookingsManager() {
  const { bookings } = useContext(PackersMoversContext);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignTeamBooking, setAssignTeamBooking] = useState(null);
  const [quoteBooking, setQuoteBooking] = useState(null);

  const filteredBookings = bookings.filter(b => {
    if (activeTab !== 'ALL') {
      if (activeTab === 'NEW' && b.status !== 'BOOKING_CREATED') return false;
      else if (b.status !== activeTab) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.bookingId.toLowerCase().includes(q) ||
             (b.customer?.name && b.customer.name.toLowerCase().includes(q)) ||
             (b.customer?.phone && b.customer.phone.includes(q)) ||
             (b.pickup?.address && b.pickup.address.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--primary)" /> Packers & Movers Bookings Manager
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Complete 360° relocation booking lifecycle, crew deployment, inventory verification and move timeline dossier.
          </p>
        </div>

        <div className="search-input-wrapper" style={{ minWidth: '280px' }}>
          <Search className="header-search-icon" size={14} />
          <input
            type="text"
            placeholder="Search by ID, customer name, phone, locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 14 Lifecycle Tabs Bar */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', borderBottom: '1px solid var(--border-color)' }}>
        {LIFECYCLE_TABS.map(tab => {
          const count = tab.id === 'ALL' ? bookings.length : bookings.filter(b => b.status === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              style={{ fontSize: '12px', padding: '8px 14px', whiteSpace: 'nowrap' }}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Bookings Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Origin ➔ Destination</th>
              <th>Schedule</th>
              <th>Truck & Crew</th>
              <th>Move Total</th>
              <th>Stage Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No bookings found in this status tab.
                </td>
              </tr>
            ) : (
              filteredBookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: '700' }}>#{b.bookingId}</td>
                  <td>
                    <div style={{ fontWeight: '700', fontSize: '13px' }}>{b.customer?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.customer?.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>{b.pickup?.address?.split(',')[0]} ➔ {b.drop?.address?.split(',')[0]}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.serviceTypeName}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>{b.moveDate}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.timeSlot}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>{b.vehicle?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--primary)' }}>{b.team?.name || '⚠️ No Crew Assigned'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '800', color: '#15803D', fontSize: '13px' }}>₹{b.pricing?.totalAmount?.toLocaleString()}</div>
                    <div style={{ fontSize: '10px', color: b.pricing?.pendingAmount > 0 ? '#D97706' : '#15803D', fontWeight: '600' }}>
                      {b.pricing?.pendingAmount > 0 ? `Pending: ₹${b.pricing.pendingAmount}` : 'Paid in Full'}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: b.status === 'TRANSIT' ? '#DBEAFE' : b.status === 'CONFIRMED' ? '#DCFCE7' : b.status === 'DELIVERED' ? '#D1FAE5' : '#FEF3C7',
                      color: b.status === 'TRANSIT' ? '#1D4ED8' : b.status === 'CONFIRMED' ? '#15803D' : b.status === 'DELIVERED' ? '#065F46' : '#B45309'
                    }}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" onClick={() => setSelectedBooking(b)} style={{ fontSize: '11px', padding: '4px 8px' }} title="View 360 Dossier">
                        <Eye size={13} style={{ marginRight: '4px' }} /> Dossier
                      </button>
                      <button className="btn btn-primary" onClick={() => setAssignTeamBooking(b)} style={{ fontSize: '11px', padding: '4px 8px' }} title="Assign Team & Truck">
                        <Users size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onAssignTeam={(b) => { setSelectedBooking(null); setAssignTeamBooking(b); }}
          onOpenQuote={(b) => { setSelectedBooking(null); setQuoteBooking(b); }}
        />
      )}

      {assignTeamBooking && (
        <TeamAssignModal
          booking={assignTeamBooking}
          onClose={() => setAssignTeamBooking(null)}
        />
      )}

      {quoteBooking && (
        <QuoteEditorModal
          booking={quoteBooking}
          onClose={() => setQuoteBooking(null)}
        />
      )}
    </div>
  );
}
