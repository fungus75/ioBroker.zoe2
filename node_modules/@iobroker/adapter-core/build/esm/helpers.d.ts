/**
 * Tries to resolve a package using Node.js resolution.
 * Directory names differing from the package name and alternate lookup paths can be passed.
 *
 * @param possiblePaths all possible paths the package can be resolved from
 * @param lookupPaths lookup paths passed to `require.resolve`
 */
export declare function tryResolvePackage(possiblePaths: string[], lookupPaths?: string[]): string | undefined;
/**
 * Scans for a package by walking up the directory tree and inspecting package.json
 * Directory names differing from the package name and an alternate start dir can be passed.
 *
 * @param possiblePaths All possible paths to check
 * @param startDir Optional start directory where we scan for the package
 */
export declare function scanForPackage(possiblePaths: string[], startDir?: string): string | undefined;
