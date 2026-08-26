import React, { useState, useContext } from 'react';
import { Clock, CheckCircle2, Edit3, Send, Eye, FileText, Check } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';
import QuoteEditorModal from '../components/QuoteEditorModal';
import BookingDetailModal from '../components/BookingDetailModal';

export default function PMQuotesManager() {
  const { bookings, sendRevisedQuote } = useContext(PackersMoversContext);
  const [selectedQuoteBooking, setSelectedQuoteBooking] = useState(null);
  const [viewDetailBooking, setViewDetailBooking] = useState(null);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'SENT'

  const quotes = bookings.filter(b => b.status === 'QUOTE_PENDING' || b.status === 'AWAITING_PAYMENT' || b.pricing?.quoteNotes);

  const filtered = quotes.filter(q => {
    if (filterTab === 'PENDING') return q.status === 'QUOTE_PENDING';
    if (filterTab === 'SENT') return q.status === 'AWAITING_PAYMENT' || q.status === 'CONFIRMED';
    return true;
  });

  const handleInstantAccept = (b) => {
    sendRevisedQuote(b.id, {
      totalAmount: b.pricing?.totalAmount,
      pendingAmount: b.pricing?.totalAmount,
      quoteNotes: 'System estimate approved by Admin'
    });
    alert(`System Price Quote of ₹${b.pricing?.totalAmount?.toLocaleString()} approved and sent to ${b.customer?.name}!`);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--primary)" /> Quotation Review & Custom Dispatch Desk
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Review customer inventory requests, adjust line-item charges, apply custom discounts and dispatch formal quotes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setFilterTab('ALL')} className={`btn ${filterTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '12px' }}>
            All Quotes ({quotes.length})
          </button>
          <button onClick={() => setFilterTab('PENDING')} className={`btn ${filterTab === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '12px' }}>
            Pending Review ({quotes.filter(q => q.status === 'QUOTE_PENDING').length})
          </button>
          <button onClick={() => setFilterTab('SENT')} className={`btn ${filterTab === 'SENT' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '12px' }}>
            Dispatched Quotes
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Origin ➔ Destination</th>
              <th>Move Date</th>
              <th>Declared Items</th>
              <th>System Estimate</th>
              <th>Quote Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No quotes found in this filter.
                </td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: '700' }}>#{b.bookingId}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{b.customer?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.customer?.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>{b.pickup?.address?.split(',')[0]} ➔ {b.drop?.address?.split(',')[0]}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.serviceTypeName}</div>
                  </td>
                  <td>{b.moveDate}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>
                      {b.itemsCount || b.itemsList?.length || 20} items
                    </span>
                  </td>
                  <td style={{ fontWeight: '800', color: '#15803D' }}>₹{b.pricing?.totalAmount?.toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: b.status === 'QUOTE_PENDING' ? '#FEF3C7' : '#DCFCE7',
                      color: b.status === 'QUOTE_PENDING' ? '#B45309' : '#15803D'
                    }}>
                      {b.status === 'QUOTE_PENDING' ? '⏳ Pending Review' : '📨 Quote Dispatched'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" onClick={() => setViewDetailBooking(b)} style={{ fontSize: '11px', padding: '4px 8px' }} title="View Details">
                        <Eye size={13} />
                      </button>
                      <button className="btn btn-primary" onClick={() => setSelectedQuoteBooking(b)} style={{ fontSize: '11px', padding: '4px 10px' }}>
                        <Edit3 size={13} style={{ marginRight: '4px' }} /> Edit & Send Quote
                      </button>
                      {b.status === 'QUOTE_PENDING' && (
                        <button className="btn btn-secondary" onClick={() => handleInstantAccept(b)} style={{ fontSize: '11px', padding: '4px 8px', color: '#15803D' }} title="Accept System Price">
                          <Check size={13} />
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

      {selectedQuoteBooking && (
        <QuoteEditorModal
          booking={selectedQuoteBooking}
          onClose={() => setSelectedQuoteBooking(null)}
        />
      )}

      {viewDetailBooking && (
        <BookingDetailModal
          booking={viewDetailBooking}
          onClose={() => setViewDetailBooking(null)}
          onAssignTeam={() => {}}
          onOpenQuote={(b) => { setViewDetailBooking(null); setSelectedQuoteBooking(b); }}
        />
      )}
    </div>
  );
}
