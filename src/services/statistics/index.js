import { StatisticsService } from './protos';
import { getNumberOfPlays } from './get-number-of-plays';

/**
 * The stats service implementation.
 */
const implementation = {
  recordPlaybackStarted(call, cb) {
    cb(new Error('Not implemented'));
  },

  getNumberOfPlays
}; 

/**
 * Statistics service that tracks stats for videos.
 */
export default {
  service: StatisticsService.service,
  implementation 
};