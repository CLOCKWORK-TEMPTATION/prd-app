/**
 * Section 3 & 4 Types
 * Types for AI Writing Assistant and Progress Manager
 */

// AI Writing Assistant Types
export interface AISuggestion {
  id: string;
  text: string;
  context: string;
  confidence: number;
  type: 'autocomplete' | 'expansion' | 'example';
}

export interface AIWritingContext {
  fieldName: string;
  currentText: string;
  previousAnswers: Record<string, string>;
  userIntent?: string;
}

export interface AIWritingAssistantProps {
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  previousAnswers?: Record<string, string>;
  onExpand?: (text: string) => Promise<string>;
  enabled?: boolean;
  minCharactersForSuggestions?: number;
}

export interface AIExpansionRequest {
  text: string;
  context: AIWritingContext;
}

export interface AIExpansionResponse {
  expandedText: string;
  suggestions: string[];
}

// Progress Manager Types
export interface SavedProgress {
  id: string;
  timestamp: number;
  formData: Record<string, any>;
  currentStep: number;
  currentTab: number;
  lastActiveField?: string;
  sessionId: string;
  version: string;
}

export interface AutoSaveConfig {
  interval: number; // milliseconds
  enabled: boolean;
  maxVersions: number;
  storageKey: string;
}

export interface ProgressManagerProps {
  formData: Record<string, any>;
  currentStep: number;
  currentTab: number;
  onRestore?: (progress: SavedProgress) => void;
  autoSaveConfig?: Partial<AutoSaveConfig>;
  children?: React.ReactNode;
}

export interface SessionRecovery {
  hasUnfinishedSession: boolean;
  lastSavedProgress?: SavedProgress;
  timeSinceLastSave?: number;
}

export interface AutoSaveStatus {
  isEnabled: boolean;
  lastSaveTime?: number;
  nextSaveTime?: number;
  isSaving: boolean;
  error?: string;
}

// Service Types
export interface AutoSaveService {
  start: (config: AutoSaveConfig, onSave: () => void) => void;
  stop: () => void;
  saveNow: () => void;
  getStatus: () => AutoSaveStatus;
  clearHistory: () => void;
}

export interface StorageManager {
  save: (key: string, data: any) => Promise<void>;
  load: (key: string) => Promise<any>;
  delete: (key: string) => Promise<void>;
  getAll: () => Promise<Record<string, any>>;
  clear: () => Promise<void>;
}
