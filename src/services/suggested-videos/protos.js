import { load } from '../common/load';

// Load the protobuf definition to get the service and response objects
const serviceFile = 'suggested-videos/suggested_videos_service.proto';
const {
  SuggestedVideoService,
  GetRelatedVideosResponse,
  GetSuggestedForUserResponse,
  SuggestedVideoPreview
} = load(serviceFile).killrvideo.suggested_videos;

export {
  SuggestedVideoService,
  GetRelatedVideosResponse,
  GetSuggestedForUserResponse,
  SuggestedVideoPreview
};