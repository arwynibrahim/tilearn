const autocannon = require('autocannon');
const { Writable } = require('stream');

const BASE = 'http://localhost:3000/api/v1';

const endpoints = [
  { name: 'POST /auth/login', method: 'POST', path: '/auth/login', body: { email: 'bench@test.com', password: 'Bench1234!' } },
  { name: 'POST /auth/forgot-password', method: 'POST', path: '/auth/forgot-password', body: { email: 'bench@test.com' } },
  { name: 'GET /domains', method: 'GET', path: '/domains' },
  { name: 'GET /courses', method: 'GET', path: '/courses' },
  { name: 'GET /courses/:slug', method: 'GET', path: '/courses/example-course' },
  { name: 'GET /auth/profile', method: 'GET', path: '/auth/profile' },
  { name: 'GET /users', method: 'GET', path: '/users' },
  { name: 'GET /enrollments', method: 'GET', path: '/enrollments' },
  { name: 'GET /payments/mine', method: 'GET', path: '/payments/mine' },
  { name: 'GET /b2b/organizations', method: 'GET', path: '/b2b/organizations' },
  { name: 'GET /instructor/profile', method: 'GET', path: '/instructor/profile' },
  { name: 'GET /roles/me', method: 'GET', path: '/roles/me' },
  { name: 'GET /roles/permissions', method: 'GET', path: '/roles/permissions' },
  { name: 'POST /payments', method: 'POST', path: '/payments', body: { transactionId: 'BENCH', amount: 1000, provider: 'CINETPAY' } },
];

const results = [];

function run(endpoint) {
  return new Promise((resolve) => {
    const url = `${BASE}${endpoint.path}`;
    console.log(`\n[BENCHMARK] ${endpoint.name}`);
    console.log(`  URL: ${url}`);

    const instance = autocannon({
      url,
      method: endpoint.method || 'GET',
      body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
      headers: { 'Content-Type': 'application/json' },
      connections: 50,
      pipelining: 2,
      duration: 15,
      bailout: 1,
    }, (err, result) => {
      if (err) {
        console.log(`  ERROR: ${err.message}`);
        resolve(null);
        return;
      }
      results.push({
        name: endpoint.name,
        requests: result.requests.total,
        rps: result.requests.average,
        latencyAvg: result.latency.average,
        latencyP50: result.latency.p50,
        latencyP99: result.latency.p99,
        errors: result.errors,
        timeouts: result.timeouts,
        non2xx: result.non2xx,
        throughput: result.throughput.average,
      });
      resolve(result);
    });

    instance.on('start', () => { /* started */ });
    instance.on('done', () => { /* done */ });
  });
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('   PER-ENDPOINT BENCHMARK');
  console.log(`   Target: ${BASE}`);
  console.log('   Config: 50 conn, 2 pipeline, 15s each');
  console.log('═══════════════════════════════════════════');

  for (const ep of endpoints) {
    await run(ep);
  }

  console.log('\n\n═══════════════════════════════════════════');
  console.log('          BENCHMARK RESULTS');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  '.padEnd(38) + 'Requests  RPS     Lat(avg) Lat(p50) Lat(p99) Errors  Non2xx');
  console.log('  ' + '─'.repeat(95));

  const sorted = [...results].filter(Boolean).sort((a, b) => b.rps - a.rps);
  for (const r of sorted) {
    const line = `  ${r.name.padEnd(36)} ${String(r.requests).padStart(7)} ${String(Math.round(r.rps)).padStart(5)}  ${r.latencyAvg.toFixed(0).padStart(6)}ms ${r.latencyP50.toFixed(0).padStart(6)}ms ${r.latencyP99.toFixed(0).padStart(6)}ms ${String(r.errors).padStart(5)} ${String(r.non2xx).padStart(5)}`;
    console.log(line);
  }

  const totalReqs = results.filter(Boolean).reduce((s, r) => s + r.requests, 0);
  const avgRps = results.filter(Boolean).reduce((s, r) => s + r.rps, 0) / results.filter(Boolean).length;
  console.log('');
  console.log(`  Total requests: ${totalReqs}`);
  console.log(`  Avg RPS across all endpoints: ${Math.round(avgRps)}`);
  console.log('═══════════════════════════════════════════\n');
}

main().catch(console.error);
