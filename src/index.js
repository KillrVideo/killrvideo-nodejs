// Import the regenerator runtime so async generators work in the transpiled code
import 'regenerator-runtime/runtime';

// Regular imports
import process from 'process';
import Promise from 'bluebird';
import config from './common/config';
import { initCassandraAsync } from './common/cassandra';
import { logger, setLoggingLevel } from './common/logging';
import { lookupServiceAsync } from './common/service-discovery';
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
    .then(() => lookupServiceAsync('web'))
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

// Listen for Ctrl+C to exit
let stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');
stdin.on('data', key => {
  if (key === '\u0003') {
    stop();
  }
});