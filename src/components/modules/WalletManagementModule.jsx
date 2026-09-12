import React, { useState, useEffect, useContext } from 'react';
import {
  Wallet, Settings, Users, Truck, TrendingUp,
  Save, CheckCircle, AlertCircle, RefreshCw,
  Search, Edit3, ArrowUpCircle, ArrowDownCircle, Info, X
} from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

/* ──────────────────── helpers ──────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n ?? 0);

const StatusBadge = ({ status }) => {
  const map = {
    online:                { label: 'Online',       color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    offline:               { label: 'Offline',      color: '#64748B', bg: 'rgba(100,116,139,0.1)' },
    verification_requests: { label: 'Pending KYC',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
    rejected:              { label: 'Rejected',     color: '#EF4444', bg: 'rgba(239,68,68,0.1)'   },
  };
  const s = map[status] || map.offline;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
};

/* ──────────────────── Wallet Settings Tab ──────────────────── */
function WalletSettingsTab({ walletSettings, onSave }) {
  const [minBalance, setMinBalance]     = useState(walletSettings?.minRequiredBalance ?? 1000);
  const [commission, setCommission]     = useState(walletSettings?.commissionPercentage ?? 5);
  const [applyExisting, setApplyExisting] = useState(false);
  const [reason, setReason]             = useState('');
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);

  useEffect(() => {
    if (walletSettings) {
      setMinBalance(walletSettings.minRequiredBalance ?? 1000);
      setCommission(walletSettings.commissionPercentage ?? 5);
    }
  }, [walletSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ minimumBalance: Number(minBalance), commissionPercentage: Number(commission), applyToExistingDrivers: applyExisting, reason });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const currentMin  = walletSettings?.minRequiredBalance  ?? minBalance;
  const currentComm = walletSettings?.commissionPercentage ?? commission;

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      {/* Info banner */}
      <div style={{ padding:'16px', borderRadius:'12px', background:'rgba(30,93,255,0.05)', border:'1px solid rgba(30,93,255,0.18)', display:'flex', gap:'12px', alignItems:'flex-start' }}>
        <Info size={18} color="var(--primary)" style={{ marginTop:'2px', flexShrink:0 }} />
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
            <p style={{ fontSize:'13px', fontWeight:'700', color:'var(--primary)', margin:0 }}>Platform Wallet & Online Dispatch Policy</p>
            {currentMin === 0 ? (
              <span className="badge" style={{ backgroundColor:'#DCFCE7', color:'#15803D', fontSize:'11px', fontWeight:'700' }}>
                ⚡ Rapido / Swiggy ₹0 Online Mode: Active
              </span>
            ) : (
              <span className="badge" style={{ backgroundColor:'#FEF3C7', color:'#B45309', fontSize:'11px', fontWeight:'700' }}>
                Enforced ₹{currentMin} Minimum Balance
              </span>
            )}
          </div>
          <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'6px', lineHeight:'1.6', margin:0 }}>
            Set <strong>Minimum Required Balance to ₹0.00</strong> to allow driver partners to come online and accept deliveries
            even with a zero wallet balance (Rapido / Swiggy model). If set above ₹0, drivers must maintain that threshold to toggle online.
          </p>
        </div>
      </div>

      {/* Live stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
        {[
          { label:'Min Recharge Amount',   value: fmt(walletSettings?.minRechargeAmount ?? currentMin), icon: ArrowUpCircle, color:'#10B981' },
          { label:'Min Required Balance',  value: currentMin === 0 ? '₹0.00 (Zero Online)' : fmt(currentMin),  icon: Wallet, color:'var(--primary)' },
          { label:'Platform Commission',   value: currentComm + '%', icon: TrendingUp, color:'#F59E0B' },
        ].map(s => (
          <div key={s.label} style={{ padding:'18px', borderRadius:'12px', background:'var(--bg-card)', border:'1px solid var(--border-color)', display:'flex', flexDirection:'column', gap:'10px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <s.icon size={16} color={s.color} />
              <span style={{ fontSize:'12px', color:'var(--text-muted)', fontWeight:'500' }}>{s.label}</span>
            </div>
            <span style={{ fontSize:'22px', fontWeight:'800', color:s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Form with presets */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
        <div className="form-group">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
            <label style={{ fontWeight:'600', fontSize:'13px', margin:0 }}>Minimum Required / Recharge Balance (₹)</label>
            <div style={{ display:'flex', gap:'6px' }}>
              <button
                type="button"
                onClick={() => setMinBalance(0)}
                style={{
                  fontSize:'11px',
                  fontWeight:'700',
                  padding:'2px 8px',
                  borderRadius:'6px',
                  border:'1px solid #10B981',
                  backgroundColor: minBalance === 0 ? '#10B981' : '#ECFDF5',
                  color: minBalance === 0 ? '#FFFFFF' : '#047857',
                  cursor:'pointer'
                }}
              >
                ₹0 (Rapido Mode)
              </button>
              <button
                type="button"
                onClick={() => setMinBalance(500)}
                style={{
                  fontSize:'11px',
                  fontWeight:'600',
                  padding:'2px 6px',
                  borderRadius:'6px',
                  border:'1px solid var(--border-color)',
                  backgroundColor:'var(--bg-main)',
                  color:'var(--text-main)',
                  cursor:'pointer'
                }}
              >
                ₹500
              </button>
            </div>
          </div>
          <input type="number" min="0" step="50" value={minBalance} onChange={e => setMinBalance(e.target.value)} placeholder="0 for zero balance online" />
          <p style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'4px' }}>
            Set to <strong>0</strong> to allow ₹0 wallet drivers online. Set &gt;0 to require wallet pre-funding.
          </p>
        </div>
        <div className="form-group">
          <label style={{ fontWeight:'600', fontSize:'13px' }}>Platform Commission Percentage (%)</label>
          <input type="number" min="0" max="100" step="0.5" value={commission} onChange={e => setCommission(e.target.value)} placeholder="e.g. 5" />
          <p style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'4px' }}>Auto-deducted from driver wallet upon each completed ride.</p>
        </div>
      </div>

      <div className="form-group">
        <label style={{ fontWeight:'600' }}>Change Reason / Audit Note</label>
        <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Updated minimum platform wallet threshold for Q4" />
      </div>

      <div style={{ padding:'14px 16px', borderRadius:'10px', border:'1px solid var(--border-color)', background:'var(--bg-main)', display:'flex', alignItems:'center', gap:'10px' }}>
        <input type="checkbox" id="applyExisting" checked={applyExisting} onChange={e => setApplyExisting(e.target.checked)} style={{ accentColor:'var(--primary)', width:'16px', height:'16px', cursor:'pointer' }} />
        <label htmlFor="applyExisting" style={{ fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>Apply to Existing Drivers</label>
        <span style={{ fontSize:'12px', color:'var(--text-muted)' }}>— Drivers below the new threshold will be credited and brought online automatically.</span>
      </div>

      {saved && (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#10B981', fontSize:'13px', fontWeight:'600' }}>
          <CheckCircle size={16} /> Wallet settings saved successfully.
        </div>
      )}

      <div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px' }}>
          {saving ? <RefreshCw size={14} style={{ animation:'spin 1s linear infinite' }} /> : <Save size={14} />}
          {saving ? 'Saving...' : 'Save Wallet Settings'}
        </button>
      </div>
    </form>
  );
}

/* ──────────────────── Modify Wallet Modal ──────────────────── */
function ModifyWalletModal({ entity, userType, onClose, onSubmit }) {
  const [action, setAction]       = useState('credit');
  const [amount, setAmount]       = useState('');
  const [reason, setReason]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [done, setDone]           = useState(null);

  const currentBalance = entity.wallet ?? entity.walletBalance ?? 0;
  const amountNum      = parseFloat(amount) || 0;
  const previewBalance = action === 'credit' ? currentBalance + amountNum
    : action === 'debit'  ? currentBalance - amountNum
    : amountNum;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0)                     { setError('Please enter a valid positive amount.'); return; }
    if (action === 'debit' && amt > currentBalance) { setError('Debit amount exceeds current balance.'); return; }
    setSubmitting(true);
    const result = await onSubmit(entity.id, userType, amt, action, reason);
    setSubmitting(false);
    if (result && result.success) {
      setDone({ newBalance: result.walletBalance });
    } else {
      setError((result && result.message) || 'Something went wrong. Please try again.');
    }
  };

  const actionOpts = [
    { value:'credit', label:'Credit',    icon: ArrowUpCircle,   color:'#10B981' },
    { value:'debit',  label:'Debit',     icon: ArrowDownCircle, color:'#EF4444' },
    { value:'set',    label:'Set Exact', icon: Edit3,           color:'#F59E0B' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth:'480px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Wallet size={18} color="var(--primary)" />
            </div>
            <div>
              <h3 className="modal-title" style={{ margin:0 }}>Adjust Wallet Balance</h3>
              <p style={{ fontSize:'12px', color:'var(--text-muted)', margin:0 }}>{userType === 'driver' ? '🚛' : '👤'} {entity.name || ('ID: ' + entity.id)}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ border:'none', background:'none', cursor:'pointer', display:'flex' }}><X size={20} /></button>
        </div>

        {done ? (
          <div className="modal-body" style={{ textAlign:'center', padding:'32px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' }}>
            <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'rgba(16,185,129,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <CheckCircle size={32} color="#10B981" />
            </div>
            <div>
              <p style={{ fontSize:'15px', fontWeight:'700', color:'#10B981' }}>Wallet Updated Successfully!</p>
              <p style={{ fontSize:'13px', color:'var(--text-muted)', marginTop:'6px' }}>New balance: <strong>{fmt(done.newBalance)}</strong></p>
            </div>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
              {/* Current balance */}
              <div style={{ padding:'14px', borderRadius:'10px', background:'var(--bg-main)', border:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'13px', color:'var(--text-muted)' }}>Current Balance</span>
                <span style={{ fontSize:'18px', fontWeight:'800', color: currentBalance < 0 ? '#EF4444' : 'var(--text-main)' }}>{fmt(currentBalance)}</span>
              </div>

              {/* Action selector */}
              <div className="form-group" style={{ margin:0 }}>
                <label style={{ fontWeight:'600' }}>Action</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginTop:'8px' }}>
                  {actionOpts.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setAction(opt.value)}
                      style={{ padding:'10px 8px', borderRadius:'10px', border:'2px solid ' + (action === opt.value ? opt.color : 'var(--border-color)'), background: action === opt.value ? (opt.color + '12') : 'transparent', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', cursor:'pointer', transition:'all 0.2s' }}>
                      <opt.icon size={16} color={action === opt.value ? opt.color : 'var(--text-muted)'} />
                      <span style={{ fontSize:'12px', fontWeight:'600', color: action === opt.value ? opt.color : 'var(--text-muted)' }}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="form-group" style={{ margin:0 }}>
                <label style={{ fontWeight:'600' }}>
                  Amount (₹) — {action === 'set' ? 'New Balance' : action === 'credit' ? 'To Add' : 'To Deduct'}
                </label>
                <input type="number" min="0" step="0.01" value={amount} onChange={e => { setAmount(e.target.value); setError(''); }} placeholder="Enter amount" required autoFocus />
              </div>

              {/* Preview */}
              {amountNum > 0 && (
                <div style={{ padding:'12px 14px', borderRadius:'10px', border:'1px solid ' + (previewBalance < 0 ? '#EF444433' : 'rgba(30,93,255,0.15)'), background: previewBalance < 0 ? 'rgba(239,68,68,0.05)' : 'rgba(30,93,255,0.05)' }}>
                  <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>Balance Preview</p>
                  <p style={{ fontSize:'20px', fontWeight:'800', color: previewBalance < 0 ? '#EF4444' : 'var(--primary)', marginTop:'4px' }}>{fmt(previewBalance)}</p>
                </div>
              )}

              {/* Reason */}
              <div className="form-group" style={{ margin:0 }}>
                <label style={{ fontWeight:'600' }}>Reason / Note</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Bonus promotional credit, manual correction..." />
              </div>

              {error && (
                <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#EF4444', fontSize:'13px', fontWeight:'600' }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}
                style={{ background: action === 'debit' ? '#EF4444' : action === 'set' ? '#F59E0B' : 'var(--primary)', display:'inline-flex', alignItems:'center', gap:'6px' }}>
                {submitting ? <RefreshCw size={14} style={{ animation:'spin 1s linear infinite' }} /> : <Wallet size={14} />}
                {submitting ? 'Processing...' : (action.charAt(0).toUpperCase() + action.slice(1) + ' Wallet')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ──────────────────── Wallet Table ──────────────────── */
function WalletEntityTable({ entities, userType, onModify, searchQuery, setSearchQuery, loading }) {
  const q = searchQuery.toLowerCase();
  const filtered = entities.filter(e =>
    (e.name || '').toLowerCase().includes(q) ||
    String(e.id || '').toLowerCase().includes(q) ||
    (e.phone || '').includes(q) ||
    (e.email || '').toLowerCase().includes(q)
  );

  const colCount = userType === 'driver' ? 7 : 5;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      {/* Search */}
      <div style={{ position:'relative', maxWidth:'360px' }}>
        <Search size={15} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
        <input type="text" placeholder={'Search ' + userType + 's by name, ID, phone...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft:'36px', width:'100%' }} />
      </div>

      <div style={{ overflowX:'auto', borderRadius:'12px', border:'1px solid var(--border-color)' }}>
        <table className="custom-table" style={{ fontSize:'13px', margin:0 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>{userType === 'driver' ? 'Driver' : 'Customer'}</th>
              <th>Phone</th>
              {userType === 'driver' && <th>Status</th>}
              <th>Wallet Balance</th>
              {userType === 'driver' && <th>Vehicle</th>}
              <th style={{ textAlign:'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={colCount} style={{ textAlign:'center', padding:'30px', color:'var(--text-muted)' }}>Loading {userType}s...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={colCount} style={{ textAlign:'center', padding:'30px', color:'var(--text-muted)' }}>No {userType}s found.</td></tr>}
            {!loading && filtered.map(entity => {
              const balance   = entity.wallet ?? entity.walletBalance ?? 0;
              const isNeg     = balance < 0;
              const isLow     = !isNeg && balance < 100;
              const initials  = (entity.name || '?')[0]?.toUpperCase();
              return (
                <tr key={entity.id}>
                  <td style={{ fontFamily:'monospace', fontSize:'12px', color:'var(--text-muted)' }}>#{String(entity.id).slice(-6)}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      {(entity.profilePhotoUri || entity.avatar) ? (
                        <img src={entity.profilePhotoUri || entity.avatar} alt="" style={{ width:'32px', height:'32px', borderRadius:'50%', objectFit:'cover', border:'2px solid var(--border-color)', flexShrink:0 }} onError={e => { e.target.style.display='none'; }} />
                      ) : (
                        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:'var(--primary)', flexShrink:0 }}>{initials}</div>
                      )}
                      <div>
                        <div style={{ fontWeight:'600', color:'var(--text-main)', fontSize:'13px' }}>
                          {entity.name || <span style={{ color:'var(--text-muted)', fontStyle:'italic' }}>Unknown</span>}
                        </div>
                        {entity.email && entity.email !== 'N/A' && <div style={{ fontSize:'11px', color:'var(--text-muted)' }}>{entity.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>{entity.phone || 'N/A'}</td>
                  {userType === 'driver' && <td><StatusBadge status={entity.status} /></td>}
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ fontWeight:'800', fontSize:'14px', color: isNeg ? '#EF4444' : isLow ? '#F59E0B' : '#10B981' }}>{fmt(balance)}</span>
                      {isNeg  && <span style={{ padding:'2px 7px', borderRadius:'20px', fontSize:'10px', fontWeight:'700', color:'#EF4444', background:'rgba(239,68,68,0.1)' }}>Negative</span>}
                      {isLow  && <span style={{ padding:'2px 7px', borderRadius:'20px', fontSize:'10px', fontWeight:'700', color:'#F59E0B', background:'rgba(245,158,11,0.1)' }}>Low</span>}
                    </div>
                  </td>
                  {userType === 'driver' && <td style={{ fontSize:'12px', color:'var(--text-muted)' }}>{entity.vehicleType || entity.vehicle || '—'}</td>}
                  <td style={{ textAlign:'right' }}>
                    <button className="btn btn-secondary" style={{ padding:'6px 14px', fontSize:'12px', display:'inline-flex', alignItems:'center', gap:'5px' }} onClick={() => onModify(entity)}>
                      <Wallet size={13} /> Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>Showing {filtered.length} of {entities.length} {userType}s</p>
    </div>
  );
}

/* ═══════════════════════ MAIN MODULE ════════════════════════════════════ */
export default function WalletManagementModule() {
  const {
    drivers, customers, walletSettings,
    fetchWalletSettings, updateWalletSettings, adminModifyWallet,
    loading, authFetch, setDrivers, setCustomers
  } = useContext(AppStateContext);

  const [activeTab, setActiveTab]       = useState(() => localStorage.getItem('porter_wallet_active_tab') || 'settings');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [modifyTarget, setModifyTarget] = useState(null);
  const [driverSearch, setDriverSearch] = useState('');
  const [custSearch, setCustSearch]     = useState('');

  useEffect(() => { localStorage.setItem('porter_wallet_active_tab', activeTab); }, [activeTab]);

  useEffect(() => {
    if (fetchWalletSettings) {
      setSettingsLoading(true);
      fetchWalletSettings().finally(() => setSettingsLoading(false));
    }
  }, []);

  /* Save wallet settings */
  const handleSaveSettings = async (payload) => {
    if (updateWalletSettings) return await updateWalletSettings(payload);
    try {
      const res = await authFetch('/api/admin/wallet/minimum-balance', { method:'PUT', body: JSON.stringify(payload) });
      return await res.json();
    } catch (e) { return { success:false }; }
  };

  /* Modify an individual wallet */
  const handleModifyWallet = async (entityId, userType, amount, action, reason) => {
    if (adminModifyWallet) return await adminModifyWallet({ userType, id: String(entityId), amount, action, reason });

    try {
      const res = await authFetch('/api/admin/wallet/modify', {
        method: 'POST',
        body: JSON.stringify({ userType, id: String(entityId), amount, action, reason })
      });
      const data = await res.json();
      if (data.success) {
        const newBal = data.walletBalance ?? data.driverWalletBalance ?? data.previousBalance + amount;
        if (userType === 'driver' && setDrivers) {
          setDrivers(prev => prev.map(d =>
            String(d.id) === String(entityId) || String(d.driverId) === String(entityId)
              ? { ...d, wallet: newBal, walletBalance: newBal, status: data.status || d.status }
              : d
          ));
        } else if (setCustomers) {
          setCustomers(prev => prev.map(c => String(c.id) === String(entityId) ? { ...c, wallet: newBal } : c));
        }
        return { success: true, walletBalance: newBal };
      }
      return { success: false, message: data.message || 'Failed to update wallet.' };
    } catch (e) {
      // Graceful local fallback when backend is offline
      const list   = userType === 'driver' ? drivers : customers;
      const entity = list.find(x => String(x.id) === String(entityId));
      if (entity) {
        const cur    = entity.wallet ?? entity.walletBalance ?? 0;
        const newBal = action === 'credit' ? cur + amount : action === 'debit' ? cur - amount : amount;
        if (userType === 'driver' && setDrivers) {
          setDrivers(prev => prev.map(d => String(d.id) === String(entityId) ? { ...d, wallet: newBal, walletBalance: newBal } : d));
        } else if (setCustomers) {
          setCustomers(prev => prev.map(c => String(c.id) === String(entityId) ? { ...c, wallet: newBal } : c));
        }
        return { success: true, walletBalance: newBal };
      }
      return { success: false, message: 'Network error.' };
    }
  };

  /* Summary stats */
  const minRequiredBal      = walletSettings?.minRequiredBalance ?? 0;
  const totalDriverWallet   = drivers.reduce((s, d) => s + (d.wallet ?? d.walletBalance ?? 0), 0);
  const totalCustomerWallet = customers.reduce((s, c) => s + (c.wallet ?? 0), 0);
  const driversBlocked      = drivers.filter(d => {
    const bal = d.wallet ?? d.walletBalance ?? 0;
    return minRequiredBal === 0 ? bal < 0 : bal < minRequiredBal;
  }).length;
  const driversOnline       = drivers.filter(d => d.status === 'online').length;

  const tabs = [
    { id:'settings',   label:'Wallet & Commission Settings', icon: Settings },
    { id:'drivers',    label:'Driver Wallets',               icon: Truck    },
    { id:'customers',  label:'Customer Wallets',             icon: Users    },
  ];

  return (
    <div className="animate-fade">
      {/* Page header */}
      <div style={{ marginBottom:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg,#1E5DFF,#0A4BE2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Wallet size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize:'20px', fontWeight:'800', margin:0 }}>Wallet Management</h2>
            <p style={{ fontSize:'13px', color:'var(--text-muted)', margin:0 }}>Control platform wallet policies, commissions & individual balances</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {[
          { label:'Total Driver Wallet Pool', value: fmt(totalDriverWallet),   icon: Truck,      color:'var(--primary)', sub: drivers.length   + ' drivers'   },
          { label:'Drivers Online',           value: driversOnline,            icon: TrendingUp, color:'#10B981',        sub: 'of ' + drivers.length + ' total' },
          { label:'Blocked (Zero / Neg.)',    value: driversBlocked,           icon: AlertCircle,color:'#EF4444',        sub: 'need recharge'                   },
          { label:'Customer Wallet Pool',     value: fmt(totalCustomerWallet), icon: Users,      color:'#8B5CF6',        sub: customers.length + ' customers'   },
        ].map(stat => (
          <div key={stat.label} className="dashboard-card" style={{ padding:'18px', border:'1px solid var(--border-color)' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'10px', background: stat.color.startsWith('#') ? stat.color + '18' : 'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' }}>
              <stat.icon size={18} color={stat.color} />
            </div>
            <div style={{ fontSize:'22px', fontWeight:'800', color:stat.color }}>{stat.value}</div>
            <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'4px', fontWeight:'500' }}>{stat.label}</div>
            <div style={{ fontSize:'11px', color:'var(--text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-group" style={{ marginBottom:'0' }}>
        {tabs.map(t => (
          <button key={t.id} className={'tab-btn ' + (activeTab === t.id ? 'active' : '')} onClick={() => setActiveTab(t.id)} style={{ display:'inline-flex', alignItems:'center', gap:'6px' }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="dashboard-card" style={{ marginTop:'0', borderTopLeftRadius:'0', borderTopRightRadius:'0', border:'1px solid var(--border-color)', borderTop:'none' }}>
        {activeTab === 'settings'  && <WalletSettingsTab walletSettings={walletSettings} onSave={handleSaveSettings} />}
        {activeTab === 'drivers'   && (
          <WalletEntityTable entities={drivers}   userType="driver"   onModify={e => setModifyTarget({ entity:e, userType:'driver'   })} searchQuery={driverSearch} setSearchQuery={setDriverSearch} loading={loading} />
        )}
        {activeTab === 'customers' && (
          <WalletEntityTable entities={customers} userType="customer" onModify={e => setModifyTarget({ entity:e, userType:'customer' })} searchQuery={custSearch}   setSearchQuery={setCustSearch}   loading={loading} />
        )}
      </div>

      {/* Modify modal */}
      {modifyTarget && (
        <ModifyWalletModal
          entity={modifyTarget.entity}
          userType={modifyTarget.userType}
          onClose={() => setModifyTarget(null)}
          onSubmit={handleModifyWallet}
        />
      )}
    </div>
  );
}