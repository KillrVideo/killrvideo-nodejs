import { resolve } from 'path';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import Promise from 'bluebird';
import { Client, types as CassandraTypes } from 'cassandra-driver';
import { lookupServiceAsync } from './service-discovery';
import { withRetries } from './with-retries';
import { logger } from './logging';

// The schema.cql file is copied under the data folder as part of the build scripts (see
// the package.json file for the script command)
const SCHEMA_FILE_PATH = resolve(__dirname, '../data/schema.cql');

// The CQL to create the keyspace if it doesn't exist
const CREATE_KEYSPACE_CQL = `
  CREATE KEYSPACE IF NOT EXISTS killrvideo 
  WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 }`;

/**
 * Looks up the location of the cassandra service and creates a client with the options/keyspace 
 * specified. Returns a Promise of the created client.
 */
function createClientAsync(keyspace, queryOptions) {
  return lookupServiceAsync('cassandra')
    .then(contactPoints => {
      let client = new Client({ contactPoints, keyspace, queryOptions });
      Promise.promisifyAll(client);
      return client;
    });
}

/**
 * Reads and parses statements from the schema file and returns a Promise that resolves to the array 
 * of the statements found.
 */
function readSchemaStatementsAsync() {
  return new Promise((resolve, reject) => {
    // Use node's readline module
    let reader = createInterface({
      input: createReadStream(SCHEMA_FILE_PATH)
    });

    // Keep track of the current statement and all statements we've seen
    let currentStatement = '';
    let statements = [];

    // On each line, do some really simple parsing
    reader.on('line', line => {
      // Skip blank lines
      if (line === null || line === '') return;

      // Skip comments
      if (line.startsWith('//')) return;

      // Add line to current statement
      currentStatement += line;

      // Is this the end of the statement?
      if (line.trim().endsWith(';')) {
        statements.push(currentStatement);
        currentStatement = '';
      }
    });

    // When finished, resolve the promise with all statements
    reader.on('close', () => resolve(statements));
  });
}

// A singleton client instance to be reused throughout the application
let clientInstance = null;

/**
 * Gets a Cassandra client instance.
 */
export function getCassandraClient() {
  if (clientInstance !== null) {
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
  logger.log('info', 'Initializing cassandra');

  // Create the keyspace, then a client connected to the keyspace
  let createClient = createClientAsync()
    .tap(client => {
      // Wait until Cassandra is ready and we can connect (could be delayed if starting up for 1st time)
      return withRetries(() => client.connectAsync(), 10, 10, 'Error connecting to cassandra', false);
    })
    .then(client => {
      // Create the keyspace if it doesn't exist
      return client.executeAsync(CREATE_KEYSPACE_CQL);
    })
    .then(() => {
      // Now create the client we'll reuse everywhere connected to the keyspace
      return createClientAsync('killrvideo', {
        prepare: true,
        consistency: CassandraTypes.consistencies.localQuorum
      });
    });

  // Read the schema from the schema file
  let readSchema = readSchemaStatementsAsync();

  // Once we have keyspace, client for keyspace, and schema contents...
  return Promise.join(createClient, readSchema, (client, schemaStatements) => {
      // Save client instance for reuse everywhere
      clientInstance = client;

      // Execute the statements in order, waiting for each one to complete before doing the next one
      return Promise.mapSeries(schemaStatements, statement => client.executeAsync(statement));
    })
    .tap(() => logger.log('info', 'Cassandra initialized'));
};