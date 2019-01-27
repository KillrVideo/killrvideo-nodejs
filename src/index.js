// Import the regenerator runtime so async generators work in the transpiled code
import 'regenerator-runtime/runtime';

// Regular imports
import { createInterface } from 'readline';
import Promise from 'bluebird';
import config from './common/config';
import { initCassandraAsync } from './common/cassandra';
import { logger, setLoggingLevel } from './common/logging';
import { lookupServiceAsync } from './common/service-discovery';
import { subscribeAsync } from './common/message-bus';
import { GrpcServer } from './grpc/server';
import { services } from './services';
import { listeners } from './server-listeners';

// Allow bluebird promise cancellation
Promise.config({ cancellation: true });

/**
 * Start the application and all Grpc services.
 */
function startAsync() {
  // Initialize logging
  let loggingLevel = config.get('loggingLevel');
  setLoggingLevel(loggingLevel);
  logger.log(loggingLevel, `Logging initialized at ${loggingLevel}`);

  // Start by initializing cassandra
  return initCassandraAsync()
    // Register all service event handlers
    .then(() => {
      return services.reduce((allSubs, serviceDef) => {
        // If service has no event handlers, just continue
        if (serviceDef.hasOwnProperty('handlers') === false) {
          return allSubs;
        }

        // Subscribe and add subscription promise to allSubs
        serviceDef.handlers.forEach(handlerDef => {
          allSubs.push(subscribeAsync(handlerDef.eventType, handlerDef.handler));
        });
        return allSubs;
      }, []);
    })
    // Wait for all subscriptions to finish
    .all()  
    // Find the web UI's host and port
    .then(() => lookupServiceAsync('web'))
    // Start the Grpc server to process requests
    .then(webIpAndPorts => {
      // Create a Grpc server and register all listeners
      logger.log('info', 'Starting all Grpc services');
      
      let server = new GrpcServer(services);
      listeners.forEach(listener => listener(server));

      // Start the server and return it
      server.start();
      logger.log('info', `Open http://${webIpAndPorts[0]} in a web browser to see the UI`);
      logger.log('info', 'KillrVideo has started. Press Ctrl+C to exit.');
      return server;
    })
    .catch(err => {
      // Use console to log error since logger might write asynchronously
      console.error(err);
      process.exit(1);
    });
}

let startPromise = startAsync();

/**
 * Handle stopping everything.
 */
function stop() {
  logger.log('info', 'Attempting to shutdown');
  if (startPromise.isFulfilled()) {
    let server = startPromise.value();
    server.stopAsync().then(() => process.exit(0));
  } else {
    startPromise.cancel();
    process.exit(0);
  }
}

// Try to gracefully shutdown on SIGTERM and SIGINT
process.on('SIGTERM', stop);
process.on('SIGINT', stop);

// Graceful shutdown attempt in Windows
if (process.platform === 'win32') {
  // Simulate SIGINT on Windows (see http://stackoverflow.com/questions/10021373/what-is-the-windows-equivalent-of-process-onsigint-in-node-js)
  createInterface({
    input: process.stdin,
    output: process.stdout
  })
  .on('SIGINT', () => process.emit('SIGINT'));
}
