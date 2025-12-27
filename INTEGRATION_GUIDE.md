# Integration Guide - Section 5 & 6

دليل التكامل للمكونات الجديدة: Guided Mode vs Expert Mode + Visual Examples Carousel

## نظرة عامة

تم تنفيذ Section 5 و Section 6 من خارطة الطريق:

### Section 5: Guided Mode vs Expert Mode
- وضعين للتطبيق: Guided (موجّه) و Expert (خبير)
- Guided: خطوة خطوة مع شرح كل سؤال
- Expert: كل شيء مرة واحدة للمستخدمين المحترفين
- Toggle سهل بين الوضعين مع حفظ تلقائي للتفضيلات

### Section 6: Visual Examples Carousel
- عرض أمثلة مرئية لكل خطوة
- Screenshots من PRDs ناجحة
- Before/After prototypes
- Best practices مصورة
- تشغيل تلقائي اختياري مع التحكم الكامل

---

## 📁 هيكل الملفات

```
src/
├── types/
│   └── index.ts              # تعريفات الأنواع
├── contexts/
│   ├── AppModeContext.tsx    # Context للوضع
│   └── index.ts
├── components/
│   ├── ModeToggle.tsx        # مكون تبديل الوضع
│   ├── ExamplesCarousel.tsx  # مكون عرض الأمثلة
│   └── index.ts
└── index.ts                  # نقطة التصدير الرئيسية
```

---

## 🚀 التكامل السريع

### الخطوة 1: إضافة AppModeProvider

أضف `AppModeProvider` في جذر التطبيق:

```tsx
import React from 'react';
import { AppModeProvider } from './src/contexts';
import App from './App';

function Root() {
  return (
    <AppModeProvider>
      <App />
    </AppModeProvider>
  );
}

export default Root;
```

### الخطوة 2: استخدام ModeToggle

أضف `ModeToggle` في الـ header أو navigation:

```tsx
import { ModeToggle } from './src/components';

function Header({ language }) {
  return (
    <header>
      <h1>PRD to Prototype</h1>
      {/* النسخة الكاملة */}
      <ModeToggle language={language} />

      {/* أو النسخة المدمجة */}
      {/* <ModeToggleCompact language={language} /> */}
    </header>
  );
}
```

### الخطوة 3: استخدام ExamplesCarousel

أضف `ExamplesCarousel` في الخطوات المناسبة:

```tsx
import { ExamplesCarousel } from './src/components';

function PRDCreationStep({ currentStep, language }) {
  return (
    <div>
      <h2>Create Your PRD</h2>

      {/* عرض الأمثلة للخطوة الحالية */}
      <ExamplesCarousel
        language={language}
        step={currentStep}
        category="prd-success"
        autoPlay={true}
        autoPlayInterval={5000}
      />

      {/* محتوى الخطوة */}
      <form>...</form>
    </div>
  );
}
```

### الخطوة 4: استخدام الوضع في المكونات

استخدم hooks للوصول إلى الوضع الحالي:

```tsx
import { useAppMode, useIsGuidedMode } from './src/contexts';

function QuestionForm() {
  const { mode, settings } = useAppMode();
  const isGuided = useIsGuidedMode();

  return (
    <div>
      {isGuided && (
        <div className="guidance-section">
          <p>💡 نصيحة: اشرح بالتفصيل...</p>
        </div>
      )}

      {mode === 'expert' ? (
        <MultiStepForm /> // كل الأسئلة دفعة واحدة
      ) : (
        <StepByStepForm /> // خطوة خطوة
      )}
    </div>
  );
}
```

---

## 🎨 تخصيص المكونات

### تخصيص ModeToggle

```tsx
<ModeToggle
  language="ar-EG"
  className="custom-toggle"
/>

{/* مع شرح تفصيلي */}
<ModeToggleWithExplanation
  language="en-US"
  className="with-explanation"
/>
```

### تخصيص ExamplesCarousel

```tsx
<ExamplesCarousel
  language="ar-EG"
  step={2}                    // تصفية حسب الخطوة
  category="best-practice"    // تصفية حسب الفئة
  autoPlay={true}
  autoPlayInterval={3000}
  showControls={true}
  showIndicators={true}
  examples={customExamples}   // أمثلة مخصصة
/>

{/* النسخة المدمجة */}
<ExamplesCarouselCompact
  language="en-US"
  step={1}
  category="all"
/>
```

---

## 🔧 إضافة أمثلة مخصصة

```tsx
import { VisualExample } from './src/types';

const myCustomExamples: VisualExample[] = [
  {
    id: 'custom-1',
    title: 'My Custom PRD',
    titleAr: 'PRD مخصص',
    description: 'Description in English',
    descriptionAr: 'الوصف بالعربية',
    imageUrl: '/path/to/image.png',
    category: 'prd-success',
    step: 2
  },
  // المزيد من الأمثلة...
];

// استخدام الأمثلة المخصصة
<ExamplesCarousel
  examples={myCustomExamples}
  language="ar-EG"
/>
```

---

## 📊 أمثلة الاستخدام

### مثال 1: صفحة إنشاء PRD

```tsx
import React, { useState } from 'react';
import {
  AppModeProvider,
  useAppMode,
  ModeToggle,
  ExamplesCarousel
} from './src';

function PRDCreator() {
  const [currentStep, setCurrentStep] = useState(1);
  const { mode } = useAppMode();
  const language = 'ar-EG';

  return (
    <div>
      {/* Header with Mode Toggle */}
      <header>
        <h1>إنشاء PRD</h1>
        <ModeToggleCompact language={language} />
      </header>

      {/* Examples for current step */}
      <ExamplesCarousel
        language={language}
        step={currentStep}
        category="prd-success"
        autoPlay={mode === 'guided'}
      />

      {/* Form based on mode */}
      {mode === 'guided' ? (
        <GuidedStepForm
          step={currentStep}
          onNext={() => setCurrentStep(s => s + 1)}
        />
      ) : (
        <ExpertAllInOneForm />
      )}
    </div>
  );
}

// تغليف بـ Provider
function App() {
  return (
    <AppModeProvider>
      <PRDCreator />
    </AppModeProvider>
  );
}
```

### مثال 2: صفحة النموذج الأولي

```tsx
function PrototypeSection() {
  const language = 'en-US';

  return (
    <div>
      <h2>Prototype Examples</h2>

      {/* عرض Before/After فقط */}
      <ExamplesCarousel
        language={language}
        category="prototype-before-after"
        autoPlay={true}
        autoPlayInterval={4000}
      />

      <button>Generate Prototype</button>
    </div>
  );
}
```

### مثال 3: Best Practices Section

```tsx
function BestPracticesPage() {
  return (
    <div>
      <h2>Best Practices</h2>

      {/* عرض أفضل الممارسات فقط */}
      <ExamplesCarousel
        language="ar-EG"
        category="best-practice"
        showControls={true}
        showIndicators={true}
      />
    </div>
  );
}
```

---

## 🎯 Hooks المتاحة

```tsx
// الحصول على كل شيء
const { mode, settings, toggleMode, setMode, updateSettings } = useAppMode();

// الحصول على الوضع فقط
const mode = useCurrentMode(); // 'guided' | 'expert'

// فحص الوضع
const isGuided = useIsGuidedMode(); // boolean
const isExpert = useIsExpertMode(); // boolean

// تحديث الإعدادات
updateSettings({
  showExamples: false,
  autoAdvance: true
});
```

---

## 💾 حفظ البيانات

- **تلقائي**: يتم حفظ إعدادات الوضع تلقائياً في `localStorage`
- **المفتاح**: `'prd-app-mode-settings'`
- **البيانات المحفوظة**:
  - `mode`: الوضع الحالي
  - `showExamples`: عرض الأمثلة أم لا
  - `autoAdvance`: التقدم التلقائي

---

## 🌍 الدعم متعدد اللغات

المكونات تدعم لغتين:
- `'en-US'`: الإنجليزية (LTR)
- `'ar-EG'`: العربية (RTL)

جميع النصوص مترجمة بالكامل مع دعم RTL تلقائي.

---

## 🎨 Styling

المكونات تستخدم inline styles للتوافق الأقصى. يمكنك:

1. **إضافة CSS classes** عبر `className` prop
2. **Override inline styles** باستخدام CSS
3. **تخصيص الألوان** عبر CSS variables

مثال:

```css
.mode-toggle {
  /* تخصيص */
}

.examples-carousel {
  /* تخصيص */
}
```

---

## ✅ الاختبار

اختبر المكونات:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AppModeProvider, ModeToggle } from './src';

test('mode toggle works', () => {
  render(
    <AppModeProvider>
      <ModeToggle language="en-US" />
    </AppModeProvider>
  );

  const toggle = screen.getByRole('switch');
  expect(toggle).toBeInTheDocument();

  fireEvent.click(toggle);
  // تحقق من تغيير الوضع
});
```

---

## 📝 ملاحظات مهمة

1. **AppModeProvider**: يجب أن يكون في جذر التطبيق
2. **localStorage**: تأكد من أن المتصفح يدعم localStorage
3. **Images**: استبدل الصور placeholder بصور حقيقية
4. **Performance**: استخدم `ExamplesCarouselCompact` للأداء الأفضل
5. **Accessibility**: جميع المكونات تدعم keyboard navigation

---

## 🔄 التحديثات المستقبلية

- [ ] إضافة lazy loading للصور
- [ ] دعم لغات إضافية
- [ ] إضافة animations متقدمة
- [ ] Integration مع analytics
- [ ] دعم themes

---

## 📞 الدعم

للأسئلة أو المساعدة، راجع الكود في:
- `/src/types/index.ts`
- `/src/contexts/AppModeContext.tsx`
- `/src/components/ModeToggle.tsx`
- `/src/components/ExamplesCarousel.tsx`
