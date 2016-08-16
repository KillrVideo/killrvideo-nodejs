import comments from './comments';
import ratings from './ratings';
import search from './search';
import stats from './statistics';
import suggestedVideos from './suggested-videos';
import uploads from './uploads';
import userManagement from './user-management';
import videoCatalog from './video-catalog';

/**
 * An array of all available service objects.
 */
export const services = [
  comments,
  ratings,
  search,
  stats,
  suggestedVideos,
  uploads,
  userManagement,
  videoCatalog
];

export default services;