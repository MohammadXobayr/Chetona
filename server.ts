import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateChatResponse,
  getGeminiClient,
  buildSystemInstruction,
  CANDIDATE_MODELS,
  getContextualFallback,
} from './src/server/aiService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Unary Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, tone = 'balanced', language = 'auto', chetanaMode = true } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const result = await generateChatResponse({
      messages,
      tone,
      language,
      chetanaMode,
    });

    return res.json(result);
  } catch (err: any) {
    console.error('[CHETONA Server Error]:', err);
    return res.status(500).json({
      error: 'Failed to generate response',
      details: err?.message || String(err),
    });
  }
});

// SSE Streaming endpoint
app.post('/api/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { messages, tone = 'balanced', language = 'auto' } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.write(`data: ${JSON.stringify({ error: 'Messages array is required' })}\n\n`);
    return res.end();
  }

  const lastMessage = messages[messages.length - 1];
  const userPrompt = lastMessage?.content || '';

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
        console.log(`[CHETONA Dev Server] Streaming from model ${model}...`);
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
        console.warn(`[CHETONA Dev Server] Model ${model} streaming failed:`, err?.message || err);
      }
    }
  }

  if (!streamSuccess) {
    const fallbackText = getContextualFallback(userPrompt);
    const words = fallbackText.split(' ');
    for (const word of words) {
      res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
      await new Promise((r) => setTimeout(r, 20));
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CHETONA server running at http://localhost:${PORT}`);
  });
}

startServer();
