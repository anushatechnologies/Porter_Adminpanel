/**
 * packersApi.js
 * ─────────────────────────────────────────────────────────────────
 * Centralized API service for FLOW 2 — Packers & Movers (Customer App Flow)
 *
 * All functions accept `authFetch` as the first argument so they reuse
 * the admin panel's existing Bearer-token / auto-relogin logic.
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Step 1 — GET /api/customer/services?category=packers
 * Fetch available house-size shifting services (1RK, 1BHK, 2BHK, 3BHK).
 */
export async function getPackerServices(authFetch) {
  const res = await authFetch('/api/customer/services?category=packers');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 2 — GET /api/addons?category=packers
 * Fetch all available shifting add-ons (bubble wrap, AC uninstall, etc.)
 */
export async function getPackerAddons(authFetch) {
  const res = await authFetch('/api/addons?category=packers');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 3 — GET /api/services/{id}/slots?date=YYYY-MM-DD
 * Fetch available time slots for a given service and date.
 *
 * @param {Function} authFetch
 * @param {string} serviceId   — e.g. "pm-1bhk"
 * @param {string} date        — ISO date "YYYY-MM-DD"
 */
export async function getPackerSlots(authFetch, serviceId, date) {
  const res = await authFetch(`/api/services/${serviceId}/slots?date=${date}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 4 — POST /api/pricing/packers
 * Calculate full pricing breakdown including floor charges, addons, GST, advance.
 *
 * @param {Function} authFetch
 * @param {{
 *   serviceId: string,
 *   distanceKm: number,
 *   pickupFloor: number,
 *   dropFloor: number,
 *   hasPickupLift: boolean,
 *   hasDropLift: boolean,
 *   addonIds: string[],
 *   couponCode?: string
 * }} payload
 */
export async function calculatePackersPricing(authFetch, payload) {
  const res = await authFetch('/api/pricing/packers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 5 — POST /api/bookings
 * Confirm Packers & Movers booking after ₹500 advance payment.
 *
 * @param {Function} authFetch
 * @param {{
 *   serviceId: string,
 *   scheduledDate: string,
 *   scheduledSlot: string,
 *   pickup: { address: string, latitude: number, longitude: number, floor: number, hasLift: boolean },
 *   drop: { address: string, latitude: number, longitude: number, floor: number, hasLift: boolean },
 *   selectedAddons: string[],
 *   pricing: object,
 *   payment: { method: string, advanceAmount: number, transactionId: string }
 * }} payload
 */
export async function createPackersBooking(authFetch, payload) {
  const res = await authFetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 6 — GET /api/bookings/{id}/tracking
 * Fetch 8-stage live shifting tracking status including timeline, supervisor, deliveryOtp.
 *
 * @param {Function} authFetch
 * @param {string} bookingId — e.g. "PM-1724501234"
 */
export async function getPackersTracking(authFetch, bookingId) {
  const res = await authFetch(`/api/bookings/${bookingId}/tracking`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 7 — POST /api/bookings/{id}/verify-otp
 * Verify 4-digit delivery OTP to mark the move as completed.
 *
 * @param {Function} authFetch
 * @param {string} bookingId
 * @param {string} otp — 4-digit string
 */
export async function verifyPackersOtp(authFetch, bookingId, otp) {
  const res = await authFetch(`/api/bookings/${bookingId}/verify-otp`, {
    method: 'POST',
    body: JSON.stringify({ otp }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 8 — POST /api/bookings/{id}/reschedule
 * Reschedule an existing Packers & Movers booking to a new date/slot.
 *
 * @param {Function} authFetch
 * @param {string} bookingId
 * @param {{ newDate: string, newSlot: string }} payload
 */
export async function reschedulePackersBooking(authFetch, bookingId, payload) {
  const res = await authFetch(`/api/bookings/${bookingId}/reschedule`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 9 — POST /api/bookings/{id}/cancel
 * Cancel a Packers & Movers booking and initiate advance refund.
 *
 * @param {Function} authFetch
 * @param {string} bookingId
 * @param {{ reason: string }} payload
 */
export async function cancelPackersBooking(authFetch, bookingId, payload) {
  const res = await authFetch(`/api/bookings/${bookingId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 10 — POST /api/bookings/{id}/review
 * Submit post-move crew rating and feedback.
 *
 * @param {Function} authFetch
 * @param {string} bookingId
 * @param {{ rating: number, feedback: string }} payload
 */
export async function submitPackersReview(authFetch, bookingId, payload) {
  const res = await authFetch(`/api/bookings/${bookingId}/review`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * JSDoc type definitions for Packers & Movers models
 *
 * @typedef {'pm-1rk'|'pm-1bhk'|'pm-2bhk'|'pm-3bhk'} PackerServiceId
 *
 * @typedef {Object} PackerService
 * @property {PackerServiceId} id
 * @property {string} name
 * @property {string} description
 * @property {number} basePrice
 * @property {string} priceLabel
 * @property {string} icon
 * @property {string} estimatedDuration
 * @property {string[]} features
 *
 * @typedef {Object} PackerAddon
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {number} price
 * @property {string} unit
 * @property {string} description
 * @property {string} icon
 *
 * @typedef {Object} PackerSlot
 * @property {string} id
 * @property {string} time
 * @property {string} slot
 * @property {boolean} isAvailable
 * @property {number} surgeFee
 *
 * @typedef {Object} PackerPricingBreakdown
 * @property {number} basePrice
 * @property {number} distanceCharge
 * @property {number} floorCharge
 * @property {number} addonsTotal
 * @property {number} subtotal
 * @property {number} discount
 * @property {number} gst
 * @property {number} advancePayable
 * @property {number} remainingPayable
 * @property {number} totalPrice
 *
 * @typedef {Object} PackerTrackingTimeline
 * @property {number} id
 * @property {string} title
 * @property {boolean} completed
 * @property {string} [timestamp]
 */
