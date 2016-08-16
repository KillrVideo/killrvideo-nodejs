import { load } from 'grpc';

const service = '';

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