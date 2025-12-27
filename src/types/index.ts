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
