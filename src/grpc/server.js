import { Server, ServerCredentials } from 'grpc';
import { services } from '../services';

/**
 * Create a Grpc server with all available services and returns it.
 */
export function createServer() {
  var server = new Server();

  // Add all available services to the Grpc Server
  services.forEach(service => {
    server.addProtoService(service.service, service.implementation);
  });
  
  server.bind('0.0.0.0:50101', ServerCredentials.createInsecure());
  return server;
}