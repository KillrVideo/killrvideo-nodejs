import { CommentsService } from './protos';
import { commentOnVideo } from './comment-on-video';
import { getVideoComments } from './get-video-comments';

/**
 * The comments service implementation.
 */
const implementation = {
  commentOnVideo,

  getUserComments(call, cb) {
    cb(new Error('Not implemented'));
  },

  getVideoComments
}; 

/**
 * Comments service, responsible for managing comments on videos.
 */
export default {
  service: CommentsService.service,
  implementation 
};