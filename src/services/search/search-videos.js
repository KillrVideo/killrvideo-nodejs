import Promise from 'bluebird';
import config from '../../common/config';
import { getCassandraClient } from '../../common/cassandra';
import { NotImplementedError } from '../common/grpc-errors';
import { toProtobufTimestamp, toProtobufUuid } from '../common/protobuf-conversions';
import { SearchVideosResponse, SearchResultsVideoPreview } from './protos';

/**
 * Gets a page of video preview search results for a query.
 */
export function searchVideos(call, cb) {
  // Pick appropriate implementation
  let fn = config.get('dseEnabled') === true
    ? searchVideosWithDseSearch
    : searchVideosByTag;

  // Invoke async function, wrap with bluebird Promise, and invoke callback when finished
  return Promise.resolve(fn(call)).asCallback(cb);
};

/**
 * Searches videos by tag using just Cassandra.
 */
async function searchVideosByTag(call) {
  let { request } = call;

  // Options for the query
  let queryOpts = { autoPage: false, fetchSize: request.pageSize };
  if (request.pagingState !== null && request.pagingState !== '') {
    queryOpts.pageState = request.pagingState;
  }

  // Do the query
  let client = getCassandraClient();
  let resultSet = await client.executeAsync('SELECT * FROM videos_by_tag WHERE tag = ?', [ request.query ], queryOpts);

  // Convert the rows in the ResultSet to a response
  return new SearchVideosResponse({
    query: request.query,
    videos: resultSet.rows.map(row => new SearchResultsVideoPreview({
      videoId: toProtobufUuid(row.videoid),
      addedDate: toProtobufTimestamp(row.added_date),
      name: row.name,
      previewImageLocation: row.preview_image_location,
      userId: toProtobufUuid(row.userid)
    })),
    pagingState: resultSet.pageState !== null ? resultSet.pageState : ''
  });
}

/**
 * Searches videos using Solr indexes in DSE Search.
 */
async function searchVideosWithDseSearch(call) {
  throw new NotImplementedError('Not implemented');
}