/**
 * passenger-api-server.js
 * 
 * Standalone API Server & Static Web Server running on Port 8090.
 * Implements all 3 Flows specified for Anusha Porter Passenger Car Services:
 * 
 * Flow 1: Customer Booking Flow
 * Flow 2: Admin Dynamic Pricing & Simulator Flow
 * Flow 3: Admin Dispatch & Booking Operations Flow
 * 
 * Also serves:
 * - http://localhost:8090/passenger-booking.html
 * - http://localhost:8090/passenger-admin.html
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8090;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// ── In-Memory Database & State ──

let currentPricingVersion = {
  versionId: 'PV-2026-09-07-01',
  effectiveFrom: '2026-09-01T00:00:00.000Z',
  effectiveUntil: null,
  createdBy: 'Senior Pricing Architect',
  status: 'active',
  gstPercent: 5.0,
  commissionPercent: 20.0,
  nightSurchargePercent: 25.0,
  quoteLockMinutes: 5
};

let services = [
  { id: 'one_way', code: 'ONE_WAY', name: 'One-Way City Ride', description: 'Point-to-point city transfers', enabled: true },
  { id: 'round_trip', code: 'ROUND_TRIP', name: 'Round Trip Outstation', description: 'Two-way travel with driver allowance', enabled: true },
  { id: 'rental', code: 'RENTAL', name: 'Hourly Rental Packages', description: 'Flexible hourly & KM city rental', enabled: true },
  { id: 'airport', code: 'AIRPORT', name: 'Airport Transfers', description: 'Direct pickup & drop to RGIA Airport', enabled: true }
];

let vehicleCategories = {
  bike_taxi: {
    code: 'BIKE_TAXI',
    id: 'bike_taxi',
    name: 'Bike Taxi',
    displayName: 'Bike Taxi (2-Wheeler)',
    description: 'Fast, budget-friendly single passenger bike ride beating city traffic',
    maxPassengers: 1,
    maxLuggage: 1,
    baseFare: 20,
    baseDistanceKm: 2,
    perKmRate: 8,
    perMinuteRate: 0.5,
    driverAllowance: 0,
    minimumFare: 20,
    status: 'active',
    image: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png'
  },
  scooter: {
    code: 'SCOOTER',
    id: 'scooter',
    name: 'Scooter Taxi',
    displayName: 'Scooter (e.g. Activa, Jupiter)',
    description: 'Comfortable scooter ride for solo commuters with backpack space',
    maxPassengers: 1,
    maxLuggage: 1,
    baseFare: 25,
    baseDistanceKm: 2,
    perKmRate: 9,
    perMinuteRate: 0.5,
    driverAllowance: 0,
    minimumFare: 25,
    status: 'active',
    image: 'https://cdn-icons-png.flaticon.com/512/3448/3448657.png'
  },
  auto: {
    code: 'AUTO',
    id: 'auto',
    name: 'Auto',
    displayName: 'Auto (3-Wheeler)',
    description: 'Affordable 3-wheeler auto rickshaw for swift daily city commutes',
    maxPassengers: 3,
    maxLuggage: 2,
    baseFare: 30,
    baseDistanceKm: 2,
    perKmRate: 14,
    perMinuteRate: 1.0,
    driverAllowance: 50,
    minimumFare: 30,
    status: 'active',
    image: 'https://cdn-icons-png.flaticon.com/512/2361/2361814.png'
  },
  hatchback: {
    code: 'HATCHBACK',
    id: 'hatchback',
    name: 'Hatchback',
    displayName: 'Hatchback (e.g. WagonR, Swift)',
    description: 'Compact & economical cars ideal for swift daily city commutes',
    maxPassengers: 4,
    maxLuggage: 2,
    baseFare: 250,
    baseDistanceKm: 8,
    perKmRate: 12,
    perMinuteRate: 1.0,
    driverAllowance: 80,
    minimumFare: 250,
    status: 'active',
    image: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png'
  },
  sedan: {
    code: 'SEDAN',
    id: 'sedan',
    name: 'Sedan',
    displayName: 'Sedan (e.g. Dzire, Etios)',
    description: 'Spacious sedans with boot space for business and comfort rides',
    maxPassengers: 4,
    maxLuggage: 3,
    baseFare: 300,
    baseDistanceKm: 10,
    perKmRate: 14,
    perMinuteRate: 1.5,
    driverAllowance: 100,
    minimumFare: 300,
    status: 'active',
    image: 'https://cdn-icons-png.flaticon.com/512/741/741407.png'
  },
  suv: {
    code: 'SUV',
    id: 'suv',
    name: 'SUV',
    displayName: 'SUV (e.g. Ertiga, Carens)',
    description: '6-seater spacious vehicle for family outings and extra luggage',
    maxPassengers: 6,
    maxLuggage: 4,
    baseFare: 450,
    baseDistanceKm: 12,
    perKmRate: 18,
    perMinuteRate: 2.0,
    driverAllowance: 150,
    minimumFare: 450,
    status: 'active',
    image: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png'
  },
  premium: {
    code: 'PREMIUM_SUV',
    id: 'premium',
    name: 'Premium SUV',
    displayName: 'Premium SUV (e.g. Innova Crysta)',
    description: 'Top luxury multi-seater with executive travel comfort',
    maxPassengers: 7,
    maxLuggage: 5,
    baseFare: 650,
    baseDistanceKm: 15,
    perKmRate: 24,
    perMinuteRate: 2.5,
    driverAllowance: 200,
    minimumFare: 650,
    status: 'active',
    image: 'https://cdn-icons-png.flaticon.com/512/744/744465.png'
  },
  luxury: {
    code: 'LUXURY',
    id: 'luxury',
    name: 'Luxury Sedan',
    displayName: 'Luxury (e.g. Mercedes, BMW, Audi)',
    description: 'Flagship executive transport for VIP and corporate delegates',
    maxPassengers: 4,
    maxLuggage: 3,
    baseFare: 1000,
    baseDistanceKm: 20,
    perKmRate: 35,
    perMinuteRate: 5.0,
    driverAllowance: 500,
    minimumFare: 1000,
    status: 'active',
    image: 'https://cdn-icons-png.flaticon.com/512/3063/3063829.png'
  }
};

let rentalPackages = [
  { id: 'pkg_2h_20k', name: '2 Hours / 20 KM', hours: 2, km: 20, multiplier: 1.0 },
  { id: 'pkg_4h_40k', name: '4 Hours / 40 KM', hours: 4, km: 40, multiplier: 1.8 },
  { id: 'pkg_8h_80k', name: '8 Hours / 80 KM (Full Day)', hours: 8, km: 80, multiplier: 3.2 },
  { id: 'pkg_12h_120k', name: '12 Hours / 120 KM', hours: 12, km: 120, multiplier: 4.5 }
];

let fareTokens = new Map(); // token -> { ...estimateData, expiresAt }
let bookings = [
  {
    id: 'PB-982142',
    trackingNumber: 'PB-982142',
    serviceType: 'ONE_WAY',
    vehicleCategoryCode: 'SEDAN',
    pickupAddress: 'Hitec City Cyber Towers, Hyderabad',
    dropAddress: 'Rajiv Gandhi International Airport (RGIA)',
    passengerName: 'Kavita Reddy',
    passengerPhone: '+91 98490 12345',
    passengerCount: 2,
    luggageCount: 2,
    paymentMode: 'ONLINE',
    paymentStatus: 'PENDING',
    status: 'DRIVER_SEARCHING',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    pricingVersion: 'PV-2026-09-07-01',
    estimatedFare: 520.00,
    fareBreakdown: {
      baseFare: 300,
      distanceFare: 160,
      timeFare: 30,
      nightCharge: 0,
      surgeCharge: 0,
      tollFee: 40,
      taxes: 26,
      totalFare: 520.00,
      driverEarnings: 416.00,
      companyCommission: 104.00
    },
    driver: null
  },
  {
    id: 'PB-761234',
    trackingNumber: 'PB-761234',
    serviceType: 'ONE_WAY',
    vehicleCategoryCode: 'HATCHBACK',
    pickupAddress: 'Madhapur Metro Station',
    dropAddress: 'Inorbit Mall, Hitech City',
    passengerName: 'Anil Rao',
    passengerPhone: '+91 98111 22334',
    passengerCount: 1,
    luggageCount: 1,
    paymentMode: 'CASH',
    paymentStatus: 'PENDING',
    status: 'DRIVER_ASSIGNED',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    pricingVersion: 'PV-2026-09-07-01',
    estimatedFare: 250.00,
    fareBreakdown: {
      baseFare: 250,
      distanceFare: 0,
      timeFare: 0,
      nightCharge: 0,
      surgeCharge: 0,
      tollFee: 0,
      taxes: 12.5,
      totalFare: 250.00,
      driverEarnings: 200.00,
      companyCommission: 50.00
    },
    driver: {
      driverId: 101,
      name: 'Ramesh Kumar',
      phone: '+91 98765 43210',
      vehicleNumber: 'TS 09 AB 1234',
      vehicleModel: 'Maruti WagonR (Hatchback)',
      rating: 4.9,
      latitude: 17.4495,
      longitude: 78.3850
    }
  }
];

let pricingVersions = [
  {
    versionId: 'PV-2026-09-07-01',
    publishedAt: '2026-09-01T00:00:00.000Z',
    publishedBy: 'Senior Pricing Architect',
    changeNotes: 'Initial production baseline rate cards',
    ratesSnapshot: { ...vehicleCategories }
  }
];

let auditHistory = [
  {
    id: 1,
    timestamp: '2026-09-01T00:00:00.000Z',
    admin: 'Senior Pricing Architect',
    action: 'INITIALIZE_VERSION',
    versionId: 'PV-2026-09-07-01',
    details: 'Initial rate cards initialized'
  }
];

const availableDrivers = [
  { driverId: 101, name: 'Ramesh Kumar', phone: '+91 98765 43210', vehicleNumber: 'TS 09 AB 1234', vehicleCategory: 'HATCHBACK', rating: 4.9 },
  { driverId: 102, name: 'Suresh Patel', phone: '+91 98123 45678', vehicleNumber: 'TS 08 CD 5678', vehicleCategory: 'SEDAN', rating: 4.8 },
  { driverId: 103, name: 'Vikram Singh', phone: '+91 97000 11223', vehicleNumber: 'TS 07 EF 9012', vehicleCategory: 'SUV', rating: 4.9 },
  { driverId: 104, name: 'Mohd. Imran', phone: '+91 99887 66554', vehicleNumber: 'TS 09 XY 4321', vehicleCategory: 'PREMIUM_SUV', rating: 5.0 }
];

// ── Helpers ──

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
};

const sendFile = (res, filePath, contentType) => {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    }
  });
};

const parseBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    if (!body) return resolve({});
    try {
      resolve(JSON.parse(body));
    } catch (e) {
      resolve({});
    }
  });
  req.on('error', reject);
});

// ── Fare Calculation Engine (Minor Unit / Paise precision) ──

const calculateFareBreakdown = ({
  serviceType = 'ONE_WAY',
  vehicleCategoryCode = 'SEDAN',
  distanceKm = 15,
  durationMinutes = 35,
  passengerCount = 1,
  tollFee = 0,
  parkingFee = 0,
  couponCode = '',
  isNightTime = false,
  rentalPackageId = null
}) => {
  const normCode = String(vehicleCategoryCode).toLowerCase().replace(/[^a-z]/g, '');
  const catKey = normCode.includes('hatch') ? 'hatchback'
               : normCode.includes('suv') && normCode.includes('prem') ? 'premium'
               : normCode.includes('suv') ? 'suv'
               : 'sedan';

  const cat = vehicleCategories[catKey] || vehicleCategories.sedan;

  let baseFare = cat.baseFare;
  let baseKm = cat.baseDistanceKm;
  let billableKm = Math.max(0, distanceKm - baseKm);
  let distanceFare = Math.round(billableKm * cat.perKmRate);
  let timeFare = Math.round(durationMinutes * cat.perMinuteRate);

  let driverAllowance = 0;
  if (serviceType === 'ROUND_TRIP') {
    distanceFare = distanceFare * 2;
    driverAllowance = cat.driverAllowance || 100;
  }

  let packageCharge = 0;
  if (serviceType === 'RENTAL' && rentalPackageId) {
    const pkg = rentalPackages.find(p => p.id === rentalPackageId) || rentalPackages[0];
    baseFare = Math.round(cat.baseFare * pkg.multiplier);
    const extraKm = Math.max(0, distanceKm - pkg.km);
    distanceFare = Math.round(extraKm * cat.perKmRate);
  }

  let nightCharge = isNightTime ? Math.round((baseFare + distanceFare) * 0.25) : 0;
  let surgeCharge = 0;
  let totalTolls = Number(tollFee) || 0;
  let totalParking = Number(parkingFee) || 0;

  let subtotal = baseFare + distanceFare + timeFare + driverAllowance + nightCharge + surgeCharge + totalTolls + totalParking;

  let discount = 0;
  if (couponCode && couponCode.toUpperCase() === 'WELCOME100') {
    discount = Math.min(100, Math.round(subtotal * 0.2));
  } else if (couponCode && couponCode.toUpperCase() === 'AIRPORT50') {
    discount = 50;
  }

  let taxable = Math.max(0, subtotal - discount);
  let taxes = Math.round(taxable * (currentPricingVersion.gstPercent / 100));
  let totalFare = taxable + taxes;

  let commission = Math.round(taxable * (currentPricingVersion.commissionPercent / 100));
  let driverEarnings = taxable - commission;

  return {
    baseFare,
    distanceFare,
    timeFare,
    driverAllowance,
    nightCharge,
    surgeCharge,
    tollFee: totalTolls,
    parkingFee: totalParking,
    discount,
    taxes,
    totalFare,
    driverEarnings,
    companyCommission: commission,
    vehicle: cat
  };
};

// ── HTTP Request Handler ──

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  try {
    // ══════════════════════════════════════════════════════════════════
    // STATIC HTML PAGES
    // ══════════════════════════════════════════════════════════════════
    if (pathname === '/' || pathname === '/passenger-booking.html') {
      return sendFile(res, path.join(PUBLIC_DIR, 'passenger-booking.html'), 'text/html');
    }
    if (pathname === '/passenger-admin.html') {
      return sendFile(res, path.join(PUBLIC_DIR, 'passenger-admin.html'), 'text/html');
    }

    // ══════════════════════════════════════════════════════════════════
    // FLOW 1: CUSTOMER BOOKING FLOW ENDPOINTS
    // ══════════════════════════════════════════════════════════════════

    // 1. GET /api/passenger/services
    if (pathname === '/api/passenger/services' && method === 'GET') {
      return sendJson(res, 200, { success: true, services });
    }

    // 1. GET /api/passenger/vehicles
    if (pathname === '/api/passenger/vehicles' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        vehicles: Object.values(vehicleCategories)
      });
    }

    // 1. GET /api/passenger/rental-packages
    if (pathname === '/api/passenger/rental-packages' && method === 'GET') {
      return sendJson(res, 200, { success: true, packages: rentalPackages });
    }

    // 2. POST /api/passenger/fare-estimate
    if (pathname === '/api/passenger/fare-estimate' && method === 'POST') {
      const body = await parseBody(req);
      const {
        serviceType = 'ONE_WAY',
        vehicleCategoryCode = 'SEDAN',
        pickupAddress = 'Madhapur',
        dropAddress = 'Airport',
        passengerCount = 1,
        luggageCount = 1,
        couponCode = '',
        rentalPackageId = null,
        stops = []
      } = body;

      // Capacity Check
      const normCode = String(vehicleCategoryCode).toLowerCase().replace(/[^a-z]/g, '');
      const catKey = normCode.includes('hatch') ? 'hatchback'
                   : normCode.includes('suv') && normCode.includes('prem') ? 'premium'
                   : normCode.includes('suv') ? 'suv'
                   : 'sedan';

      const cat = vehicleCategories[catKey] || vehicleCategories.sedan;

      // RULE: If passengerCount > vehicle capacity -> HTTP 400
      if (Number(passengerCount) > cat.maxPassengers) {
        return sendJson(res, 400, {
          success: false,
          error: 'CAPACITY_EXCEEDED',
          message: 'Please select a larger vehicle for this number of passengers.',
          allowedMax: cat.maxPassengers,
          requested: passengerCount
        });
      }

      // Compute Distance (mock based on address length / stops)
      let distanceKm = 18.5;
      if (serviceType === 'AIRPORT' || dropAddress.toLowerCase().includes('airport')) {
        distanceKm = 32.0;
      }
      if (stops && Array.isArray(stops) && stops.length > 0) {
        distanceKm += stops.length * 4.0;
      }
      const durationMinutes = Math.round(distanceKm * 2.1);

      const breakdown = calculateFareBreakdown({
        serviceType,
        vehicleCategoryCode: cat.code,
        distanceKm,
        durationMinutes,
        passengerCount,
        couponCode,
        rentalPackageId
      });

      // Generate 5-Minute Locked Fare Token
      const fareToken = `FT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const tokenExpiresAt = new Date(Date.now() + currentPricingVersion.quoteLockMinutes * 60 * 1000).toISOString();

      const estimateResult = {
        fareToken,
        tokenExpiresAt,
        estimatedFare: breakdown.totalFare,
        distanceKm,
        durationMinutes,
        breakdown: {
          baseFare: breakdown.baseFare,
          distanceFare: breakdown.distanceFare,
          timeFare: breakdown.timeFare,
          nightCharge: breakdown.nightCharge,
          surgeCharge: breakdown.surgeCharge,
          tollFee: breakdown.tollFee,
          parkingFee: breakdown.parkingFee,
          discount: breakdown.discount,
          taxes: breakdown.taxes
        },
        pricingVersion: currentPricingVersion.versionId,
        vehicle: {
          code: cat.code,
          name: cat.name,
          maxPassengers: cat.maxPassengers,
          maxLuggage: cat.maxLuggage,
          image: cat.image
        }
      };

      fareTokens.set(fareToken, {
        ...estimateResult,
        body
      });

      return sendJson(res, 200, {
        success: true,
        ...estimateResult
      });
    }

    // 3. POST /api/passenger/bookings
    if (pathname === '/api/passenger/bookings' && method === 'POST') {
      const body = await parseBody(req);
      const {
        fareToken,
        serviceType = 'ONE_WAY',
        vehicleCategoryCode = 'SEDAN',
        pickupAddress = 'Madhapur',
        dropAddress = 'Airport',
        passengerName = 'Customer',
        passengerPhone = '+91 98765 00000',
        passengerCount = 1,
        luggageCount = 1,
        paymentMode = 'ONLINE',
        stops = []
      } = body;

      const lockedEstimate = fareTokens.get(fareToken) || calculateFareBreakdown({
        serviceType,
        vehicleCategoryCode,
        distanceKm: 18.5,
        durationMinutes: 40,
        passengerCount
      });

      const trackingNumber = `PB-${Math.floor(100000 + Math.random() * 900000)}`;

      const newBooking = {
        id: trackingNumber,
        trackingNumber,
        serviceType,
        vehicleCategoryCode,
        pickupAddress,
        dropAddress,
        passengerName,
        passengerPhone,
        passengerCount: Number(passengerCount),
        luggageCount: Number(luggageCount),
        paymentMode,
        paymentStatus: 'PENDING',
        status: 'DRIVER_SEARCHING',
        createdAt: new Date().toISOString(),
        pricingVersion: currentPricingVersion.versionId,
        estimatedFare: lockedEstimate.estimatedFare || lockedEstimate.totalFare || 485.50,
        fareBreakdown: lockedEstimate.breakdown || lockedEstimate,
        driver: null,
        stops
      };

      bookings.unshift(newBooking);

      return sendJson(res, 201, {
        success: true,
        message: 'Booking created successfully and entered dispatch pool.',
        booking: newBooking
      });
    }

    // 4. GET /api/passenger/bookings/:id
    if (pathname.startsWith('/api/passenger/bookings/') && method === 'GET') {
      const bookingId = pathname.replace('/api/passenger/bookings/', '').trim();
      const found = bookings.find(b => b.id === bookingId || b.trackingNumber === bookingId);
      if (!found) {
        return sendJson(res, 404, { success: false, message: 'Booking not found' });
      }
      return sendJson(res, 200, { success: true, booking: found });
    }

    // 5. POST /api/passenger/bookings/:id/cancel
    if (pathname.match(/^\/api\/passenger\/bookings\/([^\/]+)\/cancel$/) && method === 'POST') {
      const bookingId = req.url.split('/')[4];
      const body = await parseBody(req);
      const found = bookings.find(b => b.id === bookingId || b.trackingNumber === bookingId);
      if (!found) return sendJson(res, 404, { success: false, message: 'Booking not found' });

      found.status = 'CANCELLED';
      found.cancellationReason = body.reason || 'Customer requested';
      found.cancelledAt = new Date().toISOString();

      return sendJson(res, 200, { success: true, message: 'Booking cancelled successfully', booking: found });
    }

    // 5. POST /api/passenger/bookings/:id/payment
    if (pathname.match(/^\/api\/passenger\/bookings\/([^\/]+)\/payment$/) && method === 'POST') {
      const bookingId = req.url.split('/')[4];
      const body = await parseBody(req);
      const found = bookings.find(b => b.id === bookingId || b.trackingNumber === bookingId);
      if (!found) return sendJson(res, 404, { success: false, message: 'Booking not found' });

      found.paymentStatus = body.paymentStatus || 'PAID';
      found.paymentTransactionId = body.paymentTransactionId || `TXN${Date.now()}`;
      found.paidAt = new Date().toISOString();

      return sendJson(res, 200, { success: true, message: 'Payment recorded successfully', booking: found });
    }

    // ══════════════════════════════════════════════════════════════════
    // FLOW 2: ADMIN DYNAMIC PRICING & SIMULATOR FLOW ENDPOINTS
    // ══════════════════════════════════════════════════════════════════

    // 1. GET /api/admin/passenger/pricing
    if (pathname === '/api/admin/passenger/pricing' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        version: currentPricingVersion,
        vehicles: vehicleCategories,
        rentalPackages
      });
    }

    // 1. GET /api/admin/passenger/vehicle-categories
    if (pathname === '/api/admin/passenger/vehicle-categories' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        categories: Object.values(vehicleCategories)
      });
    }

    // 1. GET /api/admin/passenger/services
    if (pathname === '/api/admin/passenger/services' && method === 'GET') {
      return sendJson(res, 200, { success: true, services });
    }

    // 2. POST /api/admin/passenger/pricing/preview (Sandbox simulator)
    if (pathname === '/api/admin/passenger/pricing/preview' && method === 'POST') {
      const body = await parseBody(req);
      const breakdown = calculateFareBreakdown({
        serviceType: body.serviceType || 'ONE_WAY',
        vehicleCategoryCode: body.vehicleCategoryCode || 'SEDAN',
        distanceKm: Number(body.distanceKm) || 15,
        durationMinutes: Number(body.durationMinutes) || 35,
        passengerCount: Number(body.passengerCount) || 2,
        tollFee: Number(body.tollFee) || 0,
        parkingFee: Number(body.parkingFee) || 0,
        couponCode: body.couponCode || '',
        isNightTime: Boolean(body.isNightTime)
      });

      return sendJson(res, 200, {
        success: true,
        pricingVersion: currentPricingVersion.versionId,
        receipt: {
          baseFare: breakdown.baseFare,
          distanceFare: breakdown.distanceFare,
          timeFare: breakdown.timeFare,
          driverAllowance: breakdown.driverAllowance,
          nightCharge: breakdown.nightCharge,
          surgeCharge: breakdown.surgeCharge,
          tollFee: breakdown.tollFee,
          parkingFee: breakdown.parkingFee,
          discount: breakdown.discount,
          taxes: breakdown.taxes,
          totalFare: breakdown.totalFare
        },
        settlement: {
          driverEarnings: breakdown.driverEarnings,
          companyCommission: breakdown.companyCommission
        }
      });
    }

    // 3. POST /api/admin/passenger/pricing/update-and-publish
    if (pathname === '/api/admin/passenger/pricing/update-and-publish' && method === 'POST') {
      const body = await parseBody(req);
      const {
        vehicleCategoryCode = 'SEDAN',
        baseFare,
        baseDistanceKm,
        perKmRate,
        driverAllowance,
        nightSurchargePercent,
        gstPercent,
        reason = 'Rate adjustment'
      } = body;

      const normCode = String(vehicleCategoryCode).toLowerCase().replace(/[^a-z]/g, '');
      const catKey = normCode.includes('hatch') ? 'hatchback'
                   : normCode.includes('suv') && normCode.includes('prem') ? 'premium'
                   : normCode.includes('suv') ? 'suv'
                   : 'sedan';

      if (vehicleCategories[catKey]) {
        if (baseFare != null) vehicleCategories[catKey].baseFare = Number(baseFare);
        if (baseDistanceKm != null) vehicleCategories[catKey].baseDistanceKm = Number(baseDistanceKm);
        if (perKmRate != null) vehicleCategories[catKey].perKmRate = Number(perKmRate);
        if (driverAllowance != null) vehicleCategories[catKey].driverAllowance = Number(driverAllowance);
      }

      if (nightSurchargePercent != null) currentPricingVersion.nightSurchargePercent = Number(nightSurchargePercent);
      if (gstPercent != null) currentPricingVersion.gstPercent = Number(gstPercent);

      // Generate New Immutable Pricing Version (e.g. PV-2026-09-07-02)
      const prevSeq = parseInt(currentPricingVersion.versionId.split('-').pop() || '1', 10);
      const nextSeq = String(prevSeq + 1).padStart(2, '0');
      const newVersionId = `PV-${new Date().toISOString().split('T')[0]}-${nextSeq}`;

      currentPricingVersion = {
        ...currentPricingVersion,
        versionId: newVersionId,
        effectiveFrom: new Date().toISOString()
      };

      pricingVersions.unshift({
        versionId: newVersionId,
        publishedAt: new Date().toISOString(),
        publishedBy: body.adminUser || 'Senior Pricing Architect',
        changeNotes: reason,
        ratesSnapshot: JSON.parse(JSON.stringify(vehicleCategories))
      });

      auditHistory.unshift({
        id: auditHistory.length + 1,
        timestamp: new Date().toISOString(),
        admin: body.adminUser || 'Senior Pricing Architect',
        action: 'PUBLISH_NEW_VERSION',
        versionId: newVersionId,
        details: reason,
        vehicleCategoryCode
      });

      return sendJson(res, 200, {
        success: true,
        message: `New immutable pricing version ${newVersionId} generated and published successfully.`,
        version: currentPricingVersion,
        auditHistoryCount: auditHistory.length
      });
    }

    // 4. GET /api/admin/passenger/pricing/versions
    if (pathname === '/api/admin/passenger/pricing/versions' && method === 'GET') {
      return sendJson(res, 200, { success: true, versions: pricingVersions });
    }

    // 4. GET /api/admin/passenger/pricing/history
    if (pathname === '/api/admin/passenger/pricing/history' && method === 'GET') {
      return sendJson(res, 200, { success: true, history: auditHistory });
    }

    // ══════════════════════════════════════════════════════════════════
    // FLOW 3: ADMIN DISPATCH & BOOKING OPERATIONS FLOW ENDPOINTS
    // ══════════════════════════════════════════════════════════════════

    // 1. GET /api/admin/passenger/bookings
    if (pathname === '/api/admin/passenger/bookings' && method === 'GET') {
      const statusFilter = parsedUrl.query.status;
      let filtered = bookings;
      if (statusFilter) {
        filtered = bookings.filter(b => b.status === statusFilter);
      }
      return sendJson(res, 200, {
        success: true,
        count: filtered.length,
        bookings: filtered
      });
    }

    // 2. PUT /api/admin/passenger/bookings/:id/assign-driver
    if (pathname.match(/^\/api\/admin\/passenger\/bookings\/([^\/]+)\/assign-driver$/) && method === 'PUT') {
      const bookingId = req.url.split('/')[5];
      const body = await parseBody(req);
      const found = bookings.find(b => b.id === bookingId || b.trackingNumber === bookingId);
      if (!found) return sendJson(res, 404, { success: false, message: 'Booking not found' });

      const driver = availableDrivers.find(d => d.driverId === Number(body.driverId)) || availableDrivers[0];
      found.driver = {
        ...driver,
        latitude: 17.4495,
        longitude: 78.3850
      };
      found.status = 'DRIVER_ASSIGNED';
      found.assignedAt = new Date().toISOString();

      return sendJson(res, 200, {
        success: true,
        message: `Driver ${driver.name} assigned. Booking moved to DRIVER_ASSIGNED.`,
        booking: found
      });
    }

    // 3. PUT /api/admin/passenger/bookings/:id/status
    if (pathname.match(/^\/api\/admin\/passenger\/bookings\/([^\/]+)\/status$/) && method === 'PUT') {
      const bookingId = req.url.split('/')[5];
      const body = await parseBody(req);
      const found = bookings.find(b => b.id === bookingId || b.trackingNumber === bookingId);
      if (!found) return sendJson(res, 404, { success: false, message: 'Booking not found' });

      const validStatuses = ['DRIVER_SEARCHING', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(body.status)) {
        return sendJson(res, 400, { success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }

      found.status = body.status;
      if (body.status === 'COMPLETED') {
        found.completedAt = new Date().toISOString();
        found.paymentStatus = 'PAID';
      }

      return sendJson(res, 200, {
        success: true,
        message: `Trip status updated to ${body.status}`,
        booking: found
      });
    }

    // 4. GET /api/admin/passenger/reports
    if (pathname === '/api/admin/passenger/reports' && method === 'GET') {
      const totalBookings = bookings.length;
      const completed = bookings.filter(b => b.status === 'COMPLETED');
      const totalRevenue = completed.reduce((sum, b) => sum + (b.estimatedFare || 0), 0);
      const totalCommission = completed.reduce((sum, b) => sum + (b.fareBreakdown?.companyCommission || 0), 0);

      return sendJson(res, 200, {
        success: true,
        summary: {
          totalBookings,
          completedTrips: completed.length,
          totalRevenue,
          totalCommission,
          averageFare: completed.length > 0 ? (totalRevenue / completed.length).toFixed(2) : 0
        }
      });
    }

    // 4. GET /api/admin/passenger/reports/export-csv
    if (pathname === '/api/admin/passenger/reports/export-csv' && method === 'GET') {
      const headers = 'TrackingNumber,Service,Vehicle,Customer,Amount,Status,PaymentStatus,Created\n';
      const rows = bookings.map(b => 
        `"${b.trackingNumber}","${b.serviceType}","${b.vehicleCategoryCode}","${b.passengerName}",${b.estimatedFare},"${b.status}","${b.paymentStatus}","${b.createdAt}"`
      ).join('\n');

      res.writeHead(200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="passenger-bookings.csv"',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(headers + rows);
    }

    // Fallback 404
    sendJson(res, 404, { success: false, message: `Endpoint ${method} ${pathname} not found.` });

  } catch (err) {
    console.error('API Server error:', err);
    sendJson(res, 500, { success: false, error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Anusha Porter Passenger Services Server Running on:`);
  console.log(`   ➜ Customer Flow UI: http://localhost:${PORT}/passenger-booking.html`);
  console.log(`   ➜ Admin Flow UI:    http://localhost:${PORT}/passenger-admin.html`);
  console.log(`   ➜ API Base URL:     http://localhost:${PORT}/api/passenger`);
  console.log(`======================================================\n`);
});
