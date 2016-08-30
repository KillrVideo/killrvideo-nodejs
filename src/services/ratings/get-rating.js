import async from 'async';
import { GetRatingResponse } from './protos';
import { toCassandraUuid } from '../common/protobuf-conversions';
import { getCassandraClient } from '../../common/cassandra';

/**
 * Gets the current ratings stats for the specified video.
 */
export function getRating(call, cb) {
  let { request } = call;
  async.waterfall([
    async.asyncify(getCassandraClient),
    (client, next) => {
      let queryParams = [ toCassandraUuid(request.videoId) ];
      client.execute('SELECT * FROM video_ratings WHERE videoid = ?', queryParams, next);
    },
    (resultSet, next) => {
      // Init to 0 in case we don't have any stats yet for the requested video
      let ratingsCount = 0;
      let ratingsTotal = 0;

      let row = resultSet.first();
      if (row !== null) {
        ratingsCount = row.rating_counter;
        ratingsTotal = row.rating_total;
      }

      next(null, new GetRatingResponse({
        videoId: request.videoId,
        ratingsCount,
        ratingsTotal
      }));
    }
  ], cb);
};