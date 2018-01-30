import Promise from 'bluebird';
import { GetVideoResponse, VideoLocationType } from './protos';
import { toCassandraUuid, toProtobufTimestamp, toProtobufUuid } from '../common/protobuf-conversions';
import { NotFoundError } from '../common/grpc-errors';
import { getCassandraClient } from '../../common/cassandra';

/**
 * Gets the details of a specific video from the catalog.
 */
export function getVideo(call, cb) {
  return Promise.try(() => {
    let { request } = call;

    let client = getCassandraClient();
    let requestParams = [
      toCassandraUuid(request.videoId)
    ];
    return client.executeAsync('SELECT * FROM videos WHERE videoid = ?', requestParams);
  })
  .then(resultSet => {
    let row = resultSet.first();
    if (row === null) {
      throw new NotFoundError(`A video with id ${call.request.videoId.value} was not found`);
    }

    return new GetVideoResponse({
      videoId: toProtobufUuid(row.videoid),
      userId: toProtobufUuid(row.userid),
      name: row.name,
      description: row.description,
      location: row.location,
      locationType: row.location_type,
      tags: row.tags === null ? [] : row.tags,
      addedDate: toProtobufTimestamp(row.added_date)
    });
  })
  .asCallback(cb);
};
