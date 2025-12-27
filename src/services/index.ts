/**
 * Services Index
 * Export all services for easy importing
 */

export { CommunityService } from './communityService';
export { CollaborationService } from './collaborationService';
export default {
  CommunityService: require('./communityService').CommunityService,
  CollaborationService: require('./collaborationService').CollaborationService
};
