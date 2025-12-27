/**
 * خدمة تقييم جودة PRD - Section 9
 * تحسب النتائج والتقييمات بناءً على محتوى PRD
 */

import {
  QualityScore,
  QualityDimension,
  QualityBadge,
  QualityScoringConfig,
  DEFAULT_QUALITY_CONFIG,
} from '../types/quality';

export class ScoringService {
  private static instance: ScoringService;
  private config: QualityScoringConfig;

  private constructor() {
    this.config = DEFAULT_QUALITY_CONFIG;
  }

  public static getInstance(): ScoringService {
    if (!ScoringService.instance) {
      ScoringService.instance = new ScoringService();
    }
    return ScoringService.instance;
  }

  /**
   * تقييم جودة PRD
   */
  public evaluatePRD(prdContent: string): QualityScore {
    const clarity = this.evaluateClarity(prdContent);
    const completeness = this.evaluateCompleteness(prdContent);
    const specificity = this.evaluateSpecificity(prdContent);
    const measurability = this.evaluateMeasurability(prdContent);
    const feasibility = this.evaluateFeasibility(prdContent);

    // حساب النتيجة الإجمالية بناءً على الأوزان
    const overall = Math.round(
      clarity.score * clarity.weight +
      completeness.score * completeness.weight +
      specificity.score * specificity.weight +
      measurability.score * measurability.weight +
      feasibility.score * feasibility.weight
    );

    const badge = this.determineBadge(overall);
    const suggestions = this.generateSuggestions({
      clarity,
      completeness,
      specificity,
      measurability,
      feasibility,
    });
    const strengths = this.identifyStrengths({
      clarity,
      completeness,
      specificity,
      measurability,
      feasibility,
    });

    return {
      overall,
      badge,
      dimensions: {
        clarity,
        completeness,
        specificity,
        measurability,
        feasibility,
      },
      suggestions,
      strengths,
      timestamp: new Date(),
    };
  }

  /**
   * تقييم الوضوح (Clarity)
   */
  private evaluateClarity(content: string): QualityDimension {
    let score = 0;
    const maxScore = 100;
    const weight = 0.25;

    // معايير الوضوح
    const hasTitle = /^#\s+.+/m.test(content) || content.length > 50;
    const hasStructure = content.split('\n\n').length > 3;
    const hasClearSections = /##\s+/g.test(content);
    const hasGoodLength = content.length >= 200 && content.length <= 5000;
    const hasNoClichés = !/(synergy|leverage|paradigm shift|circle back)/i.test(content);

    if (hasTitle) score += 20;
    if (hasStructure) score += 25;
    if (hasClearSections) score += 25;
    if (hasGoodLength) score += 20;
    if (hasNoClichés) score += 10;

    const feedback = score >= 80
      ? 'Excellent clarity! Your PRD is well-structured and easy to understand.'
      : score >= 60
      ? 'Good clarity, but could be improved with better structure.'
      : 'Needs improvement. Add clear sections and more structure.';

    return { name: 'Clarity', score, maxScore, weight, feedback };
  }

  /**
   * تقييم الاكتمال (Completeness)
   */
  private evaluateCompleteness(content: string): QualityDimension {
    let score = 0;
    const maxScore = 100;
    const weight = 0.25;

    // معايير الاكتمال
    const hasProblemStatement = /(problem|challenge|issue|pain point)/i.test(content);
    const hasSolution = /(solution|approach|feature|functionality)/i.test(content);
    const hasTargetUsers = /(user|customer|audience|target)/i.test(content);
    const hasSuccess = /(success|metric|KPI|measure|goal)/i.test(content);
    const hasTimeline = /(timeline|schedule|phase|milestone|deadline)/i.test(content);
    const hasFeatures = content.split(/feature|functionality/i).length > 2;

    if (hasProblemStatement) score += 20;
    if (hasSolution) score += 20;
    if (hasTargetUsers) score += 20;
    if (hasSuccess) score += 20;
    if (hasTimeline) score += 10;
    if (hasFeatures) score += 10;

    const feedback = score >= 80
      ? 'Comprehensive PRD with all essential elements!'
      : score >= 60
      ? 'Most key elements present, but some sections could be expanded.'
      : 'Missing critical information. Add problem statement, solution, and success metrics.';

    return { name: 'Completeness', score, maxScore, weight, feedback };
  }

  /**
   * تقييم التحديد (Specificity)
   */
  private evaluateSpecificity(content: string): QualityDimension {
    let score = 0;
    const maxScore = 100;
    const weight = 0.2;

    // معايير التحديد
    const hasNumbers = /\d+%?/g.test(content);
    const hasExamples = /(example|for instance|such as|like)/i.test(content);
    const hasDetails = content.length > 500;
    const hasNoVagueness = !/(maybe|perhaps|might|could possibly|somewhat)/i.test(content);
    const hasConcreteFeatures = /(button|screen|dashboard|form|list|table|chart)/i.test(content);

    if (hasNumbers) score += 25;
    if (hasExamples) score += 20;
    if (hasDetails) score += 20;
    if (hasNoVagueness) score += 20;
    if (hasConcreteFeatures) score += 15;

    const feedback = score >= 80
      ? 'Highly specific with concrete details and examples!'
      : score >= 60
      ? 'Good level of detail, but could be more specific in some areas.'
      : 'Too vague. Add specific numbers, examples, and concrete features.';

    return { name: 'Specificity', score, maxScore, weight, feedback };
  }

  /**
   * تقييم القابلية للقياس (Measurability)
   */
  private evaluateMeasurability(content: string): QualityDimension {
    let score = 0;
    const maxScore = 100;
    const weight = 0.15;

    // معايير القابلية للقياس
    const hasMetrics = /(metric|KPI|measure|track|analytics)/i.test(content);
    const hasPercentages = /\d+%/g.test(content);
    const hasTargetNumbers = /\d+\s*(users|customers|increase|decrease|growth)/i.test(content);
    const hasSuccessCriteria = /(success|achieve|goal|target|objective)/i.test(content);
    const hasTimebound = /(week|month|quarter|year|day)/i.test(content);

    if (hasMetrics) score += 30;
    if (hasPercentages) score += 25;
    if (hasTargetNumbers) score += 20;
    if (hasSuccessCriteria) score += 15;
    if (hasTimebound) score += 10;

    const feedback = score >= 80
      ? 'Excellent! Clear, measurable success criteria defined.'
      : score >= 60
      ? 'Has some metrics, but could define more specific KPIs.'
      : 'Lacks measurable goals. Add specific metrics and success criteria.';

    return { name: 'Measurability', score, maxScore, weight, feedback };
  }

  /**
   * تقييم الجدوى (Feasibility)
   */
  private evaluateFeasibility(content: string): QualityDimension {
    let score = 0;
    const maxScore = 100;
    const weight = 0.15;

    // معايير الجدوى
    const hasRealisticScope = content.length < 3000; // ليس طموحاً جداً
    const hasTechnicalDetails = /(API|database|frontend|backend|technology|stack)/i.test(content);
    const hasConstraints = /(constraint|limitation|budget|resource|timeline)/i.test(content);
    const hasPhases = /(phase|MVP|iteration|version|stage)/i.test(content);
    const noUnrealistic = !/(AI that thinks|revolutionary|disrupting everything)/i.test(content);

    if (hasRealisticScope) score += 20;
    if (hasTechnicalDetails) score += 25;
    if (hasConstraints) score += 20;
    if (hasPhases) score += 20;
    if (noUnrealistic) score += 15;

    const feedback = score >= 80
      ? 'Realistic and well-scoped project!'
      : score >= 60
      ? 'Mostly feasible, but consider constraints and phases more carefully.'
      : 'May be too ambitious. Break down into smaller phases and add constraints.';

    return { name: 'Feasibility', score, maxScore, weight, feedback };
  }

  /**
   * تحديد الشارة بناءً على النتيجة
   */
  private determineBadge(score: number): QualityBadge {
    if (score >= 90) return 'platinum';
    if (score >= this.config.minScoreForGold) return 'gold';
    if (score >= this.config.minScoreForSilver) return 'silver';
    if (score >= this.config.minScoreForBronze) return 'bronze';
    return 'bronze';
  }

  /**
   * توليد اقتراحات للتحسين
   */
  private generateSuggestions(dimensions: {
    clarity: QualityDimension;
    completeness: QualityDimension;
    specificity: QualityDimension;
    measurability: QualityDimension;
    feasibility: QualityDimension;
  }): string[] {
    const suggestions: string[] = [];

    if (dimensions.clarity.score < 70) {
      suggestions.push('📝 Add clear section headings (## Problem, ## Solution, ## Success Metrics)');
      suggestions.push('🎯 Start with a concise one-sentence description of your product');
    }

    if (dimensions.completeness.score < 70) {
      suggestions.push('✅ Include all essential sections: Problem, Target Users, Solution, Success Metrics');
      suggestions.push('📊 Add a timeline or roadmap section');
    }

    if (dimensions.specificity.score < 70) {
      suggestions.push('🔢 Add specific numbers and percentages (e.g., "reduce loading time by 40%")');
      suggestions.push('💡 Provide concrete examples for each feature');
    }

    if (dimensions.measurability.score < 70) {
      suggestions.push('📈 Define clear KPIs (e.g., "80% user retention after 30 days")');
      suggestions.push('⏱️ Add time-bound goals (e.g., "achieve 1000 users in 3 months")');
    }

    if (dimensions.feasibility.score < 70) {
      suggestions.push('🎯 Break down the project into MVP and future phases');
      suggestions.push('⚠️ Add a section on constraints (budget, timeline, technical limitations)');
    }

    return suggestions;
  }

  /**
   * تحديد نقاط القوة
   */
  private identifyStrengths(dimensions: {
    clarity: QualityDimension;
    completeness: QualityDimension;
    specificity: QualityDimension;
    measurability: QualityDimension;
    feasibility: QualityDimension;
  }): string[] {
    const strengths: string[] = [];

    if (dimensions.clarity.score >= 80) {
      strengths.push('✨ Excellent clarity and structure');
    }

    if (dimensions.completeness.score >= 80) {
      strengths.push('✅ Comprehensive coverage of all key aspects');
    }

    if (dimensions.specificity.score >= 80) {
      strengths.push('🎯 Highly specific with concrete details');
    }

    if (dimensions.measurability.score >= 80) {
      strengths.push('📊 Well-defined success metrics');
    }

    if (dimensions.feasibility.score >= 80) {
      strengths.push('🚀 Realistic and well-scoped');
    }

    return strengths;
  }
}

export default ScoringService.getInstance();
