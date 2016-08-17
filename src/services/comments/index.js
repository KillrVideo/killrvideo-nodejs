import { load } from '../common/load';

// Load the protobuf definition to get the service object
const file = 'comments/comments_service.proto';
const proto = load(file);
const { service } = proto.killrvideo.comments.CommentsService;

// Load events published by this service
const eventsFile = 'comments/comments_events.proto';
const { UserCommentedOnVideo } = load(eventsFile).killrvideo.comments.events;

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
  service,
  implementation 
};