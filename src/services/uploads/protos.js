import { load } from '../common/load';

// Load the protobuf definition to get the service and response objects
const serviceFile = 'uploads/uploads_service.proto';
const {
  UploadsService,
  GetUploadDestinationResponse,
  MarkUploadCompleteResponse,
  GetStatusOfVideoResponse
} = load(serviceFile).killrvideo.uploads;

export {
  UploadsService,
  GetUploadDestinationResponse,
  MarkUploadCompleteResponse,
  GetStatusOfVideoResponse
};