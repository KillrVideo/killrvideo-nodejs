import { load } from '../common/load';

// Load the protobuf definition to get the service object
const file = 'search/search_service.proto';
const proto = load(file);
const { service } = proto.killrvideo.search.SearchService;

/**
 * The search service implementation.
 */
const implementation = {
  searchVideos(call, cb) {
    cb(new Error('Not implemented'));
  },

  getQuerySuggestions(call, cb) {
    cb(new Error('Not implemented'));
  }
}; 

/**
 * Search service which allows searching for videos.
 */
export default {
  service,
  implementation 
};