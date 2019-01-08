import { logger } from './logging';
import config from './config';

let registry = {
  'dse-search': 'dse:8983',
  'web': 'web:3000',
  'cassandra': 'dse:9042'
};

/**
 * Looks up a service by name. Returns host:port string value.
 */
export function lookupService(serviceName) {
  logger.log('debug', `Found service ${serviceName} at ${registry[serviceName]}`);
  return registry[serviceName];
};

/**
 * Registers a service at the host and port specified.
 */
export function registerService(serviceName, hostAndPort) {
  registry[serviceName] = hostAndPort;
  logger.log('debug', `Registered service ${serviceName} at ${hostAndPort}`);
};

/**
 * Removes a service from the registry.
 */
export function removeService(serviceName) {
  delete registry[serviceName];
  logger.log('debug', `Removed service ${serviceName}`);
};