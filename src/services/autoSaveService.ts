/**
 * Auto Save Service - Section 4
 * Handles automatic saving every 30 seconds with recovery
 */

import { AutoSaveConfig, AutoSaveStatus, SavedProgress } from '../types';

class AutoSaveServiceImpl {
  private intervalId: NodeJS.Timeout | null = null;
  private config: AutoSaveConfig | null = null;
  private onSaveCallback: (() => void) | null = null;
  private status: AutoSaveStatus = {
    isEnabled: false,
    isSaving: false
  };
  private saveHistory: SavedProgress[] = [];
  private readonly HISTORY_KEY = 'prd_save_history';
  private readonly MAX_HISTORY = 10;

  /**
   * Start auto-save service
   */
  public start(config: AutoSaveConfig, onSave: () => void): void {
    this.stop(); // Stop any existing interval

    this.config = config;
    this.onSaveCallback = onSave;
    this.status.isEnabled = config.enabled;

    if (!config.enabled) {
      console.log('[AutoSave] Service disabled');
      return;
    }

    console.log(`[AutoSave] Starting with ${config.interval}ms interval`);

    this.intervalId = setInterval(() => {
      this.saveNow();
    }, config.interval);

    // Update next save time
    this.updateNextSaveTime();
  }

  /**
   * Stop auto-save service
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.status.isEnabled = false;
      console.log('[AutoSave] Service stopped');
    }
  }

  /**
   * Trigger immediate save
   */
  public saveNow(): void {
    if (!this.onSaveCallback || !this.config) {
      console.warn('[AutoSave] No save callback configured');
      return;
    }

    if (this.status.isSaving) {
      console.log('[AutoSave] Already saving, skipping...');
      return;
    }

    try {
      this.status.isSaving = true;
      this.status.error = undefined;

      console.log('[AutoSave] Saving...');
      this.onSaveCallback();

      this.status.lastSaveTime = Date.now();
      this.updateNextSaveTime();

      console.log('[AutoSave] Save successful');
    } catch (error) {
      console.error('[AutoSave] Save failed:', error);
      this.status.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      this.status.isSaving = false;
    }
  }

  /**
   * Get current status
   */
  public getStatus(): AutoSaveStatus {
    return { ...this.status };
  }

  /**
   * Save progress to storage
   */
  public async saveProgress(progress: SavedProgress): Promise<void> {
    try {
      // Add to history
      this.saveHistory.unshift(progress);

      // Limit history size
      if (this.saveHistory.length > this.MAX_HISTORY) {
        this.saveHistory = this.saveHistory.slice(0, this.MAX_HISTORY);
      }

      // Save to localStorage
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.saveHistory));

      // Save current progress separately for quick access
      localStorage.setItem('prd_current_progress', JSON.stringify(progress));

      console.log('[AutoSave] Progress saved to storage');
    } catch (error) {
      console.error('[AutoSave] Failed to save progress:', error);
      throw error;
    }
  }

  /**
   * Load saved progress
   */
  public async loadProgress(): Promise<SavedProgress | null> {
    try {
      const stored = localStorage.getItem('prd_current_progress');
      if (!stored) return null;

      return JSON.parse(stored);
    } catch (error) {
      console.error('[AutoSave] Failed to load progress:', error);
      return null;
    }
  }

  /**
   * Get save history
   */
  public async getHistory(): Promise<SavedProgress[]> {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (!stored) return [];

      return JSON.parse(stored);
    } catch (error) {
      console.error('[AutoSave] Failed to load history:', error);
      return [];
    }
  }

  /**
   * Clear save history
   */
  public clearHistory(): void {
    this.saveHistory = [];
    localStorage.removeItem(this.HISTORY_KEY);
    localStorage.removeItem('prd_current_progress');
    console.log('[AutoSave] History cleared');
  }

  /**
   * Check if there's an unfinished session
   */
  public async hasUnfinishedSession(): Promise<boolean> {
    const progress = await this.loadProgress();
    if (!progress) return false;

    // Check if last save was within the last 24 hours
    const hoursSinceLastSave = (Date.now() - progress.timestamp) / (1000 * 60 * 60);
    return hoursSinceLastSave < 24;
  }

  /**
   * Get time since last save
   */
  public getTimeSinceLastSave(): number | null {
    if (!this.status.lastSaveTime) return null;
    return Date.now() - this.status.lastSaveTime;
  }

  /**
   * Update next save time
   */
  private updateNextSaveTime(): void {
    if (!this.config || !this.status.isEnabled) {
      this.status.nextSaveTime = undefined;
      return;
    }

    const lastSave = this.status.lastSaveTime || Date.now();
    this.status.nextSaveTime = lastSave + this.config.interval;
  }
}

// Export singleton instance
export const autoSaveService = new AutoSaveServiceImpl();
