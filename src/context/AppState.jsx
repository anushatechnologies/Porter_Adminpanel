import React, { createContext, useState, useEffect, useRef } from 'react';

export const AppStateContext = createContext();

// API Base URL Resolver for production (GoDaddy/Domain) and local dev (via Vite proxy)
export const API_BASE_URL = (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : (import.meta.env.VITE_API_BASE_URL || 'https://api.anushaporter.com')
);

export const formatApiUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  const base = API_BASE_URL.replace(/\/+$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return base ? `${base}${path}` : path;
};

export const AppStateProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Auth User
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('porter_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('porter_dark_mode', darkMode);
  }, [darkMode]);

  // One-time cleanup: remove stale fake vehicle category overrides from localStorage
  useEffect(() => {
    const stalePrefix = 'Porter Truck';
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('porter_driver_veh_type_')) {
        const val = localStorage.getItem(key) || '';
        if (val.startsWith(stalePrefix) || val === 'Commercial Vehicle') {
          localStorage.removeItem(key);
        }
      }
    });
  }, []);

  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [cities, setCities] = useState([]);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [settings, setSettings] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [driverLocations, setDriverLocations] = useState({});
  const [banners, setBanners] = useState(() => {
    try {
      const cached = localStorage.getItem('porter_admin_banners');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [walletSettings, setWalletSettings] = useState(null);

  const [loading, setLoading] = useState(true);

  const extractArray = (res) => {
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object') {
      if (Array.isArray(res.items)) return res.items;
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.orders)) return res.orders;
      if (Array.isArray(res.bookings)) return res.bookings;
      if (Array.isArray(res.drivers)) return res.drivers;
      if (Array.isArray(res.vehicles)) return res.vehicles;
      if (Array.isArray(res.customers)) return res.customers;
      if (Array.isArray(res.users)) return res.users;
      if (Array.isArray(res.payouts)) return res.payouts;
      if (Array.isArray(res.tickets)) return res.tickets;
      if (Array.isArray(res.notifications)) return res.notifications;
    }
    return [];
  };

  const mapOrder = (o) => {
    const backendId = o.id || o._id || o.bookingId;
    const displayId = o.bookingId || (o.id ? (String(o.id).startsWith('BK_') || String(o.id).startsWith('ORD-') ? String(o.id) : `BK_${o.id}`) : `BK_${Math.floor(1000000000 + Math.random() * 9000000000)}`);

    let customerName = o.receiverName || o.customer || o.userName || o.userPhone || null;
    if (o.user && typeof o.user === 'object') {
      customerName = o.user.name || o.user.fullName || o.user.phone || customerName;
    }

    let pickup = o.pickupAddress || (o.pickup && typeof o.pickup === 'object' ? (o.pickup.addressLine || o.pickup.address) : (typeof o.pickup === 'string' ? o.pickup : null));
    let drop = o.dropAddress || (o.drop && typeof o.drop === 'object' ? (o.drop.addressLine || o.drop.address) : (typeof o.drop === 'string' ? o.drop : null));

    let driverName = o.driverName || o.driver;
    if (o.driver && typeof o.driver === 'object') {
      driverName = o.driver.name || o.driver.fullName;
    }
    if (typeof driverName === 'string' && (driverName.trim().toLowerCase() === 'unassigned' || driverName.trim() === '')) {
      driverName = null;
    }

    let rawStatus = (o.status || 'pending').toLowerCase();
    let uiStatus = rawStatus;

    if (['completed', 'delivered'].includes(rawStatus)) {
      uiStatus = 'completed';
    } else if (['cancelled', 'rejected'].includes(rawStatus)) {
      uiStatus = 'cancelled';
    } else if (['pickup_started', 'on_way', 'in_transit', 'transit', 'in_progress'].includes(rawStatus)) {
      uiStatus = 'transit';
    } else {
      // If driver is assigned to the order, status is assigned; otherwise pending
      uiStatus = driverName ? 'assigned' : 'pending';
    }

    let driverPhone = o.driverPhone || (o.driver && typeof o.driver === 'object' ? o.driver.phone : null);
    let driverVehicleNumber = o.driverVehicleNumber || (o.driver && typeof o.driver === 'object' ? (o.driver.vehicleNumber || o.driver.vehicleNo) : null);
    let driverEmail = o.driverEmail || (o.driver && typeof o.driver === 'object' ? o.driver.email : null);

    let timelineEvents = Array.isArray(o.timeline) && o.timeline.length > 0 ? o.timeline : [];
    if (timelineEvents.length <= 1) {
      const baseDate = o.createdAt ? new Date(o.createdAt) : new Date();
      const timeStr = baseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      timelineEvents = [{ time: timeStr, text: 'Order Created & Placed by Customer' }];

      if (driverName || ['assigned', 'transit', 'completed'].includes(uiStatus)) {
        const t2 = new Date(baseDate.getTime() + 2 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timelineEvents.push({ time: t2, text: driverName ? `Driver Assigned (${driverName})` : 'Driver Assigned to Delivery' });
      }

      if (['transit', 'completed'].includes(uiStatus)) {
        const t3 = new Date(baseDate.getTime() + 12 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timelineEvents.push({ time: t3, text: 'Goods Picked Up - Vehicle In Transit to Destination' });
      }

      if (uiStatus === 'completed') {
        const t4 = new Date(baseDate.getTime() + 35 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timelineEvents.push({ time: t4, text: 'Order Successfully Delivered & Handed Over' });
      } else if (uiStatus === 'cancelled') {
        const tc = new Date(baseDate.getTime() + 5 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timelineEvents.push({ time: tc, text: 'Order Cancelled' });
      }
    }

    const rawCategory = (o.serviceCategory || o.serviceType || '').toLowerCase();
    const resolvedCategory = rawCategory.includes('pack') || o.houseSize 
      ? 'packers_movers' 
      : (rawCategory.includes('pass') || o.passengerCount || (o.serviceName && o.serviceName.toLowerCase().includes('sedan')) || (o.vehicleCategory && o.vehicleCategory.toLowerCase().includes('cab')) 
          ? 'passenger' 
          : 'goods');

    return {
      ...o,
      backendId: backendId,
      id: displayId,
      bookingId: o.bookingId || displayId,
      bookingNumber: o.bookingNumber || displayId,
      trackingNumber: o.trackingNumber || `TRK-${displayId}`,
      serviceCategory: resolvedCategory,
      serviceType: o.serviceType || (resolvedCategory === 'packers_movers' ? 'PACKERS_MOVERS' : resolvedCategory === 'passenger' ? 'PASSENGER' : 'GOODS'),
      customer: customerName,
      customerName: customerName,
      customerEmail: o.userEmail || o.customerEmail || (o.user && typeof o.user === 'object' ? o.user.email : null),
      customerPhone: o.receiverPhone || o.customerPhone || o.userPhone || (o.user && typeof o.user === 'object' ? o.user.phone : null),
      phone: o.receiverPhone || o.customerPhone || o.userPhone || (o.user && typeof o.user === 'object' ? o.user.phone : null),
      pickup: pickup,
      pickupAddress: pickup,
      drop: drop,
      dropAddress: drop,
      amount: o.amount || o.totalAmount || o.estimatedPrice || 0,
      status: uiStatus,
      rawStatus: rawStatus,
      payment: o.payment || (uiStatus === 'completed' ? 'Paid' : 'Pending'),
      paymentStatus: o.paymentStatus || (uiStatus === 'completed' ? 'PAID' : 'PENDING'),
      paymentMethod: o.paymentMethod || 'UPI',
      driver: driverName || null,
      driverName: driverName || null,
      driverEmail: driverEmail,
      driverPhone: driverPhone,
      driverVehicleNumber: driverVehicleNumber,
      vehicleNumber: o.vehicleNumber || driverVehicleNumber,
      vehicleCategory: o.vehicleCategory || o.vehicleCategoryCode || o.vehicleType || o.serviceName,
      serviceName: o.serviceName || o.vehicleName || o.vehicleType || (resolvedCategory === 'passenger' ? 'Sedan Cab' : resolvedCategory === 'packers_movers' ? 'House Shifting' : 'Commercial Vehicle'),
      deliveryOtp: o.deliveryOtp || o.otp || o.pickupOtp || null,
      startOtp: o.startOtp || o.otp || o.pickupOtp || o.deliveryOtp || null,
      passengerCount: o.passengerCount || (resolvedCategory === 'passenger' ? 2 : null),
      houseSize: o.houseSize || null,
      scheduledDate: o.scheduledDate || null,
      scheduledSlot: o.scheduledSlot || null,
      heavyItems: o.heavyItems || null,
      distanceKm: o.distanceKm || null,
      tripStatus: o.tripStatus || rawStatus,
      createdAt: o.createdAt || o.scheduledDate || new Date().toISOString(),
      timeline: timelineEvents
    };
  };

  const loginAdminBackend = async () => {
    try {
      const targetUrl = formatApiUrl('/api/auth/login');
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@porter.com', password: 'password123' })
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.token) {
            localStorage.setItem('porter_admin_token', data.token);
            if (data.user) {
              setUser(data.user);
              localStorage.setItem('porter_admin_user', JSON.stringify(data.user));
            }
            return data.token;
          }
        }
      }
    } catch (e) {
      console.warn('[Admin Login] Backend login attempt error:', e);
    }
    return null;
  };

  // Auth-aware Fetch Helper with real backend token & 401 auto-relogin
  const authFetch = async (url, options = {}) => {
    let token = localStorage.getItem('porter_admin_token');

    // If token is missing or is old dummy string, perform real login
    if (!token || token === 'admin_session_token_active') {
      token = await loginAdminBackend();
    }

    const targetUrl = formatApiUrl(url);
    const headers = {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      let res = await fetch(targetUrl, { ...options, headers });
      if (res.status === 401) {
        // Clear invalid token & attempt fresh login once
        localStorage.removeItem('porter_admin_token');
        const freshToken = await loginAdminBackend();
        if (freshToken) {
          const retryHeaders = {
            ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
            'Authorization': `Bearer ${freshToken}`,
            ...(options.headers || {})
          };
          res = await fetch(targetUrl, { ...options, headers: retryHeaders });
        }
        if (res.status === 401) {
          localStorage.removeItem('porter_admin_token');
          localStorage.removeItem('porter_admin_user');
          setUser(null);
        }
      }
      return res;
    } catch (e) {
      console.error(`[authFetch] Network fetch error for ${targetUrl}:`, e);
      throw e;
    }
  };

  // Fetch all initial data from backend API
  const fetchAllData = async () => {
    try {
      const [
        ordersRes, bookingsRes, driversRes, payoutsRes, ticketsRes, 
        notificationsRes, customersRes, vehiclesRes, franchisesRes, 
        settingsRes, usersRes, bannersRes, metricsRes
      ] = await Promise.all([
        authFetch('/api/admin/orders').then(res => res && res.ok ? res.json() : authFetch('/api/orders').then(r => r.json())).catch(() => []),
        authFetch('/api/bookings').then(res => res.json()).catch(() => []),
        authFetch('/api/admin/drivers').then(res => res && res.ok ? res.json() : authFetch('/api/drivers').then(r => r.json())).catch(() => []),
        authFetch('/api/payouts').then(res => res.json()).catch(() => []),
        authFetch('/api/tickets').then(res => res.json()).catch(() => []),
        authFetch('/api/notifications').then(res => res.json()).catch(() => []),
        authFetch('/api/admin/customers').then(res => res && res.ok ? res.json() : authFetch('/api/customers').then(r => r.json())).catch(() => []),
        authFetch('/api/admin/vehicle-types').then(res => res && res.ok ? res.json() : authFetch('/api/vehicles').then(r => r.json())).catch(() => []),
        authFetch('/api/franchises').then(res => res.json()).catch(() => []),
        authFetch('/api/settings').then(res => res.json()).catch(() => ({})),
        authFetch('/api/users').then(res => res.json()).catch(() => []),
        authFetch('/api/admin/banners').then(res => res && res.ok ? res.json() : authFetch('/api/banners').then(r => r.json())).catch(() => []),
        authFetch('/api/admin/metrics').then(res => res.json()).catch(() => null)
      ]);

      // Resolve operational cities from /api/franchises and /api/settings
      const dynamicCitiesFromFranchises = Array.isArray(franchisesRes)
        ? franchisesRes.map(f => f.city || f.location || f.name).filter(Boolean)
        : [];
      const dynamicCitiesFromSettings = settingsRes?.coverageCities
        ? String(settingsRes.coverageCities).split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const mergedCities = Array.from(new Set(['Hyderabad', ...dynamicCitiesFromFranchises, ...dynamicCitiesFromSettings]));
      setCities(mergedCities.map(c => typeof c === 'string' ? { id: c, name: c, active: true } : c));

      if (metricsRes && metricsRes.success !== false) {
        setAdminMetrics(metricsRes);
      }

      let rawOrdersList = extractArray(ordersRes).concat(extractArray(bookingsRes));

      const uniqueRawOrdersMap = new Map();
      rawOrdersList.forEach(item => {
        const key = item.id || item.bookingId || item._id;
        if (key && !uniqueRawOrdersMap.has(key)) {
          uniqueRawOrdersMap.set(key, item);
        }
      });
      const uniqueRawOrders = Array.from(uniqueRawOrdersMap.values());
      const mappedOrders = uniqueRawOrders.map(mapOrder);

      mappedOrders.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        if (timeA && timeB && timeA !== timeB) return timeB - timeA;
        return (b.backendId || b.id || 0) - (a.backendId || a.id || 0);
      });

      let rawDrivers = extractArray(driversRes);

      // Keep all drivers from database uniquely by ID
      const seenDriverIds = new Set();
      const uniqueRawDrivers = rawDrivers.filter(d => {
        const dId = String(d.id || d.driverId || '');
        if (!dId) return true;
        if (seenDriverIds.has(dId)) return false;
        seenDriverIds.add(dId);
        return true;
      });

      const rawCustomers = extractArray(customersRes);
      const rawVehicles = extractArray(vehiclesRes);
      const rawFranchises = extractArray(franchisesRes);
      const userList = extractArray(usersRes);

      const cleanDocUrl = (url) => {
        if (!url || typeof url !== 'string') return null;
        let str = url.trim();
        const lastHttps = str.lastIndexOf('https://');
        if (lastHttps > 0) return str.substring(lastHttps);
        const lastHttp = str.lastIndexOf('http://');
        if (lastHttp > 0) return str.substring(lastHttp);
        return str;
      };

      const mappedDrivers = uniqueRawDrivers.map(d => {
        const isKycVerified = d.kyc === 'verified' || d.kycStatus === 'verified' || d.verificationStatus === 'verified';
        const isKycRejected = d.kyc === 'rejected' || d.kycStatus === 'rejected';

        const docs = {
          verified: Boolean(isKycVerified),
          license: isKycVerified ? 'Verified' : isKycRejected ? 'Rejected' : 'Pending',
          licenseUrl: cleanDocUrl(d.licenseUri || d.licenseUrl || d.license),
          rc: isKycVerified ? 'Verified' : isKycRejected ? 'Rejected' : 'Pending',
          rcUrl: cleanDocUrl(d.rcUri || d.rcUrl || d.rc),
          aadhaarUrl: cleanDocUrl(d.aadhaarUri || d.aadhaarUrl || d.aadhaar),
          bankPassbookUrl: cleanDocUrl(d.bankPassbookUri || d.bankPassbookUrl || d.bankPassbook),
          profilePhotoUrl: cleanDocUrl(d.profilePhotoUri || d.profilePhotoUrl || d.avatar),
        };

        let rawStatus = (d.status || 'offline').toLowerCase();
        let uiStatus = 'offline';
        if (isKycRejected) {
          uiStatus = 'rejected';
        } else if (isKycVerified) {
          uiStatus = rawStatus === 'online' ? 'online' : 'offline';
        } else if (rawStatus === 'pending' || rawStatus === 'unverified' || d.kyc === 'pending' || d.kyc === 'unverified') {
          uiStatus = 'verification_requests';
        } else if (rawStatus === 'online') {
          uiStatus = 'online';
        } else {
          uiStatus = 'offline';
        }

        const dEmail = (d.email || '').trim().toLowerCase();
        const dName = (d.name || '').trim().toLowerCase();

        const driverCompletedOrders = mappedOrders.filter(o => {
          if (o.status !== 'completed') return false;
          const oEmail = (o.driverEmail || '').trim().toLowerCase();
          const oName = (o.driver || '').trim().toLowerCase();
          return (dEmail && oEmail === dEmail) || (dName && oName === dName);
        });

        const cleanKey = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const dKey = cleanKey(d.name);
        const dPlateKey = cleanKey(d.vehicleNumber || d.vehicleNo);

        const matchedVeh = rawVehicles.find(v => {
          const vPlateKey = cleanKey(v.plate || v.vehicleNumber);
          // Plate is the most reliable identifier — use exact match only
          if (vPlateKey && dPlateKey && vPlateKey === dPlateKey) return true;
          // Fallback to owner name only when driver has no plate at all
          if (!dPlateKey) {
            const vOwnerKey = cleanKey(v.owner || v.ownerName);
            return vOwnerKey && (vOwnerKey === dKey || dKey.includes(vOwnerKey) || vOwnerKey.includes(dKey));
          }
          return false;
        });

        // Check if driver completed orders for a specific service
        const matchedOrderService = driverCompletedOrders.find(o => o.serviceName)?.serviceName;

        // Check persistent override from admin
        const localOverride = localStorage.getItem(`porter_driver_veh_type_${d.id || d.driverId}`);

        // Normalize backend vehicle type strings to display labels
        const normalizeVehicleType = (raw) => {
          if (!raw) return null;
          const r = String(raw).toLowerCase().replace(/[^a-z0-9]/g, '');
          if (r === 'vehicle' || r === 'unregistered' || r === 'na' || !r) return null;
          if (['scooter','scooty','bike','bikecourier','2wheeler','twowheeler','motorcycle','courier','moped'].some(k => r.includes(k))) {
            return '2 Wheeler';
          }
          if (['3wheeler','threewheeler','auto','ape','champion','loader','tuk'].some(k => r.includes(k))) {
            return '3 Wheeler (500kg)';
          }
          if (['tataace','superace','chotahathi','ace','minitruck','bolero','750'].some(k => r.includes(k))) {
            return 'Tata Ace (750kg)';
          }
          if (['pickup8ft','pickup','8ft','1200','dost'].some(k => r.includes(k))) {
            return 'Pickup 8ft (1200kg)';
          }
          if (['tata407','407','2500','eicher','heavytruck','truck'].some(k => r.includes(k))) {
            return 'Trucks';
          }
          return raw;
        };

        const rawVehicleType = localOverride
          || normalizeVehicleType(d.vehicle || d.vehicleType || d.vehicle_type)
          || normalizeVehicleType(matchedVeh?.type || matchedVeh?.model)
          || normalizeVehicleType(matchedOrderService)
          || null;

        const realVehicleType = rawVehicleType || null;

        let driverPhone = d.phone || d.phoneNumber || '';
        const phoneInNameMatch = String(d.name || '').match(/\b(\d{10})\b/);
        if (phoneInNameMatch) {
          driverPhone = phoneInNameMatch[1];
        }

        let driverRealName = null;
        if (d.name && !d.name.startsWith('Driver #') && !/^\d{7,15}$/.test(d.name.replace(/[\s+\-()]/g, '')) && /[a-zA-Z]/.test(d.name)) {
          driverRealName = d.name.trim();
        } else if (d.fullName && !d.fullName.startsWith('Driver #') && !/^\d{7,15}$/.test(d.fullName.replace(/[\s+\-()]/g, '')) && /[a-zA-Z]/.test(d.fullName)) {
          driverRealName = d.fullName.trim();
        }

        let profilePhoto = d.profilePhotoUri || d.avatar || null;
        if (profilePhoto && typeof profilePhoto === 'string' && profilePhoto.startsWith('/') && !profilePhoto.startsWith('//')) {
          profilePhoto = `https://api.anushaporter.com${profilePhoto}`;
        }

        const dId = d.id || d.driverId;
        const savedWallet = localStorage.getItem(`porter_driver_wallet_${dId}`);
        const walletBalance = d.walletBalance != null 
          ? Number(d.walletBalance)
          : (d.wallet_balance != null 
            ? Number(d.wallet_balance)
            : (d.wallet != null 
              ? Number(d.wallet) 
              : (savedWallet != null ? parseFloat(savedWallet) : 0)));

        const realPlate = (d.vehicleNumber && d.vehicleNumber.trim()) || (d.vehicleNo && d.vehicleNo.trim()) || (matchedVeh?.plate && matchedVeh.plate.trim()) || null;

        return {
          ...d,
          id: d.id || d.driverId || `DRV-${Math.floor(100 + Math.random() * 900)}`,
          driverId: d.driverId || d.id,
          name: driverRealName,
          phone: driverPhone || 'N/A',
          vehicleNo: realPlate,
          vehicleType: realVehicleType,
          vehicle: realVehicleType,
          profilePhotoUri: profilePhoto,
          trips: driverCompletedOrders.length,
          earnings: driverCompletedOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
          wallet: walletBalance,
          walletBalance: walletBalance,
          rating: d.rating ? parseFloat(d.rating) : (driverCompletedOrders.length > 0 ? 5.0 : 0),
          status: uiStatus,
          docs: docs
        };
      });

      setOrders(mappedOrders);
      setDrivers(mappedDrivers);
      setPayouts(extractArray(payoutsRes));
      setTickets(extractArray(ticketsRes));
      setNotifications(extractArray(notificationsRes));
      setUsersList(userList);

      const customerUsers = userList.filter(u => {
        const r = (u.role || '').toLowerCase();
        return r === 'customer' || r === 'user' || r === 'client' || (!u.role && !u.company);
      });
      const baseCustomers = rawCustomers.length > 0 ? rawCustomers : customerUsers;

      const isRealHumanName = (str) => {
        if (!str || typeof str !== 'string') return false;
        const trimmed = str.trim();
        if (!trimmed) return false;
        const lower = trimmed.toLowerCase();
        if (lower === 'customer' || lower === 'null' || lower === 'n/a' || lower === 'undefined' || lower === 'user' || lower === 'client') return false;
        // If string consists only of digits / phone symbols (+, -, spaces)
        const digitsOnly = trimmed.replace(/[\s+\-()]/g, '');
        if (/^\d{7,15}$/.test(digitsOnly)) return false;
        // Must contain at least one letter
        if (!/[a-zA-Z]/.test(trimmed)) return false;
        return true;
      };

      const mappedCustomers = baseCustomers.map((c, idx) => {
        const cEmail = (c.email || '').trim().toLowerCase();
        
        const customerOrders = mappedOrders.filter(o => 
          (cEmail && (o.customerEmail || '').toLowerCase() === cEmail)
        );

        let realName = null;
        if (isRealHumanName(c.name)) {
          realName = c.name.trim();
        } else if (isRealHumanName(c.fullName)) {
          realName = c.fullName.trim();
        }

        if (!realName && customerOrders.length > 0) {
          const latestOrder = customerOrders[0];
          if (isRealHumanName(latestOrder.customer)) {
            realName = latestOrder.customer.trim();
          } else if (isRealHumanName(latestOrder.customerName)) {
            realName = latestOrder.customerName.trim();
          }
        }

        let realPhone = c.phone || c.phoneNumber || '';
        // If phone is missing or default dummy, and c.name has the phone number
        if ((!realPhone || realPhone === '9876543210' || realPhone === 'N/A') && c.name && /^\d{10}$/.test(c.name.trim())) {
          realPhone = c.name.trim();
        }
        if ((!realPhone || realPhone === '9876543210') && customerOrders.length > 0) {
          const latestOrder = customerOrders[0];
          if (latestOrder.customerPhone && latestOrder.customerPhone !== 'N/A' && latestOrder.customerPhone !== '9876543210') {
            realPhone = latestOrder.customerPhone;
          }
        }

        const avatarSeed = realName || (c.email && !c.email.includes('anushaporter.com') ? c.email : `User-${c.id || idx + 1}`);

        return {
          id: c.id || idx + 1,
          name: realName, // null if no real human name is saved in database
          email: c.email || 'N/A',
          phone: realPhone || 'N/A',
          wallet: c.walletBalance || c.wallet || 0,
          totalOrders: customerOrders.length > 0 ? customerOrders.length : (c.totalOrders || 0),
          avatar: c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}`
        };
      });

      setCustomers(mappedCustomers);

      // Dynamically map vehicles 1:1 for every driver
      const mappedVehicles = mappedDrivers.map((d, idx) => {
        const existingVeh = rawVehicles.find(v => (v.owner || v.ownerName) === d.name || (v.plate || v.vehicleNumber) === d.vehicleNo);
        return {
          id: existingVeh?.id || d.id || `V-${idx + 1}`,
          model: existingVeh?.model || existingVeh?.name || d.vehicleType || d.vehicle || null,
          plate: existingVeh?.plate || d.vehicleNo || null,
          type: existingVeh?.type || d.vehicleType || d.vehicle || null,
          capacity: existingVeh?.capacity || null,
          owner: d.name || null,
          trips: d.trips || 0,
          status: d.docs?.verified ? 'Verified' : (d.kyc === 'rejected' ? 'Rejected' : 'Pending Verification')
        };
      });

      setVehicles(mappedVehicles);
      setFranchises(rawFranchises);
      setSettings(settingsRes || {});
      setPayouts(extractArray(payoutsRes));
      setTickets(extractArray(ticketsRes));
      setNotifications(extractArray(notificationsRes));
      setUsersList(userList);

      const rawBanners = extractArray(bannersRes)
        .filter(b => b && b.imageUrl && !b.imageUrl.includes('iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB'))
        .map(b => {
          const numId = b.bannerId || (typeof b.id === 'number' ? b.id : parseInt(String(b.id || '').replace(/[^0-9]/g, ''), 10) || null);
          return {
            ...b,
            id: b.id || (numId ? `BNR-${numId}` : `BNR-${Math.floor(1000 + Math.random() * 9000)}`),
            bannerId: numId,
            title: b.title || 'Promotional Banner',
            imageUrl: b.imageUrl,
            targetAction: b.targetAction || 'PACKERS_MOVERS',
            targetValue: b.targetValue || '',
            isActive: b.isActive !== undefined ? Boolean(b.isActive) : (b.active !== undefined ? Boolean(b.active) : true),
            active: b.isActive !== undefined ? Boolean(b.isActive) : (b.active !== undefined ? Boolean(b.active) : true)
          };
        });

      if (rawBanners.length > 0) {
        setBanners(rawBanners);
        try { localStorage.setItem('porter_admin_banners', JSON.stringify(rawBanners)); } catch (e) {}
      } else {
        try {
          const cached = localStorage.getItem('porter_admin_banners');
          if (cached) setBanners(JSON.parse(cached));
        } catch (e) {}
      }
    } catch (error) {
      console.error('Error fetching backend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const ensureAuthToken = async () => {
    let token = localStorage.getItem('porter_admin_token');
    if (!token) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@porter.com', password: 'password123' })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            token = data.token;
            localStorage.setItem('porter_admin_token', token);
            if (data.user) {
              setUser(data.user);
              localStorage.setItem('porter_admin_user', JSON.stringify(data.user));
            }
          }
        }
      } catch (e) {
        console.warn('Auto-authentication check:', e);
      }
    }
    return token;
  };

  const isBackendLiveRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      await ensureAuthToken();
      const live = await fetchAllData();
      if (live) {
        isBackendLiveRef.current = true;
      }
    };
    init();
    
    // Background polling interval - only runs if backend is live and responding with 200 OK
    const pollInterval = setInterval(async () => {
      if (!isBackendLiveRef.current || !localStorage.getItem('porter_admin_token')) return;
      try {
        const [ordersRes, bookingsRes, driversRes, vehiclesRes] = await Promise.all([
          authFetch('/api/orders').then(res => res && res.ok ? res.json() : null).catch(() => null),
          authFetch('/api/bookings').then(res => res && res.ok ? res.json() : null).catch(() => null),
          authFetch('/api/drivers').then(res => res && res.ok ? res.json() : null).catch(() => null),
          authFetch('/api/vehicles').then(res => res && res.ok ? res.json() : null).catch(() => null)
        ]);

        if (!ordersRes && !bookingsRes && !driversRes) {
          isBackendLiveRef.current = false;
          return;
        }

        const rawOrdersList = extractArray(ordersRes).concat(extractArray(bookingsRes));
        if (rawOrdersList.length > 0) {
          const uniqueRawOrdersMap = new Map();
          rawOrdersList.forEach(item => {
            const key = item.id || item.bookingId || item._id;
            if (key && !uniqueRawOrdersMap.has(key)) {
              uniqueRawOrdersMap.set(key, item);
            }
          });
          const mappedOrders = Array.from(uniqueRawOrdersMap.values()).map(mapOrder);
          mappedOrders.sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime();
            const timeB = new Date(b.createdAt || 0).getTime();
            if (timeA && timeB && timeA !== timeB) return timeB - timeA;
            return (b.backendId || b.id || 0) - (a.backendId || a.id || 0);
          });
          setOrders(mappedOrders);
        }

        const rawDrivers = extractArray(driversRes);
        const rawVehicles = extractArray(vehiclesRes);

        if (rawDrivers.length > 0) {
          const seenDriverIds = new Set();
          const uniqueRawDrivers = rawDrivers.filter(d => {
            const dId = String(d.id || d.driverId || '');
            if (!dId) return true;
            if (seenDriverIds.has(dId)) return false;
            seenDriverIds.add(dId);
            return true;
          });

          const mappedDrivers = uniqueRawDrivers.map(d => {
            const isKycVerified = d.kyc === 'verified' || d.kycStatus === 'verified' || d.verificationStatus === 'verified';
            const isKycRejected = d.kyc === 'rejected' || d.kycStatus === 'rejected';

            const docs = {
              verified: Boolean(isKycVerified),
              license: isKycVerified ? 'Verified' : isKycRejected ? 'Rejected' : 'Pending',
              licenseUrl: d.licenseUri || null,
              rc: isKycVerified ? 'Verified' : isKycRejected ? 'Rejected' : 'Pending',
              rcUrl: d.rcUri || null,
              aadhaarUrl: d.aadhaarUri || null,
              bankPassbookUrl: d.bankPassbookUri || null,
              profilePhotoUrl: d.profilePhotoUri || null,
            };

            let rawStatus = (d.status || 'offline').toLowerCase();
            let uiStatus = 'offline';
            if (isKycRejected) {
              uiStatus = 'rejected';
            } else if (isKycVerified) {
              uiStatus = rawStatus === 'online' ? 'online' : 'offline';
            } else if (rawStatus === 'pending' || rawStatus === 'unverified' || d.kyc === 'pending' || d.kyc === 'unverified') {
              uiStatus = 'verification_requests';
            } else if (rawStatus === 'online') {
              uiStatus = 'online';
            } else {
              uiStatus = 'offline';
            }

            const rawVehicleType = (() => {
              const r = (d.vehicle || d.vehicleType || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              if (!r || r === 'vehicle' || r === 'commercialvehicle') return null;
              if (['scooter','bike','2wheeler','twowheeler','motorcycle','moped'].some(k => r.includes(k))) return '2 Wheeler';
              if (['3wheeler','auto','ape','loader'].some(k => r.includes(k))) return '3 Wheeler (500kg)';
              if (['tataace','ace','minitruck','bolero','750'].some(k => r.includes(k))) return 'Tata Ace (750kg)';
              if (['pickup','8ft','1200','dost'].some(k => r.includes(k))) return 'Pickup 8ft (1200kg)';
              if (['407','2500','eicher','truck'].some(k => r.includes(k))) return 'Trucks';
              return d.vehicle || d.vehicleType || null;
            })();

            const realPlate = (d.vehicleNumber && d.vehicleNumber.trim()) || (d.vehicleNo && d.vehicleNo.trim()) || null;

            let driverRealName = null;
            if (d.name && !d.name.startsWith('Driver #') && !/^\d{7,15}$/.test(d.name.replace(/[\s+\-()]/g, '')) && /[a-zA-Z]/.test(d.name)) {
              driverRealName = d.name.trim();
            }

            return {
              ...d,
              id: d.id || d.driverId,
              driverId: d.driverId || d.id,
              name: driverRealName,
              phone: d.phone || d.phoneNumber || 'N/A',
              vehicleNo: realPlate,
              vehicleType: rawVehicleType,
              vehicle: rawVehicleType,
              rating: d.rating ? parseFloat(d.rating) : 0,
              status: uiStatus,
              docs: docs
            };
          });

          setDrivers(mappedDrivers);

          // Dynamically map vehicles 1:1 for every driver
          const mappedVehicles = mappedDrivers.map((d, idx) => {
            const existingVeh = rawVehicles.find(v => (v.owner || v.ownerName) === d.name || (v.plate || v.vehicleNumber) === d.vehicleNo);
            return {
              id: existingVeh?.id || `V-${idx + 1}`,
              model: existingVeh?.model || existingVeh?.name || `${d.vehicleType || d.vehicle || 'Commercial'} Model`,
              plate: existingVeh?.plate || d.vehicleNo || null,
              type: existingVeh?.type || d.vehicleType || d.vehicle || null,
              capacity: existingVeh?.capacity || '500 kg',
              owner: d.name,
              trips: d.trips || 0,
              status: d.docs?.verified ? 'Verified' : (d.kyc === 'rejected' ? 'Rejected' : 'Pending Verification')
            };
          });

          setVehicles(mappedVehicles);
        }
      } catch (err) {
        isBackendLiveRef.current = false;
      }
    }, 15000);

    return () => clearInterval(pollInterval);
  }, []);

  // Real-Time WebSocket Telemetry Stream Listener
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;
    let retryCount = 0;
    const maxRetries = 5;

    const connectWebSocket = () => {
      // Only connect to WebSocket if explicitly on HTTPS production domain or backend WebSocket enabled
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      if (!isHttps && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // Skip local localhost:8080 WS connection attempt when local Spring Boot WS server is offline
        return;
      }

      try {
        const token = localStorage.getItem('porter_admin_token');
        const query = token ? `?token=${encodeURIComponent(token)}` : '';
        const wsUrl = isHttps 
          ? `wss://api.anushaporter.com/ws${query}`
          : `ws://${window.location.hostname}:8080/ws${query}`;

        ws = new WebSocket(wsUrl);

        let heartbeatTimer = null;

        ws.onopen = () => {
          retryCount = 0;
          console.log('[WebSocket Telemetry] Connected to real-time stream:', wsUrl.split('?')[0]);
          heartbeatTimer = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ event: 'ping' }));
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            const eventName = payload.event || payload.type;
            const data = payload.data || payload;

            if (eventName === 'pong') return;

            if (eventName === 'driver:telemetry' || data.driverId) {
              const driverId = data.driverId || data.id;
              const loc = data.location || data;
              if (driverId && loc && typeof loc === 'object') {
                const latVal = typeof loc.lat === 'number' ? loc.lat : (loc.lat ? parseFloat(loc.lat) : (typeof loc.x === 'number' ? loc.x : parseFloat(loc.x || 17.4483)));
                const lngVal = typeof loc.lng === 'number' ? loc.lng : (loc.lng ? parseFloat(loc.lng) : (typeof loc.y === 'number' ? loc.y : parseFloat(loc.y || 78.3915)));
                setDriverLocations(prev => ({
                  ...prev,
                  [driverId]: {
                    lat: latVal,
                    lng: lngVal,
                    x: latVal,
                    y: lngVal,
                    speed: loc.speed || 0,
                    angle: loc.angle || loc.heading || 0,
                    updatedAt: data.timestamp || loc.updatedAt || new Date().toISOString()
                  }
                }));
              }
            } else if (eventName === 'order:update') {
              const orderId = data.orderId || data.id;
              const newStatus = data.status;
              if (orderId && newStatus) {
                const s = String(newStatus).toLowerCase();
                const normalized = ['delivered', 'finished', 'done', 'success'].includes(s) ? 'completed' : newStatus;
                setOrders(prev => prev.map(o => (o.backendId === orderId || o.id === orderId) ? { ...o, status: normalized } : o));
              }
            }
          } catch (e) {
            // Ignore malformed WS pings
          }
        };

        ws.onerror = () => {
          retryCount++;
        };

        ws.onclose = (event) => {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
          // If connection was closed due to auth failure (1008 or 4401) or max retries reached, do not retry
          if (event && (event.code === 1008 || event.code === 4401 || event.code === 4001)) {
            return;
          }
          if (retryCount < 2) {
            reconnectTimeout = setTimeout(connectWebSocket, 30000);
          }
        };
      } catch (err) {
        retryCount++;
      }
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  useEffect(() => {
    if (drivers.length > 0) {
      const locs = {};
      drivers.forEach(d => {
        if (d.location && typeof d.location === 'object') {
          try {
            const latVal = typeof d.location.lat === 'number' ? d.location.lat : parseFloat(d.location.lat || d.location.x || 17.4483);
            const lngVal = typeof d.location.lng === 'number' ? d.location.lng : parseFloat(d.location.lng || d.location.y || 78.3915);
            locs[d.id] = {
              lat: latVal,
              lng: lngVal,
              x: latVal,
              y: lngVal,
              speed: d.location.speed || 0,
              angle: d.location.angle || d.location.heading || 0
            };
          } catch (e) {}
        }
      });
      setDriverLocations(prev => ({ ...locs, ...prev }));
    }
  }, [drivers]);

  useEffect(() => {
    const loggedUser = localStorage.getItem('porter_admin_user');
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    }
  }, []);

  const bypassLogin = () => {
    const demoUser = {
      name: "Demo Operator",
      email: "admin@anushaporter.com",
      role: "Super Admin",
      id: "OP-999"
    };
    setUser(demoUser);
    localStorage.setItem('porter_admin_token', 'demo-bypass-token-12345');
    localStorage.setItem('porter_admin_user', JSON.stringify(demoUser));
    fetchAllData();
  };

  const handleLogin = async (usernameOrEmail, password) => {
    try {
      const targetUrl = formatApiUrl('/api/auth/login');
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usernameOrEmail, username: usernameOrEmail, password })
      });
      if (!res.ok && res.status >= 500) {
        return { success: false, message: `Backend server error (${res.status} Bad Gateway). Please restart your backend API container.` };
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { success: false, message: 'Backend API returned non-JSON response. Please verify your backend server is active.' };
      }
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.token) {
          localStorage.setItem('porter_admin_token', data.token);
        }
        localStorage.setItem('porter_admin_user', JSON.stringify(data.user));
        await fetchAllData();
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Invalid email or password.' };
      }
    } catch (e) {
      return { success: false, message: 'Unable to connect to authentication server. Backend server is currently offline or unreachable.' };
    }
  };

  const handleSignup = async (signupData) => {
    try {
      const targetUrl = formatApiUrl('/api/auth/signup');
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: signupData.fullName || signupData.name || '',
          email: signupData.email,
          password: signupData.password,
          phone: signupData.phone || '',
          role: signupData.role || 'admin'
        })
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error occurred.' };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const targetUrl = formatApiUrl('/api/auth/verify-otp');
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error occurred.' };
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      const targetUrl = formatApiUrl('/api/auth/forgot-password');
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error occurred.' };
    }
  };

  const handleResetPassword = async (email, otp, newPassword) => {
    try {
      const targetUrl = formatApiUrl('/api/auth/reset-password');
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error occurred.' };
    }
  };

  const handleLogout = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setUser(null);
    localStorage.removeItem('porter_admin_user');
    localStorage.removeItem('porter_admin_token');
  };

  const assignDriver = async (orderId, driverId) => {
    const cleanDriverId = String(driverId).replace(/^DRV-/, '');
    const numericDriverId = !isNaN(Number(cleanDriverId)) ? Number(cleanDriverId) : cleanDriverId;
    const selectedDriver = drivers.find(d => d.id === driverId || d.driverId === driverId || String(d.id) === cleanDriverId);
    if (!selectedDriver) return { success: false, message: 'Driver not found' };

    const orderToUpdate = orders.find(o => o.id === orderId || o.backendId === orderId);

    // Optimistic Update: Link driver to order
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOrders(prev => prev.map(order => (order.id === orderId || order.backendId === orderId) ? {
      ...order,
      driver: selectedDriver.name,
      driverPhone: selectedDriver.phone || '',
      driverVehicleNumber: selectedDriver.vehicleNo || selectedDriver.vehicleNumber || '',
      status: 'assigned',
      timeline: [...(order.timeline || []), { time: timeNow, text: `Driver Assigned: ${selectedDriver.name}` }]
    } : order));

    const rawTargetId = (orderToUpdate && orderToUpdate.backendId) ? orderToUpdate.backendId : orderId;
    const cleanTargetId = String(rawTargetId).replace(/^BK_|^BK-|^ORD-/, '');

    // Guide Spec: POST /api/bookings/{bookingId}/assign-driver & POST /api/bookings/{bookingId}/assign
    const assignPayload = {
      driverId: numericDriverId,
      driverName: selectedDriver.name,
      driverPhone: selectedDriver.phone || '',
      driverVehicleNumber: selectedDriver.vehicleNo || selectedDriver.vehicleNumber || ''
    };

    try {
      let res = await authFetch(`/api/bookings/${cleanTargetId}/assign-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignPayload)
      });

      if (!res || !res.ok) {
        const aliasRes = await authFetch(`/api/bookings/${cleanTargetId}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignPayload)
        });
        if (aliasRes && aliasRes.ok) res = aliasRes;
      }

      authFetch(`/api/orders/${cleanTargetId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignPayload)
      }).catch(() => null);

      if (!res || !res.ok) {
        const errData = await res?.json().catch(() => ({})) || {};
        // Revert optimistic update
        setOrders(prev => prev.map(order => (order.id === orderId || order.backendId === orderId) ? {
          ...order, driver: orderToUpdate?.driver || null, status: orderToUpdate?.status || 'pending',
          timeline: (order.timeline || []).filter(t => !t.text?.startsWith('Driver Assigned:'))
        } : order));

        if (res && res.status === 403) {
          alert(`🚫 Access Denied (403 Forbidden): ${errData.message || 'Access denied. Admin privileges are required to manually assign drivers.'}`);
        } else if (res && res.status === 401) {
          alert(`🔒 Unauthorized (401): ${errData.message || 'Please log in with admin privileges.'}`);
        } else {
          alert(`❌ Cannot Assign Driver: ${errData.message || 'Driver assignment rejected by server.'}`);
        }
        return { success: false, error: errData };
      }

      const data = await res.json().catch(() => ({}));
      return { success: true, data };
    } catch (e) {
      console.error('Driver assignment network error:', e);
      return { success: false, message: 'Network error occurred' };
    }
  };

  // Guide Spec: POST /api/bookings/{id}/retry-search
  const retrySearchBooking = async (orderOrBookingId) => {
    const rawTargetId = orderOrBookingId;
    const cleanId = String(rawTargetId).replace(/^BK_|^BK-|^ORD-/, '');

    try {
      const res = await authFetch(`/api/bookings/${cleanId}/retry-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        setOrders(prev => prev.map(order => (order.id === orderOrBookingId || order.backendId === orderOrBookingId || String(order.id) === cleanId) ? {
          ...order,
          status: 'searching',
          driver: null
        } : order));
        alert(`🔍 Driver search restarted for Booking #${cleanId}. Radar broadcast active.`);
        return { success: true, data };
      } else {
        const errData = await res?.json().catch(() => ({})) || {};
        alert(`⚠️ Could not restart driver search: ${errData.message || 'Booking not found or not in pending state'}`);
        return { success: false, error: errData };
      }
    } catch (e) {
      console.warn('retry-search error:', e);
      alert('⚠️ Network error while restarting driver search');
      return { success: false };
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const orderToUpdate = orders.find(o => o.id === orderId || o.backendId === orderId);
    const orderAmount = Number(orderToUpdate?.amount || orderToUpdate?.totalAmount || 0);
    const isCompleted = ['completed', 'delivered', 'settled'].includes(newStatus.toLowerCase());
    const commissionCut = isCompleted ? parseFloat((orderAmount * 0.05).toFixed(2)) : 0;
    const driverNetEarning = isCompleted ? parseFloat((orderAmount - commissionCut).toFixed(2)) : 0;

    setOrders(prev => prev.map(order => (order.id === orderId || order.backendId === orderId) ? {
      ...order,
      status: newStatus,
      timeline: [
        ...(order.timeline || []),
        {
          time: timeNow,
          text: isCompleted && commissionCut > 0
            ? `Order ${newStatus.toUpperCase()} — Collected: ₹${orderAmount} | 5% Commission: ₹${commissionCut} | Net: ₹${driverNetEarning}`
            : `Status updated to ${newStatus.toUpperCase()}`
        }
      ]
    } : order));

    // Deduct 5% commission from driver wallet ONLY on Order Completion
    if (isCompleted && commissionCut > 0 && orderToUpdate?.driver) {
      const matchedDriver = drivers.find(d =>
        d.name === orderToUpdate.driver ||
        String(d.id) === String(orderToUpdate.driverId) ||
        String(d.driverId) === String(orderToUpdate.driverId)
      );
      if (matchedDriver) {
        setDrivers(prev => prev.map(d => {
          if (d.id === matchedDriver.id || d.driverId === matchedDriver.driverId) {
            const currentBal = d.wallet != null ? Number(d.wallet) : 0;
            const newBal = parseFloat((currentBal - commissionCut).toFixed(2));
            const updatedStatus = newBal <= 0 ? 'offline' : d.status;
            try {
              localStorage.setItem(`porter_driver_wallet_${d.id}`, newBal);
              if (d.driverId) localStorage.setItem(`porter_driver_wallet_${d.driverId}`, newBal);
            } catch (e) {}
            return { ...d, wallet: newBal, walletBalance: newBal, status: updatedStatus };
          }
          return d;
        }));
      }
    }

    const targetId = (orderToUpdate && orderToUpdate.backendId) ? orderToUpdate.backendId : orderId;

    if (isCompleted) {
      // Spec: POST /api/orders/{orderId}/complete (with alias /api/driver/orders/{bookingId}/complete)
      const completePayload = {
        bookingId: targetId,
        amount: orderAmount,
        paymentMethod: orderToUpdate?.paymentMethod || 'CASH',
        paymentConfirmed: true
      };
      authFetch(`/api/orders/${targetId}/complete`, {
        method: 'POST',
        body: JSON.stringify(completePayload)
      }).catch(() => null);
      authFetch(`/api/driver/orders/${targetId}/confirm-payment`, {
        method: 'POST',
        body: JSON.stringify(completePayload)
      }).catch(() => null);
    } else {
      authFetch(`/api/orders/${targetId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus })
      });
    }
  };

  const approveDriverVerification = async (driverId) => {
    const cleanId = String(driverId).replace(/^DRV-/, '');
    setDrivers(prev => prev.map(d => (d.id === driverId || d.driverId === driverId || String(d.id) === cleanId) ? {
      ...d, status: 'offline', kyc: 'verified', kycStatus: 'verified', docs: { ...(d.docs || {}), license: 'Verified', rc: 'Verified', verified: true }
    } : d));

    try {
      await Promise.allSettled([
        authFetch(`/api/admin/drivers/${cleanId}/kyc`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' })
        }),
        authFetch(`/api/drivers/${cleanId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active', kyc: 'verified', kycStatus: 'verified' })
        }),
        authFetch(`/api/admin/drivers/${cleanId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active', kyc: 'verified', kycStatus: 'verified' })
        })
      ]);
    } catch (e) {
      console.warn('Driver verification error:', e);
    }
  };

  const rejectDriverVerification = async (driverId, rejectionData = {}) => {
    const cleanId = String(driverId).replace(/^DRV-/, '');
    const reason = typeof rejectionData === 'string' ? rejectionData : (rejectionData.rejectionReason || rejectionData.reason || 'Documents invalid. Please re-upload clear copies.');
    const rawDocs = rejectionData.rejectedDocuments || rejectionData.rejectedDocs || ['license', 'rc'];
    const notes = rejectionData.notes || '';

    const formattedRejectedDocs = Array.isArray(rawDocs) ? rawDocs.map(k => {
      const u = String(k).toUpperCase();
      if (u === 'LICENSE') return 'DRIVING_LICENCE';
      if (u === 'AADHAAR') return 'AADHAAR';
      if (u === 'RC') return 'RC';
      if (u === 'BANK' || u === 'PASSBOOK' || u === 'BANK_PASSBOOK') return 'BANK_DOCUMENT';
      if (u === 'PHOTO' || u === 'FACE') return 'FACE';
      return u;
    }) : ['DRIVING_LICENCE', 'RC'];

    setDrivers(prev => prev.map(d => {
      if (d.id === driverId || d.driverId === driverId || String(d.id) === cleanId) {
        const updatedDocs = { ...(d.docs || {}), verified: false };
        if (rawDocs.includes('license') || formattedRejectedDocs.includes('DRIVING_LICENCE')) updatedDocs.license = 'Rejected';
        if (rawDocs.includes('rc') || formattedRejectedDocs.includes('RC')) updatedDocs.rc = 'Rejected';
        if (rawDocs.includes('aadhaar') || formattedRejectedDocs.includes('AADHAAR')) updatedDocs.aadhaar = 'Rejected';
        if (rawDocs.includes('permit') || formattedRejectedDocs.includes('PERMIT')) updatedDocs.permit = 'Rejected';
        if (rawDocs.includes('bankPassbook') || formattedRejectedDocs.includes('BANK_DOCUMENT')) updatedDocs.bankPassbook = 'Rejected';

        return {
          ...d,
          status: 'rejected',
          kyc: 'rejected',
          kycStatus: 'rejected',
          rejectionReason: reason,
          rejectionNotes: notes,
          rejectedDocuments: formattedRejectedDocs,
          requireReupload: true,
          docs: updatedDocs
        };
      }
      return d;
    }));

    try {
      await Promise.allSettled([
        authFetch(`/api/admin/drivers/${cleanId}/kyc`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected', reason })
        }),
        authFetch(`/api/drivers/${cleanId}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rejectionReason: reason,
            rejectedDocuments: formattedRejectedDocs,
            notes: notes || reason
          })
        }),
        authFetch(`/api/admin/drivers/${cleanId}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rejectionReason: reason,
            rejectedDocuments: formattedRejectedDocs,
            notes: notes || reason
          })
        })
      ]);
    } catch (e) {
      console.warn('Driver rejection error:', e);
    }
  };
  const deleteDriver = (driverId) => {
    const cleanId = String(driverId).replace(/^DRV-/, '');
    setDrivers(prev => prev.filter(d => String(d.id) !== String(driverId) && String(d.driverId) !== String(driverId) && String(d.id) !== cleanId));
    setVehicles(prev => prev.filter(v => String(v.id) !== String(driverId) && String(v.id) !== `V-${driverId}`));
    authFetch(`/api/admin/drivers/${cleanId}`, { method: 'DELETE' })
      .catch(() => authFetch(`/api/drivers/${cleanId}`, { method: 'DELETE' }))
      .catch(() => null);
  };

  const deleteVehicle = (vehicleId) => {
    setVehicles(prev => prev.filter(v => String(v.id) !== String(vehicleId)));
    authFetch(`/api/vehicles/${vehicleId}`, { method: 'DELETE' }).catch(() => null);
  };

  const releasePayout = (payoutId) => {
    setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'settled' } : p));
    authFetch(`/api/payouts/${payoutId}/release`, { method: 'POST' });
  };

  const sendBroadcastNotification = (title, message, audience, target) => {
    const timeNow = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const newNotif = { id: `NTF-${Math.floor(100 + Math.random() * 900)}`, title, message, audience, target, date: timeNow, read: false };
    setNotifications(prev => [newNotif, ...prev]);

    authFetch('/api/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, message, audience: audience || 'all', target })
    }).then(res => res.json()).then(data => {
      if (data.success && data.notification) {
        setNotifications(prev => prev.map(n => n.id === newNotif.id ? data.notification : n));
      }
    }).catch(err => console.warn('Broadcast notification error:', err));
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    authFetch(`/api/notifications/${id}/read`, { method: 'POST' });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    authFetch('/api/notifications/read-all', { method: 'POST' });
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => String(n.id) !== String(id)));
    authFetch(`/api/notifications/${id}`, { method: 'DELETE' }).catch(() => null);
  };

  const removeDuplicateNotifications = () => {
    setNotifications(prev => {
      const seen = new Set();
      return prev.filter(n => {
        const titleKey = (n.title || '').trim().toLowerCase();
        const msgKey = (n.message || '').trim().toLowerCase();
        const key = `${titleKey}|${msgKey}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
  };

  const sendMessageToTicket = (ticketId, channel, text) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newMessage = { sender: 'admin', text, time: timeNow };
        if (channel === 'customer') return { ...t, customerChat: [...(t.customerChat || []), newMessage] };
        else return { ...t, driverChat: [...(t.driverChat || []), newMessage] };
      }
      return t;
    }));
    authFetch(`/api/tickets/${ticketId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message: text, sender: 'admin', channel })
    });
  };

  const updateTicketStatus = (ticketId, newStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    authFetch(`/api/tickets/${ticketId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: newStatus })
    });
  };

  const resolveTicket = (ticketId) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t));
    authFetch(`/api/tickets/${ticketId}/resolve`, { method: 'POST' });
  };

  const addCustomerFunds = (customerId, amount) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, wallet: (c.wallet || 0) + amount } : c));
    authFetch(`/api/customers/${customerId}/topup`, {
      method: 'POST',
      body: JSON.stringify({ amount: parseFloat(amount) })
    });
  };

  const saveSettingsContext = (newSettings) => {
    setSettings(newSettings);
    authFetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify(newSettings)
    });
  };

  /* ── Admin Wallet Management ── */
  const fetchWalletSettings = async () => {
    try {
      const endpoints = ['/api/admin/wallet/minimum-balance', '/api/admin/settings/wallet'];
      for (const ep of endpoints) {
        const res = await authFetch(ep);
        if (res.ok) {
          const data = await res.json();
          if (data && (data.minRequiredBalance != null || data.minRechargeAmount != null)) {
            setWalletSettings({
              minRequiredBalance:   data.minRequiredBalance   ?? data.minimumBalance ?? 1000,
              minRechargeAmount:    data.minRechargeAmount    ?? data.minimumBalance ?? 1000,
              commissionPercentage: data.commissionPercentage ?? 5,
            });
            return data;
          }
        }
      }
    } catch (e) {
      console.warn('[WalletSettings] Fetch error:', e);
    }
    return null;
  };

  const updateWalletSettings = async (payload) => {
    try {
      const res = await authFetch('/api/admin/wallet/minimum-balance', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success || data.minRequiredBalance != null) {
        setWalletSettings(prev => ({
          ...prev,
          minRequiredBalance:   data.minRequiredBalance   ?? payload.minimumBalance ?? prev?.minRequiredBalance,
          minRechargeAmount:    data.minRechargeAmount    ?? payload.minimumBalance ?? prev?.minRechargeAmount,
          commissionPercentage: data.commissionPercentage ?? payload.commissionPercentage ?? prev?.commissionPercentage,
        }));
      }
      return data;
    } catch (e) {
      console.warn('[WalletSettings] Update error:', e);
      // Apply locally as fallback
      setWalletSettings(prev => ({
        ...prev,
        minRequiredBalance:   payload.minimumBalance         ?? prev?.minRequiredBalance,
        minRechargeAmount:    payload.minimumBalance         ?? prev?.minRechargeAmount,
        commissionPercentage: payload.commissionPercentage   ?? prev?.commissionPercentage,
      }));
      return { success: true };
    }
  };

  const adminModifyWallet = async ({ userType, id, amount, action, reason }) => {
    try {
      const res = await authFetch('/api/admin/wallet/modify', {
        method: 'POST',
        body: JSON.stringify({ userType, id: String(id), amount, action, reason })
      });
      const data = await res.json();
      if (data.success) {
        const newBal = data.walletBalance ?? data.driverWalletBalance;
        if (userType === 'driver') {
          setDrivers(prev => prev.map(d =>
            String(d.id) === String(id) || String(d.driverId) === String(id)
              ? { ...d, wallet: newBal, walletBalance: newBal, status: data.status || (newBal <= 0 ? 'offline' : d.status) }
              : d
          ));
        } else {
          setCustomers(prev => prev.map(c =>
            String(c.id) === String(id) ? { ...c, wallet: newBal } : c
          ));
        }
        return { success: true, walletBalance: newBal };
      }
      return { success: false, message: data.message || 'Failed to update wallet.' };
    } catch (e) {
      console.warn('[AdminModifyWallet] Error:', e);
      return { success: false, message: 'Network error.' };
    }
  };

  const saveUsersList = (newUsersList) => {
    setUsersList(newUsersList);
    authFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(newUsersList)
    });
  };

  const setDriverVehicleType = (driverId, vehicleType) => {
    try {
      localStorage.setItem(`porter_driver_veh_type_${driverId}`, vehicleType);
    } catch (e) {}
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId || d.driverId === driverId) {
        return { ...d, vehicle: vehicleType, vehicleType: vehicleType };
      }
      return d;
    }));
  };

  const rechargeDriverWallet = async (driverId, amount, notes = 'Admin Wallet Top-up', paymentReference = '') => {
    const rechargeAmt = parseFloat(amount);
    if (isNaN(rechargeAmt) || rechargeAmt <= 0) return { success: false, message: 'Invalid amount' };

    const cleanId = String(driverId).replace(/^DRV-/, '');
    const payload = {
      amount: rechargeAmt,
      notes: notes || 'Admin Wallet Top-up',
      paymentReference: paymentReference || `PAY_REF_${Date.now()}`
    };

    try {
      const res = await authFetch(`/api/drivers/${cleanId}/recharge`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      let newBal = null;
      let transactionId = null;

      if (res.ok) {
        const data = await res.json();
        newBal = data.newWalletBalance != null ? Number(data.newWalletBalance) : null;
        transactionId = data.transactionId;
      }

      setDrivers(prev => prev.map(d => {
        if (d.id === driverId || d.driverId === driverId || String(d.id) === cleanId) {
          const currentBal = d.wallet != null ? Number(d.wallet) : 0;
          const calculatedBal = newBal != null ? newBal : parseFloat((currentBal + rechargeAmt).toFixed(2));
          const updatedStatus = calculatedBal > 0 && (d.status === 'offline' || d.status === 'rejected') ? 'online' : d.status;
          try {
            localStorage.setItem(`porter_driver_wallet_${d.id}`, calculatedBal);
            if (d.driverId) localStorage.setItem(`porter_driver_wallet_${d.driverId}`, calculatedBal);
            localStorage.setItem(`porter_driver_wallet_${cleanId}`, calculatedBal);
          } catch (e) {}
          return { ...d, wallet: calculatedBal, walletBalance: calculatedBal, status: updatedStatus };
        }
        return d;
      }));

      return { success: true, newBalance: newBal, transactionId };
    } catch (err) {
      console.warn('Driver recharge error:', err);
      // Fallback local update
      setDrivers(prev => prev.map(d => {
        if (d.id === driverId || d.driverId === driverId || String(d.id) === cleanId) {
          const currentBal = d.wallet != null ? Number(d.wallet) : 0;
          const calculatedBal = parseFloat((currentBal + rechargeAmt).toFixed(2));
          const updatedStatus = calculatedBal > 0 && (d.status === 'offline' || d.status === 'rejected') ? 'online' : d.status;
          return { ...d, wallet: calculatedBal, walletBalance: calculatedBal, status: updatedStatus };
        }
        return d;
      }));
      return { success: true };
    }
  };

  const getDriverWalletHistory = async (driverId) => {
    const cleanId = String(driverId).replace(/^DRV-/, '');
    // Try all spec endpoint aliases:
    // 1. GET /api/drivers/{driverId}/wallet  (Admin)
    // 2. GET /api/driver/wallet              (Driver JWT)
    // 3. GET /api/driver/wallet/transactions (transaction list)
    const endpoints = [
      `/api/drivers/${cleanId}/wallet`,
      `/api/driver/wallet`,
    ];
    for (const ep of endpoints) {
      try {
        const res = await authFetch(ep);
        if (res.ok) {
          const data = await res.json();
          // Normalize: backend may return `transactions` (spec B) or `recentTransactions`
          if (data.transactions && !data.recentTransactions) {
            data.recentTransactions = data.transactions;
          }
          // Also map transaction fields to common shape:
          if (Array.isArray(data.recentTransactions)) {
            data.recentTransactions = data.recentTransactions.map(tx => ({
              id: tx.id,
              type: tx.transactionType || tx.type,
              amount: tx.amount,
              orderId: tx.orderId,
              balanceAfter: tx.balanceAfter,
              createdAt: tx.createdAt,
              description: tx.description,
              status: tx.status,
              grossAmount: tx.grossAmount,
              commissionAmount: tx.commissionAmount,
            }));
          }
          return data;
        }
      } catch (e) {
        console.warn(`Error fetching driver wallet from ${ep}:`, e);
      }
    }
    return null;
  };

  const createDriverManually = async (driverData) => {
    try {
      // Step 1 registration endpoint per backend guide
      let res = await authFetch('/api/drivers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...driverData, registrationStep: driverData.registrationStep || 1 })
      });
      if (!res.ok) {
        // Fallback to /api/drivers
        res = await authFetch('/api/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(driverData)
        });
      }
      if (res.ok) {
        const data = await res.json();
        await fetchAllData();
        return { success: true, driver: data };
      } else {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: err.message || 'Failed to create driver' };
      }
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const updateDriverStatus = async (driverId, newStatus) => {
    const cleanId = String(driverId).replace(/^DRV-/, '');
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId || d.driverId === driverId || String(d.id) === cleanId) {
        return { ...d, status: newStatus };
      }
      return d;
    }));

    try {
      const res = await authFetch(`/api/drivers/${cleanId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        await authFetch(`/api/drivers/${cleanId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      }
    } catch (e) {
      console.warn('Error updating driver duty status:', e);
    }
  };

  const uploadDocumentFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, url: data.url || data.path || data.fileUrl };
      }
    } catch (e) {
      console.warn('File upload error:', e);
    }
    return { success: false };
  };

  const validateDocumentQuality = async (file, type = 'DRIVING_LICENCE') => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await authFetch(`/api/documents/validate?type=${encodeURIComponent(type)}`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Document validation error:', e);
    }
    return { valid: true };
  };

  const uploadDriverPhoto = async (file, driverId = '', phone = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (driverId) formData.append('driverId', driverId);
    if (phone) formData.append('phone', phone);
    try {
      const res = await authFetch('/api/driver/photo', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, photoUrl: data.photoUrl || data.url };
      }
    } catch (e) {
      console.warn('Driver photo upload error:', e);
    }
    return { success: false };
  };

  return (
    <AppStateContext.Provider value={{
      user, orders, drivers, payouts, setPayouts, tickets, notifications, driverLocations,
      customers, vehicles, franchises, cities, adminMetrics, settings, usersList, banners, setBanners,
      handleLogin, handleLogout, handleSignup, verifyOtp, handleForgotPassword, handleResetPassword, assignDriver, updateOrderStatus,
      approveDriverVerification, rejectDriverVerification, releasePayout, setDriverVehicleType, rechargeDriverWallet, getDriverWalletHistory,
      createDriverManually, updateDriverStatus, uploadDocumentFile, validateDocumentQuality, uploadDriverPhoto,
      sendBroadcastNotification, sendMessageToTicket, resolveTicket, updateTicketStatus,
      darkMode, setDarkMode, markNotificationAsRead, markAllNotificationsAsRead,
      deleteNotification, removeDuplicateNotifications, deleteDriver, deleteVehicle,
      addCustomerFunds, saveSettingsContext, saveUsersList, bypassLogin, authFetch, fetchAllData,
      walletSettings, fetchWalletSettings, updateWalletSettings, adminModifyWallet,
      setDrivers, setCustomers, retrySearchBooking
    }}>
      {children}
    </AppStateContext.Provider>
  );
};