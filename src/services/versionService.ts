/**
 * Version Service - handles version comparison logic
 * Section 19: Compare Versions Feature
 */

import {
  Version,
  Feature,
  ComparisonResult,
  FeatureDiff,
  DiffType,
  VersionType,
  ABTestConfig
} from '../types/version';

/**
 * Compare two versions and return detailed comparison results
 */
export function compareVersions(versionA: Version, versionB: Version): ComparisonResult {
  const featuresA = new Map(versionA.features.map(f => [f.id, f]));
  const featuresB = new Map(versionB.features.map(f => [f.id, f]));

  const addedFeatures: Feature[] = [];
  const removedFeatures: Feature[] = [];
  const modifiedFeatures: ComparisonResult['modifiedFeatures'] = [];
  const commonFeatures: Feature[] = [];

  // Find removed features (in A but not in B)
  featuresA.forEach((feature, id) => {
    if (!featuresB.has(id)) {
      removedFeatures.push(feature);
    }
  });

  // Find added and modified features
  featuresB.forEach((featureB, id) => {
    const featureA = featuresA.get(id);

    if (!featureA) {
      // Feature is new in version B
      addedFeatures.push(featureB);
    } else {
      // Feature exists in both versions - check for modifications
      const changes = detectFeatureChanges(featureA, featureB);

      if (changes.length > 0) {
        modifiedFeatures.push({
          before: featureA,
          after: featureB,
          changes
        });
      } else {
        commonFeatures.push(featureB);
      }
    }
  });

  return {
    versionA,
    versionB,
    addedFeatures,
    removedFeatures,
    modifiedFeatures,
    commonFeatures,
    stats: {
      totalFeaturesA: versionA.features.length,
      totalFeaturesB: versionB.features.length,
      addedCount: addedFeatures.length,
      removedCount: removedFeatures.length,
      modifiedCount: modifiedFeatures.length,
      commonCount: commonFeatures.length
    }
  };
}

/**
 * Detect changes between two features
 */
function detectFeatureChanges(featureA: Feature, featureB: Feature): string[] {
  const changes: string[] = [];

  if (featureA.name !== featureB.name) {
    changes.push(`Name changed from "${featureA.name}" to "${featureB.name}"`);
  }

  if (featureA.description !== featureB.description) {
    changes.push('Description updated');
  }

  if (featureA.category !== featureB.category) {
    changes.push(`Category changed from "${featureA.category}" to "${featureB.category}"`);
  }

  if (featureA.implemented !== featureB.implemented) {
    changes.push(`Implementation status changed to ${featureB.implemented ? 'implemented' : 'not implemented'}`);
  }

  if (featureA.priority !== featureB.priority) {
    changes.push(`Priority changed from "${featureA.priority}" to "${featureB.priority}"`);
  }

  return changes;
}

/**
 * Generate feature diffs for visualization
 */
export function generateFeatureDiffs(versionA: Version, versionB: Version): FeatureDiff[] {
  const comparison = compareVersions(versionA, versionB);
  const diffs: FeatureDiff[] = [];

  // Added features
  comparison.addedFeatures.forEach(feature => {
    diffs.push({
      feature,
      type: DiffType.ADDED
    });
  });

  // Removed features
  comparison.removedFeatures.forEach(feature => {
    diffs.push({
      feature,
      type: DiffType.REMOVED
    });
  });

  // Modified features
  comparison.modifiedFeatures.forEach(({ after, changes }) => {
    diffs.push({
      feature: after,
      type: DiffType.MODIFIED,
      changes: changes.map(change => ({
        field: change,
        oldValue: null,
        newValue: null
      }))
    });
  });

  // Common features
  comparison.commonFeatures.forEach(feature => {
    diffs.push({
      feature,
      type: DiffType.UNCHANGED
    });
  });

  return diffs;
}

/**
 * Create sample versions for testing and demonstration
 */
export function createSampleVersions(): Version[] {
  const now = new Date();

  const prototypeVersion: Version = {
    id: 'v1-prototype',
    type: VersionType.PROTOTYPE,
    name: 'Prototype',
    description: 'Quick wireframe with basic interactions',
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    features: [
      {
        id: 'f1',
        name: 'User Authentication',
        description: 'Basic login/signup functionality',
        category: 'Authentication',
        implemented: true,
        priority: 'critical'
      },
      {
        id: 'f2',
        name: 'Dashboard',
        description: 'Simple dashboard with basic metrics',
        category: 'UI',
        implemented: true,
        priority: 'high'
      },
      {
        id: 'f3',
        name: 'Profile Page',
        description: 'User profile view',
        category: 'UI',
        implemented: false,
        priority: 'medium'
      }
    ],
    metadata: {
      author: 'Product Team',
      tags: ['wireframe', 'basic'],
      notes: 'Initial prototype for stakeholder review'
    }
  };

  const alphaVersion: Version = {
    id: 'v2-alpha',
    type: VersionType.ALPHA,
    name: 'Alpha Version',
    description: 'Full-featured with animations, responsive design & polish',
    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    features: [
      {
        id: 'f1',
        name: 'User Authentication',
        description: 'Enhanced login/signup with social auth',
        category: 'Authentication',
        implemented: true,
        priority: 'critical'
      },
      {
        id: 'f2',
        name: 'Dashboard',
        description: 'Interactive dashboard with real-time metrics and charts',
        category: 'UI',
        implemented: true,
        priority: 'high'
      },
      {
        id: 'f3',
        name: 'Profile Page',
        description: 'User profile with edit capabilities',
        category: 'UI',
        implemented: true,
        priority: 'medium'
      },
      {
        id: 'f4',
        name: 'Notifications',
        description: 'Real-time notification system',
        category: 'Features',
        implemented: true,
        priority: 'high'
      },
      {
        id: 'f5',
        name: 'Search',
        description: 'Advanced search with filters',
        category: 'Features',
        implemented: false,
        priority: 'medium'
      }
    ],
    metadata: {
      author: 'Product Team',
      tags: ['alpha', 'full-featured'],
      notes: 'Ready for internal testing'
    }
  };

  const betaVersion: Version = {
    id: 'v3-beta',
    type: VersionType.BETA,
    name: 'Beta Version',
    description: 'Production-ready with backend simulation, data persistence & advanced features',
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    features: [
      {
        id: 'f1',
        name: 'User Authentication',
        description: 'Complete auth system with OAuth, 2FA, and SSO',
        category: 'Authentication',
        implemented: true,
        priority: 'critical'
      },
      {
        id: 'f2',
        name: 'Dashboard',
        description: 'Customizable dashboard with widgets and real-time data',
        category: 'UI',
        implemented: true,
        priority: 'high'
      },
      {
        id: 'f3',
        name: 'Profile Page',
        description: 'Comprehensive user profile with privacy settings',
        category: 'UI',
        implemented: true,
        priority: 'medium'
      },
      {
        id: 'f4',
        name: 'Notifications',
        description: 'Multi-channel notification system (email, push, SMS)',
        category: 'Features',
        implemented: true,
        priority: 'high'
      },
      {
        id: 'f5',
        name: 'Search',
        description: 'AI-powered search with autocomplete',
        category: 'Features',
        implemented: true,
        priority: 'medium'
      },
      {
        id: 'f6',
        name: 'Analytics',
        description: 'Comprehensive analytics and reporting',
        category: 'Features',
        implemented: true,
        priority: 'high'
      },
      {
        id: 'f7',
        name: 'Export/Import',
        description: 'Data export and import functionality',
        category: 'Features',
        implemented: true,
        priority: 'medium'
      },
      {
        id: 'f8',
        name: 'API Integration',
        description: 'RESTful API for third-party integrations',
        category: 'Integration',
        implemented: false,
        priority: 'high'
      }
    ],
    metadata: {
      author: 'Product Team',
      tags: ['beta', 'production-ready'],
      notes: 'Ready for beta testing with select users'
    }
  };

  const pilotVersion: Version = {
    id: 'v4-pilot',
    type: VersionType.PILOT,
    name: 'Pilot/Pre-production',
    description: 'Enterprise-grade with A/B testing, analytics, monitoring & feature flags',
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: now,
    features: [
      {
        id: 'f1',
        name: 'User Authentication',
        description: 'Enterprise SSO with SAML and LDAP support',
        category: 'Authentication',
        implemented: true,
        priority: 'critical'
      },
      {
        id: 'f2',
        name: 'Dashboard',
        description: 'AI-powered insights dashboard with predictive analytics',
        category: 'UI',
        implemented: true,
        priority: 'high'
      },
      {
        id: 'f3',
        name: 'Profile Page',
        description: 'Advanced user management with role-based access control',
        category: 'UI',
        implemented: true,
        priority: 'medium'
      },
      {
        id: 'f4',
        name: 'Notifications',
        description: 'Intelligent notification system with AI-driven preferences',
        category: 'Features',
        implemented: true,
        priority: 'high'
      },
      {
        id: 'f5',
        name: 'Search',
        description: 'Machine learning-powered semantic search',
        category: 'Features',
        implemented: true,
        priority: 'medium'
      },
      {
        id: 'f6',
        name: 'Analytics',
        description: 'Advanced analytics with A/B testing and experimentation',
        category: 'Features',
        implemented: true,
        priority: 'high'
      },
      {
        id: 'f7',
        name: 'Export/Import',
        description: 'Bulk data operations with scheduling',
        category: 'Features',
        implemented: true,
        priority: 'medium'
      },
      {
        id: 'f8',
        name: 'API Integration',
        description: 'GraphQL and REST APIs with webhooks',
        category: 'Integration',
        implemented: true,
        priority: 'high'
      },
      {
        id: 'f9',
        name: 'Monitoring',
        description: 'Real-time system monitoring and alerting',
        category: 'DevOps',
        implemented: true,
        priority: 'critical'
      },
      {
        id: 'f10',
        name: 'Feature Flags',
        description: 'Dynamic feature toggle system',
        category: 'DevOps',
        implemented: true,
        priority: 'high'
      },
      {
        id: 'f11',
        name: 'Compliance',
        description: 'GDPR, SOC2, and HIPAA compliance features',
        category: 'Security',
        implemented: true,
        priority: 'critical'
      }
    ],
    metadata: {
      author: 'Product Team',
      tags: ['pilot', 'enterprise', 'production'],
      notes: 'Enterprise-ready version for pilot customers'
    }
  };

  return [prototypeVersion, alphaVersion, betaVersion, pilotVersion];
}

/**
 * Get version by ID
 */
export function getVersionById(versionId: string, versions: Version[]): Version | null {
  return versions.find(v => v.id === versionId) || null;
}

/**
 * Calculate similarity score between two versions (0-100)
 */
export function calculateSimilarityScore(versionA: Version, versionB: Version): number {
  const comparison = compareVersions(versionA, versionB);
  const totalFeatures = Math.max(comparison.stats.totalFeaturesA, comparison.stats.totalFeaturesB);

  if (totalFeatures === 0) return 100;

  const commonAndModified = comparison.stats.commonCount + comparison.stats.modifiedCount;
  return Math.round((commonAndModified / totalFeatures) * 100);
}

/**
 * Generate A/B test configuration
 */
export function createABTest(
  name: string,
  versionA: Version,
  versionB: Version,
  metrics: string[]
): ABTestConfig {
  return {
    id: `ab-test-${Date.now()}`,
    name,
    description: `A/B test comparing ${versionA.name} vs ${versionB.name}`,
    versionA: versionA.id,
    versionB: versionB.id,
    metrics,
    hypothesis: `Version ${versionB.name} will perform better based on ${metrics.join(', ')}`
  };
}

/**
 * Export version to JSON
 */
export function exportVersionToJSON(version: Version): string {
  return JSON.stringify(version, null, 2);
}

/**
 * Export version to Markdown
 */
export function exportVersionToMarkdown(version: Version): string {
  let markdown = `# ${version.name}\n\n`;
  markdown += `**Type:** ${version.type}\n\n`;
  markdown += `**Description:** ${version.description}\n\n`;
  markdown += `**Created:** ${version.createdAt.toLocaleDateString()}\n\n`;
  markdown += `**Updated:** ${version.updatedAt.toLocaleDateString()}\n\n`;

  if (version.metadata?.author) {
    markdown += `**Author:** ${version.metadata.author}\n\n`;
  }

  markdown += `## Features (${version.features.length})\n\n`;

  const categories = [...new Set(version.features.map(f => f.category))];

  categories.forEach(category => {
    markdown += `### ${category}\n\n`;
    const categoryFeatures = version.features.filter(f => f.category === category);

    categoryFeatures.forEach(feature => {
      const status = feature.implemented ? '✅' : '⏳';
      markdown += `- ${status} **${feature.name}** (${feature.priority})\n`;
      markdown += `  - ${feature.description}\n`;
    });

    markdown += '\n';
  });

  return markdown;
}
