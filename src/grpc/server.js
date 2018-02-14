import EventEmitter from 'events';
import Promise from 'bluebird';
import { Server, ServerCredentials } from 'grpc';
import { logger } from '../common/logging';
import config from '../common/config';

/**
 * Class that wraps an underlying Grpc server object and allows it to be started/stopped. Emits
 * 'start' and 'stop' events for when this happens.
 */
export class GrpcServer extends EventEmitter {
  constructor(services) {
    super();
    this._services = services;
    this._stopAsync = null;
  }

  /**
   * Start the server and all Grpc services.
   */
  start() {
    // Already started?
    if (this._stopAsync !== null) return;

    let server = new Server();

    // Add all available services to the Grpc Server
    this._services.forEach(service => {
      logger.log('debug', `Adding Grpc service for ${service.service.name}`);
      server.addService(service.service, service.implementation);
    });

    // Figure out where to listen
    let listen = config.get('listen');
    let ipAndPort = `${listen.ip}:${listen.port}`;

    // Bind the server and start all services
    server.bind(ipAndPort, ServerCredentials.createInsecure());

    // Save stop method
    this._stopAsync = Promise.promisify(server.tryShutdown, { context: server });

    logger.log('debug', `Starting Grpc server on ${ipAndPort}`);
    server.start();
    this._emitEvent('start');
    logger.log('debug', 'Started Grpc server');
  }

  /**
   * Stop the server, trying to allow all outstanding requests to complete. Returns a Promise
   * that resolves once stopped.
   */
  stopAsync() {
    // Not started?
    if (this._stopAsync === null) return;

    logger.log('debug', 'Stopping Grpc server');

    // Stop, then let everyone know we're stopped
    return this._stopAsync()
      .then(() => {
        this._emitEvent('stop');
        return null;  // In case any listeners are creating promises, return null to prevent bluebird warning
      })
      .finally(() => logger.log('debug', 'Stopped Grpc server'));
  }

  _emitEvent(eventName) {
    this.emit(eventName, this._services.map(s => s.service));
  }
};
