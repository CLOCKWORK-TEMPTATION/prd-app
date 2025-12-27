/**
 * نظام تقييم جودة PRD - Section 9
 * يحدد الأنواع والواجهات المستخدمة في نظام التقييم
 */

export type QualityBadge = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface QualityDimension {
  name: string;
  score: number;
  maxScore: number;
  weight: number; // وزن البعد في النتيجة النهائية
  feedback: string;
}

export interface QualityScore {
  overall: number; // النتيجة الإجمالية من 100
  badge: QualityBadge;
  dimensions: {
    clarity: QualityDimension;
    completeness: QualityDimension;
    specificity: QualityDimension;
    measurability: QualityDimension;
    feasibility: QualityDimension;
  };
  suggestions: string[];
  strengths: string[];
  timestamp: Date;
}

export interface QualityScoringConfig {
  enableSuggestions: boolean;
  minScoreForGold: number;
  minScoreForSilver: number;
  minScoreForBronze: number;
  strictMode: boolean;
}

export const DEFAULT_QUALITY_CONFIG: QualityScoringConfig = {
  enableSuggestions: true,
  minScoreForGold: 85,
  minScoreForSilver: 70,
  minScoreForBronze: 50,
  strictMode: false,
};
