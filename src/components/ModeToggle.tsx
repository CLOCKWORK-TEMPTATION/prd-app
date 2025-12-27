import React from 'react';
import { useAppMode } from '../contexts/AppModeContext';

/**
 * Section 5: Guided Mode vs Expert Mode
 * مكون تبديل الوضع بين Guided و Expert
 */

interface ModeToggleProps {
  language?: 'en-US' | 'ar-EG';
  className?: string;
}

const TRANSLATIONS = {
  'en-US': {
    guided: 'Guided',
    expert: 'Expert',
    guidedDesc: 'Step-by-step with explanations',
    expertDesc: 'All at once, for experienced users',
    switchTo: 'Switch to',
    currentMode: 'Current mode:'
  },
  'ar-EG': {
    guided: 'موجّه',
    expert: 'خبير',
    guidedDesc: 'خطوة خطوة مع شرح كل سؤال',
    expertDesc: 'كل شيء مرة واحدة للمستخدمين المحترفين',
    switchTo: 'التبديل إلى',
    currentMode: 'الوضع الحالي:'
  }
};

export const ModeToggle: React.FC<ModeToggleProps> = ({
  language = 'en-US',
  className = ''
}) => {
  const { mode, toggleMode } = useAppMode();
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar-EG';

  return (
    <div
      className={`mode-toggle ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px',
        direction: isRTL ? 'rtl' : 'ltr'
      }}
    >
      {/* عرض الوضع الحالي */}
      <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
        {t.currentMode}
      </span>

      {/* زر التبديل */}
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          backgroundColor: '#f3f4f6',
          borderRadius: '12px',
          padding: '4px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={toggleMode}
        role="switch"
        aria-checked={mode === 'expert'}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMode();
          }
        }}
      >
        {/* خيار Guided */}
        <div
          style={{
            padding: '8px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            backgroundColor: mode === 'guided' ? '#4f46e5' : 'transparent',
            color: mode === 'guided' ? '#ffffff' : '#374151',
            boxShadow: mode === 'guided' ? '0 2px 4px rgba(79, 70, 229, 0.3)' : 'none'
          }}
        >
          {t.guided}
        </div>

        {/* خيار Expert */}
        <div
          style={{
            padding: '8px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            backgroundColor: mode === 'expert' ? '#10b981' : 'transparent',
            color: mode === 'expert' ? '#ffffff' : '#374151',
            boxShadow: mode === 'expert' ? '0 2px 4px rgba(16, 185, 129, 0.3)' : 'none'
          }}
        >
          {t.expert}
        </div>
      </div>

      {/* وصف الوضع الحالي */}
      <span
        style={{
          fontSize: '13px',
          color: '#9ca3af',
          maxWidth: '200px'
        }}
      >
        {mode === 'guided' ? t.guidedDesc : t.expertDesc}
      </span>
    </div>
  );
};

/**
 * نسخة مدمجة من ModeToggle (compact version)
 */
export const ModeToggleCompact: React.FC<ModeToggleProps> = ({
  language = 'en-US',
  className = ''
}) => {
  const { mode, toggleMode } = useAppMode();
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar-EG';

  return (
    <button
      className={`mode-toggle-compact ${className}`}
      onClick={toggleMode}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        backgroundColor: mode === 'guided' ? '#eef2ff' : '#d1fae5',
        color: mode === 'guided' ? '#4f46e5' : '#10b981',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        direction: isRTL ? 'rtl' : 'ltr'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <span>{mode === 'guided' ? '🎯' : '⚡'}</span>
      <span>{mode === 'guided' ? t.guided : t.expert}</span>
    </button>
  );
};

/**
 * نسخة مع شرح تفصيلي (with detailed explanation)
 */
export const ModeToggleWithExplanation: React.FC<ModeToggleProps> = ({
  language = 'en-US',
  className = ''
}) => {
  const { mode, toggleMode } = useAppMode();
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar-EG';

  const explanations = {
    'en-US': {
      guided: {
        title: 'Guided Mode',
        points: [
          'Step-by-step process',
          'Explanations for each question',
          'Examples and tips provided',
          'Perfect for beginners'
        ]
      },
      expert: {
        title: 'Expert Mode',
        points: [
          'All questions at once',
          'Faster workflow',
          'No explanations needed',
          'For experienced users'
        ]
      }
    },
    'ar-EG': {
      guided: {
        title: 'الوضع الموجّه',
        points: [
          'عملية خطوة بخطوة',
          'شرح لكل سؤال',
          'أمثلة ونصائح مقدمة',
          'مثالي للمبتدئين'
        ]
      },
      expert: {
        title: 'وضع الخبير',
        points: [
          'جميع الأسئلة دفعة واحدة',
          'سير عمل أسرع',
          'لا حاجة للشروحات',
          'للمستخدمين ذوي الخبرة'
        ]
      }
    }
  };

  const currentExplanation = explanations[language][mode];

  return (
    <div
      className={`mode-toggle-with-explanation ${className}`}
      style={{
        direction: isRTL ? 'rtl' : 'ltr',
        padding: '20px',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Header مع Toggle */}
      <div style={{ marginBottom: '16px' }}>
        <ModeToggle language={language} />
      </div>

      {/* الشرح التفصيلي */}
      <div
        style={{
          padding: '16px',
          backgroundColor: mode === 'guided' ? '#eef2ff' : '#d1fae5',
          borderRadius: '8px',
          borderLeft: isRTL ? 'none' : '4px solid',
          borderRight: isRTL ? '4px solid' : 'none',
          borderColor: mode === 'guided' ? '#4f46e5' : '#10b981'
        }}
      >
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: 700,
            color: mode === 'guided' ? '#4f46e5' : '#10b981'
          }}
        >
          {currentExplanation.title}
        </h3>
        <ul
          style={{
            margin: 0,
            paddingLeft: isRTL ? 0 : '20px',
            paddingRight: isRTL ? '20px' : 0,
            listStyle: 'none'
          }}
        >
          {currentExplanation.points.map((point, index) => (
            <li
              key={index}
              style={{
                marginBottom: '8px',
                fontSize: '14px',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ color: mode === 'guided' ? '#4f46e5' : '#10b981' }}>✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ModeToggle;
