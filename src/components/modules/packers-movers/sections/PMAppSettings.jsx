import React, { useState, useContext, useEffect } from 'react';
import { Sliders, Check, Smartphone, ShieldCheck, Phone, Mail, Clock, Calendar } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMAppSettings() {
  const { appSettings, setAppSettings } = useContext(PackersMoversContext);
  const [form, setForm] = useState(appSettings || {});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (appSettings) {
      setForm(appSettings);
    }
  }, [appSettings]);

  const toggle = (key) => {
    setForm(prev => {
      const current = prev[key] === "true" || prev[key] === true;
      return {
        ...prev,
        [key]: current ? "false" : "true"
      };
    });
    setIsSaved(false);
  };

  const handleInputChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }));
    setIsSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setAppSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const togglesList = [
    { key: 'packersMoversEnabled', label: 'Master Packers & Movers Service', desc: 'Completely enable/disable Packers & Movers on customer mobile app' },
    { key: 'intracityEnabled', label: 'Intracity House Shifting', desc: 'Allow within-city local shifting bookings' },
    { key: 'intercityEnabled', label: 'Intercity Relocation', desc: 'Allow long-distance inter-city corridor bookings' },
    { key: 'onlinePriceEnabled', label: 'Instant Online Price Calculation', desc: 'Show instant algorithmic price quote to customers' },
    { key: 'quotePriceEnabled', label: 'Custom Quote Review Flow', desc: 'Send request to Admin desk for manual quote verification' },
    { key: 'liveTrackingEnabled', label: 'Live GPS Move Tracking', desc: 'Enable live 8-stage progress tracker and telemetry in app' },
    { key: 'otpVerificationEnabled', label: 'Delivery OTP Verification', desc: 'Require 4-digit OTP from customer to mark move as delivered' },
    { key: 'reviewsEnabled', label: 'Customer Ratings & Reviews', desc: 'Prompt customers for post-move crew reviews' },
    { key: 'couponsEnabled', label: 'Coupon & Promo Codes', desc: 'Allow promo voucher redemption at checkout' },
    { key: 'rescheduleEnabled', label: 'Customer Self Rescheduling', desc: 'Allow customer to reschedule time slot before notice period' },
    { key: 'cancellationEnabled', label: 'Customer Self Cancellation', desc: 'Allow customers to cancel with automated stage penalty refund' },
    { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily pause new Packers & Movers bookings' }
  ];

  return (
    <form onSubmit={handleSave} noValidate className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} color="var(--primary)" /> Flow 14 — Customer App Feature Toggles & System Policy
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Real-time feature switches read by Customer App via <code>GET /api/pm/app-settings</code>.
          </p>
        </div>

        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isSaved ? <Check size={16} /> : null}
          {isSaved ? 'Settings Saved to App!' : 'Save App Controls'}
        </button>
      </div>

      {/* Feature Toggles List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {togglesList.map(t => {
          const isOn = form[t.key] === "true" || form[t.key] === true;
          return (
            <div
              key={t.key}
              onClick={() => toggle(t.key)}
              className="card"
              style={{
                padding: '14px 18px',
                borderRadius: '8px',
                border: isOn ? '1px solid #BBF7D0' : '1px solid var(--border-color)',
                backgroundColor: isOn ? '#F0FDF4' : 'var(--card-bg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px', color: isOn ? '#166534' : 'var(--text-color)' }}>
                  {t.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {t.desc}
                </div>
              </div>

              <div style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '800',
                backgroundColor: isOn ? '#10B981' : '#E2E8F0',
                color: isOn ? '#FFF' : '#64748B'
              }}>
                {isOn ? 'ENABLED' : 'DISABLED'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance Booking & Support Contact Configuration */}
      <div className="card" style={{ padding: '18px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>Booking Notice Windows & Support Desk</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
              Minimum Advance Booking (Hours)
            </label>
            <input
              type="text"
              value={form.minimumAdvanceBookingHrs || "4"}
              onChange={(e) => handleInputChange('minimumAdvanceBookingHrs', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
              Maximum Advance Booking (Days)
            </label>
            <input
              type="text"
              value={form.maximumAdvanceBookingDays || "30"}
              onChange={(e) => handleInputChange('maximumAdvanceBookingDays', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
              P&M Customer Support Phone
            </label>
            <input
              type="text"
              value={form.supportPhone || "+919999999999"}
              onChange={(e) => handleInputChange('supportPhone', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
              P&M Customer Support Email
            </label>
            <input
              type="email"
              value={form.supportEmail || "support@porter.com"}
              onChange={(e) => handleInputChange('supportEmail', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
