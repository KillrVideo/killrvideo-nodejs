import { Logger, transports as CoreTransports } from 'winston';

/**
 * The default winston logger instance.
 */
export const logger = new Logger({
  transports: [ new CoreTransports.Console({ level: 'verbose', timestamp: true, colorize: true, stderrLevels: [ 'error' ] }) ]
});

/**
 * Adjust the logging level of the default logger instance.
 */
export function setLoggingLevel(level) {
  logger.transports.console.level = level;
};

export default logger;