/**
 * Weekly Challenges Component
 * Displays active challenges, leaderboards, and submission interface
 * Section 13 Implementation
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, Award, TrendingUp, Star, Medal } from 'lucide-react';
import { challengeService } from '../services/challengeService';
import type { Challenge, LeaderboardEntry } from '../types';

interface WeeklyChallengesProps {
  userId: string;
  onSubmit?: (challengeId: string, prdId: string) => void;
  className?: string;
}

export const WeeklyChallenges: React.FC<WeeklyChallengesProps> = ({
  userId,
  onSubmit,
  className = '',
}) => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [upcomingChallenges, setUpcomingChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<'challenge' | 'leaderboard'>('challenge');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = () => {
    const active = challengeService.getActiveChallenge();
    const upcoming = challengeService.getUpcomingChallenges();

    setActiveChallenge(active);
    setUpcomingChallenges(upcoming);

    if (active) {
      const board = challengeService.getLeaderboard(active.id, 10);
      const rank = challengeService.getUserRank(active.id, userId);
      setLeaderboard(board);
      setUserRank(rank);
    }
  };

  const handleSubmit = async () => {
    if (!activeChallenge) return;

    setSubmitting(true);
    try {
      // Simulate PRD creation or use existing PRD
      const mockPrdId = `prd-${Date.now()}`;

      challengeService.submitChallenge(activeChallenge.id, userId, mockPrdId);

      if (onSubmit) {
        onSubmit(activeChallenge.id, mockPrdId);
      }

      loadChallenges();
      setSelectedTab('leaderboard');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-gray-500 font-semibold">#{rank}</span>;
    }
  };

  if (!activeChallenge) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center py-8">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Active Challenge
          </h3>
          <p className="text-gray-500">Check back soon for new challenges!</p>
        </div>

        {upcomingChallenges.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Challenges
            </h4>
            <div className="space-y-3">
              {upcomingChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-800">{challenge.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {challenge.description}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {challenge.category}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    Starts: {challenge.startDate.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Weekly Challenge</h2>
            </div>
            <p className="text-purple-100 text-sm">
              {new Date(activeChallenge.startDate).toLocaleDateString()} -{' '}
              {new Date(activeChallenge.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm mb-1">
              <Users className="w-4 h-4" />
              <span>{activeChallenge.participants} participants</span>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(
                activeChallenge.difficulty
              )}`}
            >
              {activeChallenge.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          <button
            onClick={() => setSelectedTab('challenge')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              selectedTab === 'challenge'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Challenge Details
          </button>
          <button
            onClick={() => setSelectedTab('leaderboard')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              selectedTab === 'leaderboard'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === 'challenge' ? (
          <div className="space-y-6">
            {/* Challenge Info */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {activeChallenge.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {activeChallenge.description}
              </p>
            </div>

            {/* Prize */}
            {activeChallenge.prize && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Prize</h4>
                    <p className="text-gray-700">{activeChallenge.prize}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Badge Preview */}
            {activeChallenge.badge && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Completion Badge
                </h4>
                <div className="flex items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                    style={{ backgroundColor: activeChallenge.badge.color + '20' }}
                  >
                    {activeChallenge.badge.icon}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800">
                      {activeChallenge.badge.name}
                    </h5>
                    <p className="text-sm text-gray-600">
                      {activeChallenge.badge.description}
                    </p>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full mt-1 inline-block">
                      {activeChallenge.badge.rarity}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="border-t pt-6">
              {userRank ? (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                    <Star className="w-5 h-5" />
                    <span className="font-semibold">
                      You're ranked #{userRank}!
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Check the leaderboard to see your position
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Submit Your PRD
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Leaderboard Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Top Performers
              </h3>
              <span className="text-sm text-gray-500">
                {leaderboard.length} entries
              </span>
            </div>

            {/* Leaderboard List */}
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No submissions yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.submissionId}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                      entry.userId === userId
                        ? 'bg-purple-50 border-purple-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-12 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <img
                      src={entry.avatar}
                      alt={entry.username}
                      className="w-10 h-10 rounded-full border-2 border-gray-200"
                    />

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {entry.username}
                        {entry.userId === userId && (
                          <span className="ml-2 text-xs px-2 py-1 bg-purple-600 text-white rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {entry.score}
                      </div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>

                    {/* Badge */}
                    {entry.badge && (
                      <div className="text-2xl" title={entry.badge.name}>
                        {entry.badge.icon}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyChallenges;
