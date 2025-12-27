/**
 * Email Types - Section 18
 * Types for weekly digest email system
 */

export interface DigestSettings {
  enabled: boolean;
  frequency: DigestFrequency;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  timeOfDay: string; // HH:MM format
  includeStats: boolean;
  includeTips: boolean;
  includeTrending: boolean;
  includeGoals: boolean;
  emailAddress: string;
}

export type DigestFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface UserActivity {
  userId: string;
  prdsCreated: number;
  prototypesGenerated: number;
  researchesConducted: number;
  timeSpent: number; // in minutes
  lastActive: Date;
  streak: number; // consecutive days
}

export interface WeeklyStats {
  period: {
    start: Date;
    end: Date;
  };
  prdsCreated: number;
  prototypesGenerated: number;
  researchesConducted: number;
  totalTimeSpent: number;
  averageQualityScore: number;
  mostUsedFeature: string;
  productivityTrend: 'up' | 'down' | 'stable';
}

export interface GoalProgress {
  goalId: string;
  name: string;
  target: number;
  current: number;
  percentage: number;
  deadline?: Date;
  status: 'on-track' | 'at-risk' | 'completed' | 'overdue';
}

export interface TrendingTemplate {
  id: string;
  name: string;
  category: string;
  usageCount: number;
  rating: number;
  description: string;
}

export interface TipOfTheWeek {
  id: string;
  title: string;
  description: string;
  category: 'productivity' | 'features' | 'best-practices';
  icon?: string;
}

export interface DigestContent {
  user: {
    name: string;
    email: string;
  };
  stats: WeeklyStats;
  goals: GoalProgress[];
  trending: TrendingTemplate[];
  tips: TipOfTheWeek[];
  achievements?: Achievement[];
  personalizedMessage?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface EmailDeliveryStatus {
  messageId: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
}

export interface DigestSchedule {
  userId: string;
  settings: DigestSettings;
  nextSendDate: Date;
  lastSentDate?: Date;
  deliveryHistory: EmailDeliveryStatus[];
}
