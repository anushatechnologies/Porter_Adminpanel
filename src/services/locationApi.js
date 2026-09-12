/**
 * locationApi.js
 * ─────────────────────────────────────────────────────────────────
 * Centralized API service for:
 *   Part 1 — Admin Serviceable Areas (Admin Panel)
 *   Part 1 — Map Location Validation (Customer App)
 *   Part 2 — Vehicle Dispatch Rules Reference
 *
 * All functions accept `authFetch` as the first argument to reuse
 * the admin panel's existing Bearer-token / auto-relogin logic.
 * ─────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────
// PART 1A — ADMIN PANEL: Serviceable Area Management
// ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/serviceable-areas?city=Hyderabad
 * Fetch all areas and pincodes for a given city.
 * Call when admin selects a city from the dropdown.
 *
 * @param {Function} authFetch
 * @param {string} city — e.g. "Hyderabad"
 * @returns {Promise<{ success: boolean, city: string, count: number, areas: ServiceableArea[] }>}
 *
 * @typedef {Object} ServiceableArea
 * @property {number} id
 * @property {string} city
 * @property {string} areaName
 * @property {string} pincode
 * @property {boolean} isServiceable
 * @property {number} [centerLat]
 * @property {number} [centerLng]
 * @property {number} [radiusKm]
 */
export async function fetchServiceableAreas(authFetch, city) {
  const res = await authFetch(`/api/admin/serviceable-areas?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * POST /api/admin/serviceable-areas/bulk-update
 * Bulk save admin-approved pincodes for a city.
 * Call when admin clicks "Save Serviceable Areas".
 *
 * @param {Function} authFetch
 * @param {string} city
 * @param {string[]} activePincodes — array of approved pincode strings
 * @returns {Promise<{ success: boolean, city: string, enabledCount: number, disabledCount: number, totalAreasInCity: number, activePincodes: string[] }>}
 */
export async function bulkUpdateServiceableAreas(authFetch, city, activePincodes) {
  const res = await authFetch('/api/admin/serviceable-areas/bulk-update', {
    method: 'POST',
    body: JSON.stringify({ city, activePincodes }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * PUT /api/admin/serviceable-areas/{id}/toggle
 * Toggle a single area's serviceability on or off.
 * Call when admin flips an individual switch.
 *
 * @param {Function} authFetch
 * @param {number|string} areaId
 */
export async function toggleServiceableArea(authFetch, areaId) {
  const res = await authFetch(`/api/admin/serviceable-areas/${areaId}/toggle`, {
    method: 'PUT',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * POST /api/admin/serviceable-areas
 * Add a brand-new area and pincode to the admin registry.
 *
 * @param {Function} authFetch
 * @param {{ city: string, areaName: string, pincode: string, isServiceable: boolean, centerLat: number, centerLng: number, radiusKm: number }} payload
 */
export async function addServiceableArea(authFetch, payload) {
  const res = await authFetch('/api/admin/serviceable-areas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────
// PART 1B — CUSTOMER APP: Location Validation
// ─────────────────────────────────────────────────────────────────

/**
 * POST /api/location/validate-serviceable
 * Validate whether a lat/lng coordinate or pincode is within an admin-approved serviceable area.
 *
 * @param {Function} authFetch
 * @param {{ lat?: number, lng?: number, latitude?: number, longitude?: number, pincode?: string, city?: string }} payload
 */
export async function validateServiceableArea(authFetch, payload) {
  const body = {
    lat: payload.lat ?? payload.latitude,
    lng: payload.lng ?? payload.longitude,
    pincode: payload.pincode,
    city: payload.city || 'Hyderabad',
  };
  const res = await authFetch('/api/location/validate-serviceable', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────
// PART 2 — VEHICLE DISPATCH RULES (Backend-guaranteed, frontend reference)
// ─────────────────────────────────────────────────────────────────

/**
 * Expanding Radius Dispatch Tiers & Strict Vehicle Isolation Rules.
 *
 * FRONTEND NOTE:
 *   Send only `serviceName` (or `vehicleCategoryCode`) in POST /api/orders.
 *   The backend dispatch engine handles all filtering — no client logic needed.
 *
 * DISPATCH FLOW:
 *   Customer selects vehicle → Order created → Backend Auto-Assignment Engine
 *   → Filter by driver.vehicleCategory === order.vehicleType
 *   → Send push notification + continuous ringtone ONLY to matching drivers
 *   → Other vehicle types receive ZERO notifications
 *
 * NOTIFICATION PAYLOAD (received by driver app):
 *   {
 *     type: "ORDER_OFFER",
 *     bookingId: "ANP102934",
 *     serviceName: "2 Wheeler",
 *     pickup: { address: "Madhapur, Hyderabad", lat: 17.4486, lng: 78.3908 },
 *     drop: { address: "Gachibowli, Hyderabad", lat: 17.4401, lng: 78.3489 },
 *     fare: 149.00,
 *     distanceKm: 5.2,
 *     expiresInSeconds: 30
 *   }
 *
 * DRIVER APP LIFECYCLE:
 *   1. Play continuous looping sound (`order_offer_ring.mp3`), display 30s countdown
 *   2. On Accept: POST /api/driver/orders/{bookingId}/accept
 *      Backend broadcasts ORDER_ASSIGNED to other drivers in pool to STOP sound & dismiss
 *   3. On Reject or 30s timeout: stop sound, dismiss modal, backend escalates to next tier
 */
export const DISPATCH_RULES = {
  radiusTiers: [
    { tier: 1, radiusKm: 3, label: '3 km — Primary Vicinity', desc: 'Initial broadcast to closest available matching drivers (0–30s)' },
    { tier: 2, radiusKm: 5, label: '5 km — Expanded Radius',  desc: 'Triggered if no driver accepts within 30 seconds' },
    { tier: 3, radiusKm: 8, label: '8 km — Outer Perimeter',   desc: 'Final broadcast ring before prompting customer to retry' },
  ],
  vehicleIsolationRules: [
    {
      vehicleType: '2-Wheeler (Bike)',
      serviceNameValues: ['2 Wheeler', 'Bike', 'two_wheeler'],
      eligiblePool: '2-Wheeler / Bike drivers only',
      icon: '🛵',
      color: '#6366F1',
      blocked: '3-Wheeler, Tata Ace, Pickup 8ft, Truck drivers',
    },
    {
      vehicleType: '3-Wheeler (Auto)',
      serviceNameValues: ['3 Wheeler', '3 Wheeler / Auto', 'auto_rickshaw'],
      eligiblePool: '3-Wheeler / Auto drivers only',
      icon: '🛺',
      color: '#F59E0B',
      blocked: '2-Wheeler, Tata Ace, Pickup 8ft, Truck drivers',
    },
    {
      vehicleType: 'Tata Ace (750 kg)',
      serviceNameValues: ['Tata Ace', 'tata_ace'],
      eligiblePool: 'Tata Ace drivers only',
      icon: '🚛',
      color: '#10B981',
      blocked: '2-Wheeler, 3-Wheeler, Pickup 8ft, Truck drivers',
    },
    {
      vehicleType: 'Pickup 8ft (1200 kg)',
      serviceNameValues: ['Pickup 8ft', 'pickup_8ft'],
      eligiblePool: 'Pickup 8ft drivers only',
      icon: '🚐',
      color: '#3B82F6',
      blocked: '2-Wheeler, 3-Wheeler, Tata Ace, Truck drivers',
    },
    {
      vehicleType: 'Tata 407 / 14ft Truck',
      serviceNameValues: ['Tata 407', 'tata_407', '14ft Truck'],
      eligiblePool: 'Tata 407 / Truck drivers only',
      icon: '🚚',
      color: '#EF4444',
      blocked: '2-Wheeler, 3-Wheeler, Tata Ace, Pickup 8ft drivers',
    },
    {
      vehicleType: 'Passenger Cabs (Sedan / SUV)',
      serviceNameValues: ['HATCHBACK', 'SEDAN', 'SUV', 'EV_CAB', 'AUTO'],
      eligiblePool: 'Passenger car drivers only',
      icon: '🚗',
      color: '#8B5CF6',
      blocked: 'All goods transport vehicle drivers',
    },
  ],

  /** Notification payload received by driver app */
  driverNotificationPayload: {
    type: 'ORDER_OFFER',
    bookingId: 'ANP102934',
    serviceName: '2 Wheeler',
    pickup: {
      address: 'Madhapur, Hyderabad',
      lat: 17.4486,
      lng: 78.3908
    },
    drop: {
      address: 'Gachibowli, Hyderabad',
      lat: 17.4401,
      lng: 78.3489
    },
    fare: 149.00,
    distanceKm: 5.2,
    expiresInSeconds: 30
  },

  driverAppLifecycleEvents: [
    {
      event: 'ORDER_OFFER',
      action: 'Start continuous looping sound (order_offer_ring.mp3) and display full-screen offer modal with 30s countdown',
      badge: 'ALERT',
      color: '#F59E0B'
    },
    {
      event: 'ORDER_ACCEPTED',
      action: 'POST /api/driver/orders/{id}/accept — current driver transitions to navigation; backend broadcasts ORDER_ASSIGNED',
      badge: 'ACCEPTED',
      color: '#10B981'
    },
    {
      event: 'ORDER_ASSIGNED',
      action: 'Received via WebSocket / FCM by other drivers in pool — immediately stops ringtone and dismisses offer modal',
      badge: 'STOP RING',
      color: '#3B82F6'
    },
    {
      event: 'OFFER_TIMEOUT',
      action: 'Timer reaches 0s — stop sound, dismiss modal, backend escalates to Tier 2 (5km) or Tier 3 (8km)',
      badge: 'TIMEOUT',
      color: '#6B7280'
    },
  ],
};
