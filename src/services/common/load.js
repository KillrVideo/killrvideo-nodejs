import { resolve } from 'path';
import { load as grpcLoad } from 'grpc';

// The proto files are copied as part of the build script (see package.json) to a '/protos' 
// folder under the root of the project
const root = resolve(__dirname, '../../protos');

/**
 * Common function for loading a protobuf file. Returns the proto object.
 */
export function load(file) {
  return grpcLoad({ root, file }, 'proto', { convertFieldsToCamelCase: true });
};

export default load;