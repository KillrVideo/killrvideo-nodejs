import Promise from 'bluebird';
import moment from 'moment';
import { GetLatestVideoPreviewsResponse, VideoPreview } from './protos';
import { LATEST_VIDEOS_MAX_DAYS } from './constants';
import { toCassandraUuid, toJavaScriptDate, toProtobufTimestamp, toProtobufUuid } from '../common/protobuf-conversions';
import { getCassandraClient } from '../../common/cassandra';



/**
 * Helper function for creating latest videos paging state tokens.
 */
function createPagingState(buckets, bucketIndex, rowsPagingState) {
  // Are there more rows in the current bucket?
  if (rowsPagingState !== null) {
    return `${buckets.join('')}${bucketIndex}${rowsPagingState}`;
  }

  // Do we still have buckets left?
  if (bucketIndex !== buckets.length - 1) {
    return `${buckets.join('')}${bucketIndex + 1}`;
  }

  // No more data available
  return '';
}

/**
 * Helper function for parsing latest videos paging state tokens.
 */
function parsePagingState(pagingState) {
  let buckets, bucketIndex, rowsPagingState;

  // If not empty, parse the parts
  if (pagingState !== '') {
    // The paging state will be yyyyMMdd buckets 8 times, followed by 1 bucket index int, 
    // followed by the row paging state string
    let match = /([0-9]{8}){8}([0-9]{1})(.*)/.exec(pagingState);
    if (match === null) 
      throw new Error('Bad paging state');

    throw new Error('TODO: Not implemented');
  }

  // Generate initial values since no paging state was provided
  buckets = [];
  bucketIndex = 0;
  rowsPagingState = null;

  // For each day in the past that we want to search, generate a YYYYMMDD string
  let now = moment.utc();
  for (let i = 0; i <= LATEST_VIDEOS_MAX_DAYS; i++) {
    let b = now.clone().subtract(i, 'days').format('YYYYMMDD');
    buckets.push(b);
  }

  return { buckets, bucketIndex, rowsPagingState };
}

/**
 * Helper function to map a Cassandra row to a protobuf VideoPreview.
 */
function mapRowToVideoPreview(row) {
  return new VideoPreview({
    videoId: toProtobufUuid(row.videoid),
    addedDate: toProtobufTimestamp(row.added_date),
    name: row.name,
    previewImageLocation: row.preview_image_location,
    userId: toProtobufUuid(row.userid)
  });
}

/**
 * Gets the latest video previews.
 */
export function getLatestVideoPreviews(call, cb) {
  return Promise.try(() => {
    let { request } = call;
    let results = [];

    // Get or initialize the parts of our paging state
    let { buckets, bucketIndex, rowsPagingState } = parsePagingState(request.pagingState);
    let startingAddedDate = toJavaScriptDate(request.startingAddedDate);
    let startingVideoId = toCassandraUuid(request.startingVideoId);

    // Sanity check (if we're on last bucket and have no paging state for that bucket, nothing to do)
    if (bucketIndex === buckets.length - 1 && rowsPagingState === null) {
      return [ results, '' ]; // Empty results, empty paging state
    }

    // Run different select statements depending on whether we have a starting point in the list
    let hasStartingPoint = startingAddedDate !== null && startingVideoId !== null; 
    let cql = hasStartingPoint
      ? 'SELECT * FROM latest_videos WHERE yyyymmdd = ? AND (added_date, videoid) <= (?, ?)'
      : 'SELECT * FROM latest_videos WHERE yyyymmdd = ?';

    // Define a function for running a query
    function runQuery() {
      let recordsStillNeeded = request.pageSize - results.length;

      // Get parameter values for the query
      let bucket = buckets[bucketIndex];
      let cqlParams = hasStartingPoint
        ? [ bucket, startingAddedDate, startingVideoId ]
        : [ bucket ];

      // Set options for the query
      let queryOpts = { autoPage: false, fetchSize: recordsStillNeeded };
      if (rowsPagingState !== null)
        queryOpts.pageState = rowsPagingState;

      // Run the query using the promisified client method
      let client = getCassandraClient();
      return client.executeAsync(cql, cqlParams, queryOpts);
    };

    // Define a function for collecting the results from the query
    function collectResults(resultSet) {
      // Add all rows to results
      resultSet.rows.forEach(row => results.push(row));

      // Do we have enough rows?
      if (results.length === request.pageSize) {
        return [ results, createPagingState(buckets, bucketIndex, resultSet.pageState) ];
      }

      // Are we out of buckets?
      if (bucketIndex === buckets.length - 1) {
        return [ results, '' ];
      }

      // Keep querying next bucket
      bucketIndex++;
      rowsPagingState = null;
      return runQuery().then(collectResults);
    }

    // Kick off querying
    return runQuery().then(collectResults);
  })
  .then(([ results, pagingState ]) => {
    // Create the Grpc response from the rows and paging state
    return new GetLatestVideoPreviewsResponse({
      videoPreviews: results.map(mapRowToVideoPreview),
      pagingState
    });
  })
  .asCallback(cb);
};