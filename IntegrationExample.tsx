/**
 * Integration Example
 * كيفية دمج Section 15 & 16 في التطبيق الرئيسي
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Brain, X } from 'lucide-react';
import { AchievementSystem, AIMentor } from './src/components';
import { achievementService, mentorService } from './src/services';
import type { AchievementNotification, MentorSuggestion } from './src/types';

/**
 * مثال تطبيق متكامل يدمج Achievement System و AI Mentor
 */
function IntegratedPRDApp() {
  const [userId] = useState('user-demo-123');
  const [language, setLanguage] = useState<'ar-EG' | 'en-US'>('ar-EG');

  // State للمحتوى
  const [currentPRD, setCurrentPRD] = useState('');
  const [prdScore, setPrdScore] = useState(0);

  // State للواجهات
  const [showAchievements, setShowAchievements] = useState(false);
  const [showMentorFull, setShowMentorFull] = useState(false);
  const [achievementNotification, setAchievementNotification] = useState<AchievementNotification | null>(null);

  // State للإحصائيات
  const [userStats, setUserStats] = useState({
    level: 1,
    totalXP: 0,
    currentStreak: 0,
  });

  const isRTL = language === 'ar-EG';

  // تهيئة عند التحميل
  useEffect(() => {
    initializeUser();
    updateStreak();
  }, [userId]);

  // تحديث الإحصائيات
  useEffect(() => {
    loadUserStats();
  }, [userId, showAchievements]);

  const initializeUser = () => {
    // تهيئة Achievement System
    let achievements = achievementService.getUserAchievements(userId);
    if (!achievements) {
      achievements = achievementService.initializeUserAchievements(userId);
    }

    // تهيئة AI Mentor
    let mentor = mentorService.getMentorProfile(userId);
    if (!mentor) {
      mentor = mentorService.initializeMentorProfile(userId);
    }
  };

  const updateStreak = () => {
    achievementService.updateStreak(userId);
    loadUserStats();
  };

  const loadUserStats = () => {
    const achievements = achievementService.getUserAchievements(userId);
    if (achievements) {
      setUserStats({
        level: achievements.level,
        totalXP: achievements.totalXP,
        currentStreak: achievements.currentStreak,
      });
    }
  };

  /**
   * معالج إنشاء PRD جديد
   */
  const handlePRDCreated = (prdContent: string, score: number) => {
    setCurrentPRD(prdContent);
    setPrdScore(score);

    // 1. تسجيل في Achievement System
    const notifications = achievementService.recordPRDCreated(userId, score);

    // عرض إشعار الإنجاز الجديد
    if (notifications.length > 0) {
      setAchievementNotification(notifications[0]);
      // إخفاء الإشعار بعد 5 ثوان
      setTimeout(() => {
        setAchievementNotification(null);
      }, 5000);
    }

    // 2. تحليل بواسطة AI Mentor
    mentorService.analyzePRD(userId, prdContent);

    // 3. تحديث الإحصائيات
    loadUserStats();

    console.log('✅ PRD Created and analyzed!');
  };

  /**
   * معالج إكمال بحث
   */
  const handleResearchCompleted = () => {
    const notifications = achievementService.recordResearchCompleted(userId);

    if (notifications.length > 0) {
      setAchievementNotification(notifications[0]);
      setTimeout(() => setAchievementNotification(null), 5000);
    }

    loadUserStats();
  };

  /**
   * معالج إنشاء نموذج أولي
   */
  const handlePrototypeGenerated = () => {
    const notifications = achievementService.recordPrototypeGenerated(userId);

    if (notifications.length > 0) {
      setAchievementNotification(notifications[0]);
      setTimeout(() => setAchievementNotification(null), 5000);
    }

    loadUserStats();
  };

  /**
   * معالج تطبيق اقتراح من AI Mentor
   */
  const handleApplySuggestion = (suggestion: MentorSuggestion) => {
    console.log('Applying suggestion:', suggestion);

    // هنا يمكن تطبيق الاقتراح في محرر PRD
    const suggestionText = isRTL ? suggestion.contentAr : suggestion.contentEn;
    alert(`Suggestion applied: ${suggestionText}`);
  };

  /**
   * دوال تجريبية للاختبار
   */
  const simulateActions = {
    createPRD: () => {
      const samplePRD = `
# Product Requirements Document

## Product Overview
Building a real-time collaboration tool for remote teams.

## Target Users
Remote team managers who need better visibility into project progress.

## Key Features
- Live status updates
- Team activity feed
- Real-time notifications
- Dashboard with metrics

## Success Metrics
- 40% reduction in status meeting time
- 80% user satisfaction score
- 95% uptime SLA
      `.trim();

      const randomScore = Math.floor(Math.random() * 30) + 70; // 70-100
      handlePRDCreated(samplePRD, randomScore);
    },

    completeResearch: () => {
      handleResearchCompleted();
    },

    generatePrototype: () => {
      handlePrototypeGenerated();
    },
  };

  return (
    <div className={`app min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isRTL ? 'PRD إلى نموذج أولي' : 'PRD to Prototype'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isRTL ? 'مع نظام الإنجازات و المرشد الذكي' : 'With Achievements & AI Mentor'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* User Stats */}
              <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg px-4 py-2 border border-purple-200">
                <div className="text-center">
                  <div className="text-xs text-gray-600">{isRTL ? 'المستوى' : 'Level'}</div>
                  <div className="text-lg font-bold text-purple-600">{userStats.level}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">XP</div>
                  <div className="text-lg font-bold text-blue-600">{userStats.totalXP}</div>
                </div>
                {userStats.currentStreak > 0 && (
                  <div className="text-center">
                    <div className="text-xs text-gray-600">{isRTL ? 'السلسلة' : 'Streak'}</div>
                    <div className="text-lg font-bold text-orange-600">{userStats.currentStreak} 🔥</div>
                  </div>
                )}
              </div>

              {/* Achievements Button */}
              <button
                onClick={() => setShowAchievements(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
              >
                <Trophy className="w-5 h-5" />
                {isRTL ? 'الإنجازات' : 'Achievements'}
              </button>

              {/* AI Mentor Button */}
              <button
                onClick={() => setShowMentorFull(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-md"
              >
                <Brain className="w-5 h-5" />
                {isRTL ? 'مرشد AI' : 'AI Mentor'}
              </button>

              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'ar-EG' ? 'en-US' : 'ar-EG')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {language === 'ar-EG' ? 'English' : 'العربية'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                {isRTL ? '🧪 منطقة الاختبار' : '🧪 Testing Playground'}
              </h2>

              <p className="text-gray-600 mb-6">
                {isRTL
                  ? 'استخدم الأزرار التالية لمحاكاة الأحداث واختبار نظام الإنجازات و المرشد الذكي:'
                  : 'Use the buttons below to simulate events and test the Achievement System & AI Mentor:'}
              </p>

              <div className="space-y-4">
                {/* Test Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={simulateActions.createPRD}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    📝 {isRTL ? 'إنشاء PRD' : 'Create PRD'}
                  </button>

                  <button
                    onClick={simulateActions.completeResearch}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    🔍 {isRTL ? 'إكمال بحث' : 'Complete Research'}
                  </button>

                  <button
                    onClick={simulateActions.generatePrototype}
                    className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                  >
                    🚀 {isRTL ? 'إنشاء نموذج' : 'Generate Prototype'}
                  </button>
                </div>

                {/* Current PRD Display */}
                {currentPRD && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">
                        {isRTL ? 'آخر PRD تم إنشاؤه:' : 'Last Created PRD:'}
                      </h3>
                      <span className="text-sm font-medium text-blue-600">
                        {isRTL ? `الدرجة: ${prdScore}` : `Score: ${prdScore}`}
                      </span>
                    </div>
                    <pre className="text-xs text-gray-600 overflow-auto max-h-48 whitespace-pre-wrap">
                      {currentPRD}
                    </pre>
                  </div>
                )}

                {/* Instructions */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-2">
                    💡 {isRTL ? 'تعليمات' : 'Instructions'}
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• {isRTL ? 'اضغط على الأزرار لمحاكاة الأحداث' : 'Click buttons to simulate events'}</li>
                    <li>• {isRTL ? 'شاهد الإنجازات الجديدة تظهر' : 'Watch new achievements unlock'}</li>
                    <li>• {isRTL ? 'افتح المرشد الذكي لرؤية الاقتراحات' : 'Open AI Mentor to see suggestions'}</li>
                    <li>• {isRTL ? 'كرر العملية للحصول على إنجازات أعلى' : 'Repeat to unlock higher-tier achievements'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Compact AI Mentor */}
          <div className="lg:col-span-1">
            <AIMentor
              userId={userId}
              language={language}
              currentContext={currentPRD}
              onApplySuggestion={handleApplySuggestion}
              compact={true}
            />
          </div>
        </div>
      </div>

      {/* Achievement System Modal */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                {isRTL ? 'نظام الإنجازات' : 'Achievement System'}
              </h2>
              <button
                onClick={() => setShowAchievements(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <AchievementSystem
                userId={userId}
                language={language}
                onClose={() => setShowAchievements(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Mentor Full Modal */}
      {showMentorFull && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-500" />
                {isRTL ? 'مرشد AI الشخصي' : 'Your AI Mentor'}
              </h2>
              <button
                onClick={() => setShowMentorFull(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <AIMentor
                userId={userId}
                language={language}
                currentContext={currentPRD}
                onApplySuggestion={handleApplySuggestion}
                compact={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Achievement Notification Toast */}
      {achievementNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-2xl p-6 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="text-4xl">{achievementNotification.achievement.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">
                  🎉 {isRTL ? 'إنجاز جديد!' : 'Achievement Unlocked!'}
                </div>
                <div className="font-semibold mb-1">
                  {isRTL
                    ? achievementNotification.achievement.nameAr
                    : achievementNotification.achievement.nameEn}
                </div>
                <div className="text-sm text-yellow-100">
                  +{achievementNotification.achievement.xpReward} XP
                </div>
              </div>
              <button
                onClick={() => setAchievementNotification(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IntegratedPRDApp;
