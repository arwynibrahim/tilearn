const http = require('http');

class LoadTestRunner {
  constructor(config) {
    this.config = config;
    this.stats = { requests: 0, successes: 0, failures: 0, totalLatency: 0, statusCodes: {} };
    this.activeUsers = 0;
    this.userPool = [];
    this.endpointStats = new Map();
  }

  request(method, url, body, token) {
    return new Promise((resolve) => {
      const u = new URL(url);
      const start = Date.now();
      const options = {
        hostname: u.hostname, port: u.port, path: u.pathname + u.search,
        method, headers: { ...this.config.headers },
      };
      if (token) options.headers['Authorization'] = `Bearer ${token}`;
      if (body) options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { data = JSON.parse(data); } catch { }
          resolve({ statusCode: res.statusCode, body: data, latency: Date.now() - start });
        });
      });
      req.on('error', (err) => {
        resolve({ statusCode: 0, body: null, latency: Date.now() - start, error: err.message });
      });
      req.end(body ? JSON.stringify(body) : undefined);
    });
  }

  record(endpoint, latency, statusCode) {
    this.stats.requests++;
    this.stats.totalLatency += latency;
    this.stats.statusCodes[statusCode] = (this.stats.statusCodes[statusCode] || 0) + 1;
    if (statusCode && statusCode < 500) this.stats.successes++;
    else this.stats.failures++;

    if (!this.endpointStats.has(endpoint)) {
      this.endpointStats.set(endpoint, {
        count: 0, totalLatency: 0, min: Infinity, max: 0,
        successes: 0, failures: 0, statusCodes: {},
      });
    }
    const s = this.endpointStats.get(endpoint);
    s.count++; s.totalLatency += latency;
    s.statusCodes[statusCode] = (s.statusCodes[statusCode] || 0) + 1;
    if (latency < s.min) s.min = latency;
    if (latency > s.max) s.max = latency;
    if (statusCode && statusCode < 500) s.successes++;
    else s.failures++;
  }

  async runEndpoint(method, path, body, token, label, query) {
    let fullPath = path;
    if (query) {
      const qs = Object.entries(query).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
      fullPath += '?' + qs;
    }
    const url = `${this.config.baseUrl}${fullPath}`;
    const res = await this.request(method, url, body, token);
    this.record(label || `${method} ${path}`, res.latency, res.statusCode);
    return res;
  }

  async registerUser(id) {
    const { baseUrl, registerUser } = this.config;
    const email = registerUser.email.replace('__ID__', id);
    const body = {
      email, password: registerUser.password,
      nom: registerUser.nom, prenom: registerUser.prenom.replace('__ID__', id),
    };
    const res = await this.request('POST', `${baseUrl}/auth/register`, body);
    if (res.statusCode === 201) return email;
    if (res.statusCode === 409) return email; // already exists
    return null;
  }

  async loginUser(email) {
    const { baseUrl } = this.config;
    const res = await this.request('POST', `${baseUrl}/auth/login`, {
      email, password: this.config.registerUser.password,
    });
    if (res.statusCode === 201) {
      const token = res.body?.accessToken || res.body?.token || null;
      return token;
    }
    return null;
  }

  async prepareUsers(count) {
    console.log('[SETUP] Creating user pool...');
    const emails = [];
    for (let i = 0; i < count; i++) {
      const id = `load${String(i).padStart(3, '0')}`;
      const email = await this.registerUser(id);
      if (email) emails.push(email);
      if ((i + 1) % 10 === 0) process.stdout.write(`  ${i + 1}/${count} registered\n`);
    }
    process.stdout.write(`  Total: ${emails.length} users registered\n`);

    console.log('[SETUP] Logging in users...');
    for (let i = 0; i < emails.length; i++) {
      const token = await this.loginUser(emails[i]);
      if (token) {
        this.userPool.push({ email: emails[i], token });
      }
      if ((i + 1) % 5 === 0) process.stdout.write(`  ${i + 1}/${emails.length} logged in\n`);
    }
    console.log(`  Active tokens: ${this.userPool.length}`);
    return this.userPool.length > 0;
  }

  getRandomAuthedUser() {
    if (this.userPool.length === 0) return null;
    return this.userPool[Math.floor(Math.random() * this.userPool.length)];
  }

  async simulatePhase(targetUsers, durationMs) {
    const startTime = Date.now();
    let spawned = 0;

    while (spawned < targetUsers && (Date.now() - startTime) < durationMs) {
      this.activeUsers++;
      spawned++;
      this.simulateUser().catch(() => { });
      const delay = Math.max(50, durationMs / targetUsers + (Math.random() - 0.5) * (durationMs / targetUsers) * 0.5);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  async simulateUser() {
    const user = this.getRandomAuthedUser();
    const token = user?.token || null;

    while (this.activeUsers > 0) {
      const thinkTime = 800 + Math.random() * 2000;
      await new Promise(r => setTimeout(r, thinkTime));

      try {
        if (Math.random() < 0.2 && user) {
          const ep = this.config.endpoints.unauthenticated[0];
          await this.runEndpoint(ep.method, ep.path,
            { email: user.email, password: this.config.registerUser.password },
            null, 'POST /auth/login', ep.query);
        } else if (Math.random() < 0.1) {
          const unauthedEps = this.config.endpoints.unauthenticated;
          const ep = unauthedEps[Math.floor(Math.random() * unauthedEps.length)];
          const body = ep.body?.email ? { email: user?.email || 'test@test.com' } : ep.body;
          await this.runEndpoint(ep.method, ep.path, body, null, `${ep.method} ${ep.path}`, ep.query);
        } else if (this.config.endpoints.authenticated.length > 0) {
          const eps = this.config.endpoints.authenticated;
          const ep = eps[Math.floor(Math.random() * eps.length)];
          await this.runEndpoint(ep.method, ep.path, ep.body, token, `${ep.method} ${ep.path}`, ep.query);
        }
      } catch { }
    }
  }

  printProgress(elapsed) {
    const s = this.stats;
    const avg = s.requests > 0 ? (s.totalLatency / s.requests).toFixed(0) : '-';
    const rps = elapsed > 0 ? (s.requests / (elapsed / 1000)).toFixed(1) : '-';
    const rate = s.requests > 0 ? ((s.successes / s.requests) * 100).toFixed(1) : '-';
    const codeStr = Object.entries(s.statusCodes).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c, n]) => `${c}:${n}`).join(' ');
    process.stdout.write(`\r  Users:${this.activeUsers} Reqs:${s.requests} RPS:${rps} Avg:${avg}ms OK:${rate}% [${codeStr}]`);
  }

  printFinalReport(totalElapsed) {
    const s = this.stats;
    const avg = s.requests > 0 ? (s.totalLatency / s.requests).toFixed(0) : '-';
    const rps = totalElapsed > 0 ? (s.requests / (totalElapsed / 1000)).toFixed(1) : '-';
    const rate = s.requests > 0 ? ((s.successes / s.requests) * 100).toFixed(1) : '-';

    console.log('\n');
    console.log('═══════════════════════════════════════════════');
    console.log('          LOAD TEST REPORT');
    console.log('═══════════════════════════════════════════════');
    console.log(`  Duration:       ${(totalElapsed / 1000).toFixed(0)}s`);
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
      console.log(`  ${(name + ' ').padEnd(36)} ${String(es.count).padStart(5)} reqs | avg ${avg2}ms | ${rate2}% ok | ${codes}`);
    }
    console.log('');
    console.log('  --- Active user pool ---');
    console.log(`  Registered + logged in: ${this.userPool.length} users`);
    console.log('═══════════════════════════════════════════════\n');
  }

  async run() {
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('     TIL API - ADVANCED LOAD TEST');
    console.log('═══════════════════════════════════════════════');
    console.log(`  Target: ${this.config.baseUrl}`);
    console.log(`  Phases: ${this.config.phases.length}`);
    console.log('');

    const maxUsers = Math.max(...this.config.phases.map(p => p.targetUsers));
    const hasAuth = await this.prepareUsers(maxUsers);
    console.log(`  Auth available: ${hasAuth ? 'YES' : 'NO (running without tokens)'}`);
    console.log('');

    const overallStart = Date.now();
    for (const phase of this.config.phases) {
      console.log(`[PHASE] ${phase.name} (${phase.targetUsers} users, ${phase.duration}s)`);
      await this.simulatePhase(phase.targetUsers, phase.duration * 1000);
      this.printProgress(Date.now() - overallStart);
      console.log('');
    }

    this.activeUsers = 0;
    await new Promise(r => setTimeout(r, 2000));

    const totalElapsed = Date.now() - overallStart;
    this.printFinalReport(totalElapsed);
  }
}

module.exports = LoadTestRunner;
