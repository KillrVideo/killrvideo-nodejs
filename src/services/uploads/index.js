import { UploadsService } from './protos';
import { NotImplementedError } from '../common/grpc-errors';

/**
 * The uploads service implementation.
 */
const implementation = {
  getUploadDestination(call, cb) {
    cb(new NotImplementedError('Not implemented'));
  },

  markUploadComplete(call, cb) {
    cb(new NotImplementedError('Not implemented'));
  },

  getStatusOfVideo(call, cb) {
    cb(new NotImplementedError('Not implemented'));
  }
};

/**
 * Uploads service, that handles processing/re-encoding of user uploaded videos.
 */
export default {
  name: 'UploadsService',
  service: UploadsService.service,
  implementation
};
