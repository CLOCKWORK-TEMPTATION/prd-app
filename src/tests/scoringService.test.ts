
import { describe, it, expect } from 'vitest';
import scoringService, { ScoringService } from '../services/scoringService';

describe('ScoringService', () => {
  // Singleton Pattern Verification
  it('should maintain a singleton instance', () => {
    const instance1 = ScoringService.getInstance();
    const instance2 = ScoringService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(scoringService);
  });

  describe('evaluatePRD', () => {
    // 1. Happy Path: High Quality PRD
    it('should return a high score and Platinum/Gold badge for a comprehensive PRD', () => {
      const highQualityPRD = `
# Project Alpha: AI-Powered Analytics
## Problem Statement
Users currently face a major challenge in tracking their daily water intake. It is difficult, time-consuming, and prone to error.
## Solution
We will build a mobile application that uses AI to automatically log water intake via camera.
## Target Users
Health-conscious individuals, athletes, and patients with kidney issues.
## Success Metrics
- Achieve 10,000 active users in Q1.
- Maintain 40% retention rate after 30 days.
- 50% growth month over month.
## Timeline & Phases
- Phase 1: MVP with basic camera recognition (Month 1-2).
- Phase 2: Social features (Month 3).
## Technical Details
We will use React Native for the frontend and Python/FastAPI for the backend. PostgreSQL for the database.
The API will handle image processing.
## Specific Features
- Camera capture button on the home screen.
- Dashboard showing daily hydration.
- Notification settings screen.
example: User takes a photo of a bottle, app logs 500ml.
      `.trim();

      const result = scoringService.evaluatePRD(highQualityPRD);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThan(80); // Expecting high score
      expect(['platinum', 'gold']).toContain(result.badge);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.suggestions.length).toBeLessThan(3); // Few suggestions for good PRD
    });

    // 2. Edge Case: Empty Input
    it('should handle empty string input gracefully', () => {
      const result = scoringService.evaluatePRD('');

      expect(result.overall).toBeLessThan(20);
      expect(result.badge).toBe('bronze');

      // Note: Empty strings pass negative lookahead checks (no clichés, no vagueness, etc.)
      // and length checks (< 3000), so they get non-zero scores in some dimensions.
      expect(result.dimensions.clarity.score).toBe(10); // hasNoClichés
      expect(result.dimensions.specificity.score).toBe(20); // hasNoVagueness
      expect(result.dimensions.feasibility.score).toBe(35); // hasRealisticScope + noUnrealistic

      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    // 3. Edge Case: Very Short Input
    it('should penalize very short content', () => {
      const shortPRD = 'We will build an app.';
      const result = scoringService.evaluatePRD(shortPRD);

      expect(result.overall).toBeLessThan(50);
      expect(result.dimensions.clarity.score).toBeLessThan(50); // Fails length check
    });

    // 4. Dimension Test: Clarity
    it('should score Clarity correctly based on structure and length', () => {
      const clearPRD = `
# Title
## Section 1
Content...
## Section 2
Content...
## Section 3
Content...
      `.padEnd(300, ' filler text '); // Ensure length > 200

      const result = scoringService.evaluatePRD(clearPRD);
      // Logic: Title(20) + Structure(>3 blocks)(25) + Sections(25) + Length(20) + NoCliché(10) = 100
      // Note: Structure check splits by \n\n. The template above has \n between some lines.
      // Let's make sure we hit the specific regexes.

      expect(result.dimensions.clarity.score).toBeGreaterThan(50);
    });

    it('should penalize clichés in Clarity', () => {
      const clichePRD = `
# Title
We need to leverage our synergy to create a paradigm shift and then circle back.
      `.padEnd(300, ' . ');

      const result = scoringService.evaluatePRD(clichePRD);
      // Should lose the 10 points for "No Clichés"
      // Max possible is 100. If it has title(20), length(20), sections(0), structure(0), cliche(0) -> 40

      expect(result.dimensions.clarity.score).toBeLessThan(100);
    });

    // 5. Dimension Test: Completeness
    it('should detect missing completeness sections', () => {
      const incompletePRD = 'Just some random text without keywords.';
      const result = scoringService.evaluatePRD(incompletePRD);

      expect(result.dimensions.completeness.score).toBe(0);
      expect(result.suggestions).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Include all essential sections'),
        ])
      );
    });

    // 6. Dimension Test: Specificity
    it('should reward specific numbers and examples', () => {
      const specificPRD = 'We have 100% confidence. For example, like button X. 500 details...'.padEnd(600, 'a');
      const result = scoringService.evaluatePRD(specificPRD);

      expect(result.dimensions.specificity.score).toBeGreaterThan(0);
      // Has numbers(25), examples(20), details>500(20), no vagueness(20).
      expect(result.dimensions.specificity.score).toBeGreaterThanOrEqual(85);
    });

    it('should penalize vague language', () => {
      const vaguePRD = 'Maybe we could possibly do something somewhat good.';
      const result = scoringService.evaluatePRD(vaguePRD);
      // Fails "hasNoVagueness" check
      expect(result.dimensions.specificity.score).toBeLessThan(100);
    });

    // 7. Dimension Test: Measurability
    it('should identify measurable metrics', () => {
      const measurablePRD = 'KPI: retention. Goal: 50% increase. Target: 100 users. Time: Q1.';
      const result = scoringService.evaluatePRD(measurablePRD);

      expect(result.dimensions.measurability.score).toBeGreaterThan(80);
    });

    // 8. Dimension Test: Feasibility
    it('should penalize unrealistic scope or keywords', () => {
      const unrealisticPRD = 'We are building an AI that thinks like a human and disrupting everything.';
      const result = scoringService.evaluatePRD(unrealisticPRD);

      // Fails "noUnrealistic" check (15 pts)
      expect(result.dimensions.feasibility.score).toBeLessThan(100);
    });

    it('should reward technical details and constraints', () => {
       const feasiblePRD = 'Using API and database. Constraint: budget. Phase 1.';
       const result = scoringService.evaluatePRD(feasiblePRD);
       expect(result.dimensions.feasibility.score).toBeGreaterThan(50);
    });

    // 9. Badge Calculation Boundary
    it('should assign Bronze badge for low scores', () => {
        // Very minimal content
        const result = scoringService.evaluatePRD('Low quality');
        expect(result.badge).toBe('bronze');
    });

    // 10. Suggestions Generation
    it('should generate appropriate suggestions based on low scores', () => {
        const prd = "Short text."; // Fails almost everything
        const result = scoringService.evaluatePRD(prd);

        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.suggestions.some(s => s.includes('clear section headings'))).toBe(true);
    });

     // 11. Strengths Identification
    it('should identify strengths when score is high', () => {
        const strongClarityPRD = `
# Title
## Section 1
## Section 2
## Section 3
        `.padEnd(300, ' text ');

        const result = scoringService.evaluatePRD(strongClarityPRD);
        // Assuming this hits > 80 clarity
        // Title(20) + Structure(25 if \n\n > 3) + Sections(25) + Length(20) + NoCliche(10)

        // Let's ensure structure:
        const strongClarity = "# T\n\n## S1\n\n## S2\n\n## S3\n\nContent".padEnd(250, 'a');
        const res = scoringService.evaluatePRD(strongClarity);

        expect(res.strengths.some(s => s.includes('clarity'))).toBe(true);
    });

  });

  // Tests from Main Branch (preserved during merge)
  describe('Weight Validation', () => {
    it('should have correct weights summing to 1.0', () => {
      const result = scoringService.evaluatePRD('test');

      expect(result.dimensions.clarity.weight).toBe(0.25);
      expect(result.dimensions.completeness.weight).toBe(0.25);
      expect(result.dimensions.specificity.weight).toBe(0.2);
      expect(result.dimensions.measurability.weight).toBe(0.15);
      expect(result.dimensions.feasibility.weight).toBe(0.15);
    });

    it('should include non-empty feedback for all dimensions', () => {
      const result = scoringService.evaluatePRD('Test content here');

      expect(result.dimensions.clarity.feedback).toBeTruthy();
      expect(result.dimensions.completeness.feedback).toBeTruthy();
      expect(result.dimensions.specificity.feedback).toBeTruthy();
      expect(result.dimensions.measurability.feedback).toBeTruthy();
      expect(result.dimensions.feasibility.feedback).toBeTruthy();
    });
  });

  describe('Feedback Messages (Existing Tests)', () => {
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

      const result = scoringService.evaluatePRD(excellentClarity);

      if (result.dimensions.clarity.score >= 80) {
        expect(result.dimensions.clarity.feedback).toContain('Excellent');
      }
    });

    it('should return improvement feedback for medium clarity scores', () => {
      const mediumClarity = '## Some Content\n\nParagraph one.\n\nParagraph two.';

      const result = scoringService.evaluatePRD(mediumClarity);

      if (result.dimensions.clarity.score >= 60 && result.dimensions.clarity.score < 80) {
        expect(result.dimensions.clarity.feedback).toContain('Good');
      }
    });

    it('should return needs improvement feedback for low clarity scores', () => {
      const lowClarity = 'bad';

      const result = scoringService.evaluatePRD(lowClarity);

      if (result.dimensions.clarity.score < 60) {
        expect(result.dimensions.clarity.feedback).toContain('Needs improvement');
      }
    });
  });
});
