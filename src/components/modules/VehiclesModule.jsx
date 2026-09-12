import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Car, Truck, Eye, ShieldAlert, Award, FileText, CheckCircle2, 
  Search, Trash2, Plus, Edit2, Layers, X, Upload, Image as ImageIcon, 
  RefreshCw, Check, AlertCircle
} from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function VehiclesModule() {
  const { drivers, vehicles: initialVehicles, deleteVehicle, authFetch, uploadDocumentFile } = useContext(AppStateContext);

  // Top Module View: 'fleet_categories' (Flow 2) | 'registered_vehicles' (Driver RC)
  const [mainTab, setMainTab] = useState('fleet_categories');

  // Fleet Filter: 'ALL' | 'OUR_SERVICES' | 'PASSENGER'
  const [fleetFilter, setFleetFilter] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Registered vehicles tab state
  const [activeTab, setActiveTab] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Vehicle Categories State (Flow 2)
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [isSavingType, setIsSavingType] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const initialPresets = [
    {
      id: 'veh_2wheeler',
      name: '2 Wheeler',
      type: 'two_wheeler',
      serviceType: 'BOTH',
      serviceCategory: 'Both Services',
      supportedServiceTypes: ['GOODS', 'PASSENGER', 'OUR_SERVICES'],
      description: 'Best for goods delivery & 1-passenger bike taxi',
      capacity: 'Load: Up to 20kg',
      capacityKg: 20,
      dimensions: '1.8m x 0.7m x 1.1m',
      imageUrl: 'https://poteranusha.s3.ap-south-2.amazonaws.com/vehicles/2wheeler.png',
      iconName: 'bike',
      baseFare: 40.0,
      baseKm: 1.0,
      perKmRate: 12.0,
      status: 'active',
      priority: 1
    },
    {
      id: 'veh_bike_taxi',
      name: 'Bike Taxi',
      type: 'two_wheeler',
      serviceType: 'PASSENGER',
      serviceCategory: 'Passenger Rides',
      supportedServiceTypes: ['PASSENGER'],
      description: 'Fastest single passenger ride across high traffic zones',
      capacity: '1 Passenger',
      capacityKg: 80,
      dimensions: '1.8m x 0.7m x 1.1m',
      imageUrl: 'https://poteranusha.s3.ap-south-2.amazonaws.com/vehicles/bike_taxi.png',
      iconName: 'bike',
      baseFare: 30.0,
      baseKm: 1.0,
      perKmRate: 10.0,
      status: 'active',
      priority: 2
    },
    {
      id: 'veh_auto_taxi',
      name: 'Auto Taxi',
      type: 'three_wheeler',
      serviceType: 'PASSENGER',
      serviceCategory: 'Passenger Rides',
      supportedServiceTypes: ['PASSENGER'],
      description: 'Budget-friendly 3-seater auto rickshaw ride',
      capacity: '3 Passengers',
      capacityKg: 250,
      dimensions: '2.6m x 1.3m x 1.7m',
      imageUrl: 'https://poteranusha.s3.ap-south-2.amazonaws.com/vehicles/auto.png',
      iconName: 'car',
      baseFare: 45.0,
      baseKm: 1.5,
      perKmRate: 14.0,
      status: 'active',
      priority: 3
    },
    {
      id: 'veh_cab_sedan',
      name: 'Cab (Economy Sedan)',
      type: 'cab',
      serviceType: 'PASSENGER',
      serviceCategory: 'Passenger Rides',
      supportedServiceTypes: ['PASSENGER'],
      description: 'Comfortable 4-seater AC sedan for city and outstation',
      capacity: '4 Passengers',
      capacityKg: 300,
      dimensions: '4.2m x 1.7m x 1.5m',
      imageUrl: 'https://poteranusha.s3.ap-south-2.amazonaws.com/vehicles/sedan_car.png',
      iconName: 'car',
      baseFare: 120.0,
      baseKm: 2.0,
      perKmRate: 16.5,
      status: 'active',
      priority: 4
    },
    {
      id: 'veh_cab_suv',
      name: 'Cab (SUV 6-Seater)',
      type: 'cab',
      serviceType: 'PASSENGER',
      serviceCategory: 'Passenger Rides',
      supportedServiceTypes: ['PASSENGER'],
      description: 'Spacious 6-7 passenger SUV with large luggage space',
      capacity: '6 Passengers',
      capacityKg: 450,
      dimensions: '4.8m x 1.8m x 1.8m',
      imageUrl: 'https://poteranusha.s3.ap-south-2.amazonaws.com/vehicles/suv.png',
      iconName: 'car',
      baseFare: 160.0,
      baseKm: 3.0,
      perKmRate: 21.0,
      status: 'active',
      priority: 5
    },
    {
      id: 'veh_tata_ace',
      name: 'Tata Ace',
      type: 'tata_ace',
      serviceType: 'OUR_SERVICES',
      serviceCategory: 'Our Services',
      supportedServiceTypes: ['GOODS', 'OUR_SERVICES'],
      description: 'Best for large boxes, home shifting, and business deliveries',
      capacity: 'Load: Up to 750kg',
      capacityKg: 750,
      dimensions: '2.2m x 1.5m x 1.5m',
      imageUrl: 'https://poteranusha.s3.ap-south-2.amazonaws.com/vehicles/tata_ace.png',
      iconName: 'truck',
      baseFare: 250.0,
      baseKm: 1.0,
      perKmRate: 30.0,
      status: 'active',
      priority: 6
    },
    {
      id: 'veh_pickup_8ft',
      name: '8ft Pickup (1200kg)',
      type: 'truck',
      serviceType: 'OUR_SERVICES',
      serviceCategory: 'Our Services',
      supportedServiceTypes: ['GOODS', 'OUR_SERVICES'],
      description: 'Heavy commercial pickup for machinery, timber, and shifting',
      capacity: 'Load: Up to 1200kg',
      capacityKg: 1200,
      dimensions: '2.5m x 1.6m x 1.6m',
      imageUrl: 'https://poteranusha.s3.ap-south-2.amazonaws.com/vehicles/pickup.png',
      iconName: 'truck',
      baseFare: 350.0,
      baseKm: 3.0,
      perKmRate: 28.0,
      status: 'active',
      priority: 7
    },
    {
      id: 'veh_tata_407',
      name: 'Tata 407 (Heavy)',
      type: 'tata_407',
      serviceType: 'OUR_SERVICES',
      serviceCategory: 'Our Services',
      supportedServiceTypes: ['GOODS', 'OUR_SERVICES'],
      description: 'Heavy commercial transport and complete house shifting',
      capacity: 'Load: Up to 2500kg',
      capacityKg: 2500,
      dimensions: '10ft x 6ft x 6ft',
      imageUrl: 'https://poteranusha.s3.ap-south-2.amazonaws.com/vehicles/truck.png',
      iconName: 'truck',
      baseFare: 600.0,
      baseKm: 1.0,
      perKmRate: 50.0,
      status: 'active',
      priority: 8
    }
  ];

  const defaultVehicleType = {
    id: `veh_custom_${Date.now().toString().slice(-4)}`,
    name: 'New Vehicle Category',
    type: 'truck',
    serviceType: 'OUR_SERVICES',
    description: 'Commercial logistics & goods transport vehicle',
    capacity: 'Load: Up to 1000kg',
    capacityKg: 1000,
    dimensions: '3.0m x 1.8m x 1.6m',
    imageUrl: 'https://poteranusha.s3.ap-south-2.amazonaws.com/vehicles/truck.png',
    iconName: 'truck',
    baseFare: 250.0,
    baseKm: 1.0,
    perKmRate: 25.0,
    status: 'active',
    priority: 5
  };

  // Connection 1: Fetching Vehicles Filtered by Service:
  // All -> GET /api/admin/vehicle-types
  // Our Services Fleet -> GET /api/admin/vehicle-types?serviceType=OUR_SERVICES
  // Passenger Fleet -> GET /api/admin/vehicle-types?serviceType=PASSENGER
  const fetchVehicleTypes = useCallback(async (filterMode = fleetFilter) => {
    setLoadingTypes(true);
    let url = '/api/admin/vehicle-types';
    if (filterMode === 'OUR_SERVICES') {
      url = '/api/admin/vehicle-types?serviceType=OUR_SERVICES';
    } else if (filterMode === 'PASSENGER') {
      url = '/api/admin/vehicle-types?serviceType=PASSENGER';
    }

    try {
      if (authFetch) {
        let res = await authFetch(url).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          let list = Array.isArray(data) ? data : (data.vehicles || data.vehicleTypes || data.items || []);
          if (list.length > 0) {
            setVehicleTypes(list);
            return;
          }
        }
      }

      // Local fallback presets filtered by serviceType
      let fallback = [...initialPresets];
      if (filterMode === 'OUR_SERVICES') {
        fallback = fallback.filter(t => t.serviceType === 'OUR_SERVICES' || t.serviceType === 'BOTH');
      } else if (filterMode === 'PASSENGER') {
        fallback = fallback.filter(t => t.serviceType === 'PASSENGER' || t.serviceType === 'BOTH');
      }
      setVehicleTypes(fallback);
    } catch (e) {
      console.warn('Could not load /api/admin/vehicle-types, loading defaults:', e);
      let fallback = [...initialPresets];
      if (filterMode === 'OUR_SERVICES') {
        fallback = fallback.filter(t => t.serviceType === 'OUR_SERVICES' || t.serviceType === 'BOTH');
      } else if (filterMode === 'PASSENGER') {
        fallback = fallback.filter(t => t.serviceType === 'PASSENGER' || t.serviceType === 'BOTH');
      }
      setVehicleTypes(fallback);
    } finally {
      setLoadingTypes(false);
    }
  }, [fleetFilter, authFetch]);

  useEffect(() => {
    fetchVehicleTypes(fleetFilter);
  }, [fleetFilter, fetchVehicleTypes]);

  const handleFleetFilterChange = (mode) => {
    setFleetFilter(mode);
    fetchVehicleTypes(mode);
  };

  const handleOpenAddType = () => {
    setEditingType({
      ...defaultVehicleType,
      id: `veh_${fleetFilter === 'PASSENGER' ? 'cab' : 'truck'}_${Date.now().toString().slice(-4)}`,
      serviceType: fleetFilter === 'PASSENGER' ? 'PASSENGER' : 'OUR_SERVICES',
      iconName: fleetFilter === 'PASSENGER' ? 'car' : 'truck',
      type: fleetFilter === 'PASSENGER' ? 'cab' : 'truck'
    });
    setShowTypeModal(true);
  };

  const handleOpenEditType = (type) => {
    setEditingType({ ...type });
    setShowTypeModal(true);
  };

  // Connection 3: Toggle Vehicle Active / Inactive Status:
  // PATCH /api/admin/vehicle-types/{id}/status
  // Body: { "status": "active" | "inactive" }
  const handleToggleStatus = async (type) => {
    const newStatus = type.status === 'active' ? 'inactive' : 'active';
    setVehicleTypes(prev => prev.map(t => t.id === type.id ? { ...t, status: newStatus } : t));

    if (authFetch) {
      try {
        await authFetch(`/api/admin/vehicle-types/${type.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (e) {
        console.warn('Status toggle error:', e);
      }
    }
  };

  const handleDeleteType = async (typeId) => {
    if (window.confirm(`Are you sure you want to deactivate vehicle category "${typeId}"?`)) {
      setVehicleTypes(prev => prev.filter(t => t.id !== typeId));
      if (authFetch) {
        try {
          await authFetch(`/api/admin/vehicle-types/${typeId}`, { method: 'DELETE' });
        } catch (e) {
          console.warn('Delete vehicle type error:', e);
        }
      }
    }
  };

  // Upload image to backend S3
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      if (uploadDocumentFile) {
        const res = await uploadDocumentFile(file);
        if (res && res.success && res.url) {
          setEditingType(prev => ({ ...prev, imageUrl: res.url }));
          setIsUploadingImage(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append('file', file);
      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res && res.ok) {
        const data = await res.json();
        if (data && (data.url || data.path)) {
          setEditingType(prev => ({ ...prev, imageUrl: data.url || data.path }));
          setIsUploadingImage(false);
          return;
        }
      }
    } catch (err) {
      console.warn('S3 upload warning, reading local file:', err);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingType(prev => ({ ...prev, imageUrl: reader.result }));
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // Connection 2: Admin Adds a New Vehicle Type:
  // POST /api/admin/vehicle-types
  // PUT /api/admin/vehicle-types/{id}
  const handleSaveType = async (e) => {
    e.preventDefault();
    if (!editingType) return;

    setIsSavingType(true);
    const isEdit = vehicleTypes.some(t => t.id === editingType.id);
    const endpoint = isEdit ? `/api/admin/vehicle-types/${editingType.id}` : '/api/admin/vehicle-types';
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      id: editingType.id,
      name: editingType.name,
      type: editingType.type || 'truck',
      serviceType: editingType.serviceType || 'OUR_SERVICES',
      serviceCategory: editingType.serviceType === 'PASSENGER' ? 'Passenger Rides' : editingType.serviceType === 'BOTH' ? 'Both Services' : 'Our Services',
      description: editingType.description || '',
      capacity: editingType.capacity || '',
      capacityKg: Number(editingType.capacityKg) || 0,
      dimensions: editingType.dimensions || '',
      iconName: editingType.iconName || (editingType.serviceType === 'PASSENGER' ? 'car' : 'truck'),
      imageUrl: editingType.imageUrl || '',
      baseFare: parseFloat(editingType.baseFare) || 0,
      baseKm: parseFloat(editingType.baseKm) || 1.0,
      perKmRate: parseFloat(editingType.perKmRate) || 0,
      status: editingType.status || 'active',
      priority: parseInt(editingType.priority) || 1
    };

    try {
      if (authFetch) {
        await authFetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setVehicleTypes(prev => {
        if (isEdit) {
          return prev.map(t => t.id === editingType.id ? payload : t);
        } else {
          return [payload, ...prev];
        }
      });
      setShowTypeModal(false);
    } catch (err) {
      console.error('Error saving vehicle type:', err);
      setVehicleTypes(prev => isEdit ? prev.map(t => t.id === editingType.id ? payload : t) : [payload, ...prev]);
      setShowTypeModal(false);
    } finally {
      setIsSavingType(false);
    }
  };

  // Map driver verification status to vehicle status
  const vehicles = initialVehicles.map(veh => {
    const ownerDriver = drivers.find(d => d.name === veh.owner);
    let status = 'Verified';
    if (ownerDriver) {
      if (ownerDriver.status === 'rejected') {
        status = 'Rejected';
      } else if (!ownerDriver.docs?.verified) {
        status = 'Pending Verification';
      }
    }
    return {
      ...veh,
      status
    };
  });

  const filteredVehicles = vehicles.filter(veh => {
    if (activeTab === 'pending' && veh.status !== 'Pending Verification') return false;

    const query = searchQuery.toLowerCase();
    return (
      String(veh.id || '').toLowerCase().includes(query) ||
      String(veh.model || '').toLowerCase().includes(query) ||
      String(veh.plate || '').toLowerCase().includes(query) ||
      String(veh.owner || '').toLowerCase().includes(query) ||
      String(veh.type || '').toLowerCase().includes(query)
    );
  });

  // Filter vehicle categories by search
  const displayedTypes = vehicleTypes.filter(t => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      String(t.name || '').toLowerCase().includes(q) ||
      String(t.id || '').toLowerCase().includes(q) ||
      String(t.description || '').toLowerCase().includes(q) ||
      String(t.type || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-fade">
      {/* Top Module Sub-Navigation */}
      <div className="tab-group" style={{ marginBottom: '18px', display: 'flex', gap: '8px' }}>
        <button
          type="button"
          className={`tab-btn ${mainTab === 'fleet_categories' ? 'active' : ''}`}
          onClick={() => setMainTab('fleet_categories')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: '700',
            borderBottom: mainTab === 'fleet_categories' ? '3px solid var(--primary)' : '3px solid transparent'
          }}
        >
          <Layers size={17} />
          <span>Vehicle Fleet Management ({vehicleTypes.length})</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${mainTab === 'registered_vehicles' ? 'active' : ''}`}
          onClick={() => setMainTab('registered_vehicles')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: '700',
            borderBottom: mainTab === 'registered_vehicles' ? '3px solid var(--primary)' : '3px solid transparent'
          }}
        >
          <Car size={17} />
          <span>Driver Vehicle Registrations ({vehicles.length})</span>
        </button>
      </div>

      {/* ─── 1. VEHICLE FLEET MANAGEMENT (FLOW 2) ─── */}
      {mainTab === 'fleet_categories' && (
        <div>
          {/* Header & Fleet Filter Controls */}
          <div 
            className="table-container"
            style={{ 
              marginBottom: '16px',
              padding: '16px 20px',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: '14px' 
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Filter Fleet Category:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Radio 1: All */}
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: fleetFilter === 'ALL' ? '700' : '500' }}>
                  <input
                    type="radio"
                    name="fleetFilterGroup"
                    checked={fleetFilter === 'ALL'}
                    onChange={() => handleFleetFilterChange('ALL')}
                    style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                  />
                  <span>All Vehicles</span>
                </label>

                {/* Radio 2: Our Services Fleet */}
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: fleetFilter === 'OUR_SERVICES' ? '700' : '500' }}>
                  <input
                    type="radio"
                    name="fleetFilterGroup"
                    checked={fleetFilter === 'OUR_SERVICES'}
                    onChange={() => handleFleetFilterChange('OUR_SERVICES')}
                    style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                  />
                  <span>Our Services Fleet (Goods / Trucks)</span>
                </label>

                {/* Radio 3: Passenger Fleet */}
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: fleetFilter === 'PASSENGER' ? '700' : '500' }}>
                  <input
                    type="radio"
                    name="fleetFilterGroup"
                    checked={fleetFilter === 'PASSENGER'}
                    onChange={() => handleFleetFilterChange('PASSENGER')}
                    style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                  />
                  <span>Passenger Fleet (Cabs / Bikes)</span>
                </label>
              </div>
            </div>

            {/* Right actions: Search + Add Vehicle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="search-input-wrapper" style={{ width: '220px' }}>
                <Search className="header-search-icon" size={14} />
                <input
                  type="text"
                  placeholder="Filter category..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="action-btn"
                onClick={() => fetchVehicleTypes(fleetFilter)}
                title="Refresh Fleet"
              >
                <RefreshCw size={15} className={loadingTypes ? 'animate-spin' : ''} />
              </button>

              <button
                type="button"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600' }}
                onClick={handleOpenAddType}
              >
                <Plus size={16} /> Add Vehicle
              </button>
            </div>
          </div>

          {/* CARDS / TABLE VIEW OF FLEET CATEGORIES */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vehicle Category</th>
                  <th>Service Fleet</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Base Fare (Min KM)</th>
                  <th>Per-KM Rate</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingTypes ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                      Loading vehicle fleet types...
                    </td>
                  </tr>
                ) : displayedTypes.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No vehicles found for selected fleet category.
                    </td>
                  </tr>
                ) : (
                  displayedTypes.map(t => {
                    const isOurServices = t.serviceType === 'OUR_SERVICES';
                    const isPassenger = t.serviceType === 'PASSENGER';
                    const isBoth = t.serviceType === 'BOTH';

                    return (
                      <tr key={t.id}>
                        {/* Vehicle Category & Image */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '8px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              overflow: 'hidden'
                            }}>
                              {t.imageUrl ? (
                                <img 
                                  src={t.imageUrl} 
                                  alt={t.name} 
                                  style={{ width: '36px', height: '36px', objectFit: 'contain' }} 
                                  onError={(e) => { e.target.style.display = 'none'; }} 
                                />
                              ) : isPassenger ? (
                                <Car size={22} color="#6366F1" />
                              ) : (
                                <Truck size={22} color="#059669" />
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '13px' }}>
                                {t.name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                {t.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Service Fleet Badge */}
                        <td>
                          {isBoth ? (
                            <span className="badge" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: '700', border: '1px solid #C7D2FE' }}>
                              • Both Services
                            </span>
                          ) : isPassenger ? (
                            <span className="badge" style={{ backgroundColor: '#FAF5FF', color: '#7E22CE', fontWeight: '700', border: '1px solid #E9D5FF' }}>
                              • Passenger Rides
                            </span>
                          ) : (
                            <span className="badge" style={{ backgroundColor: '#ECFDF5', color: '#047857', fontWeight: '700', border: '1px solid #A7F3D0' }}>
                              • Our Services
                            </span>
                          )}
                        </td>

                        {/* Type */}
                        <td>
                          <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#1E293B', fontWeight: '600' }}>
                            {t.type}
                          </span>
                        </td>

                        {/* Capacity */}
                        <td>
                          <div style={{ fontWeight: '600' }}>{t.capacity || 'N/A'}</div>
                          {t.capacityKg > 0 && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.capacityKg} kg</div>
                          )}
                        </td>

                        {/* Base Fare */}
                        <td style={{ fontWeight: '600' }}>
                          ₹{t.baseFare} <span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text-muted)' }}>({t.baseKm} km)</span>
                        </td>

                        {/* Per-KM Rate */}
                        <td style={{ fontWeight: '700', color: '#059669' }}>
                          ₹{t.perKmRate} / km
                        </td>

                        {/* Status Toggle Button */}
                        <td>
                          <button
                            type="button"
                            className={`badge ${t.status === 'active' ? 'badge-online' : 'badge-offline'}`}
                            style={{ cursor: 'pointer', border: 'none', padding: '4px 10px', fontSize: '11px' }}
                            onClick={() => handleToggleStatus(t)}
                            title="Click to toggle active status"
                          >
                            {t.status === 'active' ? '✓ Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div className="action-row" style={{ justifyContent: 'flex-end', display: 'flex', gap: '6px' }}>
                            <button
                              className="action-btn"
                              title="Edit Vehicle Category"
                              onClick={() => handleOpenEditType(t)}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="action-btn"
                              style={{ color: '#EF4444', backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}
                              title="Delete Vehicle Category"
                              onClick={() => handleDeleteType(t.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 2. DRIVER VEHICLE REGISTRATIONS TAB ─── */}
      {mainTab === 'registered_vehicles' && (
        <div>
          <div className="tab-group" style={{ marginBottom: '14px' }}>
            <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => { setActiveTab('all'); setSearchQuery(''); }}>All Vehicles ({vehicles.length})</button>
            <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => { setActiveTab('pending'); setSearchQuery(''); }}>Pending Verification ({vehicles.filter(v => v.status === 'Pending Verification').length})</button>
          </div>

          <div className="table-container">
            <div className="table-header-controls">
              <div className="search-input-wrapper">
                <Search className="header-search-icon" size={14} />
                <input
                  type="text"
                  placeholder="Search vehicles by model, plate, owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vehicle ID</th>
                  <th>Model</th>
                  <th>Type</th>
                  <th>License Plate</th>
                  <th>Owner Name</th>
                  <th>Trips Completed</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No registered vehicles found.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map(veh => (
                    <tr key={veh.id}>
                      <td style={{ fontWeight: '700' }}>{veh.id}</td>
                      <td style={{ fontWeight: '600' }}>{veh.model}</td>
                      <td>{veh.type}</td>
                      <td style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>{veh.plate}</td>
                      <td>{veh.owner}</td>
                      <td>{veh.trips}</td>
                      <td>{veh.capacity}</td>
                      <td>
                        <span className={`badge ${veh.status === 'Verified' ? 'badge-online' : veh.status === 'Rejected' ? 'badge-cancelled' : 'badge-pending'}`}>
                          {veh.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-row" style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button className="action-btn btn-view" onClick={() => setSelectedVehicle(veh)} title="View Documents">
                            <Eye size={16} />
                          </button>
                          <button
                            className="action-btn"
                            style={{ color: '#EF4444', backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}
                            title="Delete Vehicle"
                            onClick={() => deleteVehicle(veh.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── ADD / EDIT VEHICLE MODAL (FLOW 2) ─── */}
      {showTypeModal && editingType && (
        <div className="modal-backdrop" onClick={() => setShowTypeModal(false)}>
          <div className="modal-container" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveType}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {vehicleTypes.some(t => t.id === editingType.id) ? 'Edit Vehicle Category' : 'Add New Vehicle Category'}
                </h3>
                <button type="button" className="modal-close-btn" onClick={() => setShowTypeModal(false)}><X size={20} /></button>
              </div>

              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="form-label">Category Unique Code (ID) *</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={editingType.id}
                    onChange={(e) => setEditingType({ ...editingType, id: e.target.value })}
                    placeholder="veh_custom_407"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Display Name *</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={editingType.name}
                    onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                    placeholder="Tata 407 (Heavy)"
                    required
                  />
                </div>

                {/* Service Fleet Category */}
                <div>
                  <label className="form-label">Service Category *</label>
                  <select
                    className="custom-input"
                    value={editingType.serviceType}
                    onChange={(e) => setEditingType({ ...editingType, serviceType: e.target.value })}
                    required
                  >
                    <option value="OUR_SERVICES">Our Services (Goods, Freight, Trucks, Parcel)</option>
                    <option value="PASSENGER">Passenger Rides (Bike Taxi, Auto Taxi, Cabs)</option>
                    <option value="BOTH">Both Services (Multi-role)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Vehicle Type Tag *</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={editingType.type}
                    onChange={(e) => setEditingType({ ...editingType, type: e.target.value })}
                    placeholder="tata_407, truck, cab, two_wheeler"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Capacity Text</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={editingType.capacity}
                    onChange={(e) => setEditingType({ ...editingType, capacity: e.target.value })}
                    placeholder="Load: Up to 2500kg"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Capacity (in KG)</label>
                  <input
                    type="number"
                    className="custom-input"
                    value={editingType.capacityKg}
                    onChange={(e) => setEditingType({ ...editingType, capacityKg: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="form-label">Dimensions</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={editingType.dimensions}
                    onChange={(e) => setEditingType({ ...editingType, dimensions: e.target.value })}
                    placeholder="10ft x 6ft x 6ft"
                  />
                </div>

                <div>
                  <label className="form-label">Icon Name</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={editingType.iconName || 'truck'}
                    onChange={(e) => setEditingType({ ...editingType, iconName: e.target.value })}
                    placeholder="truck, car, bike"
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={editingType.description}
                    onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                    placeholder="Heavy commercial transport and home shifting"
                  />
                </div>

                {/* S3 Image Upload / URL Input */}
                <div style={{ gridColumn: 'span 2', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ImageIcon size={14} color="var(--primary)" /> Vehicle Image (AWS S3 Upload or Public URL)
                    </label>
                    <label
                      htmlFor="vehicle-file-input"
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '3px 10px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <Upload size={12} /> {isUploadingImage ? 'Uploading...' : 'Upload Image File'}
                    </label>
                    <input
                      type="file"
                      id="vehicle-file-input"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageFileUpload}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      {editingType.imageUrl ? (
                        <img src={editingType.imageUrl} alt="Vehicle Icon" style={{ width: '40px', height: '40px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <Truck size={24} color="#94A3B8" />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        className="custom-input"
                        value={editingType.imageUrl}
                        onChange={(e) => setEditingType({ ...editingType, imageUrl: e.target.value })}
                        placeholder="https://poteranusha.s3.amazonaws.com/vehicles/truck.png"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">Base Fare (₹) *</label>
                  <input
                    type="number"
                    step="0.5"
                    className="custom-input"
                    value={editingType.baseFare}
                    onChange={(e) => setEditingType({ ...editingType, baseFare: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Base Distance (KM) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="custom-input"
                    value={editingType.baseKm}
                    onChange={(e) => setEditingType({ ...editingType, baseKm: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Per-KM Rate (₹ / km) *</label>
                  <input
                    type="number"
                    step="0.5"
                    className="custom-input"
                    value={editingType.perKmRate}
                    onChange={(e) => setEditingType({ ...editingType, perKmRate: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Display Priority</label>
                  <input
                    type="number"
                    className="custom-input"
                    value={editingType.priority}
                    onChange={(e) => setEditingType({ ...editingType, priority: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    <input
                      type="checkbox"
                      checked={editingType.status === 'active'}
                      onChange={(e) => setEditingType({ ...editingType, status: e.target.checked ? 'active' : 'inactive' })}
                    />
                    Active (Instantly sync with Driver App & Customer App)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTypeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSavingType}>
                  {isSavingType ? 'Saving...' : 'Save Vehicle Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Vehicle Verification Modal */}
      {selectedVehicle && (
        <div className="modal-backdrop" onClick={() => setSelectedVehicle(null)}>
          <div className="modal-container" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Vehicle Verification Info - {selectedVehicle.id}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedVehicle(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Car size={32} color="var(--primary)" />
                <div>
                  <h4 style={{ fontSize: '16px', margin: 0 }}>{selectedVehicle.model}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Plate No: {selectedVehicle.plate} • Owner: {selectedVehicle.owner}</p>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', marginBottom: '8px' }}>Documents checklist</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Registration Certificate (RC)</span>
                    <span className="badge badge-online">Verified</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Commercial Road Permit</span>
                    <span className="badge badge-online">Verified</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Vehicle Insurance Certificate</span>
                    <span className="badge badge-online">Verified</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedVehicle(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}