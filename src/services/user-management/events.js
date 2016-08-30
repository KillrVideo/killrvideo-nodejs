import { load } from '../common/load';

// Load events published by this service
const eventsFile = 'user-management/user_management_events.proto';
const { 
  UserCreated 
} = load(eventsFile).killrvideo.user_management.events;

export {
  UserCreated
};