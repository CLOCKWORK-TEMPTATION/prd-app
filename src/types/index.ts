/**
 * Types and Interfaces for PRD Application
 * All Sections Implementation
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
// Section 3 & 4: AI Writing Assistant Types
// ============================================

export interface AISuggestion {
  id: string;
  text: string;
  context: string;
  confidence: number;
  type: 'autocomplete' | 'expansion' | 'example';
}

export interface AIWritingContext {
  fieldName: string;
  currentText: string;
  previousAnswers: Record<string, string>;
  userIntent?: string;
}

export interface AIWritingAssistantProps {
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  previousAnswers?: Record<string, string>;
  onExpand?: (text: string) => Promise<string>;
  enabled?: boolean;
  minCharactersForSuggestions?: number;
}

export interface AIExpansionRequest {
  text: string;
  context: AIWritingContext;
}

export interface AIExpansionResponse {
  expandedText: string;
  suggestions: string[];
}

// ============================================
// Section 3 & 4: Progress Manager Types
// ============================================

export interface SavedProgress {
  id: string;
  timestamp: number;
  formData: Record<string, any>;
  currentStep: number;
  currentTab: number;
  lastActiveField?: string;
  sessionId: string;
  version: string;
}

export interface AutoSaveConfig {
  interval: number; // milliseconds
  enabled: boolean;
  maxVersions: number;
  storageKey: string;
}

export interface ProgressManagerProps {
  formData: Record<string, any>;
  currentStep: number;
  currentTab: number;
  onRestore?: (progress: SavedProgress) => void;
  autoSaveConfig?: Partial<AutoSaveConfig>;
  children?: React.ReactNode;
}

export interface SessionRecovery {
  hasUnfinishedSession: boolean;
  lastSavedProgress?: SavedProgress;
  timeSinceLastSave?: number;
}

export interface AutoSaveStatus {
  isEnabled: boolean;
  lastSaveTime?: number;
  nextSaveTime?: number;
  isSaving: boolean;
  error?: string;
}

// ============================================
// Section 5 & 6: Guided Mode Types
// ============================================

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

// ============================================
// Service Types
// ============================================

export interface AutoSaveService {
  start: (config: AutoSaveConfig, onSave: () => void) => void;
  stop: () => void;
  saveNow: () => void;
  getStatus: () => AutoSaveStatus;
  clearHistory: () => void;
}

export interface StorageManager {
  save: (key: string, data: any) => Promise<void>;
  load: (key: string) => Promise<any>;
  delete: (key: string) => Promise<void>;
  getAll: () => Promise<Record<string, any>>;
  clear: () => Promise<void>;
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

// ============================================
// Section 7 & 8: Validation & Speech Types
// ============================================

export * from './validation.types';
export * from './speech.types';

// ============================================
// Section 11 & 12: Community & Collaboration Types
// ============================================

export * from './community.types';
export * from './collaboration.types';

// ============================================
// Section 13 & 14: Challenges & Streak Types
// ============================================

// Challenge Types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'upcoming' | 'completed';
  category: 'sustainability' | 'innovation' | 'ux' | 'technical' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  participants: number;
  badge?: Badge;
  prize?: string;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  prdId: string;
  submittedAt: Date;
  score: number;
  feedback?: string;
  rank?: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  submissionId: string;
  badge?: Badge;
  avatar?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Streak Types
export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  startDate: Date;
  totalActiveDays: number;
  streakHistory: StreakDay[];
}

export interface StreakDay {
  date: Date;
  activityType: 'prd_created' | 'research_done' | 'prototype_generated' | 'challenge_submitted';
  count: number;
}

export interface StreakReward {
  id: string;
  milestone: number; // e.g., 7, 14, 30, 100 days
  name: string;
  description: string;
  badge: Badge;
  unlocked: boolean;
}

export interface StreakNotification {
  id: string;
  userId: string;
  type: 'reminder' | 'achievement' | 'warning';
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// User Activity Types
export interface UserActivity {
  userId: string;
  activityType: 'prd_created' | 'research_done' | 'prototype_generated' | 'challenge_submitted';
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Storage Types
export interface ChallengeStorage {
  challenges: Challenge[];
  submissions: ChallengeSubmission[];
  leaderboards: Record<string, LeaderboardEntry[]>;
  lastUpdated: Date;
}

export interface StreakStorage {
  streaks: Record<string, Streak>;
  rewards: StreakReward[];
  notifications: StreakNotification[];
  lastUpdated: Date;
}

// ============================================
// Section 15 & 16: Achievement & Mentor Types
// ============================================

export * from './achievementTypes';
export * from './mentorTypes';

// ============================================
// Section 17 & 18: Export & Email Types
// ============================================

export * from './export.types';
export * from './email.types';
