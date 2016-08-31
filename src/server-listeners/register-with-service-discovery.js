import Promise from 'bluebird';
import { registerServiceAsync, removeServiceAsync } from '../common/service-discovery'
import { withRetries } from '../common/with-retries';
import config from '../common/config';

function getAppUniqueId() {
  // Use app name and instance number to set a unique id for the app
  let appName = config.get('appName');
  let appInstance = config.get('appInstance');
  return `${appName}:${appInstance}`;
}

let startStopPromise = null;

/**
 * Register all services with etcd for service discovery on start.
 */
export function register(grpcServer) {
  // Use broadcast address when registering with service discovery
  let broadcast = config.get('broadcast');
  let ipAndPort = `${broadcast.ip}:${broadcast.port}`;

  grpcServer.on('start', function registerOnStart(services) {
    let uniqueId = getAppUniqueId();

    // Cancel any previous attempts if still around
    if (startStopPromise !== null) {
      startStopPromise.cancel();
    }

    // Register each service with etcd
    let startServices = services.map(s => {
      let registerFn = () => registerServiceAsync(s.name, uniqueId, ipAndPort);
      return withRetries(registerFn, Infinity, 5, `Could not register ${s.name} in service registry`, false);
    });
    startStopPromise = Promise.all(startServices).tap(() => { startStopPromise = null; })
  });
};

let stopPromise = null;

/**
 * Remove all services from etcd on stop.
 */
export function remove(grpcServer) {
  grpcServer.on('stop', function removeOnStop(services) {
    let uniqueId = getAppUniqueId();

    // Cancel any previous attempts
    if (startStopPromise !== null) {
      startStopPromise.cancel();
    }

    // Remove each service from etcd
    let stopServices = services.map(s => {
      let removeFn = () => removeServiceAsync(s.name, uniqueId);
      return withRetries(removeFn, Infinity, 5, `Could not remove ${s.name} from service registry`, false);
    });
    startStopPromise = Promise.all(stopServices).tap(() => { startStopPromise = null; });
  });
};