/**
 * AI Mentor Component
 * Section 16: مساعد AI شخصي يتعلم من المستخدم
 */

import React, { useState, useEffect } from 'react';
import {
  Brain, Lightbulb, TrendingUp, X, ThumbsUp, ThumbsDown,
  Sparkles, Target, BarChart, MessageCircle, Star, Award,
  CheckCircle, XCircle, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import mentorService from '../services/mentorService';
import {
  MentorSuggestion,
  MentorInsight,
  MentorProfile,
  SuggestionType,
  SuggestionPriority,
} from '../types/mentorTypes';

interface AIMentorProps {
  userId: string;
  language: 'en-US' | 'ar-EG';
  currentContext?: string;
  onApplySuggestion?: (suggestion: MentorSuggestion) => void;
  compact?: boolean;
}

const AIMentor: React.FC<AIMentorProps> = ({
  userId,
  language,
  currentContext,
  onApplySuggestion,
  compact = false,
}) => {
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [suggestions, setSuggestions] = useState<MentorSuggestion[]>([]);
  const [insights, setInsights] = useState<MentorInsight[]>([]);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'insights' | 'profile'>('suggestions');
  const [isMinimized, setIsMinimized] = useState(false);

  const isRTL = language === 'ar-EG';

  useEffect(() => {
    loadMentorData();
  }, [userId, currentContext]);

  const loadMentorData = () => {
    const mentorProfile = mentorService.getMentorProfile(userId);
    setProfile(mentorProfile);

    if (mentorProfile) {
      const newSuggestions = mentorService.generateSuggestions(userId, currentContext);
      setSuggestions(newSuggestions);

      const newInsights = mentorService.generateInsights(userId);
      setInsights(newInsights);
    }
  };

  const handleApplySuggestion = (suggestion: MentorSuggestion) => {
    mentorService.applySuggestion(userId, suggestion.id);
    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
    }
    loadMentorData();
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    mentorService.dismissSuggestion(userId, suggestionId);
    loadMentorData();
  };

  const handleRateSuggestion = (suggestionId: string, helpful: boolean) => {
    mentorService.rateSuggestion(userId, suggestionId, helpful);
    loadMentorData();
  };

  const getSuggestionIcon = (type: SuggestionType) => {
    const icons = {
      feature: Sparkles,
      improvement: TrendingUp,
      metric: BarChart,
      research: Target,
      template: Star,
      'best-practice': Award,
    };
    return icons[type] || Lightbulb;
  };

  const getPriorityColor = (priority: SuggestionPriority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700 border-gray-300',
      medium: 'bg-blue-100 text-blue-700 border-blue-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      critical: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[priority];
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Compact view for sidebar
  if (compact && !isMinimized) {
    return (
      <div className={`ai-mentor-compact ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <h3 className="font-bold">{isRTL ? 'مرشد AI' : 'AI Mentor'}</h3>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>

          {suggestions.length > 0 ? (
            <div className="space-y-2">
              {suggestions.slice(0, 2).map(suggestion => {
                const Icon = getSuggestionIcon(suggestion.type);
                return (
                  <div
                    key={suggestion.id}
                    className="bg-white bg-opacity-20 rounded-lg p-3 text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium mb-1">
                          {isRTL ? suggestion.titleAr : suggestion.titleEn}
                        </p>
                        <p className="text-xs text-purple-100 line-clamp-2">
                          {isRTL ? suggestion.contentAr : suggestion.contentEn}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleApplySuggestion(suggestion)}
                        className="flex-1 px-2 py-1 bg-white text-purple-600 rounded text-xs font-medium hover:bg-opacity-90 transition-colors"
                      >
                        {isRTL ? 'تطبيق' : 'Apply'}
                      </button>
                      <button
                        onClick={() => handleDismissSuggestion(suggestion.id)}
                        className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors"
                      >
                        {isRTL ? 'تجاهل' : 'Dismiss'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-purple-100">
              {isRTL
                ? 'لا توجد اقتراحات حالياً. استمر في العمل وسأتعلم من أسلوبك!'
                : 'No suggestions right now. Keep working and I\'ll learn your style!'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow z-50"
      >
        <Brain className="w-6 h-6" />
        {suggestions.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {suggestions.length}
          </div>
        )}
      </button>
    );
  }

  // Full view
  return (
    <div className={`ai-mentor ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {isRTL ? 'مرشد AI الشخصي' : 'Your AI Mentor'}
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                {isRTL
                  ? `تعلمت من ${profile.learningData.totalPRDsAnalyzed} وثيقة`
                  : `Learned from ${profile.learningData.totalPRDsAnalyzed} PRDs`}
              </p>
            </div>
          </div>

          {/* Helpfulness Rate */}
          {profile.helpfulnessRate > 0 && (
            <div className="text-center">
              <div className="text-3xl font-bold">
                {Math.round(profile.helpfulnessRate * 100)}%
              </div>
              <div className="text-xs text-purple-100">
                {isRTL ? 'معدل الفائدة' : 'Helpful'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'suggestions', labelEn: 'Suggestions', labelAr: 'الاقتراحات', icon: Lightbulb },
          { id: 'insights', labelEn: 'Insights', labelAr: 'الرؤى', icon: TrendingUp },
          { id: 'profile', labelEn: 'Your Style', labelAr: 'أسلوبك', icon: Star },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {isRTL ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {isRTL ? 'لا توجد اقتراحات حالياً' : 'No Suggestions Yet'}
              </h3>
              <p className="text-gray-500">
                {isRTL
                  ? 'استمر في إنشاء PRDs وسأبدأ بتقديم اقتراحات شخصية'
                  : 'Keep creating PRDs and I\'ll start providing personalized suggestions'}
              </p>
            </div>
          ) : (
            suggestions.map(suggestion => {
              const Icon = getSuggestionIcon(suggestion.type);
              const isExpanded = expandedSuggestion === suggestion.id;

              return (
                <div
                  key={suggestion.id}
                  className="border-2 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Suggestion Header */}
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg">
                          {isRTL ? suggestion.titleAr : suggestion.titleEn}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                            suggestion.priority
                          )}`}
                        >
                          {suggestion.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {isRTL ? suggestion.contentAr : suggestion.contentEn}
                      </p>

                      {/* Confidence Score */}
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <span className="text-gray-500">
                          {isRTL ? 'الثقة:' : 'Confidence:'}
                        </span>
                        <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              suggestion.confidence >= 80
                                ? 'bg-green-500'
                                : suggestion.confidence >= 60
                                ? 'bg-yellow-500'
                                : 'bg-orange-500'
                            }`}
                            style={{ width: `${suggestion.confidence}%` }}
                          />
                        </div>
                        <span className={`font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                          {suggestion.confidence}%
                        </span>
                      </div>

                      {/* Context (if available) */}
                      {suggestion.context && isExpanded && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-600 italic">
                            "{suggestion.context}"
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {!suggestion.applied && !suggestion.dismissed && (
                          <>
                            <button
                              onClick={() => handleApplySuggestion(suggestion)}
                              className="flex items-center gap-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {isRTL ? 'تطبيق الاقتراح' : 'Apply Suggestion'}
                            </button>
                            <button
                              onClick={() => handleDismissSuggestion(suggestion.id)}
                              className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                              <XCircle className="w-4 h-4" />
                              {isRTL ? 'تجاهل' : 'Dismiss'}
                            </button>
                          </>
                        )}

                        {(suggestion.applied || suggestion.dismissed) && (
                          <div className="flex gap-2 items-center">
                            <span className="text-sm text-gray-500">
                              {isRTL ? 'هل كان هذا مفيداً؟' : 'Was this helpful?'}
                            </span>
                            <button
                              onClick={() => handleRateSuggestion(suggestion.id, true)}
                              className={`p-2 rounded-lg transition-colors ${
                                suggestion.helpful === true
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 text-gray-500 hover:bg-green-50'
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRateSuggestion(suggestion.id, false)}
                              className={`p-2 rounded-lg transition-colors ${
                                suggestion.helpful === false
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-gray-100 text-gray-500 hover:bg-red-50'
                              }`}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Refresh Button */}
          <button
            onClick={loadMentorData}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {isRTL ? 'تحديث الاقتراحات' : 'Refresh Suggestions'}
          </button>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {isRTL ? 'لا توجد رؤى بعد' : 'No Insights Yet'}
              </h3>
              <p className="text-gray-500">
                {isRTL
                  ? 'أنشئ المزيد من PRDs للحصول على رؤى شخصية حول أسلوبك'
                  : 'Create more PRDs to get personalized insights about your style'}
              </p>
            </div>
          ) : (
            insights.map(insight => (
              <div
                key={insight.id}
                className={`border-2 rounded-lg p-5 ${
                  insight.category === 'strength'
                    ? 'bg-green-50 border-green-200'
                    : insight.category === 'improvement'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {insight.category === 'strength' && (
                    <Award className="w-6 h-6 text-green-600" />
                  )}
                  {insight.category === 'improvement' && (
                    <Target className="w-6 h-6 text-yellow-600" />
                  )}
                  {insight.category === 'trend' && (
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">
                      {isRTL ? insight.titleAr : insight.titleEn}
                    </h3>
                    <p className="text-gray-700">
                      {isRTL ? insight.descriptionAr : insight.descriptionEn}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Writing Style */}
          <div className="border-2 rounded-lg p-5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              {isRTL ? 'أسلوب الكتابة' : 'Writing Style'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {isRTL ? 'الطول المفضل:' : 'Preferred Length:'}
                </span>
                <span className="font-medium capitalize">
                  {profile.learningData.userStyle.preferredLength}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {isRTL ? 'متوسط عدد الكلمات:' : 'Avg. Word Count:'}
                </span>
                <span className="font-medium">
                  {Math.round(profile.learningData.userStyle.averageResponseLength)} words
                </span>
              </div>
            </div>
          </div>

          {/* Focus Areas */}
          {profile.learningData.userStyle.preferredFeatureTypes.length > 0 && (
            <div className="border-2 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                {isRTL ? 'مجالات التركيز' : 'Focus Areas'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.learningData.userStyle.preferredFeatureTypes.map(type => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="border-2 rounded-lg p-5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-purple-600" />
              {isRTL ? 'إحصائيات' : 'Statistics'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {profile.totalSuggestionsApplied}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {isRTL ? 'اقتراحات مطبقة' : 'Suggestions Applied'}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {profile.learningData.totalPRDsAnalyzed}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {isRTL ? 'وثائق محللة' : 'PRDs Analyzed'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMentor;
