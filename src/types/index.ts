/**
 * Types for Section 5 & 6 Implementation
 * Guided Mode vs Expert Mode + Visual Examples Carousel
 */

/**
 * نوع الوضع - وضع موجه أو خبير
 */
export type AppMode = 'guided' | 'expert';

/**
 * مثال مرئي لـ Carousel
 */
export interface VisualExample {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  imageUrl: string;
  category: 'prd-success' | 'prototype-before-after' | 'best-practice';
  step?: number; // رقم الخطوة المرتبطة بها (اختياري)
}

/**
 * إعدادات الوضع
 */
export interface ModeSettings {
  mode: AppMode;
  showExamples: boolean;
  autoAdvance: boolean; // تقدم تلقائي في الوضع الموجه
}

/**
 * سياق الوضع
 */
export interface AppModeContextType {
  mode: AppMode;
  settings: ModeSettings;
  toggleMode: () => void;
  setMode: (mode: AppMode) => void;
  updateSettings: (settings: Partial<ModeSettings>) => void;
}

/**
 * حالة Carousel
 */
export interface CarouselState {
  currentIndex: number;
  isPlaying: boolean;
  examples: VisualExample[];
}

/**
 * بيانات أمثلة البصرية الافتراضية
 */
export const DEFAULT_VISUAL_EXAMPLES: VisualExample[] = [
  {
    id: 'prd-1',
    title: 'Successful SaaS PRD',
    titleAr: 'PRD ناجح لتطبيق SaaS',
    description: 'A well-structured PRD for a team collaboration platform with clear metrics',
    descriptionAr: 'PRD منظم بشكل جيد لمنصة تعاون فريق مع مقاييس واضحة',
    imageUrl: '/examples/saas-prd-success.png',
    category: 'prd-success',
    step: 2
  },
  {
    id: 'proto-1',
    title: 'Before/After: Mobile App Prototype',
    titleAr: 'قبل/بعد: نموذج تطبيق موبايل',
    description: 'Evolution from basic wireframe to polished Alpha version',
    descriptionAr: 'التطور من الإطار الأساسي إلى نسخة ألفا مصقولة',
    imageUrl: '/examples/mobile-before-after.png',
    category: 'prototype-before-after',
    step: 3
  },
  {
    id: 'best-1',
    title: 'Best Practice: User Story Format',
    titleAr: 'أفضل ممارسة: صيغة قصة المستخدم',
    description: 'How to write clear, actionable user stories with acceptance criteria',
    descriptionAr: 'كيفية كتابة قصص مستخدم واضحة وقابلة للتنفيذ مع معايير القبول',
    imageUrl: '/examples/user-story-best.png',
    category: 'best-practice',
    step: 2
  },
  {
    id: 'prd-2',
    title: 'E-commerce PRD Example',
    titleAr: 'مثال PRD للتجارة الإلكترونية',
    description: 'Comprehensive PRD for an online marketplace with payment integration',
    descriptionAr: 'PRD شامل لسوق إلكتروني مع دمج الدفع',
    imageUrl: '/examples/ecommerce-prd.png',
    category: 'prd-success',
    step: 2
  },
  {
    id: 'proto-2',
    title: 'Dashboard Evolution',
    titleAr: 'تطور لوحة التحكم',
    description: 'From static mockup to interactive Beta with real-time data',
    descriptionAr: 'من نموذج ثابت إلى بيتا تفاعلية مع بيانات فورية',
    imageUrl: '/examples/dashboard-evolution.png',
    category: 'prototype-before-after',
    step: 3
  },
  {
    id: 'best-2',
    title: 'Best Practice: Feature Prioritization',
    titleAr: 'أفضل ممارسة: تحديد أولويات الميزات',
    description: 'MoSCoW method applied to feature planning',
    descriptionAr: 'طريقة MoSCoW مطبقة على تخطيط الميزات',
    imageUrl: '/examples/prioritization-best.png',
    category: 'best-practice',
    step: 2
  }
];

/**
 * بيانات placeholder للأمثلة (عندما لا تتوفر صور حقيقية)
 */
export const PLACEHOLDER_EXAMPLES: VisualExample[] = [
  {
    id: 'placeholder-1',
    title: 'PRD Example Coming Soon',
    titleAr: 'مثال PRD قريباً',
    description: 'Visual examples will be added here',
    descriptionAr: 'سيتم إضافة الأمثلة المرئية هنا',
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%234f46e5" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="32" fill="%23ffffff"%3EPRD Example%3C/text%3E%3C/svg%3E',
    category: 'prd-success',
    step: 2
  },
  {
    id: 'placeholder-2',
    title: 'Prototype Example Coming Soon',
    titleAr: 'مثال نموذج أولي قريباً',
    description: 'Before/After comparisons will be shown here',
    descriptionAr: 'ستظهر مقارنات قبل/بعد هنا',
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%2310b981" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="32" fill="%23ffffff"%3EPrototype%3C/text%3E%3C/svg%3E',
    category: 'prototype-before-after',
    step: 3
  },
  {
    id: 'placeholder-3',
    title: 'Best Practices Coming Soon',
    titleAr: 'أفضل الممارسات قريباً',
    description: 'Visual guides for best practices',
    descriptionAr: 'أدلة مرئية لأفضل الممارسات',
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f59e0b" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="32" fill="%23ffffff"%3EBest Practices%3C/text%3E%3C/svg%3E',
    category: 'best-practice',
    step: 1
  }
];
