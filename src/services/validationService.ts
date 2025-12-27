/**
 * Section 7: Validation Service
 * خدمة التحقق والتنبيهات الذكية
 */

import {
  ValidationRule,
  ValidationResult,
  ValidationContext,
  ValidatorConfig,
  ValidationState,
  ValidationStats,
  ValidationType,
  ValidationSeverity
} from '../types/validation.types';

/**
 * قواعد التحقق الافتراضية
 */
const DEFAULT_RULES: ValidationRule[] = [
  // قاعدة طول النص
  {
    id: 'min-length',
    type: 'length',
    severity: 'warning',
    minLength: 20,
    message: {
      en: 'Your answer is too short, add more details',
      ar: 'إجابتك قصيرة جداً، أضف المزيد من التفاصيل'
    },
    suggestion: {
      en: 'Try to provide at least 2-3 sentences with specific examples',
      ar: 'حاول تقديم جملتين أو ثلاث على الأقل مع أمثلة محددة'
    }
  },
  // قاعدة التحديد والوضوح
  {
    id: 'vague-content',
    type: 'specificity',
    severity: 'warning',
    keywords: ['something', 'anything', 'maybe', 'probably', 'kind of', 'sort of', 'شيء', 'ربما', 'نوعاً ما'],
    message: {
      en: 'This feature seems vague, be specific',
      ar: 'هذه الميزة تبدو غامضة، كن أكثر تحديداً'
    },
    suggestion: {
      en: 'Replace vague terms with concrete examples and specific requirements',
      ar: 'استبدل المصطلحات الغامضة بأمثلة ملموسة ومتطلبات محددة'
    }
  },
  // قاعدة القياس
  {
    id: 'measurable-metrics',
    type: 'measurability',
    severity: 'success',
    keywords: ['%', 'percent', 'increase', 'decrease', 'reduce', 'improve', 'metric', 'KPI', 'measure', 'track', 'نسبة', 'زيادة', 'تقليل', 'تحسين', 'قياس'],
    message: {
      en: 'Great! This metric is measurable',
      ar: 'رائع! هذا المقياس قابل للقياس'
    },
    suggestion: {
      en: 'Consider adding specific targets (e.g., "reduce by 40%")',
      ar: 'فكر في إضافة أهداف محددة (مثل: "تقليل بنسبة 40%")'
    }
  },
  // قاعدة الاكتمال
  {
    id: 'complete-answer',
    type: 'completeness',
    severity: 'info',
    minLength: 50,
    keywords: ['who', 'what', 'when', 'where', 'why', 'how', 'من', 'ماذا', 'متى', 'أين', 'لماذا', 'كيف'],
    message: {
      en: 'Good progress! Consider covering the 5 W\'s (Who, What, When, Where, Why)',
      ar: 'تقدم جيد! فكر في تغطية الأسئلة الخمسة (من، ماذا، متى، أين، لماذا)'
    }
  },
  // قاعدة الوضوح
  {
    id: 'clarity-check',
    type: 'clarity',
    severity: 'info',
    customValidator: (value: string) => {
      // تحقق من عدم استخدام جمل معقدة جداً
      const sentences = value.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const avgWordsPerSentence = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
      return avgWordsPerSentence < 30; // جمل واضحة
    },
    message: {
      en: 'Your answer is clear and concise',
      ar: 'إجابتك واضحة وموجزة'
    },
    suggestion: {
      en: 'Try breaking long sentences into shorter ones for better readability',
      ar: 'حاول تقسيم الجمل الطويلة إلى جمل أقصر لتحسين القراءة'
    }
  }
];

/**
 * الإعدادات الافتراضية
 */
const DEFAULT_CONFIG: ValidatorConfig = {
  enabled: true,
  realtime: true,
  debounceMs: 500,
  showSuggestions: true,
  autoCorrect: false,
  strictMode: false,
  rules: DEFAULT_RULES
};

/**
 * خدمة التحقق الذكية
 */
class ValidationService {
  private config: ValidatorConfig;
  private stats: ValidationStats;
  private debounceTimers: Map<string, NodeJS.Timeout>;

  constructor(config?: Partial<ValidatorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      totalValidations: 0,
      passedValidations: 0,
      failedValidations: 0,
      averageScore: 0,
      mostCommonIssues: []
    };
    this.debounceTimers = new Map();
  }

  /**
   * تحديث الإعدادات
   */
  updateConfig(config: Partial<ValidatorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * الحصول على الإعدادات الحالية
   */
  getConfig(): ValidatorConfig {
    return { ...this.config };
  }

  /**
   * التحقق من قيمة
   */
  async validate(context: ValidationContext): Promise<ValidationResult[]> {
    if (!this.config.enabled) {
      return [];
    }

    const results: ValidationResult[] = [];

    for (const rule of this.config.rules) {
      const result = this.applyRule(rule, context);
      if (result) {
        results.push(result);
      }
    }

    // تحديث الإحصائيات
    this.updateStats(results);

    return results;
  }

  /**
   * التحقق مع تأخير (debounce)
   */
  validateDebounced(
    context: ValidationContext,
    callback: (results: ValidationResult[]) => void
  ): void {
    const key = context.fieldName;

    // إلغاء المؤقت السابق
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!);
    }

    // إنشاء مؤقت جديد
    const timer = setTimeout(async () => {
      const results = await this.validate(context);
      callback(results);
      this.debounceTimers.delete(key);
    }, this.config.debounceMs);

    this.debounceTimers.set(key, timer);
  }

  /**
   * تطبيق قاعدة تحقق
   */
  private applyRule(
    rule: ValidationRule,
    context: ValidationContext
  ): ValidationResult | null {
    const { value, language } = context;
    const message = rule.message[language] || rule.message.en;
    const suggestion = rule.suggestion?.[language] || rule.suggestion?.en;

    let isValid = true;
    let score = 100;

    switch (rule.type) {
      case 'length':
        if (rule.minLength && value.length < rule.minLength) {
          isValid = false;
          score = Math.round((value.length / rule.minLength) * 100);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          isValid = false;
          score = Math.max(0, 100 - ((value.length - rule.maxLength) / rule.maxLength) * 100);
        }
        break;

      case 'specificity':
        if (rule.keywords) {
          const hasVagueTerms = rule.keywords.some(keyword =>
            value.toLowerCase().includes(keyword.toLowerCase())
          );
          if (hasVagueTerms) {
            isValid = false;
            score = 60;
          }
        }
        break;

      case 'measurability':
        if (rule.keywords) {
          const hasMeasurableTerms = rule.keywords.some(keyword =>
            value.toLowerCase().includes(keyword.toLowerCase())
          );
          if (hasMeasurableTerms) {
            isValid = true;
            score = 100;
          } else {
            return null; // لا تُظهر رسالة إذا لم تكن هناك مقاييس
          }
        }
        break;

      case 'completeness':
      case 'clarity':
        if (rule.customValidator) {
          isValid = rule.customValidator(value);
          score = isValid ? 100 : 70;
        }
        break;

      default:
        return null;
    }

    // إرجاع النتيجة فقط إذا كانت ذات صلة
    if (rule.severity === 'success' && !isValid) {
      return null;
    }
    if (rule.severity !== 'success' && isValid && rule.type !== 'completeness' && rule.type !== 'clarity') {
      return null;
    }

    return {
      isValid,
      severity: rule.severity,
      message,
      suggestion,
      rule,
      score
    };
  }

  /**
   * حساب النقاط الإجمالية
   */
  calculateOverallScore(results: ValidationResult[]): number {
    if (results.length === 0) return 100;

    const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
    return Math.round(totalScore / results.length);
  }

  /**
   * تحديث الإحصائيات
   */
  private updateStats(results: ValidationResult[]): void {
    this.stats.totalValidations++;

    const hasErrors = results.some(r => r.severity === 'error');
    const hasWarnings = results.some(r => r.severity === 'warning');

    if (!hasErrors && !hasWarnings) {
      this.stats.passedValidations++;
    } else {
      this.stats.failedValidations++;
    }

    // تحديث متوسط النقاط
    const currentScore = this.calculateOverallScore(results);
    this.stats.averageScore = Math.round(
      (this.stats.averageScore * (this.stats.totalValidations - 1) + currentScore) /
      this.stats.totalValidations
    );

    // تحديث المشاكل الأكثر شيوعاً
    results.forEach(result => {
      if (!result.isValid) {
        const existing = this.stats.mostCommonIssues.find(i => i.type === result.rule.type);
        if (existing) {
          existing.count++;
        } else {
          this.stats.mostCommonIssues.push({
            type: result.rule.type,
            count: 1
          });
        }
      }
    });

    // ترتيب حسب الأكثر شيوعاً
    this.stats.mostCommonIssues.sort((a, b) => b.count - a.count);
  }

  /**
   * الحصول على الإحصائيات
   */
  getStats(): ValidationStats {
    return { ...this.stats };
  }

  /**
   * إعادة تعيين الإحصائيات
   */
  resetStats(): void {
    this.stats = {
      totalValidations: 0,
      passedValidations: 0,
      failedValidations: 0,
      averageScore: 0,
      mostCommonIssues: []
    };
  }

  /**
   * إضافة قاعدة جديدة
   */
  addRule(rule: ValidationRule): void {
    this.config.rules.push(rule);
  }

  /**
   * إزالة قاعدة
   */
  removeRule(ruleId: string): void {
    this.config.rules = this.config.rules.filter(r => r.id !== ruleId);
  }

  /**
   * تفعيل/تعطيل قاعدة
   */
  toggleRule(ruleId: string, enabled: boolean): void {
    // يمكن إضافة خاصية enabled للقاعدة إذا لزم الأمر
  }
}

// Singleton instance
export const validationService = new ValidationService();

// Export class for testing
export { ValidationService };
