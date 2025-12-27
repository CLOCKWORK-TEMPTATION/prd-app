/**
 * Community Service
 * Section 11: Community Showcase Features
 *
 * Handles all community-related operations:
 * - Featured PRDs of the week
 * - Upvote system
 * - Comments & feedback
 * - "Use this as template"
 * - Viral growth + learning
 */

import {
  FeaturedPRD,
  CommunityStats,
  CommunityFilters,
  UpvoteRequest,
  CommentRequest,
  UseAsTemplateRequest,
  Comment,
  User
} from '../types/community.types';

/**
 * Mock database (replace with real backend)
 */
class CommunityDatabase {
  private prds: Map<string, FeaturedPRD> = new Map();
  private users: Map<string, User> = new Map();

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

    // Mock PRDs
    const mockPRDs: FeaturedPRD[] = [
      {
        id: 'prd-1',
        title: 'Real-time Collaboration Dashboard for Remote Teams',
        description: 'A comprehensive team dashboard with live updates, activity feeds, and integrated communication tools',
        content: '# PRD: Team Collaboration Dashboard\n\n## Overview\nBuild a real-time dashboard...',
        author: mockUsers[0],
        createdAt: new Date('2025-12-20'),
        upvotes: 45,
        upvotedBy: ['1', '2', '3'],
        viewCount: 230,
        comments: [],
        tags: ['collaboration', 'dashboard', 'real-time'],
        isPublic: true,
        isFeatured: true,
        featuredAt: new Date('2025-12-21'),
        isTemplate: true,
        usedAsTemplateCount: 12
      },
      {
        id: 'prd-2',
        title: 'AI-Powered Personal Finance Manager',
        description: 'Smart budgeting app with AI recommendations and automated savings',
        content: '# PRD: Finance Manager\n\n## Product Vision\nAutomate personal finance...',
        author: mockUsers[1],
        createdAt: new Date('2025-12-22'),
        upvotes: 38,
        upvotedBy: ['2', '3'],
        viewCount: 189,
        comments: [],
        tags: ['fintech', 'ai', 'mobile'],
        isPublic: true,
        isFeatured: true,
        featuredAt: new Date('2025-12-23'),
        isTemplate: true,
        usedAsTemplateCount: 8
      }
    ];

    mockPRDs.forEach(prd => this.prds.set(prd.id, prd));
  }

  getAllPRDs(): FeaturedPRD[] {
    return Array.from(this.prds.values());
  }

  getPRDById(id: string): FeaturedPRD | undefined {
    return this.prds.get(id);
  }

  updatePRD(id: string, updates: Partial<FeaturedPRD>): FeaturedPRD | undefined {
    const prd = this.prds.get(id);
    if (!prd) return undefined;

    const updated = { ...prd, ...updates };
    this.prds.set(id, updated);
    return updated;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }
}

const db = new CommunityDatabase();

/**
 * Community Service Class
 */
export class CommunityService {
  /**
   * Get featured PRDs of the week
   */
  static async getFeaturedPRDs(): Promise<FeaturedPRD[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prds = db.getAllPRDs().filter(prd => prd.isFeatured);
        resolve(prds);
      }, 500);
    });
  }

  /**
   * Get all public PRDs with filters
   */
  static async getPublicPRDs(filters?: CommunityFilters): Promise<FeaturedPRD[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let prds = db.getAllPRDs().filter(prd => prd.isPublic);

        // Apply filters
        if (filters) {
          // Search query
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            prds = prds.filter(prd =>
              prd.title.toLowerCase().includes(query) ||
              prd.description.toLowerCase().includes(query) ||
              prd.tags.some(tag => tag.toLowerCase().includes(query))
            );
          }

          // Tags filter
          if (filters.tags && filters.tags.length > 0) {
            prds = prds.filter(prd =>
              filters.tags!.some(tag => prd.tags.includes(tag))
            );
          }

          // Sort
          switch (filters.sortBy) {
            case 'popular':
              prds.sort((a, b) => b.upvotes - a.upvotes);
              break;
            case 'trending':
              // Trending = combination of recent upvotes and views
              prds.sort((a, b) => {
                const scoreA = a.upvotes * 2 + a.viewCount;
                const scoreB = b.upvotes * 2 + b.viewCount;
                return scoreB - scoreA;
              });
              break;
            case 'featured':
              prds = prds.filter(p => p.isFeatured);
              prds.sort((a, b) =>
                (b.featuredAt?.getTime() || 0) - (a.featuredAt?.getTime() || 0)
              );
              break;
            case 'recent':
            default:
              prds.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          }
        }

        resolve(prds);
      }, 500);
    });
  }

  /**
   * Get PRD by ID and increment view count
   */
  static async getPRDById(id: string): Promise<FeaturedPRD | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prd = db.getPRDById(id);
        if (prd) {
          // Increment view count
          db.updatePRD(id, { viewCount: prd.viewCount + 1 });
          resolve(prd);
        } else {
          resolve(null);
        }
      }, 300);
    });
  }

  /**
   * Upvote a PRD
   */
  static async upvotePRD(request: UpvoteRequest): Promise<FeaturedPRD | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prd = db.getPRDById(request.prdId);
        if (!prd) {
          resolve(null);
          return;
        }

        // Check if already upvoted
        const alreadyUpvoted = prd.upvotedBy.includes(request.userId);

        let updatedPRD: FeaturedPRD;
        if (alreadyUpvoted) {
          // Remove upvote
          updatedPRD = db.updatePRD(request.prdId, {
            upvotes: prd.upvotes - 1,
            upvotedBy: prd.upvotedBy.filter(id => id !== request.userId)
          })!;
        } else {
          // Add upvote
          updatedPRD = db.updatePRD(request.prdId, {
            upvotes: prd.upvotes + 1,
            upvotedBy: [...prd.upvotedBy, request.userId]
          })!;
        }

        resolve(updatedPRD);
      }, 300);
    });
  }

  /**
   * Add a comment to a PRD
   */
  static async addComment(request: CommentRequest): Promise<Comment | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prd = db.getPRDById(request.prdId);
        const user = db.getUserById(request.userId);

        if (!prd || !user) {
          resolve(null);
          return;
        }

        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          userId: request.userId,
          user: user,
          content: request.content,
          createdAt: new Date()
        };

        db.updatePRD(request.prdId, {
          comments: [...prd.comments, newComment]
        });

        resolve(newComment);
      }, 300);
    });
  }

  /**
   * Use a PRD as template
   */
  static async useAsTemplate(request: UseAsTemplateRequest): Promise<FeaturedPRD | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prd = db.getPRDById(request.templateId);
        if (!prd) {
          resolve(null);
          return;
        }

        // Increment template usage count
        const updated = db.updatePRD(request.templateId, {
          usedAsTemplateCount: prd.usedAsTemplateCount + 1
        });

        resolve(updated || null);
      }, 300);
    });
  }

  /**
   * Get community statistics
   */
  static async getCommunityStats(): Promise<CommunityStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prds = db.getAllPRDs();
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const stats: CommunityStats = {
          totalPRDs: prds.length,
          totalUsers: 3, // Mock
          totalUpvotes: prds.reduce((sum, prd) => sum + prd.upvotes, 0),
          totalComments: prds.reduce((sum, prd) => sum + prd.comments.length, 0),
          featuredThisWeek: prds.filter(prd =>
            prd.isFeatured && prd.featuredAt && prd.featuredAt >= weekAgo
          ).length
        };

        resolve(stats);
      }, 300);
    });
  }

  /**
   * Get trending tags
   */
  static async getTrendingTags(limit: number = 10): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prds = db.getAllPRDs();
        const tagCounts = new Map<string, number>();

        prds.forEach(prd => {
          prd.tags.forEach(tag => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        });

        const sortedTags = Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([tag]) => tag);

        resolve(sortedTags);
      }, 200);
    });
  }
}

export default CommunityService;
