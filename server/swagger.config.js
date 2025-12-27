import swaggerJSDoc from 'swagger-jsdoc';

// إعدادات Swagger - إنشاء مواصفات API من التعليقات
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PRD API Documentation',
      version: '1.0.0',
      description: `
        <h2>توثيق API نظام PRD</h2>
        <p>هذا التوثيق يحتوي على جميع endpoints المتاحة في نظام PRD للبحث العميق وإنشاء النماذج الأولية.</p>
        <h3>المزودون المدعومون:</h3>
        <ul>
          <li><strong>Google:</strong> Gemini 2.5 Pro, Gemini 3 Flash, Deep Research</li>
          <li><strong>Anthropic:</strong> Claude Sonnet 4.5</li>
          <li><strong>OpenAI:</strong> GPT-5.2, GPT-4.1, O3 Pro</li>
        </ul>
        <h3>المصادقة:</h3>
        <p>يستخدم النظام مفاتيح API مخزنة في متغيرات البيئة</p>
        <h3>القيود:</h3>
        <ul>
          <li>حد أقصى 60 طلب في 5 دقائق</li>
          <li>حجم payload أقصى 1MB</li>
          <li>دعم CORS للمنافذ المسموحة</li>
        </ul>
      `,
      contact: {
        name: 'فريق التطوير',
        email: 'dev@prd-system.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-api-domain.com' 
          : `http://localhost:${process.env.PORT || 4000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server'
      }
    ],
    components: {
      schemas: {
        // مخططات البيانات المشتركة
        
        ResearchStartRequest: {
          type: 'object',
          required: ['input'],
          properties: {
            input: {
              type: 'string',
              description: 'نص البحث المطلوب - يمكن أن يكون سؤال أو موضوع للبحث العميق',
              minLength: 1,
              maxLength: 10000,
              example: 'ما هي أفضل الممارسات في تطوير البرمجيات باستخدام React؟'
            },
            fileSearchStoreNames: {
              type: 'array',
              items: { type: 'string' },
              description: 'أسماء مخازن البحث في الملفات (اختياري)',
              example: ['default-prd-store', 'research-docs']
            },
            enableFileSearch: {
              type: 'boolean',
              description: 'تفعيل البحث في الملفات المخزنة',
              default: false
            }
          }
        },

        ResearchStatusResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['in_progress', 'completed', 'failed'],
              description: 'حالة البحث'
            },
            outputs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'text' },
                  text: { type: 'string', description: 'نص النتائج' }
                }
              },
              description: 'مخرجات البحث'
            },
            provider: {
              type: 'string',
              enum: ['google', 'anthropic', 'openai'],
              description: 'مزود الخدمة المستخدم'
            }
          }
        },

        GeneratePRDRequest: {
          type: 'object',
          required: ['prompt'],
          properties: {
            prompt: {
              type: 'string',
              description: 'وصف المنتج أو المتطلبات لإنشاء PRD',
              minLength: 1,
              maxLength: 5000,
              example: 'إنشاء تطبيق إدارة المهام مع الذكاء الاصطناعي...'
            }
          }
        },

        GeneratePrototypeRequest: {
          type: 'object',
          required: ['prompt', 'version'],
          properties: {
            prompt: {
              type: 'string',
              description: 'وصف المنتج أو PRD لإنشاء النموذج الأولي',
              minLength: 1,
              maxLength: 10000,
              example: 'تطبيق إدارة المهام مع واجهة عربية حديثة...'
            },
            version: {
              type: 'string',
              enum: ['flash3', 'alpha', 'beta', 'pilot'],
              description: 'إصدار النموذج الأولي',
              example: 'flash3'
            }
          }
        },

        GeneratePRDResponse: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'النص المُولد لـ PRD'
            },
            provider: {
              type: 'string',
              enum: ['google', 'anthropic', 'openai'],
              description: 'مزود الخدمة المستخدم'
            },
            model: {
              type: 'string',
              description: 'اسم النموذج المستخدم'
            },
            fallback: {
              type: 'boolean',
              description: 'هل تم استخدام بيانات تجريبية؟'
            }
          }
        },

        GeneratePrototypeResponse: {
          type: 'object',
          properties: {
            html: {
              type: 'string',
              description: 'HTML النموذج الأولي المُولد'
            },
            provider: {
              type: 'string',
              enum: ['google', 'anthropic', 'openai'],
              description: 'مزود الخدمة المستخدم'
            },
            model: {
              type: 'string',
              description: 'اسم النموذج المستخدم'
            },
            fallback: {
              type: 'boolean',
              description: 'هل تم استخدام بيانات تجريبية؟'
            }
          }
        },

        ErrorResponse: {
          type: 'object',
          properties: {
            ok: {
              type: 'boolean',
              example: false
            },
            code: {
              type: 'string',
              description: 'رمز الخطأ'
            },
            message: {
              type: 'string',
              description: 'رسالة الخطأ'
            },
            provider: {
              type: 'string',
              description: 'مزود الخدمة الذي سبب الخطأ'
            },
            status: {
              type: 'number',
              description: 'كود حالة HTTP'
            },
            userAction: {
              type: 'string',
              description: 'إجراء مقترح للمستخدم'
            }
          }
        },

        SuccessResponse: {
          type: 'object',
          properties: {
            ok: {
              type: 'boolean',
              example: true
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Research',
        description: 'عمليات البحث العميق والاستطلاع'
      },
      {
        name: 'Generation',
        description: 'إنشاء المستندات والنماذج الأولية'
      },
      {
        name: 'Health',
        description: 'فحص حالة النظام'
      }
    ]
  },
  apis: ['./index.js'] // مسارات الملفات التي تحتوي على تعليقات JSDoc
};

// إنشاء مواصفات Swagger
export const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;