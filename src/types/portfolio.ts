/**
 * نظام Portfolio المستخدم - Section 10
 * يحدد الأنواع والواجهات المستخدمة في نظام Portfolio
 */

import { QualityScore } from './quality';

export interface PRDEntry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  qualityScore?: QualityScore;
  version: 'prototype' | 'alpha' | 'beta' | 'pilot';
  tags: string[];
  status: 'draft' | 'completed' | 'archived';
  generatedPrototype?: {
    html: string;
    generatedAt: Date;
  };
}

export interface UserStats {
  totalPRDs: number;
  completedPRDs: number;
  draftPRDs: number;
  averageQualityScore: number;
  successRate: number; // نسبة PRDs التي حصلت على score > 70
  bestScore: number;
  improvementRate: number; // معدل التحسن في الجودة
  streak: number; // عدد الأيام المتتالية
  lastActiveDate: Date;
}

export interface PortfolioTimelineItem {
  id: string;
  type: 'created' | 'updated' | 'completed' | 'achievement';
  title: string;
  description: string;
  date: Date;
  relatedPRDId?: string;
  badge?: string;
}

export interface UserPortfolio {
  userId: string;
  username: string;
  stats: UserStats;
  prds: PRDEntry[];
  timeline: PortfolioTimelineItem[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  isUnlocked: boolean;
  progress?: {
    current: number;
    target: number;
  };
}

export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'isUnlocked'>[] = [
  {
    id: 'first_prd',
    name: 'First PRD Created',
    description: 'Created your first PRD',
    icon: '🎯',
  },
  {
    id: 'quality_master',
    name: 'Quality Master',
    description: 'Achieved a quality score above 90',
    icon: '⭐',
  },
  {
    id: 'consistent_creator',
    name: 'Consistent Creator',
    description: 'Created 10 PRDs',
    icon: '🔥',
  },
  {
    id: 'prototype_pro',
    name: 'Prototype Pro',
    description: 'Generated 5 prototypes',
    icon: '🚀',
  },
  {
    id: 'detail_oriented',
    name: 'Detail Oriented',
    description: 'All PRDs scored above 70',
    icon: '💎',
  },
  {
    id: 'week_streak',
    name: '7 Day Streak',
    description: 'Used the app for 7 consecutive days',
    icon: '🔥',
  },
];
