import Promise from 'bluebird';
import config from '../../common/config';
import { getCassandraClient } from '../../common/cassandra';
import { NotImplementedError } from '../common/grpc-errors';
import { GetQuerySuggestionsResponse } from './protos';

/**
 * Gets a list of query suggestions for providing typeahead support.
 */
export function getQuerySuggestions(call, cb) {
  // Pick appropriate implementation
  let fn = config.get('dseEnabled') === true
    ? getQuerySuggestionsWithDseSearch
    : getTagSuggestions;

  // Invoke async function, wrap with bluebird Promise, and invoke callback when finished
  return Promise.resolve(fn(call)).asCallback(cb);
};

/**
 * Gets suggested tags based on current input using just Cassandra.
 */
async function getTagSuggestions(call) {
  let { request } = call;

  let firstLetter = request.query.substr(0, 1);

  // Do query that gets tags starting with the first letter of the query
  let client = getCassandraClient();
  let queryParams = [ firstLetter, request.query, request.pageSize ];
  let resultSet = await client.executeAsync('SELECT tag FROM tags_by_letter WHERE first_letter = ? AND tag >= ? LIMIT ?', queryParams);

  // Convert results to response
  return new GetQuerySuggestionsResponse({
    query: request.query,
    suggestions: resultSet.rows.map(row => row.tag)
  });
}

/**
 * Uses the spellcheck module in DSE Search to get typeahead suggestions.
 */
async function getQuerySuggestionsWithDseSearch(call) {
  throw new NotImplementedError('Not implemented');
}

