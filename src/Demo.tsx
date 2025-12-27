/**
 * Demo Application
 * Showcases Section 13 (Weekly Challenges) and Section 14 (Streak System)
 */

import React, { useState } from 'react';
import { WeeklyChallenges } from './components/WeeklyChallenges';
import { StreakTracker } from './components/StreakTracker';
import { streakService } from './services/streakService';
import type { UserActivity } from './types';

export const Demo: React.FC = () => {
  const [userId] = useState('demo-user-' + Math.random().toString(36).substr(2, 9));
  const [activeTab, setActiveTab] = useState<'challenges' | 'streak' | 'both'>('both');

  const handleChallengeSubmit = (challengeId: string, prdId: string) => {
    // Record activity when challenge is submitted
    streakService.recordActivity({
      userId,
      activityType: 'challenge_submitted',
      timestamp: new Date(),
      metadata: { challengeId, prdId },
    });

    alert('✅ Challenge submitted successfully! Your streak has been updated.');
  };

  const handleActivity = (activity: UserActivity) => {
    console.log('Activity recorded:', activity);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Section 13 & 14 Demo
              </h1>
              <p className="text-sm text-gray-600">
                Weekly Challenges & Streak System Implementation
              </p>
            </div>

            {/* Compact Streak in Header */}
            <div className="hidden md:block">
              <StreakTracker userId={userId} compact={true} />
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'both'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Both Features
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'challenges'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Weekly Challenges Only
          </button>
          <button
            onClick={() => setActiveTab('streak')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'streak'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Streak System Only
          </button>
        </div>

        {/* Content */}
        {activeTab === 'both' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Challenges */}
            <WeeklyChallenges
              userId={userId}
              onSubmit={handleChallengeSubmit}
            />

            {/* Streak Tracker */}
            <StreakTracker userId={userId} onActivity={handleActivity} />
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="max-w-2xl mx-auto">
            <WeeklyChallenges
              userId={userId}
              onSubmit={handleChallengeSubmit}
            />
          </div>
        )}

        {activeTab === 'streak' && (
          <div className="max-w-2xl mx-auto">
            <StreakTracker userId={userId} onActivity={handleActivity} />
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            ℹ️ Implementation Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Section 13: Weekly Challenges</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>3 default challenges (Sustainability, AI, UX)</li>
                <li>Real-time leaderboard with top 10</li>
                <li>Badge & reward system</li>
                <li>Multiple difficulty levels</li>
                <li>Participant tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Section 14: Streak System</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>5 milestone rewards (3, 7, 14, 30, 100 days)</li>
                <li>Activity tracking & notifications</li>
                <li>Streak history & statistics</li>
                <li>Daily reminders to maintain streak</li>
                <li>Unlockable badges</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>User ID:</strong> {userId} (unique session ID)
            </p>
            <p className="text-sm text-blue-700 mt-1">
              <strong>Storage:</strong> Data persists in localStorage
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
        <p>
          Built with React, TypeScript, and Tailwind CSS
        </p>
        <p className="mt-1">
          See <code className="bg-gray-200 px-2 py-1 rounded">IMPLEMENTATION.md</code> for
          detailed documentation
        </p>
      </footer>
    </div>
  );
};

export default Demo;
