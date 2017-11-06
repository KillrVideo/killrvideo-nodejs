import { SuggestedVideoService } from './protos';
import { getRelatedVideos } from './get-related-videos';
import { getSuggestedForUser } from './get-suggested-for-user';

/**
 * The suggested video service implementation.
 */
const implementation = {
  getRelatedVideos,
  getSuggestedForUser
};

/**
 * Suggested video service that's responsible for generating video suggestions for users and videos.
 */
export default {
  name: 'SuggestedVideoService',
  service: SuggestedVideoService.service,
  implementation
};
