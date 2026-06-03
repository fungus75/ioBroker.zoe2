import { join } from 'node:path';
import { controllerToolsInternal, resolveNamedModule } from './controllerTools.js';
import * as utils from './utils.js';
import '@iobroker/types';
// Export utility methods to be used in adapters
export { commonTools } from './controllerTools.js';
export * from './utils.js';
export * as I18n from './i18n.js';
export * as TokenRefresher from './TokenRefresher.js';
/**
 * Returns the absolute path of the data directory for the current host. On linux, this is usually `/opt/iobroker/iobroker-data`.
 */
export function getAbsoluteDefaultDataDir() {
    return join(utils.controllerDir, controllerToolsInternal.getDefaultDataDir());
}
/**
 * Returns the absolute path of the data directory for the current adapter instance.
 * On linux, this is usually `/opt/iobroker/iobroker-data/<adapterName>.<instanceNr>`
 *
 * @param adapterObjectOrNamespace The adapter instance or namespace string (e.g. "myAdapter.0").
 */
export function getAbsoluteInstanceDataDir(adapterObjectOrNamespace) {
    return join(getAbsoluteDefaultDataDir(), typeof adapterObjectOrNamespace === 'string' ? adapterObjectOrNamespace : adapterObjectOrNamespace.namespace);
}
// TODO: Expose some system utilities here, e.g. for installing npm modules (GH#1)
export const EXIT_CODES = Object.freeze({
    // Create a shallow copy so compact adapters cannot overwrite the dict in js-controller
    ...resolveNamedModule('exitCodes', 'EXIT_CODES'),
});
