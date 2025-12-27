/**
 * Section 7: Validation & Smart Hints Types
 * نظام التحقق والتنبيهات الذكية
 */

/**
 * مستوى خطورة التنبيه
 */
export type ValidationSeverity = 'error' | 'warning' | 'info' | 'success';

/**
 * نوع التحقق
 */
export type ValidationType =
  | 'length'           // طول النص
  | 'specificity'      // مستوى التفصيل
  | 'clarity'          // الوضوح
  | 'measurability'    // قابلية القياس
  | 'completeness'     // الاكتمال
  | 'grammar'          // القواعد اللغوية
  | 'structure';       // البنية

/**
 * قاعدة التحقق
 */
export interface ValidationRule {
  id: string;
  type: ValidationType;
  severity: ValidationSeverity;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  keywords?: string[];
  customValidator?: (value: string) => boolean;
  message: {
    en: string;
    ar: string;
  };
  suggestion?: {
    en: string;
    ar: string;
  };
}

/**
 * نتيجة التحقق
 */
export interface ValidationResult {
  isValid: boolean;
  severity: ValidationSeverity;
  message: string;
  suggestion?: string;
  rule: ValidationRule;
  score?: number; // من 0 إلى 100
}

/**
 * سياق التحقق
 */
export interface ValidationContext {
  fieldName: string;
  fieldType: 'text' | 'textarea' | 'rich-text';
  value: string;
  language: 'en' | 'ar';
  previousValue?: string;
  metadata?: Record<string, any>;
}

/**
 * إعدادات المحقق
 */
export interface ValidatorConfig {
  enabled: boolean;
  realtime: boolean;      // تحقق فوري أثناء الكتابة
  debounceMs: number;     // تأخير قبل التحقق (بالميلي ثانية)
  showSuggestions: boolean;
  autoCorrect: boolean;   // تصحيح تلقائي
  strictMode: boolean;    // وضع صارم
  rules: ValidationRule[];
}

/**
 * حالة التحقق
 */
export interface ValidationState {
  isValidating: boolean;
  results: ValidationResult[];
  overallScore: number;   // من 0 إلى 100
  lastValidated: Date | null;
}

/**
 * حدث التحقق
 */
export interface ValidationEvent {
  context: ValidationContext;
  results: ValidationResult[];
  timestamp: Date;
  triggeredBy: 'user' | 'auto' | 'manual';
}

/**
 * إحصائيات التحقق
 */
export interface ValidationStats {
  totalValidations: number;
  passedValidations: number;
  failedValidations: number;
  averageScore: number;
  mostCommonIssues: {
    type: ValidationType;
    count: number;
  }[];
}
