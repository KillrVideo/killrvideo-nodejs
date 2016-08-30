import async from 'async';
import { RecordPlaybackStartedResponse } from './protos';
import { toCassandraUuid } from '../common/protobuf-conversions';
import { getCassandraClient } from '../../common/cassandra';

/**
 * Records that playback was started for a given video.
 */
export function recordPlaybackStarted(call, cb) {
  let { request } = call;
  async.waterfall([
    // Get the cassandra client
    async.asyncify(getCassandraClient),

    // Update the playback stats
    (client, next) => {
      let videoId = toCassandraUuid(request.videoId);
      client.execute('UPDATE video_playback_stats SET views = views + 1 WHERE videoid = ?', [ videoId ], next);
    },

    // Return the response
    (resultSet, next) => {
      next(null, new RecordPlaybackStartedResponse());
    }
  ], cb);
};