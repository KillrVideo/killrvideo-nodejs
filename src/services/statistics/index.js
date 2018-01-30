import { StatisticsService } from './protos';
import { getNumberOfPlays } from './get-number-of-plays';
import { recordPlaybackStarted } from './record-playback-started';

/**
 * The stats service implementation.
 */
const implementation = {
  recordPlaybackStarted,
  getNumberOfPlays
};

/**
 * Statistics service that tracks stats for videos.
 */
export default {
  name: 'StatisticsService',
  service: StatisticsService.service,
  implementation
};
