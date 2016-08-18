import { logger } from '../../common/logging';
import { VideoCatalogService } from './protos';
import { getLatestVideoPreviewsAsync } from './get-latest-video-previews';

function logErrors(err) {
  logger.log('error', '', err);
  throw err;
}

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
    getLatestVideoPreviewsAsync(call).catch(logErrors).asCallback(cb);
  },

  getUserVideoPreviews(call, cb) {
    cb(new Error('Not implemented'));
  }
}; 

/**
 * Video Catalog Service, responsible for tracking the catalog of videos available for playback.
 */
export default {
  service: VideoCatalogService.service,
  implementation 
};