import { load } from '../common/load';

// Load events published by this service
const eventsFile = 'uploads/uploads_events.proto';
const { 
  UploadedVideoProcessingFailed,
  UploadedVideoProcessingStarted,
  UploadedVideoProcessingSucceeded,
  UploadedVideoPublished 
} = load(eventsFile).killrvideo.uploads.events;

export { 
  UploadedVideoProcessingFailed,
  UploadedVideoProcessingStarted,
  UploadedVideoProcessingSucceeded,
  UploadedVideoPublished 
};