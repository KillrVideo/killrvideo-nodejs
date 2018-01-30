import convict from 'convict';
import { isIP } from 'net';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from docker's .env file if present
dotenv.config({ path: resolve(__dirname, '../../.env')});

// Create config for a local docker environment
const dockerConf = convict({
  hostIp: {
    doc: 'The IP address of the host',
    format: 'ipaddress',
    default: undefined,
    env: 'KILLRVIDEO_HOST_IP'
  },

  dockerIp: {
    doc: 'The IP address for the docker VM',
    format: 'ipaddress',
    default: undefined,
    env: 'KILLRVIDEO_DOCKER_IP'
  }
});

dockerConf.validate();

// Custom format to allow falling back to IP addresses from the docker config
convict.addFormat({
  name: 'docker-fallback-ip',
  validate(val) {
    // Validate is IP v4 or v6 address
    if (isIP(val) === 0) {
      throw new Error('must be an IP address');
    }
  },
  coerce(val, config) {
    // Replace ${token} with dockerConf.get('token') value
    return val.replace(/\$\{([\w\.]+)}/g, (match, dockerConfig) => {
      if (dockerConf.has(dockerConfig) === false) {
        return '';
      }
      return dockerConf.get(dockerConfig);
    });
  }
});

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

  etcd: {
    ip: {
      doc: 'The IP address for etcd to do service discovery',
      format: 'docker-fallback-ip',
      default: '${dockerIp}',
      env: 'KILLRVIDEO_ETCD_IP'
    },

    port: {
      doc: 'The port for etcd to do service discovery',
      format: 'port',
      default: 2379,
      env: 'KILLRVIDEO_ETCD_PORT'
    }
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
  },

  broadcast: {
    ip: {
      doc: 'The IP address to broadcast for Grpc services (i.e. register with service discovery)',
      format: 'docker-fallback-ip',
      default: '${hostIp}',
      env: 'KILLRVIDEO_BROADCAST_IP'
    },

    port: {
      doc: 'The Port to broadcast for Grpc services (i.e. register with service discovery)',
      format: 'port',
      default: 50101,
      env: 'KILLRVIDEO_BROADCAST_PORT'
    }
  }
});

// Validate the config and export it
conf.validate();

export default conf;
