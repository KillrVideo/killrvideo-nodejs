import Promise from 'bluebird';
import { logger } from './logging';
import util from 'util';

/**
 * Publishes an event to the message bus and returns a Promise that is resolved
 * when the publish is complete.
 */
export function publishAsync(event) {
  logger.log('verbose', 'Publish:');
  logger.log('verbose', util.inspect(event));
  return Promise.resolve();
};