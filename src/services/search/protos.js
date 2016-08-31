import { load } from '../common/load';

// Load the protobuf definition to get the service and response objects
const serviceFile = 'search/search_service.proto';
const {
  SearchService,
  SearchVideosResponse,
  SearchResultsVideoPreview,
  GetQuerySuggestionsResponse
} = load(serviceFile).killrvideo.search;

export {
  SearchService,
  SearchVideosResponse,
  SearchResultsVideoPreview,
  GetQuerySuggestionsResponse
};