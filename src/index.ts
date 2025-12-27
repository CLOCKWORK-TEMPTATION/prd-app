/**
 * Main exports for Section 13 & 14 Implementation
 * Weekly Challenges and Streak System
 */

// Components
export { WeeklyChallenges } from './components/WeeklyChallenges';
export { StreakTracker } from './components/StreakTracker';

// Services
export { challengeService } from './services/challengeService';
export { streakService } from './services/streakService';

// Types
export type {
  Challenge,
  ChallengeSubmission,
  LeaderboardEntry,
  Badge,
  Streak,
  StreakDay,
  StreakReward,
  StreakNotification,
  UserActivity,
  ChallengeStorage,
  StreakStorage,
} from './types';

// Demo
export { Demo } from './Demo';
