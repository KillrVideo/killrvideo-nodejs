import Promise from 'bluebird';
import { types as CassandraTypes } from 'cassandra-driver';
import { toCassandraUuid, toCassandraTimeUuid, toProtobufTimestamp } from '../common/protobuf-conversions';
import { getCassandraClient } from '../../common/cassandra';
import { publishAsync } from '../../common/message-bus';
import { CommentOnVideoResponse } from './protos';
import { UserCommentedOnVideo } from './events';

/**
 * Records a user comment on a video.
 */
export function commentOnVideo(call, cb) {
  // Invoke async function and convert to bluebird promise, then invoke callback appropriately when complete
  return Promise.resolve(commentOnVideoImpl(call)).asCallback(cb);
};

// The actual method implementation using async/await
async function commentOnVideoImpl(call) {
  let { request } = call;

  // UTC timestamp of the comment
  let timestamp = new Date(Date.now());

  // Convert some request values to Cassandra values
  let videoId = toCassandraUuid(request.videoId);
  let userId = toCassandraUuid(request.userId);
  let commentId = toCassandraTimeUuid(request.commentId);

  // Create an array of statement to execute as a batch
  let queries = [
    {
      query: 'INSERT INTO comments_by_video (videoid, commentid, userid, comment) VALUES (?, ?, ?, ?)',
      params: [ videoId, commentId, userId, request.comment ]
    },
    {
      query: 'INSERT INTO comments_by_user (userid, commentid, videoid, comment) VALUES (?, ?, ?, ?)',
      params: [ userId, commentId, videoId, request.comment ]
    }
  ];

  // Use a client-side timestamp for the batch
  let queryOpts = { timestamp: CassandraTypes.generateTimestamp(timestamp) };

  // Execute the batch using our Promise-returning async method
  let client = getCassandraClient();
  await client.batchAsync(queries, queryOpts);

  // Tell the world about the new comment
  let event = new UserCommentedOnVideo({
    userId: request.userId,
    videoId: request.videoId,
    commentId: request.commentId,
    commentTimestamp: toProtobufTimestamp(timestamp)
  });
  await publishAsync(event);

  // Return the response
  return new CommentOnVideoResponse();
}

