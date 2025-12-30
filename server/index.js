import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import swaggerSpec from './swagger.config.js';

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

// Utility functions
function ok(res, data) { return res.json({ ok: true, ...data }); }
function err(res, code, message, provider, status, userAction) {
  return res.status(status || 500).json({ ok: false, code, message, provider, status: status || 500, userAction });
}

/**
 * @swagger
 * /api/research/start:
 *   post:
 *     summary: بدء البحث العميق
 *     description: يبدأ عملية بحث عميق باستخدام Google Gemini Deep Research API
 *     tags: [Research]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResearchStartRequest'
 *     responses:
 *       200:
 *         description: تم بدء البحث بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 interactionId:
 *                   type: string
 *                   description: معرف التفاعل للمراجعة
 *                 status:
 *                   type: string
 *                   example: "in_progress"
 *                 provider:
 *                   type: string
 *                   example: "google"
 *       400:
 *         description: بيانات غير صحيحة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/api/research/start', async (req, res) => {
  const { input } = req.body || {};
  if (!input || typeof input !== 'string') {
    return err(res, 'BAD_REQUEST', 'input is required', null, 400, 'تأكد من إدخال نص صحيح');
  }

  if (!google) {
    // Mock background job
    const id = `mock-${Date.now()}`;
    mockResearchJobs.set(id, { status: 'in_progress', outputs: [] });
    setTimeout(() => {
      mockResearchJobs.set(id, {
        status: 'completed',
        outputs: [{ type: 'text', text: `# نتائج البحث\n\n**الموضوع:** ${input}\n\n## النتائج\n- نتيجة A\n- نتيجة B` }]
      });
    }, 2000);
    return ok(res, { interactionId: id, status: 'in_progress', provider: 'google' });
  }

  try {
    const interaction = await google.interactions.create({
      input,
      agent: 'deep-research-pro-preview-12-2025',
      background: true
    });

    return ok(res, {
      interactionId: interaction.id,
      status: interaction.status,
      provider: 'google',
      model: 'deep-research-pro-preview-12-2025'
    });
  } catch (e) {
    return err(res, 'PROVIDER_ERROR', e.message, 'google');
  }
});

/**
 * @swagger
 * /api/research/status:
 *   get:
 *     summary: مراجعة حالة البحث العميق
 *     description: يجلب حالة البحث العميق باستخدام معرف التفاعل
 *     tags: [Research]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف التفاعل
 *     responses:
 *       200:
 *         description: تم جلب حالة البحث بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResearchStatusResponse'
 */
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

/**
 * @swagger
 * /api/generate/prd:
 *   post:
 *     summary: إنشاء مستند Product Requirements Document
 *     description: ينشئ مستند متطلبات المنتج باستخدام Google Gemini 2.5 Pro
 *     tags: [Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneratePRDRequest'
 *     responses:
 *       200:
 *         description: تم إنشاء PRD بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeneratePRDResponse'
 */
app.post('/api/generate/prd', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return err(res, 'BAD_REQUEST', 'prompt is required');

  if (!google) {
    const text = `# مستند المتطلبات\n\n## الأهداف\n${prompt.slice(0, 200)}...\n\n## المقاييس\n- تقليل الاجتماعات بنسبة 40%`;
    return ok(res, { text, provider: 'google', model: 'gemini-2.5-pro', fallback: true });
  }

  try {
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

/**
 * @swagger
 * /api/generate/prototype:
 *   post:
 *     summary: إنشاء نموذج أولي تفاعلي
 *     description: ينشئ نموذج أولي تفاعلي (HTML) بناءً على وصف المنتج
 *     tags: [Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneratePrototypeRequest'
 *     responses:
 *       200:
 *         description: تم إنشاء النموذج الأولي بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeneratePrototypeResponse'
 */
app.post('/api/generate/prototype', async (req, res) => {
  const { prompt, version } = req.body || {};
  if (!prompt || !version) {
    return err(res, 'BAD_REQUEST', 'prompt and version are required');
  }

  const stubHTML = (accent = '#2563eb') => `<!DOCTYPE html>
<html lang="ar">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>نموذج ${version}</title>
<style>
body{font-family:system-ui;background:#f8fafc;margin:0}
header{background:linear-gradient(90deg,${accent},${accent}80);color:#fff;padding:16px}
main{padding:16px;max-width:960px;margin:0 auto}
section{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.06);padding:16px;margin:12px 0}
button{background:${accent};color:#fff;border:none;padding:10px 14px;border-radius:8px;cursor:pointer}
</style>
</head>
<body>
<header>
<h1>نموذج ${version}</h1>
<p>تم إنشاؤه محليًا للاختبار</p>
</header>
<main>
<section>
<h2>مقتطف من الوصف</h2>
<p>${prompt.replace(/</g,'<').slice(0,400)}...</p>
</section>
<section>
<h2>تجربة</h2>
<button onclick="alert('تم!')">تجربة زر</button>
</section>
</main>
</body>
</html>`;

  if (version === 'flash3') {
    return ok(res, { 
      html: stubHTML('#2563eb'), 
      provider: 'google', 
      model: 'gemini-3-flash-preview', 
      fallback: true 
    });
  }

  if (version === 'alpha') {
    return ok(res, { 
      html: stubHTML('#7c3aed'), 
      provider: 'google', 
      model: 'gemini-3-pro-preview', 
      fallback: true 
    });
  }

  return err(res, 'BAD_REQUEST', 'unsupported version');
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: فحص حالة النظام
 *     description: فحص سريع لحالة النظام ومدى توفره للاستخدام
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: النظام يعمل بشكل طبيعي
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
app.get('/api/health', (req, res) => ok(res, { status: 'ok' }));

// Swagger UI middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'PRD API Documentation'
}));

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(`[docs] Swagger UI available at http://localhost:${PORT}/api-docs`);
});