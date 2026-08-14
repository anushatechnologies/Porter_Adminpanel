const https = require('https');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  const loginRes = await request({
    hostname: 'api.anushaporter.com',
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@porter.com', password: 'password123' });

  const headers = { 'Authorization': `Bearer ${loginRes.token}` };
  const orders = await request({ hostname: 'api.anushaporter.com', path: '/api/orders', headers });
  const customers = await request({ hostname: 'api.anushaporter.com', path: '/api/customers', headers });
  
  console.log("ORDER 1:", JSON.stringify(orders[0], null, 2));
  console.log("CUSTOMER 1:", JSON.stringify(customers[0], null, 2));
}
run();
