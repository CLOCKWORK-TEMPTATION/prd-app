/**
 * Export Manager Component - Section 17
 * UI for managing exports to external tools (Jira, Linear, Asana, Figma, Sketch, Notion, Confluence)
 */

import React, { useState, useEffect } from 'react';
import {
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  ExternalLink,
  Key,
  AlertCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  ExportPlatform,
  ExportConfig,
  ExportResult,
  ExportSettings,
  PRDExportData,
} from '../types/export.types';
import { exportService } from '../services/exportService';

interface ExportManagerProps {
  prdData: PRDExportData;
  onExportComplete?: (result: ExportResult) => void;
}

const PLATFORM_INFO: Record<
  ExportPlatform,
  { name: string; icon: string; color: string; description: string }
> = {
  jira: {
    name: 'Jira',
    icon: '🔷',
    color: '#0052CC',
    description: 'Export as Epic with full details',
  },
  linear: {
    name: 'Linear',
    icon: '⚡',
    color: '#5E6AD2',
    description: 'Create issue with rich description',
  },
  asana: {
    name: 'Asana',
    icon: '🎯',
    color: '#F06A6A',
    description: 'Add task to your project',
  },
  figma: {
    name: 'Figma',
    icon: '🎨',
    color: '#F24E1E',
    description: 'Create design frames from features',
  },
  sketch: {
    name: 'Sketch',
    icon: '💎',
    color: '#FDB300',
    description: 'Export to Sketch Cloud',
  },
  notion: {
    name: 'Notion',
    icon: '📝',
    color: '#000000',
    description: 'Add page to your database',
  },
  confluence: {
    name: 'Confluence',
    icon: '📚',
    color: '#0052CC',
    description: 'Create documentation page',
  },
};

export const ExportManager: React.FC<ExportManagerProps> = ({
  prdData,
  onExportComplete,
}) => {
  const [settings, setSettings] = useState<ExportSettings>({
    configs: [],
    autoExport: false,
    exportHistory: [],
  });

  const [selectedPlatform, setSelectedPlatform] = useState<ExportPlatform | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [configForm, setConfigForm] = useState<Partial<ExportConfig>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<ExportPlatform, boolean>>({} as any);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('exportSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('exportSettings', JSON.stringify(settings));
  }, [settings]);

  const handleConfigurePlatform = (platform: ExportPlatform) => {
    setSelectedPlatform(platform);
    setIsConfiguring(true);

    const existingConfig = settings.configs.find((c) => c.platform === platform);
    setConfigForm(
      existingConfig || {
        platform,
        enabled: true,
      }
    );
  };

  const handleSaveConfig = () => {
    if (!selectedPlatform) return;

    const newConfig: ExportConfig = {
      platform: selectedPlatform,
      enabled: true,
      apiKey: configForm.apiKey,
      apiToken: configForm.apiToken,
      workspaceId: configForm.workspaceId,
      projectId: configForm.projectId,
      boardId: configForm.boardId,
    };

    setSettings((prev) => ({
      ...prev,
      configs: [
        ...prev.configs.filter((c) => c.platform !== selectedPlatform),
        newConfig,
      ],
    }));

    setIsConfiguring(false);
    setSelectedPlatform(null);
  };

  const handleTestConnection = async (platform: ExportPlatform) => {
    const config = settings.configs.find((c) => c.platform === platform);
    if (!config) return;

    const isConnected = await exportService.testConnection(config);
    setConnectionStatus((prev) => ({ ...prev, [platform]: isConnected }));
  };

  const handleExport = async (platform: ExportPlatform) => {
    const config = settings.configs.find((c) => c.platform === platform);
    if (!config || !exportService.validateConfig(config)) {
      alert('Please configure this platform first');
      return;
    }

    setIsExporting(true);
    try {
      const result = await exportService.exportToPlatform(platform, prdData, config);

      setSettings((prev) => ({
        ...prev,
        exportHistory: [result, ...prev.exportHistory.slice(0, 49)], // Keep last 50
      }));

      if (onExportComplete) {
        onExportComplete(result);
      }

      if (result.status === 'success') {
        alert(`Successfully exported to ${PLATFORM_INFO[platform].name}!`);
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Export error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteConfig = (platform: ExportPlatform) => {
    setSettings((prev) => ({
      ...prev,
      configs: prev.configs.filter((c) => c.platform !== platform),
    }));
  };

  const isConfigured = (platform: ExportPlatform): boolean => {
    const config = settings.configs.find((c) => c.platform === platform);
    return config ? exportService.validateConfig(config) : false;
  };

  const renderPlatformCard = (platform: ExportPlatform) => {
    const info = PLATFORM_INFO[platform];
    const configured = isConfigured(platform);
    const isConnected = connectionStatus[platform];

    return (
      <div
        key={platform}
        className="border rounded-lg p-4 hover:shadow-lg transition-all"
        style={{ borderColor: info.color }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{info.icon}</span>
            <div>
              <h3 className="font-semibold text-lg">{info.name}</h3>
              <p className="text-sm text-gray-600">{info.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {configured && (
              <button
                onClick={() => handleTestConnection(platform)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Test connection"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleConfigurePlatform(platform)}
              className="p-1 hover:bg-gray-100 rounded"
              title="Configure"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {configured ? (
              <>
                {isConnected === true && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {isConnected === false && (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                {isConnected === undefined && (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">
                  {isConnected === true
                    ? 'Connected'
                    : isConnected === false
                    ? 'Connection failed'
                    : 'Configured'}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400">Not configured</span>
            )}
          </div>

          <button
            onClick={() => handleExport(platform)}
            disabled={!configured || isExporting}
            className="px-4 py-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: configured ? info.color : '#ccc' }}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderConfigModal = () => {
    if (!isConfiguring || !selectedPlatform) return null;

    const info = PLATFORM_INFO[selectedPlatform];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>{info.icon}</span>
              Configure {info.name}
            </h2>
            <button
              onClick={() => setIsConfiguring(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* API Token/Key */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Key className="w-4 h-4 inline mr-1" />
                API Token/Key
              </label>
              <input
                type="password"
                value={configForm.apiToken || configForm.apiKey || ''}
                onChange={(e) =>
                  setConfigForm((prev) => ({
                    ...prev,
                    apiToken: e.target.value,
                    apiKey: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter your API token"
              />
            </div>

            {/* Workspace ID */}
            {['jira', 'asana', 'confluence'].includes(selectedPlatform) && (
              <div>
                <label className="block text-sm font-medium mb-1">Workspace ID</label>
                <input
                  type="text"
                  value={configForm.workspaceId || ''}
                  onChange={(e) =>
                    setConfigForm((prev) => ({
                      ...prev,
                      workspaceId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., your-workspace"
                />
              </div>
            )}

            {/* Project ID */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Project/Database ID
              </label>
              <input
                type="text"
                value={configForm.projectId || ''}
                onChange={(e) =>
                  setConfigForm((prev) => ({
                    ...prev,
                    projectId: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter project or database ID"
              />
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setIsConfiguring(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded text-white"
                style={{ backgroundColor: info.color }}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderExportHistory = () => {
    if (settings.exportHistory.length === 0) return null;

    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Recent Exports</h3>
        <div className="space-y-2">
          {settings.exportHistory.slice(0, 5).map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{PLATFORM_INFO[result.platform].icon}</span>
                <div>
                  <p className="font-medium">{PLATFORM_INFO[result.platform].name}</p>
                  <p className="text-xs text-gray-500">
                    {result.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {result.status === 'success' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </>
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Export to Production Tools</h1>
        <p className="text-gray-600">
          Connect your PRD with real project management and design tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(PLATFORM_INFO).map((platform) =>
          renderPlatformCard(platform as ExportPlatform)
        )}
      </div>

      {renderExportHistory()}
      {renderConfigModal()}
    </div>
  );
};

export default ExportManager;
