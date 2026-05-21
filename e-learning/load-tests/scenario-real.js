const http = require('http');
const BASE = 'http://localhost:3000/api/v1';
const USER_COUNT = 50;

const config = {
  baseUrl: BASE,
  phases: [
    { duration: 30, targetUsers: 20, name: 'Ramp-up to 20' },
    { duration: 30, targetUsers: 100, name: 'Ramp-up to 100' },
    { duration: 30, targetUsers: 250, name: 'Ramp-up to 250' },
    { duration: 60, targetUsers: 500, name: 'Ramp-up to 500' },
    { duration: 120, targetUsers: 500, name: 'Sustain 500' },
    { duration: 30, targetUsers: 0, name: 'Ramp-down' },
  ],

  // Simule 4 types de users avec des comportements différents
  userProfiles: [
    { role: 'LEARNER', weight: 0.5, endpoints: [
      { path: '/auth/profile', method: 'GET', weight: 0.1 },
      { path: '/courses', method: 'GET', weight: 0.3 },
      { path: '/enrollments', method: 'GET', weight: 0.2 },
      { path: '/payments/mine', method: 'GET', weight: 0.1 },
      { path: '/roles/me', method: 'GET', weight: 0.1 },
      { path: '/domains', method: 'GET', weight: 0.1 },
      { path: '/auth/login', method: 'POST', weight: 0.1, body: true },
    ]},
    { role: 'ADMIN', weight: 0.2, endpoints: [
      { path: '/auth/profile', method: 'GET', weight: 0.1 },
      { path: '/users', method: 'GET', weight: 0.3 },
      { path: '/courses', method: 'GET', weight: 0.2 },
      { path: '/b2b/organizations', method: 'GET', weight: 0.1 },
      { path: '/roles/me', method: 'GET', weight: 0.1 },
      { path: '/roles/permissions', method: 'GET', weight: 0.1 },
      { path: '/instructor/profile', method: 'GET', weight: 0.1 },
    ]},
    { role: 'BROWSER', weight: 0.2, endpoints: [
      { path: '/courses', method: 'GET', weight: 0.5 },
      { path: '/courses/example-course', method: 'GET', weight: 0.3 },
      { path: '/domains', method: 'GET', weight: 0.2 },
    ]},
    { role: 'MIXED', weight: 0.1, endpoints: [
      { path: '/auth/login', method: 'POST', weight: 0.3, body: true },
      { path: '/auth/forgot-password', method: 'POST', weight: 0.2, body: { email: 'mixed@test.com' } },
      { path: '/courses', method: 'GET', weight: 0.3 },
      { path: '/domains', method: 'GET', weight: 0.2 },
      { path: '/payments', method: 'POST', weight: 0.1, body: { transactionId: 'MIX', amount: 5000, provider: 'CINETPAY' } },
    ]},
  ],
};

class ScenarioRunner {
  constructor() {
    this.stats = { requests: 0, successes: 0, failures: 0, totalLatency: 0, statusCodes: {} };
    this.activeUsers = 0;
    this.endpointStats = new Map();
    this.userPool = [];
  }

  async http(method, path, body, token) {
    return new Promise((resolve) => {
      const u = new URL(`${BASE}${path}`);
      const start = Date.now();
      const opts = {
        hostname: u.hostname, port: u.port, path: u.pathname + u.search,
        method, headers: { 'Content-Type': 'application/json' },
      };
      if (token) opts.headers['Authorization'] = `Bearer ${token}`;
      if (body) opts.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));

      const req = http.request(opts, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try { data = JSON.parse(data); } catch { }
          resolve({ statusCode: res.statusCode, body: data, latency: Date.now() - start });
        });
      });
      req.on('error', e => resolve({ statusCode: 0, body: null, latency: Date.now() - start, error: e.message }));
      req.end(body ? JSON.stringify(body) : undefined);
    });
  }

  record(label, latency, code) {
    this.stats.requests++;
    this.stats.totalLatency += latency;
    this.stats.statusCodes[code] = (this.stats.statusCodes[code] || 0) + 1;
    if (code && code < 500) this.stats.successes++; else this.stats.failures++;

    if (!this.endpointStats.has(label)) {
      this.endpointStats.set(label, { count: 0, totalLatency: 0, min: Infinity, max: 0, successes: 0, failures: 0, statusCodes: {} });
    }
    const s = this.endpointStats.get(label);
    s.count++; s.totalLatency += latency; s.statusCodes[code] = (s.statusCodes[code] || 0) + 1;
    if (latency < s.min) s.min = latency; if (latency > s.max) s.max = latency;
    if (code && code < 500) s.successes++; else s.failures++;
  }

  pickEndpoint(profile) {
    const total = profile.endpoints.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    for (const ep of profile.endpoints) {
      r -= ep.weight; if (r <= 0) return ep;
    }
    return profile.endpoints[0];
  }

  async prepareUsers() {
    console.log('[SETUP] Registering users...');
    for (let i = 0; i < USER_COUNT; i++) {
      const id = `u${String(i).padStart(3, '0')}`;
      const email = `scenario${id}@test.com`;
      const body = { email, password: 'Scenario123!', nom: 'User', prenom: `${id}` };
      await this.http('POST', '/auth/register', body);
      if ((i + 1) % 10 === 0) process.stdout.write(`  ${i + 1}/${USER_COUNT}\n`);
    }
    console.log('[SETUP] Logging in...');
    for (let i = 0; i < USER_COUNT; i++) {
      const email = `scenario${String(i).padStart(3, '0')}@test.com`;
      const res = await this.http('POST', '/auth/login', { email, password: 'Scenario123!' });
      const token = res.body?.accessToken || res.body?.token;
      if (token) this.userPool.push({ email, token });
      if ((i + 1) % 10 === 0) process.stdout.write(`  ${i + 1}/${USER_COUNT} logged in\n`);
    }
    console.log(`  Active tokens: ${this.userPool.length}/${USER_COUNT}`);
  }

  getUser() {
    if (this.userPool.length === 0) return null;
    return this.userPool[Math.floor(Math.random() * this.userPool.length)];
  }

  pickProfile() {
    const total = config.userProfiles.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * total;
    for (const p of config.userProfiles) {
      r -= p.weight; if (r <= 0) return p;
    }
    return config.userProfiles[0];
  }

  async simulatePhase(targetUsers, durationMs) {
    const start = Date.now();
    let spawned = 0;
    while (spawned < targetUsers && (Date.now() - start) < durationMs) {
      this.activeUsers++; spawned++;
      this.simulateUser().catch(() => {});
      await new Promise(r => setTimeout(r, Math.max(30, durationMs / targetUsers)));
    }
  }

  async simulateUser() {
    while (this.activeUsers > 0) {
      await new Promise(r => setTimeout(r, 300 + Math.random() * 1000));
      try {
        const profile = this.pickProfile();
        const ep = this.pickEndpoint(profile);
        const user = ep.body === true ? this.getUser() : null;
        const body = ep.body === true
          ? { email: user?.email || 'anon@test.com', password: 'Scenario123!' }
          : typeof ep.body === 'object' ? ep.body : undefined;
        const token = profile.role === 'BROWSER' ? null : (user?.token || null);
        const res = await this.http(ep.method, ep.path, body, token);
        this.record(`${ep.method} ${ep.path}`, res.latency, res.statusCode);
      } catch {}
    }
  }

  printProgress(elapsed) {
    const s = this.stats;
    const avg = s.requests > 0 ? (s.totalLatency / s.requests).toFixed(0) : '-';
    const rps = elapsed > 0 ? (s.requests / (elapsed / 1000)).toFixed(0) : '-';
    const ok = s.requests > 0 ? ((s.successes / s.requests) * 100).toFixed(1) : '-';
    const topCodes = Object.entries(s.statusCodes).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([c, n]) => `${c}:${n}`).join(' ');
    process.stdout.write(`\r  U:${this.activeUsers} Req:${s.requests} RPS:${rps} Avg:${avg}ms OK:${ok}% [${topCodes}]`);
  }

  async run() {
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('   ADVANCED LOAD TEST - REAL SCENARIOS');
    console.log('═══════════════════════════════════════════════');
    console.log(`  Target: ${BASE}`);
    console.log(`  Profiles: LEARNER(50%) ADMIN(20%) BROWSER(20%) MIXED(10%)`);
    console.log(`  Max users: ${Math.max(...config.phases.map(p => p.targetUsers))}`);
    console.log('');

    const setupStart = Date.now();
    await this.prepareUsers();
    const setupTime = (Date.now() - setupStart) / 1000;
    console.log(`  Setup: ${setupTime.toFixed(0)}s\n`);

    const overallStart = Date.now();
    for (const phase of config.phases) {
      console.log(`[PHASE] ${phase.name} (${phase.targetUsers} users, ${phase.duration}s)`);
      await this.simulatePhase(phase.targetUsers, phase.duration * 1000);
      this.printProgress(Date.now() - overallStart);
      console.log('');
    }

    this.activeUsers = 0;
    await new Promise(r => setTimeout(r, 2000));
    const totalElapsed = Date.now() - overallStart;

    // Report
    const s = this.stats;
    const avg = s.requests > 0 ? (s.totalLatency / s.requests).toFixed(0) : '-';
    const rps = totalElapsed > 0 ? (s.requests / (totalElapsed / 1000)).toFixed(0) : '-';
    const rate = s.requests > 0 ? ((s.successes / s.requests) * 100).toFixed(1) : '-';

    console.log('\n═══════════════════════════════════════════════');
    console.log('          LOAD TEST REPORT');
    console.log('═══════════════════════════════════════════════');
    console.log(`  Duration:       ${(totalElapsed / 1000).toFixed(0)}s (${((totalElapsed + setupTime * 1000) / 1000).toFixed(0)}s with setup)`);
    console.log(`  Peak VUs:       ${Math.max(...config.phases.map(p => p.targetUsers))}`);
    console.log(`  Total requests: ${s.requests}`);
    console.log(`  Success (<500): ${s.successes}`);
    console.log(`  Failures (>=5): ${s.failures}`);
    console.log(`  Success rate:   ${rate}%`);
    console.log(`  Avg throughput: ${rps} req/s`);
    console.log(`  Avg latency:    ${avg}ms`);
    console.log(`  Status codes:   ${JSON.stringify(s.statusCodes)}`);
    console.log('');
    console.log('  --- Per-Endpoint ---');
    for (const [name, es] of [...this.endpointStats.entries()].sort((a, b) => b[1].count - a[1].count)) {
      const avg2 = es.count > 0 ? (es.totalLatency / es.count).toFixed(0) : '-';
      const rate2 = es.count > 0 ? ((es.successes / es.count) * 100).toFixed(0) : '-';
      const codes = Object.entries(es.statusCodes).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}:${n}`).join(' ');
      console.log(`  ${(name + ' ').padEnd(30)} ${String(es.count).padStart(5)} reqs | ${avg2}ms | ${rate2}% | ${codes}`);
    }
    console.log('═══════════════════════════════════════════════\n');
  }
}

new ScenarioRunner().run().catch(err => { console.error(err); process.exit(1); });
