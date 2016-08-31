import Promise from 'bluebird';
import { InvalidArgumentError } from '../common/grpc-errors';
import { toCassandraUuid, toProtobufUuid, toProtobufTimestamp } from '../common/protobuf-conversions';
import { getCassandraClient } from '../../common/cassandra';
import { GetVideoPreviewsResponse, VideoPreview } from './protos';

/**
 * Get a limited number of video previews by id.
 */
export function getVideoPreviews(call, cb) {
  let { request } = call;
  return Promise.try(() => {
    // We're doing a multi-get here so try and enforce some sanity on the number we can get in
    // a single request
    if (request.videoIds.length > 20) {
      throw new InvalidArgumentError('Cannot fetch more than 20 videos at once');
    }

    // Execute multiple selects in parallel for each requested video
    let client = getCassandraClient();
    return request.videoIds.map(id => {
      let videoId = toCassandraUuid(id);
      return client.executeAsync(
        'SELECT videoid, userid, added_date, name, preview_image_location FROM videos WHERE videoid = ?', [ videoId ]);
    });
  })
  .all()
  .then(resultSets => {
    // Each ResultSet should be a single row with a video's data
    let videoPreviews = resultSets.map(resultSet => {
      let row = resultSet.first();
      return new VideoPreview({
        videoId: toProtobufUuid(row.videoid),
        addedDate: toProtobufTimestamp(row.added_date),
        name: row.name,
        previewImageLocation: row.preview_image_location,
        userId: toProtobufUuid(row.userid)
      });
    });

    return new GetVideoPreviewsResponse({
      videoPreviews
    });
  })
  .asCallback(cb);
};