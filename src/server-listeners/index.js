import { logServices } from './log-services';

/**
 * An array of all listener registration functions that want to subscribe to Grpc server events.
 */
export const listeners = [
  logServices,
];

export default listeners;