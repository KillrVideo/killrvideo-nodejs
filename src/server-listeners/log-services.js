import { logger } from '../common/logging';

/**
 * Listener that will log all services and the host/port they're running on.
 */
export function logServices({ hostAndPort, services }) {
  services.forEach(s => {
    logger.log('verbose', `Service ${s.name} is listening on ${hostAndPort}`);
  });
};