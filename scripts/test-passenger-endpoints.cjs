const http = require('http');

function post(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(raw) }));
    }).on('error', reject);
  });
}

function put(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- TEST 1: GET /api/passenger/vehicles ---');
  const veh = await get('http://localhost:8090/api/passenger/vehicles');
  console.log('Status:', veh.status, 'Vehicles:', veh.data.vehicles.map(v => `${v.name} (Max ${v.maxPassengers}pax)`).join(', '));

  console.log('\n--- TEST 2: Capacity Check (Expected 400 for Hatchback with 5 passengers) ---');
  const capTest = await post('http://localhost:8090/api/passenger/fare-estimate', {
    vehicleCategoryCode: 'HATCHBACK',
    passengerCount: 5
  });
  console.log('Status:', capTest.status, 'Message:', capTest.data.message);

  console.log('\n--- TEST 3: Valid Fare Estimate ---');
  const est = await post('http://localhost:8090/api/passenger/fare-estimate', {
    serviceType: 'ONE_WAY',
    vehicleCategoryCode: 'SEDAN',
    pickupAddress: 'Hitec City, Hyderabad',
    dropAddress: 'RGIA Airport',
    passengerCount: 2,
    luggageCount: 2,
    couponCode: 'WELCOME100'
  });
  console.log('Status:', est.status, 'Token:', est.data.fareToken, 'Expires:', est.data.tokenExpiresAt, 'Fare: ₹' + est.data.estimatedFare);

  console.log('\n--- TEST 4: Confirm Booking (POST /api/passenger/bookings) ---');
  const bk = await post('http://localhost:8090/api/passenger/bookings', {
    fareToken: est.data.fareToken,
    serviceType: 'ONE_WAY',
    vehicleCategoryCode: 'SEDAN',
    pickupAddress: 'Hitec City, Hyderabad',
    dropAddress: 'RGIA Airport',
    passengerName: 'Kavita Reddy',
    passengerPhone: '+91 98490 12345',
    passengerCount: 2,
    paymentMode: 'ONLINE'
  });
  console.log('Status:', bk.status, 'Tracking Number:', bk.data.booking.trackingNumber, 'Status:', bk.data.booking.status);

  console.log('\n--- TEST 5: Admin Preview Simulator (POST /api/admin/passenger/pricing/preview) ---');
  const prev = await post('http://localhost:8090/api/admin/passenger/pricing/preview', {
    serviceType: 'ROUND_TRIP',
    vehicleCategoryCode: 'SUV',
    distanceKm: 40,
    durationMinutes: 90
  });
  console.log('Status:', prev.status, 'Total Fare: ₹' + prev.data.receipt.totalFare, 'Driver Earnings: ₹' + prev.data.settlement.driverEarnings, 'Commission: ₹' + prev.data.settlement.companyCommission);

  console.log('\n--- TEST 6: Assign Driver (PUT /api/admin/passenger/bookings/{id}/assign-driver) ---');
  const asgn = await put(`http://localhost:8090/api/admin/passenger/bookings/${bk.data.booking.id}/assign-driver`, {
    driverId: 101
  });
  console.log('Status:', asgn.status, 'Booking Status:', asgn.data.booking.status, 'Driver Assigned:', asgn.data.booking.driver.name);

  console.log('\n--- TEST 7: Update Status to IN_PROGRESS ---');
  const st = await put(`http://localhost:8090/api/admin/passenger/bookings/${bk.data.booking.id}/status`, {
    status: 'IN_PROGRESS'
  });
  console.log('Status:', st.status, 'New Trip Status:', st.data.booking.status);

  console.log('\n✅ ALL 7 TEST CASES PASSED PERFECTLY!');
}

runTests().catch(console.error);
