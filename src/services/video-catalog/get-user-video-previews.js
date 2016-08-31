import Promise from 'bluebird';
import { toJavaScriptDate, toCassandraUuid, toProtobufUuid, toProtobufTimestamp } from '../common/protobuf-conversions';
import { getCassandraClient } from '../../common/cassandra';
import { GetUserVideoPreviewsResponse, VideoPreview } from './protos';

/**
 * Gets a page of video previews that were authored by a particular user.
 */
export function getUserVideoPreviews(call, cb) {
  let { request } = call;
  return Promise.try(() => {
    let startingAddedDate = toJavaScriptDate(request.startingAddedDate);
    let startingVideoId = toCassandraUuid(request.startingVideoId);
    let userId = toCassandraUuid(request.userId);

    // Figure out what query to run based on whether we have starting info in the request
    let query, queryParams;
    if (startingVideoId === null) {
      // Just get the latest overall for the given user id
      query = 'SELECT * FROM user_videos WHERE userid = ?';
      queryParams = [ userId ];
    } else {
      // Get the latest starting from the point specified for the given user and going back in time
      query = 'SELECT * FROM user_videos WHERE userid = ? AND (added_date, videoid) <= (?, ?)';
      queryParams = [ userId, startingAddedDate, startingVideoId ];
    }

    // Get the number of records requested and include paging state if requested
    let queryOpts = { autoPage: false, fetchSize: request.pageSize };
    if (request.pagingState !== null && request.pagingState !== '') {
      queryOpts.pageState = request.pagingState;
    }

    // Do the query
    let client = getCassandraClient();
    return client.executeAsync(query, queryParams, queryOpts);
  })
  .then(resultSet => {
    // Convert ResultSet rows to VideoPreviews and return the response
    return new GetUserVideoPreviewsResponse({
      userId: request.userId,
      videoPreviews: resultSet.rows.map(row => new VideoPreview({
        videoId: toProtobufUuid(row.videoid),
        addedDate: toProtobufTimestamp(row.added_date),
        name: row.name,
        previewImageLocation: row.preview_image_location,
        userId: toProtobufUuid(row.userid),
      })),
      pagingState: resultSet.pageState !== null ? resultSet.pageState : ''
    })
  })
  .asCallback(cb);
};