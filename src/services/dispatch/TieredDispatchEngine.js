/**
 * TieredDispatchEngine.js
 * 
 * Production-ready Dispatch & Telemetry Engine for Anusha Porter.
 * Implements Rapido / Swiggy style Tiered Auto-Assignment & ₹0 Wallet Online Policy:
 * 
 * 1. Tier 1 (<= 5km) broadcast with 60-second countdown.
 * 2. Tier 2 (<= 10km) automatic expansion if unaccepted after 60s.
 * 3. Audio Ringtone synthesizer via Web Audio API (no external MP3 dependencies).
 * 4. WebSocket (ws://<domain>/ws/telemetry) emulation with 'driver:offer:new' & 'driver:offer:stop'.
 * 5. Atomic winner lock with 409 Conflict 'TOO_LATE' handling for competing drivers.
 * 6. Silent Push (FCM) payload dispatch for background dismissal.
 * 7. ₹0 Wallet Online policy enforcement with configurable admin threshold.
 */

class SoundSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.isMuted = false;
  }

  initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playUrgentBeep() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      // Dual-tone melodic ringer (E5 659Hz -> A5 880Hz -> C#6 1108Hz)
      const tones = [
        { freq: 880, start: 0, duration: 0.12 },
        { freq: 1174.66, start: 0.14, duration: 0.22 }
      ];

      tones.forEach(({ freq, start, duration }) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + start);

        gain.gain.setValueAtTime(0.001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.28, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + start);
        osc.stop(now + start + duration);
      });
    } catch (err) {
      console.warn('[SoundSynthesizer] Audio playback error:', err);
    }
  }

  startRinging() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.playUrgentBeep();
    this.intervalId = setInterval(() => {
      if (this.isPlaying) {
        this.playUrgentBeep();
      }
    }, 750);
  }

  stopRinging() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isPlaying) {
      this.stopRinging();
      this.isPlaying = true; // keep playing state active without sound
    }
    return this.isMuted;
  }
}

export const soundSynthesizer = new SoundSynthesizer();

export function normalizeVehicleCategoryKey(str) {
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

export function isStrictVehicleMatching(requestedVehicle, driverCategoryOrLabel) {
  return normalizeVehicleCategoryKey(requestedVehicle) === normalizeVehicleCategoryKey(driverCategoryOrLabel);
}

class TieredDispatchEngine {
  constructor() {
    // Configurable dispatch parameters
    this.config = {
      tier1RadiusKm: 5.0,
      tier1DurationSec: 60,
      tier2RadiusKm: 10.0,
      tier2DurationSec: 60,
      minWalletBalanceToOnline: 0.0, // ₹0.00 by default (Rapido / Swiggy model)
      speedMultiplier: 1 // 1 for real time, can be increased for faster demo testing
    };

    // Pre-configured online drivers representing distinct vehicle categories
    this.drivers = [
      {
        id: 10,
        name: 'Ankit Sharma',
        phone: '+91 98765 11001',
        vehicleNumber: 'TS 09 BK 2021',
        vehicleCategory: '2 Wheeler',
        vehicleLabel: '2 Wheeler (Bajaj Pulsar)',
        rating: 4.9,
        walletBalance: 0.00, // ₹0 Wallet Online test driver!
        status: 'online',
        distanceKm: 1.2, // Tier 1 (<= 5km)
        latitude: 17.4486,
        longitude: 78.3808,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      },
      {
        id: 12,
        name: 'Ramesh Kumar',
        phone: '+91 98765 43210',
        vehicleNumber: 'TS 09 AB 1234',
        vehicleCategory: 'Tata Ace',
        vehicleLabel: 'Tata Ace Gold',
        rating: 4.8,
        walletBalance: 0.00, // ₹0 Wallet Online driver
        status: 'online',
        distanceKm: 1.8, // Tier 1 (<= 5km)
        latitude: 17.4495,
        longitude: 78.3850,
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
      },
      {
        id: 20,
        name: 'Mohammed Rafiq',
        phone: '+91 98111 88776',
        vehicleNumber: 'TS 07 TR 4432',
        vehicleCategory: '3 Wheeler',
        vehicleLabel: '3 Wheeler (Auto Rickshaw)',
        rating: 4.7,
        walletBalance: 150.00,
        status: 'online',
        distanceKm: 2.5, // Tier 1 (<= 5km)
        latitude: 17.4401,
        longitude: 78.3750,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      {
        id: 25,
        name: 'Suresh Patel',
        phone: '+91 98123 45678',
        vehicleNumber: 'TS 08 CD 5678',
        vehicleCategory: 'Pickup 8ft',
        vehicleLabel: 'Pickup 8ft (Bolero Maxi)',
        rating: 4.8,
        walletBalance: 120.00,
        status: 'online',
        distanceKm: 6.8, // Tier 2 (<= 10km, > 5km)
        latitude: 17.4210,
        longitude: 78.3600,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      },
      {
        id: 30,
        name: 'Gurpreet Singh',
        phone: '+91 97777 99881',
        vehicleNumber: 'TS 10 TK 9901',
        vehicleCategory: 'Tata 407',
        vehicleLabel: 'Tata 407 (14ft Truck)',
        rating: 4.9,
        walletBalance: 250.00,
        status: 'online',
        distanceKm: 3.1, // Tier 1 (<= 5km)
        latitude: 17.4310,
        longitude: 78.4100,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      {
        id: 34,
        name: 'Vikram Reddy',
        phone: '+91 97000 11223',
        vehicleNumber: 'TS 07 EF 9012',
        vehicleCategory: '2 Wheeler',
        vehicleLabel: '2 Wheeler (Hero Splendor)',
        rating: 4.7,
        walletBalance: 0.00, // ₹0 driver
        status: 'online',
        distanceKm: 3.4, // Tier 1 (<= 5km)
        latitude: 17.4410,
        longitude: 78.3990,
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
      }
    ];

    // State tracking
    this.activeBookings = new Map(); // bookingId -> BookingObject
    this.activeOffers = new Map();   // bookingId -> Map(driverId -> OfferObject)
    this.listeners = new Set();
    this.eventLogs = [];

    // Ticker interval
    this.ticker = setInterval(() => this.tick(), 1000);
  }

  // Subscribe to engine events (WS telemetry stream simulation)
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, data) {
    const logItem = {
      id: Date.now() + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString(),
      event,
      data
    };
    this.eventLogs.unshift(logItem);
    if (this.eventLogs.length > 100) this.eventLogs.pop();

    this.listeners.forEach(cb => {
      try { cb(event, data, logItem); } catch (e) { console.error(e); }
    });
  }

  // Update dispatch configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.notify('config:updated', this.config);
  }

  // Driver coming online / offline (PUT /api/drivers/me/status)
  setDriverStatus(driverId, newStatus) {
    const driver = this.drivers.find(d => d.id === driverId);
    if (!driver) {
      return { success: false, error: 'DRIVER_NOT_FOUND', message: 'Driver not found' };
    }

    if (newStatus === 'online') {
      const minRequired = Number(this.config.minWalletBalanceToOnline || 0);
      if (minRequired > 0 && Number(driver.walletBalance || 0) < minRequired) {
        return {
          success: false,
          status: 400,
          error: 'WALLET_EMPTY',
          message: `Your wallet balance is ₹${driver.walletBalance.toFixed(2)}. Minimum required balance to go online is ₹${minRequired.toFixed(2)}. Please recharge your wallet.`
        };
      }
    }

    driver.status = newStatus;
    this.notify('driver:status_changed', { driverId, status: newStatus });
    return {
      success: true,
      status: newStatus,
      message: `Driver status updated to ${newStatus}`
    };
  }

  // Customer creates a booking (POST /api/bookings)
  createBooking({
    bookingId = `ANP${Math.floor(100000 + Math.random() * 900000)}`,
    serviceName = 'Tata Ace',
    pickupAddress = 'Madhapur Metro Station, Hyderabad',
    dropAddress = 'Inorbit Mall, Hitech City',
    pickupLat = 17.4486,
    pickupLng = 78.3908,
    dropLat = 17.4345,
    dropLng = 78.3842,
    amount = 350.00,
    distanceKm = 4.5
  } = {}) {
    const booking = {
      bookingId,
      orderId: Math.floor(10 + Math.random() * 90),
      serviceName,
      pickupAddress,
      dropAddress,
      pickupLat,
      pickupLng,
      dropLat,
      dropLng,
      amount: Number(amount),
      distanceKm: Number(distanceKm),
      status: 'searching',
      deliveryOtp: String(Math.floor(1000 + Math.random() * 9000)),
      currentTier: 1,
      createdAt: new Date().toISOString(),
      tier1RemainingSeconds: Math.round(this.config.tier1DurationSec / this.config.speedMultiplier),
      tier2RemainingSeconds: Math.round(this.config.tier2DurationSec / this.config.speedMultiplier),
      assignedDriver: null
    };

    this.activeBookings.set(bookingId, booking);
    this.activeOffers.set(bookingId, new Map());

    this.notify('booking:created', booking);

    // Trigger Tier 1 Broadcast
    this.broadcastTier(bookingId, 1);

    return {
      success: true,
      bookingId: booking.bookingId,
      status: 'searching',
      deliveryOtp: booking.deliveryOtp,
      amount: booking.amount
    };
  }

  // Broadcast to drivers within specified tier radius
  broadcastTier(bookingId, tierNumber) {
    const booking = this.activeBookings.get(bookingId);
    if (!booking || booking.status !== 'searching') return;

    booking.currentTier = tierNumber;
    const radiusLimit = tierNumber === 1 
      ? this.config.tier1RadiusKm 
      : this.config.tier2RadiusKm;

    const offerMap = this.activeOffers.get(bookingId);

    // Find online drivers within radius
    const driversInRadius = this.drivers.filter(d => {
      const isOnline = d.status === 'online';
      const inRadius = d.distanceKm <= radiusLimit;
      return isOnline && inRadius;
    });

    // STRICT VEHICLE DISPATCH: Only notify drivers registered with matching vehicle category
    const eligibleDrivers = driversInRadius.filter(d =>
      isStrictVehicleMatching(booking.serviceName, d.vehicleCategory || d.vehicleLabel)
    );

    // Log vehicle mismatch drops for non-matching drivers within radius
    driversInRadius.forEach(driver => {
      if (!isStrictVehicleMatching(booking.serviceName, driver.vehicleCategory || driver.vehicleLabel)) {
        this.notify('driver:offer:ignored_vehicle_mismatch', {
          event: 'driver:offer:ignored_vehicle_mismatch',
          bookingId: booking.bookingId,
          driverId: driver.id,
          driverName: driver.name,
          driverCategory: driver.vehicleCategory,
          driverVehicle: driver.vehicleLabel,
          requestedService: booking.serviceName,
          message: `Driver #${driver.id} (${driver.vehicleCategory}) ignored: Booking requires '${booking.serviceName}'. Zero push and zero ringtone dispatched.`
        });
      }
    });

    const durationSec = tierNumber === 1 
      ? booking.tier1RemainingSeconds 
      : booking.tier2RemainingSeconds;

    eligibleDrivers.forEach(driver => {
      // Don't overwrite if already offered
      if (!offerMap.has(driver.id)) {
        const offer = {
          type: 'ORDER_OFFER',
          offerId: Math.floor(100 + Math.random() * 900),
          bookingId: booking.bookingId,
          orderId: booking.orderId,
          driverId: driver.id,
          status: 'OFFERED',
          radiusTierKm: radiusLimit,
          pickupDistanceKm: driver.distanceKm,
          distanceKm: booking.distanceKm,
          offeredFare: booking.amount,
          remainingSeconds: durationSec,
          expiresAt: new Date(Date.now() + durationSec * 1000).toISOString(),
          pickupAddress: booking.pickupAddress,
          dropAddress: booking.dropAddress,
          serviceName: booking.serviceName,
          driverName: driver.name,
          driverVehicle: driver.vehicleLabel,
          sound: 'order_alert.mp3',
          goodsCategory: 'General Freight'
        };

        offerMap.set(driver.id, offer);

        // Emit Event 1: driver:offer:new (WebSocket + Push payload)
        this.notify('driver:offer:new', {
          event: 'driver:offer:new',
          bookingId: booking.bookingId,
          driverId: driver.id,
          data: {
            type: 'ORDER_OFFER',
            bookingId: booking.bookingId,
            serviceName: booking.serviceName,
            pickupAddress: booking.pickupAddress,
            dropAddress: booking.dropAddress,
            amount: booking.amount,
            distanceKm: booking.distanceKm,
            sound: 'order_alert.mp3'
          }
        });
      }
    });

    // Start audible siren if at least one eligible driver received the offer
    if (eligibleDrivers.length > 0) {
      soundSynthesizer.startRinging();
    }
  }

  // Periodic tick (decrements timers, triggers tier expansion, handles expiry)
  tick() {
    this.activeBookings.forEach((booking, bookingId) => {
      if (booking.status !== 'searching') return;

      const offerMap = this.activeOffers.get(bookingId);

      if (booking.currentTier === 1) {
        booking.tier1RemainingSeconds -= 1;

        // Decrement remaining seconds on active offers
        if (offerMap) {
          offerMap.forEach(offer => {
            offer.remainingSeconds = Math.max(0, offer.remainingSeconds - 1);
          });
        }

        if (booking.tier1RemainingSeconds <= 0) {
          // Tier 1 expired without acceptance! Expand by +5km to Tier 2
          this.notify('tier:expanded', {
            bookingId,
            previousTier: 1,
            newTier: 2,
            expandedByKm: this.config.tier2RadiusKm - this.config.tier1RadiusKm,
            newRadiusKm: this.config.tier2RadiusKm
          });
          this.broadcastTier(bookingId, 2);
        }
      } else if (booking.currentTier === 2) {
        booking.tier2RemainingSeconds -= 1;

        if (offerMap) {
          offerMap.forEach(offer => {
            offer.remainingSeconds = Math.max(0, offer.remainingSeconds - 1);
          });
        }

        if (booking.tier2RemainingSeconds <= 0) {
          // No driver found after both tiers
          booking.status = 'no_driver_found';
          soundSynthesizer.stopRinging();

          this.notify('booking:no_driver_found', { bookingId });
          if (offerMap) {
            offerMap.forEach((_, driverId) => {
              this.notify('driver:offer:stop', {
                event: 'driver:offer:stop',
                bookingId,
                driverId,
                reason: 'EXPIRED'
              });
            });
          }
        }
      }
    });
  }

  // Fetch active offers for driver (GET /api/driver/offers/active)
  getActiveOffers(driverId) {
    const results = [];
    this.activeOffers.forEach((driverOffers) => {
      const offer = driverOffers.get(driverId);
      if (offer && offer.status === 'OFFERED' && offer.remainingSeconds > 0) {
        results.push({ ...offer });
      }
    });
    return results;
  }

  // Driver responds to offer (POST /api/driver/offers/{bookingId}/respond)
  respondToOffer(bookingId, driverId, accept) {
    const booking = this.activeBookings.get(bookingId);
    if (!booking) {
      return { success: false, status: 'NOT_FOUND', message: 'Booking not found' };
    }

    const offerMap = this.activeOffers.get(bookingId);
    const offer = offerMap ? offerMap.get(driverId) : null;

    if (accept) {
      // ATOMIC CHECK: Did another driver already accept?
      if (booking.status === 'assigned') {
        // Case B: Driver was TOO LATE (409 Conflict)
        soundSynthesizer.stopRinging();
        return {
          success: false,
          status: 'TOO_LATE',
          statusCode: 409,
          bookingId,
          message: 'Another driver partner has already accepted this booking.'
        };
      }

      if (booking.status !== 'searching') {
        soundSynthesizer.stopRinging();
        return {
          success: false,
          status: 'UNAVAILABLE',
          message: 'This booking is no longer available.'
        };
      }

      // Case A: Driver WON the ride (200 OK)
      booking.status = 'assigned';
      const winningDriver = this.drivers.find(d => d.id === driverId) || {
        id: driverId,
        name: 'Assigned Driver',
        phone: '+91 98765 43210',
        vehicleNumber: 'TS 09 AB 1234',
        vehicleLabel: booking.serviceName,
        rating: 4.9,
        latitude: 17.4495,
        longitude: 78.3850
      };
      booking.assignedDriver = winningDriver;

      if (offer) {
        offer.status = 'ASSIGNED';
      }

      // Immediately silence local siren
      soundSynthesizer.stopRinging();

      // Emit Step 6: Stop Ringing & Dismissal to all competing drivers
      // WebSocket 'driver:offer:stop' + FCM Silent Push payload simulation
      if (offerMap) {
        offerMap.forEach((competingOffer, compDriverId) => {
          if (compDriverId !== driverId) {
            competingOffer.status = 'DISMISSED';
            this.notify('driver:offer:stop', {
              event: 'driver:offer:stop',
              bookingId,
              driverId: compDriverId,
              reason: 'ACCEPTED_BY_ANOTHER'
            });

            // Simulated FCM Silent Push payload
            this.notify('fcm:silent_push', {
              driverId: compDriverId,
              data: {
                action: 'STOP_DRIVER_OFFER',
                bookingId,
                reason: 'ACCEPTED_BY_ANOTHER'
              }
            });
          }
        });
      }

      this.notify('booking:assigned', {
        bookingId,
        driver: winningDriver,
        order: booking
      });

      return {
        success: true,
        status: 'ASSIGNED',
        statusCode: 200,
        bookingId,
        driverId,
        message: 'Booking assigned successfully!',
        order: {
          id: booking.orderId,
          bookingId: booking.bookingId,
          serviceName: booking.serviceName,
          pickupAddress: booking.pickupAddress,
          dropAddress: booking.dropAddress,
          amount: booking.amount,
          driver: winningDriver
        }
      };
    } else {
      // Driver tapped REJECT
      if (offer) {
        offer.status = 'REJECTED';
      }

      // Stop ringer for this driver
      soundSynthesizer.stopRinging();

      this.notify('driver:offer:rejected', {
        bookingId,
        driverId,
        status: 'REJECTED'
      });

      return {
        success: true,
        status: 'REJECTED',
        statusCode: 200,
        message: 'Offer rejected.'
      };
    }
  }

  // Customer polls tracking endpoint (GET /api/bookings/{bookingId}/tracking)
  getBookingTracking(bookingId) {
    const booking = this.activeBookings.get(bookingId);
    if (!booking) {
      return { success: false, message: 'Booking not found' };
    }

    if (booking.status === 'searching') {
      return {
        success: true,
        bookingId: booking.bookingId,
        status: 'searching',
        stageNumber: 1,
        driverNotFound: false
      };
    }

    if (booking.status === 'assigned') {
      return {
        success: true,
        bookingId: booking.bookingId,
        status: 'assigned',
        stageNumber: 2,
        driver: {
          name: booking.assignedDriver.name,
          phone: booking.assignedDriver.phone,
          vehicleNumber: booking.assignedDriver.vehicleNumber,
          vehicleLabel: booking.assignedDriver.vehicleLabel,
          rating: booking.assignedDriver.rating,
          latitude: booking.assignedDriver.latitude,
          longitude: booking.assignedDriver.longitude
        }
      };
    }

    if (booking.status === 'no_driver_found') {
      return {
        success: true,
        bookingId: booking.bookingId,
        status: 'searching',
        stageNumber: 1,
        driverNotFound: true
      };
    }

    return {
      success: true,
      bookingId: booking.bookingId,
      status: booking.status,
      stageNumber: 3
    };
  }

  // Customer cancels booking (POST /api/bookings/{bookingId}/cancel)
  cancelBooking(bookingId) {
    const booking = this.activeBookings.get(bookingId);
    if (!booking) {
      return { success: false, message: 'Booking not found' };
    }

    booking.status = 'cancelled';
    soundSynthesizer.stopRinging();

    const offerMap = this.activeOffers.get(bookingId);
    if (offerMap) {
      offerMap.forEach((_, driverId) => {
        this.notify('driver:offer:stop', {
          event: 'driver:offer:stop',
          bookingId,
          driverId,
          reason: 'CANCELLED_BY_CUSTOMER'
        });

        this.notify('fcm:silent_push', {
          driverId,
          data: {
            action: 'STOP_DRIVER_OFFER',
            bookingId,
            reason: 'CANCELLED_BY_CUSTOMER'
          }
        });
      });
    }

    this.notify('booking:cancelled', { bookingId });
    return {
      success: true,
      bookingId,
      status: 'cancelled',
      message: 'Booking cancelled and driver sirens stopped immediately.'
    };
  }
}

export const tieredDispatchEngine = new TieredDispatchEngine();
