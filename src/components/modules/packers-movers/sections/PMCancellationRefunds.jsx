import React, { useState, useContext } from 'react';
import { AlertOctagon, RotateCcw, DollarSign, Check, ShieldAlert } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMCancellationRefunds() {
  const { appSettings, setAppSettings, bookings, processBookingRefund } = useContext(PackersMoversContext);
  const [form, setForm] = useState(appSettings);
  const [isSaved, setIsSaved] = useState(false);

  // Refund processing state
  const [refundBookingId, setRefundBookingId] = useState(bookings[0]?.id);
  const [refundAmount, setRefundAmount] = useState(5000);
  const [refundReason, setRefundReason] = useState('Customer requested date cancellation before team dispatch.');

  const handleSaveRules = (e) => {
    e.preventDefault();
    setAppSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleProcessRefund = (e) => {
    e.preventDefault();
    if (!refundAmount || refundAmount <= 0) {
      alert('Please enter a valid refund amount.');
      return;
    }
    processBookingRefund(refundBookingId, parseFloat(refundAmount), refundReason);
    alert(`Refund of ₹${refundAmount} processed successfully for Booking #${refundBookingId}!`);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOctagon size={20} color="var(--primary)" /> Cancellation, Rescheduling & Refund Rules
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
          Configure stage-based cancellation fees, customer reschedule windows and process full/partial financial refunds.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Stage Cancellation & Reschedule Rules */}
        <form onSubmit={handleSaveRules} noValidate className="card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertOctagon size={16} /> Stage Cancellation Penalty Fee Matrix
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Before Team Assignment (₹)</label>
              <input type="number" value={form.cancellationBeforeAssignmentFee} onChange={(e) => setForm(p => ({ ...p, cancellationBeforeAssignmentFee: parseFloat(e.target.value) || 0 }))} placeholder="0 (Free)" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>After Team Assignment (₹)</label>
              <input type="number" value={form.cancellationAfterAssignmentFee} onChange={(e) => setForm(p => ({ ...p, cancellationAfterAssignmentFee: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>After Crew Arrival (₹)</label>
              <input type="number" value={form.cancellationAfterArrivalFee} onChange={(e) => setForm(p => ({ ...p, cancellationAfterArrivalFee: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>After Packing Started (₹)</label>
              <input type="number" value={form.cancellationAfterPackingFee} onChange={(e) => setForm(p => ({ ...p, cancellationAfterPackingFee: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>

          <h4 style={{ margin: '10px 0 0', fontSize: '14px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RotateCcw size={16} /> Rescheduling Policy
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Reschedule Notice Window (Hrs)</label>
              <input type="number" value={form.maxRescheduleWindowHours} onChange={(e) => setForm(p => ({ ...p, maxRescheduleWindowHours: parseInt(e.target.value) || 24 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Reschedule Fee (₹)</label>
              <input type="number" value={form.rescheduleFee} onChange={(e) => setForm(p => ({ ...p, rescheduleFee: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {isSaved ? <Check size={16} /> : null}
            {isSaved ? 'Rules Saved!' : 'Save Cancellation Rules'}
          </button>
        </form>

        {/* Process Customer Refund */}
        <form onSubmit={handleProcessRefund} noValidate className="card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--bg-main)' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#15803D', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={16} /> Process Customer Move Refund
          </h4>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Select Booking</label>
            <select
              value={refundBookingId}
              onChange={(e) => {
                setRefundBookingId(e.target.value);
                const b = bookings.find(x => x.id === e.target.value);
                if (b) setRefundAmount(b.pricing?.paidAmount || 0);
              }}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}
            >
              {bookings.map(b => (
                <option key={b.id} value={b.id}>#{b.bookingId} — {b.customer?.name} (Paid: ₹{b.pricing?.paidAmount})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Refund Amount (₹) *</label>
            <input type="number" required value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '16px', fontWeight: '700', color: '#15803D' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Mandatory Audit Refund Reason *</label>
            <textarea required value={refundReason} onChange={(e) => setRefundReason(e.target.value)} rows={3} placeholder="Provide audit explanation for accounting and customer notification" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#15803D', borderColor: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <DollarSign size={16} /> Process & Settle Refund
          </button>
        </form>
      </div>
    </div>
  );
}
