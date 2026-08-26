import React, { useState, useContext } from 'react';
import { Users, Truck, Plus, Star, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMTeamAssignment({ onOpenBooking }) {
  const { teams, setTeams, bookings } = useContext(PackersMoversContext);
  const [showAddTeam, setShowAddTeam] = useState(false);

  const [form, setForm] = useState({
    name: '',
    leaderName: '',
    phone: '',
    workersCount: 4,
    currentCity: 'Hyderabad',
    currentLocality: 'Gachibowli',
    rating: 4.8,
    isAvailable: true
  });

  const handleSaveTeam = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setTeams(prev => [...prev, { ...form, id: `team-${Date.now()}`, completedMoves: 0, activeBookingId: null }]);
    setForm({ name: '', leaderName: '', phone: '', workersCount: 4, currentCity: 'Hyderabad', currentLocality: 'Gachibowli', rating: 4.8, isAvailable: true });
    setShowAddTeam(false);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--primary)" /> Moving Crew Teams & Driver Dispatch
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Manage on-ground moving units, team leaders, worker counts, locality coverage and live move assignments.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddTeam(!showAddTeam)} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> {showAddTeam ? 'Cancel' : 'Register New Moving Unit'}
        </button>
      </div>

      {showAddTeam && (
        <form onSubmit={handleSaveTeam} noValidate className="card" style={{ padding: '16px 20px', borderRadius: '8px', border: '2px solid var(--primary)', backgroundColor: 'var(--bg-main)' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700' }}>Register Dedicated Moving Crew Team</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Unit Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Phoenix Shifters" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Team Leader</label>
              <input type="text" required value={form.leaderName} onChange={(e) => setForm(p => ({ ...p, leaderName: e.target.value }))} placeholder="Full Name" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Contact Phone</label>
              <input type="tel" required value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="9848012345" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Worker Crew Size</label>
              <input type="number" value={form.workersCount} onChange={(e) => setForm(p => ({ ...p, workersCount: parseInt(e.target.value) || 4 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Base Locality</label>
              <input type="text" value={form.currentLocality} onChange={(e) => setForm(p => ({ ...p, currentLocality: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddTeam(false)} style={{ fontSize: '12px' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '12px' }}>Save Moving Team</button>
          </div>
        </form>
      )}

      {/* Teams Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {teams.map(team => {
          const activeBooking = bookings.find(b => b.id === team.activeBookingId || b.bookingId === team.activeBookingId);
          return (
            <div key={team.id} className="card" style={{ padding: '18px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800' }}>{team.name}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: team.isAvailable ? '#DCFCE7' : '#FEF3C7',
                    color: team.isAvailable ? '#15803D' : '#B45309'
                  }}>
                    {team.isAvailable ? '🟢 Available' : '🚚 On Move'}
                  </span>
                </div>

                <div style={{ marginTop: '8px', fontSize: '12px' }}>
                  <div>Leader: <strong>{team.leaderName}</strong></div>
                  <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Phone size={12} /> {team.phone}
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                    Crew: <strong>{team.workersCount} Helpers</strong> • Base: {team.currentLocality}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-main)', padding: '8px 12px', borderRadius: '6px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: '700', fontSize: '12px' }}>
                    <Star size={14} fill="#D97706" /> {team.rating}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{team.completedMoves} Completed Moves</div>
                </div>

                {activeBooking && (
                  <div style={{ marginTop: '10px', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '11px' }}>
                    <div style={{ fontWeight: '700', color: '#1E40AF' }}>Currently Assigned To:</div>
                    <div style={{ color: '#1E40AF', marginTop: '2px' }}>#{activeBooking.bookingId} ({activeBooking.customer?.name})</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setTeams(p => p.map(t => t.id === team.id ? { ...t, isAvailable: !t.isAvailable } : t))}
                  style={{ flex: 1, fontSize: '11px', padding: '6px' }}
                >
                  Toggle Availability
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
