import Promise from 'bluebird';
import moment from 'moment';
import { types as CassandraTypes } from 'cassandra-driver';
import { getCassandraClient } from '../../common/cassandra';
import { publishAsync } from '../../common/message-bus';
import { toCassandraUuid, toProtobufTimestamp } from '../common/protobuf-conversions';
import { SubmitYouTubeVideoResponse, VideoLocationType } from './protos';
import { YouTubeVideoAdded } from './events';
import { LATEST_VIDEOS_MAX_DAYS } from './constants';

const videosCql = `
INSERT INTO videos (
  videoid, userid, name, description, location, preview_image_location, tags, added_date, location_type) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const userVideosCql = `
INSERT INTO user_videos (
  userid, added_date, videoid, name, preview_image_location) 
VALUES (?, ?, ?, ?, ?)`;

const latestVideosCql = `
INSERT INTO latest_videos (
  yyyymmdd, added_date, videoid, userid, name, preview_image_location) 
VALUES (?, ?, ?, ?, ?, ?) 
USING TTL ?`;

// Number of seconds a record should stay in the latest videos table
const LATEST_VIDEOS_TTL_SECONDS = LATEST_VIDEOS_MAX_DAYS * 24 * 60 * 60;

/**
 * Submits a YouTube video to the catalog.
 */
export function submitYouTubeVideo(call, cb) {
  return Promise.try(() => {
    let { request } = call;

    // Convert user and video Ids to Cassandra Uuids
    let videoId = toCassandraUuid(request.videoId);
    let userId = toCassandraUuid(request.userId);

    // Added date is current UTC date and time
    let addedDate = new Date(Date.now());
    let yyyymmdd = moment(addedDate).format('YYYYMMDD');

    // Use YouTubeVideoId from request along with well-known location of thumbnails as the preview image
    let previewImageLocation = `//img.youtube.com/vi/${request.youTubeVideoId}/hqdefault.jpg`;

    // Create the event to publish if we successfully write the data
    let event = new YouTubeVideoAdded({
      videoId: request.videoId,
      userId: request.userId,
      name: request.name,
      description: request.description,
      location: request.youTubeVideoId,
      previewImageLocation,
      tags: request.tags,
      addedDate: toProtobufTimestamp(addedDate),
      timestamp: toProtobufTimestamp(addedDate)
    });

    // Create the array for the batch of queries and their bind values
    let queries = [
      { 
        query: videosCql, 
        params: [ 
          videoId, userId, request.name, request.description, request.youTubeVideoId, previewImageLocation, 
          request.tags, addedDate, VideoLocationType.YOUTUBE
        ]
      },
      { query: userVideosCql, params: [ userId, addedDate, videoId, request.name, previewImageLocation ] },
      { 
        query: latestVideosCql, 
        params: [ yyyymmdd, addedDate, videoId, userId, request.name, previewImageLocation, LATEST_VIDEOS_TTL_SECONDS ] 
      }
    ];

    // Generate a timestamp for the queries in the batch from the added date
    let queryOpts = { timestamp: CassandraTypes.generateTimestamp(addedDate) };

    // Send the batch and return the event to publish if successful
    let client = getCassandraClient();
    return client.batchAsync(queries, queryOpts).return(event);
  })
  .then(event => {
    // Tell the world about the new YouTube video
    return publishAsync(event);
  })
  .then(() => {
    // Return the response
    return new SubmitYouTubeVideoResponse();
  })
  .asCallback(cb);
};