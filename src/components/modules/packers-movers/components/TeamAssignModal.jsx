import React, { useState, useContext } from 'react';
import { X, Users, Truck, Check, Star, MapPin, CheckCircle2 } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function TeamAssignModal({ booking, onClose }) {
  const { teams, vehicles, assignTeamToBooking } = useContext(PackersMoversContext);

  const [selectedTeamId, setSelectedTeamId] = useState(booking?.team?.id || teams.find(t => t.isAvailable)?.id || teams[0]?.id);
  const [vehicleNumber, setVehicleNumber] = useState(booking?.vehicle?.number || 'TS 08 UB 4512');
  const [driverName, setDriverName] = useState(booking?.driver?.name || 'Ramesh Reddy');
  const [driverPhone, setDriverPhone] = useState(booking?.driver?.phone || '9848123456');

  if (!booking) return null;

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedTeamId) {
      alert('Please select a moving crew team.');
      return;
    }
    assignTeamToBooking(booking.id, selectedTeamId, vehicleNumber, driverName, driverPhone);
    alert(`Team & Vehicle successfully assigned to Booking #${booking.bookingId}!`);
    onClose();
  };

  const handleAutoAssign = () => {
    const available = teams.find(t => t.isAvailable) || teams[0];
    if (available) {
      setSelectedTeamId(available.id);
      setDriverName(available.leaderName);
      setDriverPhone(available.phone);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--primary)" />
            <h3 className="modal-title">Assign Moving Crew & Truck — #{booking.bookingId}</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleAssign} noValidate className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 24px' }}>
          {/* Header context */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-main)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px' }}>
            <div>
              <div style={{ fontWeight: '700' }}>{booking.customer?.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{booking.serviceTypeName} • {booking.moveDate} ({booking.timeSlot})</div>
            </div>
            <button type="button" className="btn btn-secondary" onClick={handleAutoAssign} style={{ fontSize: '12px', padding: '5px 10px' }}>
              ⚡ Auto-Match Best Team
            </button>
          </div>

          {/* Teams Selection List */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
              Select Operational Moving Crew:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {teams.map(team => {
                const isSelected = selectedTeamId === team.id;
                return (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--card-bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px' }}>
                        {team.name}
                        {team.isAvailable ? (
                          <span style={{ fontSize: '10px', backgroundColor: '#DCFCE7', color: '#15803D', padding: '2px 6px', borderRadius: '10px', fontWeight: '600' }}>Available</span>
                        ) : (
                          <span style={{ fontSize: '10px', backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '10px', fontWeight: '600' }}>Busy (Active Move)</span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Leader: <strong>{team.leaderName}</strong> ({team.phone}) • {team.workersCount} Workers • Locality: {team.currentLocality}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#D97706' }}>
                        <Star size={13} fill="#D97706" /> {team.rating}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{team.completedMoves} moves</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vehicle and Driver details */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
              Vehicle & Driver Logistics:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Vehicle Number Plate</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="TS 08 UB 4512"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', textTransform: 'uppercase', fontWeight: '600' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Driver Name</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Driver Full Name"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Driver Contact Number</label>
                <input
                  type="tel"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="9848012345"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Confirm Assignment & Notify Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
