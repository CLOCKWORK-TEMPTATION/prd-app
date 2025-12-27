/**
 * Section 7: Smart Validator Component
 * مكون التحقق الذكي والتنبيهات
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { validationService } from '../services/validationService';
import {
  ValidationResult,
  ValidationContext,
  ValidationState,
  ValidationSeverity
} from '../types/validation.types';

/**
 * خصائص المكون
 */
interface SmartValidatorProps {
  fieldName: string;
  value: string;
  language?: 'en' | 'ar';
  fieldType?: 'text' | 'textarea' | 'rich-text';
  showScore?: boolean;
  showSuggestions?: boolean;
  realtime?: boolean;
  className?: string;
  onValidationChange?: (results: ValidationResult[], score: number) => void;
}

/**
 * أيقونة حسب مستوى الخطورة
 */
const getSeverityIcon = (severity: ValidationSeverity) => {
  switch (severity) {
    case 'error':
      return <XCircle className="w-4 h-4" />;
    case 'warning':
      return <AlertCircle className="w-4 h-4" />;
    case 'success':
      return <CheckCircle className="w-4 h-4" />;
    case 'info':
    default:
      return <Info className="w-4 h-4" />;
  }
};

/**
 * ألوان حسب مستوى الخطورة
 */
const getSeverityColors = (severity: ValidationSeverity) => {
  switch (severity) {
    case 'error':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-300 dark:border-red-700',
        text: 'text-red-800 dark:text-red-200',
        icon: 'text-red-500'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-300 dark:border-yellow-700',
        text: 'text-yellow-800 dark:text-yellow-200',
        icon: 'text-yellow-500'
      };
    case 'success':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-300 dark:border-green-700',
        text: 'text-green-800 dark:text-green-200',
        icon: 'text-green-500'
      };
    case 'info':
    default:
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-300 dark:border-blue-700',
        text: 'text-blue-800 dark:text-blue-200',
        icon: 'text-blue-500'
      };
  }
};

/**
 * مكون التحقق الذكي
 */
export const SmartValidator: React.FC<SmartValidatorProps> = ({
  fieldName,
  value,
  language = 'en',
  fieldType = 'textarea',
  showScore = true,
  showSuggestions = true,
  realtime = true,
  className = '',
  onValidationChange
}) => {
  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    results: [],
    overallScore: 100,
    lastValidated: null
  });

  /**
   * تنفيذ التحقق
   */
  const performValidation = useCallback(async () => {
    if (!value || value.trim().length === 0) {
      setState({
        isValidating: false,
        results: [],
        overallScore: 100,
        lastValidated: null
      });
      return;
    }

    setState(prev => ({ ...prev, isValidating: true }));

    const context: ValidationContext = {
      fieldName,
      fieldType,
      value,
      language
    };

    try {
      const results = await validationService.validate(context);
      const overallScore = validationService.calculateOverallScore(results);

      setState({
        isValidating: false,
        results,
        overallScore,
        lastValidated: new Date()
      });

      // استدعاء callback إذا كان موجوداً
      if (onValidationChange) {
        onValidationChange(results, overallScore);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setState(prev => ({ ...prev, isValidating: false }));
    }
  }, [fieldName, fieldType, value, language, onValidationChange]);

  /**
   * التحقق مع debounce
   */
  useEffect(() => {
    if (!realtime) return;

    validationService.validateDebounced(
      {
        fieldName,
        fieldType,
        value,
        language
      },
      (results) => {
        const overallScore = validationService.calculateOverallScore(results);
        setState({
          isValidating: false,
          results,
          overallScore,
          lastValidated: new Date()
        });

        if (onValidationChange) {
          onValidationChange(results, overallScore);
        }
      }
    );
  }, [value, fieldName, fieldType, language, realtime, onValidationChange]);

  /**
   * لون شريط النقاط
   */
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  /**
   * نص النقاط
   */
  const getScoreText = (score: number) => {
    if (score >= 90) return language === 'ar' ? 'ممتاز' : 'Excellent';
    if (score >= 80) return language === 'ar' ? 'جيد جداً' : 'Very Good';
    if (score >= 70) return language === 'ar' ? 'جيد' : 'Good';
    if (score >= 60) return language === 'ar' ? 'مقبول' : 'Fair';
    return language === 'ar' ? 'يحتاج تحسين' : 'Needs Improvement';
  };

  // عدم إظهار أي شيء إذا لم تكن هناك نتائج
  if (state.results.length === 0 && !showScore) {
    return null;
  }

  return (
    <div className={`smart-validator space-y-3 ${className}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* شريط النقاط */}
      {showScore && value.trim().length > 0 && (
        <div className="score-indicator">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'ar' ? 'جودة الإجابة' : 'Answer Quality'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {state.overallScore}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getScoreText(state.overallScore)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${getScoreColor(state.overallScore)}`}
              style={{ width: `${state.overallScore}%` }}
            />
          </div>
        </div>
      )}

      {/* التنبيهات */}
      {state.results.length > 0 && (
        <div className="validation-results space-y-2">
          {state.results.map((result, index) => {
            const colors = getSeverityColors(result.severity);

            return (
              <div
                key={`${result.rule.id}-${index}`}
                className={`
                  validation-alert p-3 rounded-lg border
                  ${colors.bg} ${colors.border}
                  transition-all duration-300 ease-in-out
                  animate-fade-in
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={colors.icon}>
                    {getSeverityIcon(result.severity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${colors.text}`}>
                      {result.message}
                    </p>

                    {/* الاقتراح */}
                    {showSuggestions && result.suggestion && (
                      <div className="mt-2 flex items-start gap-2">
                        <Lightbulb className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${colors.icon}`} />
                        <p className={`text-xs ${colors.text} opacity-90`}>
                          {result.suggestion}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* النقاط */}
                  {result.score !== undefined && (
                    <div className={`text-xs font-semibold ${colors.text} whitespace-nowrap`}>
                      {result.score}%
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* مؤشر التحميل */}
      {state.isValidating && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500" />
          <span>{language === 'ar' ? 'جاري التحقق...' : 'Validating...'}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Styles مضمنة (يمكن نقلها إلى ملف CSS منفصل)
 */
const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;

// إضافة الـ styles للصفحة
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default SmartValidator;
