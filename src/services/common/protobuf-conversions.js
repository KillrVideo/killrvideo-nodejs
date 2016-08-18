import { types as CassandraTypes } from 'cassandra-driver';

/**
 * Converts an object representing a google.protobuf.Timestamp to a JavaScript Date. If the
 * timestamp supplied is null, returns null.
 */
export function toJavaScriptDate(timestamp) {
  if (timestamp === null) return null;
  if (!timestamp.seconds || !timestamp.nanos) {
    throw new Error('Object is not a google.protobuf.Timestamp');
  }
  let millis = (timestamp.seconds * 1000) + Math.trunc(timestamp.nanos / 1000000);
  return new Date(millis);
};

/**
 * Converts a JavaScript Date object to a google.protobuf.Timestamp. If the date object supplied
 * is null, returns null.
 */
export function toProtobufTimestamp(date) {
  if (date === null) return null;
  let millis = date.valueOf();
  let seconds = Math.trunc(millis / 1000);
  let nanos = (millis % 1000) * 1000000;
  return { seconds, nanos };
};

/**
 * Converts a killrvideo.common.Uuid to a Cassandra driver Uuid. If the protobuf Uuid is null,
 * returns null.
 */
export function toCassandraUuid(protobufUuid) {
  if (protobufUuid === null) return null;
  return CassandraTypes.Uuid.fromString(protobufUuid.value);
};

/**
 * Converts a killrvideo.common.TimeUuid to a Cassandra driver TimeUuid. If the protobuf TimeUuid
 * is null, returns null.
 */
export function toCassandraTimeUuid(protobufTimeUuid) {
  if (protobufTimeUuid === null) return null;
  return CassandraTypes.TimeUuid.fromString(protobufTimeUuid.value);
};

/**
 * Converts a Cassandra driver Uuid or TimeUuid to an object compatible with killrvideo.common.Uuid
 * and killrvideo.common.TimeUuid. If the Cassandra Uuid is null, returns null.
 */
export function toProtobufUuid(cassandraUuid) {
  if (cassandraUuid === null) return null;
  return { value: cassandraUuid.toString() };
};