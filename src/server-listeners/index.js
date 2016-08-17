import { logServices } from './log-services';
import { register, remove } from './register-with-service-discovery';

/**
 * An array of all listener registration functions that want to subscribe to Grpc server events.
 */
export const listeners = [
  logServices,
  register,
  remove
];

export default listeners;