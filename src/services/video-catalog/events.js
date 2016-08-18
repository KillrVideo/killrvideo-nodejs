import { load } from '../common/load';

// Load events published by this service
const eventsFile = 'video-catalog/video_catalog_events.proto';
const { 
  UploadedVideoAccepted,
  UploadedVideoAdded,
  YouTubeVideoAdded 
} = load(eventsFile).killrvideo.video_catalog.events;

export {
  UploadedVideoAccepted,
  UploadedVideoAdded,
  YouTubeVideoAdded
};