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

function matchServiceDef(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length === bKeys.length) {
    let index = bKeys.length;
    while (index--) {
      let bKey = bKeys[index];
      if (!a.hasOwnProperty(bKey)) {
        return false;
      }
    }
    return true;
  }
  return false;
};

export function serviceNameFromDefinition(serviceDef) {
  let index = services.length
  while (index--) {
    let service = services[index]
    if (matchServiceDef(serviceDef, service.service)) {
      return service.name;
    }
  }
  logger.log('error',`failed to find name for serviceDef with keys ${JSON.stringify(Object.keys(serviceDef))}`)
  return undefined;
}
