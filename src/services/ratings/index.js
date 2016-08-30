import { RatingsService } from './protos';
import { getRating } from './get-rating';

/**
 * The ratings service implementation.
 */
const implementation = {
  rateVideo(call, cb) {
    cb(new Error('Not implemented'));
  },

  getRating,

  getUserRating(call, cb) {
    cb(new Error('Not implemented'));
  }
}; 

/**
 * Ratings service, responsible for tracking user's rating of videos.
 */
export default {
  service: RatingsService.service,
  implementation 
};