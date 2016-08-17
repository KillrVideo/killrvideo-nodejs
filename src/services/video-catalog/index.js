import { load } from '../common/load';

// Load the protobuf definition to get the service object
const file = 'video-catalog/video_catalog_service.proto';
const proto = load(file);
const { service } = proto.killrvideo.video_catalog.VideoCatalogService;

// Load events published by this service
const eventsFile = 'video-catalog/video_catalog_events.proto';
const { 
  UploadedVideoAccepted,
  UploadedVideoAdded,
  YouTubeVideoAdded 
} = load(eventsFile).killrvideo.video_catalog.events;

/**
 * The video catalog service implementation.
 */
const implementation = {
  submitUploadedVideo(call, cb) {
    cb(new Error('Not implemented'));
  },

  submitYouTubeVideo(call, cb) {
    cb(new Error('Not implemented'));
  },

  getVideo(call, cb) {
    cb(new Error('Not implemented'));
  },

  getVideoPreviews(call, cb) {
    cb(new Error('Not implemented'));
  },

  getLatestVideoPreviews(call, cb) {
    cb(new Error('Not implemented'));
  },

  getUserVideoPreviews(call, cb) {
    cb(new Error('Not implemented'));
  }
}; 

/**
 * Video Catalog Service, responsible for tracking the catalog of videos available for playback.
 */
export default {
  service,
  implementation 
};