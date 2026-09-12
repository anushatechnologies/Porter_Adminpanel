/**
 * Abstracted Notification Service
 * 
 * Simulates multi-channel notifications (Push, SMS, WhatsApp, Email)
 * for customer and driver lifecycle events.
 */

export const NOTIFICATION_CHANNELS = {
  PUSH: 'push',
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email'
};

export const NOTIFICATION_EVENTS = {
  BOOKING_CREATED: 'BOOKING_CREATED',
  DRIVER_SEARCHING: 'DRIVER_SEARCHING',
  DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
  DRIVER_ACCEPTED: 'DRIVER_ACCEPTED',
  DRIVER_ARRIVING: 'DRIVER_ARRIVING',
  DRIVER_ARRIVED: 'DRIVER_ARRIVED',
  TRIP_STARTED: 'TRIP_STARTED',
  TRIP_COMPLETED: 'TRIP_COMPLETED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  PAYMENT_SUCCESSFUL: 'PAYMENT_SUCCESSFUL',
  REFUND_INITIATED: 'REFUND_INITIATED'
};

export const sendNotification = ({ event, recipient, channels = ['push', 'sms'], data = {} }) => {
  const timestamp = new Date().toISOString();
  let title = '';
  let message = '';

  switch (event) {
    case NOTIFICATION_EVENTS.BOOKING_CREATED:
      title = 'Ride Confirmed!';
      message = `Your booking #${data.bookingId || ''} for ${data.vehicleCategory || 'Cab'} has been placed. Searching for nearby drivers...`;
      break;
    case NOTIFICATION_EVENTS.DRIVER_ASSIGNED:
      title = 'Driver Assigned!';
      message = `${data.driverName || 'Your driver'} (${data.vehicleModel || 'Car'} - ${data.vehiclePlate || ''}) is assigned. Rating: ★${data.driverRating || '4.8'}.`;
      break;
    case NOTIFICATION_EVENTS.DRIVER_ARRIVED:
      title = 'Driver Arrived!';
      message = `Your driver has arrived at ${data.pickupLocation || 'the pickup location'}. Start OTP: ${data.otp || '4829'}.`;
      break;
    case NOTIFICATION_EVENTS.TRIP_STARTED:
      title = 'Trip In Progress';
      message = `Your trip to ${data.dropLocation || 'destination'} has started. Have a safe ride!`;
      break;
    case NOTIFICATION_EVENTS.TRIP_COMPLETED:
      title = 'Trip Completed';
      message = `You have reached your destination. Total fare: ₹${data.totalFare || 0}. Please rate your driver.`;
      break;
    case NOTIFICATION_EVENTS.BOOKING_CANCELLED:
      title = 'Booking Cancelled';
      message = `Booking #${data.bookingId} was cancelled. Reason: ${data.reason || 'Requested by user'}.`;
      break;
    default:
      title = `Notification: ${event}`;
      message = data.message || 'Status updated for your trip.';
  }

  const notificationLog = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    event,
    title,
    message,
    recipient: recipient || data.customerPhone || 'Customer',
    channels,
    timestamp,
    status: 'delivered'
  };

  // Persist to session storage notification logs for audit
  try {
    const existing = JSON.parse(localStorage.getItem('porter_pc_notifications') || '[]');
    existing.unshift(notificationLog);
    localStorage.setItem('porter_pc_notifications', JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.warn('Could not store notification log:', e);
  }

  return notificationLog;
};
