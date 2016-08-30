import { CommentsService } from './protos';
import { commentOnVideo } from './comment-on-video';

/**
 * The comments service implementation.
 */
const implementation = {
  commentOnVideo,

  getUserComments(call, cb) {
    cb(new Error('Not implemented'));
  },

  getVideoComments(call, cb) {
    cb(new Error('Not implemented'));
  }
}; 

/**
 * Comments service, responsible for managing comments on videos.
 */
export default {
  service: CommentsService.service,
  implementation 
};