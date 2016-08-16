import { resolve } from 'path';
import dotenv from 'dotenv';
import { initCassandraAsync } from './common/cassandra';
import { createServer } from './grpc/server';

// Load environment variables from docker's .env file
dotenv.config({ path: resolve(__dirname, '../.env') });
process.env.KILLRVIDEO_ETCD = `${process.env.KILLRVIDEO_DOCKER_IP}:2379`;

initCassandraAsync()
  .then(() => {
    // Start the Grpc server
    let server = createServer();
    server.start();
  });

