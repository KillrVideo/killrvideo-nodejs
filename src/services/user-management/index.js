import { UserManagementService } from './protos';
import { getUserProfile } from './get-user-profile';
import { createUser } from './create-user';
import { verifyCredentials } from './verify-credentials';

/**
 * The user management service implementation.
 */
const implementation = {
  createUser,
  verifyCredentials,
  getUserProfile
};

/**
 * User Management Service, responsible for managing/authenticating users.
 */
export default {
  name: 'UserManagementService',
  service: UserManagementService.service,
  implementation
};
