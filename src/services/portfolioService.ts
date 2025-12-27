/**
 * خدمة Portfolio المستخدم - Section 10
 * تدير PRDs، الإحصائيات، والإنجازات
 */

import {
  UserPortfolio,
  PRDEntry,
  UserStats,
  PortfolioTimelineItem,
  Achievement,
  DEFAULT_ACHIEVEMENTS,
} from '../types/portfolio';
import { QualityScore } from '../types/quality';

export class PortfolioService {
  private static instance: PortfolioService;
  private readonly STORAGE_KEY = 'user_portfolio';
  private readonly USER_ID = 'default_user'; // في المستقبل، يمكن ربطه بنظام مصادقة

  private constructor() {
    this.initializePortfolioIfNeeded();
  }

  public static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  /**
   * الحصول على Portfolio المستخدم
   */
  public getPortfolio(): UserPortfolio {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const portfolio = JSON.parse(stored);
      // تحويل التواريخ من strings إلى Date objects
      this.convertDates(portfolio);
      return portfolio;
    }
    return this.createEmptyPortfolio();
  }

  /**
   * حفظ Portfolio
   */
  private savePortfolio(portfolio: UserPortfolio): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(portfolio));
  }

  /**
   * إضافة PRD جديد
   */
  public addPRD(
    title: string,
    content: string,
    version: PRDEntry['version'],
    qualityScore?: QualityScore
  ): PRDEntry {
    const portfolio = this.getPortfolio();

    const newPRD: PRDEntry = {
      id: this.generateId(),
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      qualityScore,
      version,
      tags: this.extractTags(content),
      status: 'draft',
    };

    portfolio.prds.unshift(newPRD);

    // إضافة إلى Timeline
    portfolio.timeline.unshift({
      id: this.generateId(),
      type: 'created',
      title: `Created "${title}"`,
      description: `New ${version} PRD created`,
      date: new Date(),
      relatedPRDId: newPRD.id,
    });

    // تحديث الإحصائيات
    this.updateStats(portfolio);

    // فحص الإنجازات
    this.checkAchievements(portfolio);

    this.savePortfolio(portfolio);
    return newPRD;
  }

  /**
   * تحديث PRD موجود
   */
  public updatePRD(
    id: string,
    updates: Partial<Omit<PRDEntry, 'id' | 'createdAt'>>
  ): PRDEntry | null {
    const portfolio = this.getPortfolio();
    const prdIndex = portfolio.prds.findIndex(p => p.id === id);

    if (prdIndex === -1) return null;

    portfolio.prds[prdIndex] = {
      ...portfolio.prds[prdIndex],
      ...updates,
      updatedAt: new Date(),
    };

    // إضافة إلى Timeline
    portfolio.timeline.unshift({
      id: this.generateId(),
      type: 'updated',
      title: `Updated "${portfolio.prds[prdIndex].title}"`,
      description: 'PRD updated with new changes',
      date: new Date(),
      relatedPRDId: id,
    });

    this.updateStats(portfolio);
    this.checkAchievements(portfolio);
    this.savePortfolio(portfolio);

    return portfolio.prds[prdIndex];
  }

  /**
   * تحديث حالة PRD
   */
  public completePRD(id: string): void {
    const portfolio = this.getPortfolio();
    const prd = portfolio.prds.find(p => p.id === id);

    if (prd && prd.status !== 'completed') {
      prd.status = 'completed';
      prd.updatedAt = new Date();

      portfolio.timeline.unshift({
        id: this.generateId(),
        type: 'completed',
        title: `Completed "${prd.title}"`,
        description: 'PRD marked as completed',
        date: new Date(),
        relatedPRDId: id,
        badge: prd.qualityScore?.badge,
      });

      this.updateStats(portfolio);
      this.checkAchievements(portfolio);
      this.savePortfolio(portfolio);
    }
  }

  /**
   * إضافة prototype لـ PRD
   */
  public addPrototype(id: string, html: string): void {
    const portfolio = this.getPortfolio();
    const prd = portfolio.prds.find(p => p.id === id);

    if (prd) {
      prd.generatedPrototype = {
        html,
        generatedAt: new Date(),
      };
      prd.updatedAt = new Date();

      portfolio.timeline.unshift({
        id: this.generateId(),
        type: 'completed',
        title: `Generated prototype for "${prd.title}"`,
        description: 'Prototype successfully generated',
        date: new Date(),
        relatedPRDId: id,
      });

      this.updateStats(portfolio);
      this.checkAchievements(portfolio);
      this.savePortfolio(portfolio);
    }
  }

  /**
   * حذف PRD
   */
  public deletePRD(id: string): void {
    const portfolio = this.getPortfolio();
    portfolio.prds = portfolio.prds.filter(p => p.id !== id);
    portfolio.timeline = portfolio.timeline.filter(t => t.relatedPRDId !== id);

    this.updateStats(portfolio);
    this.savePortfolio(portfolio);
  }

  /**
   * الحصول على إحصائيات المستخدم
   */
  public getStats(): UserStats {
    const portfolio = this.getPortfolio();
    return portfolio.stats;
  }

  /**
   * تصدير Portfolio كـ JSON
   */
  public exportAsJSON(): string {
    const portfolio = this.getPortfolio();
    return JSON.stringify(portfolio, null, 2);
  }

  /**
   * تصدير Portfolio كـ PDF (نص formatted)
   */
  public exportAsPDFContent(): string {
    const portfolio = this.getPortfolio();
    let content = `# User Portfolio - ${portfolio.username}\n\n`;

    content += `## Statistics\n`;
    content += `- Total PRDs: ${portfolio.stats.totalPRDs}\n`;
    content += `- Completed: ${portfolio.stats.completedPRDs}\n`;
    content += `- Average Quality Score: ${portfolio.stats.averageQualityScore.toFixed(1)}/100\n`;
    content += `- Success Rate: ${portfolio.stats.successRate.toFixed(1)}%\n`;
    content += `- Best Score: ${portfolio.stats.bestScore}/100\n`;
    content += `- Current Streak: ${portfolio.stats.streak} days\n\n`;

    content += `## Achievements\n`;
    portfolio.achievements.filter(a => a.isUnlocked).forEach(achievement => {
      content += `- ${achievement.icon} **${achievement.name}**: ${achievement.description}\n`;
    });

    content += `\n## PRDs\n\n`;
    portfolio.prds.forEach((prd, index) => {
      content += `### ${index + 1}. ${prd.title}\n`;
      content += `- Status: ${prd.status}\n`;
      content += `- Version: ${prd.version}\n`;
      content += `- Created: ${prd.createdAt.toLocaleDateString()}\n`;
      if (prd.qualityScore) {
        content += `- Quality Score: ${prd.qualityScore.overall}/100 (${prd.qualityScore.badge})\n`;
      }
      content += `\n`;
    });

    return content;
  }

  /**
   * تحديث الإحصائيات
   */
  private updateStats(portfolio: UserPortfolio): void {
    const totalPRDs = portfolio.prds.length;
    const completedPRDs = portfolio.prds.filter(p => p.status === 'completed').length;
    const draftPRDs = portfolio.prds.filter(p => p.status === 'draft').length;

    const scoresWithQuality = portfolio.prds
      .filter(p => p.qualityScore)
      .map(p => p.qualityScore!.overall);

    const averageQualityScore = scoresWithQuality.length > 0
      ? scoresWithQuality.reduce((sum, score) => sum + score, 0) / scoresWithQuality.length
      : 0;

    const successfulPRDs = scoresWithQuality.filter(score => score >= 70).length;
    const successRate = scoresWithQuality.length > 0
      ? (successfulPRDs / scoresWithQuality.length) * 100
      : 0;

    const bestScore = scoresWithQuality.length > 0
      ? Math.max(...scoresWithQuality)
      : 0;

    // حساب معدل التحسن
    const improvementRate = this.calculateImprovementRate(portfolio.prds);

    // حساب Streak
    const streak = this.calculateStreak(portfolio.timeline);

    portfolio.stats = {
      totalPRDs,
      completedPRDs,
      draftPRDs,
      averageQualityScore,
      successRate,
      bestScore,
      improvementRate,
      streak,
      lastActiveDate: new Date(),
    };
  }

  /**
   * حساب معدل التحسن
   */
  private calculateImprovementRate(prds: PRDEntry[]): number {
    const withScores = prds
      .filter(p => p.qualityScore)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    if (withScores.length < 2) return 0;

    const firstHalf = withScores.slice(0, Math.floor(withScores.length / 2));
    const secondHalf = withScores.slice(Math.floor(withScores.length / 2));

    const firstAvg = firstHalf.reduce((sum, p) => sum + p.qualityScore!.overall, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.qualityScore!.overall, 0) / secondHalf.length;

    return ((secondAvg - firstAvg) / firstAvg) * 100;
  }

  /**
   * حساب Streak (الأيام المتتالية)
   */
  private calculateStreak(timeline: PortfolioTimelineItem[]): number {
    if (timeline.length === 0) return 0;

    const sortedDates = timeline
      .map(t => t.date)
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 1;
    let currentDate = new Date(sortedDates[0]);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      date.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        currentDate = date;
      } else if (diffDays > 1) {
        break;
      }
    }

    // تحقق من أن آخر نشاط كان اليوم أو البارحة
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActivityDate = new Date(sortedDates[0]);
    lastActivityDate.setHours(0, 0, 0, 0);
    const daysSinceLastActivity = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastActivity > 1) {
      return 0; // انقطع الـ streak
    }

    return streak;
  }

  /**
   * فحص وفتح الإنجازات
   */
  private checkAchievements(portfolio: UserPortfolio): void {
    const { stats, prds } = portfolio;

    // First PRD
    this.unlockAchievement(portfolio, 'first_prd', prds.length >= 1);

    // Quality Master
    this.unlockAchievement(
      portfolio,
      'quality_master',
      prds.some(p => p.qualityScore && p.qualityScore.overall >= 90)
    );

    // Consistent Creator
    this.unlockAchievement(portfolio, 'consistent_creator', prds.length >= 10);

    // Prototype Pro
    this.unlockAchievement(
      portfolio,
      'prototype_pro',
      prds.filter(p => p.generatedPrototype).length >= 5
    );

    // Detail Oriented
    const allScoresAbove70 = prds.length > 0 && prds.every(p =>
      p.qualityScore ? p.qualityScore.overall >= 70 : false
    );
    this.unlockAchievement(portfolio, 'detail_oriented', allScoresAbove70 && prds.length >= 3);

    // Week Streak
    this.unlockAchievement(portfolio, 'week_streak', stats.streak >= 7);
  }

  /**
   * فتح إنجاز معين
   */
  private unlockAchievement(portfolio: UserPortfolio, achievementId: string, condition: boolean): void {
    const achievement = portfolio.achievements.find(a => a.id === achievementId);

    if (achievement && !achievement.isUnlocked && condition) {
      achievement.isUnlocked = true;
      achievement.unlockedAt = new Date();

      // إضافة إلى Timeline
      portfolio.timeline.unshift({
        id: this.generateId(),
        type: 'achievement',
        title: `Achievement Unlocked: ${achievement.name}`,
        description: achievement.description,
        date: new Date(),
        badge: achievement.icon,
      });
    }
  }

  /**
   * استخراج Tags من محتوى PRD
   */
  private extractTags(content: string): string[] {
    const tags: string[] = [];

    if (/mobile|app|ios|android/i.test(content)) tags.push('Mobile');
    if (/web|website|browser/i.test(content)) tags.push('Web');
    if (/AI|machine learning|ML/i.test(content)) tags.push('AI');
    if (/dashboard|analytics|reporting/i.test(content)) tags.push('Analytics');
    if (/e-commerce|shopping|store/i.test(content)) tags.push('E-commerce');
    if (/social|community|collaboration/i.test(content)) tags.push('Social');
    if (/SaaS|platform|service/i.test(content)) tags.push('SaaS');

    return tags.length > 0 ? tags : ['General'];
  }

  /**
   * توليد ID فريد
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * تحويل strings إلى Date objects
   */
  private convertDates(portfolio: any): void {
    portfolio.prds.forEach((prd: any) => {
      prd.createdAt = new Date(prd.createdAt);
      prd.updatedAt = new Date(prd.updatedAt);
      if (prd.generatedPrototype) {
        prd.generatedPrototype.generatedAt = new Date(prd.generatedPrototype.generatedAt);
      }
      if (prd.qualityScore) {
        prd.qualityScore.timestamp = new Date(prd.qualityScore.timestamp);
      }
    });

    portfolio.timeline.forEach((item: any) => {
      item.date = new Date(item.date);
    });

    portfolio.achievements.forEach((achievement: any) => {
      if (achievement.unlockedAt) {
        achievement.unlockedAt = new Date(achievement.unlockedAt);
      }
    });

    portfolio.stats.lastActiveDate = new Date(portfolio.stats.lastActiveDate);
  }

  /**
   * إنشاء Portfolio فارغ
   */
  private createEmptyPortfolio(): UserPortfolio {
    return {
      userId: this.USER_ID,
      username: 'User',
      stats: {
        totalPRDs: 0,
        completedPRDs: 0,
        draftPRDs: 0,
        averageQualityScore: 0,
        successRate: 0,
        bestScore: 0,
        improvementRate: 0,
        streak: 0,
        lastActiveDate: new Date(),
      },
      prds: [],
      timeline: [],
      achievements: DEFAULT_ACHIEVEMENTS.map(a => ({
        ...a,
        isUnlocked: false,
      })),
    };
  }

  /**
   * تهيئة Portfolio إذا لم يكن موجوداً
   */
  private initializePortfolioIfNeeded(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      this.savePortfolio(this.createEmptyPortfolio());
    }
  }

  /**
   * مسح جميع البيانات
   */
  public clearPortfolio(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializePortfolioIfNeeded();
  }
}

export default PortfolioService.getInstance();
