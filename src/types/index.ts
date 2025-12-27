/**
 * Type definitions for Weekly Challenges and Streak System
 * Section 13 & 14 Implementation
 */

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
