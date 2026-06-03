import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url || `file://${__filename}`);
const thisDir = fileURLToPath(new URL('.', import.meta.url || `file://${__filename}`));
/**
 * Tries to resolve a package using Node.js resolution.
 * Directory names differing from the package name and alternate lookup paths can be passed.
 *
 * @param possiblePaths all possible paths the package can be resolved from
 * @param lookupPaths lookup paths passed to `require.resolve`
 */
export function tryResolvePackage(possiblePaths, lookupPaths) {
    for (const pkg of possiblePaths) {
        try {
            // package.json is guaranteed to be in the module root folder
            // so once that is resolved, take the dirname and we're done
            const possiblePath = require.resolve(`${pkg}/package.json`, lookupPaths?.length ? { paths: lookupPaths } : undefined);
            if (existsSync(possiblePath)) {
                return dirname(possiblePath);
            }
        }
        catch {
            /* not found */
        }
    }
}
/**
 * Scans for a package by walking up the directory tree and inspecting package.json
 * Directory names differing from the package name and an alternate start dir can be passed.
 *
 * @param possiblePaths All possible paths to check
 * @param startDir Optional start directory where we scan for the package
 */
export function scanForPackage(possiblePaths, startDir = thisDir) {
    // We start in the node_modules subfolder of adapter-core,
    // which is the deepest we should be able to expect the controller
    let curDir = join(startDir, '../node_modules');
    while (true) {
        for (const pkg of possiblePaths) {
            const possiblePath = join(curDir, pkg, 'package.json');
            try {
                // If package.json exists in the directory and its name field matches, we've found js-controller
                if (existsSync(possiblePath) &&
                    JSON.parse(readFileSync(possiblePath, 'utf8')).name === pkg.toLowerCase()) {
                    return dirname(possiblePath);
                }
            }
            catch {
                // don't care
            }
        }
        // Nothing found here, go up one level
        const parentDir = dirname(curDir);
        if (parentDir === curDir) {
            // we've reached the root without finding js-controller
            break;
        }
        curDir = parentDir;
    }
}
