import React, { useState } from 'react';
import {
  AppModeProvider,
  useAppMode,
  useIsGuidedMode,
  ModeToggle,
  ModeToggleCompact,
  ExamplesCarousel,
  ExamplesCarouselCompact
} from '../src';

/**
 * Demo كامل لاستخدام Section 5 & 6
 * Guided Mode vs Expert Mode + Visual Examples Carousel
 */

// ===================================
// 1. Main App Component
// ===================================

function FullDemoApp() {
  return (
    <AppModeProvider>
      <MainLayout />
    </AppModeProvider>
  );
}

// ===================================
// 2. Main Layout
// ===================================

function MainLayout() {
  const [language, setLanguage] = useState<'en-US' | 'ar-EG'>('ar-EG');
  const [currentTab, setCurrentTab] = useState<'research' | 'prd' | 'prototype'>('prd');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      direction: language === 'ar-EG' ? 'rtl' : 'ltr'
    }}>
      {/* Header */}
      <Header language={language} onLanguageChange={setLanguage} />

      {/* Navigation Tabs */}
      <TabNavigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        language={language}
      />

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {currentTab === 'research' && <ResearchTab language={language} />}
        {currentTab === 'prd' && <PRDTab language={language} />}
        {currentTab === 'prototype' && <PrototypeTab language={language} />}
      </main>

      {/* Footer */}
      <Footer language={language} />
    </div>
  );
}

// ===================================
// 3. Header Component
// ===================================

interface HeaderProps {
  language: 'en-US' | 'ar-EG';
  onLanguageChange: (lang: 'en-US' | 'ar-EG') => void;
}

function Header({ language, onLanguageChange }: HeaderProps) {
  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Logo & Title */}
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1f2937',
            margin: 0
          }}>
            {language === 'ar-EG' ? 'PRD إلى نموذج أولي' : 'PRD to Prototype'}
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '4px 0 0 0'
          }}>
            {language === 'ar-EG'
              ? 'بحث، تخطيط، وبناء منتجك من الفكرة إلى النموذج'
              : 'Research, plan, and build your product from idea to prototype'}
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Mode Toggle */}
          <ModeToggleCompact language={language} />

          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(language === 'ar-EG' ? 'en-US' : 'ar-EG')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {language === 'ar-EG' ? 'English' : 'العربية'}
          </button>
        </div>
      </div>
    </header>
  );
}

// ===================================
// 4. Tab Navigation
// ===================================

interface TabNavigationProps {
  currentTab: 'research' | 'prd' | 'prototype';
  onTabChange: (tab: 'research' | 'prd' | 'prototype') => void;
  language: 'en-US' | 'ar-EG';
}

function TabNavigation({ currentTab, onTabChange, language }: TabNavigationProps) {
  const tabs = [
    { id: 'research', labelEn: 'Research', labelAr: 'البحث' },
    { id: 'prd', labelEn: 'Create PRD', labelAr: 'إنشاء PRD' },
    { id: 'prototype', labelEn: 'Prototype', labelAr: 'النموذج' }
  ];

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        gap: '8px',
        padding: '0 16px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: 'transparent',
              color: currentTab === tab.id ? '#4f46e5' : '#6b7280',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: currentTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            {language === 'ar-EG' ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ===================================
// 5. PRD Tab (Main Demo)
// ===================================

function PRDTab({ language }: { language: 'en-US' | 'ar-EG' }) {
  const { mode } = useAppMode();
  const isGuided = useIsGuidedMode();
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div>
      {/* Mode Toggle with Explanation */}
      <div style={{ marginBottom: '32px' }}>
        <ModeToggle language={language} />
      </div>

      {/* Examples Carousel */}
      <div style={{ marginBottom: '40px' }}>
        <ExamplesCarousel
          language={language}
          step={currentStep}
          category="prd-success"
          autoPlay={isGuided}
          autoPlayInterval={5000}
          showControls={true}
          showIndicators={true}
        />
      </div>

      {/* Form based on mode */}
      {mode === 'guided' ? (
        <GuidedPRDForm
          language={language}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />
      ) : (
        <ExpertPRDForm language={language} />
      )}
    </div>
  );
}

// ===================================
// 6. Guided PRD Form
// ===================================

interface GuidedPRDFormProps {
  language: 'en-US' | 'ar-EG';
  currentStep: number;
  onStepChange: (step: number) => void;
}

function GuidedPRDForm({ language, currentStep, onStepChange }: GuidedPRDFormProps) {
  const totalSteps = 3;

  const questions = {
    'en-US': [
      {
        title: 'Step 1: What are you building?',
        label: 'Product Description',
        placeholder: 'e.g., A real-time collaboration dashboard for remote teams...',
        help: 'Be specific about your product or feature. Include the main value proposition.'
      },
      {
        title: 'Step 2: Who is it for?',
        label: 'Target Users & Problem',
        placeholder: 'e.g., Remote team managers who struggle with visibility...',
        help: 'Identify your target users and the specific problem you\'re solving for them.'
      },
      {
        title: 'Step 3: Key Features & Success Metrics',
        label: 'Features & Metrics',
        placeholder: 'e.g., Live status updates, team activity feed... Success measured by...',
        help: 'List the key features and how you\'ll measure success (KPIs, metrics).'
      }
    ],
    'ar-EG': [
      {
        title: 'الخطوة 1: ما الذي تقوم ببنائه؟',
        label: 'وصف المنتج',
        placeholder: 'مثلاً، لوحة تحكم للتعاون الفوري للفرق عن بعد...',
        help: 'كن محدداً حول منتجك أو ميزتك. قم بتضمين القيمة الأساسية.'
      },
      {
        title: 'الخطوة 2: لمن هذا المنتج؟',
        label: 'المستخدمون المستهدفون والمشكلة',
        placeholder: 'مثلاً، مدراء الفرق عن بعد الذين يواجهون صعوبة في الرؤية...',
        help: 'حدد المستخدمين المستهدفين والمشكلة المحددة التي تحلها لهم.'
      },
      {
        title: 'الخطوة 3: الميزات الرئيسية ومقاييس النجاح',
        label: 'الميزات والمقاييس',
        placeholder: 'مثلاً، تحديثات الحالة المباشرة، موجز نشاط الفريق... يُقاس النجاح بـ...',
        help: 'اسرد الميزات الرئيسية وكيف ستقيس النجاح (مؤشرات الأداء، المقاييس).'
      }
    ]
  };

  const currentQuestion = questions[language][currentStep - 1];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Progress */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
            {language === 'ar-EG' ? 'التقدم' : 'Progress'}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#4f46e5' }}>
            {currentStep} / {totalSteps}
          </span>
        </div>
        <div style={{
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#4f46e5',
            width: `${(currentStep / totalSteps) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Question */}
      <h2 style={{
        fontSize: '20px',
        fontWeight: 700,
        color: '#1f2937',
        marginBottom: '16px'
      }}>
        {currentQuestion.title}
      </h2>

      {/* Help Text */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#eef2ff',
        borderLeft: language === 'ar-EG' ? 'none' : '4px solid #4f46e5',
        borderRight: language === 'ar-EG' ? '4px solid #4f46e5' : 'none',
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#4338ca',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>💡</span>
          <span>{currentQuestion.help}</span>
        </p>
      </div>

      {/* Input */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151',
          marginBottom: '8px'
        }}>
          {currentQuestion.label}
        </label>
        <textarea
          placeholder={currentQuestion.placeholder}
          style={{
            width: '100%',
            minHeight: '150px',
            padding: '12px',
            fontSize: '14px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={() => currentStep > 1 && onStepChange(currentStep - 1)}
          disabled={currentStep === 1}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            backgroundColor: currentStep === 1 ? '#f3f4f6' : '#ffffff',
            color: currentStep === 1 ? '#9ca3af' : '#374151',
            fontSize: '14px',
            fontWeight: 600,
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          {language === 'ar-EG' ? 'السابق' : 'Previous'}
        </button>

        <button
          onClick={() => currentStep < totalSteps && onStepChange(currentStep + 1)}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {currentStep === totalSteps
            ? (language === 'ar-EG' ? 'إنشاء PRD' : 'Generate PRD')
            : (language === 'ar-EG' ? 'التالي' : 'Next')}
        </button>
      </div>
    </div>
  );
}

// ===================================
// 7. Expert PRD Form
// ===================================

function ExpertPRDForm({ language }: { language: 'en-US' | 'ar-EG' }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 700,
        color: '#1f2937',
        marginBottom: '24px'
      }}>
        {language === 'ar-EG' ? 'إنشاء PRD - وضع الخبير' : 'Create PRD - Expert Mode'}
      </h2>

      {/* All questions at once */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Question 1 */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px'
          }}>
            {language === 'ar-EG' ? '1. وصف المنتج' : '1. Product Description'}
          </label>
          <textarea
            placeholder={language === 'ar-EG'
              ? 'ما الذي تقوم ببنائه؟'
              : 'What are you building?'}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              fontSize: '14px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Question 2 */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px'
          }}>
            {language === 'ar-EG' ? '2. المستخدمون المستهدفون والمشكلة' : '2. Target Users & Problem'}
          </label>
          <textarea
            placeholder={language === 'ar-EG'
              ? 'لمن هذا المنتج وما المشكلة التي يحلها؟'
              : 'Who is it for and what problem does it solve?'}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              fontSize: '14px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Question 3 */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px'
          }}>
            {language === 'ar-EG' ? '3. الميزات الرئيسية ومقاييس النجاح' : '3. Key Features & Success Metrics'}
          </label>
          <textarea
            placeholder={language === 'ar-EG'
              ? 'ما هي الميزات الرئيسية وكيف ستقيس النجاح؟'
              : 'What are the key features and how will you measure success?'}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              fontSize: '14px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        style={{
          marginTop: '24px',
          padding: '12px 32px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#10b981',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          width: '100%'
        }}
      >
        {language === 'ar-EG' ? 'إنشاء PRD' : 'Generate PRD'}
      </button>
    </div>
  );
}

// ===================================
// 8. Research Tab
// ===================================

function ResearchTab({ language }: { language: 'en-US' | 'ar-EG' }) {
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
        {language === 'ar-EG' ? 'بحث المنتج' : 'Product Research'}
      </h2>
      <ExamplesCarouselCompact
        language={language}
        category="best-practice"
      />
    </div>
  );
}

// ===================================
// 9. Prototype Tab
// ===================================

function PrototypeTab({ language }: { language: 'en-US' | 'ar-EG' }) {
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
        {language === 'ar-EG' ? 'أمثلة النماذج الأولية' : 'Prototype Examples'}
      </h2>
      <ExamplesCarousel
        language={language}
        category="prototype-before-after"
        autoPlay={true}
        autoPlayInterval={4000}
      />
    </div>
  );
}

// ===================================
// 10. Footer
// ===================================

function Footer({ language }: { language: 'en-US' | 'ar-EG' }) {
  return (
    <footer style={{
      marginTop: '64px',
      padding: '24px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      textAlign: 'center'
    }}>
      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
        {language === 'ar-EG'
          ? 'Demo كامل - Section 5 & 6 Implementation'
          : 'Full Demo - Section 5 & 6 Implementation'}
      </p>
    </footer>
  );
}

export default FullDemoApp;
