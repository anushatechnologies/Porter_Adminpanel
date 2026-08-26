import React, { useState } from 'react';
import { Bell, Check, Send, Smartphone, Mail, MessageSquare } from 'lucide-react';

const INITIAL_TRIGGERS = [
  { id: 'trig-1', event: 'Booking Created', sms: true, push: true, email: true, template: 'Hi {customer_name}, your Packers & Movers booking #{booking_id} for {move_date} has been received!' },
  { id: 'trig-2', event: 'Quote Generated / Revised', sms: true, push: true, email: true, template: 'Hi {customer_name}, your moving quotation for #{booking_id} is ready: ₹{total_amount}. Open app to review & approve.' },
  { id: 'trig-3', event: 'Payment Successful', sms: true, push: true, email: true, template: 'Payment of ₹{paid_amount} received for booking #{booking_id}. Your slot {time_slot} is now confirmed!' },
  { id: 'trig-4', event: 'Team Assigned', sms: true, push: true, email: false, template: 'Team {team_name} (Lead: {leader_name}, {leader_phone}) has been assigned to your move #{booking_id}.' },
  { id: 'trig-5', event: 'Team Arrived & Packing Started', sms: false, push: true, email: false, template: 'Your moving crew has arrived at origin and started packing your inventory items.' },
  { id: 'trig-6', event: 'Truck Loaded & In Transit', sms: true, push: true, email: false, template: 'Truck {vehicle_number} is now in transit to destination. Track live GPS in the Porter app.' },
  { id: 'trig-7', event: 'Delivery & Unpacking Completed', sms: true, push: true, email: true, template: 'Your move #{booking_id} is completed! Please verify items and share your service rating.' },
  { id: 'trig-8', event: 'Booking Cancelled & Refund Processed', sms: true, push: true, email: true, template: 'Booking #{booking_id} cancelled. Refund of ₹{refund_amount} has been processed.' }
];

export default function PMNotificationSettings() {
  const [triggers, setTriggers] = useState(INITIAL_TRIGGERS);
  const [isSaved, setIsSaved] = useState(false);

  const toggleChannel = (id, channel) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, [channel]: !t[channel] } : t));
    setIsSaved(false);
  };

  const updateTemplate = (id, template) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, template } : t));
    setIsSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} noValidate className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="var(--primary)" /> Relocation Notification & SMS Engine
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Configure real-time automated Push Notifications, SMS, and Email alert templates across all 8 move milestones.
          </p>
        </div>

        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isSaved ? <Check size={16} /> : null}
          {isSaved ? 'Templates Saved!' : 'Save Notification Rules'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {triggers.map(trig => (
          <div key={trig.id} className="card" style={{ padding: '16px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>{trig.event}</span>

              {/* Channel Checkboxes */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={trig.push} onChange={() => toggleChannel(trig.id, 'push')} />
                  <Smartphone size={14} /> Push Notification
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={trig.sms} onChange={() => toggleChannel(trig.id, 'sms')} />
                  <MessageSquare size={14} /> SMS
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={trig.email} onChange={() => toggleChannel(trig.id, 'email')} />
                  <Mail size={14} /> Email
                </label>
              </div>
            </div>

            <div>
              <textarea
                value={trig.template}
                onChange={(e) => updateTemplate(trig.id, e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px', backgroundColor: 'var(--bg-main)' }}
              />
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
