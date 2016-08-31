import Promise from 'bluebird';
import { getCassandraClient } from '../../common/cassandra';
import { toProtobufUuid } from '../common/protobuf-conversions';
import { UnauthenticatedError } from '../common/grpc-errors';
import { validatePasswordAsync } from './password-hashing';
import { VerifyCredentialsResponse } from './protos';

/**
 * Verifies a user's credentials and returns the user's Id if successful or throws a Grpc
 * Unauthenticated error if credentials are incorrect.
 */
export function verifyCredentials(call, cb) {
  let { request } = call;

  // Find the user in Cassandra
  let getUser = Promise.try(() => {
    let client = getCassandraClient();
    return client.executeAsync('SELECT email, password, userid FROM user_credentials WHERE email = ?', [ request.email ]);
  })
  .then(resultSet => resultSet.first());

  // Validate the password provided against the hash stored in Cassandra
  let validatePassword = getUser.then(row => {
    // If no row, then we definitely don't have a valid email/pass
    if (row === null) {
      return false;
    }

    return validatePasswordAsync(request.password, row.password);
  });

  // Once we have user info and have validated the password...
  return Promise.join(getUser, validatePassword, (row, isValid) => {
    if (isValid !== true) {
      throw new UnauthenticatedError('Email address or password are not correct');
    }

    // Return the user's Id from Cassandra
    return new VerifyCredentialsResponse({
      userId: toProtobufUuid(row.userid)
    });
  })
  .asCallback(cb);
};