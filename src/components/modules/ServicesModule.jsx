import React, { useState, useEffect, useContext } from 'react';
import { Layers, Plus, Search, Edit, Trash2, X, Check, ArrowUp, ArrowDown, Upload, AlertCircle, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export const CATEGORY_CONFIG = {
  vehicle: {
    id: 'vehicle',
    name: 'Trucks',
    emoji: '🚚',
    badgeColor: '#15803D',
    badgeBg: '#DCFCE7'
  },
  two_wheeler: {
    id: 'two_wheeler',
    name: '2 Wheeler',
    emoji: '🛵',
    badgeColor: '#0284C7',
    badgeBg: '#E0F2FE'
  },
  packers: {
    id: 'packers',
    name: 'Packers & Movers',
    emoji: '📦',
    badgeColor: '#7E22CE',
    badgeBg: '#F3E8FF'
  }
};


// Reliable high-resolution vehicle icons fallback dictionary
export const DEFAULT_VEHICLE_ICONS = {
  '3-wheeler': 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  'mini-3w': 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  '3-wheeler-500kg': 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  'tata-ace': 'https://cdn-icons-png.flaticon.com/512/2554/2554978.png',
  'tata-ace-750kg': 'https://cdn-icons-png.flaticon.com/512/2554/2554978.png',
  'pickup-8ft': 'https://cdn-icons-png.flaticon.com/512/2554/2554978.png',
  'pickup-1000kg': 'https://cdn-icons-png.flaticon.com/512/2554/2554978.png',
  'two_wheeler': 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  'bike': 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  'scooter': 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  'packers': 'https://cdn-icons-png.flaticon.com/512/3030/3030336.png',
  'packers-movers': 'https://cdn-icons-png.flaticon.com/512/3030/3030336.png',
  'vehicle': 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png'
};

// Universal image URL resolver guaranteeing absolute domain path
export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:image/') || url.startsWith('blob:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `https://api.anushaporter.com${clean}`;
};

// Permanent local storage cache for user-uploaded service icons with multi-key fallback
export const getCachedServiceImage = (service) => {
  if (!service) return '';
  if (typeof service === 'string') {
    try { return localStorage.getItem(`porter_srv_img_${service}`) || ''; } catch (e) { return ''; }
  }
  const keys = [
    service.serviceId,
    service.id,
    service.numericId,
    service.name ? service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '',
    service.label ? service.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : ''
  ].filter(Boolean);

  for (const k of keys) {
    try {
      const img = localStorage.getItem(`porter_srv_img_${k}`);
      if (img) return img;
    } catch (e) {}
  }
  return '';
};

export const setCachedServiceImage = (service, imgUrl) => {
  if (!imgUrl) return;
  const keys = typeof service === 'string' ? [service] : [
    service?.serviceId,
    service?.id,
    service?.numericId,
    service?.name ? service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '',
    service?.label ? service.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : ''
  ].filter(Boolean);

  for (const k of keys) {
    try {
      localStorage.setItem(`porter_srv_img_${k}`, imgUrl);
    } catch (e) {}
  }
};

export const getFallbackIcon = (service) => {
  if (!service) return DEFAULT_VEHICLE_ICONS.vehicle;
  const name = String(service.name || service.label || service.id || '').toLowerCase();
  const cat = String(service.category || '').toLowerCase();
  
  if (name.includes('3 wheeler') || name.includes('3w') || name.includes('auto') || name.includes('ape') || name.includes('three')) {
    return DEFAULT_VEHICLE_ICONS['3-wheeler'];
  }
  if (name.includes('tata ace') || name.includes('chota hathi') || name.includes('ace')) {
    return DEFAULT_VEHICLE_ICONS['tata-ace'];
  }
  if (name.includes('pickup') || name.includes('8ft') || name.includes('bolero') || name.includes('dost') || name.includes('14ft') || name.includes('truck')) {
    return DEFAULT_VEHICLE_ICONS['pickup-8ft'];
  }
  if (name.includes('bike') || name.includes('scooter') || name.includes('2w') || name.includes('two wheeler') || cat === 'two_wheeler') {
    return DEFAULT_VEHICLE_ICONS['two_wheeler'];
  }
  if (name.includes('packer') || name.includes('mover') || name.includes('shifting') || cat === 'packers') {
    return DEFAULT_VEHICLE_ICONS['packers'];
  }
  return DEFAULT_VEHICLE_ICONS.vehicle;
};

export default function ServicesModule() {
  const { authFetch, cities: contextCities, franchises, settings } = useContext(AppStateContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Dynamically resolve operational cities from backend
  const operationalCities = Array.from(new Set([
    'Hyderabad',
    ...(Array.isArray(contextCities) ? contextCities.map(c => c.name || c.id) : []),
    ...(Array.isArray(franchises) ? franchises.map(f => f.city || f.location || f.name) : []),
    ...((settings?.coverageCities || '').split(',').map(s => s.trim()).filter(Boolean))
  ])).filter(Boolean);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [modalTab, setModalTab] = useState('basic'); // basic, pricing, specs, visuals
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'vehicle',
    subtitle: '',
    base_fare: '249',
    base_km: '2',
    per_km_rate: '20',
    helper_rate: '0',
    capacity_kg: '750',
    capacity_label: '750 Kg',
    dimensions_length: '',
    dimensions_width: '',
    dimensions_height: '',
    eta_label: '10-15 mins',
    icon_url: '',
    bg_tint: '#EEF4FF',
    is_active: true,
    display_order: 1,
    available_cities: ['Hyderabad']
  });

  // Normalize service object to support both camelCase (API spec) and snake_case
  const normalizeService = (s) => {
    if (!s) return null;
    const slugId = s.serviceId || s.id || (s.name ? s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `service-${Math.random()}`);
    let dims = s.dimensions;
    if (typeof dims === 'string') {
      try { dims = JSON.parse(dims); } catch (e) { dims = { length: s.dimensions, width: '', height: '' }; }
    }

    let cities = s.availableCities || s.available_cities || ['Hyderabad'];
    if (typeof cities === 'string') {
      try { cities = JSON.parse(cities); } catch (e) { cities = [cities]; }
    }

    const catKey = s.category || 'vehicle';
    const catConfig = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG.vehicle;
    
    // Check server icon, then persistent local cache, then fallback
    const cached = getCachedServiceImage(s) || getCachedServiceImage(slugId);
    let rawIcon = s.iconUrl || s.imageUrl || s.icon_url || s.image_url || cached || '';
    const resolvedIcon = resolveImageUrl(rawIcon) || getFallbackIcon(s);

    return {
      ...s,
      id: slugId,
      numericId: s.numericId || s.id,
      serviceId: slugId,
      name: s.name || s.label || 'New Service',
      label: s.label || s.name || 'New Service',
      category: catKey,
      categoryName: catConfig.name,
      category_name: catConfig.name,
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
      dimensions: dims || { length: '', width: '', height: '' },
      eta_label: s.etaLabel || s.eta_label || '10-15 mins',
      etaLabel: s.etaLabel || s.eta_label || '10-15 mins',
      icon_url: resolvedIcon,
      iconUrl: resolvedIcon,
      imageUrl: resolvedIcon,
      image_url: resolvedIcon,
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

  // Fetch services directly from live REST API
  const fetchServices = async () => {
    if (!authFetch) return;
    setLoading(true);
    setError(null);
    try {
      let res = await authFetch('/api/admin/services');
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data?.services || []);
        const validItems = items
          .filter(item => item && item.category !== 'how_it_works' && item.category !== 'intercity')
          .map(normalizeService);
        validItems.sort((a, b) => (a.display_order || 1) - (b.display_order || 1));
        setServices(validItems);
        setLoading(false);
        return;
      }

      // Fallback to public services endpoint
      let pubRes = await authFetch('/api/services');
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        const pubItems = Array.isArray(pubData) ? pubData : (pubData?.services || pubData?.featuredServices || []);
        const validPub = pubItems
          .filter(item => item && item.category !== 'how_it_works' && item.category !== 'intercity')
          .map(normalizeService);
        validPub.sort((a, b) => (a.display_order || 1) - (b.display_order || 1));
        setServices(validPub);
      } else {
        setError('Failed to fetch services from backend server.');
      }
    } catch (e) {
      console.error('API services fetch error:', e);
      setError(e.message || 'Network error fetching services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenModal = (service = null) => {
    setSelectedImageFile(null);
    setIsImageRemoved(false);
    if (service) {
      const s = normalizeService(service);
      setEditingService(s);
      const existingImg = s.iconUrl || s.imageUrl || '';
      setImagePreview(existingImg);
      setFormData({
        name: s.name || '',
        category: s.category || 'vehicle',
        subtitle: s.subtitle || s.description || '',
        base_fare: String(s.baseFare || 249),
        base_km: String(s.baseKm || 2),
        per_km_rate: String(s.perKmRate || 20),
        helper_rate: s.helperRate != null ? String(s.helperRate) : (s.helper_rate != null ? String(s.helper_rate) : '0'),
        capacity_kg: String(s.capacityKg || 750),
        capacity_label: s.capacityLabel || `${s.capacityKg || 750} Kg`,
        dimensions_length: s.dimensions?.length || '',
        dimensions_width: s.dimensions?.width || '',
        dimensions_height: s.dimensions?.height || '',
        eta_label: s.etaLabel || '10-15 mins',
        icon_url: existingImg,
        bg_tint: s.bgTint || '#EEF4FF',
        is_active: s.isActive,
        display_order: s.displayOrder || services.length + 1,
        available_cities: Array.isArray(s.availableCities) && s.availableCities.length > 0 ? s.availableCities : ['Hyderabad']
      });
    } else {
      setEditingService(null);
      setImagePreview('');
      setFormData({
        name: '',
        category: 'vehicle',
        subtitle: '',
        base_fare: '249',
        base_km: '2',
        per_km_rate: '20',
        helper_rate: '0',
        capacity_kg: '750',
        capacity_label: '750 Kg',
        dimensions_length: '',
        dimensions_width: '',
        dimensions_height: '',
        eta_label: '10-15 mins',
        icon_url: '',
        bg_tint: '#EEF4FF',
        is_active: true,
        display_order: services.length + 1,
        available_cities: ['Hyderabad']
      });
    }
    setModalTab('basic');
    setShowModal(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, WebP, SVG)');
        return;
      }
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target.result;
        setImagePreview(dataUrl);
        setFormData(prev => ({ ...prev, icon_url: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseModal = () => {
    setSelectedImageFile(null);
    setImagePreview('');
    setShowModal(false);
    setEditingService(null);
    setIsImageRemoved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a service name.');
      return;
    }

    setIsSaving(true);

    let finalIconUrl = formData.icon_url ? formData.icon_url.trim() : '';

    // Step A: If an image file was selected by user, attempt upload to /api/upload
    if (selectedImageFile) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedImageFile);

        const uploadRes = await authFetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          const rawUrl = uploadData?.url || uploadData?.fileUrl || uploadData?.imageUrl || uploadData?.path || '';
          if (rawUrl) {
            finalIconUrl = resolveImageUrl(rawUrl);
          }
        } else {
          console.warn('[Image Upload] Server upload failed, using Data URL fallback.');
          if (imagePreview && imagePreview.startsWith('data:image/')) {
            finalIconUrl = imagePreview;
          }
        }
      } catch (uploadErr) {
        console.warn('[Image Upload] Upload exception, falling back to data URL:', uploadErr);
        if (imagePreview && imagePreview.startsWith('data:image/')) {
          finalIconUrl = imagePreview;
        }
      }
    } else if (editingService && !isImageRemoved && !finalIconUrl) {
      finalIconUrl = editingService.iconUrl || editingService.imageUrl || '';
    }

    const slugId = editingService
      ? (editingService.serviceId || editingService.id)
      : formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const dimObj = {
      length: formData.dimensions_length || '',
      width: formData.dimensions_width || '',
      height: formData.dimensions_height || ''
    };

    const servicePayload = normalizeService({
      id: slugId,
      serviceId: slugId,
      name: formData.name.trim(),
      label: formData.name.trim(),
      category: formData.category,
      categoryName: CATEGORY_CONFIG[formData.category]?.name || 'Trucks',
      subtitle: formData.subtitle.trim(),
      description: formData.subtitle.trim(),
      baseFare: parseFloat(formData.base_fare) || 0,
      basePrice: parseFloat(formData.base_fare) || 0,
      baseKm: parseFloat(formData.base_km) || 2,
      perKmRate: parseFloat(formData.per_km_rate) || 0,
      pricePerKm: parseFloat(formData.per_km_rate) || 0,
      helperRate: parseFloat(formData.helper_rate) || 0,
      capacityKg: parseInt(formData.capacity_kg) || 0,
      capacityLabel: formData.capacity_label.trim() || `${formData.capacity_kg} Kg`,
      capacity: formData.capacity_label.trim() || `${formData.capacity_kg} Kg`,
      dimensions: dimObj,
      etaLabel: formData.eta_label.trim() || '10-15 mins',
      iconUrl: finalIconUrl,
      imageUrl: finalIconUrl,
      bgTint: formData.bg_tint || '#EEF4FF',
      isActive: Boolean(formData.is_active),
      customerVisible: Boolean(formData.is_active),
      showOnCustomerApp: Boolean(formData.is_active),
      displayOrder: parseInt(formData.display_order) || services.length + 1,
      order: parseInt(formData.display_order) || services.length + 1,
      availableCities: formData.available_cities.length > 0 ? formData.available_cities : ['Hyderabad']
    });

    try {
      const targetEndpointId = editingService?.numericId || editingService?.serviceId || editingService?.id || slugId;
      const endpoint = editingService ? `/api/admin/services/${targetEndpointId}` : '/api/admin/services';
      const method = editingService ? 'PUT' : 'POST';

      const apiBody = {
        serviceId: slugId,
        name: servicePayload.name,
        label: servicePayload.label,
        category: servicePayload.category,
        categoryName: servicePayload.categoryName,
        subtitle: servicePayload.subtitle,
        description: servicePayload.description,
        baseFare: servicePayload.baseFare,
        basePrice: servicePayload.basePrice,
        baseKm: servicePayload.baseKm,
        perKmRate: servicePayload.perKmRate,
        pricePerKm: servicePayload.pricePerKm,
        helperRate: servicePayload.helperRate,
        capacityKg: servicePayload.capacityKg,
        capacityLabel: servicePayload.capacityLabel,
        capacity: servicePayload.capacity,
        dimensions: JSON.stringify(servicePayload.dimensions),
        etaLabel: servicePayload.etaLabel,
        iconUrl: finalIconUrl,
        imageUrl: finalIconUrl,
        icon_url: finalIconUrl,
        image_url: finalIconUrl,
        bgTint: servicePayload.bgTint,
        isActive: servicePayload.isActive,
        is_active: servicePayload.isActive,
        customerVisible: servicePayload.isActive,
        showOnCustomerApp: servicePayload.isActive,
        displayOrder: servicePayload.displayOrder,
        order: servicePayload.displayOrder,
        availableCities: JSON.stringify(servicePayload.availableCities)
      };

      console.log(`[Service ${method}] Dispatching to ${endpoint}:`, apiBody);

      const res = await authFetch(endpoint, {
        method,
        body: JSON.stringify(apiBody)
      });

      console.log(`[Service ${method}] Response Status:`, res.status);

      if (res.ok) {
        if (finalIconUrl) {
          setCachedServiceImage(servicePayload, finalIconUrl);
          setCachedServiceImage(slugId, finalIconUrl);
          if (editingService) {
            setCachedServiceImage(editingService, finalIconUrl);
          }
        }

        // Instant UI update (support both edit and create)
        setServices(prev => {
          if (editingService) {
            return prev.map(item => {
              if (item.id === slugId || item.numericId === targetEndpointId || item.serviceId === slugId || item.name === servicePayload.name) {
                return {
                  ...item,
                  ...servicePayload,
                  icon_url: finalIconUrl || servicePayload.icon_url,
                  iconUrl: finalIconUrl || servicePayload.iconUrl,
                  imageUrl: finalIconUrl || servicePayload.imageUrl
                };
              }
              return item;
            });
          } else {
            const newServiceItem = {
              ...servicePayload,
              icon_url: finalIconUrl || servicePayload.icon_url,
              iconUrl: finalIconUrl || servicePayload.iconUrl,
              imageUrl: finalIconUrl || servicePayload.imageUrl
            };
            return [...prev, newServiceItem];
          }
        });

        handleCloseModal();
        await fetchServices();
      } else {
        const errText = await res.text().catch(() => '');
        console.error(`[Service ${method}] Error:`, res.status, errText);
        alert(`Failed to save service (Server status ${res.status}): ${errText || 'Please try again.'}`);
      }
    } catch (err) {
      console.error('Backend service save error:', err);
      alert('Error saving service to backend: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    const targetService = services.find(s => s.id === id || s.serviceId === id || s.numericId === id);
    if (!targetService) return;
    const nextStatus = !targetService.is_active;
    const targetId = targetService?.numericId || targetService?.serviceId || targetService?.id || id;

    // Optimistic UI update
    setServices(prev => prev.map(s => (s.id === id || s.serviceId === id || s.numericId === id) ? { ...s, is_active: nextStatus, isActive: nextStatus } : s));

    try {
      await authFetch(`/api/admin/services/${targetId}/toggle-status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: nextStatus, is_active: nextStatus, status: nextStatus ? 'active' : 'inactive' })
      });
      await fetchServices();
    } catch (e) {
      console.error('Toggle status error:', e);
      await fetchServices();
    }
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    const targetService = serviceToDelete;
    const serviceName = targetService?.name || targetService?.label || targetService?.id;
    const id = targetService?.id;

    const candidateIds = Array.from(new Set([
      targetService?.serviceId,
      targetService?.id,
      targetService?.numericId,
      id
    ])).filter(Boolean);

    // Optimistic UI removal
    setServices(prev => prev.filter(s => s.id !== id && s.serviceId !== id && s.numericId !== targetService?.numericId));

    let deleted = false;
    for (const testId of candidateIds) {
      try {
        const res = await authFetch(`/api/admin/services/${testId}`, { method: 'DELETE' });
        if (res.ok) {
          deleted = true;
          break;
        }
      } catch (e) {
        console.warn(`[Delete] Attempt with ${testId} error:`, e);
      }
    }

    // If /api/admin/services failed, try fallback /api/services/{id}
    if (!deleted) {
      for (const testId of candidateIds) {
        try {
          const res = await authFetch(`/api/services/${testId}`, { method: 'DELETE' });
          if (res.ok) {
            deleted = true;
            break;
          }
        } catch (e) {}
      }
    }

    if (deleted) {
      // Clear persistent image cache for this service
      candidateIds.forEach(k => {
        try { localStorage.removeItem(`porter_srv_img_${k}`); } catch (e) {}
      });
      setServiceToDelete(null);
      setIsDeleting(false);
      await fetchServices();
    } else {
      setIsDeleting(false);
      alert(`Could not delete "${serviceName}" from database. Server rejected the request.`);
      await fetchServices();
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const newServices = [...services];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newServices.length) return;

    const temp = newServices[index];
    newServices[index] = newServices[targetIndex];
    newServices[targetIndex] = temp;

    // Reassign display_order sequentially
    const reordered = newServices.map((s, idx) => ({ ...s, display_order: idx + 1, order: idx + 1 }));
    setServices(reordered);

    try {
      await authFetch('/api/admin/services/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ serviceIds: reordered.map(s => s.id || s.serviceId) })
      });
      await fetchServices();
    } catch (e) {
      console.error('Reorder error:', e);
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

      {/* Error Alert Box */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          color: '#ef4444',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary" onClick={fetchServices} style={{ padding: '4px 10px', fontSize: '12px' }}>
            Retry
          </button>
        </div>
      )}

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
                <option value="vehicle">🚚 Trucks</option>
                <option value="two_wheeler">🛵 2 Wheeler</option>
                <option value="packers">📦 Packers & Movers</option>
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
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>Loading live fleet services from database...</span>
                  </div>
                </td>
              </tr>
            ) : filteredServices.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No services found. Click <strong>'+ Add New Service'</strong> to create one.
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
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: service.bg_tint || '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <img 
                        src={service.icon_url || getFallbackIcon(service)} 
                        alt={service.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} 
                        onError={(e) => { 
                          const fb = getFallbackIcon(service);
                          if (e.target.src !== fb) {
                            e.target.src = fb;
                          }
                        }} 
                      />
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
                      backgroundColor: service.category === 'two_wheeler' ? '#E0F2FE' : service.category === 'packers' ? '#F3E8FF' : '#DCFCE7',
                      color: service.category === 'two_wheeler' ? '#0284C7' : service.category === 'packers' ? '#7E22CE' : '#15803D',
                      fontWeight: '600'
                    }}>
                      {service.category === 'two_wheeler' ? '2 Wheeler' : service.category === 'packers' ? 'Packers & Movers' : 'Trucks'}
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
                    {service.dimensions && (service.dimensions.length || service.dimensions.width || service.dimensions.height) && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {[service.dimensions.length, service.dimensions.width, service.dimensions.height].filter(Boolean).join(' × ')}
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
                  <td style={{ textAlign: 'right', minWidth: '100px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button className="action-btn btn-view" onClick={() => handleOpenModal(service)} title="Edit Service">
                        <Edit size={16} />
                      </button>
                      <button className="action-btn" style={{ color: '#EF4444', backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', cursor: 'pointer' }} onClick={() => setServiceToDelete(service)} title="Delete Service">
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
              noValidate
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
                        <option value="vehicle">🚚 Trucks</option>
                        <option value="two_wheeler">🛵 2 Wheeler</option>
                        <option value="packers">📦 Packers & Movers</option>
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Cargo Bed Dimensions (Optional)</label>
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

                </div>
              )}

              {/* Tab 4: Visuals & City Availability */}
              {modalTab === 'visuals' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                      Upload Service Image / Icon <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-main)', fontSize: '13px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Upload PNG, JPG, WebP, or SVG. Selected file will be uploaded to backend server and stored permanently.</span>
                    </div>
                  </div>

                  {(imagePreview || formData.icon_url) && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', backgroundColor: formData.bg_tint, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <img 
                            src={imagePreview || formData.icon_url || getFallbackIcon(formData)} 
                            alt="Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} 
                            onError={(e) => { 
                              const fb = getFallbackIcon(formData);
                              if (e.target.src !== fb) {
                                e.target.src = fb;
                              }
                            }} 
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>Icon Preview</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {selectedImageFile ? `New file selected: ${selectedImageFile.name}` : 'Rendered with selected Card Accent Tint'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (imagePreview && imagePreview.startsWith('blob:')) {
                            try { URL.revokeObjectURL(imagePreview); } catch (e) {}
                          }
                          setSelectedImageFile(null);
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, icon_url: '' }));
                          setIsImageRemoved(true);
                        }}
                        style={{ padding: '4px 10px', fontSize: '12px', color: '#EF4444', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                      >
                        Remove
                      </button>
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
                      {operationalCities.map(city => (
                        <label key={city} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', padding: '8px 16px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <input
                            type="checkbox"
                            checked={formData.available_cities.includes(city) || formData.available_cities.includes('ALL')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  available_cities: Array.from(new Set([...prev.available_cities, city]))
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  available_cities: prev.available_cities.filter(c => c !== city && c !== 'ALL')
                                }));
                              }
                            }}
                          />
                          <span style={{ fontWeight: '600', color: 'var(--primary)' }}>📍 {city}</span>
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
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                      {isSaving ? 'Saving to Database...' : (editingService ? 'Update Service' : 'Save Service')}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom In-App Delete Confirmation Modal */}
      {serviceToDelete && (
        <div className="modal-backdrop" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { if (!isDeleting) setServiceToDelete(null); }}>
          <div className="modal-container" style={{ maxWidth: '440px', padding: '28px', textAlign: 'center', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={30} />
            </div>
            
            <h3 style={{ fontSize: '19px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
              Delete Service?
            </h3>
            
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete <strong>"{serviceToDelete.name}"</strong>? This will remove this vehicle option from customer apps.
            </p>

            <div style={{ backgroundColor: 'var(--bg-main)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', backgroundColor: serviceToDelete.bg_tint || '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={serviceToDelete.icon_url || getFallbackIcon(serviceToDelete)} alt={serviceToDelete.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{serviceToDelete.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₹{serviceToDelete.base_fare} base • {serviceToDelete.capacity_label || `${serviceToDelete.capacity_kg} Kg`}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn"
                disabled={isDeleting}
                onClick={() => setServiceToDelete(null)}
                style={{ flex: 1, padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-main)', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                disabled={isDeleting}
                onClick={confirmDelete}
                style={{ flex: 1, padding: '10px 16px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
