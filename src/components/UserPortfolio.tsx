/**
 * مكون UserPortfolio - Section 10
 * يعرض Portfolio المستخدم مع الإحصائيات والإنجازات والـ PRDs
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  TrendingUp,
  Award,
  Calendar,
  Download,
  Trash2,
  Eye,
  BarChart3,
  Clock,
  Target,
  Flame,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UserPortfolio, PRDEntry } from '../types/portfolio';
import portfolioService from '../services/portfolioService';

interface UserPortfolioProps {
  onSelectPRD?: (prd: PRDEntry) => void;
  className?: string;
}

const UserPortfolioComponent: React.FC<UserPortfolioProps> = ({ onSelectPRD, className = '' }) => {
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'prds' | 'timeline' | 'achievements'>('overview');
  const [expandedPRD, setExpandedPRD] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'completed' | 'archived'>('all');

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = () => {
    const data = portfolioService.getPortfolio();
    setPortfolio(data);
  };

  const handleExportJSON = () => {
    const json = portfolioService.exportAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const content = portfolioService.exportAsPDFContent();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeletePRD = (id: string) => {
    if (confirm('Are you sure you want to delete this PRD?')) {
      portfolioService.deletePRD(id);
      loadPortfolio();
    }
  };

  const getBadgeColor = (badge?: string): string => {
    switch (badge) {
      case 'platinum': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 'bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default: return 'bg-gray-400';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredPRDs = portfolio?.prds.filter(prd => {
    if (filterStatus === 'all') return true;
    return prd.status === filterStatus;
  }) || [];

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">📁 My Portfolio</h2>
            <p className="text-blue-100">Track your PRDs, achievements, and progress</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur transition flex items-center gap-2"
              title="Export as JSON"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur transition flex items-center gap-2"
              title="Export as Markdown"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow p-2 flex gap-2 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'prds', label: 'PRDs', icon: FileText },
          { key: 'timeline', label: 'Timeline', icon: Clock },
          { key: 'achievements', label: 'Achievements', icon: Award },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveView(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeView === key
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{portfolio.stats.totalPRDs}</span>
            </div>
            <p className="text-gray-600 text-sm">Total PRDs</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">
                {portfolio.stats.successRate.toFixed(0)}%
              </span>
            </div>
            <p className="text-gray-600 text-sm">Success Rate</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-gray-900">
                {portfolio.stats.averageQualityScore.toFixed(0)}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Avg Quality Score</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-8 h-8 text-orange-600" />
              <span className="text-3xl font-bold text-gray-900">{portfolio.stats.streak}</span>
            </div>
            <p className="text-gray-600 text-sm">Day Streak 🔥</p>
          </div>

          <div className="col-span-full bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Statistics Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Completed PRDs</p>
                <p className="text-2xl font-bold text-green-600">{portfolio.stats.completedPRDs}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Draft PRDs</p>
                <p className="text-2xl font-bold text-yellow-600">{portfolio.stats.draftPRDs}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Best Score</p>
                <p className="text-2xl font-bold text-purple-600">{portfolio.stats.bestScore}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Improvement Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {portfolio.stats.improvementRate > 0 ? '+' : ''}
                  {portfolio.stats.improvementRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Active</p>
                <p className="text-lg font-semibold text-gray-700">
                  {portfolio.stats.lastActiveDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRDs View */}
      {activeView === 'prds' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {['all', 'draft', 'completed', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {filteredPRDs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No PRDs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPRDs.map((prd) => (
                <div key={prd.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{prd.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(prd.status)}`}>
                            {prd.status}
                          </span>
                          {prd.qualityScore && (
                            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getBadgeColor(prd.qualityScore.badge)}`}>
                              {prd.qualityScore.badge} {prd.qualityScore.overall}/100
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {prd.createdAt.toLocaleDateString()}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                            {prd.version}
                          </span>
                          {prd.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExpandedPRD(expandedPRD === prd.id ? null : prd.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title="View details"
                        >
                          {expandedPRD === prd.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        {onSelectPRD && (
                          <button
                            onClick={() => onSelectPRD(prd)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition"
                            title="View PRD"
                          >
                            <Eye className="w-5 h-5 text-blue-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePRD(prd.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedPRD === prd.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-white p-4 rounded border border-gray-200 max-h-64 overflow-y-auto">
                          {prd.content.substring(0, 500)}
                          {prd.content.length > 500 && '...'}
                        </pre>
                      </div>
                      {prd.qualityScore && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                          {Object.values(prd.qualityScore.dimensions).map(dim => (
                            <div key={dim.name} className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-xs text-gray-600">{dim.name}</p>
                              <p className="text-lg font-bold text-gray-900">{dim.score}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timeline View */}
      {activeView === 'timeline' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Activity Timeline
          </h3>
          {portfolio.timeline.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-4">
              {portfolio.timeline.map((item, index) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.type === 'achievement' ? 'bg-yellow-100' :
                      item.type === 'completed' ? 'bg-green-100' :
                      item.type === 'created' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {item.badge || (
                        item.type === 'achievement' ? '🏆' :
                        item.type === 'completed' ? '✅' :
                        item.type === 'created' ? '➕' : '📝'
                      )}
                    </div>
                    {index < portfolio.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.date.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Achievements View */}
      {activeView === 'achievements' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h3 className="font-semibold text-lg mb-2">
              🏆 Achievements ({portfolio.achievements.filter(a => a.isUnlocked).length}/{portfolio.achievements.length})
            </h3>
            <p className="text-gray-600 text-sm">Unlock achievements by creating and improving your PRDs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`rounded-lg shadow p-6 ${
                  achievement.isUnlocked
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300'
                    : 'bg-gray-50 border-2 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-5xl ${achievement.isUnlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{achievement.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <p className="text-xs text-gray-500">
                        Unlocked on {achievement.unlockedAt.toLocaleDateString()}
                      </p>
                    )}
                    {!achievement.isUnlocked && achievement.progress && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress.current}/{achievement.progress.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${(achievement.progress.current / achievement.progress.target) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPortfolioComponent;
