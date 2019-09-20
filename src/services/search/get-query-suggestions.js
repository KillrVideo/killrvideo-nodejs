import Promise from 'bluebird';
import rp from 'request-promise';
import config from '../../common/config';
import { lookupServiceAsync } from '../../common/service-discovery';
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

// Cache promise
let getSearchClientPromise = null;

function getSearchClientAsync() {
  if (getSearchClientPromise === null) {
    getSearchClientPromise = lookupServiceAsync('dse-search')
      .then(hostAndPorts => {
        // Just use the first host:port returned
        return rp.defaults({
          baseUrl: `http://${hostAndPorts[0]}/solr`
        });
      })
      .catch(err => {
        // Remove cached promise and rethrow
        getSearchClientPromise = null;
        throw err;
      });
  }
  return getSearchClientPromise;
}

/**
 * Uses the Suggester module in DSE Search to get typeahead suggestions.
 */
async function getQuerySuggestionsWithDseSearch(call) {
  let { request } = call;

  // Get HTTP client for DSE search Solr API
  let doRequest = await getSearchClientAsync();

  // Make request
  let requestOpts = {
    url: '/killrvideo.videos/suggest',
    method: 'POST',
    form: {
      'wt': 'json',
      // We'll build on every request but in a real app, we'd probably take advantage of Solr config
      // buildOnCommit or buildOnOptimize settings
      'suggest.build': 'true',  
      'suggest.q': request.query
    },
    json: true
  };
  let searchResponse = await doRequest(requestOpts);

  // Convert results to response
  return new GetQuerySuggestionsResponse({
    query: request.query,
    suggestions: searchResponse.suggest.searchSuggester[request.query].suggestions.map(s => s.term)
  });
}
