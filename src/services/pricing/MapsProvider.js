/**
 * Maps & Directions Abstraction Provider
 * 
 * Provides an abstracted interface for geocoding, route calculations, and distance matrices.
 * Decouples the business logic and pricing engine from any specific map vendor (Google Maps, Mapbox, OSRM).
 */

export const POPULAR_LANDMARKS = [
  { id: 'hyd_airport', name: 'Rajiv Gandhi International Airport (RGIA)', city: 'Hyderabad', zone: 'airport_zone', lat: 17.2403, lng: 78.4294, hasToll: true, tollAmount: 80, hasParking: true, parkingFee: 100 },
  { id: 'hyd_hitech', name: 'Hitec City / Cyber Towers', city: 'Hyderabad', zone: 'zone_cyberabad', lat: 17.4504, lng: 78.3808, hasToll: false, tollAmount: 0, hasParking: false, parkingFee: 0 },
  { id: 'hyd_gachibowli', name: 'Gachibowli Financial District', city: 'Hyderabad', zone: 'zone_cyberabad', lat: 17.4401, lng: 78.3489, hasToll: false, tollAmount: 0, hasParking: false, parkingFee: 0 },
  { id: 'hyd_secunderabad', name: 'Secunderabad Railway Station', city: 'Hyderabad', zone: 'zone_a', lat: 17.4344, lng: 78.5013, hasToll: false, tollAmount: 0, hasParking: true, parkingFee: 40 },
  { id: 'hyd_charminar', name: 'Charminar, Old City', city: 'Hyderabad', zone: 'zone_a', lat: 17.3616, lng: 78.4747, hasToll: false, tollAmount: 0, hasParking: false, parkingFee: 0 },
  { id: 'hyd_banjara', name: 'Banjara Hills Road No. 1', city: 'Hyderabad', zone: 'zone_a', lat: 17.4156, lng: 78.4357, hasToll: false, tollAmount: 0, hasParking: false, parkingFee: 0 },
  { id: 'hyd_jubilee', name: 'Jubilee Hills Checkpost', city: 'Hyderabad', zone: 'zone_a', lat: 17.4319, lng: 78.4073, hasToll: false, tollAmount: 0, hasParking: false, parkingFee: 0 },
  { id: 'hyd_miyapur', name: 'Miyapur Metro Station', city: 'Hyderabad', zone: 'zone_b', lat: 17.4968, lng: 78.3614, hasToll: false, tollAmount: 0, hasParking: false, parkingFee: 0 }
];

/**
 * Calculate distance, estimated duration, and road attributes between pickup and drop
 */
export const calculateRouteEstimate = (pickupStr, dropStr, additionalStops = []) => {
  // Try matching known landmarks
  const findLandmark = (query) => {
    if (!query) return null;
    const q = query.toLowerCase();
    return POPULAR_LANDMARKS.find(l => 
      l.name.toLowerCase().includes(q) || 
      l.id.toLowerCase().includes(q) ||
      q.includes(l.name.toLowerCase())
    );
  };

  const pLandmark = findLandmark(pickupStr);
  const dLandmark = findLandmark(dropStr);

  let distanceKm = 15;
  let durationMinutes = 35;
  let isAirportTrip = false;
  let estimatedToll = 0;
  let estimatedParking = 0;
  let zoneId = 'zone_a';

  if (pLandmark && dLandmark) {
    // Coordinate distance calculation (Haversine approx * road winding factor 1.35)
    const R = 6371; // Earth's radius in KM
    const dLat = (dLandmark.lat - pLandmark.lat) * Math.PI / 180;
    const dLng = (dLandmark.lng - pLandmark.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pLandmark.lat * Math.PI / 180) * Math.cos(dLandmark.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const straightKm = R * c;
    
    distanceKm = Math.max(3, Math.round(straightKm * 1.32 * 10) / 10);
    // Average city traffic speed ~ 25 km/h
    durationMinutes = Math.max(10, Math.round((distanceKm / 24) * 60));

    if (pLandmark.zone === 'airport_zone' || dLandmark.zone === 'airport_zone') {
      isAirportTrip = true;
      zoneId = 'airport_zone';
      estimatedToll = 80;
      estimatedParking = pLandmark.zone === 'airport_zone' ? 100 : 0;
    }
  } else {
    // Heuristic estimation based on string length and random seed for test queries
    const combined = (pickupStr + dropStr).length;
    distanceKm = Math.max(5, (combined % 35) + 8);
    durationMinutes = Math.max(15, Math.round(distanceKm * 2.4));
    if ((pickupStr + dropStr).toLowerCase().includes('airport')) {
      isAirportTrip = true;
      zoneId = 'airport_zone';
      estimatedToll = 80;
      estimatedParking = 100;
      distanceKm = Math.max(28, distanceKm);
      durationMinutes = Math.max(50, durationMinutes);
    }
  }

  // Account for additional stops
  if (additionalStops && additionalStops.length > 0) {
    distanceKm += additionalStops.length * 4.5;
    durationMinutes += additionalStops.length * 15;
  }

  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMinutes: Math.round(durationMinutes),
    isAirportTrip,
    estimatedToll,
    estimatedParking,
    zoneId,
    provider: 'AnushaNav-Matrix-v2.1'
  };
};
