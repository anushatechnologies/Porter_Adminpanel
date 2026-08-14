import React, { useState, useEffect, useContext } from 'react';
import { Layers, Plus, Search, Edit, Trash2, X, Check, ArrowUp, ArrowDown, Upload, Link as LinkIcon, AlertCircle, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

const LS_KEY = 'porter_admin_services';

export default function ServicesModule() {
  const { authFetch } = useContext(AppStateContext);
  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [modalTab, setModalTab] = useState('basic'); // basic, pricing, specs, visuals

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'vehicle',
    subtitle: '',
    base_fare: '249',
    base_km: '2',
    per_km_rate: '20',
    helper_rate: '300',
    capacity_kg: '750',
    capacity_label: '750 Kg',
    dimensions_length: '7 ft',
    dimensions_width: '4.5 ft',
    dimensions_height: '5 ft',
    eta_label: '10-15 mins',
    icon_url: '',
    bg_tint: '#EEF4FF',
    is_active: true,
    display_order: 1,
    available_cities: ['ALL']
  });

  // Keep localStorage cache in sync whenever services change
  useEffect(() => {
    try {
      if (services.length > 0) {
        localStorage.setItem(LS_KEY, JSON.stringify(services));
      }
    } catch (e) {}
  }, [services]);

  // Normalize service object to support both camelCase (API spec) and snake_case
  const normalizeService = (s) => {
    if (!s) return null;
    const slugId = s.serviceId || s.id || (s.name ? s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `service-${Math.random()}`);
    let dims = s.dimensions;
    if (typeof dims === 'string') {
      try { dims = JSON.parse(dims); } catch (e) { dims = { length: s.dimensions, width: '', height: '' }; }
    }

    let cities = s.availableCities || s.available_cities || ['ALL'];
    if (typeof cities === 'string') {
      try { cities = JSON.parse(cities); } catch (e) { cities = [cities]; }
    }

    return {
      ...s,
      id: slugId,
      numericId: s.id,
      serviceId: slugId,
      name: s.name || s.label || 'New Service',
      label: s.label || s.name || 'New Service',
      category: s.category || 'vehicle',
      subtitle: s.subtitle || s.description || '',
      description: s.description || s.subtitle || '',
      base_fare: s.baseFare !== undefined ? s.baseFare : (s.basePrice !== undefined ? s.basePrice : (s.base_fare || 0)),
      baseFare: s.baseFare !== undefined ? s.baseFare : (s.basePrice !== undefined ? s.basePrice : (s.base_fare || 0)),
      basePrice: s.basePrice !== undefined ? s.basePrice : (s.baseFare !== undefined ? s.baseFare : (s.base_fare || 0)),
      base_km: s.baseKm !== undefined ? s.baseKm : (s.base_km || 2.0),
      baseKm: s.baseKm !== undefined ? s.baseKm : (s.base_km || 2.0),
      per_km_rate: s.perKmRate !== undefined ? s.perKmRate : (s.pricePerKm !== undefined ? s.pricePerKm : (s.per_km_rate || 0)),
      perKmRate: s.perKmRate !== undefined ? s.perKmRate : (s.pricePerKm !== undefined ? s.pricePerKm : (s.per_km_rate || 0)),
      pricePerKm: s.pricePerKm !== undefined ? s.pricePerKm : (s.perKmRate !== undefined ? s.perKmRate : (s.per_km_rate || 0)),
      helper_rate: s.helperRate !== undefined ? s.helperRate : (s.helper_rate || 0),
      helperRate: s.helperRate !== undefined ? s.helperRate : (s.helper_rate || 0),
      capacity_kg: s.capacityKg !== undefined ? s.capacityKg : (s.capacity_kg || 0),
      capacityKg: s.capacityKg !== undefined ? s.capacityKg : (s.capacity_kg || 0),
      capacity_label: s.capacityLabel || s.capacity || s.capacity_label || `${s.capacityKg || s.capacity_kg || 0} Kg`,
      capacityLabel: s.capacityLabel || s.capacity || s.capacity_label || `${s.capacityKg || s.capacity_kg || 0} Kg`,
      capacity: s.capacity || s.capacityLabel || s.capacity_label || `${s.capacityKg || s.capacity_kg || 0} Kg`,
      dimensions: dims || { length: '7 ft', width: '4.5 ft', height: '5 ft' },
      eta_label: s.etaLabel || s.eta_label || '10-15 mins',
      etaLabel: s.etaLabel || s.eta_label || '10-15 mins',
      icon_url: s.iconUrl || s.imageUrl || s.icon_url || '',
      iconUrl: s.iconUrl || s.imageUrl || s.icon_url || '',
      imageUrl: s.imageUrl || s.iconUrl || s.icon_url || '',
      bg_tint: s.bgTint || s.bg_tint || '#EEF4FF',
      bgTint: s.bgTint || s.bg_tint || '#EEF4FF',
      is_active: s.isActive !== undefined ? Boolean(s.isActive) : (s.is_active !== undefined ? Boolean(s.is_active) : true),
      isActive: s.isActive !== undefined ? Boolean(s.isActive) : (s.is_active !== undefined ? Boolean(s.is_active) : true),
      display_order: s.displayOrder !== undefined ? s.displayOrder : (s.order !== undefined ? s.order : (s.display_order || 1)),
      displayOrder: s.displayOrder !== undefined ? s.displayOrder : (s.order !== undefined ? s.order : (s.display_order || 1)),
      order: s.order !== undefined ? s.order : (s.displayOrder !== undefined ? s.displayOrder : (s.display_order || 1)),
      available_cities: cities,
      availableCities: cities
    };
  };

  // Fetch services directly from REST API
  const fetchServices = async () => {
    if (!authFetch) return;
    try {
      let res = await authFetch('/api/admin/services');
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data?.services || []);
        if (items.length > 0) {
          setServices(items.map(normalizeService));
          return;
        }
      }

      // Fallback to public services endpoint
      let pubRes = await authFetch('/api/services');
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        const pubItems = Array.isArray(pubData) ? pubData : (pubData?.services || pubData?.featuredServices || []);
        if (pubItems.length > 0) {
          setServices(pubItems.map(normalizeService));
        }
      }
    } catch (e) {
      console.warn('API services fetch note (using local cache):', e);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenModal = (service = null) => {
    if (service) {
      const s = normalizeService(service);
      setEditingService(s);
      setFormData({
        name: s.name || '',
        category: s.category || 'vehicle',
        subtitle: s.subtitle || s.description || '',
        base_fare: String(s.baseFare || 249),
        base_km: String(s.baseKm || 2),
        per_km_rate: String(s.perKmRate || 20),
        helper_rate: String(s.helperRate || 300),
        capacity_kg: String(s.capacityKg || 750),
        capacity_label: s.capacityLabel || `${s.capacityKg || 750} Kg`,
        dimensions_length: s.dimensions?.length || '7 ft',
        dimensions_width: s.dimensions?.width || '4.5 ft',
        dimensions_height: s.dimensions?.height || '5 ft',
        eta_label: s.etaLabel || '10-15 mins',
        icon_url: s.iconUrl || '',
        bg_tint: s.bgTint || '#EEF4FF',
        is_active: s.isActive,
        display_order: s.displayOrder || services.length + 1,
        available_cities: Array.isArray(s.availableCities) ? s.availableCities : ['ALL']
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        category: 'vehicle',
        subtitle: '',
        base_fare: '249',
        base_km: '2',
        per_km_rate: '20',
        helper_rate: '300',
        capacity_kg: '750',
        capacity_label: '750 Kg',
        dimensions_length: '7 ft',
        dimensions_width: '4.5 ft',
        dimensions_height: '5 ft',
        eta_label: '10-15 mins',
        icon_url: '',
        bg_tint: '#EEF4FF',
        is_active: true,
        display_order: services.length + 1,
        available_cities: ['ALL']
      });
    }
    setModalTab('basic');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const slugId = editingService
      ? (editingService.serviceId || editingService.id)
      : formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const dimObj = {
      length: formData.dimensions_length,
      width: formData.dimensions_width,
      height: formData.dimensions_height
    };

    const servicePayload = normalizeService({
      id: slugId,
      serviceId: slugId,
      name: formData.name.trim(),
      label: formData.name.trim(),
      category: formData.category,
      subtitle: formData.subtitle.trim(),
      description: formData.subtitle.trim(),
      baseFare: parseFloat(formData.base_fare) || 0,
      basePrice: parseFloat(formData.base_fare) || 0,
      base_fare: parseFloat(formData.base_fare) || 0,
      baseKm: parseFloat(formData.base_km) || 0,
      base_km: parseFloat(formData.base_km) || 0,
      perKmRate: parseFloat(formData.per_km_rate) || 0,
      pricePerKm: parseFloat(formData.per_km_rate) || 0,
      per_km_rate: parseFloat(formData.per_km_rate) || 0,
      helperRate: parseFloat(formData.helper_rate) || 0,
      helper_rate: parseFloat(formData.helper_rate) || 0,
      capacityKg: parseInt(formData.capacity_kg) || 0,
      capacity_kg: parseInt(formData.capacity_kg) || 0,
      capacityLabel: formData.capacity_label.trim() || `${formData.capacity_kg} Kg`,
      capacity: formData.capacity_label.trim() || `${formData.capacity_kg} Kg`,
      dimensions: dimObj,
      etaLabel: formData.eta_label.trim(),
      eta_label: formData.eta_label.trim(),
      iconUrl: formData.icon_url.trim(),
      imageUrl: formData.icon_url.trim(),
      icon_url: formData.icon_url.trim(),
      bgTint: formData.bg_tint,
      bg_tint: formData.bg_tint,
      isActive: Boolean(formData.is_active),
      is_active: Boolean(formData.is_active),
      displayOrder: parseInt(formData.display_order) || services.length + 1,
      order: parseInt(formData.display_order) || services.length + 1,
      display_order: parseInt(formData.display_order) || services.length + 1,
      availableCities: formData.available_cities,
      available_cities: formData.available_cities,
      updatedAt: new Date().toISOString()
    });

    // Update Local State & LS
    if (editingService) {
      setServices(prev => prev.map(s => (s.id === editingService.id || s.serviceId === slugId) ? servicePayload : s));
    } else {
      setServices(prev => [...prev, servicePayload]);
    }

    // Call REST API matching backend spec
    if (authFetch) {
      try {
        const endpoint = editingService ? `/api/admin/services/${slugId}` : '/api/admin/services';
        const method = editingService ? 'PUT' : 'POST';

        const apiBody = {
          serviceId: slugId,
          name: servicePayload.name,
          label: servicePayload.label,
          category: servicePayload.category,
          subtitle: servicePayload.subtitle,
          baseFare: servicePayload.baseFare,
          baseKm: servicePayload.baseKm,
          perKmRate: servicePayload.perKmRate,
          helperRate: servicePayload.helperRate,
          capacityKg: servicePayload.capacityKg,
          capacityLabel: servicePayload.capacityLabel,
          dimensions: JSON.stringify(servicePayload.dimensions),
          etaLabel: servicePayload.etaLabel,
          iconUrl: servicePayload.iconUrl,
          bgTint: servicePayload.bgTint,
          isActive: servicePayload.isActive,
          displayOrder: servicePayload.displayOrder,
          availableCities: JSON.stringify(servicePayload.availableCities)
        };

        await authFetch(endpoint, {
          method,
          body: JSON.stringify(apiBody)
        });
      } catch (err) {
        console.warn('Backend service save note (retained in local cache):', err);
      }
    }

    handleCloseModal();
  };

  const handleToggleStatus = async (id) => {
    let nextStatus = false;
    let targetService = null;

    setServices(prev => prev.map(s => {
      if (s.id === id || s.serviceId === id || s.numericId === id) {
        nextStatus = !s.is_active;
        targetService = s;
        return { ...s, is_active: nextStatus, isActive: nextStatus };
      }
      return s;
    }));

    if (authFetch) {
      try {
        const targetId = targetService?.numericId || targetService?.id || id;
        await authFetch(`/api/admin/services/${targetId}/toggle-status`, {
          method: 'PATCH',
          body: JSON.stringify({ isActive: nextStatus, is_active: nextStatus })
        });
      } catch (e) {}
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete / archive this service?')) {
      const targetService = services.find(s => s.id === id || s.serviceId === id || s.numericId === id);
      const targetId = targetService?.numericId || targetService?.serviceId || id;
      setServices(prev => prev.filter(s => s.id !== id && s.serviceId !== id && s.numericId !== id));
      if (authFetch) {
        try {
          await authFetch(`/api/admin/services/${targetId}`, { method: 'DELETE' });
        } catch (e) {}
      }
    }
  };

  const handleMoveOrder = (index, direction) => {
    const newServices = [...services];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newServices.length) return;

    const temp = newServices[index];
    newServices[index] = newServices[targetIndex];
    newServices[targetIndex] = temp;

    // Reassign display_order sequentially
    const reordered = newServices.map((s, idx) => ({ ...s, display_order: idx + 1 }));
    setServices(reordered);

    if (authFetch) {
      try {
        authFetch('/api/admin/services/reorder', {
          method: 'PATCH',
          body: JSON.stringify({ serviceIds: reordered.map(s => s.id) })
        });
      } catch (e) {}
    }
  };

  // Filtering
  const filteredServices = services.filter(service => {
    if (categoryFilter !== 'ALL' && service.category !== categoryFilter) return false;
    if (statusFilter === 'ACTIVE' && !service.is_active) return false;
    if (statusFilter === 'INACTIVE' && service.is_active) return false;

    const query = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(query) ||
      service.id.toLowerCase().includes(query) ||
      (service.subtitle && service.subtitle.toLowerCase().includes(query))
    );
  });

  return (
    <div className="animate-fade" style={{ paddingBottom: '40px' }}>
      {/* Header Banner */}
      <div className="module-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="module-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={26} color="var(--primary)" />
            "Our Services" & Dynamic Fleet Management
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Configure services displayed on Customer App home screen. Changes update instantly in real time.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add New Service
        </button>
      </div>

      {/* Filter & Control Bar */}
      <div className="table-container" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="search-input-wrapper" style={{ minWidth: '280px', flex: 1 }}>
            <Search className="header-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search services by name, ID, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', fontSize: '13px', outline: 'none' }}
              >
                <option value="ALL">All Categories</option>
                <option value="vehicle">🚚 Porter Trucks & Fleet</option>
                <option value="two_wheeler">🛵 2 Wheeler / Bike</option>
                <option value="packers">📦 Packers & Movers</option>
                <option value="intercity">🛣️ Intercity / Outstation</option>
                <option value="how_it_works">❓ How Porter Works (Guide)</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', fontSize: '13px', outline: 'none' }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">🟢 Active Only</option>
              <option value="INACTIVE">⚪ Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Services Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '70px', textAlign: 'center' }}>Order</th>
              <th style={{ width: '80px' }}>Icon</th>
              <th>Service Name & Slug</th>
              <th>Category</th>
              <th>Base Fare & Rate</th>
              <th>Capacity</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No services match your filters. Click <strong>'+ Add New Service'</strong> to create one.
                </td>
              </tr>
            ) : (
              filteredServices.map((service, index) => (
                <tr key={service.id}>
                  {/* Order adjustment buttons */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <button
                        className="icon-btn"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', opacity: index === 0 ? 0.3 : 1 }}
                        disabled={index === 0}
                        onClick={() => handleMoveOrder(index, 'up')}
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>{service.display_order || index + 1}</span>
                      <button
                        className="icon-btn"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', opacity: index === filteredServices.length - 1 ? 0.3 : 1 }}
                        disabled={index === filteredServices.length - 1}
                        onClick={() => handleMoveOrder(index, 'down')}
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>

                  {/* Icon Thumbnail */}
                  <td>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: service.bg_tint || '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {service.icon_url ? (
                        <img src={service.icon_url} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <Layers size={22} color="var(--primary)" />
                      )}
                    </div>
                  </td>

                  {/* Service Name & Subtitle */}
                  <td>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{service.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>ID: <code>{service.id}</code></div>
                      {service.subtitle && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {service.subtitle}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Category Badge */}
                  <td>
                    <span className="badge" style={{
                      backgroundColor: service.category === 'two_wheeler' ? '#E0F2FE' : service.category === 'packers' ? '#F3E8FF' : service.category === 'how_it_works' ? '#FEE2E2' : '#DCFCE7',
                      color: service.category === 'two_wheeler' ? '#0284C7' : service.category === 'packers' ? '#7E22CE' : service.category === 'how_it_works' ? '#DC2626' : '#15803D',
                      fontWeight: '600'
                    }}>
                      {service.category === 'two_wheeler' ? '2 Wheeler' : service.category === 'packers' ? 'Packers & Movers' : service.category === 'how_it_works' ? 'How It Works' : service.category === 'intercity' ? 'Outstation' : 'Porter Truck'}
                    </span>
                  </td>

                  {/* Pricing Breakdown */}
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>₹{service.base_fare} <span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text-muted)' }}>({service.base_km || 2} km base)</span></div>
                    <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', marginTop: '2px' }}>+ ₹{service.per_km_rate}/km</div>
                  </td>

                  {/* Capacity & Dimensions */}
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{service.capacity_label || `${service.capacity_kg} Kg`}</div>
                    {service.dimensions && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {service.dimensions.length} × {service.dimensions.width}
                      </div>
                    )}
                  </td>

                  {/* Active / Inactive Status Switch */}
                  <td>
                    <button
                      className={`badge ${service.is_active ? 'badge-completed' : 'badge-cancelled'}`}
                      style={{ cursor: 'pointer', border: 'none', outline: 'none' }}
                      onClick={() => handleToggleStatus(service.id)}
                      title="Click to toggle visibility on Customer App"
                    >
                      {service.is_active ? '🟢 Active' : '⚪ Hidden'}
                    </button>
                  </td>

                  {/* Action Buttons */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="action-btn btn-view" onClick={() => handleOpenModal(service)} title="Edit Service">
                        <Edit size={16} />
                      </button>
                      <button className="action-btn" style={{ color: '#EF4444', backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }} onClick={() => handleDelete(service.id)} title="Delete Service">
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

      {/* Add / Edit Service Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingService ? `Edit Service — ${editingService.name}` : 'Add New Service / Vehicle'}</h3>
              <button type="button" className="modal-close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
              <button type="button" className={`tab-btn ${modalTab === 'basic' ? 'active' : ''}`} style={{ fontSize: '13px', padding: '10px 14px' }} onClick={() => setModalTab('basic')}>1. Basic Information</button>
              <button type="button" className={`tab-btn ${modalTab === 'pricing' ? 'active' : ''}`} style={{ fontSize: '13px', padding: '10px 14px' }} onClick={() => setModalTab('pricing')}>2. Pricing Config</button>
              <button type="button" className={`tab-btn ${modalTab === 'specs' ? 'active' : ''}`} style={{ fontSize: '13px', padding: '10px 14px' }} onClick={() => setModalTab('specs')}>3. Vehicle Specs</button>
              <button type="button" className={`tab-btn ${modalTab === 'visuals' ? 'active' : ''}`} style={{ fontSize: '13px', padding: '10px 14px' }} onClick={() => setModalTab('visuals')}>4. Visuals & Cities</button>
            </div>

            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && modalTab !== 'visuals') {
                  e.preventDefault();
                  setModalTab(prev => prev === 'basic' ? 'pricing' : prev === 'pricing' ? 'specs' : 'visuals');
                }
              }}
              className="modal-body"
              style={{ minHeight: '340px' }}
            >
              {/* Tab 1: Basic Information */}
              {modalTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Service Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Tata Ace (Chota Hathi)"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                      >
                        <option value="vehicle">🚚 Porter Trucks & Fleet</option>
                        <option value="two_wheeler">🛵 2 Wheeler / Bike</option>
                        <option value="packers">📦 Packers & Movers</option>
                        <option value="intercity">🛣️ Intercity / Outstation</option>
                        <option value="how_it_works">❓ How Porter Works (Guide Step)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Display Order</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.display_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_order: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Tagline / Subtitle Description</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="e.g., Ideal for 1 BHK house shifting or business cargo"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                  </div>

                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>Customer App Visibility</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Enable to show in "Our Services" grid on Customer Home screen.</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Pricing Configuration */}
              {modalTab === 'pricing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Base Fare (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.base_fare}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_fare: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Base Distance Included (KM) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.base_km}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_km: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Rate Per KM (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.per_km_rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, per_km_rate: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Helper / Labor Cost (₹)</label>
                      <input
                        type="number"
                        step="1"
                        value={formData.helper_rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, helper_rate: e.target.value }))}
                        placeholder="e.g., 300"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '12px', color: 'var(--primary)' }}>
                    <strong>Fare Calculation Preview:</strong> A 10 KM trip = ₹{formData.base_fare} + ({10 - (parseFloat(formData.base_km) || 0)} KM × ₹{formData.per_km_rate}) = <strong>₹{((parseFloat(formData.base_fare) || 0) + (Math.max(0, 10 - (parseFloat(formData.base_km) || 0)) * (parseFloat(formData.per_km_rate) || 0))).toFixed(2)}</strong>
                  </div>
                </div>
              )}

              {/* Tab 3: Vehicle Specs & Dimensions */}
              {modalTab === 'specs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Payload Weight (Kg) *</label>
                      <input
                        type="number"
                        step="1"
                        required
                        value={formData.capacity_kg}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity_kg: e.target.value, capacity_label: `${e.target.value} Kg` }))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Capacity Label</label>
                      <input
                        type="text"
                        value={formData.capacity_label}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity_label: e.target.value }))}
                        placeholder="e.g., 750 Kg or Complete House Shifting"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Cargo Bed Dimensions</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <input
                        type="text"
                        placeholder="Length (e.g. 7 ft)"
                        value={formData.dimensions_length}
                        onChange={(e) => setFormData(prev => ({ ...prev, dimensions_length: e.target.value }))}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                      <input
                        type="text"
                        placeholder="Width (e.g. 4.5 ft)"
                        value={formData.dimensions_width}
                        onChange={(e) => setFormData(prev => ({ ...prev, dimensions_width: e.target.value }))}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                      <input
                        type="text"
                        placeholder="Height (e.g. 5 ft)"
                        value={formData.dimensions_height}
                        onChange={(e) => setFormData(prev => ({ ...prev, dimensions_height: e.target.value }))}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Default ETA Estimate Label</label>
                    <input
                      type="text"
                      value={formData.eta_label}
                      onChange={(e) => setFormData(prev => ({ ...prev, eta_label: e.target.value }))}
                      placeholder="e.g. 10-15 mins"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                  </div>
                </div>
              )}

              {/* Tab 4: Visuals & City Availability */}
              {modalTab === 'visuals' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Icon / 3D Illustration Image URL</label>
                    <input
                      type="url"
                      value={formData.icon_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon_url: e.target.value }))}
                      placeholder="https://cdn.anushaporter.com/services/tata-ace.png"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                  </div>

                  {formData.icon_url && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', backgroundColor: formData.bg_tint }}>
                        <img src={formData.icon_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Icon Preview with Card Accent Tint</span>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Card Accent Tint Color</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={formData.bg_tint}
                        onChange={(e) => setFormData(prev => ({ ...prev, bg_tint: e.target.value }))}
                        style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={formData.bg_tint}
                        onChange={(e) => setFormData(prev => ({ ...prev, bg_tint: e.target.value }))}
                        style={{ width: '120px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Available Cities</label>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {['ALL', 'Hyderabad', 'Secunderabad', 'Bangalore', 'Chennai'].map(city => (
                        <label key={city} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={formData.available_cities.includes(city)}
                            onChange={(e) => {
                              if (city === 'ALL') {
                                setFormData(prev => ({ ...prev, available_cities: ['ALL'] }));
                              } else {
                                const exists = formData.available_cities.includes(city);
                                const next = exists
                                  ? formData.available_cities.filter(c => c !== city && c !== 'ALL')
                                  : [...formData.available_cities.filter(c => c !== 'ALL'), city];
                                setFormData(prev => ({ ...prev, available_cities: next.length === 0 ? ['ALL'] : next }));
                              }
                            }}
                          />
                          {city}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn" onClick={handleCloseModal} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>Cancel</button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {modalTab !== 'basic' && (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setModalTab(prev => prev === 'visuals' ? 'specs' : prev === 'specs' ? 'pricing' : 'basic')}
                      style={{ border: '1px solid var(--border-color)' }}
                    >
                      Back
                    </button>
                  )}
                  {modalTab !== 'visuals' ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setModalTab(prev => prev === 'basic' ? 'pricing' : prev === 'pricing' ? 'specs' : 'visuals')}
                    >
                      Next Step
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary">
                      {editingService ? 'Update Service' : 'Save Service'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
