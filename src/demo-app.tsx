/**
 * Demo App - Sections 9 & 10 Standalone Demo
 * A standalone demo showing Quality Scorer and User Portfolio features
 */

import React, { useState } from 'react';
import { FileText, Award, TrendingUp } from 'lucide-react';
import QualityScorer from './components/QualityScorer';
import UserPortfolio from './components/UserPortfolio';
import portfolioService from './services/portfolioService';
import { QualityScore } from './types/quality';
import { PRDEntry } from './types/portfolio';

const SAMPLE_PRD = `# E-Commerce Mobile App

## Problem Statement
Small business owners struggle to sell their products online due to the complexity and cost of existing e-commerce platforms. They need a simple, affordable solution to reach customers on mobile devices.

## Target Users
- Small business owners (retail, handmade goods, local services)
- Age range: 25-55
- Tech-savvy but not developers
- Budget-conscious entrepreneurs

## Solution
A mobile-first e-commerce app that allows business owners to:
- Set up a store in under 10 minutes
- Upload products with photos and descriptions
- Process payments securely
- Track orders and inventory
- Communicate with customers

## Key Features
1. **Quick Store Setup**: Guided wizard for store creation
2. **Product Management**: Easy photo upload, categorization, pricing
3. **Payment Processing**: Integration with Stripe and PayPal
4. **Order Dashboard**: Real-time order tracking and notifications
5. **Customer Chat**: In-app messaging system
6. **Analytics**: Sales reports and customer insights

## Success Metrics
- 80% of users complete store setup within 15 minutes
- 70% user retention after 30 days
- Average transaction volume of $500/month per store
- 4.5+ star rating in app stores
- 40% reduction in customer support tickets vs competitors

## Timeline
- **MVP (Month 1-2)**: Store setup, product listing, basic payments
- **Alpha (Month 3-4)**: Order management, customer notifications
- **Beta (Month 5-6)**: Analytics, chat, marketing tools
- **Launch (Month 7)**: App store submission, marketing campaign

## Technical Constraints
- Must work on iOS 14+ and Android 10+
- Backend: Node.js with PostgreSQL
- Budget: $50,000 for MVP development
- Team: 2 developers, 1 designer, 1 PM
`;

export default function DemoApp() {
  const [activeTab, setActiveTab] = useState<'scorer' | 'portfolio'>('scorer');
  const [prdContent, setPrdContent] = useState(SAMPLE_PRD);
  const [currentScore, setCurrentScore] = useState<QualityScore | null>(null);

  const handleSavePRD = () => {
    if (currentScore) {
      const title = prdContent.match(/^#\s+(.+)$/m)?.[1] || 'Untitled PRD';
      portfolioService.addPRD(title, prdContent, 'alpha', currentScore);
      alert('✅ PRD saved to portfolio!');
      setActiveTab('portfolio');
    }
  };

  const handleLoadPRD = (prd: PRDEntry) => {
    setPrdContent(prd.content);
    setActiveTab('scorer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Quality Scorer & Portfolio Demo
          </h1>
          <p className="text-gray-600">
            Section 9: PRD Quality Score | Section 10: User Portfolio
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('scorer')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'scorer'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Quality Scorer
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'portfolio'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Award className="w-5 h-5" />
            Portfolio
          </button>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'scorer' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PRD Editor */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    PRD Content
                  </h3>
                  <textarea
                    value={prdContent}
                    onChange={(e) => setPrdContent(e.target.value)}
                    className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your PRD here..."
                  />
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleSavePRD}
                      disabled={!currentScore}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        currentScore
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      💾 Save to Portfolio
                    </button>
                    <button
                      onClick={() => setPrdContent(SAMPLE_PRD)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      🔄 Reset Sample
                    </button>
                  </div>
                </div>
              </div>

              {/* Quality Score */}
              <div className="space-y-4">
                <QualityScorer
                  prdContent={prdContent}
                  onScoreCalculated={(score) => setCurrentScore(score)}
                  autoCalculate={true}
                />
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <UserPortfolio onSelectPRD={handleLoadPRD} />
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white rounded-lg shadow-lg p-6 max-w-2xl">
            <h3 className="font-bold text-lg mb-2">✨ Features Implemented</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Section 9: Quality Score</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ Real-time quality scoring (0-100)</li>
                  <li>✅ 5 dimensions breakdown</li>
                  <li>✅ Badge system (Bronze → Platinum)</li>
                  <li>✅ Suggestions for improvement</li>
                  <li>✅ Strength identification</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple-600 mb-2">Section 10: Portfolio</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ Statistics dashboard</li>
                  <li>✅ PRD history with filters</li>
                  <li>✅ Timeline view</li>
                  <li>✅ Achievement system</li>
                  <li>✅ Export as JSON/PDF</li>
                  <li>✅ Streak tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
