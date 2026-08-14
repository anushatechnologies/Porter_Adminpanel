import React, { useState, useEffect } from 'react';
import { IndianRupee, ChevronRight } from 'lucide-react';
import VehicleSelector from './pricing/VehicleSelector';
import PricingConfigForm from './pricing/PricingConfigForm';
import ToastProvider, { useToast } from './pricing/ToastNotification';

// ─── localStorage helpers ───────────────────────────────────────────────────
const LS_KEY = 'porter_pricing_config';

const loadLocalPricing = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveLocalPricing = (vehicleId, payload) => {
  try {
    const existing = loadLocalPricing();
    existing[vehicleId] = { ...payload, _savedAt: new Date().toISOString() };
    localStorage.setItem(LS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('localStorage write failed:', e);
  }
};

const removeLocalPricing = (vehicleId) => {
  try {
    const existing = loadLocalPricing();
    delete existing[vehicleId];
    localStorage.setItem(LS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('localStorage delete failed:', e);
  }
};
// ─────────────────────────────────────────────────────────────────────────────

const PricingManagementContent = () => {
  const { addToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Fetch vehicles list from backend
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      let res = await fetch('/api/admin/pricing/vehicles', { headers: getAuthHeaders() });
      let data = res.ok ? await res.json() : [];
      if (!Array.isArray(data)) {
        data = [];
      }
      
      // Merge with any locally-saved pricing overrides
      const localData = loadLocalPricing();
      const merged = data.map(v => {
        const localKey = v.vehicleId || v.id;
        return localData[localKey] ? { ...v, ...localData[localKey] } : v;
      });
      setVehicles(merged);
      setSelectedVehicle(merged.length > 0 ? merged[0] : null);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      const localData = loadLocalPricing();
      const localVehicles = Object.values(localData);
      setVehicles(localVehicles);
      setSelectedVehicle(localVehicles[0] || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Handle vehicle selection with unsaved changes guard
  const handleSelectVehicle = (vehicle) => {
    if (selectedVehicle && (vehicle.id === selectedVehicle.id || vehicle.vehicleId === selectedVehicle.vehicleId)) return;
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to switch vehicles? Your changes will be lost.')) {
        return;
      }
    }

    // Attempt to fetch specific vehicle pricing from GET /pricing/vehicle/:vehicleId
    fetchVehiclePricing(vehicle);
  };

  // Add new manual custom vehicle
  const handleAddNewVehicle = () => {
    const newId = `custom-v-${Date.now()}`;
    const newVehicle = {
      id: newId,
      vehicleId: `custom-vehicle-${vehicles.length + 1}`,
      name: 'New Vehicle Model',
      baseFare: 100,
      freeDistance: 2,
      pricePerKm: 15,
      minFare: 100,
      maxFare: 5000,
      capacityKg: 500,
      maxDistance: 500,
      status: true,
      priority: vehicles.length + 1
    };
    setVehicles(prev => [newVehicle, ...prev]);
    setSelectedVehicle(newVehicle);
    setIsDirty(true);
    addToast('New vehicle draft created! Configure details on the right and save.', 'info');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('porter_admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const fetchVehiclePricing = async (vehicle) => {
    const vId = vehicle.vehicleId || vehicle.id;
    try {
      // Call live GET /api/pricing/vehicle/:vehicleId
      const res = await fetch(`/api/pricing/vehicle/${vId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const mergedVehicle = { ...vehicle, ...data };
        setSelectedVehicle(mergedVehicle);
        setVehicles(prev => prev.map(v => (v.id === vehicle.id || v.vehicleId === vId) ? mergedVehicle : v));
      } else {
        const localData = loadLocalPricing();
        setSelectedVehicle(localData[vId] ? { ...vehicle, ...localData[vId] } : vehicle);
      }
    } catch (err) {
      console.warn('Failed to fetch vehicle pricing from API, using fallback:', err);
      const localData = loadLocalPricing();
      setSelectedVehicle(localData[vId] ? { ...vehicle, ...localData[vId] } : vehicle);
    }
    setIsDirty(false);
  };

  // Save pricing changes end-to-end
  // Calls PUT /api/pricing/vehicle/:vehicleId (or POST /api/pricing for new vehicles)
  const handleSavePricing = async (pricingPayload) => {
    setIsSaving(true);
    const vId = pricingPayload.vehicleId || (pricingPayload.name || 'vehicle').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const isNew = String(pricingPayload.id).startsWith('custom-v-') || !pricingPayload.id;

    // Build complete payload matching backend contract
    const apiPayload = {
      id: isNew ? undefined : (typeof pricingPayload.id === 'number' ? pricingPayload.id : undefined),
      vehicleId: vId,
      name: pricingPayload.name,
      baseFare: parseFloat(pricingPayload.baseFare) || 0,
      pricePerKm: parseFloat(pricingPayload.pricePerKm) || 0,
      minFare: parseFloat(pricingPayload.minFare) || 0,
      maxFare: parseFloat(pricingPayload.maxFare) || 0,
      freeDistance: parseFloat(pricingPayload.freeDistance) || 0,
      minDistance: parseFloat(pricingPayload.freeDistance) || 0,
      maxDistance: parseFloat(pricingPayload.maxDistance) || 0,
      capacityKg: parseFloat(pricingPayload.capacityKg) || 0,
      status: Boolean(pricingPayload.status),
      priority: parseInt(pricingPayload.priority) || 1,
      commissionPercentage: parseFloat(pricingPayload.commissionPercentage) || 10,
      gstPercentage: parseFloat(pricingPayload.gstPercentage) || 18,
      icon: pricingPayload.icon || 'truck',
      volume: parseFloat(pricingPayload.volume) || 4.5,
      slabPricingEnabled: Boolean(pricingPayload.slabPricingEnabled),
      slabs: pricingPayload.slabs || []
    };

    // Save to localStorage fallback immediately
    saveLocalPricing(vId, apiPayload);

    // Endpoint selection: PUT /api/pricing/vehicle/:vehicleId for updates, POST /api/pricing for creation
    const endpoint = isNew ? '/api/pricing' : `/api/pricing/vehicle/${vId}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      let res = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(apiPayload)
      });

      // Fallback attempt to POST /api/pricing if PUT endpoint returns fallback status
      if (!res.ok && method === 'PUT') {
        res = await fetch('/api/pricing', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(apiPayload)
        });
      }

      if (res.ok) {
        const responseData = await res.json();
        const serverVehicle = responseData?.vehicle || responseData || {};
        const finalMerged = { ...pricingPayload, ...apiPayload, ...serverVehicle };

        addToast('Pricing configuration saved successfully! End-to-end backend & user app updated.', 'success');
        setVehicles(prev => prev.map(v => (v.id === pricingPayload.id || v.vehicleId === vId) ? finalMerged : v));
        setSelectedVehicle(finalMerged);
        saveLocalPricing(vId, finalMerged);
        setIsDirty(false);
      } else {
        const errText = await res.text().catch(() => '');
        console.error('Pricing API save failed:', res.status, errText);
        addToast(`Server returned status ${res.status} — saved to local cache.`, 'warning');
        setVehicles(prev => prev.map(v => (v.id === pricingPayload.id || v.vehicleId === vId) ? { ...v, ...apiPayload } : v));
        setSelectedVehicle(prev => ({ ...prev, ...apiPayload }));
        setIsDirty(false);
      }
    } catch (err) {
      console.error('Error saving pricing (network):', err);
      addToast('Network error — saved to local cache. Changes will persist.', 'warning');
      setVehicles(prev => prev.map(v => (v.id === pricingPayload.id || v.vehicleId === vId) ? { ...v, ...apiPayload } : v));
      setSelectedVehicle(prev => ({ ...prev, ...apiPayload }));
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete pricing end-to-end
  const handleDeletePricing = async (id) => {
    const targetVehicle = vehicles.find(v => v.id === id || v.vehicleId === id);
    const vId = targetVehicle?.vehicleId || id;

    // Remove from localStorage
    removeLocalPricing(vId);
    removeLocalPricing(id);

    try {
      let res = await fetch(`/api/pricing/${vId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!res.ok) {
        res = await fetch(`/api/pricing/vehicle/${vId}`, { method: 'DELETE', headers: getAuthHeaders() });
      }

      if (res.ok || res.status === 404) {
        addToast('Vehicle pricing deleted successfully from backend!', 'success');
      } else {
        addToast(`Delete warning (${res.status}) — removed locally.`, 'warning');
      }
    } catch (err) {
      console.error('Delete pricing error (network):', err);
      addToast('Network error — removed vehicle pricing locally.', 'warning');
    } finally {
      const remaining = vehicles.filter(v => v.id !== id && v.vehicleId !== vId);
      setVehicles(remaining);
      setSelectedVehicle(remaining[0] || null);
    }
  };

  return (
    <div className="module-container animate-fade">
      {/* Page Header with Breadcrumbs */}
      <div className="module-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="breadcrumb-trail">
            <span>Settings</span>
            <ChevronRight size={12} className="breadcrumb-separator" />
            <span>Pricing Management</span>
            <ChevronRight size={12} className="breadcrumb-separator" />
            <span className="active-crumb">Vehicle Pricing</span>
          </div>
          <h2 className="module-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IndianRupee size={28} color="var(--primary)" />
            Vehicle Pricing Management
          </h2>
        </div>
      </div>

      {/* Main Split Panel Layout */}
      <div className="pricing-layout">
        {/* Left Side: Vehicle List */}
        <VehicleSelector
          vehicles={vehicles}
          selectedId={selectedVehicle?.id || selectedVehicle?.vehicleId}
          onSelect={handleSelectVehicle}
          onAddVehicle={handleAddNewVehicle}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Right Side: Pricing Form & Preview */}
        <PricingConfigForm
          vehicle={selectedVehicle}
          onSave={handleSavePricing}
          onDelete={handleDeletePricing}
          isSaving={isSaving}
          isDirty={isDirty}
          setIsDirty={setIsDirty}
        />
      </div>
    </div>
  );
};

export default function PricingManagement() {
  return (
    <ToastProvider>
      <PricingManagementContent />
    </ToastProvider>
  );
}
