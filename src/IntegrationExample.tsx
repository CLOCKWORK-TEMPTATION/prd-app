/**
 * Integration Example
 * How to integrate Section 3 & 4 components with the main app
 */

import React, { useState } from 'react';
import { AIWritingAssistant } from './components/AIWritingAssistant';
import { ProgressManager } from './components/ProgressManager';
import { SavedProgress } from './types';

/**
 * Example: PRD Form with AI Writing Assistant and Auto-Save
 */
export const PRDFormWithAI: React.FC = () => {
  const [formData, setFormData] = useState({
    product: '',
    targetUsers: '',
    features: ''
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);

  /**
   * Handle field change
   */
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Handle progress restore
   */
  const handleRestore = (progress: SavedProgress) => {
    setFormData(progress.formData);
    setCurrentStep(progress.currentStep);
    setCurrentTab(progress.currentTab);
  };

  /**
   * Expand text using AI (mock implementation)
   */
  const handleExpand = async (text: string): Promise<string> => {
    // In production, this would call an AI API
    // For now, return an expanded mock version
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          text +
            '\n\nExpanded details:\n' +
            '• Enhanced user experience with intuitive interface\n' +
            '• Real-time collaboration features\n' +
            '• Advanced analytics and reporting\n' +
            '• Mobile-responsive design\n' +
            '• Integration with popular tools'
        );
      }, 1500);
    });
  };

  return (
    <ProgressManager
      formData={formData}
      currentStep={currentStep}
      currentTab={currentTab}
      onRestore={handleRestore}
      autoSaveConfig={{
        interval: 30000, // 30 seconds
        enabled: true,
        maxVersions: 10,
        storageKey: 'prd_progress'
      }}
    >
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Create PRD with AI Assistant</h1>

        <div className="space-y-6">
          {/* Question 1: Product */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              1. What product or feature are you building?
            </label>
            <AIWritingAssistant
              fieldName="product"
              value={formData.product}
              onChange={(value) => handleFieldChange('product', value)}
              placeholder="e.g., A real-time collaboration dashboard for remote teams..."
              previousAnswers={{}}
              onExpand={handleExpand}
              enabled={true}
              minCharactersForSuggestions={10}
            />
          </div>

          {/* Question 2: Target Users */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              2. Who are the target users and what problem does this solve?
            </label>
            <AIWritingAssistant
              fieldName="targetUsers"
              value={formData.targetUsers}
              onChange={(value) => handleFieldChange('targetUsers', value)}
              placeholder="e.g., Remote team managers who struggle with visibility..."
              previousAnswers={{ product: formData.product }}
              onExpand={handleExpand}
              enabled={true}
              minCharactersForSuggestions={10}
            />
          </div>

          {/* Question 3: Features */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              3. What are the key features and how will you measure success?
            </label>
            <AIWritingAssistant
              fieldName="features"
              value={formData.features}
              onChange={(value) => handleFieldChange('features', value)}
              placeholder="e.g., Live status updates, team activity feed..."
              previousAnswers={{
                product: formData.product,
                targetUsers: formData.targetUsers
              }}
              onExpand={handleExpand}
              enabled={true}
              minCharactersForSuggestions={10}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            onClick={() => console.log('Submit PRD:', formData)}
          >
            Generate PRD
          </button>
        </div>
      </div>
    </ProgressManager>
  );
};

/**
 * Example: Minimal Integration
 */
export const MinimalExample: React.FC = () => {
  const [text, setText] = useState('');

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">AI Writing Assistant - Minimal Example</h2>

      <AIWritingAssistant
        fieldName="example"
        value={text}
        onChange={setText}
        placeholder="Start typing to see AI suggestions..."
        enabled={true}
      />

      <div className="mt-4 text-sm text-gray-600">
        Current value: {text}
      </div>
    </div>
  );
};

/**
 * Example: Progress Manager Only
 */
export const ProgressOnlyExample: React.FC = () => {
  const [data, setData] = useState({ field1: '', field2: '' });

  return (
    <ProgressManager
      formData={data}
      currentStep={0}
      currentTab={0}
      onRestore={(progress) => setData(progress.formData)}
    >
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Auto-Save Example</h2>

        <input
          type="text"
          value={data.field1}
          onChange={(e) => setData({ ...data, field1: e.target.value })}
          placeholder="Field 1"
          className="w-full p-2 border rounded mb-4"
        />

        <input
          type="text"
          value={data.field2}
          onChange={(e) => setData({ ...data, field2: e.target.value })}
          placeholder="Field 2"
          className="w-full p-2 border rounded"
        />

        <p className="mt-4 text-sm text-gray-600">
          Your progress is automatically saved every 30 seconds
        </p>
      </div>
    </ProgressManager>
  );
};
