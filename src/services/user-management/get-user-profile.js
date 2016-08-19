import Promise from 'bluebird';
import { InvalidArgumentError } from '../common/grpc-errors';
import { GetUserProfileResponse, UserProfile } from './protos';
import { toCassandraUuid } from '../common/protobuf-conversions';
import { getCassandraClient } from '../../common/cassandra';

/**
 * Gets profiles for the user(s) specified in the request.
 */
export function getUserProfile(call, cb) {
  let { request } = call;

  return Promise.try(() => {
    if (request.userIds.length === 0) {
      throw new InvalidArgumentError('Must specify at least one user id to get profiles for');
    }

    // Try to enforce some sanity on the number we can get for any given request
    if (request.userIds.length > 20) {
      throw new InvalidArgumentError('Cannot get more than 20 user profiles at once');
    }

    // Do multiple queries in parallel
    let client = getCassandraClient();
    return Promise.map(request.userIds, userId => {
      let uid = toCassandraUuid(userId);
      return client.executeAsync('SELECT userid, firstname, lastname, email FROM users WHERE userid = ?', [ uid ]);
    });
  })
  .then(resultSets => {
    // Map each ResultSet and its single row to a profile to build the response
    let profiles = resultSets.map((resultSet, idx) => {
      let row = resultSet.first();
      if (row === null) return null;
      
      return new UserProfile({
        userId: request.userIds[idx],
        firstName: row.firstname,
        lastName: row.lastname,
        email: row.email
      });
    });
    return new GetUserProfileResponse({ profiles });
  })
  .asCallback(cb);
};