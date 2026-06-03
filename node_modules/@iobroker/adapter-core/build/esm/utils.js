import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { scanForPackage, tryResolvePackage } from './helpers.js';
const require = createRequire(import.meta.url || `file://${__filename}`);
/**
 * Resolves the root directory of JS-Controller and returns it or exits the process
 *
 * @param isInstall Whether the adapter is run in "install" mode or if it should execute normally
 */
function getControllerDir(isInstall) {
    // Find the js-controller location
    const possibilities = ['iobroker.js-controller', 'ioBroker.js-controller'];
    // First, try to let Node.js resolve the package by itself
    let controllerDir = tryResolvePackage(possibilities);
    // Apparently, checking vs. null/undefined may miss the odd case of controllerPath being ""
    // Thus we check for falseness, which includes failing on an empty path
    if (controllerDir) {
        return controllerDir;
    }
    // As a fallback solution, we walk up the directory tree until we reach the root or find js-controller
    controllerDir = scanForPackage(possibilities);
    if (controllerDir) {
        return controllerDir;
    }
    if (!isInstall) {
        console.log('Cannot find js-controller');
        return process.exit(10);
    }
    return process.exit();
}
/** The root directory of JS-Controller */
export const controllerDir = getControllerDir(!!process?.argv?.includes('--install'));
function resolveAdapterConstructor() {
    // Attempt 1: Resolve @iobroker/js-controller-adapter from here - JS-Controller 4.1+
    let adapterPath = tryResolvePackage(['@iobroker/js-controller-adapter']);
    if (adapterPath) {
        try {
            const { Adapter } = require(adapterPath);
            if (Adapter) {
                return Adapter;
            }
        }
        catch {
            // did not work, continue
        }
    }
    // Attempt 2: Resolve @iobroker/js-controller-adapter in JS-Controller dir - JS-Controller 4.1+
    adapterPath = tryResolvePackage(['@iobroker/js-controller-adapter'], [join(controllerDir, 'node_modules')]);
    if (adapterPath) {
        try {
            const { Adapter } = require(adapterPath);
            if (Adapter) {
                return Adapter;
            }
        }
        catch {
            // did not work, continue
        }
    }
    // Attempt 3: JS-Controller 6+ with adapter stub
    adapterPath = join(controllerDir, 'build/cjs/lib/adapter.js');
    try {
        // This was a default export prior to the TS migration
        const Adapter = require(adapterPath);
        if (Adapter) {
            return Adapter;
        }
    }
    catch {
        // did not work, continue
    }
    // Attempt 4: JS-Controller 4.1+ with adapter stub
    adapterPath = join(controllerDir, 'build/lib/adapter.js');
    try {
        // This was a default export prior to the TS migration
        const Adapter = require(adapterPath);
        if (Adapter) {
            return Adapter;
        }
    }
    catch {
        // did not work, continue
    }
    // Attempt 5: Legacy resolve - until JS-Controller 4.0
    adapterPath = join(controllerDir, 'lib/adapter.js');
    try {
        // This was a default export prior to the TS migration
        const Adapter = require(adapterPath);
        if (Adapter) {
            return Adapter;
        }
    }
    catch {
        // did not work, continue
    }
    throw new Error('Cannot resolve adapter class');
}
/** Reads the configuration file of JS-Controller */
export function getConfig() {
    return JSON.parse(readFileSync(join(controllerDir, 'conf/iobroker.json'), 'utf8'));
}
/** Creates a new adapter instance */
export const adapter = resolveAdapterConstructor();
/** Creates a new adapter instance */
export const Adapter = adapter;
