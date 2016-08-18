import { logger } from '../common/logging';

import comments from './comments';
import ratings from './ratings';
import search from './search';
import stats from './statistics';
import suggestedVideos from './suggested-videos';
import uploads from './uploads';
import userManagement from './user-management';
import videoCatalog from './video-catalog';

/**
 * A helper function for logging errors in Grpc service calls.
 */
function executeAndLogErrors(fn, call, cb) {
  // Call the original function with the call argument, but replace the callback
  fn(call, function logErrorsCallback(...args) {
    // Log any errors, then execute the original callback
    if (args[0]) {
      logger.log('error', '', args[0]);
    }
    cb(...args);
  });
}

/**
 * An array of all available service objects.
 */
export const services = [
  comments,
  ratings,
  search,
  stats,
  suggestedVideos,
  uploads,
  userManagement,
  videoCatalog
].map(serviceDef => {
  // Wrap each service call with error logging
  let impl = serviceDef.implementation;
  Object.keys(impl).forEach(fnName => {
    // Get the original function
    let fn = impl[fnName];

    // Wrap by partially applying the original function to our helper above
    let value = executeAndLogErrors.bind(undefined, fn);
    Object.defineProperty(impl, fnName, { value });
  });
  
  return serviceDef;
});
