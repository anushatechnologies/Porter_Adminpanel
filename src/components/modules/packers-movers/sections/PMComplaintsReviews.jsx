import React, { useState, useContext } from 'react';
import { MessageSquare, Star, AlertTriangle, CheckCircle2, ShieldAlert, Edit, Check } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMComplaintsReviews() {
  const { complaints, updateComplaintStatus, teams } = useContext(PackersMoversContext);
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' | 'reviews'
  const [editingComplaintId, setEditingComplaintId] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  // Sample Customer Reviews
  const reviews = [
    { id: 'rev-1', bookingId: 'ANP-PM-8890', customerName: 'Deepak Verma', rating: 5, comment: 'Excellent 3-layer packing by Alpha Movers! TV and refrigerator reached completely safely.', date: '2026-08-25', teamName: 'Alpha Movers Unit' },
    { id: 'rev-2', bookingId: 'ANP-PM-8845', customerName: 'Sunita Reddy', rating: 4, comment: 'Good service and quick loading. Delay of 1 hr due to highway traffic, otherwise very professional.', date: '2026-08-22', teamName: 'Falcon Fast Shifters' },
    { id: 'rev-3', bookingId: 'ANP-PM-8812', customerName: 'K. Venkatesh', rating: 5, comment: 'Super fast dismantling and reassembly of our modular wardrobes. Highly recommended!', date: '2026-08-19', teamName: 'Express Interstate Team' }
  ];

  const handleResolve = (id) => {
    updateComplaintStatus(id, 'RESOLVED', resolutionText || 'Customer dispute resolved by Admin.');
    setEditingComplaintId(null);
    setResolutionText('');
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="var(--primary)" /> Customer Complaints & Star Reviews
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Investigate damaged/missing item claims, resolve moving team disputes and monitor customer satisfaction ratings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveTab('complaints')} className={`btn ${activeTab === 'complaints' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '12px' }}>
            Dispute Claims ({complaints.length})
          </button>
          <button onClick={() => setActiveTab('reviews')} className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '12px' }}>
            Customer Reviews ({reviews.length})
          </button>
        </div>
      </div>

      {activeTab === 'complaints' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {complaints.map(c => (
            <div key={c.id} className="card" style={{ padding: '18px 20px', borderRadius: '8px', border: c.status === 'OPEN' ? '1px solid #FCA5A5' : '1px solid var(--border-color)', backgroundColor: c.status === 'OPEN' ? '#FFF5F5' : 'var(--card-bg)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: '800', fontSize: '14px' }}>{c.id}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Booking: <strong>#{c.bookingId}</strong></span>
                  <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', fontWeight: '700' }}>{c.issueType}</span>
                </div>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  backgroundColor: c.status === 'OPEN' ? '#FEF3C7' : '#DCFCE7',
                  color: c.status === 'OPEN' ? '#B45309' : '#15803D'
                }}>
                  {c.status}
                </span>
              </div>

              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                Customer: <strong>{c.customerName}</strong> ({c.phone}) • Claimed Amount: <strong style={{ color: '#DC2626' }}>₹{c.compensationRequested}</strong>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)', padding: '10px', borderRadius: '6px' }}>
                Description: {c.description}
              </div>

              {c.resolutionNotes && (
                <div style={{ fontSize: '12px', color: '#15803D', backgroundColor: '#F0FDF4', padding: '8px 12px', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  <strong>Admin Resolution:</strong> {c.resolutionNotes}
                </div>
              )}

              {c.status === 'OPEN' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Enter resolution notes / wallet compensation..."
                    value={editingComplaintId === c.id ? resolutionText : ''}
                    onChange={(e) => { setEditingComplaintId(c.id); setResolutionText(e.target.value); }}
                    style={{ flex: 1, padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }}
                  />
                  <button className="btn btn-primary" onClick={() => handleResolve(c.id)} style={{ fontSize: '11px', padding: '6px 12px', backgroundColor: '#15803D', borderColor: '#15803D' }}>
                    <Check size={13} style={{ marginRight: '4px' }} /> Resolve Claim
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {reviews.map(r => (
            <div key={r.id} className="card" style={{ padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px' }}>{r.customerName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#D97706', fontWeight: '700', fontSize: '12px' }}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={13} fill="#D97706" />
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Booking #{r.bookingId} • {r.date}
                </div>
                <p style={{ fontSize: '12px', marginTop: '10px', color: 'var(--text-color)', lineHeight: '1.5' }}>
                  "{r.comment}"
                </p>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                Serviced by: {r.teamName}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
