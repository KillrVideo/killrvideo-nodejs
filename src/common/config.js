import convict from 'convict';

// Create application config
const conf = convict({
  loggingLevel: {
    doc: 'The default logger output level',
    format: String,
    default: 'verbose',
    env: 'KILLRVIDEO_LOGGING_LEVEL'
  },

  dseEnabled: {
    doc: 'Whether or not to use DataStax Enterprise service implementations of services',
    format: Boolean,
    default: true,
    env: 'KILLRVIDEO_DSE_ENABLED'
  },

  appName: {
    doc: 'The name of this application',
    format: String,
    default: 'killrvideo-nodejs',
    env: 'NODE_APP'
  },

  appInstance: {
    doc: 'A unique instance number for this application',
    format: 'nat',  // Natural number (positive integer)
    default: 1,
    env: 'NODE_APP_INSTANCE'
  },

  services: {
    doc: 'Service definitions',
    format: 'Object',
    default: {}
  },

  listen: {
    ip: {
      doc: 'The IP address for Grpc services to listen on',
      format: 'ipaddress',
      default: '0.0.0.0',
      env: 'KILLRVIDEO_LISTEN_IP'
    },

    port: {
      doc: 'The Port for Grpc services to listen on',
      format: 'port',
      default: 50101,
      env: 'KILLRVIDEO_LISTEN_PORT'
    }
  }
});

conf.loadFile('./config/services.json');

// Validate the config and export it
conf.validate();

export default conf;
