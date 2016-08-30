import Promise from 'bluebird';
import { toCassandraUuid, toCassandraTimeUuid, toProtobufTimestamp, toProtobufUuid } from '../common/protobuf-conversions';
import { getCassandraClient } from '../../common/cassandra';
import { GetUserCommentsResponse, UserComment } from './protos';

/**
 * Gets a page of the latest comments for a user.
 */
export function getUserComments(call, cb) {
  // Use async function, convert to bluebird promise, and invoke callback when finished
  return Promise.resolve(getUserCommentsImpl(call)).asCallback(cb);
};

// Actual implementation using async/await
async function getUserCommentsImpl(call) {
  let { request } = call;

  let startingCommentId = toCassandraTimeUuid(request.startingCommentId);
  let userId = toCassandraUuid(request.userId);
  
  // Choose which CQL to execute based on whether we have a starting point for the list of comments
  let query, queryParams;
  if (startingCommentId === null) {
    // No starting point so just get the latest comments overall
    query = 'SELECT commentid, videoid, comment, dateOf(commentid) AS comment_timestamp FROM comments_by_user WHERE userid = ?';
    queryParams = [ userId ];
  } else {
    // Since commentId is a TimeUuid, we can get that comment and older comments given the starting commentId by using <=
    query = 'SELECT commentid, videoid, comment, dateOf(commentid) AS comment_timestamp FROM comments_by_user WHERE userid = ? AND commentid <= ?';
    queryParams = [ userId, startingCommentId ];
  }

  // Set the options for the query, including paging state from previous page if provided in the request
  let queryOpts = { autoPage: false, fetchSize: request.pageSize };
  if (request.pagingState !== null && request.pagingState !== '') {
    queryOpts.pageState = request.pagingState;
  }

  // Execute the query using our Promise returning async method
  let client = getCassandraClient();
  let resultSet = await client.executeAsync(query, queryParams, queryOpts);

  // Build the response object from the rows returned
  return new GetUserCommentsResponse({
    userId: request.userId,
    comments: resultSet.rows.map(row => new UserComment({
      commentId: toProtobufUuid(row.commentid),
      videoId: toProtobufUuid(row.videoid),
      comment: row.comment,
      commentTimestamp: toProtobufTimestamp(row.comment_timestamp)
    })),
    pagingState: resultSet.pageState !== null ? resultSet.pageState : ''
  });
}