import { load } from '../common/load';

// Load events published by this service
const eventsFile = 'comments/comments_events.proto';
const { 
  UserCommentedOnVideo 
} = load(eventsFile).killrvideo.comments.events;

export { 
  UserCommentedOnVideo 
};