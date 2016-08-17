import Promise from 'bluebird';
import Etcd from 'node-etcd';
import { logger } from './logging';

// Reuse a singleton instance of the etcd client for all operations
let etcdClient = null;

/**
 * Get the etcd client.
 */
function getEtcdClient() {
  if (etcdClient !== null) {
    return etcdClient;
  }

  if (!process.env.KILLRVIDEO_ETCD) {
    throw new Error('Could not find KILLRVIDEO_ETCD environment variable');
  }

  let client = new Etcd(`http://${process.env.KILLRVIDEO_ETCD}`);
  Promise.promisifyAll(client);
  etcdClient = client;
  return etcdClient;
}

/**
 * Looks up a service by name. Returns a Promise that resolves to an array of host:port string values.
 */
export function lookupServiceAsync(serviceName) {
  return Promise.try(getEtcdClient)
    .then(client => {
      return client.getAsync(`/killrvideo/services/${serviceName}`);
    })
    .then(response => {
      return response.node.nodes.map(node => node.value);
    })
    .tap(values => {
      logger.log('debug', `Found service ${serviceName} at ${JSON.stringify(values)}`);
    });
};

/**
 * Registers a service at the host and port specified.
 */
export function registerServiceAsync(serviceName, uniqueId, hostAndPort) {
  let key = `/killrvideo/services/${serviceName}/${uniqueId}`;
  return Promise.try(getEtcdClient)
    .then(client => {
      return client.setAsync(key, hostAndPort);
    })
    .tap(() => {
      logger.log('debug', `Registered service ${serviceName}, instance ${uniqueId} at ${hostAndPort}`);
    });
};

/**
 * Removes a service from the registry.
 */
export function removeServiceAsync(serviceName, uniqueId) {
  let key = `/killrvideo/services/${serviceName}/${uniqueId}`;
  return Promise.try(getEtcdClient)
    .then(client => {
      return client.delAsync(key);
    })
    .tap(() => {
      logger.log('debug', `Removed service ${serviceName}, instance ${uniqueId}`);
    });
};