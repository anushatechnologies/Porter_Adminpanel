/**
 * passengerApi.js
 * ─────────────────────────────────────────────────────────────────
 * Centralized API service for FLOW 1 — Passengers Ride (Customer App Flow)
 *
 * Base URL   : Resolved from AppState → API_BASE_URL
 * Auth       : Bearer <JWT_TOKEN> via authFetch passed in from context
 *
 * All functions accept `authFetch` as the first argument so they reuse
 * the admin panel's existing token-refresh logic.
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Step 1 — GET /api/passenger/categories
 * Fetch all active vehicle ride categories (Hatchback, Sedan, SUV, EV Cab, Auto)
 */
export async function getPassengerCategories(authFetch) {
  const res = await authFetch('/api/passenger/categories');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 2 — POST /api/passenger/fare-estimate
 * Calculate and lock fare for a given route & vehicle category.
 * Returns fareToken valid for 10 minutes.
 *
 * @param {object} authFetch
 * @param {{
 *   serviceType: string,
 *   vehicleCategoryCode: string,
 *   pickupAddress: string,
 *   dropAddress: string,
 *   pickupLatitude: number,
 *   pickupLongitude: number,
 *   dropLatitude: number,
 *   dropLongitude: number,
 *   passengerCount: number,
 *   luggageCount: number,
 *   couponCode?: string,
 *   stops?: any[]
 * }} payload
 */
export async function getPassengerFareEstimate(authFetch, payload) {
  const res = await authFetch('/api/passenger/fare-estimate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 3 — POST /api/passenger/bookings
 * Create a new ride booking. Returns 201 Created with bookingNumber,
 * trackingNumber, and startOtp.
 *
 * @param {object} authFetch
 * @param {{
 *   fareToken: string,
 *   serviceType: string,
 *   vehicleCategoryCode: string,
 *   pickupAddress: string,
 *   dropAddress: string,
 *   pickupLatitude: number,
 *   pickupLongitude: number,
 *   dropLatitude: number,
 *   dropLongitude: number,
 *   passengerName: string,
 *   passengerPhone: string,
 *   passengerCount: number,
 *   luggageCount: number,
 *   paymentMode: string,
 *   stops?: any[]
 * }} payload
 */
export async function createPassengerBooking(authFetch, payload) {
  const res = await authFetch('/api/passenger/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 4 — GET /api/passenger/bookings/{id}
 * Fetch live booking status. Accepts numeric id, bookingNumber, or trackingNumber.
 * Lifecycle statuses: DRIVER_SEARCHING → DRIVER_ASSIGNED → DRIVER_ARRIVED → IN_TRIP → COMPLETED | CANCELLED
 *
 * @param {object} authFetch
 * @param {string|number} bookingId  — numeric id, bookingNumber, or trackingNumber
 */
export async function getPassengerBookingStatus(authFetch, bookingId) {
  const res = await authFetch(`/api/passenger/bookings/${bookingId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 5 — POST /api/passenger/bookings/{id}/cancel
 * Cancel a ride (customer-initiated).
 *
 * @param {object} authFetch
 * @param {string|number} bookingId
 * @param {{ reason: string, cancelledBy: string }} payload
 */
export async function cancelPassengerBooking(authFetch, bookingId, payload) {
  const res = await authFetch(`/api/passenger/bookings/${bookingId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 6 — POST /api/passenger/bookings/{id}/review
 * Submit post-ride rating and feedback.
 *
 * @param {object} authFetch
 * @param {string|number} bookingId
 * @param {{ rating: number, feedback: string }} payload
 */
export async function submitPassengerReview(authFetch, bookingId, payload) {
  const res = await authFetch(`/api/passenger/bookings/${bookingId}/review`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 7 (Admin) — GET /api/passenger/bookings
 * Fetch all passenger bookings from the backend database.
 *
 * @param {object} authFetch
 */
export async function getAllPassengerBookings(authFetch) {
  try {
    const res = await authFetch('/api/admin/passenger/bookings');
    if (res.ok) return res.json();
  } catch (e) {
    // Continue to fallback
  }
  const res = await authFetch('/api/passenger/bookings');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 8 (Admin) — POST /api/passenger/bookings/{id}/assign
 * Assign a driver to a passenger ride.
 *
 * @param {object} authFetch
 * @param {string|number} bookingId
 * @param {string|number} driverId
 */
export async function assignPassengerDriver(authFetch, bookingId, driverId) {
  const res = await authFetch(`/api/passenger/bookings/${bookingId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ driverId }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 9 (Admin) — PUT /api/passenger/bookings/{id}/status
 * Advance or transition booking lifecycle state.
 *
 * @param {object} authFetch
 * @param {string|number} bookingId
 * @param {string} status
 */
export async function updatePassengerBookingStatus(authFetch, bookingId, status) {
  const res = await authFetch(`/api/passenger/bookings/${bookingId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 10 (Admin) — GET /api/passenger/pricing-config
 * Fetch live passenger fare & vehicle category rate cards.
 *
 * @param {object} authFetch
 */
export async function getPassengerPricingConfig(authFetch) {
  const res = await authFetch('/api/passenger/pricing-config');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 11 (Admin) — POST /api/passenger/pricing-config
 * Publish a new pricing configuration version.
 *
 * @param {object} authFetch
 * @param {object} payload
 */
export async function savePassengerPricingConfig(authFetch, payload) {
  const res = await authFetch('/api/passenger/pricing-config', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 12 (Admin) — GET /api/passenger/coupons
 * Fetch passenger promo coupons.
 *
 * @param {object} authFetch
 */
export async function getPassengerCoupons(authFetch) {
  const res = await authFetch('/api/passenger/coupons');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 13 (Admin) — POST /api/passenger/coupons
 * Create a new promo coupon.
 *
 * @param {object} authFetch
 * @param {object} payload
 */
export async function createPassengerCoupon(authFetch, payload) {
  const res = await authFetch('/api/passenger/coupons', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 14 (Admin) — DELETE /api/passenger/coupons/{id}
 *
 * @param {object} authFetch
 * @param {string|number} couponId
 */
export async function deletePassengerCoupon(authFetch, couponId) {
  const res = await authFetch(`/api/passenger/coupons/${couponId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 15 (Admin) — GET /api/passenger/services
 * Fetch all passenger service categories (One-way, Rental, Airport, etc.)
 *
 * @param {object} authFetch
 */
export async function getPassengerServices(authFetch) {
  const res = await authFetch('/api/passenger/services');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * TypeScript-style interface definitions for reference (JSDoc).
 *
 * @typedef {Object} PassengerCategory
 * @property {string} id
 * @property {'HATCHBACK'|'SEDAN'|'SUV'|'EV_CAB'|'AUTO'} code
 * @property {string} name
 * @property {string} description
 * @property {string} imageUrl
 * @property {number} passengerCapacity
 * @property {number} luggageCapacity
 * @property {number} basePrice
 * @property {number} perKmRate
 * @property {boolean} isActive
 * @property {number} displayOrder
 *
 * @typedef {Object} PassengerFareBreakdown
 * @property {number} baseFare
 * @property {number} distanceFare
 * @property {number} timeFare
 * @property {number} driverAllowance
 * @property {number} waitingCharge
 * @property {number} taxes
 * @property {number} tollFee
 * @property {number} discount
 * @property {number} totalFare
 *
 * @typedef {Object} PassengerFareEstimate
 * @property {string} fareToken
 * @property {string} tokenExpiresAt
 * @property {number} distanceKm
 * @property {number} durationMinutes
 * @property {number} estimatedFare
 * @property {PassengerFareBreakdown} breakdown
 *
 * @typedef {'DRIVER_SEARCHING'|'DRIVER_ASSIGNED'|'DRIVER_ARRIVED'|'IN_TRIP'|'COMPLETED'|'CANCELLED'} BookingStatus
 *
 * @typedef {Object} PassengerBookingResponse
 * @property {boolean} success
 * @property {string} id
 * @property {string} bookingNumber
 * @property {string} trackingNumber
 * @property {BookingStatus} status
 * @property {string} startOtp
 * @property {any} booking
 */
