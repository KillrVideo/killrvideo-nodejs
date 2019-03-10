import Promise from 'bluebird';
import { Client, types as CassandraTypes } from 'cassandra-driver';
import { lookupServiceAsync } from './service-discovery';
import { withRetries } from './with-retries';
import { logger } from './logging';

/**
 * Looks up the location of the cassandra service and creates a client with the options/keyspace 
 * specified. Returns a Promise of the created client.
 */
function createClientAsync(keyspace, queryOptions) {
  return lookupServiceAsync('cassandra')
    .then(contactPoints => {
      let client = new Client({ contactPoints, keyspace, queryOptions });
      Promise.promisifyAll(client); // This creates "Async" versions of methods that return promises
      return client;
    });
}

// A singleton client instance to be reused throughout the application
let clientInstance = null;

/**
 * Gets a Cassandra client instance.
 */
export function getCassandraClient() {
  if (clientInstance === null) {
    throw new Error('No client instance found. Did you forget to call initCassandraAsync?');
  }

  return clientInstance;
};

/**
 * Initializes Cassandra by creating any keyspace and tables necessary, and making sure the
 * client can connect to the cluster. Should be called before using the getCassandraClient
 * method in this module. Returns a Promise.
 */
export function initCassandraAsync() {
  logger.log('info', 'Initializing cassandra...');

  // Create the client with some default query options
  return createClientAsync('killrvideo', {
      prepare: true,
      consistency: CassandraTypes.consistencies.localQuorum
    })
    .tap(client => {
      // Wait until Cassandra is ready and we can connect (could be delayed if starting up for 1st time)
      return withRetries(() => client.connectAsync(), 10, 10, 'Connecting to cassandra...', false, true);
    })
    .tap(client => {
      // Wait until Cassandra is bootstrapped and we can use it (dse-config needs time to initialise it)
      return withRetries(() =>  
        new Promise (
          function(resolve, reject){
            client.execute(
              'SELECT keyspace_name FROM system_schema.keyspaces WHERE keyspace_name=\'kv_init_done\';', [], [],
              function(err, result) {
                if (err || result.rowLength != 1) { 
                  reject(new Error('DB is not initialised'));
                }
                resolve();
              }
            )
          }
        ), 10, 10, 'Waiting for dse-config to bootstrap cassandra...', false, false
      );
    })
    .tap(client => {
      // Save client instance for reuse everywhere and log
      clientInstance = client;
      logger.log('info', 'Cassandra initialized')
    });
};
