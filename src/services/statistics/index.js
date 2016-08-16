import { load } from '../common/load';

// Load the protobuf definition to get the service object
const file = 'statistics/statistics_service.proto';
const proto = load(file);
const { service } = proto.killrvideo.statistics.StatisticsService;

/**
 * The stats service implementation.
 */
const implementation = {
  recordPlaybackStarted(call, cb) {
    cb(new Error('Not implemented'));
  },

  getNumberOfPlays(call, cb) {
    cb(new Error('Not implemented'));
  }
}; 

/**
 * Statistics service that tracks stats for videos.
 */
export default {
  service,
  implementation 
};