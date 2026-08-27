import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AppStateContext } from '../../../context/AppState';

export const PackersMoversContext = createContext();

// Default fallback settings aligned with Flow 14
const DEFAULT_APP_SETTINGS = {
  packersMoversEnabled: "true",
  intracityEnabled: "true",
  intercityEnabled: "true",
  onlinePriceEnabled: "true",
  quotePriceEnabled: "true",
  liveTrackingEnabled: "true",
  otpVerificationEnabled: "true",
  reviewsEnabled: "true",
  couponsEnabled: "true",
  rescheduleEnabled: "true",
  cancellationEnabled: "true",
  minimumAdvanceBookingHrs: "4",
  maximumAdvanceBookingDays: "30",
  maintenanceMode: "false",
  supportPhone: "+919999999999",
  supportEmail: "support@porter.com"
};

const DEFAULT_PRICING_RULES = {
  baseFare: 649,
  perKmRate: 28,
  minFare: 1500,
  gstPercentage: 18,
  porterPlatformCutPercent: 5,
  surgeMultiplier: 1.0,
  weekendMultiplier: 1.1,
  nightMoveSurchargePercent: 15
};

// Safe JSON parser helper
const safeJson = async (promise, fallback) => {
  try {
    const res = await promise;
    if (!res || !res.ok) return fallback;
    const data = await res.json();
    return data && (Array.isArray(data) || typeof data === 'object') ? data : fallback;
  } catch {
    return fallback;
  }
};

export const PackersMoversProvider = ({ children }) => {
  const { authFetch } = useContext(AppStateContext);

  // Status flags
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Entity States matching Exact Flow Endpoints
  const [dashboardStats, setDashboardStats] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [withinCityAreas, setWithinCityAreas] = useState([]);
  const [intercityRoutes, setIntercityRoutes] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [packingServices, setPackingServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [labourTiers, setLabourTiers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [pricingRules, setPricingRulesState] = useState(DEFAULT_PRICING_RULES);
  const [ambientServices, setAmbientServices] = useState({
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
  });

  // Operational States
  const [bookings, setBookings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [extraCharges, setExtraCharges] = useState([]);
  const [appSettings, setAppSettingsState] = useState(DEFAULT_APP_SETTINGS);

  // ════════════════════════════════════════════════════════════════════════════
  // 🔵 FLOW 1: Admin Panel Boot (Parallel Configs)
  // ════════════════════════════════════════════════════════════════════════════
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        dashboardRes,
        serviceTypesRes,
        serviceAreasRes,
        routesRes,
        slotsRes,
        itemsRes,
        categoriesRes,
        packingTypesRes,
        vehiclesRes,
        labourRes,
        couponsRes,
        pricingRulesRes,
        bookingsRes,
        teamsRes,
        complaintsRes,
        extraChargesRes,
        settingsRes
      ] = await Promise.all([
        safeJson(authFetch('/api/admin/pm/dashboard'), null),
        safeJson(authFetch('/api/admin/pm/service-types'), []),
        safeJson(authFetch('/api/admin/pm/service-areas'), []),
        safeJson(authFetch('/api/admin/pm/routes'), []),
        safeJson(authFetch('/api/admin/pm/slots'), []),
        safeJson(authFetch('/api/admin/pm/items'), []),
        safeJson(authFetch('/api/admin/pm/item-categories'), []),
        safeJson(authFetch('/api/admin/pm/packing-types'), []),
        safeJson(authFetch('/api/admin/pm/vehicles'), []),
        safeJson(authFetch('/api/admin/pm/labour'), []),
        safeJson(authFetch('/api/admin/pm/coupons'), []),
        safeJson(authFetch('/api/admin/pm/pricing-rules'), DEFAULT_PRICING_RULES),
        safeJson(authFetch('/api/admin/pm/bookings'), []),
        safeJson(authFetch('/api/admin/pm/teams'), []),
        safeJson(authFetch('/api/admin/pm/complaints'), []),
        safeJson(authFetch('/api/admin/pm/bookings/extra-charges?status=PENDING'), []),
        safeJson(authFetch('/api/admin/pm/app-settings'), { settings: DEFAULT_APP_SETTINGS })
      ]);

      setDashboardStats(dashboardRes);
      setServiceTypes(Array.isArray(serviceTypesRes) ? serviceTypesRes : []);
      setWithinCityAreas(Array.isArray(serviceAreasRes) ? serviceAreasRes : []);
      setIntercityRoutes(Array.isArray(routesRes) ? routesRes : []);
      setTimeSlots(Array.isArray(slotsRes) ? slotsRes : []);
      setItems(Array.isArray(itemsRes) ? itemsRes : []);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      setPackingServices(Array.isArray(packingTypesRes) ? packingTypesRes : []);
      setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : []);
      setLabourTiers(Array.isArray(labourRes) ? labourRes : []);
      setCoupons(Array.isArray(couponsRes) ? couponsRes : []);
      setPricingRulesState(pricingRulesRes && typeof pricingRulesRes === 'object' ? pricingRulesRes : DEFAULT_PRICING_RULES);
      setBookings(Array.isArray(bookingsRes) ? bookingsRes : []);
      setTeams(Array.isArray(teamsRes) ? teamsRes : []);
      setComplaints(Array.isArray(complaintsRes) ? complaintsRes : []);
      setExtraCharges(Array.isArray(extraChargesRes) ? extraChargesRes : []);
      
      const resolvedSettings = settingsRes?.settings || settingsRes || DEFAULT_APP_SETTINGS;
      setAppSettingsState(resolvedSettings);
    } catch (err) {
      console.error('[PackersMovers] Error fetching boot endpoints:', err);
      setError('Could not connect to backend Packers & Movers services.');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ════════════════════════════════════════════════════════════════════════════
  // 🔵 FLOW 2 & 3: Admin Prepares & Dispatches Quote
  // ════════════════════════════════════════════════════════════════════════════
  const sendRevisedQuote = async (bookingId, quoteData) => {
    try {
      const payload = {
        quotedAmount: quoteData.totalAmount || quoteData.quotedAmount,
        breakdown: {
          baseFare: quoteData.baseFare || 649,
          laborCharge: quoteData.labourCharge || 600,
          packingCharge: quoteData.packingCharge || 399,
          distanceFare: quoteData.distanceFare || 375,
          gst: quoteData.gst || 138,
          floorHandling: quoteData.floorHandling || 0,
          dismantlingCharge: quoteData.dismantlingCharge || 0,
          discount: quoteData.discount || 0
        },
        quoteNotes: quoteData.quoteNotes || 'Verified by Admin'
      };

      const res = await authFetch(`/api/admin/pm/bookings/${bookingId}/quote`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setBookings(prev => prev.map(b => {
          if (b.id === bookingId || b.bookingId === bookingId) {
            return {
              ...b,
              status: 'QUOTE_SENT',
              pricing: {
                ...(b.pricing || {}),
                totalAmount: payload.quotedAmount,
                pendingAmount: payload.quotedAmount,
                ...payload.breakdown
              }
            };
          }
          return b;
        }));
        return { success: true };
      }
    } catch (e) {
      console.error('[PM] sendRevisedQuote error:', e);
      return { success: false, error: e.message };
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 🔵 FLOW 5: Team Assignment
  // ════════════════════════════════════════════════════════════════════════════
  const assignTeamToBooking = async (bookingId, teamId, vehicleNumber, driverName, driverPhone) => {
    try {
      const assignedTeam = teams.find(t => t.id === teamId);
      const payload = {
        teamId,
        teamLeaderName: assignedTeam?.leaderName || driverName || 'Ramesh Kumar',
        teamLeaderPhone: assignedTeam?.phone || driverPhone || '+919876543210',
        vehicleNumber: vehicleNumber || 'TS 09 AB 1234'
      };

      const res = await authFetch(`/api/admin/pm/bookings/${bookingId}/assign-team`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setBookings(prev => prev.map(b => {
          if (b.id === bookingId || b.bookingId === bookingId) {
            return {
              ...b,
              status: 'TEAM_ASSIGNED',
              team: assignedTeam || { id: teamId, name: payload.teamLeaderName, leaderName: payload.teamLeaderName, phone: payload.teamLeaderPhone },
              vehicle: { ...(b.vehicle || {}), number: payload.vehicleNumber }
            };
          }
          return b;
        }));

        setTeams(prev => prev.map(t => t.id === teamId ? { ...t, isAvailable: false, activeBookingId: bookingId } : t));
        return { success: true };
      }
    } catch (e) {
      console.error('[PM] assignTeamToBooking error:', e);
      return { success: false, error: e.message };
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 🔵 FLOW 6: Move Day Live Tracking & Status Updates
  // ════════════════════════════════════════════════════════════════════════════
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
              label: `Status updated to ${newStatus.replace(/_/g, ' ')}`,
              timestamp: new Date().toLocaleString(),
              done: true
            }];
            return { ...b, status: newStatus, timeline: updatedTimeline };
          }
          return b;
        }));
      }
    } catch (e) {
      console.error('[PM] updateBookingStatus error:', e);
    }
  };

  const getLiveTracking = async (bookingId) => {
    return await safeJson(authFetch(`/api/admin/pm/bookings/${bookingId}/live-tracking`), null);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 🔵 FLOW 7: On-Ground Extra Charges
  // ════════════════════════════════════════════════════════════════════════════
  const approveExtraCharge = async (bookingId, chargeId) => {
    try {
      const res = await authFetch(`/api/admin/pm/bookings/${bookingId}/extra-charges/${chargeId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ adminNote: 'Approved by admin operator' })
      });
      if (res.ok) {
        setExtraCharges(prev => prev.map(c => c.id === chargeId ? { ...c, status: 'APPROVED' } : c));
      }
    } catch (e) {
      console.error('[PM] approveExtraCharge error:', e);
    }
  };

  const rejectExtraCharge = async (bookingId, chargeId, reason) => {
    try {
      const res = await authFetch(`/api/admin/pm/bookings/${bookingId}/extra-charges/${chargeId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ adminNote: reason || 'Rejected by admin' })
      });
      if (res.ok) {
        setExtraCharges(prev => prev.map(c => c.id === chargeId ? { ...c, status: 'REJECTED' } : c));
      }
    } catch (e) {
      console.error('[PM] rejectExtraCharge error:', e);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 🔵 FLOW 8: Cancellation & Refund
  // ════════════════════════════════════════════════════════════════════════════
  const getCancellationFee = async (bookingId) => {
    return await safeJson(authFetch(`/api/admin/pm/bookings/${bookingId}/cancellation-fee`), null);
  };

  const processBookingRefund = async (bookingId, refundAmount, reason) => {
    try {
      const payload = {
        refundAmount: parseFloat(refundAmount) || 0,
        reason: reason || 'Customer cancellation refund'
      };
      const res = await authFetch(`/api/admin/pm/bookings/${bookingId}/refund`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => {
          if (b.id === bookingId || b.bookingId === bookingId) {
            return {
              ...b,
              status: 'REFUNDED',
              pricing: { ...(b.pricing || {}), refundedAmount: payload.refundAmount },
              refundReason: payload.reason
            };
          }
          return b;
        }));
      }
    } catch (e) {
      console.error('[PM] processBookingRefund error:', e);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 🔵 FLOW 9: Inventory Verification
  // ════════════════════════════════════════════════════════════════════════════
  const getBookingInventory = async (bookingId) => {
    return await safeJson(authFetch(`/api/admin/pm/bookings/${bookingId}/inventory`), null);
  };

  const verifyBookingInventory = async (bookingId, notes, verifiedBy) => {
    try {
      const res = await authFetch(`/api/admin/pm/bookings/${bookingId}/inventory/verify`, {
        method: 'POST',
        body: JSON.stringify({ verifiedBy: verifiedBy || 'Admin Operator', notes: notes || 'Verified all items' })
      });
      return res.ok;
    } catch (e) {
      console.error('[PM] verifyBookingInventory error:', e);
      return false;
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 🔵 FLOW 10: Complaints & Resolution
  // ════════════════════════════════════════════════════════════════════════════
  const updateComplaintStatus = async (complaintId, status, resolutionNotes) => {
    try {
      const res = await authFetch(`/api/admin/pm/complaints/${complaintId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: status || 'RESOLVED', resolution: resolutionNotes || 'Resolved by admin' })
      });
      if (res.ok) {
        setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status, resolutionNotes } : c));
      }
    } catch (e) {
      console.error('[PM] updateComplaintStatus error:', e);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 🔵 FLOWS 11–13: Configuration CRUD Endpoints (10 Entity Types)
  // ════════════════════════════════════════════════════════════════════════════

  // 1. Service Types (/api/admin/pm/service-types)
  const addServiceType = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/service-types', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const item = await res.json();
        setServiceTypes(prev => [...prev, item || { ...data, id: `st-${Date.now()}` }]);
      }
    } catch (e) { console.error(e); }
  };
  const updateServiceType = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/service-types/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setServiceTypes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (e) { console.error(e); }
  };
  const deleteServiceType = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/service-types/${id}`, { method: 'DELETE' });
      if (res.ok) setServiceTypes(prev => prev.filter(s => s.id !== id));
    } catch (e) { console.error(e); }
  };

  // 2. Service Areas (/api/admin/pm/service-areas)
  const addWithinCityArea = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/service-areas', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const item = await res.json();
        setWithinCityAreas(prev => [...prev, item || { ...data, id: `area-${Date.now()}` }]);
      }
    } catch (e) { console.error(e); }
  };
  const updateWithinCityArea = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/service-areas/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setWithinCityAreas(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    } catch (e) { console.error(e); }
  };
  const deleteWithinCityArea = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/service-areas/${id}`, { method: 'DELETE' });
      if (res.ok) setWithinCityAreas(prev => prev.filter(a => a.id !== id));
    } catch (e) { console.error(e); }
  };

  // 3. Inter-City Routes (/api/admin/pm/routes)
  const addIntercityRoute = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/routes', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const item = await res.json();
        setIntercityRoutes(prev => [...prev, item || { ...data, id: `rt-${Date.now()}` }]);
      }
    } catch (e) { console.error(e); }
  };
  const updateIntercityRoute = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/routes/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setIntercityRoutes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch (e) { console.error(e); }
  };
  const deleteIntercityRoute = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/routes/${id}`, { method: 'DELETE' });
      if (res.ok) setIntercityRoutes(prev => prev.filter(r => r.id !== id));
    } catch (e) { console.error(e); }
  };

  // 4. Slots (/api/admin/pm/slots)
  const addTimeSlot = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/slots', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const item = await res.json();
        setTimeSlots(prev => [...prev, item || { ...data, id: `slot-${Date.now()}` }]);
      }
    } catch (e) { console.error(e); }
  };
  const updateTimeSlot = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/slots/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setTimeSlots(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (e) { console.error(e); }
  };
  const deleteTimeSlot = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/slots/${id}`, { method: 'DELETE' });
      if (res.ok) setTimeSlots(prev => prev.filter(s => s.id !== id));
    } catch (e) { console.error(e); }
  };

  // 5. Item Categories (/api/admin/pm/item-categories)
  const addCategory = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/item-categories', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const item = await res.json();
        setCategories(prev => [...prev, item || { ...data, id: `cat-${Date.now()}` }]);
      }
    } catch (e) { console.error(e); }
  };
  const updateCategory = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/item-categories/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (e) { console.error(e); }
  };
  const deleteCategory = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/item-categories/${id}`, { method: 'DELETE' });
      if (res.ok) setCategories(prev => prev.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  };

  // 6. Items (/api/admin/pm/items)
  const addItem = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/items', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const item = await res.json();
        setItems(prev => [...prev, item || { ...data, id: `item-${Date.now()}` }]);
      }
    } catch (e) { console.error(e); }
  };
  const updateItem = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/items/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    } catch (e) { console.error(e); }
  };
  const deleteItem = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/items/${id}`, { method: 'DELETE' });
      if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) { console.error(e); }
  };

  // 7. Packing Types (/api/admin/pm/packing-types)
  const updatePackingService = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/packing-types/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setPackingServices(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (e) { console.error(e); }
  };

  // 8. Vehicles (/api/admin/pm/vehicles)
  const addVehicle = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/vehicles', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const item = await res.json();
        setVehicles(prev => [...prev, item || { ...data, id: `veh-${Date.now()}` }]);
      }
    } catch (e) { console.error(e); }
  };
  const updateVehicle = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    } catch (e) { console.error(e); }
  };
  const deleteVehicle = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/vehicles/${id}`, { method: 'DELETE' });
      if (res.ok) setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (e) { console.error(e); }
  };

  // 9. Labour (/api/admin/pm/labour)
  const updateLabourTier = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/labour/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setLabourTiers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    } catch (e) { console.error(e); }
  };

  // 10. Coupons (/api/admin/pm/coupons)
  const addCoupon = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/coupons', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const item = await res.json();
        setCoupons(prev => [...prev, item || { ...data, id: `cpn-${Date.now()}` }]);
      }
    } catch (e) { console.error(e); }
  };
  const updateCoupon = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/coupons/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (e) { console.error(e); }
  };
  const deleteCoupon = async (id) => {
    try {
      const res = await authFetch(`/api/admin/pm/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  };

  // 11. Pricing Rules (/api/admin/pm/pricing-rules)
  const setPricingRules = async (rules) => {
    try {
      const res = await authFetch('/api/admin/pm/pricing-rules', { method: 'PUT', body: JSON.stringify(rules) });
      if (res.ok) setPricingRulesState(rules);
    } catch (e) { console.error(e); }
  };

  const updateAmbientServices = (updates) => {
    setAmbientServices(prev => ({ ...prev, ...updates }));
  };

  // 12. Teams (/api/admin/pm/teams)
  const addTeam = async (data) => {
    try {
      const res = await authFetch('/api/admin/pm/teams', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) {
        const item = await res.json();
        setTeams(prev => [...prev, item || { ...data, id: `team-${Date.now()}` }]);
      }
    } catch (e) { console.error(e); }
  };
  const updateTeam = async (id, updates) => {
    try {
      const res = await authFetch(`/api/admin/pm/teams/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      if (res.ok) setTeams(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (e) { console.error(e); }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 🔵 FLOW 14: Customer App Feature Toggles
  // ════════════════════════════════════════════════════════════════════════════
  const setAppSettings = async (settings) => {
    try {
      const res = await authFetch('/api/admin/pm/app-settings', {
        method: 'PUT',
        body: JSON.stringify({ settings })
      });
      if (res.ok) {
        setAppSettingsState(settings);
      }
    } catch (e) {
      console.error('[PM] setAppSettings error:', e);
    }
  };

  return (
    <PackersMoversContext.Provider value={{
      loading,
      error,
      refetch: fetchAllData,

      // Dashboard
      dashboardStats,

      // Service Types
      serviceTypes,
      addServiceType,
      updateServiceType,
      deleteServiceType,

      // Service Areas & Routes
      withinCityAreas,
      addWithinCityArea,
      updateWithinCityArea,
      deleteWithinCityArea,
      intercityRoutes,
      addIntercityRoute,
      updateIntercityRoute,
      deleteIntercityRoute,

      // Time Slots
      timeSlots,
      addTimeSlot,
      updateTimeSlot,
      deleteTimeSlot,

      // Categories & Catalogue Items
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      items,
      addItem,
      updateItem,
      deleteItem,

      // Packing & Ambient
      packingServices,
      updatePackingService,
      ambientServices,
      updateAmbientServices,

      // Vehicles & Labour
      vehicles,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      labourTiers,
      updateLabourTier,

      // Pricing Rules & Coupons
      pricingRules,
      setPricingRules,
      coupons,
      addCoupon,
      updateCoupon,
      deleteCoupon,

      // Bookings & Operations
      bookings,
      setBookings,
      updateBookingStatus,
      assignTeamToBooking,
      sendRevisedQuote,
      getLiveTracking,
      getCancellationFee,
      processBookingRefund,
      getBookingInventory,
      verifyBookingInventory,

      // Extra Charges
      extraCharges,
      approveExtraCharge,
      rejectExtraCharge,

      // Teams & Complaints
      teams,
      setTeams,
      addTeam,
      updateTeam,
      complaints,
      updateComplaintStatus,

      // App Settings (Flow 14)
      appSettings,
      setAppSettings
    }}>
      {children}
    </PackersMoversContext.Provider>
  );
};
