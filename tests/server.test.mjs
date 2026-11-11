import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let child, base;

before(async () => {
  const probe = createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise(r => probe.close(r));
  base = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ['server.mjs'], { cwd: repo, env: { ...process.env, PORT: String(port), OPENAI_API_KEY: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolveReady, reject) => {
    const timer = setTimeout(() => reject(new Error('Server did not start')), 5000);
    child.stdout.on('data', chunk => { if (String(chunk).includes('Intsomi Studio PoC')) { clearTimeout(timer); resolveReady(); } });
    child.once('error', reject);
    child.once('exit', code => { if (code !== null) reject(new Error(`Server exited with code ${code}`)); });
  });
});

after(() => { if (child && child.exitCode === null) child.kill(); });

test('serves the app and draft manifest', async () => {
  const page = await fetch(`${base}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Intsomi Studio/);
  const continuity = await fetch(`${base}/continuity.mjs`);
  assert.equal(continuity.status, 200);
  assert.match(continuity.headers.get('content-type'), /javascript/);
  assert.match(await continuity.text(), /inspectContinuity/);
  const manifest = await fetch(`${base}/demo-drafts.json`);
  assert.equal(manifest.status, 200);
  const data = await manifest.json();
  assert.equal(data.drafts.length, 4);
  assert.match(data.notice, /creator approval/i);
});

test('reports live AI disabled and preserves no-key local path', async () => {
  const health = await fetch(`${base}/api/health`).then(r => r.json());
  assert.equal(health.coordinatorAvailable, false);
  const response = await fetch(`${base}/api/production-coordinator`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ approvedToSend: true, sceneText: 'A fictional scene.' }) });
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /local draft helper/i);
});

test('does not expose files outside the static app root', async () => {
  const response = await fetch(`${base}/%2e%2e/server.mjs`);
  assert.ok(response.status === 403 || response.status === 404);
});
