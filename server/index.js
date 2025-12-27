import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(helmet());
app.use(cors({ origin: process.env.APP_ALLOWED_ORIGINS?.split(',') || '*', credentials: false }));
app.use(rateLimit({ windowMs: 5 * 60 * 1000, max: 60 }));

const PORT = process.env.PORT || 4000;

// Providers (initialized if keys present)
const googleKey = process.env.GOOGLE_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

const google = googleKey ? new GoogleGenAI({ apiKey: googleKey }) : null;
const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

// In-memory mock jobs for research when GOOGLE_API_KEY missing
const mockResearchJobs = new Map();

function ok(res, data) { return res.json({ ok: true, ...data }); }
function err(res, code, message, provider, status) {
  return res.status(status || 500).json({ ok: false, code, message, provider, status: status || 500 });
}

// Start Deep Research (Gemini Interactions API)
app.post('/api/research/start', async (req, res) => {
  const { input, fileSearchStoreNames } = req.body || {};
  if (!input || typeof input !== 'string') return err(res, 'BAD_REQUEST', 'input is required');

  if (!google) {
    // Mock background job
    const id = `mock-${Date.now()}`;
    mockResearchJobs.set(id, { status: 'in_progress', outputs: [] });
    setTimeout(() => {
      mockResearchJobs.set(id, {
        status: 'completed',
        outputs: [{ type: 'text', text: `# Executive Summary\n\n**Topic:** ${input}\n\n## Findings\n- Result A\n- Result B\n\n## Citations\n- https://example.com` }]
      });
    }, 2000);
    return ok(res, { interactionId: id, status: 'in_progress', provider: 'google' });
  }

  try {
    const tools = Array.isArray(fileSearchStoreNames) && fileSearchStoreNames.length
      ? [{ type: 'file_search', file_search_store_names: fileSearchStoreNames }]
      : undefined;

    const interaction = await google.interactions.create({
      input,
      agent: 'deep-research-pro-preview-12-2025',
      background: true,
      tools
    });
    return ok(res, { interactionId: interaction.id, status: interaction.status, provider: 'google' });
  } catch (e) {
    return err(res, 'PROVIDER_ERROR', e.message, 'google');
  }
});

// Poll Deep Research status
app.get('/api/research/status', async (req, res) => {
  const id = req.query.id;
  if (!id) return err(res, 'BAD_REQUEST', 'id is required');

  if (!google) {
    const job = mockResearchJobs.get(id);
    if (!job) return err(res, 'NOT_FOUND', 'interaction not found');
    return ok(res, { status: job.status, outputs: job.outputs, provider: 'google' });
  }
  try {
    const interaction = await google.interactions.get(id);
    return ok(res, { status: interaction.status, outputs: interaction.outputs, provider: 'google' });
  } catch (e) {
    return err(res, 'PROVIDER_ERROR', e.message, 'google');
  }
});

// Generate PRD (Gemini 2.5 Pro)
app.post('/api/generate/prd', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return err(res, 'BAD_REQUEST', 'prompt is required');

  if (!google) {
    // Stub text
    const text = `# One-pager\n\n## Goals\n${prompt.slice(0, 200)}...\n\n## Success metrics\n- 40% fewer meetings`;
    return ok(res, { text, provider: 'google', model: 'gemini-2.5-pro', fallback: true });
  }
  try {
    // Use Responses API to generate text
    const resp = await google.responses.generate({
      model: 'gemini-2.5-pro',
      input: prompt
    });
    const text = resp.output_text || resp.output?.[0]?.content?.text || JSON.stringify(resp);
    return ok(res, { text, provider: 'google', model: 'gemini-2.5-pro' });
  } catch (e) {
    return err(res, 'PROVIDER_ERROR', e.message, 'google');
  }
});

// Generate Prototype/Alpha/Beta/Pilot
app.post('/api/generate/prototype', async (req, res) => {
  const { prompt, version } = req.body || {};
  if (!prompt || !version) return err(res, 'BAD_REQUEST', 'prompt and version are required');

  // Helper stub HTML
  const stubHTML = (accent = '#2563eb') => `<!DOCTYPE html><html lang="ar"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>نموذج ${version}</title><style>body{font-family:system-ui;background:#f8fafc;margin:0}header{background:linear-gradient(90deg,${accent},${accent}80);color:#fff;padding:16px}main{padding:16px;max-width:960px;margin:0 auto}section{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.06);padding:16px;margin:12px 0}button{background:${accent};color:#fff;border:none;padding:10px 14px;border-radius:8px;cursor:pointer}button:hover{filter:brightness(1.1)}</style></head><body><header><h1>نموذج ${version}</h1><p>تم إنشاؤه محليًا للاختبار</p></header><main><section><h2>مقتطف من PRD</h2><p>${prompt.replace(/</g,'&lt;').slice(0,400)}...</p></section><section><h2>تجربة</h2><button onclick="alert('تم!')">تجربة زر</button></section></main></body></html>`;

  try {
    if (version === 'flash3') {
      // Gemini 3 Flash (Prototype)
      if (!google) return ok(res, { html: stubHTML('#2563eb'), provider: 'google', model: 'gemini-3-flash-preview', fallback: true });
      const resp = await google.responses.generate({ model: 'gemini-3-flash-preview', input: prompt });
      const html = resp.output_text || resp.output?.[0]?.content?.text || stubHTML('#2563eb');
      return ok(res, { html, provider: 'google', model: 'gemini-3-flash-preview' });
    }
    if (version === 'alpha') {
      // Gemini 3 Pro (Alpha)
      if (!google) return ok(res, { html: stubHTML('#7c3aed'), provider: 'google', model: 'gemini-3-pro-preview', fallback: true });
      const resp = await google.responses.generate({ model: 'gemini-3-pro-preview', input: prompt });
      const html = resp.output_text || resp.output?.[0]?.content?.text || stubHTML('#7c3aed');
      return ok(res, { html, provider: 'google', model: 'gemini-3-pro-preview' });
    }
    if (version === 'beta') {
      // Anthropic Claude Sonnet 4.5
      if (!anthropic) return ok(res, { html: stubHTML('#059669'), provider: 'anthropic', model: 'claude-sonnet-4-5', fallback: true });
      const msg = await anthropic.messages.create({ model: 'claude-sonnet-4-5-20250929', max_tokens: 2048, messages: [{ role: 'user', content: `Return ONLY valid HTML for this prototype.\n\nPRD:\n${prompt}` }] });
      const html = msg.content?.[0]?.text || stubHTML('#059669');
      return ok(res, { html, provider: 'anthropic', model: 'claude-sonnet-4-5-20250929' });
    }
    if (version === 'pilot') {
      // OpenAI GPT-5.2 (fallbacks)
      const modelCandidates = ['gpt-5.2', 'gpt-5', 'gpt-4.1', 'o3-pro'];
      if (!openai) return ok(res, { html: stubHTML('#ea580c'), provider: 'openai', model: modelCandidates[0], fallback: true });
      let usedModel = modelCandidates[0];
      try {
        const resp = await openai.responses.create({ model: usedModel, input: `Return ONLY valid HTML for this prototype.\n\nPRD:\n${prompt}` });
        const html = resp.output_text || resp.output?.[0]?.content?.text || stubHTML('#ea580c');
        return ok(res, { html, provider: 'openai', model: usedModel });
      } catch (e) {
        // Fallback attempts
        for (const m of modelCandidates.slice(1)) {
          try {
            usedModel = m;
            const resp = await openai.responses.create({ model: m, input: `Return ONLY valid HTML for this prototype.\n\nPRD:\n${prompt}` });
            const html = resp.output_text || resp.output?.[0]?.content?.text || stubHTML('#ea580c');
            return ok(res, { html, provider: 'openai', model: usedModel, fallback: true });
          } catch {}
        }
        return ok(res, { html: stubHTML('#ea580c'), provider: 'openai', model: usedModel, fallback: true });
      }
    }
    return err(res, 'BAD_REQUEST', 'unsupported version');
  } catch (e) {
    return err(res, 'PROVIDER_ERROR', e.message);
  }
});

app.get('/api/health', (req, res) => ok(res, { status: 'ok' }));

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
