import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./dist/', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

async function bodyJson(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 24_000) throw new Error('Request is too large.');
  }
  return JSON.parse(data || '{}');
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (url.pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ coordinatorAvailable: Boolean(process.env.OPENAI_API_KEY) }));
  }
  if (url.pathname === '/api/production-coordinator' && req.method === 'POST') {
    if (!process.env.OPENAI_API_KEY) {
      res.writeHead(503, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Live coordinator is not configured. The local draft helper is still available.' }));
    }
    try {
      const input = await bodyJson(req);
      if (input.approvedToSend !== true) throw new Error('Confirm that you want to send this scene text first.');
      if (typeof input.sceneText !== 'string' || !input.sceneText.trim() || input.sceneText.length > 12000) throw new Error('Scene text must be between 1 and 12,000 characters.');
      const context = [input.characters, input.location].filter(Boolean).join('\n').slice(0, 4000);
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-5.4-mini', store: false,
          instructions: 'You are an optional production assistant. Turn only the creator-provided fictional scene into concise, editable storyboard panel suggestions. Do not add cultural, historical, sacred, or traditional claims. Do not claim authenticity. Do not invent dialogue; leave dialogue empty unless the scene text explicitly provides it. Return 3 to 8 panels, with duration 1 to 20 seconds.',
          input: `Creator-approved scene context:\n${context}\n\nScene text:\n${input.sceneText}`,
          text: { format: { type: 'json_schema', name: 'panel_suggestions', strict: true, schema: {
            type: 'object', additionalProperties: false, required: ['panels'], properties: { panels: { type: 'array', minItems: 3, maxItems: 8, items: { type: 'object', additionalProperties: false, required: ['description', 'dialogue', 'narration', 'sound', 'camera', 'duration'], properties: {
              description: { type: 'string' }, dialogue: { type: 'string' }, narration: { type: 'string' }, sound: { type: 'string' }, camera: { type: 'string' }, duration: { type: 'integer', minimum: 1, maximum: 20 }
            } } } }
          } } }
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'The coordinator request failed.');
      const output = result.output?.flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text;
      if (!output) throw new Error('The coordinator returned no suggestions.');
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(JSON.parse(output)));
    } catch (error) {
      res.writeHead(400, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: error.message || 'Could not create suggestions.' }));
    }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = resolve(root, `.${pathname}`);
  if (!(file === root || file.startsWith(root + sep))) { res.writeHead(403); return res.end(); }
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not file');
    res.writeHead(200, { 'content-type': mime[extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-cache' });
    if (req.method === 'HEAD') return res.end();
    return res.end(await readFile(file));
  } catch { res.writeHead(404); return res.end('Not found'); }
});

server.listen(port, '127.0.0.1', () => console.log(`Intsomi Studio PoC at http://127.0.0.1:${port}`));
