/**
 * test-serviceable-and-dispatch.cjs
 * Automated test suite for Part 1 (Serviceable Areas) & Part 2 (Strict Vehicle Dispatch)
 */

const http = require('http');

const PORT = 8090;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({ port: PORT, host: 'localhost', ...options }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Running Test Suite for Serviceable Areas & Strict Vehicle Dispatch...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. GET /api/admin/serviceable-areas?city=Hyderabad
    console.log('[Test 1] GET /api/admin/serviceable-areas?city=Hyderabad');
    const t1 = await makeRequest({
      path: '/api/admin/serviceable-areas?city=Hyderabad',
      method: 'GET'
    });
    assert(t1.status === 200, 'HTTP status 200 returned');
    assert(t1.data.success === true, 'Response has success: true');
    assert(t1.data.areas && t1.data.areas.length >= 10, 'Returned at least 10 areas for Hyderabad');
    const hitech = t1.data.areas.find(a => a.pincode === '500081');
    assert(hitech && hitech.isServiceable === true, 'Hitech City (500081) is marked serviceable');

    // 2. POST /api/location/validate-serviceable (Approved area: 500081)
    console.log('\n[Test 2] POST /api/location/validate-serviceable for approved location 500081');
    const t2 = await makeRequest({
      path: '/api/location/validate-serviceable',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      lat: 17.4486,
      lng: 78.3808,
      pincode: '500081',
      city: 'Hyderabad'
    });
    assert(t2.status === 200, 'HTTP status 200 returned');
    assert(t2.data.serviceable === true, 'Location confirmed serviceable: true');
    assert(t2.data.areaName === 'Hitech City', 'Area identified as Hitech City');
    assert(t2.data.message.includes('admin-approved serviceable zone'), 'Success message matches spec');

    // 3. POST /api/location/validate-serviceable (Unapproved area: 501218)
    console.log('\n[Test 3] POST /api/location/validate-serviceable for unapproved location 501218');
    const t3 = await makeRequest({
      path: '/api/location/validate-serviceable',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      lat: 17.2403,
      lng: 78.4294,
      pincode: '501218',
      city: 'Hyderabad'
    });
    assert(t3.status === 200, 'HTTP status 200 returned');
    assert(t3.data.serviceable === false, 'Location correctly rejected with serviceable: false');
    assert(t3.data.message.includes('not currently available at this location'), 'Rejection message matches spec');
    assert(Array.isArray(t3.data.approvedAreas) && t3.data.approvedAreas.length > 0, 'Returns list of approved areas');

    // 4. PUT /api/admin/serviceable-areas/:id/toggle
    console.log('\n[Test 4] PUT /api/admin/serviceable-areas/11/toggle (Toggle Shamshabad 501218)');
    const t4 = await makeRequest({
      path: '/api/admin/serviceable-areas/11/toggle',
      method: 'PUT'
    });
    assert(t4.status === 200, 'HTTP status 200 returned');
    assert(t4.data.area.isServiceable === true, 'Shamshabad is now toggled to true');

    // Verify location check now passes for 501218
    const t4b = await makeRequest({
      path: '/api/location/validate-serviceable',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { pincode: '501218', city: 'Hyderabad' });
    assert(t4b.data.serviceable === true, 'Pincode 501218 is now immediately serviceable');

    // Toggle it back to false
    await makeRequest({ path: '/api/admin/serviceable-areas/11/toggle', method: 'PUT' });

    // 5. POST /api/admin/serviceable-areas/bulk-update
    console.log('\n[Test 5] POST /api/admin/serviceable-areas/bulk-update');
    const t5 = await makeRequest({
      path: '/api/admin/serviceable-areas/bulk-update',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      city: 'Hyderabad',
      activePincodes: ['500081', '500086', '500032', '500033', '500084']
    });
    assert(t5.status === 200, 'HTTP status 200 returned');
    assert(t5.data.enabledCount === 5, 'Enabled exactly 5 pincodes');
    assert(t5.data.disabledCount >= 7, 'Disabled unlisted pincodes in Hyderabad');

    // 6. POST /api/admin/serviceable-areas (Add new area)
    console.log('\n[Test 6] POST /api/admin/serviceable-areas (Add Miyapur)');
    const t6 = await makeRequest({
      path: '/api/admin/serviceable-areas',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      city: 'Hyderabad',
      areaName: 'Miyapur',
      pincode: '500049',
      isServiceable: true,
      centerLat: 17.4968,
      centerLng: 78.3614,
      radiusKm: 5.0
    });
    assert(t6.status === 201, 'HTTP status 201 Created returned');
    assert(t6.data.area.areaName === 'Miyapur', 'Created Miyapur area successfully');

    // 7. PART 2: Strict Vehicle Type Dispatch - Order Placement
    console.log('\n[Test 7] POST /api/orders with serviceName: "2 Wheeler" (Strict Dispatch)');
    const t7 = await makeRequest({
      path: '/api/orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      pickupAddress: 'Cyber Towers, Hitech City, Hyderabad',
      dropAddress: 'DLF Cyber City, Gachibowli, Hyderabad',
      pickupLat: 17.4504,
      pickupLng: 78.3811,
      dropLat: 17.4474,
      dropLng: 78.3565,
      serviceName: '2 Wheeler',
      amount: 99.00,
      paymentMethod: 'Cash'
    });
    assert(t7.status === 201, 'HTTP status 201 Created returned');
    assert(t7.data.notifiedDriverCount === 2, 'Exactly 2 matching Bike drivers notified');
    const bikeDriverIds = t7.data.notifiedDrivers.map(d => d.driverId);
    assert(bikeDriverIds.includes(10) && bikeDriverIds.includes(34), 'Bike drivers #10 and #34 received sound & alert');
    const skippedCategories = t7.data.skippedDrivers.map(d => d.category);
    assert(skippedCategories.includes('Tata Ace') && skippedCategories.includes('3 Wheeler'), 'Tata Ace and 3-Wheeler drivers skipped');
    assert(t7.data.skippedDrivers.every(d => d.soundRinging === false), 'All skipped drivers have soundRinging: false');

    const createdBookingId = t7.data.bookingId;

    // 8. Driver 10 Accepts Order
    console.log(`\n[Test 8] POST /api/driver/offers/${createdBookingId}/respond (Driver 10 accepts)`);
    const t8 = await makeRequest({
      path: `/api/driver/offers/${createdBookingId}/respond`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      driverId: 10,
      accept: true
    });
    assert(t8.status === 200, 'HTTP status 200 returned');
    assert(t8.data.status === 'ASSIGNED', 'Status is ASSIGNED');
    assert(t8.data.driverId === 10, 'Driver 10 won the ride');

    // 9. Competing Driver 34 attempts to accept (Atomic Race Condition -> 409 Conflict)
    console.log(`\n[Test 9] POST /api/driver/offers/${createdBookingId}/respond (Competing Driver 34 accepts after assign)`);
    const t9 = await makeRequest({
      path: `/api/driver/offers/${createdBookingId}/respond`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      driverId: 34,
      accept: true
    });
    assert(t9.status === 409, 'HTTP status 409 Conflict returned');
    assert(t9.data.status === 'TOO_LATE', 'Status is TOO_LATE');
    assert(t9.data.message.includes('Another driver partner has already accepted'), 'Conflict message matches specification');

    console.log('\n======================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Unexpected test error:', err);
    process.exit(1);
  }
}

runTests();
