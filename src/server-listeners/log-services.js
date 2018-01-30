import { logger } from '../common/logging';
import config from '../common/config';
import {serviceNameFromDefinition} from '../services';

/**
 * Listener that will log all services and the host/port they're running on.
 */
export function logServices(grpcServer) {
  let listen = config.get('listen');
  let ipAndPort = `${listen.ip}:${listen.port}`;

  grpcServer.on('start', function logServicesOnStart(services) {
    services.forEach(s => {
      logger.log('verbose', `Service ${serviceNameFromDefinition(s)} is listening on ${ipAndPort}`);
    });
  });
};
