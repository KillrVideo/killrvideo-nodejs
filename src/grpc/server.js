import { Server, ServerCredentials } from 'grpc';

/**
 * Create a Grpc server.
 */
export function createServer(ipAndPort) {
  var server = new Server();
  server.addProtoService(THE_PROTO, THE_SERVICE_OBJECT);
  server.bind(ipAndPort, ServerCredentials.createInsecure());
  server.start(); 
}