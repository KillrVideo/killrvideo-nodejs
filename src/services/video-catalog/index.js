import { VideoCatalogService } from './protos';
import { getLatestVideoPreviews } from './get-latest-video-previews';
import { getVideo } from './get-video';
import { submitYouTubeVideo } from './submit-youtube-video';
import { getVideoPreviews } from './get-video-previews';
import { getUserVideoPreviews } from './get-user-video-previews';
import { submitUploadedVideo } from './submit-uploaded-video';

/**
 * The video catalog service implementation.
 */
const implementation = {
  submitUploadedVideo,
  submitYouTubeVideo,
  getVideo,
  getVideoPreviews,
  getLatestVideoPreviews,
  getUserVideoPreviews
};

/**
 * Video Catalog Service, responsible for tracking the catalog of videos available for playback.
 */
export default {
  name: 'VideoCatalogService',
  service: VideoCatalogService.service,
  implementation
};
