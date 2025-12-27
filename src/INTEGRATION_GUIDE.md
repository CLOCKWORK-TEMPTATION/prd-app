# دليل التكامل - Integration Guide
## Section 1 & 2: Onboarding Tour & Templates Library

### نظرة عامة - Overview

تم تطوير مكونين رئيسيين:
1. **OnboardingTour**: جولة تفاعلية للمستخدمين الجدد
2. **TemplatesLibrary**: مكتبة قوالب جاهزة

---

## 📁 بنية الملفات - File Structure

```
src/
├── components/
│   ├── OnboardingTour.tsx       # Section 1
│   ├── TemplatesLibrary.tsx     # Section 2
│   └── AppEnhanced.tsx          # Wrapper component
├── types/
│   └── index.ts                 # TypeScript interfaces
└── styles/
    ├── onboarding.css           # Onboarding styles
    └── templates.css            # Templates styles
```

---

## 🔧 كيفية التكامل - How to Integrate

### الخطوة 1: استيراد المكونات - Import Components

```tsx
import OnboardingTour from './src/components/OnboardingTour';
import TemplatesLibrary from './src/components/TemplatesLibrary';
import './src/styles/onboarding.css';
import './src/styles/templates.css';
```

### الخطوة 2: إضافة State Management

```tsx
const [showOnboarding, setShowOnboarding] = useState(false);
const [showTemplates, setShowTemplates] = useState(false);

// Check if user has completed onboarding
useEffect(() => {
  const hasCompletedOnboarding = localStorage.getItem('prd-onboarding-completed');
  if (!hasCompletedOnboarding) {
    setShowOnboarding(true);
  }
}, []);
```

### الخطوة 3: إضافة Data Attributes للعناصر

أضف `data-tour` attributes للعناصر المستهدفة في الجولة:

```tsx
// Research Tab
<button data-tour="research-tab" onClick={() => setActiveTab(0)}>
  Product Research
</button>

// PRD Tab
<button data-tour="prd-tab" onClick={() => setActiveTab(1)}>
  Create PRD
</button>

// Prototype Tab
<button data-tour="prototype-tab" onClick={() => setActiveTab(2)}>
  Generate Prototype
</button>

// Templates Button
<button data-tour="templates-button" onClick={() => setShowTemplates(true)}>
  Templates
</button>
```

### الخطوة 4: إضافة المكونات إلى JSX

```tsx
return (
  <div>
    {/* Your existing app content */}

    {/* Onboarding Tour */}
    <OnboardingTour
      isOpen={showOnboarding}
      onClose={() => setShowOnboarding(false)}
      onComplete={() => {
        setShowOnboarding(false);
        // Optional: Show templates after onboarding
        setTimeout(() => setShowTemplates(true), 500);
      }}
      locale={locale}
    />

    {/* Templates Library */}
    <TemplatesLibrary
      isOpen={showTemplates}
      onClose={() => setShowTemplates(false)}
      onSelectTemplate={(template) => {
        // Handle template selection
        // Example: Fill form fields with template data
        setQuestion1(template.content.productDescription);
        setQuestion2(template.content.targetUsers);
        setQuestion3(template.content.keyFeatures.join(', '));
        setActiveTab(1); // Switch to PRD tab
      }}
      locale={locale}
    />
  </div>
);
```

---

## 🎨 التخصيص - Customization

### تخصيص خطوات الجولة - Customize Tour Steps

عدّل في `src/components/OnboardingTour.tsx`:

```tsx
const steps: OnboardingStep[] = [
  {
    id: 'custom-step',
    title: 'Your Custom Title',
    titleAr: 'العنوان المخصص',
    description: 'Your description',
    descriptionAr: 'الوصف بالعربية',
    target: '[data-tour="your-element"]',
    placement: 'bottom',
    icon: '🎯'
  },
  // Add more steps...
];
```

### إضافة قوالب جديدة - Add New Templates

عدّل في `src/components/TemplatesLibrary.tsx`:

```tsx
const templates: Template[] = [
  // Existing templates...
  {
    id: 'your-template',
    name: 'Your Template Name',
    nameAr: 'اسم القالب بالعربية',
    description: 'Description',
    descriptionAr: 'الوصف بالعربية',
    category: 'saas', // or 'mobile', 'ecommerce', 'other'
    icon: '🎯',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    content: {
      productName: 'Product Name',
      productDescription: 'Description',
      targetUsers: 'Target users',
      problemStatement: 'Problem statement',
      keyFeatures: ['Feature 1', 'Feature 2'],
      successMetrics: ['Metric 1', 'Metric 2']
    },
    examples: [
      {
        title: 'Example Title',
        titleAr: 'عنوان المثال',
        description: 'Description',
        descriptionAr: 'الوصف'
      }
    ],
    tips: ['Tip 1', 'Tip 2'],
    tipsAr: ['نصيحة 1', 'نصيحة 2'],
    difficulty: 'beginner',
    estimatedTime: '15-20 minutes',
    popularity: 85
  }
];
```

---

## 📊 Analytics & Tracking

### تتبع إكمال الجولة - Track Onboarding Completion

```tsx
// الجولة مكتملة
localStorage.getItem('prd-onboarding-completed'); // 'true' if completed
localStorage.getItem('prd-onboarding-completed-at'); // ISO timestamp

// الجولة مُتخطاة
localStorage.getItem('prd-onboarding-skipped'); // 'true' if skipped
```

### تتبع استخدام القوالب - Track Template Usage

```tsx
// آخر قالب مستخدم
localStorage.getItem('prd-last-used-template'); // template ID

// تاريخ الاستخدام
const usage = JSON.parse(localStorage.getItem('prd-template-usage') || '[]');
// Returns: [{ templateId: 'saas-product', usedAt: '2024-01-15T...' }, ...]
```

---

## 🌐 دعم اللغات - Language Support

يدعم المكونان العربية والإنجليزية:

```tsx
// English
<OnboardingTour locale="en-US" />
<TemplatesLibrary locale="en-US" />

// Arabic (RTL)
<OnboardingTour locale="ar-EG" />
<TemplatesLibrary locale="ar-EG" />
```

---

## 🎯 الأهداف المحققة - Achieved Goals

### Section 1: Interactive Onboarding Tour
- ✅ Tooltips متحركة لكل عنصر
- ✅ خيار "Skip" للمستخدمين المتقدمين
- ✅ Progress indicator (Step X of 5)
- ✅ Keyboard navigation (Arrow keys, Escape)
- ✅ Highlighting مع animations
- 🎯 **الهدف**: تقليل bounce rate بنسبة 40-60%

### Section 2: Smart Templates Library
- ✅ 3 قوالب جاهزة (SaaS, Mobile App, E-commerce)
- ✅ أمثلة وإرشادات لكل قالب
- ✅ Search & filter functionality
- ✅ Difficulty levels & estimated time
- ✅ Popularity indicators
- 🎯 **الهدف**: 70% من المبتدئين يكملون أول PRD

---

## 🔍 الميزات الإضافية - Additional Features

### OnboardingTour
- Responsive design (mobile-friendly)
- Dark mode support
- RTL support
- Accessibility (keyboard navigation, ARIA labels)
- Smooth animations
- Auto-scroll to highlighted elements
- Step indicators with progress bar

### TemplatesLibrary
- Real-time search
- Multi-level filtering (category, difficulty)
- Detailed template preview
- Usage analytics tracking
- Popularity scoring
- Interactive template selection
- Mobile-responsive grid

---

## 🐛 Troubleshooting

### المكونات لا تظهر
1. تأكد من استيراد ملفات CSS
2. تأكد من أن `isOpen` prop هو `true`
3. تحقق من z-index في CSS

### الجولة لا تُبرز العناصر
1. تأكد من إضافة `data-tour` attributes
2. تحقق من أن CSS selectors صحيحة
3. تأكد من أن العناصر موجودة في DOM

### القوالب لا تملأ النموذج
1. تحقق من `onSelectTemplate` callback
2. تأكد من أن state variables موجودة
3. راجع console للأخطاء

---

## 📝 أمثلة الاستخدام - Usage Examples

### مثال كامل - Full Example

راجع `src/components/AppEnhanced.tsx` للمثال الكامل للتكامل.

---

## 🚀 الخطوات التالية - Next Steps

1. اختبر المكونات في بيئة التطوير
2. قم بتخصيص القوالب حسب احتياجاتك
3. أضف المزيد من الخطوات للجولة إذا لزم الأمر
4. راقب analytics لقياس التأثير
5. اجمع feedback من المستخدمين

---

## 📧 الدعم - Support

إذا واجهت أي مشاكل، راجع:
- TypeScript types في `src/types/index.ts`
- الكود المصدري في `src/components/`
- هذا الدليل

---

**تم التطوير بواسطة**: Claude Code Agent
**التاريخ**: 2025-12-27
**الإصدار**: 1.0.0
