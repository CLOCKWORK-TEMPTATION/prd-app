/**
 * ValidationService Tests
 * Critical path testing for validation and smart alerts functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ValidationService, validationService } from '../services/validationService';
import { ValidationContext, ValidationRule, ValidationSeverity } from '../types/validation.types';
import { createMockValidationContext, generateTestPRD } from './test-utils';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    service = new ValidationService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default configuration', () => {
      const config = service.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.realtime).toBe(true);
      expect(config.debounceMs).toBe(500);
      expect(config.showSuggestions).toBe(true);
      expect(config.autoCorrect).toBe(false);
      expect(config.strictMode).toBe(false);
      expect(config.rules).toBeDefined();
      expect(config.rules.length).toBeGreaterThan(0);
    });

    it('should accept custom configuration', () => {
      const customService = new ValidationService({
        enabled: false,
        debounceMs: 1000,
        strictMode: true
      });
      
      const config = customService.getConfig();
      expect(config.enabled).toBe(false);
      expect(config.debounceMs).toBe(1000);
      expect(config.strictMode).toBe(true);
    });

    it('should update configuration', () => {
      service.updateConfig({ enabled: false, debounceMs: 750 });
      const config = service.getConfig();
      expect(config.enabled).toBe(false);
      expect(config.debounceMs).toBe(750);
    });
  });

  describe('Length Validation', () => {
    it('should validate minimum length requirements', async () => {
      const context: ValidationContext = {
        fieldName: 'description',
        fieldType: 'textarea',
        value: 'short',
        language: 'en'
      };

      const results = await service.validate(context);
      const lengthValidation = results.find(r => r.rule.type === 'length');
      
      expect(lengthValidation).toBeDefined();
      expect(lengthValidation?.isValid).toBe(false);
      expect(lengthValidation?.severity).toBe('warning');
      expect(lengthValidation?.score).toBeLessThan(100);
    });

    it('should pass length validation for sufficient content', async () => {
      const context: ValidationContext = {
        fieldName: 'description',
        fieldType: 'textarea',
        value: 'This is a comprehensive description that meets the minimum length requirement',
        language: 'en'
      };

      const results = await service.validate(context);
      const lengthValidation = results.find(r => r.rule.type === 'length');
      
      expect(lengthValidation).toBeUndefined(); // Should not return validation if passed
    });
  });

  describe('Specificity Validation', () => {
    it('should detect vague terms in English', async () => {
      const context: ValidationContext = {
        fieldName: 'feature',
        fieldType: 'textarea',
        value: 'We should add something to help users with anything they might need',
        language: 'en'
      };

      const results = await service.validate(context);
      const specificityValidation = results.find(r => r.rule.type === 'specificity');
      
      expect(specificityValidation).toBeDefined();
      expect(specificityValidation?.isValid).toBe(false);
      expect(specificityValidation?.severity).toBe('warning');
    });

    it('should detect vague terms in Arabic', async () => {
      const context: ValidationContext = {
        fieldName: 'feature',
        fieldType: 'textarea',
        value: 'نحتاج إلى إضافة شيء لمساعدة المستخدمين في أي شيء قد يحتاجونه',
        language: 'ar'
      };

      const results = await service.validate(context);
      const specificityValidation = results.find(r => r.rule.type === 'specificity');
      
      expect(specificityValidation).toBeDefined();
      expect(specificityValidation?.isValid).toBe(false);
    });

    it('should pass specificity validation for specific content', async () => {
      const context: ValidationContext = {
        fieldName: 'feature',
        fieldType: 'textarea',
        value: 'Implement a drag-and-drop task scheduler with color-coded priority levels',
        language: 'en'
      };

      const results = await service.validate(context);
      const specificityValidation = results.find(r => r.rule.type === 'specificity');
      
      expect(specificityValidation).toBeUndefined(); // Should not return validation if passed
    });
  });

  describe('Measurability Validation', () => {
    it('should detect measurable terms', async () => {
      const context: ValidationContext = {
        fieldName: 'metric',
        fieldType: 'textarea',
        value: 'Increase user engagement by 25% and reduce bounce rate by 15%',
        language: 'en'
      };

      const results = await service.validate(context);
      const measurabilityValidation = results.find(r => r.rule.type === 'measurability');
      
      expect(measurabilityValidation).toBeDefined();
      expect(measurabilityValidation?.isValid).toBe(true);
      expect(measurabilityValidation?.severity).toBe('success');
    });

    it('should not return validation for non-measurable content', async () => {
      const context: ValidationContext = {
        fieldName: 'description',
        fieldType: 'textarea',
        value: 'This feature will improve user experience',
        language: 'en'
      };

      const results = await service.validate(context);
      const measurabilityValidation = results.find(r => r.rule.type === 'measurability');
      
      expect(measurabilityValidation).toBeUndefined();
    });
  });

  describe('Completeness Validation', () => {
    it('should validate completeness with 5 Ws', async () => {
      const context: ValidationContext = {
        fieldName: 'description',
        fieldType: 'textarea',
        value: 'Who are our users? What do they need? When should we deliver? Where will it be used? Why is it important?',
        language: 'en'
      };

      const results = await service.validate(context);
      const completenessValidation = results.find(r => r.rule.type === 'completeness');
      
      expect(completenessValidation).toBeDefined();
      expect(completenessValidation?.severity).toBe('info');
    });
  });

  describe('Clarity Validation', () => {
    it('should validate sentence clarity', async () => {
      const context: ValidationContext = {
        fieldName: 'description',
        fieldType: 'textarea',
        value: 'This is a clear sentence. Another clear point. Final clear statement.',
        language: 'en'
      };

      const results = await service.validate(context);
      const clarityValidation = results.find(r => r.rule.type === 'clarity');
      
      expect(clarityValidation).toBeDefined();
      expect(clarityValidation?.isValid).toBe(true);
      expect(clarityValidation?.severity).toBe('info');
    });

    it('should detect unclear long sentences', async () => {
      const longSentence = 'This is an extremely long and convoluted sentence that contains far too many words and should be broken down into multiple shorter sentences for better readability and comprehension by users.';
      
      const context: ValidationContext = {
        fieldName: 'description',
        fieldType: 'textarea',
        value: longSentence,
        language: 'en'
      };

      const results = await service.validate(context);
      const clarityValidation = results.find(r => r.rule.type === 'clarity');
      
      expect(clarityValidation).toBeDefined();
      expect(clarityValidation?.isValid).toBe(false);
    });
  });

  describe('Score Calculation', () => {
    it('should calculate overall score correctly', async () => {
      const context: ValidationContext = {
        fieldName: 'test',
        fieldType: 'textarea',
        value: 'short vague text',
        language: 'en'
      };

      const results = await service.validate(context);
      const score = service.calculateOverallScore(results);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 100 for empty results', () => {
      const score = service.calculateOverallScore([]);
      expect(score).toBe(100);
    });
  });

  describe('Statistics Tracking', () => {
    it('should track validation statistics', async () => {
      const context: ValidationContext = {
        fieldName: 'test',
        fieldType: 'textarea',
        value: 'short',
        language: 'en'
      };

      await service.validate(context);
      const stats = service.getStats();
      
      expect(stats.totalValidations).toBe(1);
      expect(stats.passedValidations + stats.failedValidations).toBe(1);
    });

    it('should reset statistics', () => {
      service.resetStats();
      const stats = service.getStats();
      
      expect(stats.totalValidations).toBe(0);
      expect(stats.passedValidations).toBe(0);
      expect(stats.failedValidations).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.mostCommonIssues).toEqual([]);
    });
  });

  describe('Rule Management', () => {
    it('should add custom validation rules', () => {
      const customRule: ValidationRule = {
        id: 'custom-test',
        type: 'length',
        severity: 'error',
        message: { en: 'Custom validation failed', ar: 'فشل التحقق المخصص' },
        customValidator: (value: string) => value.includes('test')
      };

      service.addRule(customRule);
      const config = service.getConfig();
      
      expect(config.rules).toContainEqual(customRule);
    });

    it('should remove validation rules', () => {
      const ruleId = 'min-length';
      service.removeRule(ruleId);
      const config = service.getConfig();
      
      expect(config.rules.find(r => r.id === ruleId)).toBeUndefined();
    });
  });

  describe('Debounced Validation', () => {
    it('should debounce validation calls', async () => {
      vi.useFakeTimers();
      
      const context: ValidationContext = {
        fieldName: 'test',
        fieldType: 'textarea',
        value: 'test value',
        language: 'en'
      };

      const callback = vi.fn();
      service.validateDebounced(context, callback);
      
      // Callback should not be called immediately
      expect(callback).not.toHaveBeenCalled();
      
      // Advance timers
      vi.advanceTimersByTime(500);
      
      // Now callback should be called
      expect(callback).toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('Service Disabled State', () => {
    it('should return empty results when disabled', async () => {
      service.updateConfig({ enabled: false });
      
      const context: ValidationContext = {
        fieldName: 'test',
        fieldType: 'textarea',
        value: 'test value',
        language: 'en'
      };

      const results = await service.validate(context);
      expect(results).toEqual([]);
    });
  });

  describe('Real-world PRD Validation', () => {
    it('should validate a complete PRD document', async () => {
      const prd = generateTestPRD();
      
      const context: ValidationContext = {
        fieldName: 'prd_content',
        fieldType: 'textarea',
        value: Object.values(prd).join('\n\n'),
        language: 'en'
      };

      const results = await service.validate(context);
      
      // Should have multiple validation results
      expect(results.length).toBeGreaterThan(0);
      
      // Should calculate a reasonable score
      const score = service.calculateOverallScore(results);
      expect(score).toBeGreaterThan(50); // Should be reasonably good
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});