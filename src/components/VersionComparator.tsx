/**
 * VersionComparator Component - main component for version comparison
 * Section 19: Compare Versions Feature
 */

import React, { useState, useMemo } from 'react';
import {
  GitCompare, Download, FileText, BarChart3, RefreshCw,
  ArrowLeftRight, Sliders, Eye, EyeOff, Share2, Zap
} from 'lucide-react';
import { Version, ComparisonResult, VersionType } from '../types/version';
import {
  compareVersions,
  generateFeatureDiffs,
  createSampleVersions,
  calculateSimilarityScore,
  exportVersionToMarkdown,
  exportVersionToJSON,
  createABTest
} from '../services/versionService';
import DiffViewer from './DiffViewer';

interface VersionComparatorProps {
  initialVersions?: Version[];
  onABTestCreate?: (config: any) => void;
}

export const VersionComparator: React.FC<VersionComparatorProps> = ({
  initialVersions,
  onABTestCreate
}) => {
  const [versions] = useState<Version[]>(initialVersions || createSampleVersions());
  const [selectedVersionA, setSelectedVersionA] = useState<string>(versions[0]?.id || '');
  const [selectedVersionB, setSelectedVersionB] = useState<string>(versions[1]?.id || '');
  const [showUnchanged, setShowUnchanged] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [viewMode, setViewMode] = useState<'diff' | 'sidebyside' | 'stats'>('diff');

  // Get selected versions
  const versionA = useMemo(
    () => versions.find(v => v.id === selectedVersionA),
    [versions, selectedVersionA]
  );

  const versionB = useMemo(
    () => versions.find(v => v.id === selectedVersionB),
    [versions, selectedVersionB]
  );

  // Calculate comparison
  const comparison: ComparisonResult | null = useMemo(() => {
    if (!versionA || !versionB) return null;
    return compareVersions(versionA, versionB);
  }, [versionA, versionB]);

  // Generate diffs
  const diffs = useMemo(() => {
    if (!versionA || !versionB) return [];
    return generateFeatureDiffs(versionA, versionB);
  }, [versionA, versionB]);

  // Calculate similarity
  const similarityScore = useMemo(() => {
    if (!versionA || !versionB) return 0;
    return calculateSimilarityScore(versionA, versionB);
  }, [versionA, versionB]);

  const handleSwapVersions = () => {
    setSelectedVersionA(selectedVersionB);
    setSelectedVersionB(selectedVersionA);
  };

  const handleExportComparison = (format: 'json' | 'markdown') => {
    if (!comparison) return;

    let content = '';
    let filename = '';

    if (format === 'json') {
      content = JSON.stringify(comparison, null, 2);
      filename = `comparison-${versionA?.type}-vs-${versionB?.type}.json`;
    } else {
      content = generateComparisonMarkdown(comparison);
      filename = `comparison-${versionA?.type}-vs-${versionB?.type}.md`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateABTest = () => {
    if (!versionA || !versionB) return;

    const config = createABTest(
      `${versionA.name} vs ${versionB.name}`,
      versionA,
      versionB,
      ['conversion_rate', 'user_engagement', 'feature_adoption']
    );

    if (onABTestCreate) {
      onABTestCreate(config);
    } else {
      alert(`A/B Test Created:\n${JSON.stringify(config, null, 2)}`);
    }
  };

  const getVersionColor = (type: VersionType) => {
    switch (type) {
      case VersionType.PROTOTYPE:
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case VersionType.ALPHA:
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case VersionType.BETA:
        return 'bg-green-100 text-green-700 border-green-300';
      case VersionType.PILOT:
        return 'bg-orange-100 text-orange-700 border-orange-300';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <GitCompare className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Version Comparator</h1>
        </div>
        <p className="text-blue-100">
          Compare different versions side-by-side to understand feature evolution and iterations
        </p>
      </div>

      {/* Version Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Version A */}
        <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Version A
          </label>
          <select
            value={selectedVersionA}
            onChange={(e) => setSelectedVersionA(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {versions.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.features.length} features)
              </option>
            ))}
          </select>
          {versionA && (
            <div className="mt-3 space-y-2">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getVersionColor(versionA.type)}`}>
                {versionA.type}
              </div>
              <p className="text-sm text-gray-600">{versionA.description}</p>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="hidden md:flex items-center justify-center">
          <button
            onClick={handleSwapVersions}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Swap versions"
          >
            <ArrowLeftRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Version B */}
        <div className="bg-white rounded-lg border-2 border-purple-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Version B
          </label>
          <select
            value={selectedVersionB}
            onChange={(e) => setSelectedVersionB(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {versions.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.features.length} features)
              </option>
            ))}
          </select>
          {versionB && (
            <div className="mt-3 space-y-2">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getVersionColor(versionB.type)}`}>
                {versionB.type}
              </div>
              <p className="text-sm text-gray-600">{versionB.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      {comparison && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {similarityScore}%
            </div>
            <div className="text-sm text-gray-600">Similarity</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              +{comparison.stats.addedCount}
            </div>
            <div className="text-sm text-gray-600">Added</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              -{comparison.stats.removedCount}
            </div>
            <div className="text-sm text-gray-600">Removed</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              ~{comparison.stats.modifiedCount}
            </div>
            <div className="text-sm text-gray-600">Modified</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              ={comparison.stats.commonCount}
            </div>
            <div className="text-sm text-gray-600">Unchanged</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowUnchanged(!showUnchanged)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showUnchanged
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {showUnchanged ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Show Unchanged
            </button>

            <button
              onClick={() => setGroupByCategory(!groupByCategory)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                groupByCategory
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Group by Category
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleExportComparison('markdown')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export MD
            </button>

            <button
              onClick={() => handleExportComparison('json')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export JSON
            </button>

            <button
              onClick={handleCreateABTest}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Create A/B Test
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setViewMode('diff')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            viewMode === 'diff'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            Differences
          </div>
        </button>
        <button
          onClick={() => setViewMode('sidebyside')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            viewMode === 'sidebyside'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4" />
            Side by Side
          </div>
        </button>
        <button
          onClick={() => setViewMode('stats')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            viewMode === 'stats'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border p-6">
        {viewMode === 'diff' && (
          <DiffViewer
            diffs={diffs}
            showUnchanged={showUnchanged}
            groupByCategory={groupByCategory}
          />
        )}

        {viewMode === 'sidebyside' && versionA && versionB && (
          <SideBySideView versionA={versionA} versionB={versionB} />
        )}

        {viewMode === 'stats' && comparison && (
          <StatsView comparison={comparison} />
        )}
      </div>
    </div>
  );
};

// Side by Side View Component
const SideBySideView: React.FC<{ versionA: Version; versionB: Version }> = ({
  versionA,
  versionB
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-xl font-bold mb-4 text-blue-600">{versionA.name}</h3>
        <div className="space-y-3">
          {versionA.features.map(feature => (
            <div key={feature.id} className="p-3 border rounded-lg">
              <div className="font-medium">{feature.name}</div>
              <div className="text-sm text-gray-600">{feature.description}</div>
              <div className="mt-2 flex gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  feature.implemented ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {feature.implemented ? '✓ Implemented' : '⏳ Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4 text-purple-600">{versionB.name}</h3>
        <div className="space-y-3">
          {versionB.features.map(feature => (
            <div key={feature.id} className="p-3 border rounded-lg">
              <div className="font-medium">{feature.name}</div>
              <div className="text-sm text-gray-600">{feature.description}</div>
              <div className="mt-2 flex gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  feature.implemented ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {feature.implemented ? '✓ Implemented' : '⏳ Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Stats View Component
const StatsView: React.FC<{ comparison: ComparisonResult }> = ({ comparison }) => {
  const categories = useMemo(() => {
    const cats = new Set<string>();
    [...comparison.versionA.features, ...comparison.versionB.features].forEach(f => {
      cats.add(f.category);
    });
    return Array.from(cats);
  }, [comparison]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Feature Breakdown by Category</h3>
        <div className="space-y-3">
          {categories.map(category => {
            const featuresA = comparison.versionA.features.filter(f => f.category === category).length;
            const featuresB = comparison.versionB.features.filter(f => f.category === category).length;
            const maxFeatures = Math.max(featuresA, featuresB);

            return (
              <div key={category}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{category}</span>
                  <span className="text-sm text-gray-600">{featuresA} → {featuresB}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-blue-100 rounded relative overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${(featuresA / maxFeatures) * 100}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                      {featuresA}
                    </span>
                  </div>
                  <div className="h-8 bg-purple-100 rounded relative overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${(featuresB / maxFeatures) * 100}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                      {featuresB}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Key Insights</h3>
        <div className="space-y-2 text-sm">
          <p>• Total features increased by {comparison.stats.totalFeaturesB - comparison.stats.totalFeaturesA}</p>
          <p>• {comparison.stats.addedCount} new features added</p>
          <p>• {comparison.stats.removedCount} features removed</p>
          <p>• {comparison.stats.modifiedCount} features modified</p>
          <p>• {comparison.stats.commonCount} features remained unchanged</p>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate comparison markdown
function generateComparisonMarkdown(comparison: ComparisonResult): string {
  let md = `# Version Comparison\n\n`;
  md += `## ${comparison.versionA.name} vs ${comparison.versionB.name}\n\n`;
  md += `### Summary\n\n`;
  md += `- **Added Features:** ${comparison.stats.addedCount}\n`;
  md += `- **Removed Features:** ${comparison.stats.removedCount}\n`;
  md += `- **Modified Features:** ${comparison.stats.modifiedCount}\n`;
  md += `- **Unchanged Features:** ${comparison.stats.commonCount}\n\n`;

  if (comparison.addedFeatures.length > 0) {
    md += `### Added Features\n\n`;
    comparison.addedFeatures.forEach(f => {
      md += `- **${f.name}**: ${f.description}\n`;
    });
    md += '\n';
  }

  if (comparison.removedFeatures.length > 0) {
    md += `### Removed Features\n\n`;
    comparison.removedFeatures.forEach(f => {
      md += `- **${f.name}**: ${f.description}\n`;
    });
    md += '\n';
  }

  if (comparison.modifiedFeatures.length > 0) {
    md += `### Modified Features\n\n`;
    comparison.modifiedFeatures.forEach(({ after, changes }) => {
      md += `- **${after.name}**\n`;
      changes.forEach(change => {
        md += `  - ${change}\n`;
      });
    });
    md += '\n';
  }

  return md;
}

export default VersionComparator;
