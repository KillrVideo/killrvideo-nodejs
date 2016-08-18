import { load } from '../common/load';

// Load the protobuf definition to get the service and response objects
const serviceFile = 'video-catalog/video_catalog_service.proto';
const {
  VideoCatalogService,
  SubmitUploadedVideoResponse,
  SubmitYouTubeVideoResponse,
  GetVideoResponse,
  VideoLocationType,
  GetVideoPreviewsResponse,
  VideoPreview,
  GetLatestVideoPreviewsResponse,
  GetUserVideoPreviewsResponse
} = load(serviceFile).killrvideo.video_catalog;

export {
  VideoCatalogService,
  SubmitUploadedVideoResponse,
  SubmitYouTubeVideoResponse,
  GetVideoResponse,
  VideoLocationType,
  GetVideoPreviewsResponse,
  VideoPreview,
  GetLatestVideoPreviewsResponse,
  GetUserVideoPreviewsResponse
};