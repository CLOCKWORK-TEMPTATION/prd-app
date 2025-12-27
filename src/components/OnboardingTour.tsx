import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { OnboardingTourProps, OnboardingStep } from '../types';

/**
 * Section 1: Interactive Onboarding Tour Component
 *
 * Features:
 * - Interactive tooltips with animations
 * - Progress indicator (Step X of Y)
 * - Skip option for advanced users
 * - RTL support for Arabic
 * - Highlights target elements
 * - Goal: Reduce bounce rate by 40-60%
 */

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onComplete,
  locale = 'en-US'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const isRTL = locale === 'ar-EG';

  // Define onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to PRD to Prototype!',
      titleAr: 'مرحباً بك في PRD to Prototype!',
      description: 'This quick tour will help you get started. Click Next to continue or Skip to explore on your own.',
      descriptionAr: 'هذه الجولة السريعة ستساعدك على البدء. انقر على التالي للمتابعة أو تخطي للاستكشاف بنفسك.',
      target: 'body',
      placement: 'bottom',
      icon: '👋'
    },
    {
      id: 'research-tab',
      title: 'Start with Research',
      titleAr: 'ابدأ بالبحث',
      description: 'Get comprehensive market insights before creating your PRD. This helps you understand your competition and market.',
      descriptionAr: 'احصل على رؤى شاملة للسوق قبل إنشاء PRD. هذا يساعدك على فهم المنافسة والسوق.',
      target: '[data-tour="research-tab"]',
      placement: 'bottom',
      icon: '🔍'
    },
    {
      id: 'prd-tab',
      title: 'Create Your PRD',
      titleAr: 'أنشئ PRD الخاص بك',
      description: 'Answer 3 simple questions to generate a professional Product Requirements Document.',
      descriptionAr: 'أجب على 3 أسئلة بسيطة لإنشاء مستند متطلبات منتج احترافي.',
      target: '[data-tour="prd-tab"]',
      placement: 'bottom',
      icon: '📝'
    },
    {
      id: 'prototype-tab',
      title: 'Generate Prototype',
      titleAr: 'أنشئ النموذج الأولي',
      description: 'Convert your PRD into a working prototype with multiple version options from basic to production-ready.',
      descriptionAr: 'حول PRD الخاص بك إلى نموذج أولي عملي مع خيارات متعددة من الأساسي إلى الجاهز للإنتاج.',
      target: '[data-tour="prototype-tab"]',
      placement: 'bottom',
      icon: '🚀'
    },
    {
      id: 'templates',
      title: 'Use Smart Templates',
      titleAr: 'استخدم القوالب الذكية',
      description: 'Access our library of pre-built templates for common product types to get started faster.',
      descriptionAr: 'الوصول إلى مكتبة القوالب الجاهزة لأنواع المنتجات الشائعة للبدء بشكل أسرع.',
      target: '[data-tour="templates-button"]',
      placement: 'left',
      icon: '📚'
    }
  ];

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];

  // Get translated text
  const getText = (key: string, keyAr: string) => isRTL ? keyAr : key;

  // Handle next step
  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      handleComplete();
    }
  }, [currentStep, totalSteps]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  }, [currentStep]);

  // Handle skip
  const handleSkip = useCallback(() => {
    // Save that user skipped onboarding
    localStorage.setItem('prd-onboarding-skipped', 'true');
    onClose();
  }, [onClose]);

  // Handle complete
  const handleComplete = useCallback(() => {
    // Save that user completed onboarding
    localStorage.setItem('prd-onboarding-completed', 'true');
    localStorage.setItem('prd-onboarding-completed-at', new Date().toISOString());
    onComplete();
  }, [onComplete]);

  // Highlight target element
  useEffect(() => {
    if (!isOpen || !currentStepData?.target) return;

    const target = document.querySelector(currentStepData.target);
    if (target) {
      target.classList.add('onboarding-highlight');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      if (target) {
        target.classList.remove('onboarding-highlight');
      }
    };
  }, [isOpen, currentStep, currentStepData]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isRTL) handleNext();
      if (e.key === 'ArrowLeft' && !isRTL) handlePrevious();
      if (e.key === 'ArrowRight' && isRTL) handlePrevious();
      if (e.key === 'ArrowLeft' && isRTL) handleNext();
      if (e.key === 'Escape') handleSkip();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, handleNext, handlePrevious, handleSkip, isRTL]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Tour Tooltip */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] ${
          isRTL ? 'rtl' : 'ltr'
        }`}
      >
        <div
          className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-[90vw] transition-all duration-300 ${
            isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={{
            animation: isAnimating ? 'none' : 'slideInUp 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentStepData.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {getText(currentStepData.title, currentStepData.titleAr)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isRTL ? `الخطوة ${currentStep + 1} من ${totalSteps}` : `Step ${currentStep + 1} of ${totalSteps}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-5">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {getText(currentStepData.description, currentStepData.descriptionAr)}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              {isRTL ? 'تخطي' : 'Skip Tour'}
            </button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
                >
                  {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                  {isRTL ? 'السابق' : 'Previous'}
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
              >
                {currentStep === totalSteps - 1 ? (
                  <>
                    <Check size={18} />
                    {isRTL ? 'إنهاء' : 'Finish'}
                  </>
                ) : (
                  <>
                    {isRTL ? 'التالي' : 'Next'}
                    {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mt-5">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                    : index < currentStep
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .onboarding-highlight {
          position: relative;
          z-index: 9997;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6);
          border-radius: 8px;
          animation: pulse-highlight 2s ease-in-out infinite;
        }

        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.7), 0 0 0 9999px rgba(0, 0, 0, 0.6);
          }
        }
      `}</style>
    </>
  );
};

export default OnboardingTour;
