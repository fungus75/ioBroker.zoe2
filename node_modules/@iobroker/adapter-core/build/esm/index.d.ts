import { type ExitCodes } from './exitCodes.js';
import '@iobroker/types';
export { commonTools } from './controllerTools.js';
export * from './utils.js';
export * as I18n from './i18n.js';
export * as TokenRefresher from './TokenRefresher.js';
/**
 * Returns the absolute path of the data directory for the current host. On linux, this is usually `/opt/iobroker/iobroker-data`.
 */
export declare function getAbsoluteDefaultDataDir(): string;
/**
 * Returns the absolute path of the data directory for the current adapter instance.
 * On linux, this is usually `/opt/iobroker/iobroker-data/<adapterName>.<instanceNr>`
 *
 * @param adapterObjectOrNamespace The adapter instance or namespace string (e.g. "myAdapter.0").
 */
export declare function getAbsoluteInstanceDataDir(adapterObjectOrNamespace: ioBroker.Adapter | string): string;
export declare const EXIT_CODES: ExitCodes;
