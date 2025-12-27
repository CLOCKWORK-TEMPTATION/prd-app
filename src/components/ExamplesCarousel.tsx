import React, { useState, useEffect, useCallback } from 'react';
import { VisualExample, PLACEHOLDER_EXAMPLES, DEFAULT_VISUAL_EXAMPLES } from '../types';

/**
 * Section 6: Visual Examples Carousel
 * عرض أمثلة مرئية لكل خطوة مع Screenshots من PRDs ناجحة
 */

interface ExamplesCarouselProps {
  language?: 'en-US' | 'ar-EG';
  step?: number; // الخطوة الحالية لتصفية الأمثلة
  category?: 'prd-success' | 'prototype-before-after' | 'best-practice' | 'all';
  examples?: VisualExample[]; // أمثلة مخصصة (اختياري)
  autoPlay?: boolean;
  autoPlayInterval?: number; // بالميلي ثانية
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
}

const TRANSLATIONS = {
  'en-US': {
    title: 'Visual Examples',
    subtitle: 'Learn from successful PRDs and prototypes',
    previous: 'Previous',
    next: 'Next',
    play: 'Auto-play',
    pause: 'Pause',
    viewFull: 'View Full Size',
    category: {
      'prd-success': 'Successful PRDs',
      'prototype-before-after': 'Before/After Prototypes',
      'best-practice': 'Best Practices',
      'all': 'All Examples'
    }
  },
  'ar-EG': {
    title: 'أمثلة مرئية',
    subtitle: 'تعلم من PRDs ونماذج ناجحة',
    previous: 'السابق',
    next: 'التالي',
    play: 'تشغيل تلقائي',
    pause: 'إيقاف',
    viewFull: 'عرض بالحجم الكامل',
    category: {
      'prd-success': 'PRDs ناجحة',
      'prototype-before-after': 'قبل/بعد النماذج',
      'best-practice': 'أفضل الممارسات',
      'all': 'جميع الأمثلة'
    }
  }
};

export const ExamplesCarousel: React.FC<ExamplesCarouselProps> = ({
  language = 'en-US',
  step,
  category = 'all',
  examples,
  autoPlay = false,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  className = ''
}) => {
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar-EG';

  // استخدام الأمثلة المخصصة أو الافتراضية
  const allExamples = examples || (
    DEFAULT_VISUAL_EXAMPLES.length > 0 ? DEFAULT_VISUAL_EXAMPLES : PLACEHOLDER_EXAMPLES
  );

  // تصفية الأمثلة حسب الخطوة والفئة
  const filteredExamples = allExamples.filter(example => {
    const stepMatch = step === undefined || example.step === undefined || example.step === step;
    const categoryMatch = category === 'all' || example.category === category;
    return stepMatch && categoryMatch;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [imageLoaded, setImageLoaded] = useState(false);

  // التقدم التلقائي
  useEffect(() => {
    if (!isPlaying || filteredExamples.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % filteredExamples.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, filteredExamples.length, autoPlayInterval]);

  // إعادة تعيين الفهرس عند تغيير الأمثلة
  useEffect(() => {
    setCurrentIndex(0);
    setImageLoaded(false);
  }, [step, category, examples]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev =>
      prev === 0 ? filteredExamples.length - 1 : prev - 1
    );
    setImageLoaded(false);
  }, [filteredExamples.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % filteredExamples.length);
    setImageLoaded(false);
  }, [filteredExamples.length]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  if (filteredExamples.length === 0) {
    return (
      <div
        className={`examples-carousel-empty ${className}`}
        style={{
          padding: '40px',
          textAlign: 'center',
          color: '#9ca3af',
          direction: isRTL ? 'rtl' : 'ltr'
        }}
      >
        <p>{language === 'ar-EG' ? 'لا توجد أمثلة متاحة' : 'No examples available'}</p>
      </div>
    );
  }

  const currentExample = filteredExamples[currentIndex];

  return (
    <div
      className={`examples-carousel ${className}`}
      style={{
        direction: isRTL ? 'rtl' : 'ltr',
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto'
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '20px',
          textAlign: 'center'
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}
        >
          {t.title}
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}
        >
          {t.subtitle}
        </p>
      </div>

      {/* Carousel Container */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Image */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '500px',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {!imageLoaded && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#9ca3af'
              }}
            >
              {language === 'ar-EG' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          )}
          <img
            src={currentExample.imageUrl}
            alt={language === 'ar-EG' ? currentExample.titleAr : currentExample.title}
            onLoad={() => setImageLoaded(true)}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              display: imageLoaded ? 'block' : 'none'
            }}
          />

          {/* Navigation Arrows */}
          {showControls && filteredExamples.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                style={{
                  position: 'absolute',
                  left: isRTL ? 'auto' : '16px',
                  right: isRTL ? '16px' : 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '20px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                }}
              >
                {isRTL ? '→' : '←'}
              </button>
              <button
                onClick={handleNext}
                style={{
                  position: 'absolute',
                  right: isRTL ? 'auto' : '16px',
                  left: isRTL ? '16px' : 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '20px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                }}
              >
                {isRTL ? '←' : '→'}
              </button>
            </>
          )}
        </div>

        {/* Info Section */}
        <div
          style={{
            padding: '24px',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Category Badge */}
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '12px',
              backgroundColor:
                currentExample.category === 'prd-success' ? '#dbeafe' :
                currentExample.category === 'prototype-before-after' ? '#d1fae5' :
                '#fef3c7',
              color:
                currentExample.category === 'prd-success' ? '#1e40af' :
                currentExample.category === 'prototype-before-after' ? '#065f46' :
                '#92400e'
            }}
          >
            {t.category[currentExample.category]}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}
          >
            {language === 'ar-EG' ? currentExample.titleAr : currentExample.title}
          </h3>

          {/* Description */}
          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0,
              lineHeight: '1.6'
            }}
          >
            {language === 'ar-EG' ? currentExample.descriptionAr : currentExample.description}
          </p>
        </div>

        {/* Controls & Indicators */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}
        >
          {/* Indicators */}
          {showIndicators && (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flex: 1
              }}
            >
              {filteredExamples.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setImageLoaded(false);
                  }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: index === currentIndex ? '#4f46e5' : '#d1d5db',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    padding: 0
                  }}
                  aria-label={`Go to example ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Play/Pause Button */}
          {showControls && filteredExamples.length > 1 && (
            <button
              onClick={togglePlay}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: isPlaying ? '#fef3c7' : '#ffffff',
                color: '#374151',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isPlaying ? '#fde68a' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isPlaying ? '#fef3c7' : '#ffffff';
              }}
            >
              {isPlaying ? t.pause : t.play}
            </button>
          )}

          {/* Counter */}
          <div
            style={{
              fontSize: '13px',
              color: '#6b7280',
              fontWeight: 500,
              marginLeft: isRTL ? 0 : '16px',
              marginRight: isRTL ? '16px' : 0
            }}
          >
            {currentIndex + 1} / {filteredExamples.length}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * نسخة مدمجة من Carousel (compact version)
 */
export const ExamplesCarouselCompact: React.FC<ExamplesCarouselProps> = ({
  language = 'en-US',
  step,
  category = 'all',
  examples,
  className = ''
}) => {
  const isRTL = language === 'ar-EG';
  const allExamples = examples || PLACEHOLDER_EXAMPLES;

  const filteredExamples = allExamples.filter(example => {
    const stepMatch = step === undefined || example.step === undefined || example.step === step;
    const categoryMatch = category === 'all' || example.category === category;
    return stepMatch && categoryMatch;
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  if (filteredExamples.length === 0) return null;

  const currentExample = filteredExamples[currentIndex];

  return (
    <div
      className={`examples-carousel-compact ${className}`}
      style={{
        direction: isRTL ? 'rtl' : 'ltr',
        display: 'flex',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}
    >
      {/* Thumbnail */}
      <img
        src={currentExample.imageUrl}
        alt={language === 'ar-EG' ? currentExample.titleAr : currentExample.title}
        style={{
          width: '120px',
          height: '90px',
          objectFit: 'cover',
          borderRadius: '8px'
        }}
      />

      {/* Info */}
      <div style={{ flex: 1 }}>
        <h4
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1f2937',
            margin: '0 0 4px 0'
          }}
        >
          {language === 'ar-EG' ? currentExample.titleAr : currentExample.title}
        </h4>
        <p
          style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '0 0 8px 0'
          }}
        >
          {language === 'ar-EG' ? currentExample.descriptionAr : currentExample.description}
        </p>

        {/* Navigation */}
        {filteredExamples.length > 1 && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {filteredExamples.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: index === currentIndex ? '#4f46e5' : '#d1d5db',
                  cursor: 'pointer',
                  padding: 0
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamplesCarousel;
