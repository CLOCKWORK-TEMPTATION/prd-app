import React, { useState, useEffect } from 'react';
import OnboardingTour from './OnboardingTour';
import TemplatesLibrary from './TemplatesLibrary';
import { Template } from '../types';
import '../styles/onboarding.css';
import '../styles/templates.css';

/**
 * Enhanced App Component with Section 1 & 2 Integration
 *
 * This component demonstrates how to integrate:
 * - OnboardingTour (Section 1)
 * - TemplatesLibrary (Section 2)
 *
 * To use in your main app:
 * 1. Copy the state management logic
 * 2. Add data-tour attributes to your elements
 * 3. Add the components at the end of your JSX
 * 4. Import the CSS files
 */

interface AppEnhancedProps {
  // Your existing app props
  locale?: 'en-US' | 'ar-EG';
  children?: React.ReactNode;
  // Callbacks for template selection
  onTemplateSelect?: (template: Template) => void;
}

const AppEnhanced: React.FC<AppEnhancedProps> = ({
  locale = 'en-US',
  children,
  onTemplateSelect
}) => {
  // ============================================
  // State Management
  // ============================================
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // ============================================
  // Check onboarding status on mount
  // ============================================
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('prd-onboarding-completed');
    const hasSkippedOnboarding = localStorage.getItem('prd-onboarding-skipped');

    // Show onboarding for first-time users
    if (!hasCompletedOnboarding && !hasSkippedOnboarding) {
      // Delay to let the app render first
      setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
    }
  }, []);

  // ============================================
  // Handlers
  // ============================================

  /**
   * Handle onboarding completion
   * Shows templates library after onboarding
   */
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);

    // Optional: Show templates after completing onboarding
    setTimeout(() => {
      setShowTemplates(true);
    }, 500);
  };

  /**
   * Handle template selection
   * Passes template data to parent component or fills form
   */
  const handleTemplateSelect = (template: Template) => {
    // Call parent callback if provided
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }

    // Example: Auto-fill form fields (customize based on your app)
    // This is just a demonstration - adapt to your actual form structure
    console.log('Template selected:', template);

    // You can trigger events or update state here
    // For example:
    // setQuestion1(template.content.productDescription);
    // setQuestion2(template.content.targetUsers);
    // setQuestion3(template.content.keyFeatures.join(', '));
  };

  /**
   * Manually trigger onboarding tour
   * Useful for "Help" or "Tutorial" buttons
   */
  const startOnboardingTour = () => {
    setShowOnboarding(true);
  };

  /**
   * Manually open templates library
   * Useful for "Browse Templates" buttons
   */
  const openTemplatesLibrary = () => {
    setShowTemplates(true);
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className="app-enhanced">
      {/* Your existing app content */}
      {children}

      {/* Helper buttons (optional - for testing/development) */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40">
        <button
          onClick={startOnboardingTour}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          title="Start Onboarding Tour"
        >
          🎯 {locale === 'ar-EG' ? 'جولة تعريفية' : 'Tour'}
        </button>

        <button
          onClick={openTemplatesLibrary}
          data-tour="templates-button"
          className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow-lg hover:bg-purple-600 transition-colors text-sm font-medium"
          title="Open Templates"
        >
          📚 {locale === 'ar-EG' ? 'القوالب' : 'Templates'}
        </button>
      </div>

      {/* ============================================ */}
      {/* Section 1: Onboarding Tour */}
      {/* ============================================ */}
      <OnboardingTour
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
        locale={locale}
      />

      {/* ============================================ */}
      {/* Section 2: Templates Library */}
      {/* ============================================ */}
      <TemplatesLibrary
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
        locale={locale}
      />
    </div>
  );
};

export default AppEnhanced;

/**
 * ============================================
 * USAGE EXAMPLE
 * ============================================
 *
 * import AppEnhanced from './src/components/AppEnhanced';
 *
 * function App() {
 *   const [locale, setLocale] = useState('en-US');
 *   const [formData, setFormData] = useState({ ... });
 *
 *   const handleTemplateSelect = (template) => {
 *     // Fill your form with template data
 *     setFormData({
 *       productName: template.content.productName,
 *       description: template.content.productDescription,
 *       users: template.content.targetUsers,
 *       features: template.content.keyFeatures.join('\n'),
 *       metrics: template.content.successMetrics.join('\n')
 *     });
 *   };
 *
 *   return (
 *     <AppEnhanced
 *       locale={locale}
 *       onTemplateSelect={handleTemplateSelect}
 *     >
 *       {/* Your existing app components *\/}
 *       <YourExistingApp />
 *     </AppEnhanced>
 *   );
 * }
 *
 * ============================================
 * IMPORTANT: Add data-tour attributes
 * ============================================
 *
 * In your main app, add these attributes to enable tour highlighting:
 *
 * <button data-tour="research-tab">Research</button>
 * <button data-tour="prd-tab">Create PRD</button>
 * <button data-tour="prototype-tab">Prototype</button>
 * <button data-tour="templates-button">Templates</button>
 *
 */
