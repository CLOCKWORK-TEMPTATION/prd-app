/**
 * Basic Example - How to use the Version Comparator
 * Section 19: Compare Versions Feature
 */

import React from 'react';
import { VersionComparator } from '../components/VersionComparator';
import { createSampleVersions } from '../services/versionService';

/**
 * Basic usage example
 */
export const BasicExample: React.FC = () => {
  const sampleVersions = createSampleVersions();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <VersionComparator
        initialVersions={sampleVersions}
        onABTestCreate={(config) => {
          console.log('A/B Test Created:', config);
          // Handle A/B test creation
        }}
      />
    </div>
  );
};

/**
 * Custom versions example
 */
export const CustomVersionsExample: React.FC = () => {
  const customVersions = [
    {
      id: 'custom-v1',
      type: 'prototype' as const,
      name: 'My Prototype',
      description: 'Initial prototype version',
      createdAt: new Date(),
      updatedAt: new Date(),
      features: [
        {
          id: 'f1',
          name: 'User Login',
          description: 'Basic authentication',
          category: 'Auth',
          implemented: true,
          priority: 'high' as const
        },
        {
          id: 'f2',
          name: 'Dashboard',
          description: 'Main dashboard view',
          category: 'UI',
          implemented: false,
          priority: 'medium' as const
        }
      ]
    },
    {
      id: 'custom-v2',
      type: 'alpha' as const,
      name: 'My Alpha',
      description: 'Enhanced alpha version',
      createdAt: new Date(),
      updatedAt: new Date(),
      features: [
        {
          id: 'f1',
          name: 'User Login',
          description: 'Authentication with OAuth',
          category: 'Auth',
          implemented: true,
          priority: 'high' as const
        },
        {
          id: 'f2',
          name: 'Dashboard',
          description: 'Interactive dashboard with charts',
          category: 'UI',
          implemented: true,
          priority: 'medium' as const
        },
        {
          id: 'f3',
          name: 'Analytics',
          description: 'User analytics tracking',
          category: 'Features',
          implemented: true,
          priority: 'low' as const
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <VersionComparator initialVersions={customVersions} />
    </div>
  );
};

export default BasicExample;
