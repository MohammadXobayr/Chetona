import { generateChatResponse, getGeminiClient, buildSystemInstruction, CANDIDATE_MODELS, getContextualFallback } from '../src/server/aiService';

export default async function handler(req: any, res: any) {
  // CORS support
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

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        console.error('[CHETONA API] JSON body parse error:', parseErr);
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const { messages, tone = 'balanced', language = 'auto', chetanaMode = true } = body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const apiKeyExists = Boolean(process.env.GEMINI_API_KEY);
    console.log(`[CHETONA API /api/chat] Processing request. API key set: ${apiKeyExists}`);

    // If query ?stream=true or client requested stream on /api/chat
    const isStream = req.query?.stream === 'true';

    if (isStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const ai = getGeminiClient();
      const lastMessage = messages[messages.length - 1];
      const userPrompt = lastMessage?.content || '';
      const systemInstruction = buildSystemInstruction(tone, language);
      let streamSuccess = false;

      if (ai) {
        const contents = messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        for (const model of CANDIDATE_MODELS) {
          try {
            console.log(`[CHETONA API Stream] Trying model ${model}...`);
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
          } catch (modelErr: any) {
            console.warn(`[CHETONA API Stream] Model ${model} stream error:`, modelErr?.message || modelErr);
          }
        }
      }

      if (!streamSuccess) {
        console.log('[CHETONA API Stream] Streaming fallback response.');
        const fallback = getContextualFallback(userPrompt);
        const words = fallback.split(' ');
        for (const word of words) {
          res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        return res.end();
      }
    }

    // Standard Unary JSON response
    const result = await generateChatResponse({
      messages,
      tone,
      language,
      chetanaMode,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[CHETONA API Error]:', err);
    return res.status(500).json({
      error: 'Failed to generate response',
      details: err?.message || String(err),
      apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  }
}
