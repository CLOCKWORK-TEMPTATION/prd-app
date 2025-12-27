/**
 * Collaboration Features Types
 * Section 12: Team Collaboration on PRDs
 */

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

export interface CollaborationRole {
  userId: string;
  role: 'owner' | 'editor' | 'commenter' | 'viewer';
  addedAt: Date;
  addedBy: string;
}

export interface VersionHistory {
  id: string;
  prdId: string;
  version: number;
  content: string;
  changes: ChangeRecord[];
  createdBy: User;
  createdAt: Date;
  description?: string;
}

export interface ChangeRecord {
  type: 'add' | 'edit' | 'delete';
  field: string;
  oldValue?: string;
  newValue?: string;
  position?: number;
}

export interface Suggestion {
  id: string;
  prdId: string;
  userId: string;
  user: User;
  content: string;
  type: 'edit' | 'addition' | 'deletion' | 'comment';
  targetField?: string;
  targetPosition?: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface CollaborativePRD {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  owner: User;

  // Collaboration
  collaborators: CollaborationRole[];
  shareLink?: string;
  shareLinkExpiry?: Date;

  // Editing
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: Date;

  // Version control
  currentVersion: number;
  versions: VersionHistory[];

  // Suggestions & comments
  suggestions: Suggestion[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastEditedBy?: string;
}

export interface ShareLinkConfig {
  prdId: string;
  expiryDays?: number;
  permissions: 'viewer' | 'commenter' | 'editor';
  requiresAuth?: boolean;
}

export interface ShareLinkResponse {
  shareLink: string;
  expiresAt?: Date;
}

export interface RealtimeEdit {
  userId: string;
  user: User;
  field: string;
  value: string;
  timestamp: Date;
  cursorPosition?: number;
}

export interface CollaborationActivity {
  id: string;
  prdId: string;
  userId: string;
  user: User;
  type: 'edit' | 'comment' | 'suggestion' | 'version_created' | 'collaborator_added';
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface CollaborationInvite {
  id: string;
  prdId: string;
  invitedBy: User;
  invitedEmail: string;
  role: 'editor' | 'commenter' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt?: Date;
}
