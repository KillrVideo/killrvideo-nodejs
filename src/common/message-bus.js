import Promise from 'bluebird';
import { logger } from './logging';
import util from 'util';

/**
 * Recursively gets the fully qualified name of a probuf.js reflection value
 */
function getFullyQualifiedName(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  let name = value.name;
  const parentName = getFullyQualifiedName(value.parent);
  if (parentName !== '') {
    name = parentName + '.' + name;
  }
  return name;
}

/**
 * Map of subscribers by event fully-qualified name.
 */
const handlersByEventName = {};

/**
 * Publishes an event to the message bus and returns a Promise that is resolved
 * when the publish is complete. The event object should be a Protobuf message.
 */
export function publishAsync(event) {
  return Promise.try(() => {
    let eventName = getFullyQualifiedName(event.$type);

    // Get handlers (or empty array if none)
    let handlers = handlersByEventName[eventName] || [];

    logger.log('debug', `Publish ${eventName} to ${handlers.length} handlers`);
    logger.log('debug', util.inspect(event));

    // Invoke each handler with event
    return handlers.map(h => h(event));
  })
  .all() // Publish is complete when all handlers are done
  .return();  // Just return undefined value
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
  return Promise.try(() => {
    let eventName = getFullyQualifiedName(eventType.$type);

    // Get handlers (or empty array if none) and add handler, wrapping with Promise.method since it could be sync or async
    let handlers = handlersByEventName[eventName] || [];
    handlers.push(Promise.method(handler));

    logger.log('debug', `Subscribe ${eventName} handler ${handlers.length}`);

    // Make sure index is updated in case we created a new array    
    handlersByEventName[eventName] = handlers;
  });
};

/**
 * Subscribes the specified handler to the specified event type on the message bus and
 * invokes the callback when complete. The eventType should be a Profobuf message
 * definition.
 */
export function subscribe(eventType, handler, cb) {
  subscribeAsync(eventType, handler).asCallback(cb);
};