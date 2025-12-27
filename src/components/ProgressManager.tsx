/**
 * Progress Manager - Section 4
 * Auto-save every 30 seconds, "You left off here", session recovery
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Clock, CheckCircle, AlertCircle, RotateCcw, X } from 'lucide-react';
import { ProgressManagerProps, SavedProgress, AutoSaveConfig, SessionRecovery } from '../types';
import { autoSaveService } from '../services/autoSaveService';

const DEFAULT_CONFIG: AutoSaveConfig = {
  interval: 30000, // 30 seconds
  enabled: true,
  maxVersions: 10,
  storageKey: 'prd_progress'
};

export const ProgressManager: React.FC<ProgressManagerProps> = ({
  formData,
  currentStep,
  currentTab,
  onRestore,
  autoSaveConfig = {},
  children
}) => {
  const [config] = useState<AutoSaveConfig>({ ...DEFAULT_CONFIG, ...autoSaveConfig });
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [recoveryData, setRecoveryData] = useState<SessionRecovery | null>(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const sessionId = useRef(generateSessionId());

  /**
   * Generate unique session ID
   */
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Save progress
   */
  const saveProgress = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const progress: SavedProgress = {
        id: `save_${Date.now()}`,
        timestamp: Date.now(),
        formData: { ...formData },
        currentStep,
        currentTab,
        sessionId: sessionId.current,
        version: '1.0.0'
      };

      await autoSaveService.saveProgress(progress);
      setLastSaveTime(Date.now());
      setShowSaveIndicator(true);

      // Hide indicator after 2 seconds
      setTimeout(() => setShowSaveIndicator(false), 2000);

      console.log('[ProgressManager] Progress saved successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save';
      setSaveError(errorMessage);
      console.error('[ProgressManager] Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, currentStep, currentTab]);

  /**
   * Check for unfinished sessions on mount
   */
  useEffect(() => {
    const checkForRecovery = async () => {
      const hasUnfinished = await autoSaveService.hasUnfinishedSession();
      if (!hasUnfinished) return;

      const lastProgress = await autoSaveService.loadProgress();
      if (!lastProgress) return;

      const timeSinceLastSave = Date.now() - lastProgress.timestamp;

      setRecoveryData({
        hasUnfinishedSession: true,
        lastSavedProgress: lastProgress,
        timeSinceLastSave
      });

      setShowRecoveryPrompt(true);
    };

    checkForRecovery();
  }, []);

  /**
   * Start auto-save on mount
   */
  useEffect(() => {
    if (!config.enabled) return;

    autoSaveService.start(config, saveProgress);

    return () => {
      autoSaveService.stop();
    };
  }, [config, saveProgress]);

  /**
   * Save on unmount or page unload
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      saveProgress();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveProgress(); // Final save on unmount
    };
  }, [saveProgress]);

  /**
   * Restore progress
   */
  const handleRestore = () => {
    if (!recoveryData?.lastSavedProgress || !onRestore) return;

    onRestore(recoveryData.lastSavedProgress);
    setShowRecoveryPrompt(false);

    console.log('[ProgressManager] Progress restored');
  };

  /**
   * Dismiss recovery prompt
   */
  const handleDismissRecovery = () => {
    setShowRecoveryPrompt(false);
    autoSaveService.clearHistory();
  };

  /**
   * Format time since last save
   */
  const formatTimeSince = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  /**
   * Get next save countdown
   */
  const getNextSaveIn = (): string => {
    if (!lastSaveTime) return `${config.interval / 1000}s`;

    const elapsed = Date.now() - lastSaveTime;
    const remaining = Math.max(0, config.interval - elapsed);
    return `${Math.ceil(remaining / 1000)}s`;
  };

  return (
    <div className="relative">
      {/* Recovery Prompt */}
      {showRecoveryPrompt && recoveryData?.lastSavedProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Welcome back! You left off here
                </h3>
                <p className="text-sm text-gray-600">
                  We found your previous session from{' '}
                  {recoveryData.timeSinceLastSave &&
                    formatTimeSince(recoveryData.lastSavedProgress.timestamp)}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-xs text-gray-500 mb-2">Saved Progress:</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tab:</span>
                  <span className="font-medium">
                    {recoveryData.lastSavedProgress.currentTab === 0
                      ? 'Research'
                      : recoveryData.lastSavedProgress.currentTab === 1
                      ? 'Create PRD'
                      : 'Generate Prototype'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Step:</span>
                  <span className="font-medium">{recoveryData.lastSavedProgress.currentStep + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fields completed:</span>
                  <span className="font-medium">
                    {Object.keys(recoveryData.lastSavedProgress.formData).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRestore}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Restore Progress
              </button>
              <button
                onClick={handleDismissRecovery}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-save Status Indicator */}
      <div className="fixed bottom-4 right-4 z-40">
        {/* Save indicator */}
        {showSaveIndicator && (
          <div className="mb-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Saved</span>
          </div>
        )}

        {/* Error indicator */}
        {saveError && (
          <div className="mb-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{saveError}</span>
            <button
              onClick={() => setSaveError(null)}
              className="ml-2 hover:bg-red-600 rounded p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Status bar */}
        {config.enabled && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs text-gray-600 flex items-center gap-2">
            {isSaving ? (
              <>
                <Save className="w-3 h-3 animate-pulse text-blue-500" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-gray-400" />
                {lastSaveTime ? (
                  <span>Saved {formatTimeSince(lastSaveTime)}</span>
                ) : (
                  <span>Auto-save enabled</span>
                )}
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">Next in {getNextSaveIn()}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Manual save button */}
      {config.enabled && (
        <button
          onClick={saveProgress}
          disabled={isSaving}
          className="fixed bottom-20 right-4 z-40 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save now"
        >
          <Save className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} />
        </button>
      )}

      {/* Children */}
      {children}
    </div>
  );
};
