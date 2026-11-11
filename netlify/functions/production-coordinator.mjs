const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' }
});

export default async request => {
  if (request.method !== 'POST') return json({ error: 'Use POST for coordinator requests.' }, 405);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: 'Live coordinator is not configured. The local draft helper is still available.' }, 503);
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 24000) return json({ error: 'Coordinator request is too large.' }, 413);
    const input = await request.json();
    if (input.approvedToSend !== true) return json({ error: 'Confirm that you want to send this scene text first.' }, 400);
    if (typeof input.sceneText !== 'string' || !input.sceneText.trim() || input.sceneText.length > 12000) return json({ error: 'Scene text must be between 1 and 12,000 characters.' }, 400);
    if (input.characters !== undefined && typeof input.characters !== 'string') return json({ error: 'Character context must be plain text.' }, 400);
    if (input.location !== undefined && typeof input.location !== 'string') return json({ error: 'Location context must be plain text.' }, 400);
    const context = [input.characters, input.location].filter(Boolean).join('\n').slice(0, 4000);
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
        store: false,
        instructions: 'You are an optional production assistant. Turn only the creator-provided fictional scene into concise, editable storyboard panel suggestions. Do not add cultural, historical, sacred, or traditional claims. Do not claim authenticity. Do not invent dialogue; leave dialogue empty unless the scene text explicitly provides it. Return 3 to 8 panels, with duration 1 to 20 seconds.',
        input: `Creator-approved scene context:\n${context}\n\nScene text:\n${input.sceneText}`,
        text: { format: { type: 'json_schema', name: 'panel_suggestions', strict: true, schema: {
          type: 'object', additionalProperties: false, required: ['panels'], properties: {
            panels: { type: 'array', minItems: 3, maxItems: 8, items: {
              type: 'object', additionalProperties: false,
              required: ['description', 'dialogue', 'narration', 'sound', 'camera', 'duration'],
              properties: {
                description: { type: 'string' }, dialogue: { type: 'string' }, narration: { type: 'string' },
                sound: { type: 'string' }, camera: { type: 'string' }, duration: { type: 'integer', minimum: 1, maximum: 20 }
              }
            } }
          }
        } } }
      })
    });
    const result = await response.json();
    if (!response.ok) return json({ error: result.error?.message || 'The coordinator request failed.' }, 502);
    const output = result.output?.flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text;
    if (!output) return json({ error: 'The coordinator returned no suggestions.' }, 502);
    const parsed = JSON.parse(output);
    if (!parsed || !Array.isArray(parsed.panels) || parsed.panels.length < 3 || parsed.panels.length > 8 || parsed.panels.some(panel => typeof panel.description !== 'string' || !Number.isInteger(panel.duration) || panel.duration < 1 || panel.duration > 20)) return json({ error: 'The coordinator returned suggestions in an invalid format.' }, 502);
    return json(200, parsed);
  } catch (error) {
    return json({ error: error.message || 'Could not create suggestions.' }, 400);
  }
};
