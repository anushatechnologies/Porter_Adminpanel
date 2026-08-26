import React, { useState, useContext } from 'react';
import { Sliders, Check, Smartphone, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMAppSettings() {
  const { appSettings, setAppSettings } = useContext(PackersMoversContext);
  const [form, setForm] = useState(appSettings);
  const [isSaved, setIsSaved] = useState(false);

  const toggle = (key) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
    setIsSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setAppSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const togglesList = [
    { key: 'enablePackersMovers', label: 'Master Packers & Movers Feature Toggle', desc: 'Completely enable or disable the Packers & Movers service on customer mobile app' },
    { key: 'enableWithinCity', label: 'Enable Local Within-City Shifting', desc: 'Allow customers to book intracity relocations' },
    { key: 'enableBetweenCities', label: 'Enable Inter-City Highway Moves', desc: 'Allow customers to book interstate/long-distance city moves' },
    { key: 'allowCustomerCustomItems', label: 'Allow Custom / Miscellaneous Item Input', desc: 'Allow users to type their own custom items not in catalogue' },
    { key: 'allowPhotoUpload', label: 'Allow Customer Inventory Photo Upload', desc: 'Allow customer to upload photos of bulky/fragile furniture' },
    { key: 'allowVideoUpload', label: 'Allow Video Tour Upload for Quotations', desc: 'Allow customers to record house video tour for estimates' },
    { key: 'enableOnlinePayment', label: 'Enable Online UPI / Card / Netbanking', desc: 'Allow direct instant payment gateways' },
    { key: 'enableCashOnDelivery', label: 'Enable Cash on Delivery / Unloading Settlement', desc: 'Allow customer to pay driver directly upon completion' },
    { key: 'enablePartialAdvancePayment', label: 'Enable Advance Token Deposit (e.g. 30%)', desc: 'Require partial deposit to confirm slot and balance at drop' },
    { key: 'enableCoupons', label: 'Enable Promo Code Discounts on Checkout', desc: 'Show promo code input box on customer checkout screen' },
    { key: 'enableRescheduling', label: 'Allow Self-Service Rescheduling in App', desc: 'Allow customers to change time slot before cutoff window' }
  ];

  return (
    <form onSubmit={handleSave} noValidate className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} color="var(--primary)" /> Customer Mobile App Feature Controls & Toggles
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Real-time control switches that dynamically show or hide options on the Customer Porter Android / iOS App.
          </p>
        </div>

        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isSaved ? <Check size={16} /> : null}
          {isSaved ? 'Settings Saved to App!' : 'Save App Controls'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {togglesList.map(t => {
          const isOn = Boolean(form[t.key]);
          return (
            <div
              key={t.key}
              onClick={() => toggle(t.key)}
              className="card"
              style={{
                padding: '16px 20px',
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
                fontSize: '12px',
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
    </form>
  );
}
