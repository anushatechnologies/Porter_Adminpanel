const https = require('https');
const fs = require('fs');

function request(options, data, isForm = false, boundary = '') {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      if (typeof data === 'string' || Buffer.isBuffer(data)) {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

// Helper to create multipart form data
function makeMultipartBody(fieldName, fileName, fileBuffer, boundary) {
  const head = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\n` +
    `Content-Type: image/png\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  return Buffer.concat([head, fileBuffer, tail]);
}

async function run() {
  try {
    console.log("=== STEP 1: Login to get token ===");
    const loginRes = await request({
      hostname: 'api.anushaporter.com',
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@porter.com', password: 'password123' });

    const token = loginRes.body.token;
    console.log("Login status:", loginRes.status, "Token:", token ? token.substring(0, 15) : 'NONE');

    console.log("\n=== STEP 2: Test POST /api/upload with a PNG image ===");
    // Create a 1x1 PNG buffer
    const dummyPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
    const multipartBody = makeMultipartBody("file", "test-truck.png", dummyPng, boundary);

    const uploadRes = await request({
      hostname: 'api.anushaporter.com',
      path: '/api/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': multipartBody.length
      }
    }, multipartBody);

    console.log("Upload status:", uploadRes.status);
    console.log("Upload response body:", uploadRes.body);

    const uploadedUrl = uploadRes.body?.url || uploadRes.body?.fileUrl || uploadRes.body?.imageUrl || uploadRes.body?.path;
    console.log("Uploaded Image URL returned by backend:", uploadedUrl);

    if (!uploadedUrl) {
      console.log("WARNING: Backend did not return URL field! Full response:", uploadRes.body);
    }

    console.log("\n=== STEP 3: Fetch current service 1 ===");
    const servicesRes = await request({
      hostname: 'api.anushaporter.com',
      path: '/api/admin/services',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const services = Array.isArray(servicesRes.body) ? servicesRes.body : (servicesRes.body?.services || []);
    const targetService = services[0];
    console.log("Target Service before update:", {
      id: targetService.id,
      name: targetService.name,
      iconUrl: targetService.iconUrl,
      imageUrl: targetService.imageUrl
    });

    const targetId = targetService.id || targetService.serviceId || 1;
    const testIconUrl = uploadedUrl || "https://cdn-icons-png.flaticon.com/512/3063/3063822.png";

    console.log(`\n=== STEP 4: Test PUT /api/admin/services/${targetId} with new image ===`);
    const updatePayload = {
      ...targetService,
      serviceId: targetService.serviceId || targetService.id,
      name: targetService.name,
      iconUrl: testIconUrl,
      imageUrl: testIconUrl,
      icon_url: testIconUrl,
      image_url: testIconUrl
    };

    const updateRes = await request({
      hostname: 'api.anushaporter.com',
      path: `/api/admin/services/${targetId}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, updatePayload);

    console.log("Update status:", updateRes.status);
    console.log("Update response:", updateRes.body);

    console.log("\n=== STEP 5: Re-fetch services from backend to verify DB persistence ===");
    const verifyRes = await request({
      hostname: 'api.anushaporter.com',
      path: '/api/admin/services',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const verifyServices = Array.isArray(verifyRes.body) ? verifyRes.body : (verifyRes.body?.services || []);
    const updatedTarget = verifyServices.find(s => (s.id === targetService.id || s.name === targetService.name));
    console.log("Target Service AFTER DB re-fetch:", {
      id: updatedTarget?.id,
      name: updatedTarget?.name,
      iconUrl: updatedTarget?.iconUrl,
      imageUrl: updatedTarget?.imageUrl
    });

  } catch (err) {
    console.error("Test execution error:", err);
  }
}

run();
