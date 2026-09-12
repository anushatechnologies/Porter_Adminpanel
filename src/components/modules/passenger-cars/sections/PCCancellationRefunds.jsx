import React, { useState, useContext } from 'react';
import {
  AlertOctagon, ShieldAlert, CheckCircle2, DollarSign,
  Info, Clock, RefreshCw, XCircle
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function PCCancellationRefunds() {
  const { bookings, formatRupee } = useContext(PassengerCarContext);

  const cancelledBookings = bookings.filter(b => b.status.startsWith('CANCELLED'));

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
          Cancellation Policies & Refund Management (Section 29)
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Configured penalties, grace periods, driver compensation for cancellations, and refund audit records
        </p>
      </div>

      {/* 3 Configured Policy Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        <div className="card" style={{ padding: '20px', borderTop: '4px solid #10B981' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 8px' }}>
            Free Cancellation Window
          </h4>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#10B981', margin: '6px 0' }}>
            5 Minutes
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
            Customers can cancel with <strong>100% free refund</strong> within 5 minutes of driver assignment, before driver reaches pickup.
          </p>
        </div>

        <div className="card" style={{ padding: '20px', borderTop: '4px solid #F59E0B' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 8px' }}>
            Late Cancellation Fee
          </h4>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#F59E0B', margin: '6px 0' }}>
            ₹100 Penalty
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
            Applied if customer cancels after driver arrives at the pickup spot. ₹80 is credited to the driver partner for fuel and wasted time.
          </p>
        </div>

        <div className="card" style={{ padding: '20px', borderTop: '4px solid #EF4444' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 8px' }}>
            Customer No-Show Policy
          </h4>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#EF4444', margin: '6px 0' }}>
            ₹150 Penalty
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
            Charged if passenger does not show up within 15 minutes of driver arrival. Driver is released to take new bookings.
          </p>
        </div>
      </div>

      {/* Cancellation Ledger */}
      <div className="table-container">
        <h4 style={{ fontSize: '16px', fontWeight: '700', padding: '18px 20px 8px', margin: 0 }}>
          Cancelled Trips & Refund Audit Ledger
        </h4>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Customer</th>
              <th>Cancelled By</th>
              <th>Reason Stated</th>
              <th>Cancellation Fee</th>
              <th>Refund Status</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {cancelledBookings.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No cancelled trips recorded.
                </td>
              </tr>
            ) : (
              cancelledBookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{b.id}</td>
                  <td>{b.customer?.name}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: '#FEE2E2',
                      color: '#B91C1C'
                    }}>
                      {b.status.replace('CANCELLED_BY_', '')}
                    </span>
                  </td>
                  <td style={{ fontSize: '12.5px' }}>{b.cancellation?.reason || 'Cancelled by customer'}</td>
                  <td style={{ fontWeight: '700' }}>
                    {formatRupee(b.cancellation?.fee || 0)}
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: '#D1FAE5',
                      color: '#047857'
                    }}>
                      REFUND_SETTLED
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(b.cancellation?.cancelledAt || b.createdAt).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
