import { resolve } from 'path';
import dotenv from 'dotenv';
import { initCassandraAsync } from './common/cassandra';
import { logger, setLoggingLevel } from './common/logging';
import { createServer } from './grpc/server';

// Load environment variables from docker's .env file
dotenv.config({ path: resolve(__dirname, '../.env') });
process.env.KILLRVIDEO_ETCD = `${process.env.KILLRVIDEO_DOCKER_IP}:2379`;

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
      // Start the Grpc server
      let server = createServer();
      server.start();
    })
    .catch(err => {
      // Use console to log error since logger might write asynchronously
      console.error(err);
      process.exit(1);
    });
}

let startPromise = startAsync();





