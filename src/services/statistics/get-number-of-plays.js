import async from 'async';
import { GetNumberOfPlaysResponse, PlayStats } from './protos';
import { InvalidArgumentError } from '../common/grpc-errors';
import { toCassandraUuid } from '../common/protobuf-conversions';
import { getCassandraClient } from '../../common/cassandra';

/**
 * Get the number of times the requested videos have been played.
 */
export function getNumberOfPlays(call, cb) {
  let { request } = call;

  // Enforce some sanity on this method to avoid doing a big multi-get
  if (request.videoIds.length > 20) {
    cb(new InvalidArgumentError('Cannot do a get on more than 20 videos at once'));
    return;
  }

  // Get the cassandra-driver client and map protobuf uuids to cassandra uuids
  let client, videoIds;
  try {
    client = getCassandraClient();
    videoIds = request.videoIds.map(id => toCassandraUuid(id));
  } catch (err) {
    cb(err);
    return;
  }

  // Run parallel queries on each video Id using the async library's map function
  async.map(videoIds, (videoId, done) => {
    client.execute('SELECT views FROM video_playback_stats WHERE videoid = ?', [ videoId ], done);
  },
  (err, resultSets) => {
    if (err) {
      cb(err);
      return;
    }

    // For each ResultSet, get the row returned and add to response
    let stats = [];
    for (let i = 0; i < resultSets.length; i++) {
      let row = resultSets[i].first();
      stats.push(new PlayStats({
        videoId: request.videoIds[i],

        // Return 0 if there was no row returned from cassandra, otherwise the views
        views: row === null ? 0 : row.views
      }));
    }

    cb(null, new GetNumberOfPlaysResponse({ stats }));
  });
};