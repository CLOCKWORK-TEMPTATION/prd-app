/**
 * Main Entry Point with Sections 9 & 10 Integration
 * This file re-exports all components for easy integration
 */

// Components
export { default as QualityScorer } from './components/QualityScorer';
export { default as UserPortfolio } from './components/UserPortfolio';

// Services
export { default as scoringService } from './services/scoringService';
export { default as portfolioService } from './services/portfolioService';

// Types
export * from './types/quality';
export * from './types/portfolio';

/**
 * Quick Start Example:
 *
 * import { QualityScorer, UserPortfolio, scoringService, portfolioService } from './src/index';
 *
 * // In your component:
 * const handlePRDCreated = (prdContent: string) => {
 *   const score = scoringService.evaluatePRD(prdContent);
 *   portfolioService.addPRD('My PRD', prdContent, 'alpha', score);
 * };
 *
 * // Render:
 * <QualityScorer prdContent={prdContent} />
 * <UserPortfolio />
 */
