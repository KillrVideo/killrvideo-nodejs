import { load } from '../common/load';

// Load the protobuf definition to get the service and response objects
const file = 'user-management/user_management_service.proto';
const {
  UserManagementService,
  CreateUserResponse,
  VerifyCredentialsResponse,
  GetUserProfileResponse,
  UserProfile
} = load(file).killrvideo.user_management;

export {
  UserManagementService,
  CreateUserResponse,
  VerifyCredentialsResponse,
  GetUserProfileResponse,
  UserProfile
};