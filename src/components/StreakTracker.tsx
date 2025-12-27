/**
 * Streak Tracker Component
 * Displays user streak, progress, rewards, and notifications
 * Section 14 Implementation
 */

import React, { useState, useEffect } from 'react';
import { Flame, Award, Bell, TrendingUp, Calendar, Target, Crown } from 'lucide-react';
import { streakService } from '../services/streakService';
import type { Streak, StreakReward, StreakNotification, UserActivity } from '../types';

interface StreakTrackerProps {
  userId: string;
  onActivity?: (activity: UserActivity) => void;
  compact?: boolean;
  className?: string;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({
  userId,
  onActivity,
  compact = false,
  className = '',
}) => {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [rewards, setRewards] = useState<StreakReward[]>([]);
  const [notifications, setNotifications] = useState<StreakNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadStreakData();
  }, [userId]);

  const loadStreakData = () => {
    const streakData = streakService.getStreak(userId);
    const statsData = streakService.getStreakStats(userId);
    const unlockedRewards = streakService.getUnlockedRewards(userId);
    const userNotifications = streakService.getNotifications(userId);

    setStreak(streakData);
    setStats(statsData);
    setRewards(unlockedRewards);
    setNotifications(userNotifications);
  };

  const handleActivity = (activityType: UserActivity['activityType']) => {
    const activity: UserActivity = {
      userId,
      activityType,
      timestamp: new Date(),
    };

    streakService.recordActivity(activity);
    loadStreakData();

    if (onActivity) {
      onActivity(activity);
    }
  };

  const markNotificationRead = (notificationId: string) => {
    streakService.markNotificationRead(notificationId);
    loadStreakData();
  };

  const getFlameColor = (currentStreak: number) => {
    if (currentStreak >= 30) return 'text-purple-600';
    if (currentStreak >= 14) return 'text-red-600';
    if (currentStreak >= 7) return 'text-orange-600';
    if (currentStreak >= 3) return 'text-yellow-600';
    return 'text-gray-400';
  };

  const getStreakMessage = (currentStreak: number) => {
    if (currentStreak === 0) return 'Start your streak today!';
    if (currentStreak < 3) return 'Keep going!';
    if (currentStreak < 7) return 'Great start!';
    if (currentStreak < 14) return "You're on fire!";
    if (currentStreak < 30) return 'Incredible dedication!';
    return 'Legendary streak!';
  };

  if (!streak || !stats) return null;

  // Compact view for header/sidebar
  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative">
          <Flame className={`w-8 h-8 ${getFlameColor(streak.currentStreak)}`} />
          {streak.currentStreak > 0 && (
            <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {streak.currentStreak}
            </div>
          )}
        </div>
        <div>
          <div className="font-bold text-gray-800">
            {streak.currentStreak} day streak
          </div>
          <div className="text-xs text-gray-500">
            {stats.nextMilestone
              ? `${stats.daysUntilNextMilestone} days to ${stats.nextMilestone.name}`
              : 'All milestones unlocked!'}
          </div>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Flame className="w-16 h-16" />
              {streak.currentStreak > 0 && (
                <div className="absolute -top-2 -right-2 bg-white text-orange-600 text-xl font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                  {streak.currentStreak}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{streak.currentStreak} Day Streak!</h2>
              <p className="text-orange-100 text-lg">{getStreakMessage(streak.currentStreak)}</p>
            </div>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Bell className="w-6 h-6" />
            {notifications.filter((n) => !n.read).length > 0 && (
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-orange-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.filter((n) => !n.read).length}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="border-b bg-gray-50 p-4 max-h-64 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No notifications yet</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.read
                      ? 'bg-white border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.timestamp.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 p-6 border-b">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.currentStreak}</div>
          <div className="text-sm text-gray-500">Current Streak</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.longestStreak}</div>
          <div className="text-sm text-gray-500">Longest Streak</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalActiveDays}</div>
          <div className="text-sm text-gray-500">Total Active Days</div>
        </div>
      </div>

      {/* Next Milestone */}
      {stats.nextMilestone && (
        <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <div className="flex items-center gap-4">
            <Target className="w-8 h-8 text-purple-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Next Milestone</h3>
              <p className="text-sm text-gray-600 mb-2">
                {stats.nextMilestone.name} - {stats.nextMilestone.description}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500"
                    style={{
                      width: `${
                        (stats.currentStreak / stats.nextMilestone.milestone) * 100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-purple-600">
                  {stats.daysUntilNextMilestone} days to go
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unlocked Rewards */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Unlocked Rewards ({rewards.length})
        </h3>

        {rewards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Crown className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Complete your first streak to unlock rewards!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: reward.badge.color + '20' }}
                >
                  {reward.badge.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">
                    {reward.name}
                  </h4>
                  <p className="text-sm text-gray-600 truncate">
                    {reward.milestone} day milestone
                  </p>
                  <span
                    className="text-xs px-2 py-1 rounded-full inline-block mt-1"
                    style={{
                      backgroundColor: reward.badge.color + '20',
                      color: reward.badge.color,
                    }}
                  >
                    {reward.badge.rarity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions (for testing) */}
      <div className="p-6 bg-gray-50 rounded-b-lg border-t">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleActivity('prd_created')}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
          >
            Record PRD Created
          </button>
          <button
            onClick={() => handleActivity('research_done')}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Record Research
          </button>
          <button
            onClick={() => handleActivity('prototype_generated')}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            Record Prototype
          </button>
          <button
            onClick={() => streakService.sendReminder(userId)}
            className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
          >
            Send Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreakTracker;
