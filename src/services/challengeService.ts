/**
 * Challenge Service
 * Manages weekly challenges, leaderboards, submissions, and badges
 * Section 13 Implementation
 */

import type {
  Challenge,
  ChallengeSubmission,
  LeaderboardEntry,
  Badge,
  ChallengeStorage,
} from '../types';

class ChallengeService {
  private storageKey = 'prd-app-challenges';
  private defaultChallenges: Challenge[] = [
    {
      id: 'week-1-sustainability',
      title: 'Create a PRD for a Sustainable Product',
      description: 'Design a product that promotes environmental sustainability and reduces carbon footprint.',
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-01-12'),
      status: 'active',
      category: 'sustainability',
      difficulty: 'intermediate',
      participants: 0,
      badge: {
        id: 'eco-warrior',
        name: 'Eco Warrior',
        icon: '🌱',
        description: 'Completed sustainability challenge',
        color: '#22c55e',
        rarity: 'rare',
      },
      prize: 'Featured on homepage + Eco Warrior badge',
    },
    {
      id: 'week-2-innovation',
      title: 'AI-Powered Innovation Challenge',
      description: 'Create a PRD that leverages AI to solve a real-world problem in a creative way.',
      startDate: new Date('2025-01-13'),
      endDate: new Date('2025-01-19'),
      status: 'upcoming',
      category: 'innovation',
      difficulty: 'advanced',
      participants: 0,
      badge: {
        id: 'ai-innovator',
        name: 'AI Innovator',
        icon: '🤖',
        description: 'Completed AI innovation challenge',
        color: '#8b5cf6',
        rarity: 'epic',
      },
      prize: 'AI Innovator badge + Priority feedback',
    },
    {
      id: 'week-3-ux',
      title: 'User Experience Excellence',
      description: 'Design a product with exceptional UX that solves a common accessibility problem.',
      startDate: new Date('2025-01-20'),
      endDate: new Date('2025-01-26'),
      status: 'upcoming',
      category: 'ux',
      difficulty: 'beginner',
      participants: 0,
      badge: {
        id: 'ux-master',
        name: 'UX Master',
        icon: '🎨',
        description: 'Completed UX excellence challenge',
        color: '#f59e0b',
        rarity: 'rare',
      },
      prize: 'UX Master badge + Community showcase',
    },
  ];

  /**
   * Initialize storage with default challenges
   */
  private initializeStorage(): ChallengeStorage {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      data.challenges = data.challenges.map((c: any) => ({
        ...c,
        startDate: new Date(c.startDate),
        endDate: new Date(c.endDate),
      }));
      data.submissions = data.submissions.map((s: any) => ({
        ...s,
        submittedAt: new Date(s.submittedAt),
      }));
      data.lastUpdated = new Date(data.lastUpdated);
      return data;
    }

    const initialData: ChallengeStorage = {
      challenges: this.defaultChallenges,
      submissions: [],
      leaderboards: {},
      lastUpdated: new Date(),
    };

    this.saveStorage(initialData);
    return initialData;
  }

  /**
   * Save storage to localStorage
   */
  private saveStorage(data: ChallengeStorage): void {
    data.lastUpdated = new Date();
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * Get all challenges
   */
  getChallenges(): Challenge[] {
    const storage = this.initializeStorage();
    return this.updateChallengeStatus(storage.challenges);
  }

  /**
   * Get active challenge
   */
  getActiveChallenge(): Challenge | null {
    const challenges = this.getChallenges();
    return challenges.find((c) => c.status === 'active') || null;
  }

  /**
   * Get upcoming challenges
   */
  getUpcomingChallenges(): Challenge[] {
    const challenges = this.getChallenges();
    return challenges.filter((c) => c.status === 'upcoming');
  }

  /**
   * Update challenge status based on current date
   */
  private updateChallengeStatus(challenges: Challenge[]): Challenge[] {
    const now = new Date();
    return challenges.map((challenge) => {
      if (now >= challenge.startDate && now <= challenge.endDate) {
        return { ...challenge, status: 'active' };
      } else if (now < challenge.startDate) {
        return { ...challenge, status: 'upcoming' };
      } else {
        return { ...challenge, status: 'completed' };
      }
    });
  }

  /**
   * Submit a challenge entry
   */
  submitChallenge(
    challengeId: string,
    userId: string,
    prdId: string
  ): ChallengeSubmission {
    const storage = this.initializeStorage();

    // Check if already submitted
    const existing = storage.submissions.find(
      (s) => s.challengeId === challengeId && s.userId === userId
    );
    if (existing) {
      throw new Error('You have already submitted to this challenge');
    }

    const submission: ChallengeSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      challengeId,
      userId,
      prdId,
      submittedAt: new Date(),
      score: this.calculateScore(),
    };

    storage.submissions.push(submission);

    // Update participant count
    const challenge = storage.challenges.find((c) => c.id === challengeId);
    if (challenge) {
      challenge.participants += 1;
    }

    // Update leaderboard
    this.updateLeaderboard(storage, challengeId);

    this.saveStorage(storage);
    return submission;
  }

  /**
   * Calculate submission score (simplified)
   */
  private calculateScore(): number {
    // In a real app, this would analyze the PRD quality
    return Math.floor(Math.random() * 30) + 70; // 70-100
  }

  /**
   * Get leaderboard for a challenge
   */
  getLeaderboard(challengeId: string, limit: number = 10): LeaderboardEntry[] {
    const storage = this.initializeStorage();

    if (!storage.leaderboards[challengeId]) {
      this.updateLeaderboard(storage, challengeId);
      this.saveStorage(storage);
    }

    return storage.leaderboards[challengeId].slice(0, limit);
  }

  /**
   * Update leaderboard for a challenge
   */
  private updateLeaderboard(storage: ChallengeStorage, challengeId: string): void {
    const submissions = storage.submissions
      .filter((s) => s.challengeId === challengeId)
      .sort((a, b) => b.score - a.score);

    const leaderboard: LeaderboardEntry[] = submissions.map((submission, index) => ({
      rank: index + 1,
      userId: submission.userId,
      username: `User ${submission.userId.slice(0, 8)}`,
      score: submission.score,
      submissionId: submission.id,
      badge: index < 3 ? this.getRankBadge(index + 1) : undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${submission.userId}`,
    }));

    storage.leaderboards[challengeId] = leaderboard;
  }

  /**
   * Get rank badge for top 3
   */
  private getRankBadge(rank: number): Badge {
    const badges: Record<number, Badge> = {
      1: {
        id: 'gold-medal',
        name: 'Gold Medal',
        icon: '🥇',
        description: 'First place winner',
        color: '#ffd700',
        rarity: 'legendary',
      },
      2: {
        id: 'silver-medal',
        name: 'Silver Medal',
        icon: '🥈',
        description: 'Second place winner',
        color: '#c0c0c0',
        rarity: 'epic',
      },
      3: {
        id: 'bronze-medal',
        name: 'Bronze Medal',
        icon: '🥉',
        description: 'Third place winner',
        color: '#cd7f32',
        rarity: 'rare',
      },
    };
    return badges[rank];
  }

  /**
   * Get user's submissions
   */
  getUserSubmissions(userId: string): ChallengeSubmission[] {
    const storage = this.initializeStorage();
    return storage.submissions.filter((s) => s.userId === userId);
  }

  /**
   * Get user's rank in a challenge
   */
  getUserRank(challengeId: string, userId: string): number | null {
    const leaderboard = this.getLeaderboard(challengeId, 1000);
    const entry = leaderboard.find((e) => e.userId === userId);
    return entry ? entry.rank : null;
  }

  /**
   * Clear all challenge data (for testing)
   */
  clearData(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const challengeService = new ChallengeService();
export default challengeService;
