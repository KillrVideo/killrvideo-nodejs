import { load } from '../common/load';

// Load the protobuf definition to get the service object
const file = 'uploads/uploads_service.proto';
const proto = load(file);
const { service } = proto.killrvideo.uploads.UploadsService;

// Load events published by this service
const eventsFile = 'uploads/uploads_events.proto';
const { 
  UploadedVideoProcessingFailed,
  UploadedVideoProcessingStarted,
  UploadedVideoProcessingSucceeded,
  UploadedVideoPublished 
} = load(eventsFile).killrvideo.uploads.events;

/**
 * The uploads service implementation.
 */
const implementation = {
  getUploadDestination(call, cb) {
    cb(new Error('Not implemented'));
  },

  markUploadComplete(call, cb) {
    cb(new Error('Not implemented'));
  },

  getStatusOfVideo(call, cb) {
    cb(new Error('Not implemented'));
  }
}; 

/**
 * Uploads service, that handles processing/re-encoding of user uploaded videos.
 */
export default {
  service,
  implementation 
};