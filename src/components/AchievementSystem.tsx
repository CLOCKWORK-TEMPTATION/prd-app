/**
 * Achievement System Component
 * Section 15: Gamification نظام الإنجازات
 */

import React, { useState, useEffect } from 'react';
import {
  Trophy, Award, Star, Target, Flame, TrendingUp, Lock,
  CheckCircle, Circle, Medal, Zap, Crown, Gift
} from 'lucide-react';
import achievementService from '../services/achievementService';
import {
  Achievement,
  UserAchievements,
  AchievementCategory,
  AchievementNotification,
} from '../types/achievementTypes';

interface AchievementSystemProps {
  userId: string;
  language: 'en-US' | 'ar-EG';
  onClose?: () => void;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({
  userId,
  language,
  onClose,
}) => {
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [showNotification, setShowNotification] = useState<Achievement | null>(null);
  const [activeTab, setActiveTab] = useState<'achievements' | 'stats' | 'leaderboard'>('achievements');

  const isRTL = language === 'ar-EG';

  useEffect(() => {
    loadUserAchievements();
  }, [userId]);

  const loadUserAchievements = () => {
    let achievements = achievementService.getUserAchievements(userId);
    if (!achievements) {
      achievements = achievementService.initializeUserAchievements(userId);
    }
    setUserAchievements(achievements);
  };

  const getCategoryIcon = (category: AchievementCategory) => {
    const icons = {
      creation: Trophy,
      quality: Star,
      research: Target,
      prototype: Zap,
      streak: Flame,
      special: Crown,
    };
    return icons[category] || Award;
  };

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: 'text-amber-600 bg-amber-50 border-amber-200',
      silver: 'text-gray-500 bg-gray-50 border-gray-200',
      gold: 'text-yellow-500 bg-yellow-50 border-yellow-200',
      platinum: 'text-blue-500 bg-blue-50 border-blue-200',
      diamond: 'text-purple-500 bg-purple-50 border-purple-200',
    };
    return colors[tier as keyof typeof colors] || 'text-gray-500 bg-gray-50';
  };

  const getProgressPercentage = (achievement: Achievement) => {
    return (achievement.progress / achievement.maxProgress) * 100;
  };

  const getNextLevelXP = () => {
    if (!userAchievements) return 0;
    return achievementService.getXPForNextLevel(userAchievements.level);
  };

  const getCurrentLevelXP = () => {
    if (!userAchievements) return 0;
    const currentLevelBase = Math.pow(userAchievements.level - 1, 2) * 100;
    return userAchievements.totalXP - currentLevelBase;
  };

  const getXPForCurrentLevel = () => {
    if (!userAchievements) return 0;
    return Math.pow(userAchievements.level, 2) * 100 - Math.pow(userAchievements.level - 1, 2) * 100;
  };

  const filteredAchievements = userAchievements?.achievements.filter(
    a => (selectedCategory === 'all' || a.category === selectedCategory) && !a.hidden
  ) || [];

  const categories: { id: AchievementCategory | 'all'; nameEn: string; nameAr: string }[] = [
    { id: 'all', nameEn: 'All', nameAr: 'الكل' },
    { id: 'creation', nameEn: 'Creation', nameAr: 'الإنشاء' },
    { id: 'quality', nameEn: 'Quality', nameAr: 'الجودة' },
    { id: 'research', nameEn: 'Research', nameAr: 'البحث' },
    { id: 'prototype', nameEn: 'Prototype', nameAr: 'النماذج' },
    { id: 'streak', nameEn: 'Streak', nameAr: 'المتواصل' },
    { id: 'special', nameEn: 'Special', nameAr: 'خاص' },
  ];

  if (!userAchievements) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`achievement-system ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with Level and XP */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-8 h-8" />
              {isRTL ? 'نظام الإنجازات' : 'Achievement System'}
            </h2>
            <p className="text-purple-100 mt-1">
              {isRTL ? `المستوى ${userAchievements.level}` : `Level ${userAchievements.level}`}
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{userAchievements.totalXP}</div>
            <div className="text-sm text-purple-100">{isRTL ? 'نقاط الخبرة' : 'Total XP'}</div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{isRTL ? 'التقدم إلى المستوى التالي' : 'Progress to Next Level'}</span>
            <span>{getCurrentLevelXP()} / {getXPForCurrentLevel()} XP</span>
          </div>
          <div className="w-full bg-purple-700 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${(getCurrentLevelXP() / getXPForCurrentLevel()) * 100}%` }}
            />
          </div>
        </div>

        {/* Streak Display */}
        {userAchievements.currentStreak > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Flame className="w-5 h-5 text-orange-300" />
            <span>
              {isRTL
                ? `${userAchievements.currentStreak} يوم متواصل 🔥`
                : `${userAchievements.currentStreak} Day Streak 🔥`}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'achievements', labelEn: 'Achievements', labelAr: 'الإنجازات', icon: Trophy },
          { id: 'stats', labelEn: 'Statistics', labelAr: 'الإحصائيات', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {isRTL ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {activeTab === 'achievements' && (
        <>
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isRTL ? cat.nameAr : cat.nameEn}
              </button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map(achievement => {
              const IconComponent = getCategoryIcon(achievement.category);
              const progress = getProgressPercentage(achievement);

              return (
                <div
                  key={achievement.id}
                  className={`relative border-2 rounded-lg p-4 transition-all ${
                    achievement.unlocked
                      ? getTierColor(achievement.tier) + ' shadow-md hover:shadow-lg'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  {/* Lock Icon for Locked Achievements */}
                  {!achievement.unlocked && (
                    <div className="absolute top-2 right-2">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  )}

                  {/* Achievement Icon */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {isRTL ? achievement.nameAr : achievement.nameEn}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {isRTL ? achievement.descriptionAr : achievement.descriptionEn}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!achievement.unlocked && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{isRTL ? 'التقدم' : 'Progress'}</span>
                        <span>{achievement.progress} / {achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Unlocked Badge */}
                  {achievement.unlocked && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        {isRTL ? 'مُنجَز' : 'Unlocked'}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Star className="w-4 h-4 text-yellow-500" />
                        +{achievement.xpReward} XP
                      </div>
                    </div>
                  )}

                  {/* Tier Badge */}
                  <div className="absolute bottom-2 left-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50 font-medium capitalize">
                      {achievement.tier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Progress */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">
                {isRTL ? 'التقدم الإجمالي' : 'Overall Progress'}
              </h3>
              <Medal className="w-6 h-6 text-blue-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{isRTL ? 'الإنجازات المفتوحة' : 'Unlocked Achievements'}</span>
                <span className="font-medium">
                  {userAchievements.achievements.filter(a => a.unlocked).length} / {userAchievements.achievements.filter(a => !a.hidden).length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-3 transition-all duration-500"
                  style={{ width: `${achievementService.getOverallProgress(userId)}%` }}
                />
              </div>
              <div className="text-center text-2xl font-bold text-blue-600 mt-2">
                {Math.round(achievementService.getOverallProgress(userId))}%
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Trophy}
              label={isRTL ? 'وثائق PRD' : 'PRDs Created'}
              value={userAchievements.statistics.totalPRDsCreated}
              color="blue"
            />
            <StatCard
              icon={Target}
              label={isRTL ? 'أبحاث مكتملة' : 'Researches Done'}
              value={userAchievements.statistics.totalResearches}
              color="green"
            />
            <StatCard
              icon={Zap}
              label={isRTL ? 'نماذج أولية' : 'Prototypes'}
              value={userAchievements.statistics.totalPrototypes}
              color="purple"
            />
            <StatCard
              icon={Flame}
              label={isRTL ? 'أطول سلسلة' : 'Longest Streak'}
              value={userAchievements.longestStreak}
              color="orange"
            />
          </div>

          {/* Quality Score */}
          {userAchievements.statistics.totalPRDsCreated > 0 && (
            <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <h3 className="font-bold text-lg">
                    {isRTL ? 'متوسط جودة PRD' : 'Average PRD Quality'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isRTL ? 'بناءً على جميع وثائقك' : 'Based on all your PRDs'}
                  </p>
                </div>
              </div>
              <div className="text-4xl font-bold text-yellow-600">
                {userAchievements.statistics.averagePRDScore.toFixed(1)} / 100
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievement Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center animate-bounce-in">
            <div className="text-6xl mb-4">{showNotification.icon}</div>
            <h2 className="text-2xl font-bold mb-2">
              {isRTL ? '🎉 إنجاز جديد!' : '🎉 Achievement Unlocked!'}
            </h2>
            <h3 className="text-xl font-semibold mb-2">
              {isRTL ? showNotification.nameAr : showNotification.nameEn}
            </h3>
            <p className="text-gray-600 mb-4">
              {isRTL ? showNotification.descriptionAr : showNotification.descriptionEn}
            </p>
            <div className="flex items-center justify-center gap-2 text-yellow-600 font-bold text-lg mb-6">
              <Star className="w-6 h-6" />
              +{showNotification.xpReward} XP
            </div>
            <button
              onClick={() => setShowNotification(null)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isRTL ? 'رائع!' : 'Awesome!'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: React.FC<{ className?: string }>;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
};

export default AchievementSystem;
