import React from 'react';
import { Search, Truck, Plus } from 'lucide-react';

const VEHICLE_ICONS = {
  'bike': '🚲',
  'scooter': '🛵',
  'tata-ace': '🚚',
  'pickup-8ft': '🚛',
  'pickup-14ft': '🚛',
  'mini-truck': '🚛',
  'three-wheeler': '🛺',
  'ev-bike': '⚡',
};

const VehicleSelector = ({ vehicles, selectedId, onSelect, loading, searchQuery, onSearchChange, onAddVehicle }) => {

  const filteredVehicles = vehicles.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.vehicleId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Skeleton loader
  const renderSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton-vehicle-card">
          <div className="skeleton skeleton-circle" />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line tiny" />
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="vehicle-selector">
      <div className="vehicle-selector-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} color="var(--primary)" />
          Vehicles
        </h3>
        <button
          type="button"
          onClick={onAddVehicle}
          className="btn btn-primary"
          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          title="Add new vehicle model pricing"
        >
          <Plus size={14} /> Add Vehicle
        </button>
      </div>

      <div className="vehicle-selector-search">
        <input
          type="text"
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="vehicle-selector-list">
        {loading ? renderSkeleton() : (
          filteredVehicles.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No vehicles found
            </div>
          ) : (
            filteredVehicles.map(vehicle => (
              <div
                key={vehicle.id || vehicle.vehicleId}
                className={`vehicle-card ${selectedId === (vehicle.id || vehicle.vehicleId) ? 'active' : ''}`}
                onClick={() => onSelect(vehicle)}
              >
                <div className="vehicle-card-icon">
                  {vehicle.imageUrl ? (
                    <img
                      src={vehicle.imageUrl}
                      alt={vehicle.name}
                      style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                    />
                  ) : (
                    VEHICLE_ICONS[vehicle.vehicleId] || '🚛'
                  )}
                </div>
                <div className="vehicle-card-info">
                  <div className="vehicle-card-name">{vehicle.name}</div>
                  <div className="vehicle-card-meta">
                    {vehicle.capacityKg ? `${vehicle.capacityKg} KG` : vehicle.vehicleId}
                  </div>
                </div>
                <div className={`vehicle-card-status ${vehicle.status ? 'active' : 'inactive'}`} />
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default VehicleSelector;
