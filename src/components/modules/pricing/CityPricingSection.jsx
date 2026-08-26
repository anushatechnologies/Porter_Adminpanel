import React, { useContext } from 'react';
import { MapPin, Globe } from 'lucide-react';
import { AppStateContext } from '../../../context/AppState';

const CityPricingSection = ({ selectedCity, onCityChange, cityPricingData, currentVehicleName }) => {
  const { franchises, settings } = useContext(AppStateContext) || {};

  // Parse coverage cities dynamically from backend settings (e.g. "Hyderabad" or custom hubs)
  const backendConfiguredCities = (settings?.coverageCities || '')
    .split(',')
    .map(c => c.trim())
    .filter(Boolean)
    .map(c => ({
      id: c.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: c
    }));

  const franchiseCities = (Array.isArray(franchises) ? franchises : [])
    .map(f => ({
      id: (f.city || f.location || f.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: f.city || f.location || f.name
    }))
    .filter(c => c.id);

  // Merge unique operational cities from backend
  const cityMap = new Map();
  cityMap.set('all', { id: 'all', name: 'All Operational Cities (Default)' });
  
  if (backendConfiguredCities.length === 0 && franchiseCities.length === 0) {
    cityMap.set('hyderabad', { id: 'hyderabad', name: 'Hyderabad (Primary Hub)' });
  } else {
    backendConfiguredCities.forEach(c => cityMap.set(c.id, c));
    franchiseCities.forEach(c => cityMap.set(c.id, c));
  }

  const dynamicCities = Array.from(cityMap.values());

  return (
    <div style={{ marginTop: '24px', background: 'var(--bg-card)', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="var(--primary)" />
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
            City-wise Pricing Configuration
          </h4>
        </div>
      </div>

      <div className="pricing-field" style={{ maxWidth: '320px', marginBottom: '16px' }}>
        <label>
          <Globe size={14} /> Select City
        </label>
        <select
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
        >
          {dynamicCities.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCity !== 'all' && (
        <div className="city-pricing-grid">
          <div className="city-pricing-card">
            <h4>{dynamicCities.find(c => c.id === selectedCity)?.name || selectedCity} Override</h4>
            <div className="city-pricing-row">
              <span>Vehicle</span>
              <span>{currentVehicleName || 'Selected Vehicle'}</span>
            </div>
            <div className="city-pricing-row">
              <span>Base Fare</span>
              <span>₹{cityPricingData?.baseFare || '--'}</span>
            </div>
            <div className="city-pricing-row">
              <span>Per KM Rate</span>
              <span>₹{cityPricingData?.pricePerKm || '--'}</span>
            </div>
          </div>
          <div className="city-pricing-card" style={{ opacity: 0.75 }}>
            <h4>Default (All Cities)</h4>
            <div className="city-pricing-row">
              <span>Vehicle</span>
              <span>{currentVehicleName || 'Selected Vehicle'}</span>
            </div>
            <div className="city-pricing-row">
              <span>Base Fare</span>
              <span>₹{cityPricingData?.defaultBaseFare || '--'}</span>
            </div>
            <div className="city-pricing-row">
              <span>Per KM Rate</span>
              <span>₹{cityPricingData?.defaultPricePerKm || '--'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityPricingSection;
