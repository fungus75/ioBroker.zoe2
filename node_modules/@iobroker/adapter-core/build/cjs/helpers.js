"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var helpers_exports = {};
__export(helpers_exports, {
  scanForPackage: () => scanForPackage,
  tryResolvePackage: () => tryResolvePackage
});
module.exports = __toCommonJS(helpers_exports);
var __import_meta_url = typeof document === "undefined" ? new (require("url".replace("", ""))).URL("file:" + __filename).href : document.currentScript && document.currentScript.src || new URL("main.js", document.baseURI).href;
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_node_module = require("node:module");
var import_node_url = require("node:url");
const require2 = (0, import_node_module.createRequire)(__import_meta_url || `file://${__filename}`);
const thisDir = (0, import_node_url.fileURLToPath)(new URL(".", __import_meta_url || `file://${__filename}`));
function tryResolvePackage(possiblePaths, lookupPaths) {
  for (const pkg of possiblePaths) {
    try {
      const possiblePath = require2.resolve(`${pkg}/package.json`, lookupPaths?.length ? { paths: lookupPaths } : void 0);
      if ((0, import_node_fs.existsSync)(possiblePath)) {
        return (0, import_node_path.dirname)(possiblePath);
      }
    } catch {
    }
  }
}
__name(tryResolvePackage, "tryResolvePackage");
function scanForPackage(possiblePaths, startDir = thisDir) {
  let curDir = (0, import_node_path.join)(startDir, "../node_modules");
  while (true) {
    for (const pkg of possiblePaths) {
      const possiblePath = (0, import_node_path.join)(curDir, pkg, "package.json");
      try {
        if ((0, import_node_fs.existsSync)(possiblePath) && JSON.parse((0, import_node_fs.readFileSync)(possiblePath, "utf8")).name === pkg.toLowerCase()) {
          return (0, import_node_path.dirname)(possiblePath);
        }
      } catch {
      }
    }
    const parentDir = (0, import_node_path.dirname)(curDir);
    if (parentDir === curDir) {
      break;
    }
    curDir = parentDir;
  }
}
__name(scanForPackage, "scanForPackage");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  scanForPackage,
  tryResolvePackage
});
//# sourceMappingURL=helpers.js.map
