import { types as CassandraTypes } from 'cassandra-driver';
import { getCassandraClient } from '../../common/cassandra';
import { load } from '../common/load';
import { toCassandraUuid, toJavaScriptDate } from '../common/protobuf-conversions';

// Load protobuf definitions we want to handle
const {
  UploadedVideoAdded,
  YouTubeVideoAdded
} = load('video-catalog/video_catalog_events.proto').killrvideo.video_catalog.events;

/**
 * Updates the search by tags data when new videos are added to the video catalog.
 */
function updateSearchOnVideoAdded(event) {
  // Nothing to do if no tags on the video
  if (event.tags.length === 0) {
    return;
  }

  // Convert some values
  let videoId = toCassandraUuid(event.videoId);
  let userId = toCassandraUuid(event.userId);
  let addedDate = toJavaScriptDate(event.addedDate);
  let timestamp = toJavaScriptDate(event.timestamp);

  // Create a batch for updating tag data tables
  let queries = [];
  event.tags.forEach(tag => {
    // Videos by tag table
    queries.push({
      query: 'INSERT INTO videos_by_tag (tag, videoid, added_date, userid, name, preview_image_location, tagged_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      params: [ tag, videoId, addedDate, userId, event.name, event.previewImageLocation, timestamp ]
    });

    // Tags by letter table
    let firstLetter = tag.substr(0, 1);
    queries.push({
      query: 'INSERT INTO tags_by_letter (first_letter, tag) VALUES (?, ?)',
      params: [ firstLetter, tag ]
    });
  });

  // Use event's timestamp as the write time in Cassandra
  let queryOpts = {};

  let client = getCassandraClient();
  return client.batchAsync(queries, queryOpts);
}

/**
 * An array of message bus handler definitions (i.e. the event type and handler function).
 */
export default [
  { eventType: UploadedVideoAdded, handler: updateSearchOnVideoAdded },
  { eventType: YouTubeVideoAdded, handler: updateSearchOnVideoAdded }
];