import React, { useState, useContext, useEffect } from 'react';
import { Bell, Check, Send, Smartphone, Mail, MessageSquare } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMNotificationSettings() {
  const { appSettings, setAppSettings } = useContext(PackersMoversContext);
  const [triggers, setTriggers] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (appSettings?.notificationTriggers && Array.isArray(appSettings.notificationTriggers)) {
      setTriggers(appSettings.notificationTriggers);
    } else {
      setTriggers([]);
    }
  }, [appSettings]);

  const toggleChannel = (id, channel) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, [channel]: !t[channel] } : t));
    setIsSaved(false);
  };

  const updateTemplate = (id, template) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, template } : t));
    setIsSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (setAppSettings) {
      await setAppSettings({
        ...appSettings,
        notificationTriggers: triggers
      });
    }
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
