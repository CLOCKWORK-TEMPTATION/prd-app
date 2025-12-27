/**
 * Export Types - Section 17
 * Types for integration with external tools (Jira, Linear, Asana, Figma, Sketch, Notion, Confluence)
 */

export type ExportPlatform =
  | 'jira'
  | 'linear'
  | 'asana'
  | 'figma'
  | 'sketch'
  | 'notion'
  | 'confluence';

export type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

export interface ExportConfig {
  platform: ExportPlatform;
  apiKey?: string;
  apiToken?: string;
  workspaceId?: string;
  projectId?: string;
  boardId?: string;
  enabled: boolean;
}

export interface ExportResult {
  platform: ExportPlatform;
  status: ExportStatus;
  url?: string;
  error?: string;
  timestamp: Date;
}

export interface PRDExportData {
  title: string;
  description: string;
  targetUsers: string;
  keyFeatures: string[];
  successMetrics: string[];
  researchData?: ResearchData;
  createdAt: Date;
  version: string;
}

export interface ResearchData {
  productName: string;
  preferences: string;
  insights: string[];
  competitors: string[];
  marketSize?: string;
}

export interface JiraExportPayload {
  project: string;
  summary: string;
  description: string;
  issuetype: string;
  labels: string[];
  priority?: string;
}

export interface LinearExportPayload {
  teamId: string;
  title: string;
  description: string;
  priority: number;
  labels?: string[];
}

export interface AsanaExportPayload {
  workspace: string;
  name: string;
  notes: string;
  projects?: string[];
  tags?: string[];
}

export interface NotionExportPayload {
  parent: { database_id: string };
  properties: {
    Name: { title: [{ text: { content: string } }] };
    Description: { rich_text: [{ text: { content: string } }] };
    Status: { select: { name: string } };
  };
  children: any[];
}

export interface FigmaExportPayload {
  name: string;
  file_key: string;
  node_id?: string;
  frames: FigmaFrame[];
}

export interface FigmaFrame {
  name: string;
  type: 'FRAME';
  children: any[];
  backgroundColor: { r: number; g: number; b: number; a: number };
}

export interface ExportSettings {
  configs: ExportConfig[];
  defaultPlatform?: ExportPlatform;
  autoExport: boolean;
  exportHistory: ExportResult[];
}
