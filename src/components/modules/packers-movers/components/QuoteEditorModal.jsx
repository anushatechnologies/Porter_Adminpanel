import React, { useState, useContext } from 'react';
import { X, DollarSign, Send, Calculator, AlertCircle, Percent } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function QuoteEditorModal({ booking, onClose }) {
  const { sendRevisedQuote } = useContext(PackersMoversContext);

  const [baseFare, setBaseFare] = useState(booking?.pricing?.baseFare || 3200);
  const [distanceFare, setDistanceFare] = useState(booking?.pricing?.distanceFare || 350);
  const [packingCharge, setPackingCharge] = useState(booking?.pricing?.packingCharge || 1200);
  const [labourCharge, setLabourCharge] = useState(booking?.pricing?.labourCharge || 2400);
  const [floorHandling, setFloorHandling] = useState(booking?.pricing?.floorHandling || 300);
  const [dismantlingCharge, setDismantlingCharge] = useState(booking?.pricing?.dismantlingCharge || 800);
  const [discount, setDiscount] = useState(booking?.pricing?.discount || 500);
  const [customQuoteNotes, setCustomQuoteNotes] = useState('Special discount applied for weekday move.');

  if (!booking) return null;

  const subTotal = (parseFloat(baseFare) || 0) +
                   (parseFloat(distanceFare) || 0) +
                   (parseFloat(packingCharge) || 0) +
                   (parseFloat(labourCharge) || 0) +
                   (parseFloat(floorHandling) || 0) +
                   (parseFloat(dismantlingCharge) || 0) -
                   (parseFloat(discount) || 0);

  const gst = Math.round(subTotal * 0.18);
  const finalTotal = Math.max(0, subTotal + gst);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendRevisedQuote(booking.id, {
      baseFare: parseFloat(baseFare) || 0,
      distanceFare: parseFloat(distanceFare) || 0,
      packingCharge: parseFloat(packingCharge) || 0,
      labourCharge: parseFloat(labourCharge) || 0,
      floorHandling: parseFloat(floorHandling) || 0,
      dismantlingCharge: parseFloat(dismantlingCharge) || 0,
      discount: parseFloat(discount) || 0,
      gst,
      totalAmount: finalTotal,
      pendingAmount: finalTotal,
      quoteNotes: customQuoteNotes
    });
    alert(`Quotation of ₹${finalTotal.toLocaleString()} dispatched to customer ${booking.customer?.name} successfully!`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calculator size={20} color="var(--primary)" />
            <h3 className="modal-title">Review & Edit Quote — #{booking.bookingId}</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 24px' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <div>
              <div style={{ fontWeight: '700' }}>{booking.customer?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{booking.serviceTypeName} • {booking.itemsCount || 20} items</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Move Date</div>
              <div style={{ fontWeight: '600' }}>{booking.moveDate}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Base Fare (₹)</label>
              <input type="number" value={baseFare} onChange={(e) => setBaseFare(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Distance Fare (₹)</label>
              <input type="number" value={distanceFare} onChange={(e) => setDistanceFare(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Packing Material & Boxes (₹)</label>
              <input type="number" value={packingCharge} onChange={(e) => setPackingCharge(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Labour Crew Charge (₹)</label>
              <input type="number" value={labourCharge} onChange={(e) => setLabourCharge(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Floor & Stairs Surcharge (₹)</label>
              <input type="number" value={floorHandling} onChange={(e) => setFloorHandling(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Dismantling & Reassembly (₹)</label>
              <input type="number" value={dismantlingCharge} onChange={(e) => setDismantlingCharge(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Admin Custom Discount (₹)</label>
            <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', color: '#15803D', fontWeight: '600' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Notes to Customer / Special Instructions</label>
            <textarea value={customQuoteNotes} onChange={(e) => setCustomQuoteNotes(e.target.value)} rows={2} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
          </div>

          {/* Computed Estimate Box */}
          <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '14px 18px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#166534', marginBottom: '4px' }}>
              <span>Sub-Total:</span>
              <span>₹{subTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#166534', marginBottom: '6px' }}>
              <span>GST (18%):</span>
              <span>₹{gst.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#15803D', borderTop: '1px dashed #86EFAC', paddingTop: '6px' }}>
              <span>Final Customer Price:</span>
              <span>₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Send size={15} /> Dispatch Quote to Customer App
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
