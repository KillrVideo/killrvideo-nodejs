import { SearchService } from './protos';
import { searchVideos } from './search-videos';
import { getQuerySuggestions } from './get-query-suggestions';
import handlers from './handlers';

/**
 * The search service implementation.
 */
const implementation = {
  searchVideos,
  getQuerySuggestions
};

/**
 * Search service which allows searching for videos.
 */
export default {
  name: 'SearchService',
  service: SearchService.service,
  implementation,
  handlers
};
