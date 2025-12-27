/**
 * Streak Service
 * Manages user streaks, rewards, and notifications
 * Section 14 Implementation
 */

import type {
  Streak,
  StreakDay,
  StreakReward,
  StreakNotification,
  UserActivity,
  StreakStorage,
} from '../types';

class StreakService {
  private storageKey = 'prd-app-streaks';
  private streakRewards: StreakReward[] = [
    {
      id: 'streak-3',
      milestone: 3,
      name: 'Getting Started',
      description: '3 day streak! Keep it up!',
      badge: {
        id: 'beginner-streak',
        name: 'Beginner Streak',
        icon: '🔥',
        description: '3 consecutive days of activity',
        color: '#f97316',
        rarity: 'common',
      },
      unlocked: false,
    },
    {
      id: 'streak-7',
      milestone: 7,
      name: 'Week Warrior',
      description: '7 day streak! You\'re on fire!',
      badge: {
        id: 'week-warrior',
        name: 'Week Warrior',
        icon: '🔥🔥',
        description: '7 consecutive days of activity',
        color: '#ea580c',
        rarity: 'rare',
      },
      unlocked: false,
    },
    {
      id: 'streak-14',
      milestone: 14,
      name: 'Two Week Champion',
      description: '14 day streak! Incredible dedication!',
      badge: {
        id: 'two-week-champion',
        name: 'Two Week Champion',
        icon: '🔥🔥🔥',
        description: '14 consecutive days of activity',
        color: '#dc2626',
        rarity: 'epic',
      },
      unlocked: false,
    },
    {
      id: 'streak-30',
      milestone: 30,
      name: 'Monthly Master',
      description: '30 day streak! You\'re a legend!',
      badge: {
        id: 'monthly-master',
        name: 'Monthly Master',
        icon: '🏆',
        description: '30 consecutive days of activity',
        color: '#b91c1c',
        rarity: 'legendary',
      },
      unlocked: false,
    },
    {
      id: 'streak-100',
      milestone: 100,
      name: 'Centurion',
      description: '100 day streak! Unstoppable!',
      badge: {
        id: 'centurion',
        name: 'Centurion',
        icon: '👑',
        description: '100 consecutive days of activity',
        color: '#7c2d12',
        rarity: 'legendary',
      },
      unlocked: false,
    },
  ];

  /**
   * Initialize storage
   */
  private initializeStorage(): StreakStorage {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      Object.keys(data.streaks).forEach((userId) => {
        data.streaks[userId].lastActivityDate = new Date(
          data.streaks[userId].lastActivityDate
        );
        data.streaks[userId].startDate = new Date(data.streaks[userId].startDate);
        data.streaks[userId].streakHistory = data.streaks[userId].streakHistory.map(
          (day: any) => ({
            ...day,
            date: new Date(day.date),
          })
        );
      });
      data.notifications = data.notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
      data.lastUpdated = new Date(data.lastUpdated);
      return data;
    }

    const initialData: StreakStorage = {
      streaks: {},
      rewards: this.streakRewards,
      notifications: [],
      lastUpdated: new Date(),
    };

    this.saveStorage(initialData);
    return initialData;
  }

  /**
   * Save storage to localStorage
   */
  private saveStorage(data: StreakStorage): void {
    data.lastUpdated = new Date();
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * Get or create user streak
   */
  getStreak(userId: string): Streak {
    const storage = this.initializeStorage();
    if (!storage.streaks[userId]) {
      storage.streaks[userId] = this.createNewStreak(userId);
      this.saveStorage(storage);
    }
    return storage.streaks[userId];
  }

  /**
   * Create a new streak for a user
   */
  private createNewStreak(userId: string): Streak {
    return {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date(0), // epoch
      startDate: new Date(),
      totalActiveDays: 0,
      streakHistory: [],
    };
  }

  /**
   * Record user activity
   */
  recordActivity(activity: UserActivity): Streak {
    const storage = this.initializeStorage();
    const streak = this.getStreak(activity.userId);

    const today = this.getDateOnly(new Date());
    const lastActivity = this.getDateOnly(streak.lastActivityDate);

    // Check if activity is already recorded today
    const todayHistory = streak.streakHistory.find(
      (day) => this.getDateOnly(day.date).getTime() === today.getTime()
    );

    if (todayHistory) {
      // Update existing day
      todayHistory.count += 1;
      if (!todayHistory.activityType.includes(activity.activityType)) {
        todayHistory.activityType = activity.activityType;
      }
    } else {
      // New day
      const daysSinceLastActivity = this.getDaysDifference(lastActivity, today);

      if (daysSinceLastActivity === 1) {
        // Continue streak
        streak.currentStreak += 1;
      } else if (daysSinceLastActivity > 1) {
        // Streak broken
        this.notifyStreakBroken(activity.userId, streak.currentStreak);
        streak.currentStreak = 1;
      } else if (daysSinceLastActivity === 0) {
        // Same day, already handled above
        return streak;
      }

      // Update longest streak
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }

      // Add to history
      streak.streakHistory.push({
        date: today,
        activityType: activity.activityType,
        count: 1,
      });

      streak.totalActiveDays += 1;
      streak.lastActivityDate = today;

      // Check for milestone rewards
      this.checkMilestones(activity.userId, streak.currentStreak);
    }

    storage.streaks[activity.userId] = streak;
    this.saveStorage(storage);

    return streak;
  }

  /**
   * Get date without time
   */
  private getDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Get days difference between two dates
   */
  private getDaysDifference(date1: Date, date2: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((date2.getTime() - date1.getTime()) / msPerDay);
  }

  /**
   * Check and unlock milestone rewards
   */
  private checkMilestones(userId: string, currentStreak: number): void {
    const storage = this.initializeStorage();
    const milestoneReached = storage.rewards.find(
      (reward) => reward.milestone === currentStreak && !reward.unlocked
    );

    if (milestoneReached) {
      milestoneReached.unlocked = true;
      this.notifyMilestone(userId, milestoneReached);
      this.saveStorage(storage);
    }
  }

  /**
   * Get unlocked rewards for a user
   */
  getUnlockedRewards(userId: string): StreakReward[] {
    const storage = this.initializeStorage();
    const streak = this.getStreak(userId);

    return storage.rewards.filter(
      (reward) => reward.milestone <= streak.currentStreak
    );
  }

  /**
   * Get next milestone
   */
  getNextMilestone(userId: string): StreakReward | null {
    const storage = this.initializeStorage();
    const streak = this.getStreak(userId);

    return (
      storage.rewards.find((reward) => reward.milestone > streak.currentStreak) || null
    );
  }

  /**
   * Create a notification
   */
  private createNotification(
    userId: string,
    type: StreakNotification['type'],
    message: string,
    actionUrl?: string
  ): void {
    const storage = this.initializeStorage();

    const notification: StreakNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      message,
      timestamp: new Date(),
      read: false,
      actionUrl,
    };

    storage.notifications.push(notification);
    this.saveStorage(storage);
  }

  /**
   * Notify milestone achievement
   */
  private notifyMilestone(userId: string, reward: StreakReward): void {
    this.createNotification(
      userId,
      'achievement',
      `🎉 ${reward.name}! You've reached a ${reward.milestone} day streak!`
    );
  }

  /**
   * Notify streak broken
   */
  private notifyStreakBroken(userId: string, streakLength: number): void {
    if (streakLength > 0) {
      this.createNotification(
        userId,
        'warning',
        `Your ${streakLength} day streak was broken. Start a new one today!`
      );
    }
  }

  /**
   * Send reminder notification
   */
  sendReminder(userId: string): void {
    const streak = this.getStreak(userId);
    const today = this.getDateOnly(new Date());
    const lastActivity = this.getDateOnly(streak.lastActivityDate);
    const daysSinceActivity = this.getDaysDifference(lastActivity, today);

    if (daysSinceActivity === 0) {
      // Already active today
      return;
    }

    if (streak.currentStreak > 0) {
      this.createNotification(
        userId,
        'reminder',
        `Don't break your ${streak.currentStreak} day streak! 🔥 Come back today!`,
        '/app'
      );
    } else {
      this.createNotification(
        userId,
        'reminder',
        'Start building your streak today! Create a PRD or do some research.',
        '/app'
      );
    }
  }

  /**
   * Get user notifications
   */
  getNotifications(userId: string, unreadOnly: boolean = false): StreakNotification[] {
    const storage = this.initializeStorage();
    let notifications = storage.notifications.filter((n) => n.userId === userId);

    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.read);
    }

    return notifications.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Mark notification as read
   */
  markNotificationRead(notificationId: string): void {
    const storage = this.initializeStorage();
    const notification = storage.notifications.find((n) => n.id === notificationId);

    if (notification) {
      notification.read = true;
      this.saveStorage(storage);
    }
  }

  /**
   * Get streak statistics
   */
  getStreakStats(userId: string): {
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
    daysUntilNextMilestone: number;
    nextMilestone: StreakReward | null;
  } {
    const streak = this.getStreak(userId);
    const nextMilestone = this.getNextMilestone(userId);

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalActiveDays: streak.totalActiveDays,
      daysUntilNextMilestone: nextMilestone
        ? nextMilestone.milestone - streak.currentStreak
        : 0,
      nextMilestone,
    };
  }

  /**
   * Clear all streak data (for testing)
   */
  clearData(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const streakService = new StreakService();
export default streakService;
