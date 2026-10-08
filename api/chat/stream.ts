import { getGeminiClient, buildSystemInstruction, CANDIDATE_MODELS, getContextualFallback } from '../../src/server/aiService';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.write(`data: ${JSON.stringify({ error: 'Invalid JSON body' })}\n\n`);
      return res.end();
    }
  }

  const { messages, tone = 'balanced', language = 'auto' } = body || {};

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.write(`data: ${JSON.stringify({ error: 'Messages array is required' })}\n\n`);
    return res.end();
  }

  const lastMessage = messages[messages.length - 1];
  const userPrompt = lastMessage?.content || '';

  const apiKeyExists = Boolean(process.env.GEMINI_API_KEY);
  console.log(`[CHETONA API /api/chat/stream] Streaming requested. Key configured: ${apiKeyExists}`);

  const ai = getGeminiClient();
  const systemInstruction = buildSystemInstruction(tone, language);

  let streamSuccess = false;

  if (ai) {
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    for (const model of CANDIDATE_MODELS) {
      try {
        console.log(`[CHETONA API Stream] Calling ${model}...`);
        const responseStream = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.95,
          },
        });

        for await (const chunk of responseStream) {
          const chunkText = chunk.text;
          if (chunkText) {
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          }
        }
        res.write('data: [DONE]\n\n');
        streamSuccess = true;
        return res.end();
      } catch (err: any) {
        console.warn(`[CHETONA API Stream] Model ${model} failed:`, err?.message || err);
      }
    }
  }

  if (!streamSuccess) {
    console.log('[CHETONA API Stream] Delivering contextual fallback stream.');
    const fallbackText = getContextualFallback(userPrompt);
    const words = fallbackText.split(' ');
    for (const word of words) {
      res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
