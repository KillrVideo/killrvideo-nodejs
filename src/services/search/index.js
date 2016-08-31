import { SearchService } from './protos';
import { searchVideos } from './search-videos';

/**
 * The search service implementation.
 */
const implementation = {
  searchVideos,
  getQuerySuggestions(call, cb) {
    cb(new Error('Not implemented'));
  }
}; 

/**
 * Search service which allows searching for videos.
 */
export default {
  service: SearchService.service,
  implementation 
};