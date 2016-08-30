import { CommentsService } from './protos';

/**
 * The comments service implementation.
 */
const implementation = {
  commentOnVideo(call, cb) {
    cb(new Error('Not implemented'));
  },

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