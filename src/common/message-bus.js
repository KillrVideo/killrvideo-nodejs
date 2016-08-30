import Promise from 'bluebird';
import { logger } from './logging';
import util from 'util';

/**
 * Publishes an event to the message bus and returns a Promise that is resolved
 * when the publish is complete.
 */
export function publishAsync(event) {
  // Get the Protobuf short message name
  let eventType = event.$type.name;

  logger.log('verbose', `Publish: ${eventType}`);
  logger.log('verbose', util.inspect(event));
  return Promise.resolve();
};

/**
 * Publishes an event to the message bus and invokes the specified callback when
 * complete.
 */
export function publish(event, cb) {
  publishAsync(event).asCallback(cb);
};