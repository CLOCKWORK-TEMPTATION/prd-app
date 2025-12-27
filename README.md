# PRD App - Section 5 & 6 Implementation

تنفيذ **Section 5: Guided Mode vs Expert Mode** و **Section 6: Visual Examples Carousel**

---

## 📋 نظرة عامة

### Section 5: Guided Mode vs Expert Mode
وضعين للتطبيق يناسبان جميع أنواع المستخدمين:

**🎯 Guided Mode (الوضع الموجّه)**
- خطوة خطوة مع شرح لكل سؤال
- أمثلة ونصائح في كل مرحلة
- مثالي للمبتدئين
- تقدم تلقائي اختياري

**⚡ Expert Mode (وضع الخبير)**
- كل الأسئلة دفعة واحدة
- سير عمل أسرع
- بدون شروحات إضافية
- للمستخدمين المحترفين

**✨ المميزات:**
- Toggle سهل بين الوضعين
- حفظ تلقائي للتفضيلات
- دعم كامل للعربية (RTL)
- تجربة سلسة ومتسقة

### Section 6: Visual Examples Carousel
عرض أمثلة مرئية لكل خطوة لفهم أسرع 3x:

**📸 أنواع الأمثلة:**
- Screenshots من PRDs ناجحة
- Before/After prototypes
- Best practices مصورة

**🎨 المميزات:**
- تشغيل تلقائي (Auto-play)
- تحكم كامل في العرض
- تصفية حسب الخطوة والفئة
- Responsive design

---

## 🚀 البداية السريعة

### 1. البنية الأساسية

```tsx
import { AppModeProvider } from './src/contexts';
import { ModeToggle, ExamplesCarousel } from './src/components';

function App() {
  return (
    <AppModeProvider>
      <div>
        <header>
          <h1>PRD to Prototype</h1>
          <ModeToggle language="ar-EG" />
        </header>

        <main>
          <ExamplesCarousel
            language="ar-EG"
            step={1}
            category="prd-success"
            autoPlay={true}
          />

          {/* بقية التطبيق */}
        </main>
      </div>
    </AppModeProvider>
  );
}
```

### 2. استخدام الوضع في المكونات

```tsx
import { useAppMode, useIsGuidedMode } from './src/contexts';

function QuestionForm() {
  const isGuided = useIsGuidedMode();

  return isGuided ? (
    <StepByStepForm />
  ) : (
    <AllQuestionsForm />
  );
}
```

---

## 📁 الملفات المنفذة

```
/home/user/prd-app/
├── src/
│   ├── types/
│   │   └── index.ts                    # أنواع TypeScript
│   ├── contexts/
│   │   ├── AppModeContext.tsx         # Context للوضع
│   │   └── index.ts
│   ├── components/
│   │   ├── ModeToggle.tsx             # مكون تبديل الوضع
│   │   ├── ExamplesCarousel.tsx       # مكون عرض الأمثلة
│   │   └── index.ts
│   └── index.ts                       # نقطة التصدير الرئيسية
├── INTEGRATION_GUIDE.md               # دليل التكامل الشامل
└── README.md                          # هذا الملف
```

---

## 🎯 المكونات الرئيسية

### 1. AppModeProvider

Context provider لإدارة الوضع:

```tsx
<AppModeProvider>
  {children}
</AppModeProvider>
```

**المميزات:**
- حفظ تلقائي في localStorage
- إدارة الحالة المركزية
- Hooks سهلة الاستخدام

### 2. ModeToggle

مكون تبديل الوضع بثلاث نسخ:

```tsx
// النسخة القياسية
<ModeToggle language="ar-EG" />

// النسخة المدمجة
<ModeToggleCompact language="en-US" />

// مع شرح تفصيلي
<ModeToggleWithExplanation language="ar-EG" />
```

### 3. ExamplesCarousel

عرض الأمثلة المرئية:

```tsx
<ExamplesCarousel
  language="ar-EG"
  step={2}                      // تصفية حسب الخطوة
  category="prd-success"        // prd-success | prototype-before-after | best-practice | all
  autoPlay={true}
  autoPlayInterval={5000}
  showControls={true}
  showIndicators={true}
  examples={customExamples}     // أمثلة مخصصة (اختياري)
/>
```

---

## 🔧 Hooks المتاحة

```tsx
// 1. الوصول الشامل
const { mode, settings, toggleMode, setMode, updateSettings } = useAppMode();

// 2. الوضع فقط
const mode = useCurrentMode(); // 'guided' | 'expert'

// 3. فحص الوضع
const isGuided = useIsGuidedMode(); // boolean
const isExpert = useIsExpertMode(); // boolean
```

---

## 🌍 الدعم متعدد اللغات

جميع المكونات تدعم:
- **English (en-US)**: Left-to-right
- **العربية (ar-EG)**: Right-to-left

مع ترجمة كاملة لجميع النصوص ودعم RTL تلقائي.

---

## 📊 أمثلة الاستخدام

### مثال 1: صفحة PRD مع الوضعين

```tsx
function PRDPage() {
  const { mode } = useAppMode();
  const [step, setStep] = useState(1);

  return (
    <div>
      <ModeToggle language="ar-EG" />

      <ExamplesCarousel
        language="ar-EG"
        step={step}
        category="prd-success"
      />

      {mode === 'guided' ? (
        <GuidedForm step={step} onNext={() => setStep(s => s + 1)} />
      ) : (
        <ExpertForm />
      )}
    </div>
  );
}
```

### مثال 2: Before/After Prototypes

```tsx
function PrototypeGallery() {
  return (
    <div>
      <h2>Prototype Evolution</h2>
      <ExamplesCarousel
        language="en-US"
        category="prototype-before-after"
        autoPlay={true}
        autoPlayInterval={4000}
      />
    </div>
  );
}
```

### مثال 3: Best Practices Section

```tsx
function BestPractices() {
  return (
    <ExamplesCarousel
      language="ar-EG"
      category="best-practice"
      showControls={true}
      showIndicators={true}
    />
  );
}
```

---

## 💾 البيانات المحفوظة

يتم حفظ الإعدادات تلقائياً في localStorage:

```json
{
  "mode": "guided",
  "showExamples": true,
  "autoAdvance": false
}
```

**المفتاح:** `prd-app-mode-settings`

---

## 🎨 التخصيص

### تخصيص الألوان

المكونات تستخدم:
- **Guided Mode**: `#4f46e5` (Indigo)
- **Expert Mode**: `#10b981` (Green)

### إضافة CSS مخصص

```css
.mode-toggle {
  /* تخصيصك */
}

.examples-carousel {
  max-width: 1200px;
  margin: 0 auto;
}
```

### أمثلة مخصصة

```tsx
import { VisualExample } from './src/types';

const myExamples: VisualExample[] = [
  {
    id: 'my-1',
    title: 'My PRD Example',
    titleAr: 'مثال PRD الخاص بي',
    description: 'Description...',
    descriptionAr: 'الوصف...',
    imageUrl: '/images/my-example.png',
    category: 'prd-success',
    step: 1
  }
];

<ExamplesCarousel examples={myExamples} />
```

---

## ✅ المتطلبات

- React 16.8+ (Hooks support)
- TypeScript 4.0+ (optional)
- Modern browser with localStorage support

---

## 📚 الوثائق الكاملة

راجع [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) للتفاصيل الكاملة:
- أمثلة متقدمة
- Best practices
- Troubleshooting
- Testing strategies

---

## 🎯 التأثير المتوقع

### Section 5 (Guided vs Expert)
- ✅ يناسب جميع مستويات المستخدمين
- ✅ تجربة شخصية
- ✅ معدل إكمال أعلى

### Section 6 (Visual Examples)
- ✅ فهم أسرع 3x
- ✅ جودة PRD أفضل
- ✅ تعلم من الأمثلة الواقعية

---

## 📝 الخطوات التالية

1. **إضافة صور حقيقية**: استبدل placeholder images بـ screenshots فعلية
2. **Integration**: دمج المكونات مع التطبيق الحالي
3. **Testing**: اختبار شامل للمكونات
4. **Analytics**: تتبع استخدام الوضعين
5. **Feedback**: جمع ملاحظات المستخدمين

---

## 🤝 المساهمة

تم تنفيذ هذه المكونات كجزء من خارطة الطريق.

للمساهمة:
1. اقرأ الكود في `/src`
2. راجع `INTEGRATION_GUIDE.md`
3. اختبر المكونات
4. شارك ملاحظاتك

---

## 📄 الرخصة

جزء من مشروع PRD to Prototype App

---

## 📞 الدعم

للأسئلة أو المشاكل:
1. راجع `INTEGRATION_GUIDE.md`
2. اقرأ الكود والتعليقات
3. جرّب الأمثلة

---

**تم التنفيذ بنجاح! ✨**

Section 5 ✅ | Section 6 ✅
