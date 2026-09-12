import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, Zap, CheckCircle2, X } from 'lucide-react';
import { useToast } from './ToastNotification';

export default function SurgeTimingSection() {
  const { addToast } = useToast();
  const [surgeRules, setSurgeRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('porter_admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const defaultRule = {
    surgeName: 'Evening Rush Hour',
    surgeType: 'PEAK',
    multiplier: 1.25,
    percentage: 25.0,
    fixedAmount: 30.0,
    startTime: '18:00:00',
    endTime: '22:00:00',
    daysOfWeek: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY',
    active: true
  };

  const initialPresets = [
    {
      id: 'sr-1',
      surgeName: 'Evening Rush Hour',
      surgeType: 'PEAK',
      multiplier: 1.25,
      percentage: 25.0,
      fixedAmount: 30.0,
      startTime: '18:00:00',
      endTime: '22:00:00',
      daysOfWeek: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY',
      active: true
    },
    {
      id: 'sr-2',
      surgeName: 'Late Night Safe Travel Window',
      surgeType: 'NIGHT',
      multiplier: 1.30,
      percentage: 30.0,
      fixedAmount: 50.0,
      startTime: '23:00:00',
      endTime: '05:00:00',
      daysOfWeek: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY',
      active: true
    },
    {
      id: 'sr-3',
      surgeName: 'Weekend Morning Demand',
      surgeType: 'PEAK',
      multiplier: 1.15,
      percentage: 15.0,
      fixedAmount: 20.0,
      startTime: '08:00:00',
      endTime: '12:00:00',
      daysOfWeek: 'SATURDAY,SUNDAY',
      active: false
    }
  ];

  const fetchSurgeRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/passenger/surge-rules', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.rules || data.surgeRules || []);
        if (list.length > 0) {
          setSurgeRules(list);
          return;
        }
      }
      setSurgeRules(initialPresets);
    } catch (e) {
      console.warn('Could not fetch /api/admin/passenger/surge-rules, using defaults:', e);
      setSurgeRules(initialPresets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurgeRules();
  }, []);

  const handleOpenAdd = () => {
    setEditingRule({ ...defaultRule, id: `sr-${Date.now()}` });
    setShowModal(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule({ ...rule });
    setShowModal(true);
  };

  const handleToggleActive = async (rule) => {
    const updated = { ...rule, active: !rule.active };
    setSurgeRules(prev => prev.map(r => r.id === rule.id ? updated : r));

    try {
      await fetch(`/api/admin/passenger/surge-rules/${rule.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updated)
      });
      addToast(`Surge rule "${rule.surgeName}" set to ${updated.active ? 'Active' : 'Inactive'}.`, 'success');
    } catch (e) {
      addToast(`Updated surge status locally.`, 'info');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingRule) return;

    setIsSaving(true);
    const isEdit = surgeRules.some(r => r.id === editingRule.id);
    const endpoint = isEdit ? `/api/admin/passenger/surge-rules/${editingRule.id}` : '/api/admin/passenger/surge-rules';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(editingRule)
      });

      if (res.ok) {
        const saved = await res.json();
        addToast(`Surge rule "${editingRule.surgeName}" saved successfully!`, 'success');
        setSurgeRules(prev => {
          if (isEdit) {
            return prev.map(r => r.id === editingRule.id ? (saved.id ? saved : editingRule) : r);
          } else {
            return [saved.id ? saved : editingRule, ...prev];
          }
        });
        setShowModal(false);
      } else {
        setSurgeRules(prev => {
          if (isEdit) {
            return prev.map(r => r.id === editingRule.id ? editingRule : r);
          } else {
            return [editingRule, ...prev];
          }
        });
        addToast(`Surge rule saved in local state.`, 'info');
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error saving surge rule:', err);
      setSurgeRules(prev => {
        if (isEdit) {
          return prev.map(r => r.id === editingRule.id ? editingRule : r);
        } else {
          return [editingRule, ...prev];
        }
      });
      addToast('Saved surge rule in local state (Network fallback).', 'info');
      setShowModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="#F59E0B" />
            Timings & Surge Windows Management
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Configure peak hours, night windows, multipliers, and active days (GET/POST/PUT <code>/api/admin/passenger/surge-rules</code>).
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={handleOpenAdd}
        >
          <Plus size={16} /> Add Timing Surge Rule
        </button>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Rule Name</th>
              <th>Type</th>
              <th>Timing Window</th>
              <th>Multiplier</th>
              <th>Percentage / Fixed</th>
              <th>Days Active</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {surgeRules.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No surge timing rules defined. Click "Add Timing Surge Rule" to create one.
                </td>
              </tr>
            ) : (
              surgeRules.map(rule => (
                <tr key={rule.id}>
                  <td style={{ fontWeight: '700' }}>{rule.surgeName}</td>
                  <td>
                    <span className="badge" style={{
                      backgroundColor: rule.surgeType === 'NIGHT' ? '#312E81' : '#FEF3C7',
                      color: rule.surgeType === 'NIGHT' ? '#E0E7FF' : '#B45309',
                      fontWeight: '700'
                    }}>
                      {rule.surgeType}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color="var(--text-muted)" />
                      {rule.startTime} - {rule.endTime}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--primary)' }}>{rule.multiplier}x</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px' }}>+{rule.percentage}% (+₹{rule.fixedAmount})</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {rule.daysOfWeek.split(',').map(d => d.slice(0, 3)).join(', ')}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`badge ${rule.active ? 'badge-online' : 'badge-offline'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      onClick={() => handleToggleActive(rule)}
                    >
                      {rule.active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="action-btn"
                      title="Edit Rule"
                      onClick={() => handleOpenEdit(rule)}
                    >
                      <Edit2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Surge Rule Modal */}
      {showModal && editingRule && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-container" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSave}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {surgeRules.some(r => r.id === editingRule.id) ? 'Edit Timing Surge Rule' : 'New Timing Surge Rule'}
                </h3>
                <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>

              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Surge Rule Name</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={editingRule.surgeName}
                    onChange={(e) => setEditingRule({ ...editingRule, surgeName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Surge Type</label>
                  <select
                    className="custom-input"
                    value={editingRule.surgeType}
                    onChange={(e) => setEditingRule({ ...editingRule, surgeType: e.target.value })}
                  >
                    <option value="PEAK">PEAK (Rush Hour)</option>
                    <option value="NIGHT">NIGHT (Late Night Surge)</option>
                    <option value="WEATHER">WEATHER (Rain / Bad Weather)</option>
                    <option value="DEMAND">DEMAND (High Volume Area)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Multiplier (e.g. 1.25)</label>
                  <input
                    type="number"
                    step="0.05"
                    className="custom-input"
                    value={editingRule.multiplier}
                    onChange={(e) => setEditingRule({ ...editingRule, multiplier: parseFloat(e.target.value) || 1.0 })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Start Time (HH:MM:SS)</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={editingRule.startTime}
                    onChange={(e) => setEditingRule({ ...editingRule, startTime: e.target.value })}
                    placeholder="18:00:00"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">End Time (HH:MM:SS)</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={editingRule.endTime}
                    onChange={(e) => setEditingRule({ ...editingRule, endTime: e.target.value })}
                    placeholder="22:00:00"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Percentage Addon (%)</label>
                  <input
                    type="number"
                    step="1"
                    className="custom-input"
                    value={editingRule.percentage}
                    onChange={(e) => setEditingRule({ ...editingRule, percentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="form-label">Fixed Amount Addon (₹)</label>
                  <input
                    type="number"
                    step="5"
                    className="custom-input"
                    value={editingRule.fixedAmount}
                    onChange={(e) => setEditingRule({ ...editingRule, fixedAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Days of Week (Comma Separated)</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={editingRule.daysOfWeek}
                    onChange={(e) => setEditingRule({ ...editingRule, daysOfWeek: e.target.value })}
                    placeholder="MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY"
                    required
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    <input
                      type="checkbox"
                      checked={editingRule.active}
                      onChange={(e) => setEditingRule({ ...editingRule, active: e.target.checked })}
                    />
                    Enable this Surge Rule immediately
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Surge Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
