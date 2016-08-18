import { load } from '../common/load';

// Load the protobuf definition to get the service object
const file = 'statistics/statistics_service.proto';
const {
  StatisticsService,
  RecordPlaybackStartedResponse,
  GetNumberOfPlaysResponse,
  PlayStats
} = load(file).killrvideo.statistics;

export {
  StatisticsService,
  RecordPlaybackStartedResponse,
  GetNumberOfPlaysResponse,
  PlayStats
};