# Section 19: Compare Versions Feature

## Overview
A comprehensive version comparison feature that allows users to compare different versions of their product (Prototype, Alpha, Beta, Pilot) side-by-side, understand feature evolution, and simulate A/B testing.

## Features

### 🔍 Version Comparison
- Compare any two versions side-by-side
- Visual diff highlighting (added, removed, modified, unchanged)
- Similarity score calculation
- Category-based grouping
- Detailed change tracking

### 📊 Multiple View Modes
1. **Differences View**: Highlighted diff viewer with color-coded changes
2. **Side-by-Side View**: Compare features in parallel columns
3. **Statistics View**: Visual charts and breakdown by category

### 🎯 Smart Analysis
- Feature-level change detection
- Priority and implementation status tracking
- Category-based organization
- Comprehensive statistics

### 💾 Export Capabilities
- Export comparisons to Markdown
- Export comparisons to JSON
- Download individual version details

### 🧪 A/B Testing Simulator
- Create A/B test configurations
- Define metrics and hypotheses
- Compare version performance potential

## Components

### VersionComparator
Main component for version comparison interface.

```tsx
import { VersionComparator } from './components/VersionComparator';

<VersionComparator
  initialVersions={versions}
  onABTestCreate={(config) => console.log(config)}
/>
```

**Props:**
- `initialVersions?: Version[]` - Optional initial versions (defaults to sample data)
- `onABTestCreate?: (config: ABTestConfig) => void` - Callback when A/B test is created

### DiffViewer
Displays feature differences with visual highlighting.

```tsx
import { DiffViewer } from './components/DiffViewer';

<DiffViewer
  diffs={diffs}
  showUnchanged={true}
  groupByCategory={true}
  highlightMode="unified"
/>
```

**Props:**
- `diffs: FeatureDiff[]` - Array of feature differences
- `showUnchanged?: boolean` - Show/hide unchanged features (default: false)
- `groupByCategory?: boolean` - Group by category (default: true)
- `highlightMode?: 'side-by-side' | 'unified'` - Highlight mode (default: 'unified')

## Services

### versionService
Core service for version comparison logic.

**Key Functions:**

```typescript
// Compare two versions
const comparison = compareVersions(versionA, versionB);

// Generate feature diffs
const diffs = generateFeatureDiffs(versionA, versionB);

// Calculate similarity
const score = calculateSimilarityScore(versionA, versionB);

// Create sample versions
const versions = createSampleVersions();

// Export to formats
const markdown = exportVersionToMarkdown(version);
const json = exportVersionToJSON(version);

// Create A/B test
const abTest = createABTest(name, versionA, versionB, metrics);
```

## Types

### Version
```typescript
interface Version {
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
```

### Feature
```typescript
interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  implemented: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedEffort?: string;
  dependencies?: string[];
}
```

### ComparisonResult
```typescript
interface ComparisonResult {
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
```

## Usage Examples

### Basic Usage
```tsx
import { VersionComparator } from './components/VersionComparator';
import { createSampleVersions } from './services/versionService';

function App() {
  const versions = createSampleVersions();

  return (
    <VersionComparator
      initialVersions={versions}
      onABTestCreate={(config) => {
        console.log('A/B test created:', config);
      }}
    />
  );
}
```

### Custom Versions
```tsx
import { VersionComparator } from './components/VersionComparator';
import { Version, VersionType } from './types/version';

const myVersions: Version[] = [
  {
    id: 'v1',
    type: VersionType.PROTOTYPE,
    name: 'Prototype',
    description: 'Initial prototype',
    features: [
      {
        id: 'f1',
        name: 'Login',
        description: 'User authentication',
        category: 'Auth',
        implemented: true,
        priority: 'high'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // ... more versions
];

<VersionComparator initialVersions={myVersions} />
```

### Programmatic Comparison
```typescript
import { compareVersions, generateFeatureDiffs } from './services/versionService';

// Compare versions
const comparison = compareVersions(prototypeVersion, alphaVersion);

console.log(`Added: ${comparison.stats.addedCount}`);
console.log(`Removed: ${comparison.stats.removedCount}`);
console.log(`Modified: ${comparison.stats.modifiedCount}`);

// Generate diffs for visualization
const diffs = generateFeatureDiffs(prototypeVersion, alphaVersion);
```

## Sample Data

The package includes sample data for 4 version types:

1. **Prototype** (3 features)
   - Basic functionality
   - Simple UI
   - Core features only

2. **Alpha** (5 features)
   - Enhanced features
   - Better UI
   - More functionality

3. **Beta** (8 features)
   - Production-ready
   - Advanced features
   - Data persistence

4. **Pilot** (11 features)
   - Enterprise-grade
   - A/B testing
   - Monitoring & analytics

## Styling

The components use Tailwind CSS for styling. Ensure Tailwind is configured in your project:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Dependencies

- React 18+
- lucide-react (for icons)
- Tailwind CSS (for styling)

## File Structure

```
src/
├── types/
│   └── version.ts          # Type definitions
├── services/
│   └── versionService.ts   # Core business logic
├── components/
│   ├── VersionComparator.tsx  # Main component
│   └── DiffViewer.tsx         # Diff viewer component
├── examples/
│   └── BasicExample.tsx    # Usage examples
└── index.ts                # Main exports
```

## Key Features Explained

### 1. Version Comparison Algorithm
The comparison algorithm identifies:
- **Added features**: Present in version B but not in A
- **Removed features**: Present in version A but not in B
- **Modified features**: Present in both but with changes
- **Unchanged features**: Identical in both versions

### 2. Change Detection
Detects changes in:
- Feature name
- Description
- Category
- Implementation status
- Priority level

### 3. Similarity Score
Calculates similarity as:
```
similarity = (common + modified) / max(totalA, totalB) * 100
```

### 4. A/B Testing Configuration
Creates structured A/B test configs with:
- Version references
- Metrics to track
- Hypothesis statement
- Target audience (optional)
- Duration (optional)

## Integration with Existing System

To integrate with the main PRD application:

```tsx
// In your main app
import { VersionComparator } from './src/components/VersionComparator';

// Add as a new tab or route
<Tab value="compare-versions">
  <VersionComparator />
</Tab>
```

## Future Enhancements

Potential future improvements:
- Real-time collaboration on version comparison
- Version history timeline visualization
- Automated version generation from PRD changes
- Integration with version control systems
- Custom comparison rules and filters
- Performance metrics comparison
- User feedback integration

## Contributing

When adding new features:
1. Update type definitions in `types/version.ts`
2. Add service functions in `services/versionService.ts`
3. Update components as needed
4. Add examples in `examples/`
5. Update this README

## License

Part of the PRD to Prototype application.

---

**Section 19 Implementation Complete** ✅

For questions or issues, please refer to the main project documentation.
