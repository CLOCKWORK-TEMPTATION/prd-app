/**
 * Community Showcase Types
 * Section 11: Community Showcase Features
 */

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface FeaturedPRD {
  id: string;
  title: string;
  description: string;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt?: Date;

  // Engagement metrics
  upvotes: number;
  upvotedBy: string[]; // User IDs
  viewCount: number;

  // Community features
  comments: Comment[];
  tags: string[];

  // Visibility
  isPublic: boolean;
  isFeatured: boolean;
  featuredAt?: Date;

  // Template
  isTemplate: boolean;
  usedAsTemplateCount: number;
}

export interface CommunityStats {
  totalPRDs: number;
  totalUsers: number;
  totalUpvotes: number;
  totalComments: number;
  featuredThisWeek: number;
}

export interface CommunityFilters {
  sortBy: 'recent' | 'popular' | 'featured' | 'trending';
  timeRange?: 'day' | 'week' | 'month' | 'all';
  tags?: string[];
  searchQuery?: string;
}

export interface UpvoteRequest {
  prdId: string;
  userId: string;
}

export interface CommentRequest {
  prdId: string;
  userId: string;
  content: string;
}

export interface UseAsTemplateRequest {
  templateId: string;
  userId: string;
}
