import React, { useState, useEffect } from 'react';
import { Save, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import DistanceSlabSection from './DistanceSlabSection';
import CityPricingSection from './CityPricingSection';
import FarePreviewCard from './FarePreviewCard';

const PricingConfigForm = ({
  vehicle,
  onSave,
  onDelete,
  isSaving,
  isDirty,
  setIsDirty
}) => {
  const [formData, setFormData] = useState({
    name: '',
    baseFare: '40',
    freeDistance: '2',
    pricePerKm: '10',
    minFare: '40',
    maxFare: '2000',
    capacityKg: '750',
    maxDistance: '500',
    status: true,
    priority: '1',
    slabPricingEnabled: false,
    slabs: [
      { id: '1', fromKm: 0, toKm: 5, pricePerKm: 12 },
      { id: '2', fromKm: 5, toKm: 20, pricePerKm: 10 },
      { id: '3', fromKm: 20, toKm: 50, pricePerKm: 8 },
      { id: '4', fromKm: 50, toKm: null, pricePerKm: 7 }
    ]
  });

  const [selectedCity, setSelectedCity] = useState('all');
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync form data when active vehicle changes
  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name || '',
        baseFare: vehicle.baseFare !== undefined ? String(vehicle.baseFare) : '40',
        freeDistance: vehicle.freeDistance !== undefined ? String(vehicle.freeDistance) : '2',
        pricePerKm: vehicle.pricePerKm !== undefined ? String(vehicle.pricePerKm) : '10',
        minFare: vehicle.minFare !== undefined ? String(vehicle.minFare) : '40',
        maxFare: vehicle.maxFare !== undefined ? String(vehicle.maxFare) : '2000',
        capacityKg: vehicle.capacityKg !== undefined ? String(vehicle.capacityKg) : '750',
        maxDistance: vehicle.maxDistance !== undefined ? String(vehicle.maxDistance) : '500',
        status: vehicle.status !== undefined ? Boolean(vehicle.status) : true,
        priority: vehicle.priority !== undefined ? String(vehicle.priority) : '1',
        slabPricingEnabled: Boolean(vehicle.slabPricingEnabled),
        slabs: Array.isArray(vehicle.slabs) ? vehicle.slabs : []
      });
      setErrors({});
      setIsDirty(false);
    }
  }, [vehicle, setIsDirty]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Clear field error on edit
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const baseFare = parseFloat(formData.baseFare);
    if (isNaN(baseFare) || baseFare < 0) {
      newErrors.baseFare = 'Base Fare must be ≥ 0';
    }

    const freeDistance = parseFloat(formData.freeDistance);
    if (isNaN(freeDistance) || freeDistance < 0) {
      newErrors.freeDistance = 'Free Distance must be ≥ 0';
    }

    const pricePerKm = parseFloat(formData.pricePerKm);
    if (isNaN(pricePerKm) || pricePerKm <= 0) {
      newErrors.pricePerKm = 'Price Per KM must be > 0';
    }

    const minFare = parseFloat(formData.minFare);
    const maxFare = parseFloat(formData.maxFare);
    if (!isNaN(minFare) && !isNaN(maxFare) && maxFare < minFare) {
      newErrors.maxFare = 'Maximum Fare must be ≥ Minimum Fare';
    }

    const maxDistance = parseFloat(formData.maxDistance);
    if (!isNaN(freeDistance) && !isNaN(maxDistance) && maxDistance <= freeDistance) {
      newErrors.maxDistance = 'Maximum Distance must be > Free Distance';
    }

    const capacityKg = parseFloat(formData.capacityKg);
    if (isNaN(capacityKg) || capacityKg <= 0) {
      newErrors.capacityKg = 'Maximum Weight must be > 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const vId = vehicle.vehicleId || (formData.name || 'vehicle').toLowerCase().replace(/[^a-z0-9]/g, '-');
    onSave({
      ...vehicle,
      vehicleId: vId,
      name: formData.name,
      icon: vehicle.icon || 'truck',
      capacityKg: parseFloat(formData.capacityKg),
      volume: parseFloat(vehicle.volume || 4.5),
      minDistance: parseFloat(formData.freeDistance),
      freeDistance: parseFloat(formData.freeDistance),
      maxDistance: parseFloat(formData.maxDistance),
      baseFare: parseFloat(formData.baseFare),
      pricePerKm: parseFloat(formData.pricePerKm),
      minFare: parseFloat(formData.minFare),
      maxFare: parseFloat(formData.maxFare),
      status: formData.status,
      priority: parseInt(formData.priority) || 1,
      commissionPercentage: parseFloat(vehicle.commissionPercentage || 10),
      slabPricingEnabled: formData.slabPricingEnabled,
      slabs: formData.slabs
    });
  };

  if (!vehicle) {
    return (
      <div className="pricing-empty-state">
        <div className="empty-icon">
          <ShieldAlert size={36} />
        </div>
        <h3>No Vehicle Selected</h3>
        <p>Please select a vehicle from the list on the left to view and configure its pricing strategy.</p>
      </div>
    );
  }

  return (
    <div className="pricing-right-panel">
      <form onSubmit={handleSubmit}>
        {/* Main Config Card */}
        <div className="pricing-config-card">
          <div className="pricing-config-header">
            <h3>
              <span>{vehicle.name}</span>
              <span className={`badge ${formData.status ? 'badge-completed' : 'badge-cancelled'}`}>
                {formData.status ? 'Active' : 'Inactive'}
              </span>
            </h3>
            {vehicle.id && (
              <button
                type="button"
                className="btn"
                style={{ color: '#EF4444', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', padding: '6px 12px', fontSize: '13px' }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={15} /> Delete Vehicle Pricing
              </button>
            )}
          </div>

          <div className="pricing-config-body">
            <div className="pricing-form-grid">
              <div className="pricing-field">
                <label htmlFor="vehicle-name">Vehicle Name</label>
                <input
                  id="vehicle-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Bike, Tata Ace"
                />
              </div>

              <div className="pricing-field">
                <label htmlFor="base-fare">
                  Base Fare <span className="field-unit">(₹)</span>
                </label>
                <input
                  id="base-fare"
                  type="number"
                  step="0.01"
                  required
                  value={formData.baseFare}
                  onChange={(e) => handleChange('baseFare', e.target.value)}
                  className={errors.baseFare ? 'field-error' : ''}
                />
                {errors.baseFare && <span className="field-error-text">{errors.baseFare}</span>}
              </div>

              <div className="pricing-field">
                <label htmlFor="free-distance">
                  Free Distance <span className="field-unit">(KM)</span>
                </label>
                <input
                  id="free-distance"
                  type="number"
                  step="0.1"
                  required
                  value={formData.freeDistance}
                  onChange={(e) => handleChange('freeDistance', e.target.value)}
                  className={errors.freeDistance ? 'field-error' : ''}
                />
                {errors.freeDistance && <span className="field-error-text">{errors.freeDistance}</span>}
              </div>

              <div className="pricing-field">
                <label htmlFor="price-per-km">
                  Price Per KM <span className="field-unit">(₹)</span>
                </label>
                <input
                  id="price-per-km"
                  type="number"
                  step="0.01"
                  required
                  value={formData.pricePerKm}
                  onChange={(e) => handleChange('pricePerKm', e.target.value)}
                  className={errors.pricePerKm ? 'field-error' : ''}
                />
                {errors.pricePerKm && <span className="field-error-text">{errors.pricePerKm}</span>}
              </div>

              <div className="pricing-field">
                <label htmlFor="min-fare">Minimum Fare (₹)</label>
                <input
                  id="min-fare"
                  type="number"
                  step="0.01"
                  value={formData.minFare}
                  onChange={(e) => handleChange('minFare', e.target.value)}
                />
              </div>

              <div className="pricing-field">
                <label htmlFor="max-fare">Maximum Fare (₹)</label>
                <input
                  id="max-fare"
                  type="number"
                  step="0.01"
                  value={formData.maxFare}
                  onChange={(e) => handleChange('maxFare', e.target.value)}
                  className={errors.maxFare ? 'field-error' : ''}
                />
                {errors.maxFare && <span className="field-error-text">{errors.maxFare}</span>}
              </div>

              <div className="pricing-field">
                <label htmlFor="max-weight">
                  Maximum Weight <span className="field-unit">(KG)</span>
                </label>
                <input
                  id="max-weight"
                  type="number"
                  step="1"
                  required
                  value={formData.capacityKg}
                  onChange={(e) => handleChange('capacityKg', e.target.value)}
                  className={errors.capacityKg ? 'field-error' : ''}
                />
                {errors.capacityKg && <span className="field-error-text">{errors.capacityKg}</span>}
              </div>

              <div className="pricing-field">
                <label htmlFor="max-distance">
                  Maximum Distance <span className="field-unit">(KM)</span>
                </label>
                <input
                  id="max-distance"
                  type="number"
                  step="1"
                  required
                  value={formData.maxDistance}
                  onChange={(e) => handleChange('maxDistance', e.target.value)}
                  className={errors.maxDistance ? 'field-error' : ''}
                />
                {errors.maxDistance && <span className="field-error-text">{errors.maxDistance}</span>}
              </div>

              <div className="pricing-field">
                <label htmlFor="priority">Priority Order</label>
                <input
                  id="priority"
                  type="number"
                  min="1"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                />
              </div>

              <div className="pricing-field">
                <label>Vehicle Status</label>
                <div className="status-toggle" style={{ marginTop: '6px' }}>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.status}
                      onChange={(e) => handleChange('status', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span className={`status-toggle-label ${formData.status ? 'active-label' : ''}`}>
                    {formData.status ? 'Active in Dispatch' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Distance Slab Section */}
            <DistanceSlabSection
              enabled={formData.slabPricingEnabled}
              onToggleEnabled={(enabled) => handleChange('slabPricingEnabled', enabled)}
              slabs={formData.slabs}
              onSlabsChange={(slabs) => handleChange('slabs', slabs)}
            />

            {/* City Pricing Section */}
            <CityPricingSection
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              currentVehicleName={formData.name}
              cityPricingData={{
                baseFare: selectedCity === 'hyderabad' ? '40' : selectedCity === 'bangalore' ? '50' : formData.baseFare,
                pricePerKm: selectedCity === 'hyderabad' ? '10' : selectedCity === 'bangalore' ? '12' : formData.pricePerKm,
                defaultBaseFare: formData.baseFare,
                defaultPricePerKm: formData.pricePerKm
              }}
            />
          </div>
        </div>

        {/* Live Fare Preview Card */}
        <FarePreviewCard
          baseFare={formData.baseFare}
          freeDistance={formData.freeDistance}
          pricePerKm={formData.pricePerKm}
          minFare={formData.minFare}
          maxFare={formData.maxFare}
          slabPricingEnabled={formData.slabPricingEnabled}
          slabs={formData.slabs}
          vehicleId={vehicle.vehicleId || vehicle.id}
        />

        {/* Save Bar */}
        <div className="pricing-save-bar" style={{ marginTop: '24px' }}>
          <div>
            {isDirty ? (
              <div className="unsaved-indicator">
                <span className="unsaved-dot" />
                Unsaved changes
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--status-completed)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                <CheckCircle2 size={16} /> All changes saved
              </div>
            )}
          </div>

          <div className="save-actions">
            {isDirty && (
              <button
                type="button"
                className="btn-discard"
                onClick={() => {
                  setFormData({
                    name: vehicle.name || '',
                    baseFare: vehicle.baseFare !== undefined ? String(vehicle.baseFare) : '40',
                    freeDistance: vehicle.freeDistance !== undefined ? String(vehicle.freeDistance) : '2',
                    pricePerKm: vehicle.pricePerKm !== undefined ? String(vehicle.pricePerKm) : '10',
                    minFare: vehicle.minFare !== undefined ? String(vehicle.minFare) : '40',
                    maxFare: vehicle.maxFare !== undefined ? String(vehicle.maxFare) : '2000',
                    capacityKg: vehicle.capacityKg !== undefined ? String(vehicle.capacityKg) : '750',
                    maxDistance: vehicle.maxDistance !== undefined ? String(vehicle.maxDistance) : '500',
                    status: vehicle.status !== undefined ? Boolean(vehicle.status) : true,
                    priority: vehicle.priority !== undefined ? String(vehicle.priority) : '1',
                    slabPricingEnabled: Boolean(vehicle.slabPricingEnabled),
                    slabs: Array.isArray(vehicle.slabs) ? vehicle.slabs : []
                  });
                  setIsDirty(false);
                  setErrors({});
                }}
              >
                Discard Changes
              </button>
            )}

            <button
              type="submit"
              className="btn-save-pricing"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner" /> Saving Pricing...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Pricing Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Modal for Delete */}
      {showDeleteConfirm && (
        <div className="confirm-modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Vehicle Pricing</h3>
            <p>Are you sure you want to delete pricing for <strong>{vehicle.name}</strong>? This action will remove all associated distance slabs and city overrides.</p>
            <div className="confirm-modal-actions">
              <button
                className="btn-discard"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save-pricing"
                style={{ background: '#EF4444' }}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(vehicle.id || vehicle.vehicleId);
                }}
              >
                Delete Pricing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingConfigForm;
