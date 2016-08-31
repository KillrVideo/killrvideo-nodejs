import { SuggestedVideoService } from './protos';
import { getRelatedVideos } from './get-related-videos';

/**
 * The suggested video service implementation.
 */
const implementation = {
  getRelatedVideos,
  
  getSuggestedForUser(call, cb) {
    cb(new Error('Not implemented'));
  }
}; 

/**
 * Suggested video service that's responsible for generating video suggestions for users and videos.
 */
export default {
  service: SuggestedVideoService.service,
  implementation 
};