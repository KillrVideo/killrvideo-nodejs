import { load } from '../common/load';

// Load the protobuf definition to get the service and response objects
const serviceFile = 'comments/comments_service.proto';
const {
  CommentsService,
  CommentOnVideoResponse,
  GetUserCommentsResponse,
  UserComment,
  GetVideoCommentsResponse,
  VideoComment
} = load(serviceFile).killrvideo.comments;

export {
  CommentsService,
  CommentOnVideoResponse,
  GetUserCommentsResponse,
  UserComment,
  GetVideoCommentsResponse,
  VideoComment
};