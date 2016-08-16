import { resolve } from 'path';
import Promise from 'bluebird';
import { Client, types as CassandraTypes } from 'cassandra-driver';

// The schema.cql file is copied under the data folder as part of the build scripts (see
// the package.json file for the script command)
const SCHEMA_FILE_PATH = resolve(__dirname, '../data/schema.cql');

function createKeyspaceAsync() {
  
}

function createSchemaAsync() {

}

// A singleton client instance to be reused throughout the application
let clientInstance = null;

/**
 * Gets a Cassandra client instance. Assumes you have called initCassandraAsync (from this
 * module) previously to initialize Cassandra.
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
};