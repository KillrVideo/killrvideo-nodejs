import async from 'async';
import { GetUserRatingResponse } from './protos';
import { toCassandraUuid } from '../common/protobuf-conversions';
import { getCassandraClient } from '../../common/cassandra';

/**
 * Gets the rating given by a user for a specific video. Returns 0 if the user hasn't rated
 * the video yet.
 */
export function getUserRating(call, cb) {
  let { request } = call;
  async.waterfall([
    async.asyncify(getCassandraClient),
    (client, next) => {
      let queryParams = [ 
        toCassandraUuid(request.videoId),
        toCassandraUuid(request.userId) 
      ];
      client.execute('SELECT rating FROM video_ratings_by_user WHERE videoid = ? AND userid = ?', queryParams, next);
    },
    (resultSet, next) => {
      // Init to 0 in case user hasn't rated video yet
      let rating = 0;

      let row = resultSet.first();
      if (row !== null) {
        rating = row.rating;
      }

      next(null, new GetUserRatingResponse({
        videoId: request.videoId,
        userId: request.userId,
        rating
      }));
    }
  ], cb);
};