/**
 * AI Mentor Service
 * Section 16: مساعد AI شخصي يتعلم من المستخدم
 */

import {
  MentorSuggestion,
  UserStyle,
  LearningData,
  MentorInsight,
  MentorProfile,
  MentorFeedback,
  ActivityEntry,
  UserPattern,
  SuggestionType,
  SuggestionPriority,
} from '../types/mentorTypes';

class MentorService {
  private static instance: MentorService;
  private readonly STORAGE_KEY = 'mentor_profile';
  private readonly LEARNING_KEY = 'mentor_learning';

  private constructor() {}

  static getInstance(): MentorService {
    if (!MentorService.instance) {
      MentorService.instance = new MentorService();
    }
    return MentorService.instance;
  }

  /**
   * تهيئة ملف المستخدم في AI Mentor
   */
  initializeMentorProfile(userId: string): MentorProfile {
    const profile: MentorProfile = {
      userId,
      learningData: {
        userId,
        totalPRDsAnalyzed: 0,
        userStyle: {
          preferredLength: 'detailed',
          focusAreas: [],
          commonKeywords: [],
          averageResponseLength: 0,
          preferredFeatureTypes: [],
          languagePreference: 'en-US',
        },
        patterns: [],
        lastUpdated: new Date(),
      },
      suggestions: [],
      insights: [],
      feedbackHistory: [],
      totalSuggestionsApplied: 0,
      totalSuggestionsDismissed: 0,
      helpfulnessRate: 0,
    };

    this.saveMentorProfile(profile);
    return profile;
  }

  /**
   * تحليل PRD جديد والتعلم منه
   */
  analyzePRD(userId: string, prdContent: string): void {
    const profile = this.getMentorProfile(userId);
    if (!profile) return;

    profile.learningData.totalPRDsAnalyzed += 1;

    // تحليل طول المحتوى
    const wordCount = prdContent.split(/\s+/).length;
    this.updateAverageLength(profile, wordCount);

    // استخراج الكلمات المفتاحية
    this.extractKeywords(profile, prdContent);

    // تحديد نوع المحتوى المفضل
    this.identifyContentPreferences(profile, prdContent);

    // تحديث التاريخ
    profile.learningData.lastUpdated = new Date();

    this.saveMentorProfile(profile);
  }

  /**
   * تحديث متوسط طول الإجابات
   */
  private updateAverageLength(profile: MentorProfile, wordCount: number): void {
    const totalAnalyzed = profile.learningData.totalPRDsAnalyzed;
    const currentAvg = profile.learningData.userStyle.averageResponseLength;

    profile.learningData.userStyle.averageResponseLength =
      (currentAvg * (totalAnalyzed - 1) + wordCount) / totalAnalyzed;

    // تحديد النمط المفضل
    if (profile.learningData.userStyle.averageResponseLength < 150) {
      profile.learningData.userStyle.preferredLength = 'concise';
    } else if (profile.learningData.userStyle.averageResponseLength < 400) {
      profile.learningData.userStyle.preferredLength = 'detailed';
    } else {
      profile.learningData.userStyle.preferredLength = 'comprehensive';
    }
  }

  /**
   * استخراج الكلمات المفتاحية المتكررة
   */
  private extractKeywords(profile: MentorProfile, content: string): void {
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const wordFreq: Record<string, number> = {};

    words.forEach(word => {
      if (!this.isStopWord(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // أخذ أكثر 20 كلمة تكراراً
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);

    profile.learningData.userStyle.commonKeywords = Array.from(
      new Set([...profile.learningData.userStyle.commonKeywords, ...topWords])
    ).slice(0, 50);
  }

  /**
   * تحديد أنماط المحتوى المفضلة
   */
  private identifyContentPreferences(profile: MentorProfile, content: string): void {
    const featureTypes = [
      { keyword: 'metric', type: 'metrics-focused' },
      { keyword: 'user', type: 'user-centric' },
      { keyword: 'technical', type: 'technical' },
      { keyword: 'design', type: 'design-focused' },
      { keyword: 'analytics', type: 'data-driven' },
      { keyword: 'api', type: 'api-focused' },
      { keyword: 'mobile', type: 'mobile-first' },
      { keyword: 'security', type: 'security-conscious' },
    ];

    const contentLower = content.toLowerCase();
    featureTypes.forEach(({ keyword, type }) => {
      const count = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
      if (count > 2) {
        if (!profile.learningData.userStyle.preferredFeatureTypes.includes(type)) {
          profile.learningData.userStyle.preferredFeatureTypes.push(type);
        }
      }
    });
  }

  /**
   * كلمات التوقف (Stop words)
   */
  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one',
      'our', 'out', 'this', 'that', 'with', 'have', 'from', 'they', 'will', 'what', 'been',
    ];
    return stopWords.includes(word);
  }

  /**
   * توليد اقتراحات شخصية
   */
  generateSuggestions(userId: string, context?: string): MentorSuggestion[] {
    const profile = this.getMentorProfile(userId);
    if (!profile || profile.learningData.totalPRDsAnalyzed < 2) {
      return this.getBeginnerSuggestions();
    }

    const suggestions: MentorSuggestion[] = [];

    // اقتراحات بناءً على الأنماط المتعلمة
    suggestions.push(...this.generatePatternBasedSuggestions(profile));

    // اقتراحات بناءً على السياق الحالي
    if (context) {
      suggestions.push(...this.generateContextualSuggestions(profile, context));
    }

    // اقتراحات لتحسين الجودة
    suggestions.push(...this.generateQualityImprovementSuggestions(profile));

    return suggestions.slice(0, 5); // أقصى 5 اقتراحات في وقت واحد
  }

  /**
   * اقتراحات للمبتدئين
   */
  private getBeginnerSuggestions(): MentorSuggestion[] {
    return [
      {
        id: 'beginner-1',
        type: 'best-practice',
        priority: 'high',
        titleEn: 'Add Measurable Metrics',
        titleAr: 'أضف مقاييس قابلة للقياس',
        contentEn: 'Great PRDs include specific, measurable success metrics. Try adding concrete numbers like "reduce load time by 40%" instead of "make it faster".',
        contentAr: 'وثائق PRD الجيدة تتضمن مقاييس محددة وقابلة للقياس. جرب إضافة أرقام محددة مثل "تقليل وقت التحميل بنسبة 40%" بدلاً من "اجعله أسرع".',
        confidence: 95,
        timestamp: new Date(),
        applied: false,
        dismissed: false,
      },
      {
        id: 'beginner-2',
        type: 'template',
        priority: 'medium',
        titleEn: 'Use User Stories Format',
        titleAr: 'استخدم صيغة قصص المستخدم',
        contentEn: 'Try formatting features as: "As a [user], I want to [action], so that [benefit]". This keeps your PRD user-focused.',
        contentAr: 'جرب صياغة الميزات كالتالي: "كـ [مستخدم]، أريد [إجراء]، حتى [فائدة]". هذا يبقي وثيقتك مركزة على المستخدم.',
        confidence: 90,
        timestamp: new Date(),
        applied: false,
        dismissed: false,
      },
    ];
  }

  /**
   * اقتراحات بناءً على الأنماط
   */
  private generatePatternBasedSuggestions(profile: MentorProfile): MentorSuggestion[] {
    const suggestions: MentorSuggestion[] = [];
    const style = profile.learningData.userStyle;

    // اقتراح بناءً على النمط المفضل
    if (style.preferredFeatureTypes.includes('metrics-focused')) {
      suggestions.push({
        id: `pattern-metrics-${Date.now()}`,
        type: 'feature',
        priority: 'medium',
        titleEn: 'Consider A/B Testing',
        titleAr: 'فكر في اختبار A/B',
        contentEn: 'Based on your focus on metrics, consider adding A/B testing capabilities to measure feature impact.',
        contentAr: 'بناءً على تركيزك على المقاييس، فكر في إضافة قدرات اختبار A/B لقياس تأثير الميزات.',
        confidence: 75,
        timestamp: new Date(),
        applied: false,
        dismissed: false,
      });
    }

    if (style.preferredFeatureTypes.includes('user-centric')) {
      suggestions.push({
        id: `pattern-ux-${Date.now()}`,
        type: 'improvement',
        priority: 'high',
        titleEn: 'Add User Feedback Loop',
        titleAr: 'أضف حلقة تغذية راجعة من المستخدمين',
        contentEn: 'Your PRDs show strong user focus. Consider adding a feedback mechanism to continuously improve based on user input.',
        contentAr: 'وثائقك تظهر تركيزاً قوياً على المستخدم. فكر في إضافة آلية تغذية راجعة للتحسين المستمر بناءً على مدخلات المستخدمين.',
        confidence: 80,
        timestamp: new Date(),
        applied: false,
        dismissed: false,
      });
    }

    return suggestions;
  }

  /**
   * اقتراحات سياقية
   */
  private generateContextualSuggestions(
    profile: MentorProfile,
    context: string
  ): MentorSuggestion[] {
    const suggestions: MentorSuggestion[] = [];
    const contextLower = context.toLowerCase();

    // فحص إذا كان السياق يفتقر للمقاييس
    if (!contextLower.includes('metric') && !contextLower.includes('%')) {
      suggestions.push({
        id: `context-metrics-${Date.now()}`,
        type: 'metric',
        priority: 'high',
        titleEn: 'Missing Success Metrics',
        titleAr: 'مقاييس النجاح مفقودة',
        contentEn: 'This section could benefit from specific success metrics. What numbers will you track?',
        contentAr: 'هذا القسم سيستفيد من مقاييس نجاح محددة. ما الأرقام التي ستتابعها؟',
        context,
        confidence: 85,
        timestamp: new Date(),
        applied: false,
        dismissed: false,
      });
    }

    // فحص طول المحتوى
    const wordCount = context.split(/\s+/).length;
    if (wordCount < 50) {
      suggestions.push({
        id: `context-length-${Date.now()}`,
        type: 'improvement',
        priority: 'medium',
        titleEn: 'Expand Details',
        titleAr: 'وسّع التفاصيل',
        contentEn: 'This answer seems brief. Consider adding more context, examples, or technical details.',
        contentAr: 'هذه الإجابة تبدو مختصرة. فكر في إضافة المزيد من السياق أو الأمثلة أو التفاصيل التقنية.',
        context,
        confidence: 70,
        timestamp: new Date(),
        applied: false,
        dismissed: false,
      });
    }

    return suggestions;
  }

  /**
   * اقتراحات لتحسين الجودة
   */
  private generateQualityImprovementSuggestions(profile: MentorProfile): MentorSuggestion[] {
    const suggestions: MentorSuggestion[] = [];

    // اقتراحات بناءً على التاريخ
    if (profile.totalSuggestionsApplied > 0 && profile.helpfulnessRate < 0.5) {
      // المستخدم لا يجد الاقتراحات مفيدة، نقلل من الاقتراحات
      return [];
    }

    return suggestions;
  }

  /**
   * توليد رؤى شخصية
   */
  generateInsights(userId: string): MentorInsight[] {
    const profile = this.getMentorProfile(userId);
    if (!profile || profile.learningData.totalPRDsAnalyzed < 3) {
      return [];
    }

    const insights: MentorInsight[] = [];
    const style = profile.learningData.userStyle;

    // رؤية حول النمط
    insights.push({
      id: `insight-style-${Date.now()}`,
      titleEn: 'Your Writing Style',
      titleAr: 'أسلوبك في الكتابة',
      descriptionEn: `You tend to write ${style.preferredLength} PRDs with an average of ${Math.round(style.averageResponseLength)} words. This is great for ${style.preferredLength === 'comprehensive' ? 'detailed technical documentation' : 'quick iterations'}.`,
      descriptionAr: `تميل إلى كتابة وثائق ${style.preferredLength === 'concise' ? 'مختصرة' : style.preferredLength === 'detailed' ? 'مفصلة' : 'شاملة'} بمتوسط ${Math.round(style.averageResponseLength)} كلمة. هذا رائع لـ ${style.preferredLength === 'comprehensive' ? 'التوثيق التقني المفصل' : 'التكرارات السريعة'}.`,
      category: 'strength',
      timestamp: new Date(),
    });

    // رؤية حول المجالات المفضلة
    if (style.preferredFeatureTypes.length > 0) {
      insights.push({
        id: `insight-focus-${Date.now()}`,
        titleEn: 'Your Focus Areas',
        titleAr: 'مجالات تركيزك',
        descriptionEn: `You consistently focus on: ${style.preferredFeatureTypes.slice(0, 3).join(', ')}. This shows strong domain expertise.`,
        descriptionAr: `تركز باستمرار على: ${style.preferredFeatureTypes.slice(0, 3).join('، ')}. هذا يظهر خبرة قوية في المجال.`,
        category: 'strength',
        timestamp: new Date(),
      });
    }

    return insights;
  }

  /**
   * تسجيل تطبيق اقتراح
   */
  applySuggestion(userId: string, suggestionId: string): void {
    const profile = this.getMentorProfile(userId);
    if (!profile) return;

    const suggestion = profile.suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      suggestion.applied = true;
      profile.totalSuggestionsApplied += 1;
      this.updateHelpfulnessRate(profile);
      this.saveMentorProfile(profile);
    }
  }

  /**
   * رفض اقتراح
   */
  dismissSuggestion(userId: string, suggestionId: string): void {
    const profile = this.getMentorProfile(userId);
    if (!profile) return;

    const suggestion = profile.suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      suggestion.dismissed = true;
      profile.totalSuggestionsDismissed += 1;
      this.updateHelpfulnessRate(profile);
      this.saveMentorProfile(profile);
    }
  }

  /**
   * تقييم اقتراح
   */
  rateSuggestion(userId: string, suggestionId: string, helpful: boolean, feedback?: string): void {
    const profile = this.getMentorProfile(userId);
    if (!profile) return;

    const suggestion = profile.suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      suggestion.helpful = helpful;

      profile.feedbackHistory.push({
        suggestionId,
        helpful,
        feedback,
        timestamp: new Date(),
      });

      this.updateHelpfulnessRate(profile);
      this.saveMentorProfile(profile);
    }
  }

  /**
   * تحديث معدل الفائدة
   */
  private updateHelpfulnessRate(profile: MentorProfile): void {
    const ratedSuggestions = profile.suggestions.filter(s => s.helpful !== undefined);
    if (ratedSuggestions.length === 0) return;

    const helpfulCount = ratedSuggestions.filter(s => s.helpful === true).length;
    profile.helpfulnessRate = helpfulCount / ratedSuggestions.length;
  }

  /**
   * حفظ ملف المستخدم
   */
  private saveMentorProfile(profile: MentorProfile): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
  }

  /**
   * جلب ملف المستخدم
   */
  getMentorProfile(userId: string): MentorProfile | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return this.initializeMentorProfile(userId);

    try {
      const profile: MentorProfile = JSON.parse(data);
      if (profile.userId !== userId) {
        return this.initializeMentorProfile(userId);
      }
      return profile;
    } catch {
      return null;
    }
  }

  /**
   * مسح البيانات (للاختبار)
   */
  clearProfile(userId: string): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeMentorProfile(userId);
  }
}

export default MentorService.getInstance();
