import { UserManagementService } from './protos';
import { getUserProfile } from './get-user-profile';

/**
 * The user management service implementation.
 */
const implementation = {
  createUser(call, cb) {
    cb(new Error('Not implemented'));
  },

  verifyCredentials(call, cb) {
    cb(new Error('Not implemented'));
  },

  getUserProfile
}; 

/**
 * User Management Service, responsible for managing/authenticating users.
 */
export default {
  service: UserManagementService.service,
  implementation 
};