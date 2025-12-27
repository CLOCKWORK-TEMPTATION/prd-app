/**
 * Achievement Service
 * Section 15: إدارة نظام الإنجازات والتحفيز
 */

import {
  Achievement,
  AchievementDefinition,
  UserAchievements,
  UserStatistics,
  AchievementNotification,
  LeaderboardEntry,
  AchievementCategory,
  AchievementTier,
} from '../types/achievementTypes';

/**
 * تعريفات الإنجازات المتاحة في النظام
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Creation Achievements
  {
    id: 'first-prd',
    nameEn: 'First PRD Created',
    nameAr: 'أول PRD مكتمل',
    descriptionEn: 'Created your first Product Requirements Document',
    descriptionAr: 'أنشأت أول وثيقة متطلبات منتج',
    icon: '🎯',
    category: 'creation',
    tier: 'bronze',
    maxProgress: 1,
    xpReward: 100,
    checkCondition: (stats) => Math.min(stats.totalPRDsCreated, 1),
  },
  {
    id: 'prd-enthusiast',
    nameEn: 'PRD Enthusiast',
    nameAr: 'متحمس للتوثيق',
    descriptionEn: 'Created 5 PRDs',
    descriptionAr: 'أنشأت 5 وثائق متطلبات',
    icon: '📝',
    category: 'creation',
    tier: 'silver',
    maxProgress: 5,
    xpReward: 250,
    checkCondition: (stats) => Math.min(stats.totalPRDsCreated, 5),
  },
  {
    id: 'prd-master',
    nameEn: 'PRD Master',
    nameAr: 'خبير التوثيق',
    descriptionEn: 'Created 10 PRDs',
    descriptionAr: 'أنشأت 10 وثائق متطلبات',
    icon: '📚',
    category: 'creation',
    tier: 'gold',
    maxProgress: 10,
    xpReward: 500,
    checkCondition: (stats) => Math.min(stats.totalPRDsCreated, 10),
  },

  // Research Achievements
  {
    id: 'first-research',
    nameEn: 'Curious Mind',
    nameAr: 'عقل فضولي',
    descriptionEn: 'Completed your first product research',
    descriptionAr: 'أكملت أول بحث منتج',
    icon: '🔍',
    category: 'research',
    tier: 'bronze',
    maxProgress: 1,
    xpReward: 50,
    checkCondition: (stats) => Math.min(stats.totalResearches, 1),
  },
  {
    id: 'research-master',
    nameEn: 'Research Master',
    nameAr: 'خبير الأبحاث',
    descriptionEn: 'Completed 10 product researches',
    descriptionAr: 'أكملت 10 أبحاث منتج',
    icon: '🔬',
    category: 'research',
    tier: 'gold',
    maxProgress: 10,
    xpReward: 400,
    checkCondition: (stats) => Math.min(stats.totalResearches, 10),
  },

  // Prototype Achievements
  {
    id: 'first-prototype',
    nameEn: 'Builder',
    nameAr: 'بنّاء',
    descriptionEn: 'Generated your first prototype',
    descriptionAr: 'أنشأت أول نموذج أولي',
    icon: '🎨',
    category: 'prototype',
    tier: 'bronze',
    maxProgress: 1,
    xpReward: 150,
    checkCondition: (stats) => Math.min(stats.totalPrototypes, 1),
  },
  {
    id: 'prototype-pro',
    nameEn: 'Prototype Pro',
    nameAr: 'محترف النماذج',
    descriptionEn: 'Generated 5 prototypes',
    descriptionAr: 'أنشأت 5 نماذج أولية',
    icon: '🚀',
    category: 'prototype',
    tier: 'gold',
    maxProgress: 5,
    xpReward: 600,
    checkCondition: (stats) => Math.min(stats.totalPrototypes, 5),
  },

  // Quality Achievements
  {
    id: 'detail-oriented',
    nameEn: 'Detail Oriented',
    nameAr: 'دقيق التفاصيل',
    descriptionEn: 'All your PRDs scored above 90',
    descriptionAr: 'جميع وثائقك حصلت على أكثر من 90',
    icon: '⭐',
    category: 'quality',
    tier: 'platinum',
    maxProgress: 1,
    xpReward: 1000,
    checkCondition: (stats) =>
      stats.totalPRDsCreated > 0 && stats.averagePRDScore > 90 ? 1 : 0,
  },
  {
    id: 'perfectionist',
    nameEn: 'Perfectionist',
    nameAr: 'مثالي',
    descriptionEn: 'Created 5 PRDs with perfect scores (>95)',
    descriptionAr: 'أنشأت 5 وثائق بدرجات مثالية (>95)',
    icon: '💎',
    category: 'quality',
    tier: 'diamond',
    maxProgress: 5,
    xpReward: 2000,
    checkCondition: (stats) => Math.min(stats.perfectScorePRDs, 5),
  },

  // Streak Achievements
  {
    id: 'week-streak',
    nameEn: 'Week Warrior',
    nameAr: 'محارب الأسبوع',
    descriptionEn: 'Maintained a 7-day streak',
    descriptionAr: 'حافظت على استخدام متواصل لـ 7 أيام',
    icon: '🔥',
    category: 'streak',
    tier: 'silver',
    maxProgress: 7,
    xpReward: 300,
    checkCondition: (stats) => Math.min(stats.currentStreak || 0, 7),
  },
  {
    id: 'month-streak',
    nameEn: 'Month Master',
    nameAr: 'سيد الشهر',
    descriptionEn: 'Maintained a 30-day streak',
    descriptionAr: 'حافظت على استخدام متواصل لـ 30 يوم',
    icon: '🏆',
    category: 'streak',
    tier: 'platinum',
    maxProgress: 30,
    xpReward: 1500,
    checkCondition: (stats) => Math.min(stats.currentStreak || 0, 30),
  },

  // Special Hidden Achievements
  {
    id: 'night-owl',
    nameEn: 'Night Owl',
    nameAr: 'بومة الليل',
    descriptionEn: 'Created a PRD at 3 AM',
    descriptionAr: 'أنشأت وثيقة في الساعة 3 صباحاً',
    icon: '🦉',
    category: 'special',
    tier: 'silver',
    maxProgress: 1,
    xpReward: 200,
    hidden: true,
    checkCondition: () => 0, // يتم التحقق يدوياً
  },
];

class AchievementService {
  private static instance: AchievementService;
  private readonly STORAGE_KEY = 'user_achievements';
  private readonly NOTIFICATIONS_KEY = 'achievement_notifications';

  private constructor() {}

  static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  /**
   * تهيئة إنجازات المستخدم
   */
  initializeUserAchievements(userId: string): UserAchievements {
    const achievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map(def => ({
      id: def.id,
      nameEn: def.nameEn,
      nameAr: def.nameAr,
      descriptionEn: def.descriptionEn,
      descriptionAr: def.descriptionAr,
      icon: def.icon,
      category: def.category,
      tier: def.tier,
      progress: 0,
      maxProgress: def.maxProgress,
      unlocked: false,
      xpReward: def.xpReward,
      hidden: def.hidden,
    }));

    const userAchievements: UserAchievements = {
      userId,
      achievements,
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      statistics: {
        totalPRDsCreated: 0,
        totalResearches: 0,
        totalPrototypes: 0,
        averagePRDScore: 0,
        perfectScorePRDs: 0,
        lastActivity: new Date(),
        joinedDate: new Date(),
      },
    };

    this.saveUserAchievements(userAchievements);
    return userAchievements;
  }

  /**
   * تحديث إحصائيات المستخدم وفحص الإنجازات الجديدة
   */
  updateStatistics(
    userId: string,
    updates: Partial<UserStatistics>
  ): AchievementNotification[] {
    const userAchievements = this.getUserAchievements(userId);
    if (!userAchievements) return [];

    // تحديث الإحصائيات
    userAchievements.statistics = {
      ...userAchievements.statistics,
      ...updates,
      lastActivity: new Date(),
    };

    // فحص الإنجازات
    const newAchievements = this.checkAchievements(userAchievements);

    // حفظ التحديثات
    this.saveUserAchievements(userAchievements);

    return newAchievements;
  }

  /**
   * فحص وفتح الإنجازات الجديدة
   */
  private checkAchievements(userAchievements: UserAchievements): AchievementNotification[] {
    const notifications: AchievementNotification[] = [];

    ACHIEVEMENT_DEFINITIONS.forEach(def => {
      const achievement = userAchievements.achievements.find(a => a.id === def.id);
      if (!achievement || achievement.unlocked) return;

      const progress = def.checkCondition(userAchievements.statistics);
      achievement.progress = progress;

      if (progress >= def.maxProgress && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        userAchievements.totalXP += def.xpReward;
        userAchievements.level = this.calculateLevel(userAchievements.totalXP);

        notifications.push({
          achievement,
          timestamp: new Date(),
          shown: false,
        });
      }
    });

    return notifications;
  }

  /**
   * حساب المستوى بناءً على XP
   */
  private calculateLevel(totalXP: number): number {
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  }

  /**
   * احصل على XP المطلوب للمستوى التالي
   */
  getXPForNextLevel(currentLevel: number): number {
    const nextLevel = currentLevel + 1;
    return Math.pow(nextLevel - 1, 2) * 100;
  }

  /**
   * حفظ بيانات الإنجازات
   */
  private saveUserAchievements(userAchievements: UserAchievements): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userAchievements));
  }

  /**
   * جلب بيانات الإنجازات
   */
  getUserAchievements(userId: string): UserAchievements | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return null;

    try {
      const userAchievements: UserAchievements = JSON.parse(data);
      if (userAchievements.userId !== userId) {
        return this.initializeUserAchievements(userId);
      }
      return userAchievements;
    } catch {
      return null;
    }
  }

  /**
   * احصل على الإنجازات حسب الفئة
   */
  getAchievementsByCategory(
    userId: string,
    category: AchievementCategory
  ): Achievement[] {
    const userAchievements = this.getUserAchievements(userId);
    if (!userAchievements) return [];

    return userAchievements.achievements.filter(a => a.category === category);
  }

  /**
   * احصل على الإنجازات المفتوحة
   */
  getUnlockedAchievements(userId: string): Achievement[] {
    const userAchievements = this.getUserAchievements(userId);
    if (!userAchievements) return [];

    return userAchievements.achievements.filter(a => a.unlocked);
  }

  /**
   * احصل على نسبة التقدم الإجمالية
   */
  getOverallProgress(userId: string): number {
    const userAchievements = this.getUserAchievements(userId);
    if (!userAchievements) return 0;

    const unlockedCount = userAchievements.achievements.filter(a => a.unlocked).length;
    const visibleAchievements = userAchievements.achievements.filter(a => !a.hidden).length;

    return (unlockedCount / visibleAchievements) * 100;
  }

  /**
   * احصل على لوحة المتصدرين (محاكاة)
   */
  getLeaderboard(limit: number = 10): LeaderboardEntry[] {
    // في التطبيق الحقيقي، هذا سيأتي من الباكند
    // هنا نقوم بمحاكاة بيانات
    return [];
  }

  /**
   * تسجيل نشاط PRD جديد
   */
  recordPRDCreated(userId: string, score: number): AchievementNotification[] {
    const updates: Partial<UserStatistics> = {
      totalPRDsCreated: (this.getUserAchievements(userId)?.statistics.totalPRDsCreated || 0) + 1,
    };

    if (score > 90) {
      updates.perfectScorePRDs = (this.getUserAchievements(userId)?.statistics.perfectScorePRDs || 0) + 1;
    }

    return this.updateStatistics(userId, updates);
  }

  /**
   * تسجيل بحث جديد
   */
  recordResearchCompleted(userId: string): AchievementNotification[] {
    const updates: Partial<UserStatistics> = {
      totalResearches: (this.getUserAchievements(userId)?.statistics.totalResearches || 0) + 1,
    };

    return this.updateStatistics(userId, updates);
  }

  /**
   * تسجيل نموذج أولي جديد
   */
  recordPrototypeGenerated(userId: string): AchievementNotification[] {
    const updates: Partial<UserStatistics> = {
      totalPrototypes: (this.getUserAchievements(userId)?.statistics.totalPrototypes || 0) + 1,
    };

    return this.updateStatistics(userId, updates);
  }

  /**
   * تحديث السلسلة المتواصلة
   */
  updateStreak(userId: string): void {
    const userAchievements = this.getUserAchievements(userId);
    if (!userAchievements) return;

    const now = new Date();
    const lastActivity = new Date(userAchievements.statistics.lastActivity);
    const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    if (hoursDiff <= 24) {
      userAchievements.currentStreak += 1;
      if (userAchievements.currentStreak > userAchievements.longestStreak) {
        userAchievements.longestStreak = userAchievements.currentStreak;
      }
    } else if (hoursDiff > 48) {
      userAchievements.currentStreak = 1;
    }

    this.saveUserAchievements(userAchievements);
  }
}

export default AchievementService.getInstance();
