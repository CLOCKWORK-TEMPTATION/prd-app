/**
 * Email Service - Section 18
 * Weekly digest email system for user re-engagement
 */

import {
  DigestSettings,
  DigestContent,
  EmailTemplate,
  EmailDeliveryStatus,
  WeeklyStats,
  GoalProgress,
  TrendingTemplate,
  TipOfTheWeek,
  UserActivity,
  Achievement,
} from '../types/email.types';

class EmailService {
  private readonly SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
  private readonly SENDGRID_ENDPOINT = 'https://api.sendgrid.com/v3/mail/send';
  private readonly FROM_EMAIL = 'digest@prdapp.com';
  private readonly FROM_NAME = 'PRD App Team';

  /**
   * Generate weekly digest content for a user
   */
  async generateDigestContent(
    userId: string,
    activity: UserActivity
  ): Promise<DigestContent> {
    const stats = await this.calculateWeeklyStats(userId, activity);
    const goals = await this.getGoalProgress(userId);
    const trending = await this.getTrendingTemplates();
    const tips = await this.getTipsOfTheWeek();
    const achievements = await this.getRecentAchievements(userId);

    return {
      user: {
        name: 'User', // Would come from user profile
        email: '', // Would come from user profile
      },
      stats,
      goals,
      trending,
      tips,
      achievements,
      personalizedMessage: this.generatePersonalizedMessage(activity),
    };
  }

  /**
   * Calculate weekly statistics
   */
  private async calculateWeeklyStats(
    userId: string,
    activity: UserActivity
  ): Promise<WeeklyStats> {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      period: {
        start: weekStart,
        end: now,
      },
      prdsCreated: activity.prdsCreated,
      prototypesGenerated: activity.prototypesGenerated,
      researchesConducted: activity.researchesConducted,
      totalTimeSpent: activity.timeSpent,
      averageQualityScore: 85, // Would be calculated from actual PRD scores
      mostUsedFeature: 'PRD Generation',
      productivityTrend: this.calculateTrend(activity),
    };
  }

  /**
   * Calculate productivity trend
   */
  private calculateTrend(activity: UserActivity): 'up' | 'down' | 'stable' {
    // Simplified trend calculation
    if (activity.prdsCreated > 5) return 'up';
    if (activity.prdsCreated < 2) return 'down';
    return 'stable';
  }

  /**
   * Get user's goal progress
   */
  private async getGoalProgress(userId: string): Promise<GoalProgress[]> {
    // Mock data - in production, this would fetch from database
    return [
      {
        goalId: '1',
        name: 'Create 10 PRDs this month',
        target: 10,
        current: 7,
        percentage: 70,
        status: 'on-track',
      },
      {
        goalId: '2',
        name: 'Complete onboarding',
        target: 1,
        current: 1,
        percentage: 100,
        status: 'completed',
      },
    ];
  }

  /**
   * Get trending templates
   */
  private async getTrendingTemplates(): Promise<TrendingTemplate[]> {
    return [
      {
        id: '1',
        name: 'SaaS Product Template',
        category: 'Software',
        usageCount: 1247,
        rating: 4.8,
        description: 'Perfect for SaaS products and web applications',
      },
      {
        id: '2',
        name: 'Mobile App Template',
        category: 'Mobile',
        usageCount: 892,
        rating: 4.6,
        description: 'Optimized for mobile app development',
      },
      {
        id: '3',
        name: 'E-commerce Platform',
        category: 'E-commerce',
        usageCount: 654,
        rating: 4.7,
        description: 'Comprehensive template for online stores',
      },
    ];
  }

  /**
   * Get tips of the week
   */
  private async getTipsOfTheWeek(): Promise<TipOfTheWeek[]> {
    const allTips: TipOfTheWeek[] = [
      {
        id: '1',
        title: 'Use AI Writing Assistant',
        description:
          'Speed up your PRD creation by 50% with our AI-powered suggestions',
        category: 'features',
        icon: '🤖',
      },
      {
        id: '2',
        title: 'Set SMART Goals',
        description:
          'Make your success metrics Specific, Measurable, Achievable, Relevant, and Time-bound',
        category: 'best-practices',
        icon: '🎯',
      },
      {
        id: '3',
        title: 'Export to Jira',
        description:
          'Turn your PRD into actionable tickets in Jira with one click',
        category: 'features',
        icon: '🔷',
      },
      {
        id: '4',
        title: 'Use Templates',
        description:
          'Save 30 minutes by starting with our pre-built templates',
        category: 'productivity',
        icon: '📋',
      },
      {
        id: '5',
        title: 'Enable Auto-Save',
        description:
          'Never lose your work - enable auto-save in settings',
        category: 'productivity',
        icon: '💾',
      },
    ];

    // Rotate tips weekly
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const startIndex = weekNumber % allTips.length;
    return [
      allTips[startIndex % allTips.length],
      allTips[(startIndex + 1) % allTips.length],
      allTips[(startIndex + 2) % allTips.length],
    ];
  }

  /**
   * Get recent achievements
   */
  private async getRecentAchievements(userId: string): Promise<Achievement[]> {
    // Mock data - would fetch from database
    return [
      {
        id: '1',
        name: 'First PRD Created',
        description: 'You created your first PRD!',
        icon: '🎯',
        unlockedAt: new Date(),
        rarity: 'common',
      },
    ];
  }

  /**
   * Generate personalized message
   */
  private generatePersonalizedMessage(activity: UserActivity): string {
    if (activity.streak >= 7) {
      return `🔥 Amazing! You're on a ${activity.streak}-day streak! Keep it up!`;
    }
    if (activity.prdsCreated >= 5) {
      return '🚀 You had a productive week! Great job on all those PRDs!';
    }
    if (activity.prdsCreated === 0) {
      return '💡 We miss you! Come back and create something amazing.';
    }
    return '✨ Keep building great products!';
  }

  /**
   * Create HTML email template
   */
  createEmailTemplate(content: DigestContent): EmailTemplate {
    const htmlBody = this.generateHTMLBody(content);
    const textBody = this.generateTextBody(content);
    const subject = this.generateSubject(content);

    return { subject, htmlBody, textBody };
  }

  /**
   * Generate email subject
   */
  private generateSubject(content: DigestContent): string {
    const { stats } = content;

    if (stats.prdsCreated === 0) {
      return '👋 We miss you! Time to create something amazing';
    }

    if (stats.prdsCreated === 1) {
      return `📊 Your weekly update: ${stats.prdsCreated} PRD created`;
    }

    return `📊 Your weekly update: ${stats.prdsCreated} PRDs created this week!`;
  }

  /**
   * Generate HTML email body
   */
  private generateHTMLBody(content: DigestContent): string {
    const { stats, goals, trending, tips, achievements, personalizedMessage } = content;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .section { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .section h2 { color: #667eea; margin-top: 0; font-size: 20px; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: white; padding: 15px; border-radius: 6px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
    .goal-item { background: white; padding: 15px; border-radius: 6px; margin-bottom: 10px; }
    .progress-bar { background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 8px; }
    .progress-fill { background: #667eea; height: 100%; border-radius: 4px; transition: width 0.3s; }
    .template-card { background: white; padding: 15px; border-radius: 6px; margin-bottom: 10px; }
    .template-card h3 { margin: 0 0 5px 0; font-size: 16px; }
    .template-meta { font-size: 12px; color: #6b7280; }
    .tip-card { background: white; padding: 15px; border-left: 4px solid #667eea; border-radius: 6px; margin-bottom: 10px; }
    .tip-card h3 { margin: 0 0 5px 0; font-size: 16px; }
    .achievement { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 15px; border-radius: 6px; margin-bottom: 10px; text-align: center; }
    .achievement-icon { font-size: 32px; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 10px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .personalized { background: #fff; padding: 20px; border-radius: 8px; text-align: center; font-size: 18px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Your Weekly Digest</h1>
    <p>${stats.period.start.toLocaleDateString()} - ${stats.period.end.toLocaleDateString()}</p>
  </div>

  ${personalizedMessage ? `<div class="personalized">${personalizedMessage}</div>` : ''}

  <div class="section">
    <h2>📈 This Week's Activity</h2>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.prdsCreated}</div>
        <div class="stat-label">PRDs Created</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.prototypesGenerated}</div>
        <div class="stat-label">Prototypes Generated</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.researchesConducted}</div>
        <div class="stat-label">Researches Done</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Math.round(stats.totalTimeSpent / 60)}h</div>
        <div class="stat-label">Time Spent</div>
      </div>
    </div>
    <p style="text-align: center; margin-top: 15px;">
      Productivity Trend: ${stats.productivityTrend === 'up' ? '📈 Up' : stats.productivityTrend === 'down' ? '📉 Down' : '➡️ Stable'}
    </p>
  </div>

  ${
    achievements && achievements.length > 0
      ? `
  <div class="section">
    <h2>🏆 New Achievements</h2>
    ${achievements
      .map(
        (achievement) => `
      <div class="achievement">
        <div class="achievement-icon">${achievement.icon}</div>
        <h3>${achievement.name}</h3>
        <p style="margin: 5px 0;">${achievement.description}</p>
        <small>${achievement.rarity.toUpperCase()}</small>
      </div>
    `
      )
      .join('')}
  </div>
  `
      : ''
  }

  ${
    goals && goals.length > 0
      ? `
  <div class="section">
    <h2>🎯 Goal Progress</h2>
    ${goals
      .map(
        (goal) => `
      <div class="goal-item">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong>${goal.name}</strong>
          <span style="color: ${
            goal.status === 'completed'
              ? '#10b981'
              : goal.status === 'on-track'
              ? '#667eea'
              : '#ef4444'
          };">${goal.percentage}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${goal.percentage}%;"></div>
        </div>
        <small style="color: #6b7280;">${goal.current} of ${goal.target}</small>
      </div>
    `
      )
      .join('')}
  </div>
  `
      : ''
  }

  <div class="section">
    <h2>🔥 Trending Templates</h2>
    ${trending
      .map(
        (template) => `
      <div class="template-card">
        <h3>${template.name}</h3>
        <p style="margin: 5px 0; font-size: 14px;">${template.description}</p>
        <div class="template-meta">
          ⭐ ${template.rating} · ${template.usageCount} uses · ${template.category}
        </div>
      </div>
    `
      )
      .join('')}
  </div>

  <div class="section">
    <h2>💡 Tips & Tricks</h2>
    ${tips
      .map(
        (tip) => `
      <div class="tip-card">
        <h3>${tip.icon} ${tip.title}</h3>
        <p style="margin: 5px 0; color: #6b7280;">${tip.description}</p>
      </div>
    `
      )
      .join('')}
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://prdapp.com/create" class="cta-button">Create Your Next PRD</a>
  </div>

  <div class="footer">
    <p>You're receiving this because you signed up for weekly digest emails.</p>
    <p><a href="https://prdapp.com/settings/notifications" style="color: #667eea;">Update preferences</a> · <a href="https://prdapp.com/unsubscribe" style="color: #6b7280;">Unsubscribe</a></p>
    <p style="margin-top: 10px;">© ${new Date().getFullYear()} PRD App. All rights reserved.</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text email body
   */
  private generateTextBody(content: DigestContent): string {
    const { stats, goals, trending, tips, achievements, personalizedMessage } = content;

    let text = `
YOUR WEEKLY DIGEST
${stats.period.start.toLocaleDateString()} - ${stats.period.end.toLocaleDateString()}

${personalizedMessage || ''}

THIS WEEK'S ACTIVITY
====================
📝 PRDs Created: ${stats.prdsCreated}
🎨 Prototypes Generated: ${stats.prototypesGenerated}
🔍 Researches Done: ${stats.researchesConducted}
⏱️  Time Spent: ${Math.round(stats.totalTimeSpent / 60)} hours
Productivity Trend: ${stats.productivityTrend === 'up' ? 'Up' : stats.productivityTrend === 'down' ? 'Down' : 'Stable'}
`;

    if (achievements && achievements.length > 0) {
      text += `\n\nNEW ACHIEVEMENTS\n================\n`;
      achievements.forEach((achievement) => {
        text += `${achievement.icon} ${achievement.name}: ${achievement.description}\n`;
      });
    }

    if (goals && goals.length > 0) {
      text += `\n\nGOAL PROGRESS\n=============\n`;
      goals.forEach((goal) => {
        text += `${goal.name}: ${goal.current}/${goal.target} (${goal.percentage}%)\n`;
      });
    }

    text += `\n\nTRENDING TEMPLATES\n==================\n`;
    trending.forEach((template) => {
      text += `${template.name} - ${template.description} (⭐ ${template.rating})\n`;
    });

    text += `\n\nTIPS & TRICKS\n=============\n`;
    tips.forEach((tip) => {
      text += `${tip.icon} ${tip.title}\n${tip.description}\n\n`;
    });

    text += `\nCreate Your Next PRD: https://prdapp.com/create\n`;
    text += `\nUpdate preferences: https://prdapp.com/settings/notifications\n`;
    text += `Unsubscribe: https://prdapp.com/unsubscribe\n`;

    return text.trim();
  }

  /**
   * Send digest email
   */
  async sendDigest(
    emailAddress: string,
    content: DigestContent
  ): Promise<EmailDeliveryStatus> {
    const template = this.createEmailTemplate(content);

    try {
      const response = await fetch(this.SENDGRID_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: emailAddress, name: content.user.name }],
              subject: template.subject,
            },
          ],
          from: { email: this.FROM_EMAIL, name: this.FROM_NAME },
          content: [
            { type: 'text/plain', value: template.textBody },
            { type: 'text/html', value: template.htmlBody },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.statusText}`);
      }

      const messageId = response.headers.get('x-message-id') || '';

      return {
        messageId,
        status: 'sent',
        sentAt: new Date(),
      };
    } catch (error) {
      return {
        messageId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Schedule digest emails (to be run by cron job)
   */
  async scheduleDigests(settings: DigestSettings[]): Promise<void> {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    for (const setting of settings) {
      if (!setting.enabled) continue;

      if (setting.dayOfWeek === currentDay && setting.timeOfDay === currentTime) {
        // Schedule this digest
        console.log(`Scheduling digest for ${setting.emailAddress}`);
      }
    }
  }
}

export const emailService = new EmailService();
