import React, { useState, useEffect } from 'react';
import { Calculator, Zap } from 'lucide-react';

const FarePreviewCard = ({
  baseFare,
  freeDistance,
  pricePerKm,
  minFare,
  maxFare,
  slabPricingEnabled,
  slabs,
  vehicleId
}) => {
  const [distanceKm, setDistanceKm] = useState(18);
  const [backendPreview, setBackendPreview] = useState(null);
  const [loadingBackend, setLoadingBackend] = useState(false);

  // If slab pricing is enabled, request preview from backend
  useEffect(() => {
    if (!slabPricingEnabled) return;

    let isMounted = true;
    const fetchBackendPreview = async () => {
      setLoadingBackend(true);
      try {
        const token = localStorage.getItem('porter_admin_token');
        const res = await fetch('/api/pricing/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            vehicleId,
            distanceKm,
            baseFare: parseFloat(baseFare) || 0,
            freeDistance: parseFloat(freeDistance) || 0,
            pricePerKm: parseFloat(pricePerKm) || 0,
            slabs: slabPricingEnabled ? slabs : []
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setBackendPreview(data);
        }
      } catch (err) {
        console.error('Backend preview failed, fallback to local', err);
      } finally {
        if (isMounted) setLoadingBackend(false);
      }
    };

    const timeout = setTimeout(fetchBackendPreview, 300);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [distanceKm, slabPricingEnabled, slabs, baseFare, freeDistance, pricePerKm, vehicleId]);

  // Local calculation when slab pricing is disabled
  const calculateLocalFare = () => {
    const base = parseFloat(baseFare) || 0;
    const free = parseFloat(freeDistance) || 0;
    const perKm = parseFloat(pricePerKm) || 0;
    const minimum = parseFloat(minFare) || 0;
    const maximum = parseFloat(maxFare) || 0;
    const dist = parseFloat(distanceKm) || 0;

    const chargeableDist = Math.max(0, dist - free);
    const distCharge = chargeableDist * perKm;
    let rawTotal = base + distCharge;

    let finalFare = rawTotal;
    if (minimum > 0 && finalFare < minimum) finalFare = minimum;
    if (maximum > 0 && finalFare > maximum) finalFare = maximum;

    return {
      baseFare: base,
      freeDistance: free,
      chargeableDistance: chargeableDist,
      pricePerKm: perKm,
      distanceCharge: distCharge,
      estimatedFare: finalFare
    };
  };

  const localCalc = calculateLocalFare();

  const previewData = slabPricingEnabled && backendPreview ? {
    baseFare: backendPreview.baseFare ?? localCalc.baseFare,
    freeDistance: backendPreview.freeDistance ?? localCalc.freeDistance,
    chargeableDistance: backendPreview.chargeableDistance ?? localCalc.chargeableDistance,
    pricePerKm: backendPreview.pricePerKm ?? localCalc.pricePerKm,
    distanceCharge: backendPreview.distanceCharge ?? localCalc.distanceCharge,
    estimatedFare: backendPreview.estimatedFare ?? localCalc.estimatedFare
  } : localCalc;

  return (
    <div className="fare-preview-card" style={{ marginTop: '24px' }}>
      <div className="fare-preview-header">
        <h3>
          <Calculator size={20} color="#10B981" />
          Live Fare Calculator Preview
        </h3>
        {slabPricingEnabled && (
          <span style={{ fontSize: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={12} /> Slab Pricing Enabled (Backend Sync)
          </span>
        )}
      </div>

      <div className="fare-preview-body">
        <div className="fare-preview-input">
          <label htmlFor="preview-distance">Enter Distance (KM)</label>
          <input
            id="preview-distance"
            type="number"
            min="0"
            step="0.5"
            value={distanceKm}
            onChange={(e) => setDistanceKm(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="18"
          />
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
            Change values in the form above to see the live calculated fare update automatically.
          </p>
        </div>

        <div className="fare-breakdown">
          <div className="fare-breakdown-row">
            <span className="fare-label">Base Fare</span>
            <span className="fare-value">₹{previewData.baseFare}</span>
          </div>
          <div className="fare-breakdown-row">
            <span className="fare-label">Free Distance</span>
            <span className="fare-value">{previewData.freeDistance} KM</span>
          </div>
          <div className="fare-breakdown-row">
            <span className="fare-label">Chargeable Distance</span>
            <span className="fare-value">{previewData.chargeableDistance} KM</span>
          </div>
          <div className="fare-breakdown-row">
            <span className="fare-label">Per KM Rate</span>
            <span className="fare-value">₹{previewData.pricePerKm}</span>
          </div>
          <div className="fare-breakdown-row">
            <span className="fare-label">Distance Charge</span>
            <span className="fare-value">₹{previewData.distanceCharge}</span>
          </div>
          <div className="fare-breakdown-total">
            <span className="fare-label">Estimated Fare</span>
            <span className="fare-value">
              {loadingBackend ? 'Calculating...' : `₹${previewData.estimatedFare}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarePreviewCard;
