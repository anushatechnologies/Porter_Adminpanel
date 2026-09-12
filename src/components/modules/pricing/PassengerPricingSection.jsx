import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Save, X, Car, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useToast } from './ToastNotification';

export default function PassengerPricingSection() {
  const { addToast } = useToast();
  const [pricingRules, setPricingRules] = useState([]);
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
    serviceCode: 'ONE_WAY',
    vehicleCategoryCode: 'CAB_SEDAN',
    baseFare: 120.0,
    minimumFare: 150.0,
    minimumKm: 2.0,
    perKmRate: 16.5,
    perMinuteRate: 2.0,
    driverAllowance: 50.0,
    freeWaitingMinutes: 15,
    waitingChargePerHour: 150.0,
    nightStartHour: 23,
    nightEndHour: 5,
    nightChargeFixed: 150.0,
    nightChargePercentage: 10.0
  };

  const initialPresets = [
    {
      id: 'pp-1',
      serviceCode: 'ONE_WAY',
      vehicleCategoryCode: 'CAB_SEDAN',
      baseFare: 120.0,
      minimumFare: 150.0,
      minimumKm: 2.0,
      perKmRate: 16.5,
      perMinuteRate: 2.0,
      driverAllowance: 50.0,
      freeWaitingMinutes: 15,
      waitingChargePerHour: 150.0,
      nightStartHour: 23,
      nightEndHour: 5,
      nightChargeFixed: 150.0,
      nightChargePercentage: 10.0
    },
    {
      id: 'pp-2',
      serviceCode: 'ONE_WAY',
      vehicleCategoryCode: 'CAB_HATCHBACK',
      baseFare: 90.0,
      minimumFare: 120.0,
      minimumKm: 2.0,
      perKmRate: 13.5,
      perMinuteRate: 1.5,
      driverAllowance: 40.0,
      freeWaitingMinutes: 15,
      waitingChargePerHour: 120.0,
      nightStartHour: 23,
      nightEndHour: 5,
      nightChargeFixed: 100.0,
      nightChargePercentage: 10.0
    },
    {
      id: 'pp-3',
      serviceCode: 'ONE_WAY',
      vehicleCategoryCode: 'CAB_SUV',
      baseFare: 160.0,
      minimumFare: 200.0,
      minimumKm: 3.0,
      perKmRate: 21.0,
      perMinuteRate: 2.5,
      driverAllowance: 80.0,
      freeWaitingMinutes: 20,
      waitingChargePerHour: 200.0,
      nightStartHour: 23,
      nightEndHour: 5,
      nightChargeFixed: 200.0,
      nightChargePercentage: 15.0
    }
  ];

  const fetchPricingRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/passenger/pricing', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.pricingRules || data.rules || []);
        if (list.length > 0) {
          setPricingRules(list);
          return;
        }
      }
      setPricingRules(initialPresets);
    } catch (e) {
      console.warn('Could not fetch /api/admin/passenger/pricing, loading initial presets:', e);
      setPricingRules(initialPresets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingRules();
  }, []);

  const handleOpenAdd = () => {
    setEditingRule({ ...defaultRule, id: `pp-${Date.now()}` });
    setShowModal(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule({ ...rule });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingRule) return;

    setIsSaving(true);
    const isEdit = pricingRules.some(r => r.id === editingRule.id);
    const endpoint = isEdit ? `/api/admin/passenger/pricing/${editingRule.id}` : '/api/admin/passenger/pricing';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(editingRule)
      });

      if (res.ok) {
        const saved = await res.json();
        addToast(`Pricing rule for ${editingRule.vehicleCategoryCode} saved successfully!`, 'success');
        setPricingRules(prev => {
          if (isEdit) {
            return prev.map(r => r.id === editingRule.id ? (saved.id ? saved : editingRule) : r);
          } else {
            return [saved.id ? saved : editingRule, ...prev];
          }
        });
        setShowModal(false);
      } else {
        // Fallback save in memory
        setPricingRules(prev => {
          if (isEdit) {
            return prev.map(r => r.id === editingRule.id ? editingRule : r);
          } else {
            return [editingRule, ...prev];
          }
        });
        addToast(`Pricing rule for ${editingRule.vehicleCategoryCode} saved locally.`, 'info');
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error saving pricing rule:', err);
      // Fallback
      setPricingRules(prev => {
        if (isEdit) {
          return prev.map(r => r.id === editingRule.id ? editingRule : r);
        } else {
          return [editingRule, ...prev];
        }
      });
      addToast('Saved rule in local state (Network fallback).', 'info');
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
            <Car size={20} color="var(--primary)" />
            Passenger Cab Fare & Rate Rules
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Manage base fares, minimum fares, per-KM rates, per-minute charges, and night surge windows (GET/POST/PUT <code>/api/admin/passenger/pricing</code>).
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={handleOpenAdd}
        >
          <Plus size={16} /> Add Pricing Rule
        </button>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Vehicle Category</th>
              <th>Service Code</th>
              <th>Base Fare</th>
              <th>Min Fare</th>
              <th>Rate / KM</th>
              <th>Rate / Min</th>
              <th>Night Window</th>
              <th>Night Charge</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pricingRules.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No passenger pricing rules defined. Click "Add Pricing Rule" to configure one.
                </td>
              </tr>
            ) : (
              pricingRules.map(rule => (
                <tr key={rule.id || rule.vehicleCategoryCode}>
                  <td style={{ fontWeight: '700' }}>
                    <span className="badge" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                      {rule.vehicleCategoryCode}
                    </span>
                  </td>
                  <td><code>{rule.serviceCode}</code></td>
                  <td style={{ fontWeight: '600' }}>₹{rule.baseFare} ({rule.minimumKm} km)</td>
                  <td style={{ fontWeight: '600', color: '#15803D' }}>₹{rule.minimumFare}</td>
                  <td>₹{rule.perKmRate} / km</td>
                  <td>₹{rule.perMinuteRate} / min</td>
                  <td>
                    <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color="var(--text-muted)" />
                      {rule.nightStartHour}:00 - {rule.nightEndHour}:00
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>
                      +₹{rule.nightChargeFixed} ({rule.nightChargePercentage}%)
                    </span>
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

      {/* Add / Edit Pricing Rule Modal */}
      {showModal && editingRule && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSave}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {pricingRules.some(r => r.id === editingRule.id) ? 'Edit Passenger Pricing Rule' : 'New Passenger Pricing Rule'}
                </h3>
                <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>

              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="form-label">Service Code</label>
                  <select
                    className="custom-input"
                    value={editingRule.serviceCode}
                    onChange={(e) => setEditingRule({ ...editingRule, serviceCode: e.target.value })}
                  >
                    <option value="ONE_WAY">ONE_WAY</option>
                    <option value="ROUND_TRIP">ROUND_TRIP</option>
                    <option value="RENTAL">RENTAL</option>
                    <option value="OUTSTATION">OUTSTATION</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Vehicle Category Code</label>
                  <select
                    className="custom-input"
                    value={editingRule.vehicleCategoryCode}
                    onChange={(e) => setEditingRule({ ...editingRule, vehicleCategoryCode: e.target.value })}
                  >
                    <option value="CAB_SEDAN">CAB_SEDAN (Sedan Cab)</option>
                    <option value="CAB_HATCHBACK">CAB_HATCHBACK (Mini / Hatchback)</option>
                    <option value="CAB_SUV">CAB_SUV (SUV 6-Seater)</option>
                    <option value="CAB_PREMIUM">CAB_PREMIUM (Prime / Exec)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Base Fare (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="custom-input"
                    value={editingRule.baseFare}
                    onChange={(e) => setEditingRule({ ...editingRule, baseFare: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Minimum Fare Floor (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="custom-input"
                    value={editingRule.minimumFare}
                    onChange={(e) => setEditingRule({ ...editingRule, minimumFare: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Minimum Distance (KM)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="custom-input"
                    value={editingRule.minimumKm}
                    onChange={(e) => setEditingRule({ ...editingRule, minimumKm: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Per-KM Rate (₹ / km)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="custom-input"
                    value={editingRule.perKmRate}
                    onChange={(e) => setEditingRule({ ...editingRule, perKmRate: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Per-Minute Rate (₹ / min)</label>
                  <input
                    type="number"
                    step="0.25"
                    className="custom-input"
                    value={editingRule.perMinuteRate}
                    onChange={(e) => setEditingRule({ ...editingRule, perMinuteRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="form-label">Driver Allowance (₹)</label>
                  <input
                    type="number"
                    step="5"
                    className="custom-input"
                    value={editingRule.driverAllowance}
                    onChange={(e) => setEditingRule({ ...editingRule, driverAllowance: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="form-label">Free Waiting (Minutes)</label>
                  <input
                    type="number"
                    className="custom-input"
                    value={editingRule.freeWaitingMinutes}
                    onChange={(e) => setEditingRule({ ...editingRule, freeWaitingMinutes: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="form-label">Waiting Charge (₹ / Hour)</label>
                  <input
                    type="number"
                    step="10"
                    className="custom-input"
                    value={editingRule.waitingChargePerHour}
                    onChange={(e) => setEditingRule({ ...editingRule, waitingChargePerHour: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="form-label">Night Window Hours (Start - End)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      placeholder="Start (23)"
                      className="custom-input"
                      value={editingRule.nightStartHour}
                      onChange={(e) => setEditingRule({ ...editingRule, nightStartHour: parseInt(e.target.value) || 0 })}
                    />
                    <input
                      type="number"
                      min="0"
                      max="23"
                      placeholder="End (5)"
                      className="custom-input"
                      value={editingRule.nightEndHour}
                      onChange={(e) => setEditingRule({ ...editingRule, nightEndHour: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Night Fixed / % Surcharge</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      placeholder="Fixed (₹)"
                      className="custom-input"
                      value={editingRule.nightChargeFixed}
                      onChange={(e) => setEditingRule({ ...editingRule, nightChargeFixed: parseFloat(e.target.value) || 0 })}
                    />
                    <input
                      type="number"
                      placeholder="Percentage (%)"
                      className="custom-input"
                      value={editingRule.nightChargePercentage}
                      onChange={(e) => setEditingRule({ ...editingRule, nightChargePercentage: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Pricing Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
