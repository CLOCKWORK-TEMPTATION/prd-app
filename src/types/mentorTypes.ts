/**
 * AI Mentor Types
 * Section 16: مساعد AI شخصي يتعلم من المستخدم
 */

export type SuggestionType = 'feature' | 'improvement' | 'metric' | 'research' | 'template' | 'best-practice';

export type SuggestionPriority = 'low' | 'medium' | 'high' | 'critical';

export interface MentorSuggestion {
  id: string;
  type: SuggestionType;
  priority: SuggestionPriority;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  context?: string; // سياق الاقتراح
  confidence: number; // 0-100
  timestamp: Date;
  applied: boolean;
  dismissed: boolean;
  helpful?: boolean; // تقييم المستخدم
}

export interface UserStyle {
  preferredLength: 'concise' | 'detailed' | 'comprehensive';
  focusAreas: string[]; // مثل: 'metrics', 'user-experience', 'technical'
  commonKeywords: string[];
  averageResponseLength: number;
  preferredFeatureTypes: string[];
  industryFocus?: string;
  languagePreference: 'ar-EG' | 'en-US';
}

export interface LearningData {
  userId: string;
  totalPRDsAnalyzed: number;
  userStyle: UserStyle;
  patterns: UserPattern[];
  lastUpdated: Date;
}

export interface UserPattern {
  patternType: string;
  frequency: number;
  examples: string[];
  confidence: number;
}

export interface MentorInsight {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: 'strength' | 'improvement' | 'trend';
  timestamp: Date;
}

export interface MentorContext {
  currentPRD?: string;
  previousPRDs: string[];
  userLevel: number;
  achievements: string[];
  recentActivity: ActivityEntry[];
}

export interface ActivityEntry {
  type: 'prd_created' | 'research_done' | 'prototype_generated' | 'achievement_unlocked';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface MentorFeedback {
  suggestionId: string;
  helpful: boolean;
  feedback?: string;
  timestamp: Date;
}

export interface MentorProfile {
  userId: string;
  learningData: LearningData;
  suggestions: MentorSuggestion[];
  insights: MentorInsight[];
  feedbackHistory: MentorFeedback[];
  totalSuggestionsApplied: number;
  totalSuggestionsDismissed: number;
  helpfulnessRate: number; // نسبة الاقتراحات المفيدة
}

export interface MentorPrompt {
  templateEn: string;
  templateAr: string;
  variables: Record<string, string>;
}
