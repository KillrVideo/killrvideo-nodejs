import { resolve } from 'path';
import process from 'process';
import dotenv from 'dotenv';
import Promise from 'bluebird';
import { initCassandraAsync } from './common/cassandra';
import { logger, setLoggingLevel } from './common/logging';
import { GrpcServer } from './grpc/server';
import { services } from './services';
import { listeners } from './server-listeners';

// Allow bluebird promise cancellation
Promise.config({ cancellation: true });

// Load environment variables from docker's .env file
dotenv.config({ path: resolve(__dirname, '../.env') });
process.env.KILLRVIDEO_ETCD = `${process.env.KILLRVIDEO_DOCKER_IP}:2379`;
process.env.KILLRVIDEO_IP = process.env.KILLRVIDEO_HOST_IP;
process.env.KILLRVIDEO_PORT = '50101';

/**
 * Start the application and all Grpc services.
 */
function startAsync() {
  // Initialize logging
  let loggingLevel = process.env.KILLRVIDEO_LOGGING_LEVEL || 'verbose';
  setLoggingLevel(loggingLevel);
  logger.log(loggingLevel, `Logging initialized at ${loggingLevel}`);

  // Start by initializing cassandra
  return initCassandraAsync()
    .then(() => {
      // Create a Grpc server and register all listeners
      logger.log('info', 'Starting all Grpc services');
      
      // Get IP and Port to listen on
      if (!process.env.KILLRVIDEO_IP || !process.env.KILLRVIDEO_PORT) {
        throw new Error('Must specify KILLRVIDEO_IP and KILLRVIDEO_PORT environment variables');
      }
      let ipAndPort = `${process.env.KILLRVIDEO_IP}:${process.env.KILLRVIDEO_PORT}`;
      
      let server = new GrpcServer(services, ipAndPort);
      listeners.forEach(listener => listener(server));

      // Start the server and return it
      server.start();
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