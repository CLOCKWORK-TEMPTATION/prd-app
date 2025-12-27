/**
 * Community Showcase Component
 * Section 11: Community Showcase Features
 *
 * Features:
 * - Featured PRDs of the week
 * - Upvote system
 * - Comments & feedback
 * - "Use this as template"
 * - Viral growth + learning
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ThumbsUp,
  MessageCircle,
  Eye,
  Copy,
  Star,
  Search,
  Filter,
  Clock,
  Award,
  Users
} from 'lucide-react';
import CommunityService from '../services/communityService';
import {
  FeaturedPRD,
  CommunityStats,
  CommunityFilters
} from '../types/community.types';

interface CommunityShowcaseProps {
  currentUserId?: string;
  onUseTemplate?: (prdId: string) => void;
}

export const CommunityShowcase: React.FC<CommunityShowcaseProps> = ({
  currentUserId = '1',
  onUseTemplate
}) => {
  const [prds, setPrds] = useState<FeaturedPRD[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPRD, setSelectedPRD] = useState<FeaturedPRD | null>(null);
  const [filters, setFilters] = useState<CommunityFilters>({
    sortBy: 'featured',
    searchQuery: ''
  });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prdsData, statsData, tagsData] = await Promise.all([
        CommunityService.getPublicPRDs(filters),
        CommunityService.getCommunityStats(),
        CommunityService.getTrendingTags()
      ]);

      setPrds(prdsData);
      setStats(statsData);
      setTrendingTags(tagsData);
    } catch (error) {
      console.error('Failed to load community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (prdId: string) => {
    try {
      const updated = await CommunityService.upvotePRD({
        prdId,
        userId: currentUserId
      });

      if (updated) {
        setPrds(prds.map(p => p.id === prdId ? updated : p));
        if (selectedPRD?.id === prdId) {
          setSelectedPRD(updated);
        }
      }
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };

  const handleAddComment = async (prdId: string) => {
    if (!newComment.trim()) return;

    try {
      const comment = await CommunityService.addComment({
        prdId,
        userId: currentUserId,
        content: newComment
      });

      if (comment && selectedPRD) {
        const updatedPRD = {
          ...selectedPRD,
          comments: [...selectedPRD.comments, comment]
        };
        setSelectedPRD(updatedPRD);
        setPrds(prds.map(p => p.id === prdId ? updatedPRD : p));
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleUseAsTemplate = async (prdId: string) => {
    try {
      await CommunityService.useAsTemplate({
        templateId: prdId,
        userId: currentUserId
      });

      if (onUseTemplate) {
        onUseTemplate(prdId);
      }

      // Show success message
      alert('Template copied! You can now customize it.');
    } catch (error) {
      console.error('Failed to use template:', error);
    }
  };

  const isUpvoted = (prd: FeaturedPRD) => {
    return prd.upvotedBy.includes(currentUserId);
  };

  return (
    <div className="community-showcase" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Award size={32} style={styles.titleIcon} />
            Community Showcase
          </h1>
          <p style={styles.subtitle}>
            Discover and learn from the best PRDs created by our community
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <Users size={20} />
            <div>
              <div style={styles.statValue}>{stats.totalPRDs}</div>
              <div style={styles.statLabel}>Public PRDs</div>
            </div>
          </div>
          <div style={styles.statItem}>
            <ThumbsUp size={20} />
            <div>
              <div style={styles.statValue}>{stats.totalUpvotes}</div>
              <div style={styles.statLabel}>Total Upvotes</div>
            </div>
          </div>
          <div style={styles.statItem}>
            <MessageCircle size={20} />
            <div>
              <div style={styles.statValue}>{stats.totalComments}</div>
              <div style={styles.statLabel}>Comments</div>
            </div>
          </div>
          <div style={styles.statItem}>
            <Star size={20} />
            <div>
              <div style={styles.statValue}>{stats.featuredThisWeek}</div>
              <div style={styles.statLabel}>Featured This Week</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search PRDs..."
            value={filters.searchQuery || ''}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.sortButtons}>
          <button
            onClick={() => setFilters({ ...filters, sortBy: 'featured' })}
            style={{
              ...styles.sortButton,
              ...(filters.sortBy === 'featured' ? styles.sortButtonActive : {})
            }}
          >
            <Star size={16} /> Featured
          </button>
          <button
            onClick={() => setFilters({ ...filters, sortBy: 'trending' })}
            style={{
              ...styles.sortButton,
              ...(filters.sortBy === 'trending' ? styles.sortButtonActive : {})
            }}
          >
            <TrendingUp size={16} /> Trending
          </button>
          <button
            onClick={() => setFilters({ ...filters, sortBy: 'popular' })}
            style={{
              ...styles.sortButton,
              ...(filters.sortBy === 'popular' ? styles.sortButtonActive : {})
            }}
          >
            <ThumbsUp size={16} /> Popular
          </button>
          <button
            onClick={() => setFilters({ ...filters, sortBy: 'recent' })}
            style={{
              ...styles.sortButton,
              ...(filters.sortBy === 'recent' ? styles.sortButtonActive : {})
            }}
          >
            <Clock size={16} /> Recent
          </button>
        </div>
      </div>

      {/* Trending Tags */}
      {trendingTags.length > 0 && (
        <div style={styles.tagsSection}>
          <span style={styles.tagsLabel}>Trending:</span>
          {trendingTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilters({ ...filters, tags: [tag] })}
              style={styles.tag}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* PRD Grid */}
      <div style={styles.grid}>
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : prds.length === 0 ? (
          <div style={styles.empty}>No PRDs found</div>
        ) : (
          prds.map(prd => (
            <div
              key={prd.id}
              style={styles.card}
              onClick={() => setSelectedPRD(prd)}
            >
              {prd.isFeatured && (
                <div style={styles.featuredBadge}>
                  <Star size={14} /> Featured
                </div>
              )}

              <h3 style={styles.cardTitle}>{prd.title}</h3>
              <p style={styles.cardDescription}>{prd.description}</p>

              <div style={styles.cardAuthor}>
                <span style={styles.avatar}>{prd.author.avatar || '👤'}</span>
                <span>{prd.author.name}</span>
              </div>

              <div style={styles.cardTags}>
                {prd.tags.map(tag => (
                  <span key={tag} style={styles.cardTag}>#{tag}</span>
                ))}
              </div>

              <div style={styles.cardFooter}>
                <div style={styles.cardStats}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpvote(prd.id);
                    }}
                    style={{
                      ...styles.statButton,
                      ...(isUpvoted(prd) ? styles.statButtonActive : {})
                    }}
                  >
                    <ThumbsUp size={16} />
                    {prd.upvotes}
                  </button>
                  <span style={styles.stat}>
                    <MessageCircle size={16} />
                    {prd.comments.length}
                  </span>
                  <span style={styles.stat}>
                    <Eye size={16} />
                    {prd.viewCount}
                  </span>
                </div>

                {prd.isTemplate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseAsTemplate(prd.id);
                    }}
                    style={styles.templateButton}
                  >
                    <Copy size={14} /> Use Template
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* PRD Detail Modal */}
      {selectedPRD && (
        <div style={styles.modal} onClick={() => setSelectedPRD(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>{selectedPRD.title}</h2>
              <button
                onClick={() => setSelectedPRD(null)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.prdContent}>
                <pre style={styles.prdContentPre}>{selectedPRD.content}</pre>
              </div>

              <div style={styles.commentsSection}>
                <h3 style={styles.commentsTitle}>
                  <MessageCircle size={20} />
                  Comments ({selectedPRD.comments.length})
                </h3>

                <div style={styles.commentInput}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    style={styles.commentTextarea}
                  />
                  <button
                    onClick={() => handleAddComment(selectedPRD.id)}
                    style={styles.commentButton}
                  >
                    Post Comment
                  </button>
                </div>

                <div style={styles.commentsList}>
                  {selectedPRD.comments.map(comment => (
                    <div key={comment.id} style={styles.comment}>
                      <div style={styles.commentHeader}>
                        <span style={styles.avatar}>{comment.user.avatar || '👤'}</span>
                        <span style={styles.commentAuthor}>{comment.user.name}</span>
                        <span style={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={styles.commentContent}>{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
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
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: 0,
    color: '#1a1a1a'
  },
  titleIcon: {
    color: '#f59e0b'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginTop: '8px'
  },
  statsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '12px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666'
  },
  filterBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: '#fff',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    minWidth: '250px'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px'
  },
  sortButtons: {
    display: 'flex',
    gap: '8px'
  },
  sortButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    background: '#fff',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  sortButtonActive: {
    background: '#3b82f6',
    color: '#fff',
    borderColor: '#3b82f6'
  },
  tagsSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  tagsLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#666'
  },
  tag: {
    padding: '6px 12px',
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  card: {
    padding: '20px',
    background: '#fff',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative'
  },
  featuredBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '4px 8px',
    background: '#fef3c7',
    color: '#f59e0b',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#1a1a1a'
  },
  cardDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  cardAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    fontSize: '14px',
    color: '#666'
  },
  avatar: {
    fontSize: '18px'
  },
  cardTags: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '16px'
  },
  cardTag: {
    padding: '4px 8px',
    background: '#f3f4f6',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#666'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb'
  },
  cardStats: {
    display: 'flex',
    gap: '12px'
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    color: '#666'
  },
  statButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#666',
    transition: 'all 0.2s'
  },
  statButtonActive: {
    background: '#3b82f6',
    color: '#fff',
    borderColor: '#3b82f6'
  },
  templateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  loading: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  empty: {
    gridColumn: '1 / -1',
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
    maxWidth: '900px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
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
    padding: '24px',
    overflow: 'auto'
  },
  prdContent: {
    marginBottom: '32px'
  },
  prdContentPre: {
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
    fontSize: '14px',
    lineHeight: '1.6',
    background: '#f8f9fa',
    padding: '16px',
    borderRadius: '8px'
  },
  commentsSection: {
    borderTop: '2px solid #e5e7eb',
    paddingTop: '24px'
  },
  commentsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  commentInput: {
    marginBottom: '24px'
  },
  commentTextarea: {
    width: '100%',
    minHeight: '80px',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: '8px'
  },
  commentButton: {
    padding: '10px 20px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  comment: {
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  commentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  commentAuthor: {
    fontWeight: '600',
    fontSize: '14px'
  },
  commentDate: {
    fontSize: '12px',
    color: '#666',
    marginLeft: 'auto'
  },
  commentContent: {
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0
  }
};

export default CommunityShowcase;
