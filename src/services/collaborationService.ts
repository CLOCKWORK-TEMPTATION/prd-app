/**
 * Collaboration Service
 * Section 12: Team Collaboration Features
 *
 * Handles all collaboration-related operations:
 * - Share link with team
 * - Real-time co-editing
 * - Comments & suggestions
 * - Version history
 * - Team adoption features
 */

import {
  CollaborativePRD,
  CollaborationRole,
  VersionHistory,
  Suggestion,
  ShareLinkConfig,
  ShareLinkResponse,
  RealtimeEdit,
  CollaborationActivity,
  CollaborationInvite,
  User,
  ChangeRecord
} from '../types/collaboration.types';

/**
 * Mock database for collaboration
 */
class CollaborationDatabase {
  private prds: Map<string, CollaborativePRD> = new Map();
  private users: Map<string, User> = new Map();
  private shareLinks: Map<string, { prdId: string; config: ShareLinkConfig }> = new Map();

  constructor() {
    this.seedMockData();
  }

  private seedMockData() {
    // Mock users
    const mockUsers: User[] = [
      { id: '1', name: 'Ahmed Hassan', email: 'ahmed@example.com', avatar: '👨‍💻' },
      { id: '2', name: 'Sara Mohamed', email: 'sara@example.com', avatar: '👩‍💼' },
      { id: '3', name: 'Omar Khalil', email: 'omar@example.com', avatar: '👨‍🎨' }
    ];

    mockUsers.forEach(user => this.users.set(user.id, user));

    // Mock collaborative PRD
    const mockPRD: CollaborativePRD = {
      id: 'collab-prd-1',
      title: 'Collaborative Dashboard Project',
      content: '# PRD: Collaborative Dashboard\n\nA real-time collaborative dashboard...',
      ownerId: '1',
      owner: mockUsers[0],
      collaborators: [
        {
          userId: '1',
          role: 'owner',
          addedAt: new Date('2025-12-20'),
          addedBy: '1'
        },
        {
          userId: '2',
          role: 'editor',
          addedAt: new Date('2025-12-21'),
          addedBy: '1'
        }
      ],
      shareLink: undefined,
      isLocked: false,
      currentVersion: 2,
      versions: [
        {
          id: 'v1',
          prdId: 'collab-prd-1',
          version: 1,
          content: 'Initial PRD content...',
          changes: [],
          createdBy: mockUsers[0],
          createdAt: new Date('2025-12-20'),
          description: 'Initial version'
        },
        {
          id: 'v2',
          prdId: 'collab-prd-1',
          version: 2,
          content: 'Updated PRD with more details...',
          changes: [
            {
              type: 'edit',
              field: 'content',
              oldValue: 'Initial PRD content...',
              newValue: 'Updated PRD with more details...'
            }
          ],
          createdBy: mockUsers[1],
          createdAt: new Date('2025-12-21'),
          description: 'Added technical requirements'
        }
      ],
      suggestions: [],
      createdAt: new Date('2025-12-20'),
      updatedAt: new Date('2025-12-21'),
      lastEditedBy: '2'
    };

    this.prds.set(mockPRD.id, mockPRD);
  }

  getAllPRDs(): CollaborativePRD[] {
    return Array.from(this.prds.values());
  }

  getPRDById(id: string): CollaborativePRD | undefined {
    return this.prds.get(id);
  }

  updatePRD(id: string, updates: Partial<CollaborativePRD>): CollaborativePRD | undefined {
    const prd = this.prds.get(id);
    if (!prd) return undefined;

    const updated = { ...prd, ...updates, updatedAt: new Date() };
    this.prds.set(id, updated);
    return updated;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  createShareLink(token: string, prdId: string, config: ShareLinkConfig) {
    this.shareLinks.set(token, { prdId, config });
  }

  getShareLinkData(token: string) {
    return this.shareLinks.get(token);
  }
}

const db = new CollaborationDatabase();

/**
 * Collaboration Service Class
 */
export class CollaborationService {
  /**
   * Get collaborative PRD by ID
   */
  static async getCollaborativePRD(prdId: string, userId: string): Promise<CollaborativePRD | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prd = db.getPRDById(prdId);
        if (!prd) {
          resolve(null);
          return;
        }

        // Check if user has access
        const hasAccess = prd.collaborators.some(c => c.userId === userId);
        if (!hasAccess && prd.ownerId !== userId) {
          resolve(null);
          return;
        }

        resolve(prd);
      }, 300);
    });
  }

  /**
   * Create a shareable link for a PRD
   */
  static async createShareLink(config: ShareLinkConfig): Promise<ShareLinkResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate unique token
        const token = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const shareLink = `${window.location.origin}/prd/shared/${token}`;

        let expiresAt: Date | undefined;
        if (config.expiryDays) {
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + config.expiryDays);
        }

        db.createShareLink(token, config.prdId, config);

        // Update PRD with share link
        db.updatePRD(config.prdId, {
          shareLink,
          shareLinkExpiry: expiresAt
        });

        resolve({ shareLink, expiresAt });
      }, 300);
    });
  }

  /**
   * Add collaborator to PRD
   */
  static async addCollaborator(
    prdId: string,
    userId: string,
    newCollaboratorEmail: string,
    role: 'editor' | 'commenter' | 'viewer'
  ): Promise<CollaborativePRD | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prd = db.getPRDById(prdId);
        if (!prd) {
          resolve(null);
          return;
        }

        // Check if current user is owner or editor
        const currentUser = prd.collaborators.find(c => c.userId === userId);
        if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'editor')) {
          resolve(null);
          return;
        }

        // Mock: find user by email (in real app, this would be a user lookup)
        const newCollaboratorId = `user-${Date.now()}`;
        const newCollaborator: CollaborationRole = {
          userId: newCollaboratorId,
          role,
          addedAt: new Date(),
          addedBy: userId
        };

        const updated = db.updatePRD(prdId, {
          collaborators: [...prd.collaborators, newCollaborator]
        });

        resolve(updated || null);
      }, 400);
    });
  }

  /**
   * Update PRD content and create new version
   */
  static async updatePRDContent(
    prdId: string,
    userId: string,
    newContent: string,
    versionDescription?: string
  ): Promise<VersionHistory | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prd = db.getPRDById(prdId);
        const user = db.getUserById(userId);

        if (!prd || !user) {
          resolve(null);
          return;
        }

        // Check permissions
        const collaborator = prd.collaborators.find(c => c.userId === userId);
        if (!collaborator || (collaborator.role !== 'owner' && collaborator.role !== 'editor')) {
          resolve(null);
          return;
        }

        // Check if locked by another user
        if (prd.isLocked && prd.lockedBy !== userId) {
          resolve(null);
          return;
        }

        // Create change record
        const changes: ChangeRecord[] = [
          {
            type: 'edit',
            field: 'content',
            oldValue: prd.content,
            newValue: newContent
          }
        ];

        // Create new version
        const newVersion: VersionHistory = {
          id: `v${prd.currentVersion + 1}`,
          prdId,
          version: prd.currentVersion + 1,
          content: newContent,
          changes,
          createdBy: user,
          createdAt: new Date(),
          description: versionDescription
        };

        // Update PRD
        db.updatePRD(prdId, {
          content: newContent,
          currentVersion: prd.currentVersion + 1,
          versions: [...prd.versions, newVersion],
          lastEditedBy: userId
        });

        resolve(newVersion);
      }, 500);
    });
  }

  /**
   * Add a suggestion to PRD
   */
  static async addSuggestion(
    prdId: string,
    userId: string,
    content: string,
    type: 'edit' | 'addition' | 'deletion' | 'comment',
    targetField?: string
  ): Promise<Suggestion | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prd = db.getPRDById(prdId);
        const user = db.getUserById(userId);

        if (!prd || !user) {
          resolve(null);
          return;
        }

        const newSuggestion: Suggestion = {
          id: `suggestion-${Date.now()}`,
          prdId,
          userId,
          user,
          content,
          type,
          targetField,
          status: 'pending',
          createdAt: new Date()
        };

        db.updatePRD(prdId, {
          suggestions: [...prd.suggestions, newSuggestion]
        });

        resolve(newSuggestion);
      }, 300);
    });
  }

  /**
   * Resolve a suggestion (accept/reject)
   */
  static async resolveSuggestion(
    suggestionId: string,
    userId: string,
    status: 'accepted' | 'rejected'
  ): Promise<Suggestion | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allPRDs = db.getAllPRDs();
        let targetPRD: CollaborativePRD | undefined;
        let targetSuggestion: Suggestion | undefined;

        // Find PRD containing this suggestion
        for (const prd of allPRDs) {
          const suggestion = prd.suggestions.find(s => s.id === suggestionId);
          if (suggestion) {
            targetPRD = prd;
            targetSuggestion = suggestion;
            break;
          }
        }

        if (!targetPRD || !targetSuggestion) {
          resolve(null);
          return;
        }

        // Update suggestion
        const updatedSuggestions = targetPRD.suggestions.map(s =>
          s.id === suggestionId
            ? { ...s, status, resolvedAt: new Date(), resolvedBy: userId }
            : s
        );

        db.updatePRD(targetPRD.id, { suggestions: updatedSuggestions });

        const updated = updatedSuggestions.find(s => s.id === suggestionId);
        resolve(updated || null);
      }, 300);
    });
  }

  /**
   * Lock PRD for editing
   */
  static async lockPRD(prdId: string, userId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prd = db.getPRDById(prdId);
        if (!prd) {
          resolve(false);
          return;
        }

        // Check if already locked by someone else
        if (prd.isLocked && prd.lockedBy !== userId) {
          resolve(false);
          return;
        }

        db.updatePRD(prdId, {
          isLocked: true,
          lockedBy: userId,
          lockedAt: new Date()
        });

        resolve(true);
      }, 200);
    });
  }

  /**
   * Unlock PRD
   */
  static async unlockPRD(prdId: string, userId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prd = db.getPRDById(prdId);
        if (!prd) {
          resolve(false);
          return;
        }

        // Only owner or the one who locked can unlock
        if (prd.isLocked && prd.lockedBy !== userId && prd.ownerId !== userId) {
          resolve(false);
          return;
        }

        db.updatePRD(prdId, {
          isLocked: false,
          lockedBy: undefined,
          lockedAt: undefined
        });

        resolve(true);
      }, 200);
    });
  }

  /**
   * Get version history for a PRD
   */
  static async getVersionHistory(prdId: string): Promise<VersionHistory[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prd = db.getPRDById(prdId);
        if (!prd) {
          resolve([]);
          return;
        }

        resolve(prd.versions);
      }, 200);
    });
  }

  /**
   * Restore a specific version
   */
  static async restoreVersion(
    prdId: string,
    versionId: string,
    userId: string
  ): Promise<VersionHistory | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prd = db.getPRDById(prdId);
        const user = db.getUserById(userId);

        if (!prd || !user) {
          resolve(null);
          return;
        }

        // Find version
        const version = prd.versions.find(v => v.id === versionId);
        if (!version) {
          resolve(null);
          return;
        }

        // Create new version from restored content
        const restoredVersion: VersionHistory = {
          id: `v${prd.currentVersion + 1}`,
          prdId,
          version: prd.currentVersion + 1,
          content: version.content,
          changes: [
            {
              type: 'edit',
              field: 'content',
              oldValue: prd.content,
              newValue: version.content
            }
          ],
          createdBy: user,
          createdAt: new Date(),
          description: `Restored from version ${version.version}`
        };

        db.updatePRD(prdId, {
          content: version.content,
          currentVersion: prd.currentVersion + 1,
          versions: [...prd.versions, restoredVersion],
          lastEditedBy: userId
        });

        resolve(restoredVersion);
      }, 400);
    });
  }

  /**
   * Get collaboration activity feed
   */
  static async getActivityFeed(prdId: string, limit: number = 50): Promise<CollaborationActivity[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prd = db.getPRDById(prdId);
        if (!prd) {
          resolve([]);
          return;
        }

        // Mock activity feed (in real app, this would be a separate collection)
        const activities: CollaborationActivity[] = [];

        // Add version activities
        prd.versions.forEach(version => {
          activities.push({
            id: `activity-${version.id}`,
            prdId,
            userId: version.createdBy.id,
            user: version.createdBy,
            type: 'version_created',
            description: `Created version ${version.version}${version.description ? `: ${version.description}` : ''}`,
            timestamp: version.createdAt
          });
        });

        // Add suggestion activities
        prd.suggestions.forEach(suggestion => {
          activities.push({
            id: `activity-${suggestion.id}`,
            prdId,
            userId: suggestion.userId,
            user: suggestion.user,
            type: 'suggestion',
            description: `Added a ${suggestion.type} suggestion`,
            timestamp: suggestion.createdAt
          });
        });

        // Sort by timestamp descending
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        resolve(activities.slice(0, limit));
      }, 300);
    });
  }

  /**
   * Simulate real-time editing (WebSocket simulation)
   */
  static subscribeToRealtimeEdits(
    prdId: string,
    onEdit: (edit: RealtimeEdit) => void
  ): () => void {
    // Mock WebSocket subscription
    // In real app, this would use WebSocket or Server-Sent Events

    const intervalId = setInterval(() => {
      // Simulate random edits (for demo purposes)
      const mockUser = db.getUserById('2');
      if (mockUser && Math.random() > 0.7) {
        const edit: RealtimeEdit = {
          userId: '2',
          user: mockUser,
          field: 'content',
          value: 'Updated content...',
          timestamp: new Date(),
          cursorPosition: Math.floor(Math.random() * 100)
        };
        onEdit(edit);
      }
    }, 5000);

    // Return unsubscribe function
    return () => clearInterval(intervalId);
  }
}

export default CollaborationService;
