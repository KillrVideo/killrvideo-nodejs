import async from 'async';
import { RateVideoResponse } from './protos';
import { UserRatedVideo } from './events';
import { toCassandraUuid, toProtobufTimestamp } from '../common/protobuf-conversions';
import { getCassandraClient } from '../../common/cassandra';
import { publish } from '../../common/message-bus';

// Update the video_ratings counter table
const updateRatingsCql = `
UPDATE video_ratings 
SET rating_counter = rating_counter + 1, rating_total = rating_total + ? 
WHERE videoid = ?`;

// Insert rating for a user and specific video
const insertUserRatingCql = `
INSERT INTO video_ratings_by_user (
  videoid, userid, rating) 
VALUES (?, ?, ?)`;

/**
 * Adds a user's rating of a video.
 */
export function rateVideo(call, cb) {
  let { request } = call;
  async.waterfall([
    // Get client
    async.asyncify(getCassandraClient),

    // Execute CQL
    (client, next) => {
      // Get some bind variable values for the CQL we're going to run
      let videoId = toCassandraUuid(request.videoId);
      let userId = toCassandraUuid(request.userId);
      let { rating } = request;

      // We can't use a batch to do inserts to multiple tables here because one the video_ratings table
      // is a counter table (and Cassandra doesn't let us mix counter DML with regular DML in a batch), 
      // but we can execute the inserts in parallel
      async.parallel([
        execCb => client.execute(updateRatingsCql, [ rating, videoId ], execCb),
        execCb => client.execute(insertUserRatingCql, [ videoId, userId, rating ], execCb)
      ], next);
    },

    // If successful with inserts, publish an event
    (resultSets, next) => {
      // Tell the world about the user rating the video
      let event = new UserRatedVideo({
        videoId: request.videoId,
        userId: request.userId,
        rating: request.rating,
        ratingTimestamp: toProtobufTimestamp(new Date(Date.now()))
      });

      publish(event, next);
    },

    // Finally, return a response object
    next => {
      next(null, new RateVideoResponse());
    }
  ], cb);
};