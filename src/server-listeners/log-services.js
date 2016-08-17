import { logger } from '../common/logging';

/**
 * Listener that will log all services and the host/port they're running on.
 */
export function logServices(grpcServer) {
  grpcServer.on('start', function logServicesOnStart(hostAndPort, services) {
    services.forEach(s => {
      logger.log('verbose', `Service ${s.name} is listening on ${hostAndPort}`);
    });
  });
};