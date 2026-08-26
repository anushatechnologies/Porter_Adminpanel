import React, { useState, useContext } from 'react';
import { DollarSign, Search, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMPaymentsLedger({ onOpenBooking }) {
  const { bookings } = useContext(PackersMoversContext);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const totalCollected = bookings.reduce((sum, b) => sum + (b.pricing?.paidAmount || 0), 0);
  const totalReceivable = bookings.reduce((sum, b) => sum + (b.pricing?.pendingAmount || 0), 0);
  const totalGross = bookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

  const filtered = bookings.filter(b => {
    if (statusFilter === 'PAID') return b.paymentStatus === 'PAID';
    if (statusFilter === 'PARTIAL') return b.paymentStatus === 'PARTIALLY_PAID';
    if (statusFilter === 'PENDING') return b.paymentStatus === 'QUOTE_PENDING' || b.paymentStatus === 'PENDING';
    return true;
  });

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} color="var(--primary)" /> Packers & Movers Financial Ledger
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Track customer advance deposits, driver cash settlements, pending balances and payment statuses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'PAID', 'PARTIAL', 'PENDING'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid var(--border-color)',
                backgroundColor: statusFilter === f ? 'var(--primary)' : 'var(--bg-main)',
                color: statusFilter === f ? '#FFF' : 'var(--text-color)',
                cursor: 'pointer'
              }}
            >
              {f === 'ALL' ? 'All Payments' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Metric summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="card" style={{ padding: '16px 20px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Gross Invoiced</div>
          <div style={{ fontSize: '22px', fontWeight: '800', marginTop: '4px' }}>₹{totalGross.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', border: '1px solid #BBF7D0', backgroundColor: '#F0FDF4' }}>
          <div style={{ fontSize: '12px', color: '#166534' }}>Settled / Collected Payments</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#15803D', marginTop: '4px' }}>₹{totalCollected.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', border: '1px solid #FED7AA', backgroundColor: '#FFF7ED' }}>
          <div style={{ fontSize: '12px', color: '#9A3412' }}>Outstanding / Pending Balances</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#C2410C', marginTop: '4px' }}>₹{totalReceivable.toLocaleString()}</div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Pending Amount</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: '700' }}>#{b.bookingId}</td>
                <td>
                  <div style={{ fontWeight: '600' }}>{b.customer?.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.moveDate}</div>
                </td>
                <td style={{ fontWeight: '700' }}>₹{b.pricing?.totalAmount?.toLocaleString()}</td>
                <td style={{ fontWeight: '700', color: '#15803D' }}>₹{b.pricing?.paidAmount?.toLocaleString()}</td>
                <td style={{ fontWeight: '700', color: b.pricing?.pendingAmount > 0 ? '#C2410C' : '#15803D' }}>
                  ₹{b.pricing?.pendingAmount?.toLocaleString()}
                </td>
                <td><span className="badge" style={{ backgroundColor: '#F1F5F9' }}>{b.paymentMethod || 'Online'}</span></td>
                <td>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: b.paymentStatus === 'PAID' ? '#DCFCE7' : b.paymentStatus === 'PARTIALLY_PAID' ? '#FEF3C7' : '#F1F5F9',
                    color: b.paymentStatus === 'PAID' ? '#15803D' : b.paymentStatus === 'PARTIALLY_PAID' ? '#B45309' : '#475569'
                  }}>
                    {b.paymentStatus || 'PENDING'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary" onClick={() => onOpenBooking(b)} style={{ fontSize: '11px', padding: '4px 8px' }}>
                    View Dossier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
