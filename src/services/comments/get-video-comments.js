import Promise from 'bluebird';
import { toCassandraUuid, toCassandraTimeUuid, toProtobufTimestamp, toProtobufUuid } from '../common/protobuf-conversions';
import { getCassandraClient } from '../../common/cassandra';
import { GetVideoCommentsResponse, VideoComment } from './protos';

/**
 * Gets a page of the latest comments for a video.
 */
export function getVideoComments(call, cb) {
  // Use async function, convert to bluebird promise, and invoke callback when finished
  return Promise.resolve(getVideoCommentsImpl(call)).asCallback(cb);
};

// Implementation using async/await
async function getVideoCommentsImpl(call) {
  let { request } = call;

  let startingCommentId = toCassandraTimeUuid(request.startingCommentId);
  let videoId = toCassandraUuid(request.videoId);
  
  // Choose which CQL to execute based on whether we have a starting point for the list of comments
  let query, queryParams;
  if (startingCommentId === null) {
    // No starting point so just get the latest comments overall
    query = 'SELECT commentid, userid, comment, dateOf(commentid) AS comment_timestamp FROM comments_by_video WHERE videoid = ?';
    queryParams = [ videoId ];
  } else {
    // Since commentId is a TimeUuid, we can get that comment and older comments given the starting commentId by using <=
    query = 'SELECT commentid, userid, comment, dateOf(commentid) AS comment_timestamp FROM comments_by_video WHERE videoid = ? AND commentid <= ?';
    queryParams = [ videoId, startingCommentId ];
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
  return new GetVideoCommentsResponse({
    videoId: request.videoId,
    comments: resultSet.rows.map(row => new VideoComment({
      commentId: toProtobufUuid(row.commentid),
      userId: toProtobufUuid(row.userid),
      comment: row.comment,
      commentTimestamp: toProtobufTimestamp(row.comment_timestamp)
    })),
    pagingState: resultSet.pageState !== null ? resultSet.pageState : ''
  });
}

