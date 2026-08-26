import React, { useState, useContext } from 'react';
import { CheckSquare, AlertTriangle, Plus, Check, X, ShieldAlert } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMInventoryVerification() {
  const { bookings, updateBookingStatus } = useContext(PackersMoversContext);
  const [selectedBookingId, setSelectedBookingId] = useState(bookings[0]?.id);

  const [extraRequests, setExtraRequests] = useState([
    { id: 'req-1', bookingId: 'ANP-PM-8921', customerName: 'Rahul Sharma', reason: 'Extra 2 Helpers required for 4th floor stairs without lift', amount: 1000, requestedBy: 'Suresh Kumar (Alpha Movers)', status: 'PENDING' },
    { id: 'req-2', bookingId: 'ANP-PM-8922', customerName: 'Pooja Hegde', reason: 'Additional 10 carton boxes & heavy hydraulic treadmill', amount: 1500, requestedBy: 'Venkatesh Rao (Express Team)', status: 'PENDING' }
  ]);

  const activeBooking = bookings.find(b => b.id === selectedBookingId) || bookings[0];

  const handleApproveExtra = (reqId) => {
    setExtraRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'APPROVED' } : r));
    alert('Extra charge approved! Amount updated and notification sent to customer app for confirmation.');
  };

  const handleRejectExtra = (reqId) => {
    setExtraRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'REJECTED' } : r));
    alert('Extra charge request rejected.');
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare size={20} color="var(--primary)" /> Inventory Verification & Extra Charge Approvals
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
          Review on-ground item checklists verified by moving teams and approve/reject additional helper or item surcharge requests.
        </p>
      </div>

      {/* Extra Charges Approval Desk */}
      <div className="card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid #F59E0B', backgroundColor: '#FFFBEB' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#B45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={18} /> Pending On-Ground Extra Charge Requests
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {extraRequests.map(req => (
            <div key={req.id} style={{ backgroundColor: '#FFF', padding: '14px 18px', borderRadius: '8px', border: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px' }}>#{req.bookingId}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Customer: {req.customerName}</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>
                  Reason: <span style={{ color: '#1E293B' }}>{req.reason}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Requested by: {req.requestedBy}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#B45309' }}>+ ₹{req.amount}</div>
                {req.status === 'PENDING' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" onClick={() => handleApproveExtra(req.id)} style={{ fontSize: '12px', padding: '6px 12px', backgroundColor: '#10B981', borderColor: '#10B981' }}>
                      <Check size={14} style={{ marginRight: '4px' }} /> Approve Charge
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleRejectExtra(req.id)} style={{ fontSize: '12px', padding: '6px 12px', color: '#EF4444' }}>
                      <X size={14} style={{ marginRight: '4px' }} /> Reject
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', fontWeight: '700', color: req.status === 'APPROVED' ? '#15803D' : '#B91C1C' }}>
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Inventory Verification Checklist */}
      <div className="card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>
            Checklist & Item Verification for Booking:
          </h4>
          <select
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', backgroundColor: 'var(--bg-main)' }}
          >
            {bookings.map(b => (
              <option key={b.id} value={b.id}>#{b.bookingId} — {b.customer?.name} ({b.moveDate})</option>
            ))}
          </select>
        </div>

        {activeBooking && (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Customer Declared Qty</th>
                  <th>Crew Verified Qty</th>
                  <th>Packing Required</th>
                  <th>Dismantling Status</th>
                  <th>Verification Status</th>
                </tr>
              </thead>
              <tbody>
                {activeBooking.itemsList?.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700' }}>{item.name}</td>
                    <td>{item.qty}</td>
                    <td><input type="number" defaultValue={item.qty} style={{ width: '60px', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', textAlign: 'center' }} /></td>
                    <td>{item.packing ? '✅ Yes' : '❌ None'}</td>
                    <td>{item.dismantling ? '🛠️ Yes' : '—'}</td>
                    <td>
                      <span style={{ fontSize: '11px', color: '#15803D', fontWeight: '700', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '10px' }}>
                        ✓ Verified by Crew
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
