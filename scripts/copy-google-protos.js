var path = require('path');
var cpx = require('cpx');

// Resolve location of grpc-tools package, then add location of google .proto files
var grpcToolsPath = path.dirname(require.resolve('grpc-tools'));
var googlePath = path.resolve(grpcToolsPath, 'bin');

var srcGlob = googlePath + path.sep + '**' + path.sep + '*.proto';

// Copy all protocol buffers files to destination specified
console.log('Copying "' + srcGlob + '" to "' + process.argv[2] + '"');
cpx.copySync(srcGlob, process.argv[2]);
