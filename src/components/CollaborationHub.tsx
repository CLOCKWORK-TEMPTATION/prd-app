/**
 * Collaboration Hub Component
 * Section 12: Team Collaboration Features
 *
 * Features:
 * - Share link with team
 * - Real-time co-editing
 * - Comments & suggestions
 * - Version history
 * - Team adoption
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Share2,
  Users,
  History,
  MessageSquare,
  Lock,
  Unlock,
  Plus,
  Check,
  X,
  ChevronDown,
  Copy,
  Eye,
  Edit3,
  Clock,
  Activity,
  AlertCircle
} from 'lucide-react';
import CollaborationService from '../services/collaborationService';
import {
  CollaborativePRD,
  VersionHistory,
  Suggestion,
  CollaborationActivity,
  RealtimeEdit
} from '../types/collaboration.types';

interface CollaborationHubProps {
  prdId: string;
  currentUserId: string;
  onContentUpdate?: (content: string) => void;
}

type Tab = 'edit' | 'suggestions' | 'versions' | 'activity';

export const CollaborationHub: React.FC<CollaborationHubProps> = ({
  prdId,
  currentUserId,
  onContentUpdate
}) => {
  const [prd, setPrd] = useState<CollaborativePRD | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('edit');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<VersionHistory[]>([]);
  const [activities, setActivities] = useState<CollaborationActivity[]>([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [realtimeEdits, setRealtimeEdits] = useState<RealtimeEdit[]>([]);

  useEffect(() => {
    loadPRD();
    loadVersionHistory();
    loadActivityFeed();

    // Subscribe to real-time edits
    const unsubscribe = CollaborationService.subscribeToRealtimeEdits(
      prdId,
      (edit) => {
        setRealtimeEdits(prev => [...prev.slice(-4), edit]);
      }
    );

    return () => unsubscribe();
  }, [prdId]);

  const loadPRD = async () => {
    setLoading(true);
    try {
      const data = await CollaborationService.getCollaborativePRD(prdId, currentUserId);
      if (data) {
        setPrd(data);
        setContent(data.content);
        setShareLink(data.shareLink || null);
      }
    } catch (error) {
      console.error('Failed to load PRD:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVersionHistory = async () => {
    try {
      const history = await CollaborationService.getVersionHistory(prdId);
      setVersions(history);
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  };

  const loadActivityFeed = async () => {
    try {
      const feed = await CollaborationService.getActivityFeed(prdId);
      setActivities(feed);
    } catch (error) {
      console.error('Failed to load activity:', error);
    }
  };

  const handleLockToggle = async () => {
    if (!prd) return;

    try {
      if (prd.isLocked && prd.lockedBy === currentUserId) {
        await CollaborationService.unlockPRD(prdId, currentUserId);
        setIsEditing(false);
      } else if (!prd.isLocked) {
        const locked = await CollaborationService.lockPRD(prdId, currentUserId);
        if (locked) {
          setIsEditing(true);
        }
      }
      await loadPRD();
    } catch (error) {
      console.error('Failed to toggle lock:', error);
    }
  };

  const handleSaveContent = async () => {
    if (!prd) return;

    try {
      const newVersion = await CollaborationService.updatePRDContent(
        prdId,
        currentUserId,
        content,
        'Updated content'
      );

      if (newVersion) {
        await loadPRD();
        await loadVersionHistory();
        await loadActivityFeed();
        setIsEditing(false);

        if (onContentUpdate) {
          onContentUpdate(content);
        }
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  const handleCreateShareLink = async () => {
    try {
      const response = await CollaborationService.createShareLink({
        prdId,
        expiryDays: 7,
        permissions: 'editor'
      });

      setShareLink(response.shareLink);
      await loadPRD();
    } catch (error) {
      console.error('Failed to create share link:', error);
    }
  };

  const handleCopyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert('Share link copied to clipboard!');
    }
  };

  const handleAddSuggestion = async () => {
    if (!newSuggestion.trim()) return;

    try {
      const suggestion = await CollaborationService.addSuggestion(
        prdId,
        currentUserId,
        newSuggestion,
        'comment'
      );

      if (suggestion) {
        await loadPRD();
        setNewSuggestion('');
      }
    } catch (error) {
      console.error('Failed to add suggestion:', error);
    }
  };

  const handleResolveSuggestion = async (suggestionId: string, status: 'accepted' | 'rejected') => {
    try {
      await CollaborationService.resolveSuggestion(suggestionId, currentUserId, status);
      await loadPRD();
      await loadActivityFeed();
    } catch (error) {
      console.error('Failed to resolve suggestion:', error);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    try {
      const restored = await CollaborationService.restoreVersion(prdId, versionId, currentUserId);
      if (restored) {
        await loadPRD();
        await loadVersionHistory();
        setShowVersions(false);
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  const canEdit = () => {
    if (!prd) return false;
    const collaborator = prd.collaborators.find(c => c.userId === currentUserId);
    return collaborator && (collaborator.role === 'owner' || collaborator.role === 'editor');
  };

  if (loading) {
    return <div style={styles.loading}>Loading collaboration hub...</div>;
  }

  if (!prd) {
    return <div style={styles.error}>PRD not found or you don't have access.</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{prd.title}</h1>
          <p style={styles.subtitle}>
            Collaborative editing • {prd.collaborators.length} collaborators
          </p>
        </div>

        <div style={styles.headerActions}>
          {/* Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            style={styles.shareButton}
          >
            <Share2 size={18} />
            Share
          </button>

          {/* Lock/Unlock Button */}
          {canEdit() && (
            <button
              onClick={handleLockToggle}
              style={prd.isLocked && prd.lockedBy === currentUserId ? styles.unlockButton : styles.lockButton}
            >
              {prd.isLocked && prd.lockedBy === currentUserId ? (
                <>
                  <Unlock size={18} />
                  Unlock
                </>
              ) : (
                <>
                  <Lock size={18} />
                  {prd.isLocked ? 'Locked' : 'Lock to Edit'}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Collaborators Bar */}
      <div style={styles.collaboratorsBar}>
        <div style={styles.collaboratorsList}>
          <Users size={18} />
          {prd.collaborators.slice(0, 5).map((collab, idx) => (
            <div key={collab.userId} style={styles.collaboratorAvatar}>
              👤
            </div>
          ))}
          {prd.collaborators.length > 5 && (
            <span style={styles.moreCollaborators}>+{prd.collaborators.length - 5}</span>
          )}
        </div>

        {/* Real-time Activity Indicator */}
        {realtimeEdits.length > 0 && (
          <div style={styles.realtimeIndicator}>
            <Activity size={16} style={styles.pulse} />
            <span>{realtimeEdits[realtimeEdits.length - 1].user.name} is editing...</span>
          </div>
        )}
      </div>

      {/* Lock Warning */}
      {prd.isLocked && prd.lockedBy !== currentUserId && (
        <div style={styles.lockWarning}>
          <AlertCircle size={18} />
          <span>
            This PRD is currently being edited by another user. View-only mode.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('edit')}
          style={activeTab === 'edit' ? styles.tabActive : styles.tab}
        >
          <Edit3 size={16} />
          Edit
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          style={activeTab === 'suggestions' ? styles.tabActive : styles.tab}
        >
          <MessageSquare size={16} />
          Suggestions ({prd.suggestions.filter(s => s.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('versions')}
          style={activeTab === 'versions' ? styles.tabActive : styles.tab}
        >
          <History size={16} />
          Versions ({versions.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          style={activeTab === 'activity' ? styles.tabActive : styles.tab}
        >
          <Activity size={16} />
          Activity
        </button>
      </div>

      {/* Content Area */}
      <div style={styles.content}>
        {/* Edit Tab */}
        {activeTab === 'edit' && (
          <div style={styles.editSection}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!isEditing}
              style={{
                ...styles.textarea,
                ...(isEditing ? {} : styles.textareaDisabled)
              }}
              placeholder="PRD content..."
            />

            {isEditing && (
              <div style={styles.editActions}>
                <button onClick={handleSaveContent} style={styles.saveButton}>
                  <Check size={18} />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setContent(prd.content);
                    handleLockToggle();
                  }}
                  style={styles.cancelButton}
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div style={styles.suggestionsSection}>
            <div style={styles.suggestionInput}>
              <textarea
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                placeholder="Add a suggestion or comment..."
                style={styles.suggestionTextarea}
              />
              <button onClick={handleAddSuggestion} style={styles.addButton}>
                <Plus size={18} />
                Add Suggestion
              </button>
            </div>

            <div style={styles.suggestionsList}>
              {prd.suggestions.length === 0 ? (
                <div style={styles.empty}>No suggestions yet</div>
              ) : (
                prd.suggestions.map(suggestion => (
                  <div key={suggestion.id} style={styles.suggestion}>
                    <div style={styles.suggestionHeader}>
                      <div style={styles.suggestionAuthor}>
                        <span>👤</span>
                        <span>{suggestion.user.name}</span>
                        <span style={styles.suggestionType}>{suggestion.type}</span>
                      </div>
                      <span style={styles.suggestionDate}>
                        {new Date(suggestion.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={styles.suggestionContent}>{suggestion.content}</p>

                    {suggestion.status === 'pending' && canEdit() && (
                      <div style={styles.suggestionActions}>
                        <button
                          onClick={() => handleResolveSuggestion(suggestion.id, 'accepted')}
                          style={styles.acceptButton}
                        >
                          <Check size={16} />
                          Accept
                        </button>
                        <button
                          onClick={() => handleResolveSuggestion(suggestion.id, 'rejected')}
                          style={styles.rejectButton}
                        >
                          <X size={16} />
                          Reject
                        </button>
                      </div>
                    )}

                    {suggestion.status !== 'pending' && (
                      <div style={styles.suggestionStatus}>
                        {suggestion.status === 'accepted' ? '✓ Accepted' : '✕ Rejected'}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Versions Tab */}
        {activeTab === 'versions' && (
          <div style={styles.versionsSection}>
            <div style={styles.versionsList}>
              {versions.map(version => (
                <div key={version.id} style={styles.version}>
                  <div style={styles.versionHeader}>
                    <div>
                      <span style={styles.versionNumber}>Version {version.version}</span>
                      {version.description && (
                        <span style={styles.versionDescription}> - {version.description}</span>
                      )}
                    </div>
                    <span style={styles.versionDate}>
                      {new Date(version.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.versionAuthor}>
                    By {version.createdBy.name}
                  </div>
                  <div style={styles.versionChanges}>
                    {version.changes.length} changes
                  </div>
                  {version.version !== prd.currentVersion && (
                    <button
                      onClick={() => handleRestoreVersion(version.id)}
                      style={styles.restoreButton}
                    >
                      <History size={16} />
                      Restore this version
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div style={styles.activitySection}>
            <div style={styles.activityList}>
              {activities.length === 0 ? (
                <div style={styles.empty}>No activity yet</div>
              ) : (
                activities.map(activity => (
                  <div key={activity.id} style={styles.activityItem}>
                    <div style={styles.activityIcon}>
                      {activity.type === 'version_created' && <History size={16} />}
                      {activity.type === 'suggestion' && <MessageSquare size={16} />}
                      {activity.type === 'edit' && <Edit3 size={16} />}
                    </div>
                    <div style={styles.activityContent}>
                      <div style={styles.activityDescription}>
                        <strong>{activity.user.name}</strong> {activity.description}
                      </div>
                      <div style={styles.activityTime}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div style={styles.modal} onClick={() => setShowShareModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Share PRD</h2>
              <button onClick={() => setShowShareModal(false)} style={styles.closeButton}>
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              {shareLink ? (
                <div style={styles.shareLinkSection}>
                  <p style={styles.shareLinkLabel}>Share link (valid for 7 days):</p>
                  <div style={styles.shareLinkBox}>
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      style={styles.shareLinkInput}
                    />
                    <button onClick={handleCopyShareLink} style={styles.copyButton}>
                      <Copy size={16} />
                      Copy
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.createShareSection}>
                  <p>Create a shareable link for this PRD</p>
                  <button onClick={handleCreateShareLink} style={styles.createLinkButton}>
                    <Share2 size={18} />
                    Generate Share Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  error: {
    textAlign: 'center',
    padding: '40px',
    color: '#ef4444'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
    color: '#1a1a1a'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '8px'
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  shareButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  lockButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  unlockButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#f59e0b',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  collaboratorsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  collaboratorsList: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  collaboratorAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  },
  moreCollaborators: {
    fontSize: '14px',
    color: '#666',
    marginLeft: '4px'
  },
  realtimeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#10b981',
    fontSize: '14px',
    fontWeight: '500'
  },
  pulse: {
    animation: 'pulse 2s infinite'
  },
  lockWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#fef3c7',
    color: '#92400e',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '14px'
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e5e7eb',
    marginBottom: '24px'
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.2s'
  },
  tabActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid #3b82f6',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#3b82f6'
  },
  content: {
    minHeight: '400px'
  },
  editSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  textarea: {
    width: '100%',
    minHeight: '400px',
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    lineHeight: '1.6',
    resize: 'vertical'
  },
  textareaDisabled: {
    background: '#f8f9fa',
    cursor: 'not-allowed'
  },
  editActions: {
    display: 'flex',
    gap: '12px'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  suggestionsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  suggestionInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  suggestionTextarea: {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    alignSelf: 'flex-start'
  },
  suggestionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  suggestion: {
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  suggestionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  suggestionAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500'
  },
  suggestionType: {
    padding: '2px 8px',
    background: '#e0e7ff',
    color: '#3730a3',
    borderRadius: '4px',
    fontSize: '12px'
  },
  suggestionDate: {
    fontSize: '12px',
    color: '#666'
  },
  suggestionContent: {
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '12px'
  },
  suggestionActions: {
    display: 'flex',
    gap: '8px'
  },
  acceptButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  rejectButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  suggestionStatus: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#666'
  },
  versionsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  versionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  version: {
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  versionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  versionNumber: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1a1a1a'
  },
  versionDescription: {
    fontSize: '14px',
    color: '#666'
  },
  versionDate: {
    fontSize: '12px',
    color: '#666'
  },
  versionAuthor: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px'
  },
  versionChanges: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '12px'
  },
  restoreButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  activitySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  activityItem: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  activityIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: '#e5e7eb',
    borderRadius: '8px',
    flexShrink: 0
  },
  activityContent: {
    flex: 1
  },
  activityDescription: {
    fontSize: '14px',
    marginBottom: '4px'
  },
  activityTime: {
    fontSize: '12px',
    color: '#666'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: '#fff',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '90%',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '2px solid #e5e7eb'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
  modalBody: {
    padding: '24px'
  },
  shareLinkSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  shareLinkLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#666'
  },
  shareLinkBox: {
    display: 'flex',
    gap: '8px'
  },
  shareLinkInput: {
    flex: 1,
    padding: '10px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px'
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  createShareSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
    textAlign: 'center'
  },
  createLinkButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '16px'
  }
};

export default CollaborationHub;
