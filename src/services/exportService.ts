/**
 * Export Service - Section 17
 * Integration with external tools: Jira, Linear, Asana, Figma, Sketch, Notion, Confluence
 */

import {
  ExportPlatform,
  ExportResult,
  PRDExportData,
  ExportConfig,
  JiraExportPayload,
  LinearExportPayload,
  AsanaExportPayload,
  NotionExportPayload,
  FigmaExportPayload,
  FigmaFrame,
} from '../types/export.types';

class ExportService {
  private readonly API_ENDPOINTS = {
    jira: 'https://api.atlassian.com/ex/jira',
    linear: 'https://api.linear.app/graphql',
    asana: 'https://app.asana.com/api/1.0',
    figma: 'https://api.figma.com/v1',
    sketch: 'https://api.sketch.com/v1',
    notion: 'https://api.notion.com/v1',
    confluence: 'https://api.atlassian.com/ex/confluence',
  };

  /**
   * Export PRD to selected platform
   */
  async exportToPlatform(
    platform: ExportPlatform,
    prdData: PRDExportData,
    config: ExportConfig
  ): Promise<ExportResult> {
    try {
      let result: ExportResult;

      switch (platform) {
        case 'jira':
          result = await this.exportToJira(prdData, config);
          break;
        case 'linear':
          result = await this.exportToLinear(prdData, config);
          break;
        case 'asana':
          result = await this.exportToAsana(prdData, config);
          break;
        case 'figma':
          result = await this.exportToFigma(prdData, config);
          break;
        case 'sketch':
          result = await this.exportToSketch(prdData, config);
          break;
        case 'notion':
          result = await this.exportToNotion(prdData, config);
          break;
        case 'confluence':
          result = await this.exportToConfluence(prdData, config);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      return result;
    } catch (error) {
      return {
        platform,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Export to Jira
   */
  private async exportToJira(
    prdData: PRDExportData,
    config: ExportConfig
  ): Promise<ExportResult> {
    const payload: JiraExportPayload = {
      project: config.projectId || '',
      summary: prdData.title,
      description: this.formatJiraDescription(prdData),
      issuetype: 'Epic',
      labels: ['prd', 'product-requirement'],
      priority: 'High',
    };

    const response = await fetch(`${this.API_ENDPOINTS.jira}/${config.workspaceId}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: payload }),
    });

    if (!response.ok) {
      throw new Error(`Jira export failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      platform: 'jira',
      status: 'success',
      url: `${config.workspaceId}/browse/${data.key}`,
      timestamp: new Date(),
    };
  }

  /**
   * Export to Linear
   */
  private async exportToLinear(
    prdData: PRDExportData,
    config: ExportConfig
  ): Promise<ExportResult> {
    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            url
          }
        }
      }
    `;

    const payload: LinearExportPayload = {
      teamId: config.projectId || '',
      title: prdData.title,
      description: this.formatMarkdownDescription(prdData),
      priority: 1,
      labels: ['prd', 'product-requirement'],
    };

    const response = await fetch(this.API_ENDPOINTS.linear, {
      method: 'POST',
      headers: {
        'Authorization': config.apiKey || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: { input: payload },
      }),
    });

    if (!response.ok) {
      throw new Error(`Linear export failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      platform: 'linear',
      status: 'success',
      url: data.data.issueCreate.issue.url,
      timestamp: new Date(),
    };
  }

  /**
   * Export to Asana
   */
  private async exportToAsana(
    prdData: PRDExportData,
    config: ExportConfig
  ): Promise<ExportResult> {
    const payload: AsanaExportPayload = {
      workspace: config.workspaceId || '',
      name: prdData.title,
      notes: this.formatMarkdownDescription(prdData),
      projects: config.projectId ? [config.projectId] : [],
      tags: ['prd', 'product-requirement'],
    };

    const response = await fetch(`${this.API_ENDPOINTS.asana}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: payload }),
    });

    if (!response.ok) {
      throw new Error(`Asana export failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      platform: 'asana',
      status: 'success',
      url: `https://app.asana.com/0/${config.projectId}/${data.data.gid}`,
      timestamp: new Date(),
    };
  }

  /**
   * Export to Figma
   */
  private async exportToFigma(
    prdData: PRDExportData,
    config: ExportConfig
  ): Promise<ExportResult> {
    // Create a basic Figma frame structure from PRD
    const frames: FigmaFrame[] = prdData.keyFeatures.map((feature, index) => ({
      name: feature,
      type: 'FRAME',
      children: [],
      backgroundColor: { r: 0.95, g: 0.95, b: 0.95, a: 1 },
    }));

    const payload: FigmaExportPayload = {
      name: prdData.title,
      file_key: config.projectId || '',
      frames,
    };

    // Note: Figma API requires file creation which is complex
    // This is a simplified version - actual implementation would need full Figma REST API
    const response = await fetch(`${this.API_ENDPOINTS.figma}/files/${config.projectId}/comments`, {
      method: 'POST',
      headers: {
        'X-Figma-Token': config.apiToken || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: this.formatMarkdownDescription(prdData),
      }),
    });

    if (!response.ok) {
      throw new Error(`Figma export failed: ${response.statusText}`);
    }

    return {
      platform: 'figma',
      status: 'success',
      url: `https://www.figma.com/file/${config.projectId}`,
      timestamp: new Date(),
    };
  }

  /**
   * Export to Sketch
   */
  private async exportToSketch(
    prdData: PRDExportData,
    config: ExportConfig
  ): Promise<ExportResult> {
    // Sketch Cloud API
    const response = await fetch(`${this.API_ENDPOINTS.sketch}/shares/${config.projectId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: prdData.title,
        description: this.formatMarkdownDescription(prdData),
      }),
    });

    if (!response.ok) {
      throw new Error(`Sketch export failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      platform: 'sketch',
      status: 'success',
      url: data.shortId ? `https://sketch.com/s/${data.shortId}` : undefined,
      timestamp: new Date(),
    };
  }

  /**
   * Export to Notion
   */
  private async exportToNotion(
    prdData: PRDExportData,
    config: ExportConfig
  ): Promise<ExportResult> {
    const payload: NotionExportPayload = {
      parent: { database_id: config.projectId || '' },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: prdData.title,
              },
            },
          ],
        },
        Description: {
          rich_text: [
            {
              text: {
                content: prdData.description,
              },
            },
          ],
        },
        Status: {
          select: {
            name: 'In Progress',
          },
        },
      },
      children: this.formatNotionBlocks(prdData),
    };

    const response = await fetch(`${this.API_ENDPOINTS.notion}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Notion export failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      platform: 'notion',
      status: 'success',
      url: data.url,
      timestamp: new Date(),
    };
  }

  /**
   * Export to Confluence
   */
  private async exportToConfluence(
    prdData: PRDExportData,
    config: ExportConfig
  ): Promise<ExportResult> {
    const payload = {
      type: 'page',
      title: prdData.title,
      space: { key: config.workspaceId },
      body: {
        storage: {
          value: this.formatConfluenceHtml(prdData),
          representation: 'storage',
        },
      },
    };

    const response = await fetch(
      `${this.API_ENDPOINTS.confluence}/${config.workspaceId}/wiki/rest/api/content`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Confluence export failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      platform: 'confluence',
      status: 'success',
      url: data._links?.webui
        ? `${config.workspaceId}/wiki${data._links.webui}`
        : undefined,
      timestamp: new Date(),
    };
  }

  /**
   * Format PRD data for Jira description
   */
  private formatJiraDescription(prdData: PRDExportData): string {
    return `
h1. ${prdData.title}

h2. Description
${prdData.description}

h2. Target Users
${prdData.targetUsers}

h2. Key Features
${prdData.keyFeatures.map((f) => `* ${f}`).join('\n')}

h2. Success Metrics
${prdData.successMetrics.map((m) => `* ${m}`).join('\n')}

{panel:title=Metadata}
Created: ${prdData.createdAt.toISOString()}
Version: ${prdData.version}
{panel}
    `.trim();
  }

  /**
   * Format PRD data as Markdown
   */
  private formatMarkdownDescription(prdData: PRDExportData): string {
    return `
# ${prdData.title}

## Description
${prdData.description}

## Target Users
${prdData.targetUsers}

## Key Features
${prdData.keyFeatures.map((f) => `- ${f}`).join('\n')}

## Success Metrics
${prdData.successMetrics.map((m) => `- ${m}`).join('\n')}

---
*Created: ${prdData.createdAt.toLocaleDateString()}*
*Version: ${prdData.version}*
    `.trim();
  }

  /**
   * Format PRD data as Notion blocks
   */
  private formatNotionBlocks(prdData: PRDExportData): any[] {
    return [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Key Features' } }],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: prdData.keyFeatures.map((f) => ({
            type: 'text',
            text: { content: f },
          })),
        },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Success Metrics' } }],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: prdData.successMetrics.map((m) => ({
            type: 'text',
            text: { content: m },
          })),
        },
      },
    ];
  }

  /**
   * Format PRD data as Confluence HTML
   */
  private formatConfluenceHtml(prdData: PRDExportData): string {
    return `
<h1>${prdData.title}</h1>
<h2>Description</h2>
<p>${prdData.description}</p>
<h2>Target Users</h2>
<p>${prdData.targetUsers}</p>
<h2>Key Features</h2>
<ul>
${prdData.keyFeatures.map((f) => `<li>${f}</li>`).join('\n')}
</ul>
<h2>Success Metrics</h2>
<ul>
${prdData.successMetrics.map((m) => `<li>${m}</li>`).join('\n')}
</ul>
<p><em>Created: ${prdData.createdAt.toLocaleDateString()} | Version: ${prdData.version}</em></p>
    `.trim();
  }

  /**
   * Validate export configuration
   */
  validateConfig(config: ExportConfig): boolean {
    if (!config.enabled) return false;

    const requiredFields: Record<ExportPlatform, string[]> = {
      jira: ['apiToken', 'workspaceId', 'projectId'],
      linear: ['apiKey', 'projectId'],
      asana: ['apiToken', 'workspaceId'],
      figma: ['apiToken', 'projectId'],
      sketch: ['apiToken', 'projectId'],
      notion: ['apiToken', 'projectId'],
      confluence: ['apiToken', 'workspaceId'],
    };

    const required = requiredFields[config.platform];
    return required.every((field) => config[field as keyof ExportConfig]);
  }

  /**
   * Test connection to platform
   */
  async testConnection(config: ExportConfig): Promise<boolean> {
    try {
      // Simplified connection test - each platform would have its own endpoint
      const testEndpoints: Record<ExportPlatform, string> = {
        jira: `${this.API_ENDPOINTS.jira}/${config.workspaceId}/rest/api/3/myself`,
        linear: this.API_ENDPOINTS.linear,
        asana: `${this.API_ENDPOINTS.asana}/users/me`,
        figma: `${this.API_ENDPOINTS.figma}/me`,
        sketch: `${this.API_ENDPOINTS.sketch}/users/me`,
        notion: `${this.API_ENDPOINTS.notion}/users/me`,
        confluence: `${this.API_ENDPOINTS.confluence}/${config.workspaceId}/wiki/rest/api/user/current`,
      };

      const response = await fetch(testEndpoints[config.platform], {
        headers: {
          Authorization: `Bearer ${config.apiToken || config.apiKey}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

export const exportService = new ExportService();
