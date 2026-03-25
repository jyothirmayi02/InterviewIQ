const { spawn } = require('child_process');
const path = require('path');

const server = spawn('node', ['server.js'], { cwd: path.resolve(__dirname), stdio: ['ignore', 'pipe', 'pipe'] });

server.stdout.on('data', (chunk) => process.stdout.write(chunk));
server.stderr.on('data', (chunk) => process.stderr.write(chunk));

const killServer = () => {
  server.kill();
  process.exit(0);
};

(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const base = 'http://localhost:5000';
  const p = ([ '/', '/api/health', '/api/questions?company=Amazon&role=Frontend%20Developer', '/api/evaluate' ]);

  try {
    const routes = [
      ['GET', '/'],
      ['GET', '/api/health'],
      ['GET', '/api/questions?company=Amazon&role=Frontend%20Developer'],
      ['POST', '/api/evaluate'],
    ];

    for (const [method, route] of routes) {
      const opts = { method, headers: { 'Content-Type': 'application/json' } };
      if (route === '/api/evaluate') {
        opts.body = JSON.stringify({ answers: [{ question: 'Q', answer: 'node js', ideal: 'nodejs' }] });
      }
      const r = await fetch(base + route, opts);
      console.log(route, r.status, await r.text());
    }
  } catch (err) {
    console.error('Request check failed', err);
  } finally {
    killServer();
  }
})();