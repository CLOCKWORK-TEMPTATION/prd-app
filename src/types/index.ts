/**
 * Types and Interfaces for PRD Application
 * Section 1 & 2 Implementation
 */

// ============================================
// Section 1: Onboarding Tour Types
// ============================================

export interface OnboardingStep {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  target: string; // CSS selector for the element to highlight
  placement: 'top' | 'bottom' | 'left' | 'right';
  icon?: string;
  action?: () => void;
}

export interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  locale?: 'en-US' | 'ar-EG';
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  skipped: boolean;
}

// ============================================
// Section 2: Templates Library Types
// ============================================

export interface Template {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 'saas' | 'mobile' | 'ecommerce' | 'other';
  icon: string;
  color: string;
  gradient: string;
  previewImage?: string;
  content: TemplateContent;
  examples: TemplateExample[];
  tips: string[];
  tipsAr: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  popularity: number;
}

export interface TemplateContent {
  productName: string;
  productDescription: string;
  targetUsers: string;
  problemStatement: string;
  keyFeatures: string[];
  successMetrics: string[];
}

export interface TemplateExample {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  code?: string;
}

export interface TemplatesLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
  locale?: 'en-US' | 'ar-EG';
}

export interface TemplateFilter {
  category?: 'all' | 'saas' | 'mobile' | 'ecommerce' | 'other';
  difficulty?: 'all' | 'beginner' | 'intermediate' | 'advanced';
  searchQuery?: string;
}

// ============================================
// Common Types
// ============================================

export interface LocaleStrings {
  [key: string]: string;
}

export interface UserPreferences {
  hasCompletedOnboarding: boolean;
  preferredTemplates: string[];
  lastUsedTemplate?: string;
  skipOnboarding: boolean;
}

// ============================================
// Analytics Types
// ============================================

export interface OnboardingAnalytics {
  startedAt: Date;
  completedAt?: Date;
  stepsCompleted: number;
  skipped: boolean;
  timeSpent: number;
}

export interface TemplateAnalytics {
  templateId: string;
  usedAt: Date;
  completed: boolean;
  timeSpent: number;
}
