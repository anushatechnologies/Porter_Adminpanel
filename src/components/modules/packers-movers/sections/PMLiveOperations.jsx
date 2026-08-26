import React, { useState, useContext } from 'react';
import { Truck, MapPin, Clock, Eye, AlertTriangle, ShieldCheck, Navigation } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';
import BookingDetailModal from '../components/BookingDetailModal';

export default function PMLiveOperations() {
  const { bookings } = useContext(PackersMoversContext);
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const activeMoves = bookings.filter(b => ['CONFIRMED', 'TEAM_ASSIGNED', 'PACKING', 'LOADING', 'TRANSIT'].includes(b.status));

  const filtered = activeMoves.filter(b => {
    if (stageFilter === 'PACKING') return b.status === 'PACKING';
    if (stageFilter === 'LOADING') return b.status === 'LOADING';
    if (stageFilter === 'TRANSIT') return b.status === 'TRANSIT';
    return true;
  });

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={20} color="var(--primary)" /> Live Relocation Operations & GPS Radar
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Real-time tracking of active household moves, team transit telemetry and stage monitoring.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'PACKING', 'LOADING', 'TRANSIT'].map(f => (
            <button
              key={f}
              onClick={() => setStageFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid var(--border-color)',
                backgroundColor: stageFilter === f ? 'var(--primary)' : 'var(--bg-main)',
                color: stageFilter === f ? '#FFF' : 'var(--text-color)',
                cursor: 'pointer'
              }}
            >
              {f === 'ALL' ? `All Active (${activeMoves.length})` : f}
            </button>
          ))}
        </div>
      </div>

      {/* Operations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filtered.map(b => (
          <div key={b.id} className="card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '15px', fontWeight: '800' }}>#{b.bookingId}</span>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)' }}>{b.customer?.name} ({b.customer?.phone})</div>
              </div>
              <span style={{
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700',
                backgroundColor: b.status === 'TRANSIT' ? '#DBEAFE' : '#DCFCE7',
                color: b.status === 'TRANSIT' ? '#1D4ED8' : '#15803D'
              }}>
                {b.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Route */}
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: '8px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#10B981" />
                <span style={{ fontWeight: '600' }}>From:</span> {b.pickup?.address?.split(',')[0]} (Floor {b.pickup?.floor})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#3B82F6" />
                <span style={{ fontWeight: '600' }}>To:</span> {b.drop?.address?.split(',')[0]} (Floor {b.drop?.floor})
              </div>
            </div>

            {/* Live Telemetry Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Team:</span>
                <div style={{ fontWeight: '700', marginTop: '2px' }}>{b.team?.name || 'Alpha Movers'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle / Truck:</span>
                <div style={{ fontWeight: '700', marginTop: '2px' }}>{b.vehicle?.name} ({b.vehicle?.number || 'TS 08 UB 4512'})</div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => setSelectedBooking(b)} style={{ width: '100%', fontSize: '12px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Eye size={14} /> Open Live Move Dossier
            </button>
          </div>
        ))}
      </div>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onAssignTeam={() => {}}
          onOpenQuote={() => {}}
        />
      )}
    </div>
  );
}
