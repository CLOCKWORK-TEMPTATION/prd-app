import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppMode, ModeSettings, AppModeContextType } from '../types';

/**
 * Context للإدارة الوضع (Guided vs Expert)
 * Section 5: Guided Mode vs Expert Mode
 */

// القيم الافتراضية
const DEFAULT_SETTINGS: ModeSettings = {
  mode: 'guided',
  showExamples: true,
  autoAdvance: false
};

// إنشاء Context
const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

// مفتاح LocalStorage
const STORAGE_KEY = 'prd-app-mode-settings';

/**
 * Provider للـ AppModeContext
 */
export const AppModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // تحميل الإعدادات من LocalStorage أو استخدام القيم الافتراضية
  const [settings, setSettings] = useState<ModeSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load mode settings from localStorage:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // حفظ الإعدادات في LocalStorage عند التغيير
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save mode settings to localStorage:', error);
    }
  }, [settings]);

  /**
   * تبديل الوضع بين guided و expert
   */
  const toggleMode = () => {
    setSettings(prev => ({
      ...prev,
      mode: prev.mode === 'guided' ? 'expert' : 'guided'
    }));
  };

  /**
   * تعيين الوضع مباشرة
   */
  const setMode = (mode: AppMode) => {
    setSettings(prev => ({
      ...prev,
      mode
    }));
  };

  /**
   * تحديث الإعدادات جزئياً
   */
  const updateSettings = (newSettings: Partial<ModeSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const value: AppModeContextType = {
    mode: settings.mode,
    settings,
    toggleMode,
    setMode,
    updateSettings
  };

  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  );
};

/**
 * Hook لاستخدام AppModeContext
 */
export const useAppMode = (): AppModeContextType => {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within AppModeProvider');
  }
  return context;
};

/**
 * Hook اختياري للحصول على الوضع فقط
 */
export const useCurrentMode = (): AppMode => {
  const { mode } = useAppMode();
  return mode;
};

/**
 * Hook اختياري للحصول على ما إذا كان في وضع guided
 */
export const useIsGuidedMode = (): boolean => {
  const { mode } = useAppMode();
  return mode === 'guided';
};

/**
 * Hook اختياري للحصول على ما إذا كان في وضع expert
 */
export const useIsExpertMode = (): boolean => {
  const { mode } = useAppMode();
  return mode === 'expert';
};

export default AppModeContext;
