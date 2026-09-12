/**
 * passenger-api-server.cjs
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

// ── Serviceable Areas & Pincode Registry ──
let serviceableAreas = [
  { id: 1, city: 'Hyderabad', areaName: 'Hitech City', pincode: '500081', isServiceable: true, centerLat: 17.4486, centerLng: 78.3808, radiusKm: 5.0 },
  { id: 2, city: 'Hyderabad', areaName: 'Madhapur', pincode: '500086', isServiceable: true, centerLat: 17.4486, centerLng: 78.3908, radiusKm: 4.5 },
  { id: 3, city: 'Hyderabad', areaName: 'Gachibowli', pincode: '500032', isServiceable: true, centerLat: 17.4401, centerLng: 78.3489, radiusKm: 5.0 },
  { id: 4, city: 'Hyderabad', areaName: 'Jubilee Hills', pincode: '500033', isServiceable: true, centerLat: 17.4319, centerLng: 78.4073, radiusKm: 4.0 },
  { id: 5, city: 'Hyderabad', areaName: 'Kondapur', pincode: '500084', isServiceable: true, centerLat: 17.4699, centerLng: 78.3578, radiusKm: 4.5 },
  { id: 6, city: 'Hyderabad', areaName: 'Banjara Hills', pincode: '500034', isServiceable: true, centerLat: 17.4156, centerLng: 78.4350, radiusKm: 4.0 },
  { id: 7, city: 'Hyderabad', areaName: 'Kukatpally', pincode: '500072', isServiceable: true, centerLat: 17.4933, centerLng: 78.3995, radiusKm: 5.0 },
  { id: 8, city: 'Hyderabad', areaName: 'Begumpet', pincode: '500016', isServiceable: true, centerLat: 17.4447, centerLng: 78.4664, radiusKm: 4.0 },
  { id: 9, city: 'Hyderabad', areaName: 'Secunderabad', pincode: '500003', isServiceable: true, centerLat: 17.4399, centerLng: 78.4983, radiusKm: 6.0 },
  { id: 10, city: 'Hyderabad', areaName: 'Ameerpet', pincode: '500038', isServiceable: true, centerLat: 17.4375, centerLng: 78.4482, radiusKm: 3.5 },
  { id: 11, city: 'Hyderabad', areaName: 'Shamshabad Airport Zone', pincode: '501218', isServiceable: false, centerLat: 17.2403, centerLng: 78.4294, radiusKm: 8.0 },
  { id: 12, city: 'Hyderabad', areaName: 'Medchal Industrial Area', pincode: '501401', isServiceable: false, centerLat: 17.6297, centerLng: 78.4814, radiusKm: 7.0 },
  { id: 13, city: 'Hyderabad', areaName: 'Ghatkesar Outer Ring', pincode: '501301', isServiceable: false, centerLat: 17.4526, centerLng: 78.6837, radiusKm: 6.0 }
];

// ── Strict Vehicle Dispatch Fleet & Active Orders ──
let orderBookings = new Map(); // bookingId -> order
let driverOffers = new Map();  // bookingId -> Map(driverId -> offer)

const strictFleetDrivers = [
  { id: 10, name: 'Ankit Sharma', phone: '+91 98765 11001', vehicleCategory: '2 Wheeler', vehicleLabel: 'Bajaj Pulsar (Bike)', walletBalance: 0.0, status: 'online', distanceKm: 1.2 },
  { id: 12, name: 'Ramesh Kumar', phone: '+91 98765 43210', vehicleCategory: 'Tata Ace', vehicleLabel: 'Tata Ace Gold', walletBalance: 0.0, status: 'online', distanceKm: 1.8 },
  { id: 20, name: 'Mohammed Rafiq', phone: '+91 98111 88776', vehicleCategory: '3 Wheeler', vehicleLabel: 'Bajaj RE Auto Rickshaw', walletBalance: 150.0, status: 'online', distanceKm: 2.5 },
  { id: 25, name: 'Suresh Patel', phone: '+91 98123 45678', vehicleCategory: 'Pickup 8ft', vehicleLabel: 'Mahindra Bolero Maxi Truck', walletBalance: 120.0, status: 'online', distanceKm: 6.8 },
  { id: 30, name: 'Gurpreet Singh', phone: '+91 97777 99881', vehicleCategory: 'Tata 407', vehicleLabel: 'Tata 407 SFC 14ft Truck', walletBalance: 250.0, status: 'online', distanceKm: 3.1 },
  { id: 34, name: 'Vikram Reddy', phone: '+91 97000 11223', vehicleCategory: '2 Wheeler', vehicleLabel: 'Hero Splendor (Bike)', walletBalance: 0.0, status: 'online', distanceKm: 3.4 }
];

function normalizeVehicleCategoryKey(str) {
  if (!str) return '';
  const s = String(str).toLowerCase().trim();
  if (s.includes('2') || s.includes('bike') || s.includes('two') || s.includes('motorcycle') || s.includes('scooter')) {
    return '2_WHEELER';
  }
  if (s.includes('3') || s.includes('three') || s.includes('auto') || s.includes('rickshaw')) {
    return '3_WHEELER';
  }
  if (s.includes('ace') || s.includes('tata_ace') || s.includes('chhota')) {
    return 'TATA_ACE';
  }
  if (s.includes('pickup') || s.includes('8ft') || s.includes('maxi') || s.includes('bolero')) {
    return 'PICKUP_8FT';
  }
  if (s.includes('407') || s.includes('truck') || s.includes('14ft') || s.includes('eicher')) {
    return 'TATA_407';
  }
  return s;
}

function isStrictVehicleMatching(requestedVehicle, driverCategory) {
  return normalizeVehicleCategoryKey(requestedVehicle) === normalizeVehicleCategoryKey(driverCategory);
}

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
      const catKey = normCode.includes('bike') || normCode.includes('moto') || normCode.includes('two') ? 'bike_taxi'
                   : normCode.includes('scoot') ? 'scooter'
                   : normCode.includes('auto') || normCode.includes('rick') ? 'auto'
                   : normCode.includes('hatch') ? 'hatchback'
                   : normCode.includes('suv') && normCode.includes('prem') ? 'premium'
                   : normCode.includes('suv') ? 'suv'
                   : normCode.includes('lux') ? 'luxury'
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
      if (serviceType === 'AIRPORT' || (dropAddress && dropAddress.toLowerCase().includes('airport'))) {
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

    // ══════════════════════════════════════════════════════════════════
    // PART 1: ADMIN-APPROVED SERVICEABLE AREAS & MAP VALIDATION
    // ══════════════════════════════════════════════════════════════════

    // 1. GET /api/admin/serviceable-areas?city=Hyderabad
    if (pathname === '/api/admin/serviceable-areas' && method === 'GET') {
      const city = parsedUrl.query.city || 'Hyderabad';
      const areas = serviceableAreas.filter(a => a.city.toLowerCase() === city.toLowerCase());
      return sendJson(res, 200, {
        success: true,
        city,
        count: areas.length,
        areas
      });
    }

    // 2. POST /api/admin/serviceable-areas/bulk-update
    if (pathname === '/api/admin/serviceable-areas/bulk-update' && method === 'POST') {
      const body = await parseBody(req);
      const city = body.city || 'Hyderabad';
      const activePincodes = Array.isArray(body.activePincodes) ? body.activePincodes.map(String) : [];

      let enabledCount = 0;
      let disabledCount = 0;
      let totalInCity = 0;

      serviceableAreas.forEach(a => {
        if (a.city.toLowerCase() === city.toLowerCase()) {
          totalInCity++;
          if (activePincodes.includes(String(a.pincode))) {
            a.isServiceable = true;
            enabledCount++;
          } else {
            a.isServiceable = false;
            disabledCount++;
          }
        }
      });

      return sendJson(res, 200, {
        success: true,
        city,
        enabledCount,
        disabledCount,
        totalAreasInCity: totalInCity,
        activePincodes
      });
    }

    // 3. PUT /api/admin/serviceable-areas/:id/toggle
    if (pathname.match(/^\/api\/admin\/serviceable-areas\/([^\/]+)\/toggle$/) && method === 'PUT') {
      const areaId = Number(req.url.split('/')[4]);
      const area = serviceableAreas.find(a => a.id === areaId);
      if (!area) return sendJson(res, 404, { success: false, message: 'Service area not found' });

      area.isServiceable = !area.isServiceable;
      return sendJson(res, 200, {
        success: true,
        message: `Service area ${area.areaName} is now ${area.isServiceable ? 'SERVICEABLE' : 'RESTRICTED'}.`,
        area
      });
    }

    // 4. POST /api/admin/serviceable-areas (Add new area)
    if (pathname === '/api/admin/serviceable-areas' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.areaName || !body.pincode) {
        return sendJson(res, 400, { success: false, message: 'areaName and pincode are required' });
      }

      const newArea = {
        id: Date.now(),
        city: body.city || 'Hyderabad',
        areaName: body.areaName,
        pincode: String(body.pincode),
        isServiceable: body.isServiceable !== false,
        centerLat: Number(body.centerLat) || 17.4486,
        centerLng: Number(body.centerLng) || 78.3808,
        radiusKm: Number(body.radiusKm) || 5.0
      };

      serviceableAreas.push(newArea);
      return sendJson(res, 201, {
        success: true,
        message: 'Serviceable area created successfully.',
        area: newArea
      });
    }

    // 5. POST /api/location/validate-serviceable
    if (pathname === '/api/location/validate-serviceable' && method === 'POST') {
      const body = await parseBody(req);
      const { lat, lng, pincode, city = 'Hyderabad' } = body;

      const cityAreas = serviceableAreas.filter(a => a.city.toLowerCase() === String(city).toLowerCase());

      // Check match by pincode first
      let matched = null;
      if (pincode) {
        matched = cityAreas.find(a => String(a.pincode) === String(pincode));
      }

      // Check match by coordinate distance
      if (!matched && lat && lng) {
        let closest = null;
        let minDistance = Infinity;
        cityAreas.forEach(a => {
          if (a.centerLat && a.centerLng) {
            const dLat = (a.centerLat - Number(lat)) * 111;
            const dLng = (a.centerLng - Number(lng)) * 111 * Math.cos(Number(lat) * Math.PI / 180);
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist < minDistance) {
              minDistance = dist;
              closest = { area: a, dist };
            }
          }
        });

        if (closest && closest.dist <= (closest.area.radiusKm || 5.0)) {
          matched = closest.area;
        }
      }

      const approvedAreas = cityAreas
        .filter(a => a.isServiceable)
        .map(a => `${a.areaName} (${a.pincode})`);

      if (matched && matched.isServiceable) {
        return sendJson(res, 200, {
          success: true,
          serviceable: true,
          areaName: matched.areaName,
          pincode: matched.pincode,
          city: matched.city,
          message: 'Location is in an admin-approved serviceable zone.'
        });
      } else {
        const pin = pincode || (matched ? matched.pincode : '501218');
        return sendJson(res, 200, {
          success: true,
          serviceable: false,
          pincode: pin,
          city,
          message: `Porter service is not currently available at this location (Pincode: ${pin}). Please choose an approved area in ${city}.`,
          approvedAreas
        });
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // PART 2: STRICT VEHICLE TYPE DISPATCH & NOTIFICATIONS
    // ══════════════════════════════════════════════════════════════════

    // GET /api/dispatch/drivers
    if (pathname === '/api/dispatch/drivers' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        drivers: strictFleetDrivers
      });
    }

    // POST /api/orders or POST /api/bookings
    if ((pathname === '/api/orders' || pathname === '/api/bookings') && method === 'POST') {
      const body = await parseBody(req);
      const {
        pickupAddress = 'Cyber Towers, Hitech City, Hyderabad',
        dropAddress = 'DLF Cyber City, Gachibowli, Hyderabad',
        pickupLat = 17.4504,
        pickupLng = 78.3811,
        dropLat = 17.4474,
        dropLng = 78.3565,
        serviceName = '2 Wheeler',
        amount = 99.00,
        paymentMethod = 'Cash'
      } = body;

      const bookingId = `ANP${Math.floor(100000 + Math.random() * 900000)}`;
      const order = {
        bookingId,
        orderId: Math.floor(1000 + Math.random() * 9000),
        serviceName,
        pickupAddress,
        dropAddress,
        pickupLat,
        pickupLng,
        dropLat,
        dropLng,
        amount: Number(amount),
        paymentMethod,
        status: 'SEARCHING',
        currentTier: 1,
        createdAt: new Date().toISOString(),
        assignedDriver: null
      };

      orderBookings.set(bookingId, order);
      const offersForBooking = new Map();

      // STRICT FILTER: Match only drivers registered with the requested vehicle type
      const notifiedDrivers = [];
      const skippedDrivers = [];

      strictFleetDrivers.forEach(driver => {
        const matchesVehicle = isStrictVehicleMatching(serviceName, driver.vehicleCategory);
        if (matchesVehicle) {
          const offer = {
            type: 'ORDER_OFFER',
            offerId: `OFF-${Math.floor(100 + Math.random() * 900)}`,
            bookingId,
            driverId: driver.id,
            serviceName,
            pickupAddress,
            dropAddress,
            amount: Number(amount),
            sound: 'order_alert.mp3',
            status: 'OFFERED',
            driverName: driver.name,
            driverVehicle: driver.vehicleLabel,
            radiusTierKm: driver.distanceKm <= 5.0 ? 5.0 : 10.0,
            remainingSeconds: 60
          };
          offersForBooking.set(driver.id, offer);
          notifiedDrivers.push({
            driverId: driver.id,
            name: driver.name,
            vehicle: driver.vehicleLabel,
            category: driver.vehicleCategory,
            soundRinging: true
          });
        } else {
          skippedDrivers.push({
            driverId: driver.id,
            name: driver.name,
            vehicle: driver.vehicleLabel,
            category: driver.vehicleCategory,
            reason: `Mismatched vehicle type (${driver.vehicleCategory} != ${serviceName})`,
            soundRinging: false
          });
        }
      });

      driverOffers.set(bookingId, offersForBooking);

      return sendJson(res, 201, {
        success: true,
        bookingId,
        serviceName,
        status: 'SEARCHING',
        amount: Number(amount),
        totalDriversOnline: strictFleetDrivers.length,
        notifiedDriverCount: notifiedDrivers.length,
        notifiedDrivers,
        skippedDrivers,
        message: `Order created. Notified ${notifiedDrivers.length} matching '${serviceName}' drivers within radius. Competing vehicle types receive zero notifications and zero sound.`
      });
    }

    // GET /api/driver/offers/active?driverId=10
    if (pathname === '/api/driver/offers/active' && method === 'GET') {
      const driverId = Number(parsedUrl.query.driverId || 10);
      const active = [];
      driverOffers.forEach((offers) => {
        const o = offers.get(driverId);
        if (o && o.status === 'OFFERED') {
          active.push(o);
        }
      });

      return sendJson(res, 200, {
        success: true,
        driverId,
        count: active.length,
        offers: active
      });
    }

    // POST /api/driver/offers/:id/respond
    if (pathname.match(/^\/api\/driver\/offers\/([^\/]+)\/respond$/) && method === 'POST') {
      const bookingId = req.url.split('/')[4];
      const body = await parseBody(req);
      const { driverId, accept } = body;

      const order = orderBookings.get(bookingId);
      if (!order) {
        return sendJson(res, 404, { success: false, message: 'Booking not found' });
      }

      const offers = driverOffers.get(bookingId);
      const driverOffer = offers ? offers.get(Number(driverId)) : null;

      if (accept) {
        // ATOMIC CHECK: Did another driver already accept?
        if (order.status === 'ASSIGNED') {
          return sendJson(res, 409, {
            success: false,
            statusCode: 409,
            status: 'TOO_LATE',
            bookingId,
            message: 'Another driver partner has already accepted this booking.'
          });
        }

        order.status = 'ASSIGNED';
        const winningDriver = strictFleetDrivers.find(d => d.id === Number(driverId)) || { id: driverId, name: 'Assigned Driver' };
        order.assignedDriver = winningDriver;

        if (driverOffer) driverOffer.status = 'ASSIGNED';

        // Stop ringing and dismiss offers for competing drivers
        if (offers) {
          offers.forEach((compOffer, compDriverId) => {
            if (compDriverId !== Number(driverId)) {
              compOffer.status = 'DISMISSED';
              compOffer.dismissReason = 'ACCEPTED_BY_ANOTHER';
            }
          });
        }

        return sendJson(res, 200, {
          success: true,
          statusCode: 200,
          status: 'ASSIGNED',
          bookingId,
          driverId,
          message: 'Booking assigned successfully! All other drivers dismissed with ORDER_ACCEPTED_STOP_RING.',
          order
        });
      } else {
        if (driverOffer) driverOffer.status = 'REJECTED';
        return sendJson(res, 200, {
          success: true,
          statusCode: 200,
          status: 'REJECTED',
          bookingId,
          driverId,
          message: 'Offer rejected. Ringing stopped with ORDER_REJECTED_DISMISS.'
        });
      }
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
