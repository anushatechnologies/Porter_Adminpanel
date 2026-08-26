import React, { useState, useContext } from 'react';
import { Clock, Plus, Trash2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMTimeSlots() {
  const { timeSlots, addTimeSlot, updateTimeSlot, deleteTimeSlot } = useContext(PackersMoversContext);
  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState({
    label: '',
    startTime: '09:00',
    endTime: '11:00',
    maxBookings: 10,
    city: 'Hyderabad',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    isActive: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    const label = form.label || `${form.startTime} – ${form.endTime}`;
    addTimeSlot({ ...form, label });
    setShowAddForm(false);
    setForm({ label: '', startTime: '09:00', endTime: '11:00', maxBookings: 10, city: 'Hyderabad', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], isActive: true });
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--primary)" /> Relocation Time Slots & Max Capacity
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Configure customer-facing time windows. When bookings reach maximum quota, slot automatically disables on Customer App.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> {showAddForm ? 'Cancel' : 'Add Time Slot'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} noValidate className="card" style={{ padding: '16px 20px', borderRadius: '8px', border: '2px solid var(--primary)', backgroundColor: 'var(--bg-main)' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700' }}>Create New Moving Time Window</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Start Time</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm(p => ({ ...p, startTime: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>End Time</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm(p => ({ ...p, endTime: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Max Moves Capacity *</label>
              <input type="number" value={form.maxBookings} onChange={(e) => setForm(p => ({ ...p, maxBookings: parseInt(e.target.value) || 5 }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>City</label>
              <input type="text" value={form.city} onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)} style={{ fontSize: '12px' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '12px' }}>Save Time Slot</button>
          </div>
        </form>
      )}

      {/* Grid of Slots */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {timeSlots.map(slot => {
          const isFull = (slot.currentBookings || 0) >= slot.maxBookings;
          const fillPercentage = Math.min(100, Math.round(((slot.currentBookings || 0) / slot.maxBookings) * 100));

          return (
            <div
              key={slot.id}
              className="card"
              style={{
                padding: '16px 18px',
                borderRadius: '8px',
                border: isFull ? '1px solid #FCA5A5' : '1px solid var(--border-color)',
                backgroundColor: isFull ? '#FFF5F5' : 'var(--card-bg)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '800' }}>{slot.label}</span>
                <button
                  onClick={() => updateTimeSlot(slot.id, { isActive: !slot.isActive })}
                  style={{
                    border: 'none',
                    background: slot.isActive ? '#DCFCE7' : '#FEE2E2',
                    color: slot.isActive ? '#15803D' : '#B91C1C',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {slot.isActive ? 'Active' : 'Disabled'}
                </button>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Capacity Utilization:</span>
                  <span style={{ fontWeight: '700', color: isFull ? '#DC2626' : 'var(--primary)' }}>
                    {slot.currentBookings || 0} / {slot.maxBookings} booked ({fillPercentage}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${fillPercentage}%`, height: '100%', backgroundColor: isFull ? '#DC2626' : fillPercentage > 75 ? '#F59E0B' : '#10B981' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <span>City: <strong>{slot.city || 'Hyderabad'}</strong></span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="icon-btn"
                    onClick={() => {
                      const newCap = prompt('Enter new maximum bookings capacity:', slot.maxBookings);
                      if (newCap) updateTimeSlot(slot.id, { maxBookings: parseInt(newCap) || slot.maxBookings });
                    }}
                    style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                  >
                    Edit Cap
                  </button>
                  <button className="icon-btn" style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }} onClick={() => deleteTimeSlot(slot.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
