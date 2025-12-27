/**
 * مكون QualityScorer - Section 9
 * يعرض تقييم جودة PRD مع الاقتراحات والشارات
 */

import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, CheckCircle, AlertCircle, Lightbulb, Target } from 'lucide-react';
import { QualityScore } from '../types/quality';
import scoringService from '../services/scoringService';

interface QualityScorerProps {
  prdContent: string;
  onScoreCalculated?: (score: QualityScore) => void;
  autoCalculate?: boolean;
}

const QualityScorer: React.FC<QualityScorerProps> = ({
  prdContent,
  onScoreCalculated,
  autoCalculate = true,
}) => {
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (autoCalculate && prdContent.length > 50) {
      calculateScore();
    }
  }, [prdContent, autoCalculate]);

  const calculateScore = () => {
    if (!prdContent || prdContent.length < 50) {
      return;
    }

    setIsCalculating(true);

    // محاكاة تأخير للتحسين في تجربة المستخدم
    setTimeout(() => {
      const score = scoringService.evaluatePRD(prdContent);
      setQualityScore(score);
      setIsCalculating(false);

      if (onScoreCalculated) {
        onScoreCalculated(score);
      }
    }, 500);
  };

  const getBadgeColor = (badge: string): string => {
    switch (badge) {
      case 'platinum': return 'from-purple-500 to-pink-500';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'bronze': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getBadgeEmoji = (badge: string): string => {
    switch (badge) {
      case 'platinum': return '💎';
      case 'gold': return '🏆';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '📋';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-purple-600';
    if (score >= 85) return 'text-yellow-600';
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDimensionColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!prdContent || prdContent.length < 50) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Write at least 50 characters to see quality score</p>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Calculating quality score...</p>
      </div>
    );
  }

  if (!qualityScore) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <button
          onClick={calculateScore}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Calculate Quality Score
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className={`relative bg-gradient-to-r ${getBadgeColor(qualityScore.badge)} rounded-lg shadow-lg p-8 text-white overflow-hidden`}>
        <div className="absolute top-0 right-0 text-9xl opacity-10">
          {getBadgeEmoji(qualityScore.badge)}
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium opacity-90">Quality Score</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold">{qualityScore.overall}</span>
                <span className="text-3xl opacity-75">/100</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-6xl mb-2">{getBadgeEmoji(qualityScore.badge)}</div>
              <div className="text-sm font-semibold uppercase tracking-wider">
                {qualityScore.badge} PRD
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {qualityScore.overall >= 90 && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur">
                🌟 Outstanding
              </span>
            )}
            {qualityScore.overall >= 70 && qualityScore.overall < 90 && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur">
                ✨ Great Work
              </span>
            )}
            {qualityScore.overall < 70 && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur">
                📈 Room for Improvement
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dimensions Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Score Breakdown
        </h4>
        <div className="space-y-4">
          {Object.values(qualityScore.dimensions).map((dimension) => (
            <div key={dimension.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{dimension.name}</span>
                <span className={`font-bold ${getScoreColor(dimension.score)}`}>
                  {dimension.score}/{dimension.maxScore}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${getDimensionColor(dimension.score)} transition-all duration-500 rounded-full`}
                  style={{ width: `${dimension.score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{dimension.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      {qualityScore.strengths.length > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            Strengths
          </h4>
          <ul className="space-y-2">
            {qualityScore.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-green-700">
                <span className="text-green-500 mt-1">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {qualityScore.suggestions.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-800">
            <Lightbulb className="w-5 h-5" />
            Suggestions for Improvement
          </h4>
          <ul className="space-y-2">
            {qualityScore.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-blue-700">
                <span className="text-blue-500 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Call to Action */}
      {qualityScore.overall < 85 && (
        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300 rounded-lg p-6 text-center">
          <Award className="w-12 h-12 text-orange-600 mx-auto mb-3" />
          <h4 className="font-bold text-lg text-orange-900 mb-2">
            {qualityScore.overall >= 70
              ? "You're close to a Gold PRD!"
              : "Improve your PRD to unlock higher badges!"}
          </h4>
          <p className="text-orange-800">
            {qualityScore.overall >= 70
              ? `Just ${85 - qualityScore.overall} more points to reach Gold level!`
              : 'Follow the suggestions above to boost your quality score.'}
          </p>
        </div>
      )}

      {qualityScore.overall >= 85 && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-6 text-center">
          <Award className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <h4 className="font-bold text-lg text-purple-900 mb-2">
            Excellent Work! 🎉
          </h4>
          <p className="text-purple-800">
            Your PRD meets professional standards. Ready to generate your prototype!
          </p>
        </div>
      )}
    </div>
  );
};

export default QualityScorer;
