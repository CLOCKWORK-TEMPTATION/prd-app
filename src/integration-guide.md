# Integration Guide - Sections 9 & 10

## Overview
This guide explains how to integrate the Quality Scorer (Section 9) and User Portfolio (Section 10) into the main application.

## Files Created

### Types
- `src/types/quality.ts` - Quality scoring types
- `src/types/portfolio.ts` - Portfolio and PRD types

### Services
- `src/services/scoringService.ts` - Quality scoring logic
- `src/services/portfolioService.ts` - Portfolio management

### Components
- `src/components/QualityScorer.tsx` - Quality score display
- `src/components/UserPortfolio.tsx` - Portfolio viewer

## Integration Steps

### 1. Import Components in Main App

Add these imports at the top of the main file:

```typescript
import QualityScorer from './src/components/QualityScorer';
import UserPortfolio from './src/components/UserPortfolio';
import portfolioService from './src/services/portfolioService';
import scoringService from './src/services/scoringService';
import { QualityScore } from './src/types/quality';
```

### 2. Add State Management

Add these state variables in the App component:

```typescript
const [currentQualityScore, setCurrentQualityScore] = useState<QualityScore | null>(null);
const [showPortfolio, setShowPortfolio] = useState(false);
```

### 3. Update Tab Navigation

Change the tabs to include a 4th tab for Portfolio:

```typescript
// Add after existing tabs
<button
  onClick={() => setActiveTab(3)}
  className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
    activeTab === 3
      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
  }`}
>
  <Award size={18}/>
  Portfolio
</button>
```

### 4. Integrate Quality Scorer in Tab 1 (Create PRD)

In Tab 1, after the PRD is generated, add the QualityScorer:

```typescript
{activeTab === 1 && (
  <div className="flex gap-6 h-[calc(100vh-280px)]">
    {/* Left: Form (existing code) */}
    <div className="w-1/2 ...">
      {/* existing form code */}
    </div>

    {/* Right: PRD Output + Quality Score */}
    <div className="w-1/2 space-y-4 overflow-auto">
      {/* Existing PRD display */}
      {generatedPRD && (
        <div>
          {/* existing PRD display code */}
        </div>
      )}

      {/* NEW: Quality Scorer */}
      {generatedPRD && (
        <QualityScorer
          prdContent={generatedPRD}
          onScoreCalculated={(score) => {
            setCurrentQualityScore(score);
          }}
          autoCalculate={true}
        />
      )}
    </div>
  </div>
)}
```

### 5. Save PRD to Portfolio

When a PRD is generated, automatically save it to portfolio:

```typescript
const handlePRDGenerated = async (prdContent: string) => {
  setGeneratedPRD(prdContent);

  // Calculate quality score
  const score = scoringService.evaluatePRD(prdContent);
  setCurrentQualityScore(score);

  // Save to portfolio
  const title = extractTitleFromPRD(prdContent) || 'Untitled PRD';
  portfolioService.addPRD(title, prdContent, 'alpha', score);

  showToast('PRD saved to portfolio', 'success');
};

// Helper function
function extractTitleFromPRD(prd: string): string {
  const match = prd.match(/^#\s+(.+)$/m);
  return match ? match[1] : '';
}
```

### 6. Save Prototype to Portfolio

When a prototype is generated, link it to the PRD:

```typescript
const handlePrototypeGenerated = async (html: string) => {
  setGeneratedHTML(html);

  // Find the most recent PRD and add prototype
  const portfolio = portfolioService.getPortfolio();
  if (portfolio.prds.length > 0) {
    const latestPRD = portfolio.prds[0];
    portfolioService.addPrototype(latestPRD.id, html);
    portfolioService.completePRD(latestPRD.id);
    showToast('Prototype linked to PRD', 'success');
  }
};
```

### 7. Add Portfolio Tab (Tab 3)

Add the new tab view:

```typescript
{/* Tab 3: Portfolio */}
{activeTab === 3 && (
  <div className="h-[calc(100vh-280px)] overflow-auto">
    <UserPortfolio
      onSelectPRD={(prd) => {
        // Load selected PRD into editor
        setGeneratedPRD(prd.content);
        setActiveTab(1);
        showToast('PRD loaded', 'info');
      }}
    />
  </div>
)}
```

### 8. Add Translation Keys

Add these to the TRANSLATIONS object:

```typescript
"en-US": {
  // ... existing translations
  "portfolio": "Portfolio",
  "qualityScore": "Quality Score",
  "viewPortfolio": "View Portfolio",
  "prdSaved": "PRD saved to portfolio",
},
"ar-EG": {
  // ... existing translations
  "portfolio": "المحفظة",
  "qualityScore": "تقييم الجودة",
  "viewPortfolio": "عرض المحفظة",
  "prdSaved": "تم حفظ PRD في المحفظة",
}
```

## Testing

1. Create a PRD in Tab 1 - should see quality score automatically
2. Navigate to Tab 3 - should see the PRD in portfolio
3. Generate a prototype in Tab 2 - should link to the PRD
4. Check achievements in Portfolio tab

## Features Implemented

### Section 9: PRD Quality Score ✅
- Real-time quality scoring
- Score breakdown by dimensions (Clarity, Completeness, etc.)
- Badge system (Bronze, Silver, Gold, Platinum)
- Suggestions for improvement
- Visual feedback with colors and charts

### Section 10: PRD History & Portfolio ✅
- User portfolio page
- Statistics dashboard
- All PRDs with filters
- Timeline view
- Achievement system
- Export as JSON/PDF
- Success rate tracking
- Streak system

## Next Steps

To fully integrate, you need to:

1. Modify the main app file to include the imports
2. Add the new state variables
3. Update the generatePRD function to save to portfolio
4. Update the generatePrototype function to link prototypes
5. Add the 4th tab for Portfolio
6. Test all functionality

All the heavy lifting is done in the service files - the integration just connects the UI!
