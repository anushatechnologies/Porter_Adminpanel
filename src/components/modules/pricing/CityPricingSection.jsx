import React from 'react';
import { MapPin, Globe } from 'lucide-react';

const CITIES = [
  { id: 'all', name: 'All Cities (Default)' },
  { id: 'hyderabad', name: 'Hyderabad' },
  { id: 'bangalore', name: 'Bangalore' },
  { id: 'mumbai', name: 'Mumbai' },
  { id: 'delhi', name: 'Delhi NCR' },
  { id: 'chennai', name: 'Chennai' },
  { id: 'kolkata', name: 'Kolkata' },
  { id: 'pune', name: 'Pune' }
];

const CityPricingSection = ({ selectedCity, onCityChange, cityPricingData, currentVehicleName }) => {
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
          {CITIES.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCity !== 'all' && (
        <div className="city-pricing-grid">
          <div className="city-pricing-card">
            <h4>{CITIES.find(c => c.id === selectedCity)?.name} Override</h4>
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
