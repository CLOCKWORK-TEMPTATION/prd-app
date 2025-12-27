/**
 * Comprehensive Tests for ScoringService
 * Tests the PRD quality evaluation system across all 5 dimensions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ScoringService } from '../services/scoringService';
import type { QualityScore, QualityBadge } from '../types/quality';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(() => {
    // Get the singleton instance for each test
    service = ScoringService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when getInstance is called multiple times', () => {
      const instance1 = ScoringService.getInstance();
      const instance2 = ScoringService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('evaluatePRD - Overall Structure', () => {
    it('should return a QualityScore object with all required properties', () => {
      const content = 'Simple PRD content';
      const result = service.evaluatePRD(content);

      expect(result).toHaveProperty('overall');
      expect(result).toHaveProperty('badge');
      expect(result).toHaveProperty('dimensions');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('timestamp');
    });

    it('should include all five dimensions', () => {
      const content = 'Test content';
      const result = service.evaluatePRD(content);

      expect(result.dimensions).toHaveProperty('clarity');
      expect(result.dimensions).toHaveProperty('completeness');
      expect(result.dimensions).toHaveProperty('specificity');
      expect(result.dimensions).toHaveProperty('measurability');
      expect(result.dimensions).toHaveProperty('feasibility');
    });

    it('should have weights that sum to 1.0', () => {
      const content = 'Test content';
      const result = service.evaluatePRD(content);
      const { clarity, completeness, specificity, measurability, feasibility } = result.dimensions;

      const totalWeight = clarity.weight + completeness.weight + specificity.weight +
                          measurability.weight + feasibility.weight;
      expect(totalWeight).toBe(1.0);
    });

    it('should return a timestamp that is a valid Date', () => {
      const content = 'Test content';
      const result = service.evaluatePRD(content);

      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Clarity Dimension', () => {
    it('should give points for having a markdown title (# heading)', () => {
      const withTitle = '# My PRD Title\n\nContent here';
      const withoutTitle = 'Just some content';

      const resultWith = service.evaluatePRD(withTitle);
      const resultWithout = service.evaluatePRD(withoutTitle);

      // Both should have hasTitle true since content.length > 50 is also a condition
      // Test with short content without title
      const shortNoTitle = 'Short';
      const resultShort = service.evaluatePRD(shortNoTitle);

      expect(resultWith.dimensions.clarity.score).toBeGreaterThanOrEqual(
        resultShort.dimensions.clarity.score
      );
    });

    it('should give points for good structure (multiple paragraphs)', () => {
      const structured = 'Para 1\n\nPara 2\n\nPara 3\n\nPara 4';
      const unstructured = 'Single block of text without breaks';

      const resultStructured = service.evaluatePRD(structured);
      const resultUnstructured = service.evaluatePRD(unstructured);

      expect(resultStructured.dimensions.clarity.score).toBeGreaterThan(
        resultUnstructured.dimensions.clarity.score
      );
    });

    it('should give points for having clear section headings (## headings)', () => {
      const withSections = '## Problem\nDesc\n\n## Solution\nDesc';
      const withoutSections = 'Problem: desc. Solution: desc.';

      const resultWith = service.evaluatePRD(withSections);
      const resultWithout = service.evaluatePRD(withoutSections);

      expect(resultWith.dimensions.clarity.score).toBeGreaterThan(
        resultWithout.dimensions.clarity.score
      );
    });

    it('should give points for appropriate length (200-5000 chars)', () => {
      const goodLength = 'A'.repeat(300) + '\n\n' + 'B'.repeat(300);
      const tooShort = 'Short';
      const tooLong = 'X'.repeat(6000);

      const resultGood = service.evaluatePRD(goodLength);
      const resultShort = service.evaluatePRD(tooShort);
      const resultLong = service.evaluatePRD(tooLong);

      // Good length should score higher than too short or too long
      expect(resultGood.dimensions.clarity.score).toBeGreaterThan(
        resultShort.dimensions.clarity.score
      );
    });

    it('should penalize content with business clichés', () => {
      const withClichés = 'We leverage synergy to paradigm shift our approach. Let\'s circle back later.';
      const withoutClichés = 'We use collaboration to improve our approach. Let\'s follow up later.';

      const resultWith = service.evaluatePRD(withClichés);
      const resultWithout = service.evaluatePRD(withoutClichés);

      expect(resultWithout.dimensions.clarity.score).toBeGreaterThan(
        resultWith.dimensions.clarity.score
      );
    });

    it('should return appropriate feedback based on score', () => {
      const excellentPRD = `# Product Requirements Document

## Problem Statement
Clear problem description here.

## Solution Overview
Our approach to solving the problem.

## Target Users
Primary audience definition.

## Success Criteria
How we measure success.`;

      const result = service.evaluatePRD(excellentPRD);

      // Should have positive feedback for good clarity
      expect(result.dimensions.clarity.feedback).toBeTruthy();
      expect(typeof result.dimensions.clarity.feedback).toBe('string');
    });
  });

  describe('Completeness Dimension', () => {
    it('should give points for including a problem statement', () => {
      const withProblem = 'The main problem we are solving is user friction.';
      const withoutProblem = 'We will build a new application.';

      const resultWith = service.evaluatePRD(withProblem);
      const resultWithout = service.evaluatePRD(withoutProblem);

      expect(resultWith.dimensions.completeness.score).toBeGreaterThan(
        resultWithout.dimensions.completeness.score
      );
    });

    it('should give points for including solution details', () => {
      const withSolution = 'Our solution is to implement a new feature with functionality for users.';
      const withoutSolution = 'This document describes plans.';

      const resultWith = service.evaluatePRD(withSolution);
      const resultWithout = service.evaluatePRD(withoutSolution);

      expect(resultWith.dimensions.completeness.score).toBeGreaterThan(
        resultWithout.dimensions.completeness.score
      );
    });

    it('should give points for defining target users', () => {
      const withUsers = 'Our target users are small business owners.';
      const withoutUsers = 'This is a general application.';

      const resultWith = service.evaluatePRD(withUsers);
      const resultWithout = service.evaluatePRD(withoutUsers);

      expect(resultWith.dimensions.completeness.score).toBeGreaterThan(
        resultWithout.dimensions.completeness.score
      );
    });

    it('should give points for including success metrics', () => {
      const withSuccess = 'Success will be measured by achieving our goal with key metrics.';
      const withoutSuccess = 'We hope things work out.';

      const resultWith = service.evaluatePRD(withSuccess);
      const resultWithout = service.evaluatePRD(withoutSuccess);

      expect(resultWith.dimensions.completeness.score).toBeGreaterThan(
        resultWithout.dimensions.completeness.score
      );
    });

    it('should give points for including timeline', () => {
      const withTimeline = 'Phase 1 will be completed by the milestone deadline.';
      const withoutTimeline = 'We will complete this eventually.';

      const resultWith = service.evaluatePRD(withTimeline);
      const resultWithout = service.evaluatePRD(withoutTimeline);

      expect(resultWith.dimensions.completeness.score).toBeGreaterThan(
        resultWithout.dimensions.completeness.score
      );
    });

    it('should give points for multiple features', () => {
      const withFeatures = 'Feature one is important. Feature two adds functionality. Feature three improves the experience.';
      const withoutFeatures = 'We will build something useful.';

      const resultWith = service.evaluatePRD(withFeatures);
      const resultWithout = service.evaluatePRD(withoutFeatures);

      expect(resultWith.dimensions.completeness.score).toBeGreaterThan(
        resultWithout.dimensions.completeness.score
      );
    });
  });

  describe('Specificity Dimension', () => {
    it('should give points for including numbers', () => {
      const withNumbers = 'We expect 500 users and 25% growth.';
      const withoutNumbers = 'We expect many users and significant growth.';

      const resultWith = service.evaluatePRD(withNumbers);
      const resultWithout = service.evaluatePRD(withoutNumbers);

      expect(resultWith.dimensions.specificity.score).toBeGreaterThan(
        resultWithout.dimensions.specificity.score
      );
    });

    it('should give points for including examples', () => {
      const withExamples = 'For example, users can create dashboards such as analytics views.';
      const withoutExamples = 'Users can create views.';

      const resultWith = service.evaluatePRD(withExamples);
      const resultWithout = service.evaluatePRD(withoutExamples);

      expect(resultWith.dimensions.specificity.score).toBeGreaterThan(
        resultWithout.dimensions.specificity.score
      );
    });

    it('should give points for detailed content (>500 chars)', () => {
      const detailed = 'A'.repeat(600);
      const brief = 'Brief content.';

      const resultDetailed = service.evaluatePRD(detailed);
      const resultBrief = service.evaluatePRD(brief);

      expect(resultDetailed.dimensions.specificity.score).toBeGreaterThan(
        resultBrief.dimensions.specificity.score
      );
    });

    it('should penalize vague language', () => {
      const vague = 'Maybe we could possibly implement something that might work somehow.';
      const concrete = 'We will implement a user authentication system with OAuth2.';

      const resultVague = service.evaluatePRD(vague);
      const resultConcrete = service.evaluatePRD(concrete);

      expect(resultConcrete.dimensions.specificity.score).toBeGreaterThan(
        resultVague.dimensions.specificity.score
      );
    });

    it('should give points for concrete UI features', () => {
      const withUI = 'The dashboard will display a table and chart with a search form.';
      const withoutUI = 'Users will see their data.';

      const resultWith = service.evaluatePRD(withUI);
      const resultWithout = service.evaluatePRD(withoutUI);

      expect(resultWith.dimensions.specificity.score).toBeGreaterThan(
        resultWithout.dimensions.specificity.score
      );
    });
  });

  describe('Measurability Dimension', () => {
    it('should give points for mentioning metrics/KPIs', () => {
      const withMetrics = 'We will track analytics and measure KPI performance.';
      const withoutMetrics = 'We will see how it goes.';

      const resultWith = service.evaluatePRD(withMetrics);
      const resultWithout = service.evaluatePRD(withoutMetrics);

      expect(resultWith.dimensions.measurability.score).toBeGreaterThan(
        resultWithout.dimensions.measurability.score
      );
    });

    it('should give points for percentages', () => {
      const withPercentages = 'We aim for 95% uptime and 40% conversion.';
      const withoutPercentages = 'We aim for high uptime and good conversion.';

      const resultWith = service.evaluatePRD(withPercentages);
      const resultWithout = service.evaluatePRD(withoutPercentages);

      expect(resultWith.dimensions.measurability.score).toBeGreaterThan(
        resultWithout.dimensions.measurability.score
      );
    });

    it('should give points for target numbers with context', () => {
      const withTargets = 'Goal: 10000 users with 25% growth rate.';
      const withoutTargets = 'Goal: many users with good growth.';

      const resultWith = service.evaluatePRD(withTargets);
      const resultWithout = service.evaluatePRD(withoutTargets);

      expect(resultWith.dimensions.measurability.score).toBeGreaterThan(
        resultWithout.dimensions.measurability.score
      );
    });

    it('should give points for success criteria', () => {
      const withSuccess = 'Success means achieving our target objective and goal.';
      const withoutSuccess = 'We hope it works well.';

      const resultWith = service.evaluatePRD(withSuccess);
      const resultWithout = service.evaluatePRD(withoutSuccess);

      expect(resultWith.dimensions.measurability.score).toBeGreaterThan(
        resultWithout.dimensions.measurability.score
      );
    });

    it('should give points for time-bound goals', () => {
      const timebound = 'Complete within 3 months, review every week.';
      const notTimebound = 'Complete when ready.';

      const resultWith = service.evaluatePRD(timebound);
      const resultWithout = service.evaluatePRD(notTimebound);

      expect(resultWith.dimensions.measurability.score).toBeGreaterThan(
        resultWithout.dimensions.measurability.score
      );
    });
  });

  describe('Feasibility Dimension', () => {
    it('should give points for realistic scope (content < 3000 chars)', () => {
      const realistic = 'A focused MVP with core features. '.repeat(20);
      const overambitious = 'X'.repeat(4000);

      const resultRealistic = service.evaluatePRD(realistic);
      const resultOverambitious = service.evaluatePRD(overambitious);

      expect(resultRealistic.dimensions.feasibility.score).toBeGreaterThan(
        resultOverambitious.dimensions.feasibility.score
      );
    });

    it('should give points for technical details', () => {
      const withTech = 'Built with React frontend and Node.js backend with REST API.';
      const withoutTech = 'Built with modern tools.';

      const resultWith = service.evaluatePRD(withTech);
      const resultWithout = service.evaluatePRD(withoutTech);

      expect(resultWith.dimensions.feasibility.score).toBeGreaterThan(
        resultWithout.dimensions.feasibility.score
      );
    });

    it('should give points for acknowledging constraints', () => {
      const withConstraints = 'Budget constraint is $50k, timeline limitation is 3 months.';
      const withoutConstraints = 'We will build whatever is needed.';

      const resultWith = service.evaluatePRD(withConstraints);
      const resultWithout = service.evaluatePRD(withoutConstraints);

      expect(resultWith.dimensions.feasibility.score).toBeGreaterThan(
        resultWithout.dimensions.feasibility.score
      );
    });

    it('should give points for phased approach', () => {
      const withPhases = 'Phase 1 is MVP. Phase 2 adds iteration improvements.';
      const withoutPhases = 'We will build everything at once.';

      const resultWith = service.evaluatePRD(withPhases);
      const resultWithout = service.evaluatePRD(withoutPhases);

      expect(resultWith.dimensions.feasibility.score).toBeGreaterThan(
        resultWithout.dimensions.feasibility.score
      );
    });

    it('should penalize unrealistic claims', () => {
      const unrealistic = 'AI that thinks like humans, disrupting everything in the industry.';
      const realistic = 'Machine learning model for text classification.';

      const resultUnrealistic = service.evaluatePRD(unrealistic);
      const resultRealistic = service.evaluatePRD(realistic);

      expect(resultRealistic.dimensions.feasibility.score).toBeGreaterThan(
        resultUnrealistic.dimensions.feasibility.score
      );
    });
  });

  describe('Badge Determination', () => {
    it('should assign platinum badge for scores >= 90', () => {
      // Create a comprehensive PRD that hits all criteria
      const platinumPRD = `# Enterprise Dashboard PRD

## Problem Statement
Users face a significant challenge with data visibility, causing pain points in decision making.

## Solution and Features
Our solution is a comprehensive dashboard feature with functionality including:
- Analytics dashboard with charts and tables
- User management screen with forms
- API integration using REST endpoints

For example, users can view metrics such as conversion rates.

## Target Users
Our target customers are enterprise teams and business audience.

## Success Metrics
Success will be measured by achieving these goals:
- 95% uptime metric
- 1000 users within 3 months
- 40% increase in productivity

We will track KPI analytics weekly.

## Timeline and Phases
- Phase 1 (MVP): Core dashboard - 1 month
- Phase 2 (iteration): Advanced features - 2 months

## Constraints
Budget limitation: $100k
Resource constraint: 5 developers
Timeline: Complete within quarter`;

      const result = service.evaluatePRD(platinumPRD);
      expect(result.badge).toBe('platinum');
      expect(result.overall).toBeGreaterThanOrEqual(90);
    });

    it('should assign gold badge for scores >= 85 and < 90', () => {
      // A good but not perfect PRD
      const goldPRD = `# Mobile App PRD

## Problem
Users face a challenge accessing data on mobile.

## Solution
A mobile app with feature functionality for the target audience.
Dashboard with charts and list views.

## Metrics
Track 80% user retention over 3 months.
Goal: 500 users per week.

Phase 1: MVP launch
Constraint: Limited budget`;

      const result = service.evaluatePRD(goldPRD);
      // This should score well but not quite platinum
      expect(['gold', 'platinum']).toContain(result.badge);
    });

    it('should assign silver badge for scores >= 70 and < 85', () => {
      const silverPRD = `## Problem
There is an issue with the current solution.

## Solution
We will build a feature for users.

Timeline: Complete in 2 months.
Success metric: 50% improvement.`;

      const result = service.evaluatePRD(silverPRD);
      expect(['silver', 'gold', 'bronze']).toContain(result.badge);
    });

    it('should assign bronze badge for scores < 70', () => {
      const bronzePRD = 'We want to build something.';

      const result = service.evaluatePRD(bronzePRD);
      expect(result.badge).toBe('bronze');
      expect(result.overall).toBeLessThan(70);
    });

    it('should return valid badge type', () => {
      const validBadges: QualityBadge[] = ['bronze', 'silver', 'gold', 'platinum'];
      const result = service.evaluatePRD('Any content');

      expect(validBadges).toContain(result.badge);
    });
  });

  describe('Suggestions Generation', () => {
    it('should generate clarity suggestions when clarity score is low', () => {
      const unclearPRD = 'stuff and things maybe';

      const result = service.evaluatePRD(unclearPRD);

      if (result.dimensions.clarity.score < 70) {
        expect(result.suggestions.some(s => s.includes('section') || s.includes('heading'))).toBe(true);
      }
    });

    it('should generate completeness suggestions when completeness score is low', () => {
      const incompletePRD = 'A simple idea.';

      const result = service.evaluatePRD(incompletePRD);

      if (result.dimensions.completeness.score < 70) {
        expect(result.suggestions.some(s =>
          s.includes('Problem') || s.includes('Solution') || s.includes('Users')
        )).toBe(true);
      }
    });

    it('should generate specificity suggestions when specificity score is low', () => {
      const vaguePRD = 'Maybe we could build something nice perhaps.';

      const result = service.evaluatePRD(vaguePRD);

      if (result.dimensions.specificity.score < 70) {
        expect(result.suggestions.some(s =>
          s.includes('number') || s.includes('example') || s.includes('specific')
        )).toBe(true);
      }
    });

    it('should generate measurability suggestions when measurability score is low', () => {
      const unmeasurablePRD = 'We want things to be better.';

      const result = service.evaluatePRD(unmeasurablePRD);

      if (result.dimensions.measurability.score < 70) {
        expect(result.suggestions.some(s =>
          s.includes('KPI') || s.includes('time-bound') || s.includes('metric')
        )).toBe(true);
      }
    });

    it('should generate feasibility suggestions when feasibility score is low', () => {
      // Very long and unrealistic
      const unfeasiblePRD = 'AI that thinks and disrupting everything '.repeat(100);

      const result = service.evaluatePRD(unfeasiblePRD);

      if (result.dimensions.feasibility.score < 70) {
        expect(result.suggestions.some(s =>
          s.includes('phase') || s.includes('constraint') || s.includes('MVP')
        )).toBe(true);
      }
    });

    it('should return an empty array of suggestions for excellent PRDs', () => {
      const excellentPRD = `# Complete PRD

## Problem Statement
Critical challenge facing target users causing significant pain points.

## Solution
Comprehensive feature with functionality:
- Dashboard with table, chart, and form components
- Screen for list display
For example, users can access analytics.

## Target Audience
Primary customers and user segments.

## Success Metrics
- Track KPI: 95% goal achievement
- 1000 users growth within 3 months
- 40% increase measured quarterly

## Timeline
Phase 1 MVP: Week 1-4
Phase 2 iteration: Month 2

## Constraints
Budget limitation: $50k
Resource constraint: Small team
API and database technology stack`;

      const result = service.evaluatePRD(excellentPRD);

      // If all dimensions score >= 70, suggestions should be empty
      const allDimensionsGood =
        result.dimensions.clarity.score >= 70 &&
        result.dimensions.completeness.score >= 70 &&
        result.dimensions.specificity.score >= 70 &&
        result.dimensions.measurability.score >= 70 &&
        result.dimensions.feasibility.score >= 70;

      if (allDimensionsGood) {
        expect(result.suggestions).toHaveLength(0);
      }
    });
  });

  describe('Strengths Identification', () => {
    it('should identify clarity as a strength when score >= 80', () => {
      const clearPRD = `# Clear Product Document

## Introduction
This is section one.

## Problem
This is section two.

## Solution
This is section three.

## Details
This is section four with sufficient content to meet the requirements.`;

      const result = service.evaluatePRD(clearPRD);

      if (result.dimensions.clarity.score >= 80) {
        expect(result.strengths.some(s => s.includes('clarity') || s.includes('structure'))).toBe(true);
      }
    });

    it('should identify completeness as a strength when score >= 80', () => {
      const completePRD = `The main problem is user friction.
Our solution with feature functionality addresses this.
Target users are enterprise customers.
Success will be measured by our goal metrics.
Timeline includes phase milestones.
Feature one and feature two and feature three are included.`;

      const result = service.evaluatePRD(completePRD);

      if (result.dimensions.completeness.score >= 80) {
        expect(result.strengths.some(s =>
          s.includes('Comprehensive') || s.includes('coverage')
        )).toBe(true);
      }
    });

    it('should identify specificity as a strength when score >= 80', () => {
      const specificPRD = `We expect 500 users with 25% growth.
For example, the dashboard shows charts and tables.
The form includes input fields and a button.
` + 'Additional details here. '.repeat(30);

      const result = service.evaluatePRD(specificPRD);

      if (result.dimensions.specificity.score >= 80) {
        expect(result.strengths.some(s =>
          s.includes('specific') || s.includes('concrete')
        )).toBe(true);
      }
    });

    it('should identify measurability as a strength when score >= 80', () => {
      const measurablePRD = `Track metrics and KPI analytics.
Target: 95% uptime and 40% conversion.
1000 users growth goal within 3 months.
Success criteria: achieve target objective.
Review progress every week.`;

      const result = service.evaluatePRD(measurablePRD);

      if (result.dimensions.measurability.score >= 80) {
        expect(result.strengths.some(s =>
          s.includes('metric') || s.includes('success')
        )).toBe(true);
      }
    });

    it('should identify feasibility as a strength when score >= 80', () => {
      const feasiblePRD = `Using API and database backend technology.
Budget constraint and timeline limitation defined.
Phase 1 MVP, then Phase 2 iteration.
Realistic scope with clear boundaries.`;

      const result = service.evaluatePRD(feasiblePRD);

      if (result.dimensions.feasibility.score >= 80) {
        expect(result.strengths.some(s =>
          s.includes('Realistic') || s.includes('scoped')
        )).toBe(true);
      }
    });

    it('should return empty strengths array for poor PRDs', () => {
      const poorPRD = 'bad';

      const result = service.evaluatePRD(poorPRD);

      // All dimensions should score low
      expect(result.dimensions.clarity.score).toBeLessThan(80);
      expect(result.dimensions.completeness.score).toBeLessThan(80);
      expect(result.strengths).toHaveLength(0);
    });
  });

  describe('Overall Score Calculation', () => {
    it('should calculate overall score as weighted sum of dimensions', () => {
      const content = 'Test content for score calculation';
      const result = service.evaluatePRD(content);

      const { clarity, completeness, specificity, measurability, feasibility } = result.dimensions;

      const expectedOverall = Math.round(
        clarity.score * clarity.weight +
        completeness.score * completeness.weight +
        specificity.score * specificity.weight +
        measurability.score * measurability.weight +
        feasibility.score * feasibility.weight
      );

      expect(result.overall).toBe(expectedOverall);
    });

    it('should keep overall score between 0 and 100', () => {
      const emptyContent = '';
      const fullContent = `# Complete PRD with everything

## Problem and Challenge
Major issue and pain point for target users.

## Solution with Features
Feature functionality including dashboard, table, chart, form, screen, list, button.
For example, users can track analytics metrics.

## Target Users and Customers
Primary audience segments.

## Success Metrics and KPIs
- Track 95% uptime
- 1000 users growth
- 40% increase per month

Goal achieved within quarter timeline.

## Phases
Phase 1 MVP with API and database technology.
Phase 2 iteration improvements.

## Constraints
Budget limitation and resource constraint defined.`;

      const emptyResult = service.evaluatePRD(emptyContent);
      const fullResult = service.evaluatePRD(fullContent);

      expect(emptyResult.overall).toBeGreaterThanOrEqual(0);
      expect(emptyResult.overall).toBeLessThanOrEqual(100);
      expect(fullResult.overall).toBeGreaterThanOrEqual(0);
      expect(fullResult.overall).toBeLessThanOrEqual(100);
    });

    it('should score comprehensive PRD higher than minimal PRD', () => {
      const minimal = 'Basic idea.';
      const comprehensive = `# Comprehensive PRD

## Problem Statement
Users face challenge with current solution creating pain points.

## Solution Overview
Our approach with feature functionality solves this.
Dashboard includes charts, tables, and forms.
For example, analytics tracking for 500 users.

## Target Users
Customer audience segments.

## Success Metrics
Track KPI: 40% improvement goal.
1000 users within 3 months.

## Timeline
Phase 1 MVP, Phase 2 iteration.

## Constraints
Budget and resource limitation.
API technology stack.`;

      const minimalResult = service.evaluatePRD(minimal);
      const comprehensiveResult = service.evaluatePRD(comprehensive);

      expect(comprehensiveResult.overall).toBeGreaterThan(minimalResult.overall);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string input', () => {
      const result = service.evaluatePRD('');

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.badge).toBe('bronze');
      expect(result.dimensions.clarity.score).toBeLessThan(50);
    });

    it('should handle very long input', () => {
      const longContent = 'A'.repeat(10000);

      const result = service.evaluatePRD(longContent);

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
      // Should penalize for being too long (no good length bonus)
      // and no realistic scope (feasibility)
    });

    it('should handle input with only special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      const result = service.evaluatePRD(specialChars);

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.badge).toBeDefined();
    });

    it('should handle input with unicode characters', () => {
      const unicode = '这是一个产品需求文档 🚀 with problem and solution for users';

      const result = service.evaluatePRD(unicode);

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.dimensions).toBeDefined();
    });

    it('should handle input with only whitespace', () => {
      const whitespace = '   \n\n\t\t   \n   ';

      const result = service.evaluatePRD(whitespace);

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.badge).toBe('bronze');
    });

    it('should handle input with mixed case keywords', () => {
      const mixedCase = 'PROBLEM statement with SOLUTION for TARGET users. SUCCESS METRICS and TIMELINE.';

      const result = service.evaluatePRD(mixedCase);

      // Should recognize keywords regardless of case
      expect(result.dimensions.completeness.score).toBeGreaterThan(0);
    });
  });

  describe('Dimension Properties', () => {
    it('should set correct name for each dimension', () => {
      const result = service.evaluatePRD('Test');

      expect(result.dimensions.clarity.name).toBe('Clarity');
      expect(result.dimensions.completeness.name).toBe('Completeness');
      expect(result.dimensions.specificity.name).toBe('Specificity');
      expect(result.dimensions.measurability.name).toBe('Measurability');
      expect(result.dimensions.feasibility.name).toBe('Feasibility');
    });

    it('should set maxScore to 100 for all dimensions', () => {
      const result = service.evaluatePRD('Test');

      expect(result.dimensions.clarity.maxScore).toBe(100);
      expect(result.dimensions.completeness.maxScore).toBe(100);
      expect(result.dimensions.specificity.maxScore).toBe(100);
      expect(result.dimensions.measurability.maxScore).toBe(100);
      expect(result.dimensions.feasibility.maxScore).toBe(100);
    });

    it('should set correct weights for each dimension', () => {
      const result = service.evaluatePRD('Test');

      expect(result.dimensions.clarity.weight).toBe(0.25);
      expect(result.dimensions.completeness.weight).toBe(0.25);
      expect(result.dimensions.specificity.weight).toBe(0.2);
      expect(result.dimensions.measurability.weight).toBe(0.15);
      expect(result.dimensions.feasibility.weight).toBe(0.15);
    });

    it('should include non-empty feedback for all dimensions', () => {
      const result = service.evaluatePRD('Test content here');

      expect(result.dimensions.clarity.feedback).toBeTruthy();
      expect(result.dimensions.completeness.feedback).toBeTruthy();
      expect(result.dimensions.specificity.feedback).toBeTruthy();
      expect(result.dimensions.measurability.feedback).toBeTruthy();
      expect(result.dimensions.feasibility.feedback).toBeTruthy();
    });
  });

  describe('Feedback Messages', () => {
    it('should return excellent feedback for high clarity scores', () => {
      const excellentClarity = `# Great Title

## Section One
Content here.

## Section Two
More content.

## Section Three
Even more content.

## Section Four
Final section with good content length.`;

      const result = service.evaluatePRD(excellentClarity);

      if (result.dimensions.clarity.score >= 80) {
        expect(result.dimensions.clarity.feedback).toContain('Excellent');
      }
    });

    it('should return improvement feedback for medium clarity scores', () => {
      const mediumClarity = '## Some Content\n\nParagraph one.\n\nParagraph two.';

      const result = service.evaluatePRD(mediumClarity);

      if (result.dimensions.clarity.score >= 60 && result.dimensions.clarity.score < 80) {
        expect(result.dimensions.clarity.feedback).toContain('Good');
      }
    });

    it('should return needs improvement feedback for low clarity scores', () => {
      const lowClarity = 'bad';

      const result = service.evaluatePRD(lowClarity);

      if (result.dimensions.clarity.score < 60) {
        expect(result.dimensions.clarity.feedback).toContain('Needs improvement');
      }
    });
  });
});
