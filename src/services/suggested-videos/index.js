import { load } from '../common/load';

// Load the protobuf definition to get the service object
const file = 'suggested-videos/suggested_videos_service.proto';
const proto = load(file);
const { service } = proto.killrvideo.suggested_videos.SuggestedVideoService;

/**
 * The suggested video service implementation.
 */
const implementation = {
  getRelatedVideos(call, cb) {
    cb(new Error('Not implemented'));
  },

  getSuggestedForUser(call, cb) {
    cb(new Error('Not implemented'));
  }
}; 

/**
 * Suggested video service that's responsible for generating video suggestions for users and videos.
 */
export default {
  service,
  implementation 
};