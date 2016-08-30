import { load } from '../common/load';

// Load events published by this service
const eventsFile = 'ratings/ratings_events.proto';
const { 
  UserRatedVideo 
} = load(eventsFile).killrvideo.ratings.events;

export { 
  UserRatedVideo 
};