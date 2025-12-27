/**
 * Achievement System Types
 * Section 15: Gamification نظام الإنجازات
 */

export type AchievementCategory = 'creation' | 'quality' | 'research' | 'prototype' | 'streak' | 'special';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Achievement {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
  hidden?: boolean; // للإنجازات السرية
}

export interface UserAchievements {
  userId: string;
  achievements: Achievement[];
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  statistics: UserStatistics;
}

export interface UserStatistics {
  totalPRDsCreated: number;
  totalResearches: number;
  totalPrototypes: number;
  averagePRDScore: number;
  perfectScorePRDs: number; // PRDs with score > 90
  lastActivity: Date;
  joinedDate: Date;
}

export interface AchievementNotification {
  achievement: Achievement;
  timestamp: Date;
  shown: boolean;
}

export interface AchievementProgress {
  achievementId: string;
  currentProgress: number;
  maxProgress: number;
  percentage: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalXP: number;
  level: number;
  rank: number;
  achievements: number;
}

export interface AchievementDefinition {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  maxProgress: number;
  xpReward: number;
  hidden?: boolean;
  checkCondition: (stats: UserStatistics) => number; // Returns current progress
}
