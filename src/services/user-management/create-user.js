import Promise from 'bluebird';
import { types as CassandraTypes } from 'cassandra-driver';
import { CreateUserResponse } from './protos';
import { UserCreated } from './events';
import { createHashAsync } from './password-hashing';
import { toCassandraUuid, toProtobufTimestamp } from '../common/protobuf-conversions';
import { AlreadyExistsError } from '../common/grpc-errors';
import { getCassandraClient } from '../../common/cassandra';
import { publishAsync } from '../../common/message-bus';

/**
 * Creates a new user account.
 */
export function createUser(call, cb) {
  let { request } = call;

  // Hash the password provided
  return createHashAsync(request.password)
    .then(passwordHash => {
      // Insert the user credentials using a Lighweight Transactions (will fail if there is already a user
      // with the requested email address)
      let client = getCassandraClient();
      let insertParams = [
        request.email,
        passwordHash,
        toCassandraUuid(request.userId)
      ];
      return client.executeAsync(
        'INSERT INTO user_credentials (email, password, userid) VALUES (?, ?, ?) IF NOT EXISTS', insertParams);
    })
    .then(resultSet => {
      let row = resultSet.first();
      // Sanity check
      if (row === null) {
        throw new Error('No row returned when creating user');
      }

      // See if the insert succeeded by checking the [applied] column in the first row returned 
      if (row['[applied]'] === false) {
        throw new AlreadyExistsError('A user with that email address already exists');
      }

      // UTC creation date of the user and use that as client-side generated timestamp for the write in C*
      let createdDate = new Date(Date.now());
      let insertOpts = { timestamp: CassandraTypes.generateTimestamp(createdDate) };
      
      // Go ahead and insert the user profile record and return the createdDate when successful
      let client = getCassandraClient();
      let insertParams = [
        toCassandraUuid(request.userId),
        request.firstName,
        request.lastName,
        request.email,
        createdDate
      ];
      return client.executeAsync(
        'INSERT INTO users (userid, firstname, lastname, email, created_date) VALUES (?, ?, ?, ?, ?)', 
        insertParams, insertOpts).return(createdDate);
    })
    .then(createdDate => {
      // Publish an event to tell the world about the new user
      let event = new UserCreated({
        userId: request.userId,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        timestamp: toProtobufTimestamp(createdDate)
      });
      return publishAsync(event);
    })
    .asCallback(cb);
};