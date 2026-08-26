import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AppStateContext } from '../../../context/AppState';

export const PackersMoversContext = createContext();

// ─── Default EMPTY states used only when backend returns nothing ────────────
const EMPTY = {
  serviceTypes: [],
  withinCityAreas: [],
  intercityRoutes: [],
  timeSlots: [],
  categories: [],
  items: [],
  packingServices: [],
  ambientServices: {
    dismantlingRatePerItem: 200,
    reassemblyRatePerItem: 250,
    unpackingFixedRate: 600,
    extraLabourRatePerHour: 350,
    groundFloorCharge: 0,
    firstFloorCharge: 100,
    secondFloorCharge: 200,
    thirdFloorCharge: 300,
    fourthPlusFloorCharge: 450,
    liftAvailableDiscountOrFree: 0,
    heavyItemHandlingFee: 400,
    fragileHandlingFee: 300,
    longCarryChargeAbove50m: 350
  },
  vehicles: [],
  labourTiers: [],
  pricingRules: {
    baseFareEnabled: true,
    distanceCalculation: 'google_matrix_km',
    gstPercentage: 18,
    porterPlatformCutPercent: 5,
    minBookingCharge: 2500,
    surgeMultiplier: 1.0,
    weekendMultiplier: 1.1,
    nightMoveSurchargePercent: 15
  },
  coupons: [],
  bookings: [],
  teams: [],
  complaints: [],
  appSettings: {
    enablePackersMovers: true,
    enableWithinCity: true,
    enableBetweenCities: true,
    allowCustomerCustomItems: true,
    allowPhotoUpload: true,
    allowVideoUpload: false,
    enableOnlinePayment: true,
    enableCashOnDelivery: true,
    enablePartialAdvancePayment: true,
    partialAdvancePercentage: 30,
    enableCoupons: true,
    enableRescheduling: true,
    maxRescheduleWindowHours: 24,
    maxReschedulesAllowed: 2,
    rescheduleFee: 300,
    cancellationBeforeAssignmentFee: 0,
    cancellationAfterAssignmentFee: 300,
    cancellationAfterArrivalFee: 600,
    cancellationAfterPackingFee: 1500
  }
};

// ─── Helper: safe JSON from fetch response ──────────────────────────────────
const safeJson = async (promise, fallback) => {
  try {
    const res = await promise;
    if (!res || !res.ok) return fallback;
    const data = await res.json();
    return data ?? fallback;
  } catch {
    return fallback;
  }
};

export const PackersMoversProvider = ({ children }) => {
  const { authFetch } = useContext(AppStateContext);

  // ── Loading state ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Entity states ──────────────────────────────────────────────────────────
  const [serviceTypes, setServiceTypes] = useState([]);
  const [withinCityAreas, setWithinCityAreas] = useState([]);
  const [intercityRoutes, setIntercityRoutes] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [packingServices, setPackingServices] = useState([]);
  const [ambientServices, setAmbientServices] = useState(EMPTY.ambientServices);
  const [vehicles, setVehicles] = useState([]);
  const [labourTiers, setLabourTiers] = useState([]);
  const [pricingRules, setPricingRulesState] = useState(EMPTY.pricingRules);
  const [coupons, setCoupons] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [appSettings, setAppSettingsState] = useState(EMPTY.appSettings);
  const [dashboardStats, setDashboardStats] = useState(null);

  // ── Boot: fetch all configuration data from API ────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        serviceTypesData,
        withinCityAreasData,
        intercityRoutesData,
        timeSlotsData,
        categoriesData,
        itemsData,
        packingServicesData,
        additionalServicesData,
        vehiclesData,
        labourTiersData,
        pricingRulesData,
        couponsData,
        bookingsData,
        teamsData,
        complaintsData,
        appSettingsData,
        dashboardData
      ] = await Promise.all([
        safeJson(authFetch('/api/admin/pm/services'), []),
        safeJson(authFetch('/api/admin/pm/areas/within-city'), []),
        safeJson(authFetch('/api/admin/pm/routes/inter-city'), []),
        safeJson(authFetch('/api/admin/pm/time-slots'), []),
        safeJson(authFetch('/api/admin/pm/categories'), []),
        safeJson(authFetch('/api/admin/pm/items'), []),
        safeJson(authFetch('/api/admin/pm/packing-services'), []),
        safeJson(authFetch('/api/admin/pm/additional-services'), EMPTY.ambientServices),
        safeJson(authFetch('/api/admin/pm/vehicles'), []),
        safeJson(authFetch('/api/admin/pm/labour-tiers'), []),
        safeJson(authFetch('/api/admin/pm/pricing-rules'), EMPTY.pricingRules),
        safeJson(authFetch('/api/admin/pm/coupons'), []),
        safeJson(authFetch('/api/admin/pm/bookings'), []),
        safeJson(authFetch('/api/admin/pm/teams'), []),
        safeJson(authFetch('/api/admin/pm/complaints'), []),
        safeJson(authFetch('/api/admin/pm/app-settings'), EMPTY.appSettings),
        safeJson(authFetch('/api/admin/pm/dashboard/stats'), null)
      ]);

      setServiceTypes(Array.isArray(serviceTypesData) ? serviceTypesData : []);
      setWithinCityAreas(Array.isArray(withinCityAreasData) ? withinCityAreasData : []);
      setIntercityRoutes(Array.isArray(intercityRoutesData) ? intercityRoutesData : []);
      setTimeSlots(Array.isArray(timeSlotsData) ? timeSlotsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setPackingServices(Array.isArray(packingServicesData) ? packingServicesData : []);
      setAmbientServices(additionalServicesData && typeof additionalServicesData === 'object' ? additionalServicesData : EMPTY.ambientServices);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setLabourTiers(Array.isArray(labourTiersData) ? labourTiersData : []);
      setPricingRulesState(pricingRulesData && typeof pricingRulesData === 'object' ? pricingRulesData : EMPTY.pricingRules);
      setCoupons(Array.isArray(couponsData) ? couponsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      setAppSettingsState(appSettingsData && typeof appSettingsData === 'object' ? appSettingsData : EMPTY.appSettings);
      setDashboardStats(dashboardData);
    } catch (err) {
      console.error('[PackersMovers] Failed to load configuration from API:', err);
      setError('Failed to load Packers & Movers data. Please check backend connectivity.');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ════════════════════════════════════════════════════════════════════════════
  // CRUD Actions — each action calls the API, then updates local state on success
  // ════════════════════════════════════════════════════════════════════════════

  // ── Service Types ──────────────────────────────────────────────────────────
  const addServiceType = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/services', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const created = await res.json();
        setServiceTypes(prev => [...prev, created]);
      }
    } catch (e) { console.error('[PM] addServiceType error:', e); }
  };

  const updateServiceType = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/services/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) {
        setServiceTypes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      }
    } catch (e) { console.error('[PM] updateServiceType error:', e); }
  };

  const deleteServiceType = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/services/${id}`, { method: 'DELETE' });
      if (res.ok) setServiceTypes(prev => prev.filter(s => s.id !== id));
    } catch (e) { console.error('[PM] deleteServiceType error:', e); }
  };

  // ── Within-City Areas ──────────────────────────────────────────────────────
  const addWithinCityArea = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/areas/within-city', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const created = await res.json();
        setWithinCityAreas(prev => [...prev, created]);
      }
    } catch (e) { console.error('[PM] addWithinCityArea error:', e); }
  };

  const updateWithinCityArea = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/areas/within-city/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setWithinCityAreas(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    } catch (e) { console.error('[PM] updateWithinCityArea error:', e); }
  };

  const deleteWithinCityArea = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/areas/within-city/${id}`, { method: 'DELETE' });
      if (res.ok) setWithinCityAreas(prev => prev.filter(a => a.id !== id));
    } catch (e) { console.error('[PM] deleteWithinCityArea error:', e); }
  };

  // ── Inter-City Routes ──────────────────────────────────────────────────────
  const addIntercityRoute = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/routes/inter-city', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const created = await res.json();
        setIntercityRoutes(prev => [...prev, created]);
      }
    } catch (e) { console.error('[PM] addIntercityRoute error:', e); }
  };

  const updateIntercityRoute = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/routes/inter-city/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setIntercityRoutes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch (e) { console.error('[PM] updateIntercityRoute error:', e); }
  };

  const deleteIntercityRoute = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/routes/inter-city/${id}`, { method: 'DELETE' });
      if (res.ok) setIntercityRoutes(prev => prev.filter(r => r.id !== id));
    } catch (e) { console.error('[PM] deleteIntercityRoute error:', e); }
  };

  // ── Time Slots ─────────────────────────────────────────────────────────────
  const addTimeSlot = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/time-slots', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const created = await res.json();
        setTimeSlots(prev => [...prev, created]);
      }
    } catch (e) { console.error('[PM] addTimeSlot error:', e); }
  };

  const updateTimeSlot = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/time-slots/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setTimeSlots(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (e) { console.error('[PM] updateTimeSlot error:', e); }
  };

  const deleteTimeSlot = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/time-slots/${id}`, { method: 'DELETE' });
      if (res.ok) setTimeSlots(prev => prev.filter(t => t.id !== id));
    } catch (e) { console.error('[PM] deleteTimeSlot error:', e); }
  };

  // ── Item Categories ────────────────────────────────────────────────────────
  const addCategory = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/categories', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const created = await res.json();
        setCategories(prev => [...prev, created]);
      }
    } catch (e) { console.error('[PM] addCategory error:', e); }
  };

  const updateCategory = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/categories/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (e) { console.error('[PM] updateCategory error:', e); }
  };

  const deleteCategory = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/categories/${id}`, { method: 'DELETE' });
      if (res.ok) setCategories(prev => prev.filter(c => c.id !== id));
    } catch (e) { console.error('[PM] deleteCategory error:', e); }
  };

  // ── Catalogue Items ────────────────────────────────────────────────────────
  const addItem = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/items', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const created = await res.json();
        setItems(prev => [...prev, created]);
      }
    } catch (e) { console.error('[PM] addItem error:', e); }
  };

  const updateItem = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/items/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    } catch (e) { console.error('[PM] updateItem error:', e); }
  };

  const deleteItem = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/items/${id}`, { method: 'DELETE' });
      if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) { console.error('[PM] deleteItem error:', e); }
  };

  // ── Packing Services ───────────────────────────────────────────────────────
  const updatePackingService = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/packing-services/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setPackingServices(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (e) { console.error('[PM] updatePackingService error:', e); }
  };

  // ── Additional Services (floor, stairs, etc.) ──────────────────────────────
  const updateAmbientServices = async (updates) => {
    try {
      const merged = { ...ambientServices, ...updates };
      const res = await authFetch('/api/admin/pm/additional-services', { method: 'PUT', body: JSON.stringify(merged) });
      if (res.ok) setAmbientServices(merged);
    } catch (e) { console.error('[PM] updateAmbientServices error:', e); }
  };

  // ── P&M Vehicles ───────────────────────────────────────────────────────────
  const addVehicle = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/vehicles', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const created = await res.json();
        setVehicles(prev => [...prev, created]);
      }
    } catch (e) { console.error('[PM] addVehicle error:', e); }
  };

  const updateVehicle = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    } catch (e) { console.error('[PM] updateVehicle error:', e); }
  };

  const deleteVehicle = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/vehicles/${id}`, { method: 'DELETE' });
      if (res.ok) setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (e) { console.error('[PM] deleteVehicle error:', e); }
  };

  // ── Labour Tiers ───────────────────────────────────────────────────────────
  const updateLabourTier = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/labour-tiers/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setLabourTiers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    } catch (e) { console.error('[PM] updateLabourTier error:', e); }
  };

  // ── Pricing Rules ──────────────────────────────────────────────────────────
  const setPricingRules = async (rules) => {
    try {
      const res = await authFetch('/api/admin/pm/pricing-rules', { method: 'PUT', body: JSON.stringify(rules) });
      if (res.ok) setPricingRulesState(rules);
    } catch (e) { console.error('[PM] setPricingRules error:', e); }
  };

  // ── Coupons ────────────────────────────────────────────────────────────────
  const addCoupon = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/coupons', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const created = await res.json();
        setCoupons(prev => [...prev, created]);
      }
    } catch (e) { console.error('[PM] addCoupon error:', e); }
  };

  const updateCoupon = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/coupons/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (e) { console.error('[PM] updateCoupon error:', e); }
  };

  const deleteCoupon = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (e) { console.error('[PM] deleteCoupon error:', e); }
  };

  // ── Bookings ───────────────────────────────────────────────────────────────
  const updateBookingStatus = async (bookingId, newStatus, extraNote) => {
    try {
      const res = await authFetch(`/api/admin/pm/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, note: extraNote })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => {
          if (b.id === bookingId || b.bookingId === bookingId) {
            const updatedTimeline = [...(b.timeline || []), {
              status: newStatus,
              label: `Status changed to ${newStatus.replace(/_/g, ' ')}`,
              timestamp: new Date().toLocaleString(),
              done: true
            }];
            return { ...b, status: newStatus, timeline: updatedTimeline };
          }
          return b;
        }));
      }
    } catch (e) { console.error('[PM] updateBookingStatus error:', e); }
  };

  const assignTeamToBooking = async (bookingId, teamId, vehicleNumber, driverName, driverPhone) => {
    try {
      const payload = { teamId, vehicleNumber, driverName, driverPhone };
      const res = await authFetch(`/api/admin/pm/bookings/${bookingId}/assign-team`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const assignedTeam = teams.find(t => t.id === teamId);
        setBookings(prev => prev.map(b => {
          if (b.id === bookingId || b.bookingId === bookingId) {
            return {
              ...b,
              team: assignedTeam || b.team,
              vehicle: { ...(b.vehicle || {}), number: vehicleNumber },
              driver: { name: driverName, phone: driverPhone },
              status: 'TEAM_ASSIGNED'
            };
          }
          return b;
        }));
        setTeams(prev => prev.map(t => t.id === teamId ? { ...t, isAvailable: false, activeBookingId: bookingId } : t));
      }
    } catch (e) { console.error('[PM] assignTeamToBooking error:', e); }
  };

  const sendRevisedQuote = async (bookingId, updatedPricing) => {
    try {
      const res = await authFetch(`/api/admin/pm/bookings/${bookingId}/quote`, {
        method: 'POST',
        body: JSON.stringify(updatedPricing)
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => {
          if (b.id === bookingId || b.bookingId === bookingId) {
            return { ...b, pricing: { ...(b.pricing || {}), ...updatedPricing }, status: 'AWAITING_PAYMENT' };
          }
          return b;
        }));
      }
    } catch (e) { console.error('[PM] sendRevisedQuote error:', e); }
  };

  const processBookingRefund = async (bookingId, refundAmount, reason) => {
    try {
      const res = await authFetch(`/api/admin/pm/bookings/${bookingId}/refund`, {
        method: 'POST',
        body: JSON.stringify({ amount: refundAmount, reason })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => {
          if (b.id === bookingId || b.bookingId === bookingId) {
            return { ...b, pricing: { ...(b.pricing || {}), refundedAmount: refundAmount }, status: 'REFUNDED', refundReason: reason };
          }
          return b;
        }));
      }
    } catch (e) { console.error('[PM] processBookingRefund error:', e); }
  };

  // ── Teams ──────────────────────────────────────────────────────────────────
  const addTeam = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/teams', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const created = await res.json();
        setTeams(prev => [...prev, created]);
      }
    } catch (e) { console.error('[PM] addTeam error:', e); }
  };

  const updateTeam = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/teams/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setTeams(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (e) { console.error('[PM] updateTeam error:', e); }
  };

  // ── Complaints ─────────────────────────────────────────────────────────────
  const updateComplaintStatus = async (id, status, resolutionNotes) => {
    try {
      const res = await authFetch(`/api/admin/pm/complaints/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, resolutionNotes })
      });
      if (res.ok) setComplaints(prev => prev.map(c => c.id === id ? { ...c, status, resolutionNotes: resolutionNotes || c.resolutionNotes } : c));
    } catch (e) { console.error('[PM] updateComplaintStatus error:', e); }
  };

  // ── App Settings ───────────────────────────────────────────────────────────
  const setAppSettings = async (settings) => {
    try {
      const res = await authFetch('/api/admin/pm/app-settings', { method: 'PUT', body: JSON.stringify(settings) });
      if (res.ok) setAppSettingsState(settings);
    } catch (e) { console.error('[PM] setAppSettings error:', e); }
  };

  // ── Context Value ──────────────────────────────────────────────────────────
  return (
    <PackersMoversContext.Provider value={{
      // Status
      loading, error, refetch: fetchAll,

      // Dashboard Stats
      dashboardStats,

      // Service Types
      serviceTypes, addServiceType, updateServiceType, deleteServiceType,

      // Areas & Routes
      withinCityAreas, addWithinCityArea, updateWithinCityArea, deleteWithinCityArea,
      intercityRoutes, addIntercityRoute, updateIntercityRoute, deleteIntercityRoute,

      // Time Slots
      timeSlots, addTimeSlot, updateTimeSlot, deleteTimeSlot,

      // Item Catalogue
      categories, addCategory, updateCategory, deleteCategory,
      items, addItem, updateItem, deleteItem,

      // Packing & Additional Services
      packingServices, updatePackingService,
      ambientServices, updateAmbientServices,

      // Vehicles & Labour
      vehicles, addVehicle, updateVehicle, deleteVehicle,
      labourTiers, updateLabourTier,

      // Pricing
      pricingRules, setPricingRules,

      // Coupons
      coupons, addCoupon, updateCoupon, deleteCoupon,

      // Bookings
      bookings, setBookings, updateBookingStatus, assignTeamToBooking,
      sendRevisedQuote, processBookingRefund,

      // Teams
      teams, setTeams, addTeam, updateTeam,

      // Complaints
      complaints, updateComplaintStatus,

      // App Settings
      appSettings, setAppSettings
    }}>
      {children}
    </PackersMoversContext.Provider>
  );
};
