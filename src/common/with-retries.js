import Promise  from 'bluebird';
import { logger } from './logging';

/**
 * Do a promise returning function with retries.
 */
export function withRetries(promiseFn, maxRetries, delaySeconds, errMsg, expBackoff, suppressError = false) {
  let retryCount = 0;

  function doIt() {
    return promiseFn().catch(err => {
      // If we've hit the max, just propagate the error
      if (retryCount >= maxRetries) {
        throw err;
      }

      // Calculate delay time in MS
      let delayMs = expBackoff === true
        ? Math.pow(delaySeconds, retryCount) * 1000
        : delaySeconds * 1000;

      // Log, delay, and try again
      retryCount++;

      logger.log('verbose', `${errMsg}. Retry ${retryCount} in ${delayMs}ms.`);
      if (! suppressError) {
        logger.log('debug', '', err);
      }

      return Promise.delay(delayMs).then(doIt);
    });
  }

  return doIt();
};
