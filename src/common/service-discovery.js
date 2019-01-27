import { logger } from './logging';
import Promise from 'bluebird';
import { ExtendableError } from './extendable-error';
import config from './config';

let registry = config.get('services');

/**
 * Error thrown when a service can't be found
 */
export class ServiceNotFoundError extends ExtendableError {
  constructor(serviceName) {
    super(`Could not find service ${serviceName}`);
  }
};

/**
 * Looks up a service with a given name. Returns a Promise with an array of strings in the format of 'ip:port' or throws ServiceNotFoundError.
 */
export function lookupServiceAsync(serviceName) {
  logger.log('verbose', `Looking up service ${serviceName}`);

  if (!(serviceName in registry)) {
    logger.log('error', `Found no service ${serviceName}`);
    throw new ServiceNotFoundError(serviceName);
  }

  logger.log('verbose', `Found service ${serviceName} at ${registry[serviceName]}`);

  return new Promise (function(resolve, reject){resolve(registry[serviceName])});
};
