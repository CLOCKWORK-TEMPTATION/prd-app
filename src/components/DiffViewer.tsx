/**
 * DiffViewer Component - displays feature differences between versions
 * Section 19: Compare Versions Feature
 */

import React, { useMemo } from 'react';
import {
  Plus, Minus, Edit, Check, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { FeatureDiff, DiffType, Feature } from '../types/version';

interface DiffViewerProps {
  diffs: FeatureDiff[];
  showUnchanged?: boolean;
  groupByCategory?: boolean;
  highlightMode?: 'side-by-side' | 'unified';
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  diffs,
  showUnchanged = false,
  groupByCategory = true,
  highlightMode = 'unified'
}) => {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());
  const [expandedFeatures, setExpandedFeatures] = React.useState<Set<string>>(new Set());

  // Group diffs by category if requested
  const groupedDiffs = useMemo(() => {
    if (!groupByCategory) {
      return { 'All Features': diffs };
    }

    const groups: Record<string, FeatureDiff[]> = {};
    diffs.forEach(diff => {
      const category = diff.feature.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(diff);
    });

    return groups;
  }, [diffs, groupByCategory]);

  // Filter out unchanged if requested
  const filteredDiffs = useMemo(() => {
    if (showUnchanged) return groupedDiffs;

    const filtered: Record<string, FeatureDiff[]> = {};
    Object.entries(groupedDiffs).forEach(([category, categoryDiffs]) => {
      const nonUnchanged = categoryDiffs.filter(diff => diff.type !== DiffType.UNCHANGED);
      if (nonUnchanged.length > 0) {
        filtered[category] = nonUnchanged;
      }
    });

    return filtered;
  }, [groupedDiffs, showUnchanged]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleFeature = (featureId: string) => {
    setExpandedFeatures(prev => {
      const next = new Set(prev);
      if (next.has(featureId)) {
        next.delete(featureId);
      } else {
        next.add(featureId);
      }
      return next;
    });
  };

  const getDiffIcon = (type: DiffType) => {
    switch (type) {
      case DiffType.ADDED:
        return <Plus className="w-4 h-4" />;
      case DiffType.REMOVED:
        return <Minus className="w-4 h-4" />;
      case DiffType.MODIFIED:
        return <Edit className="w-4 h-4" />;
      case DiffType.UNCHANGED:
        return <Check className="w-4 h-4" />;
    }
  };

  const getDiffColor = (type: DiffType) => {
    switch (type) {
      case DiffType.ADDED:
        return 'text-green-600 bg-green-50 border-green-200';
      case DiffType.REMOVED:
        return 'text-red-600 bg-red-50 border-red-200';
      case DiffType.MODIFIED:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case DiffType.UNCHANGED:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDiffLabel = (type: DiffType) => {
    switch (type) {
      case DiffType.ADDED:
        return 'Added';
      case DiffType.REMOVED:
        return 'Removed';
      case DiffType.MODIFIED:
        return 'Modified';
      case DiffType.UNCHANGED:
        return 'Unchanged';
    }
  };

  const getPriorityColor = (priority: Feature['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-700 bg-red-100';
      case 'high':
        return 'text-orange-700 bg-orange-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'low':
        return 'text-green-700 bg-green-100';
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Added ({diffs.filter(d => d.type === DiffType.ADDED).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Removed ({diffs.filter(d => d.type === DiffType.REMOVED).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Modified ({diffs.filter(d => d.type === DiffType.MODIFIED).length})</span>
          </div>
          {showUnchanged && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>Unchanged ({diffs.filter(d => d.type === DiffType.UNCHANGED).length})</span>
            </div>
          )}
        </div>
      </div>

      {Object.entries(filteredDiffs).map(([category, categoryDiffs]) => {
        const isExpanded = expandedCategories.has(category);

        return (
          <div key={category} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{category}</h3>
                <span className="text-sm text-gray-600">({categoryDiffs.length})</span>
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {isExpanded && (
              <div className="divide-y">
                {categoryDiffs.map((diff) => {
                  const isFeatureExpanded = expandedFeatures.has(diff.feature.id);

                  return (
                    <div
                      key={diff.feature.id}
                      className={`p-4 border-l-4 ${getDiffColor(diff.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getDiffColor(diff.type)}`}>
                              {getDiffIcon(diff.type)}
                              {getDiffLabel(diff.type)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(diff.feature.priority)}`}>
                              {diff.feature.priority}
                            </span>
                            {diff.feature.implemented && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                ✓ Implemented
                              </span>
                            )}
                          </div>

                          <h4 className="font-semibold text-gray-900 mb-1">
                            {diff.feature.name}
                          </h4>

                          <p className="text-gray-700 text-sm mb-2">
                            {diff.feature.description}
                          </p>

                          {diff.type === DiffType.MODIFIED && diff.changes && diff.changes.length > 0 && (
                            <button
                              onClick={() => toggleFeature(diff.feature.id)}
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              {isFeatureExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Hide changes
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Show {diff.changes.length} change(s)
                                </>
                              )}
                            </button>
                          )}

                          {isFeatureExpanded && diff.changes && (
                            <div className="mt-3 space-y-2 pl-4 border-l-2 border-blue-300">
                              {diff.changes.map((change, idx) => (
                                <div key={idx} className="text-sm">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                                    <span className="text-gray-700">{change.field}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {Object.keys(filteredDiffs).length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Check className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">No differences found</p>
          <p className="text-sm">The versions are identical</p>
        </div>
      )}
    </div>
  );
};

export default DiffViewer;
