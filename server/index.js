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
import logger from './logger.js';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(helmet());
app.use(cors({ origin: process.env.APP_ALLOWED_ORIGINS?.split(',') || '*', credentials: false }));
app.use(rateLimit({ windowMs: 5 * 60 * 1000, max: 60 }));

const PORT = process.env.PORT;
if (!PORT) {
  throw new Error('PORT required');
}

// Providers (initialized if keys present)
const googleKey = process.env.GOOGLE_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

const google = googleKey ? new GoogleGenAI({ apiKey: googleKey }) : null;
const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

// In-memory mock jobs for research when GOOGLE_API_KEY missing
const mockResearchJobs = new Map();

// Retry utility with exponential backoff and jitter
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt < maxRetries - 1) {
        const jitter = Math.random() * 0.3; // 0-30% jitter
        const delay = baseDelay * Math.pow(2, attempt) * (1 + jitter);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// Error normalization
function normalizeError(error, provider = 'unknown') {
  const errorMap = {
    'ECONNREFUSED': { code: 'CONNECTION_FAILED', message: 'تعذر الاتصال بالخدمة. يُرجى المحاولة مرة أخرى.', userAction: 'تحقق من اتصالك بالإنترنت وحاول مجددًا' },
    'ETIMEDOUT': { code: 'TIMEOUT', message: 'انتهت مهلة الطلب. يُرجى المحاولة مرة أخرى.', userAction: 'حاول مرة أخرى بعد قليل' },
    'ENOTFOUND': { code: 'DNS_ERROR', message: 'تعذر العثور على الخدمة.', userAction: 'تحقق من إعدادات الشبكة' },
    'RATE_LIMIT': { code: 'RATE_LIMIT', message: 'تم تجاوز حد الطلبات. يُرجى الانتظار قليلاً.', userAction: 'انتظر دقيقة واحدة وحاول مجددًا' },
    'QUOTA_EXCEEDED': { code: 'QUOTA_EXCEEDED', message: 'تم تجاوز الحصة المخصصة.', userAction: 'راجع حد الاستخدام الخاص بك' },
    'INVALID_API_KEY': { code: 'AUTH_ERROR', message: 'مفتاح API غير صحيح.', userAction: 'تحقق من إعدادات المفاتيح' },
    'PERMISSION_DENIED': { code: 'PERMISSION_DENIED', message: 'تم رفض الإذن.', userAction: 'تحقق من صلاحيات API' }
  };

  const errorType = error.code || error.message?.includes('rate limit') ? 'RATE_LIMIT' :
                    error.message?.includes('quota') ? 'QUOTA_EXCEEDED' :
                    error.message?.includes('API key') ? 'INVALID_API_KEY' : 'UNKNOWN';

  const normalized = errorMap[errorType] || errorMap[error.code] || {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'حدث خطأ غير متوقع',
    userAction: 'حاول مرة أخرى أو اتصل بالدعم'
  };

  return {
    ...normalized,
    provider,
    originalError: error.message,
    timestamp: new Date().toISOString()
  };
}

function ok(res, data) { return res.json({ ok: true, ...data }); }
function err(res, code, message, provider, status, userAction) {
  return res.status(status || 500).json({ ok: false, code, message, provider, status: status || 500, userAction });
}

/**
 * @swagger
 * /api/research/start:
 *   post:
 *     summary: بدء البحث العميق
 *     description: |
 *       يبدأ عملية بحث عميق باستخدام Google Gemini Deep Research API.
 *       يمكن استخدام البحث في الملفات المخزنة للحصول على نتائج أكثر دقة.
 *     tags: [Research]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResearchStartRequest'
 *           examples:
 *             basic_search:
 *               summary: بحث أساسي
 *               value:
 *                 input: "ما هي أفضل الممارسات في تطوير البرمجيات باستخدام React؟"
 *             file_search:
 *               summary: بحث مع ملفات
 *               value:
 *                 input: "تحليل أداء التطبيقات العربية"
 *                 enableFileSearch: true
 *                 fileSearchStoreNames: ["arabic-apps-research"]
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
 *                 model:
 *                   type: string
 *                   example: "deep-research-pro-preview-12-2025"
 *                 fileSearchEnabled:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: بيانات غير صحيحة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               code: "BAD_REQUEST"
 *               message: "input is required"
 *               status: 400
 *               userAction: "تأكد من إدخال نص صحيح"
 *       500:
 *         description: خطأ في الخادم أو مزود الخدمة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Start Deep Research (Gemini Interactions API)
app.post('/api/research/start', async (req, res) => {
  const { input, fileSearchStoreNames, enableFileSearch } = req.body || {};
  if (!input || typeof input !== 'string') return err(res, 'BAD_REQUEST', 'input is required', null, 400, 'تأكد من إدخال نص صحيح');

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
    return ok(res, { interactionId: id, status: 'in_progress', provider: 'google', model: 'deep-research-pro-preview-12-2025' });
  }

  try {
    // Configure file_search with secure settings
    let tools;
    if (enableFileSearch) {
      const storeNames = Array.isArray(fileSearchStoreNames) && fileSearchStoreNames.length
        ? fileSearchStoreNames
        : [process.env.GEMINI_FILE_SEARCH_STORE || 'default-prd-store'];

      tools = [{
        type: 'file_search',
        file_search_store_names: storeNames,
        // Secure configuration
        config: {
          max_results: 10,
          min_relevance_score: 0.7,
          enable_citations: true
        }
      }];
    }

    const interaction = await retryWithBackoff(async () => {
      return await google.interactions.create({
        input,
        agent: 'deep-research-pro-preview-12-2025',
        background: true,
        tools
      });
    }, 3, 2000);

    return ok(res, {
      interactionId: interaction.id,
      status: interaction.status,
      provider: 'google',
      model: 'deep-research-pro-preview-12-2025',
      fileSearchEnabled: !!enableFileSearch
    });
  } catch (e) {
    const normalized = normalizeError(e, 'google');
    return err(res, normalized.code, normalized.message, 'google', 500, normalized.userAction);
  }
});

/**
 * @swagger
 * /api/research/status:
 *   get:
 *     summary: مراجعة حالة البحث العميق
 *     description: |
 *       يجلب حالة البحث العميق باستخدام معرف التفاعل الذي تم إرجاعه من endpoint /api/research/start.
 *       يمكن استخدام هذا للحصول على النتائج عند اكتمال البحث.
 *     tags: [Research]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف التفاعل الذي تم إرجاعه من /api/research/start
 *         example: "interaction_abc123"
 *     responses:
 *       200:
 *         description: تم جلب حالة البحث بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResearchStatusResponse'
 *             example:
 *               ok: true
 *               status: "completed"
 *               outputs: [
 *                 {
 *                   type: "text",
 *                   text: "# نتائج البحث\n\n## الملخص التنفيذي\n...المحتوى هنا"
 *                 }
 *               ]
 *               provider: "google"
 *       400:
 *         description: معرف البحث مطلوب
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               code: "BAD_REQUEST"
 *               message: "id is required"
 *               status: 400
 *       404:
 *         description: البحث غير موجود
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               code: "NOT_FOUND"
 *               message: "interaction not found"
 *               status: 404
 *       500:
 *         description: خطأ في مزود الخدمة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/research/stream:
 *   get:
 *     summary: بث مباشر لحالة البحث العميق
 *     description: |
 *       يوفر بث مباشر (Server-Sent Events) لحالة البحث العميق.
 *       يتم إرسال تحديثات دورية لحالة البحث حتى اكتماله.
 *     tags: [Research]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف التفاعل الذي تم إرجاعه من /api/research/start
 *         example: "interaction_abc123"
 *     responses:
 *       200:
 *         description: اتصال SSE ناجح
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *             example: |
 *               event: status
 *               data: {"status":"in_progress","provider":"google"}
 *               
 *               event: outputs
 *               data: {"outputs":[{"type":"text","text":"# نتائج البحث..."}],"provider":"google"}
 *               
 *               event: done
 *               data: {"status":"completed"}
 *       400:
 *         description: معرف البحث مطلوب
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: البحث غير موجود
 *         content:
 *           text/event-stream:
 *             example: |
 *               event: error
 *               data: {"code":"NOT_FOUND","message":"interaction not found","provider":"google"}
 */
// SSE Stream for Deep Research (with reconnection support)
app.get('/api/research/stream', async (req, res) => {
  const id = req.query.id;
  if (!id) return err(res, 'BAD_REQUEST', 'id is required');

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const sendError = (code, message) => {
    sendEvent('error', { code, message, provider: 'google' });
    res.end();
  };

  if (!google) {
    // Mock streaming
    const job = mockResearchJobs.get(id);
    if (!job) return sendError('NOT_FOUND', 'interaction not found');

    sendEvent('status', { status: job.status, provider: 'google' });

    const pollInterval = setInterval(async () => {
      const currentJob = mockResearchJobs.get(id);
      if (!currentJob) {
        clearInterval(pollInterval);
        return sendError('NOT_FOUND', 'interaction not found');
      }

      sendEvent('status', { status: currentJob.status, provider: 'google' });

      if (currentJob.status === 'completed') {
        sendEvent('outputs', { outputs: currentJob.outputs, provider: 'google' });
        sendEvent('done', { status: 'completed' });
        clearInterval(pollInterval);
        res.end();
      }
    }, 2000);

    req.on('close', () => {
      clearInterval(pollInterval);
    });
    return;
  }

  try {
    // Real streaming with Gemini
    const pollInterval = setInterval(async () => {
      try {
        const interaction = await google.interactions.get(id);
        sendEvent('status', { status: interaction.status, provider: 'google', model: 'deep-research-pro-preview-12-2025' });

        if (interaction.status === 'completed' || interaction.status === 'failed') {
          clearInterval(pollInterval);
          if (interaction.outputs) {
            sendEvent('outputs', { outputs: interaction.outputs, provider: 'google' });
          }
          sendEvent('done', { status: interaction.status });
          res.end();
        }
      } catch (e) {
        clearInterval(pollInterval);
        sendError('PROVIDER_ERROR', e.message);
      }
    }, 3000);

    req.on('close', () => {
      clearInterval(pollInterval);
    });
  } catch (e) {
    return sendError('PROVIDER_ERROR', e.message);
  }
});

/**
 * @swagger
 * /api/generate/prd:
 *   post:
 *     summary: إنشاء مستند Product Requirements Document (PRD)
 *     description: |
 *       ينشئ مستند متطلبات المنتج باستخدام Google Gemini 2.5 Pro.
 *       يمكن استخدام هذا لإنشاء مستندات شاملة ومنظمة للمشاريع والمنتجات.
 *     tags: [Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneratePRDRequest'
 *           examples:
 *             task_management_app:
 *               summary: تطبيق إدارة المهام
 *               value:
 *                 prompt: "إنشاء تطبيق إدارة مهام متقدم مع ميزات الذكاء الاصطناعي، واجهة عربية، ومزامنة سحابية"
 *             e_commerce_platform:
 *               summary: منصة تجارة إلكترونية
 *               value:
 *                 prompt: "منصة تجارة إلكترونية تدعم عدة بائعين مع نظام دفع متكامل ونظام إدارة المخزون الذكي"
 *     responses:
 *       200:
 *         description: تم إنشاء PRD بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeneratePRDResponse'
 *             example:
 *               ok: true
 *               text: "# Product Requirements Document\n\n## Overview\nإنشاء تطبيق إدارة مهام متقدم مع ميزات الذكاء الاصطناعي...\n\n## Goals\n- تحسين إنتاجية المستخدمين\n- توفير واجهة سهلة الاستخدام\n\n## Success Metrics\n- تقليل وقت إنجاز المهام بنسبة 30%"
 *               provider: "google"
 *               model: "gemini-2.5-pro"
 *               fallback: false
 *       400:
 *         description: البيانات المطلوبة غير متوفرة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               code: "BAD_REQUEST"
 *               message: "prompt is required"
 *               status: 400
 *       500