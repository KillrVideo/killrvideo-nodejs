import Promise from 'bluebird';
import { logger } from './logging';
import util from 'util';

/**
 * Publishes an event to the message bus and returns a Promise that is resolved
 * when the publish is complete. The event object should be a Protobuf message.
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
 * complete. The event object should be a Protobuf message.
 */
export function publish(event, cb) {
  publishAsync(event).asCallback(cb);
};

/**
 * Subscribes the specified handler to the specified event type on the message bus. 
 * Returns a Promise that is resolved when subscribe is complete. The eventType
 * should be a Protobuf message definition.
 */
export function subscribeAsync(eventType, handler) {
  return Promise.resolve();
};

/**
 * Subscribes the specified handler to the specified event type on the message bus and
 * invokes the callback when complete. The eventType should be a Profobuf message
 * definition.
 */
export function subscribe(eventType, handler, cb) {
  subscribeAsync(eventType, handler).asCallback(cb);
};