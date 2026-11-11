import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Netlify publishes dist and routes only optional APIs to functions', async () => {
  const config = await readFile(new URL('../netlify.toml', import.meta.url), 'utf8');
  assert.match(config, /publish\s*=\s*"dist"/);
  assert.match(config, /directory\s*=\s*"netlify\/functions"/);
  assert.match(config, /production-coordinator/);
  const functionSource = await readFile(new URL('../netlify/functions/production-coordinator.mjs', import.meta.url), 'utf8');
  assert.match(functionSource, /process\.env\.OPENAI_API_KEY/);
  assert.match(functionSource, /store:\s*false/);
  assert.match(functionSource, /approvedToSend/);
});

test('Netlify Functions remain disabled without a key and preserve the local-helper message', async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const { default: health } = await import('../netlify/functions/health.mjs');
  const { default: coordinator } = await import('../netlify/functions/production-coordinator.mjs');
  assert.equal((await (await health()).json()).coordinatorAvailable, false);
  const response = await coordinator(new Request('https://example.test/api/production-coordinator', { method: 'POST', body: JSON.stringify({ approvedToSend: true, sceneText: 'Creator text.' }) }));
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /local draft helper/i);
  if (originalKey !== undefined) process.env.OPENAI_API_KEY = originalKey;
});
