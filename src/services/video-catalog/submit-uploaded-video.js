import Promise from 'bluebird';
import { types as CassandraTypes } from 'cassandra-driver';
import { getCassandraClient } from '../../common/cassandra';
import { publishAsync } from '../../common/message-bus';
import { toCassandraUuid, toProtobufTimestamp } from '../common/protobuf-conversions';
import { SubmitUploadedVideoResponse, VideoLocationType } from './protos';
import { UploadedVideoAccepted } from './events';

/**
 * Submits an uploaded video to the catalog.
 */
export function submitUploadedVideo(call, cb) {
  let { request } = call;
  return Promise.try(() => {
    // Convert some request params to Cassandra values
    let videoId = toCassandraUuid(request.videoId);
    let userId = toCassandraUuid(request.userId);
    
    // Added date is current UTC date and time
    let addedDate = new Date(Date.now());

    // Create the event we'll publish if our write is successful
    let event = new UploadedVideoAccepted({
      videoId: request.videoId,
      uploadUrl: request.uploadUrl,
      timestamp: toProtobufTimestamp(addedDate)
    });

    // Create the queries we're going to run in a batch (here, we're storing only the data we know now at submit time)
    let queries = [
      {
        query: 'INSERT INTO videos (videoid, userid, name, description, tags, location_type, added_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        params: [ videoId, userId, request.name, request.description, request.tags, VideoLocationType.UPLOAD, addedDate ]
      },
      {
        query: 'INSERT INTO user_videos (userid, added_date, videoid, name) VALUES (?, ?, ?, ?)',
        params: [ userId, addedDate, videoId, request.name ]
      }
    ];

    // Use addedDate as a client-provided timestamp for the write in Cassandra
    let queryOpts = { timestamp: CassandraTypes.generateTimestamp(addedDate) };

    // Execute the batch and if successful, return the event so it can be published
    let client = getCassandraClient();
    return client.batchAsync(queries, queryOpts).return(event);
  })
  .then(event => {
    // Tell the world about the uploaded video that was accepted
    return publishAsync(event);
  })
  .then(() => {
    // Return the response
    return new SubmitUploadedVideoResponse();
  })
  .asCallback(cb);
};