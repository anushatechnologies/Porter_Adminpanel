import React, { useState, useEffect, useContext } from 'react';
import { Settings, Shield, ShieldCheck, Key, FileCode, Users, Plus, Save, RotateCcw, X, Edit } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';
import logoImg from '../../assets/logo.jpg';

export default function SettingsModule() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('porter_settings_active_tab') || 'general';
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('porter_settings_active_tab', activeTab);
    window.dispatchEvent(new Event('storage-update'));
  }, [activeTab]);

  const { settings, usersList, saveUsersList, saveSettingsContext } = useContext(AppStateContext);

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      ...settings,
      companyName: formData.get('companyName'),
      supportEmail: formData.get('supportEmail'),
      supportPhone: formData.get('supportPhone'),
      coverageCities: formData.get('coverageCities')
    };
    saveSettingsContext(updated);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleSavePricing = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      ...settings,
      bikeBaseFare: Number(formData.get('bikeBaseFare')),
      tataAceBaseFare: Number(formData.get('tataAceBaseFare')),
      pickupBaseFare: Number(formData.get('pickupBaseFare')),
      bikePerKm: Number(formData.get('bikePerKm')),
      tataAcePerKm: Number(formData.get('tataAcePerKm')),
      pickupPerKm: Number(formData.get('pickupPerKm')),
      surgePricing: formData.get('surgePricing') === 'on'
    };
    saveSettingsContext(updated);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [editingUserIndex, setEditingUserIndex] = useState(null);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Support Agent');
  const [newStaffStatus, setNewStaffStatus] = useState('Active');

  const handleOnboardStaff = (e) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;
    const staffData = {
      name: newStaffName.trim(),
      email: newStaffEmail.trim(),
      role: newStaffRole,
      status: newStaffStatus
    };

    if (editingUserIndex !== null) {
      const newList = usersList.map((u, i) => i === editingUserIndex ? staffData : u);
      saveUsersList(newList);
      setEditingUserIndex(null);
    } else {
      saveUsersList([...usersList, staffData]);
    }

    // Reset form states
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffRole('Support Agent');
    setNewStaffStatus('Active');
    setShowOnboardModal(false);
  };

  return (
    <div className="animate-fade">
      {/* Sub tabs */}
      <div className="tab-group">
        <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General Settings</button>
        <button className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`} onClick={() => setActiveTab('pricing')}>Pricing Configuration</button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Backoffice Users</button>
        <button className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>Roles & Permissions</button>
        <button className={`tab-btn ${activeTab === 'keys' ? 'active' : ''}`} onClick={() => setActiveTab('keys')}>API Keys</button>
        <button className={`tab-btn ${activeTab === 'legal' ? 'active' : ''}`} onClick={() => setActiveTab('legal')}>Legal & Policies</button>
      </div>

      <div className="dashboard-card">
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>General Company Configurations</h3>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
              <img
                src={logoImg}
                alt="Corporate Logo"
                style={{ height: '64px', width: '64px', objectFit: 'contain', borderRadius: '8px', backgroundColor: 'white', padding: '4px', border: '1px solid var(--border-color)' }}
              />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                  Corporate Brand Identity
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                  This logo is displayed on client receipts, operator dashboards, and dispatch logs.
                </p>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', display: 'block', marginTop: '6px' }}>
                  ✓ Active Logo: logo.jpg (1024x1024 px)
                </span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Company Display Name</label>
                <input type="text" name="companyName" defaultValue={settings?.companyName || "Anusha Porter Logistics"} />
              </div>
              <div className="form-group">
                <label>Corporate Support Email</label>
                <input type="email" name="supportEmail" defaultValue={settings?.supportEmail || "support@anushaporter.com"} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Support Phone Line</label>
                <input type="text" name="supportPhone" defaultValue={settings?.supportPhone || "+91 40 4567 8900"} />
              </div>
              <div className="form-group">
                <label>Default Currency</label>
                <input type="text" defaultValue="INR (₹)" disabled />
              </div>
            </div>

            <div className="form-group">
              <label>Service Coverage Cities (Comma separated)</label>
              <textarea name="coverageCities" defaultValue={settings?.coverageCities || "Hyderabad"} rows="2" placeholder="e.g. Hyderabad"></textarea>
            </div>

            {success && <div style={{ color: '#10B981', fontSize: '13px', fontWeight: '600' }}>✓ General settings saved successfully.</div>}

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              <Save size={14} /> Save Configurations
            </button>
          </form>
        )}

        {activeTab === 'pricing' && (
          <form onSubmit={handleSavePricing} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Fare & Billing Rates</h3>

            <div>
              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Standard Base Rates (₹)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Bike Base Fare (First 2 km)</label>
                  <input type="number" name="bikeBaseFare" defaultValue={settings?.bikeBaseFare || 40} />
                </div>
                <div className="form-group">
                  <label>Tata Ace Base Fare (First 5 km)</label>
                  <input type="number" name="tataAceBaseFare" defaultValue={settings?.tataAceBaseFare || 250} />
                </div>
                <div className="form-group">
                  <label>Pickup Truck Base Fare (First 5 km)</label>
                  <input type="number" name="pickupBaseFare" defaultValue={settings?.pickupBaseFare || 450} />
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Per Kilometer Rate (₹ / km)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Bike (Per km)</label>
                  <input type="number" name="bikePerKm" defaultValue={settings?.bikePerKm || 8} />
                </div>
                <div className="form-group">
                  <label>Tata Ace (Per km)</label>
                  <input type="number" name="tataAcePerKm" defaultValue={settings?.tataAcePerKm || 18} />
                </div>
                <div className="form-group">
                  <label>Pickup Truck (Per km)</label>
                  <input type="number" name="pickupPerKm" defaultValue={settings?.pickupPerKm || 28} />
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                <input type="checkbox" name="surgePricing" defaultChecked={settings?.surgePricing ?? true} style={{ accentColor: 'var(--primary)' }} />
                Enable Surge Pricing Multiplier
              </label>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '22px' }}>
                Automatically apply 1.25x surcharge multiplier during peak hours (06:00 PM - 09:00 PM) or heavy rains.
              </p>
            </div>

            {success && <div style={{ color: '#10B981', fontSize: '13px', fontWeight: '600' }}>✓ Pricing configurations updated.</div>}

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              <Save size={14} /> Update Tariffs
            </button>
          </form>
        )}

        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Operator Staff Accounts</h3>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingUserIndex(null);
                  setNewStaffName('');
                  setNewStaffEmail('');
                  setNewStaffRole('Support Agent');
                  setNewStaffStatus('Active');
                  setShowOnboardModal(true);
                }}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <Plus size={14} /> Onboard Staff
              </button>
            </div>

            <table className="custom-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Email</th>
                  <th>Role Scope</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((usr, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '600' }}>{usr.name}</td>
                    <td>{usr.email}</td>
                    <td>
                      <span className="badge badge-assigned">{usr.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${usr.status === 'Active' ? 'badge-online' : 'badge-offline'}`}>
                        {usr.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-row" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn btn-view"
                          title="Edit Staff Member"
                          onClick={() => {
                            setEditingUserIndex(idx);
                            setNewStaffName(usr.name);
                            setNewStaffEmail(usr.email);
                            setNewStaffRole(usr.role);
                            setNewStaffStatus(usr.status);
                            setShowOnboardModal(true);
                          }}
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'roles' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Access Control Matrix</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Super Admin Role</h4>
                  <span className="badge badge-online">Full Permissions</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Unrestricted reading and writing access to order assignments, driver onboarding, and financial settlements.</p>
              </div>

              <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Fleet Manager Role</h4>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>Onboarding & Routing Control</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Permission to coordinate and assign drivers, verify documents, and view live routes. Financial logs are view-only.</p>
              </div>

              <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Support Agent Role</h4>
                  <span style={{ fontSize: '11px', color: '#3B82F6', fontWeight: '600' }}>Customer Desk Control</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Coordinating double-chat queues to resolve customer/driver support requests. System billing configurations are locked.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Third Party API Tokens</h3>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Key size={14} /> Google Maps API Key</label>
              <input type="password" value="AIzaSyA1234567890BCDEF12345abcdefgh" disabled />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileCode size={14} /> Payment Gateway Gateway Secret (Razorpay)</label>
              <input type="password" value="rzp_live_secret_90123456789" disabled />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileCode size={14} /> SMS Verification Token (Twilio)</label>
              <input type="password" value="twilio_auth_token_secret_abc123" disabled />
            </div>

            <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
              <RotateCcw size={14} /> Rotate Active Credentials
            </button>
          </form>
        )}

        {activeTab === 'legal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Published Legal Privacy Policies</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Policy Card 1: Driver App */}
              <div className="policy-card" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>Active & Live</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Updated: Aug 10, 2026</span>
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Anusha Porter Driver Privacy Policy</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                  Required for Google Play Store submission. Describes background location tracking, data transmission, and driver identity management.
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => window.open('/privacy-policy', '_blank')}>
                    View Live Webpage
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }} onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + '/privacy-policy');
                    alert('Copied link: ' + window.location.origin + '/privacy-policy');
                  }}>
                    Copy URL Link
                  </button>
                </div>
              </div>

              {/* Policy Card 2: Customer App */}
              <div className="policy-card" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>Standard Draft</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Updated: Jun 12, 2026</span>
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Anusha Porter Customer Privacy Policy</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                  Handles passenger and ordering client information, billing terms, location sharing during active orders, and data retention guidelines.
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} disabled>
                    Draft Preview
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {showOnboardModal && (
        <div className="modal-backdrop" onClick={() => setShowOnboardModal(false)}>
          <div className="modal-container" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingUserIndex !== null ? 'Edit Staff Account' : 'Onboard Staff Account'}</h3>
              <button
                className="modal-close-btn"
                style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setShowOnboardModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleOnboardStaff}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Staff Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh@anushaporter.com"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Role Scope</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="custom-select"
                    style={{ width: '100%' }}
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Fleet Manager">Fleet Manager</option>
                    <option value="Support Agent">Support Agent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Status</label>
                  <select
                    value={newStaffStatus}
                    onChange={(e) => setNewStaffStatus(e.target.value)}
                    className="custom-select"
                    style={{ width: '100%' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOnboardModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingUserIndex !== null ? <Save size={14} /> : <Plus size={14} />} {editingUserIndex !== null ? 'Save Changes' : 'Onboard Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}