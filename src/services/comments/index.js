import { CommentsService } from './protos';
import { commentOnVideo } from './comment-on-video';
import { getVideoComments } from './get-video-comments';
import { getUserComments } from './get-user-comments';

/**
 * The comments service implementation.
 */
const implementation = {
  commentOnVideo,
  getUserComments,
  getVideoComments
};

/**
 * Comments service, responsible for managing comments on videos.
 */

export default {
  name: 'CommentsService',
  service: CommentsService.service,
  implementation
};
