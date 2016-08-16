import { logServices } from './log-services';

/**
 * Registers all event listeners with a GrpcServer instance.
 */
export function registerListeners(grpcServer) {
  grpcServer.on('start', logServices);
};