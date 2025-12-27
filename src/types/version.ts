/**
 * Version Types for PRD Version Comparison Feature
 * Section 19: Compare Versions Feature
 */

/**
 * Version Type - defines different stages of product development
 */
export enum VersionType {
  PROTOTYPE = 'prototype',
  ALPHA = 'alpha',
  BETA = 'beta',
  PILOT = 'pilot'
}

/**
 * Feature interface - represents a single feature in a version
 */
export interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  implemented: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedEffort?: string;
  dependencies?: string[];
}

/**
 * Version interface - represents a complete version with all its features
 */
export interface Version {
  id: string;
  type: VersionType;
  name: string;
  description: string;
  features: Feature[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    author?: string;
    tags?: string[];
    notes?: string;
  };
}

/**
 * Comparison Result - represents the difference between two versions
 */
export interface ComparisonResult {
  versionA: Version;
  versionB: Version;
  addedFeatures: Feature[];
  removedFeatures: Feature[];
  modifiedFeatures: {
    before: Feature;
    after: Feature;
    changes: string[];
  }[];
  commonFeatures: Feature[];
  stats: {
    totalFeaturesA: number;
    totalFeaturesB: number;
    addedCount: number;
    removedCount: number;
    modifiedCount: number;
    commonCount: number;
  };
}

/**
 * Diff Type - represents the type of difference in a comparison
 */
export enum DiffType {
  ADDED = 'added',
  REMOVED = 'removed',
  MODIFIED = 'modified',
  UNCHANGED = 'unchanged'
}

/**
 * Feature Diff - represents a detailed diff of a single feature
 */
export interface FeatureDiff {
  feature: Feature;
  type: DiffType;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

/**
 * A/B Test Configuration
 */
export interface ABTestConfig {
  id: string;
  name: string;
  description: string;
  versionA: string; // version ID
  versionB: string; // version ID
  metrics: string[];
  duration?: number; // in days
  targetAudience?: string;
  hypothesis?: string;
}

/**
 * Export type for version data
 */
export interface VersionExport {
  version: Version;
  exportedAt: Date;
  format: 'json' | 'markdown' | 'pdf';
}
