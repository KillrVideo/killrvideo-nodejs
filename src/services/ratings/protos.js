import { load } from '../common/load';

// Load the protobuf definition to get the service and response objects
const serviceFile = 'ratings/ratings_service.proto';
const {
  RatingsService,
  RateVideoResponse,
  GetRatingResponse,
  GetUserRatingResponse
} = load(serviceFile).killrvideo.ratings;

export {
  RatingsService,
  RateVideoResponse,
  GetRatingResponse,
  GetUserRatingResponse
};