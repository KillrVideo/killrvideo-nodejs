import { RatingsService } from './protos';
import { getRating } from './get-rating';
import { getUserRating } from './get-user-rating';
import { rateVideo } from './rate-video';

/**
 * The ratings service implementation.
 */
const implementation = {
  rateVideo,
  getRating,
  getUserRating
};

/**
 * Ratings service, responsible for tracking user's rating of videos.
 */
export default {
  name: 'RatingsService',
  service: RatingsService.service,
  implementation
};
