import Promise from 'bluebird';
import { getCassandraClient } from '../../common/cassandra';
import config from '../../common/config';
import { NotImplementedError } from '../common/grpc-errors';
import { GetSuggestedForUserResponse, SuggestedVideoPreview } from './protos';

/**
 * Gets personalized video suggestions for a specific user.
 */
export function getSuggestedForUser(call, cb) {
  // Pick appropriate implementation
  let fn = config.get('dseEnabled') === true
    ? getSuggestedWithDseAnalytics
    : emptySuggestions;

  // Invoke async function, wrap with bluebird Promise, and invoke callback when finished
  return Promise.resolve(fn(call)).asCallback(cb);
};

/**
 * When not using DSE, we don't have a way to do personalized suggestions so just return an
 * empty response.
 */
function emptySuggestions(call) {
  let { request } = call;
  return new GetSuggestedForUserResponse({
    userId: request.userId,
    videos: [],
    pagingState: ''
  });
}

/**
 * Use DSE analytics to get personalized suggestions for a user.
 */
async function getSuggestedWithDseAnalytics(call) {
  // TODO: Since the Spark job that populates this data is not currently running,
  // just return an empty response
  return emptySuggestions(call);
}