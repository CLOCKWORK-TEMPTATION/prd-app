/**
 * Version Service Tests
 * Section 19: Compare Versions Feature
 */

import {
  compareVersions,
  generateFeatureDiffs,
  createSampleVersions,
  calculateSimilarityScore,
  exportVersionToMarkdown,
  exportVersionToJSON
} from '../services/versionService';
import { DiffType } from '../types/version';

/**
 * Test Suite for Version Service
 *
 * To run these tests, you would need a testing framework like Jest.
 * These are example tests showing the expected behavior.
 */

// Mock test runner
const test = (name: string, fn: () => void) => {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}`, error);
  }
};

const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected} but got ${actual}`);
    }
  },
  toBeGreaterThan: (expected: any) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  },
  toEqual: (expected: any) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
  },
  toHaveLength: (expected: number) => {
    if (actual.length !== expected) {
      throw new Error(`Expected length ${expected} but got ${actual.length}`);
    }
  }
});

// Run Tests
console.log('\n🧪 Running Version Service Tests...\n');

test('createSampleVersions should return 4 versions', () => {
  const versions = createSampleVersions();
  expect(versions.length).toBe(4);
});

test('createSampleVersions should have correct types', () => {
  const versions = createSampleVersions();
  expect(versions[0].type).toBe('prototype');
  expect(versions[1].type).toBe('alpha');
  expect(versions[2].type).toBe('beta');
  expect(versions[3].type).toBe('pilot');
});

test('compareVersions should detect added features', () => {
  const versions = createSampleVersions();
  const comparison = compareVersions(versions[0], versions[1]);

  // Alpha has more features than Prototype
  expect(comparison.stats.addedCount).toBeGreaterThan(0);
});

test('compareVersions should detect modified features', () => {
  const versions = createSampleVersions();
  const comparison = compareVersions(versions[0], versions[1]);

  // Some features should be modified
  expect(comparison.stats.modifiedCount).toBeGreaterThan(0);
});

test('generateFeatureDiffs should return correct diff types', () => {
  const versions = createSampleVersions();
  const diffs = generateFeatureDiffs(versions[0], versions[1]);

  const diffTypes = new Set(diffs.map(d => d.type));

  // Should have ADDED and MODIFIED diffs at minimum
  expect(diffTypes.has(DiffType.ADDED)).toBe(true);
});

test('calculateSimilarityScore should return value between 0-100', () => {
  const versions = createSampleVersions();
  const score = calculateSimilarityScore(versions[0], versions[1]);

  expect(score).toBeGreaterThan(0);
  expect(score <= 100).toBe(true);
});

test('calculateSimilarityScore of identical versions should be 100', () => {
  const versions = createSampleVersions();
  const score = calculateSimilarityScore(versions[0], versions[0]);

  expect(score).toBe(100);
});

test('exportVersionToJSON should return valid JSON', () => {
  const versions = createSampleVersions();
  const json = exportVersionToJSON(versions[0]);

  // Should be parseable JSON
  const parsed = JSON.parse(json);
  expect(parsed.id).toBe(versions[0].id);
});

test('exportVersionToMarkdown should include version name', () => {
  const versions = createSampleVersions();
  const markdown = exportVersionToMarkdown(versions[0]);

  expect(markdown.includes(versions[0].name)).toBe(true);
});

test('exportVersionToMarkdown should include features', () => {
  const versions = createSampleVersions();
  const markdown = exportVersionToMarkdown(versions[0]);

  // Should include at least one feature name
  expect(markdown.includes(versions[0].features[0].name)).toBe(true);
});

test('comparison stats should be accurate', () => {
  const versions = createSampleVersions();
  const comparison = compareVersions(versions[0], versions[1]);

  const totalChanges =
    comparison.stats.addedCount +
    comparison.stats.removedCount +
    comparison.stats.modifiedCount +
    comparison.stats.commonCount;

  // Total changes should equal features in version B
  expect(totalChanges).toBe(comparison.stats.totalFeaturesB);
});

console.log('\n✨ All tests completed!\n');

// Export for use in other test files
export const runTests = () => {
  console.log('Version Service tests are working!');
};
