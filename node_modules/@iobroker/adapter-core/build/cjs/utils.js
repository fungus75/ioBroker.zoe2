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
var utils_exports = {};
__export(utils_exports, {
  Adapter: () => Adapter,
  adapter: () => adapter,
  controllerDir: () => controllerDir,
  getConfig: () => getConfig
});
module.exports = __toCommonJS(utils_exports);
var __import_meta_url = typeof document === "undefined" ? new (require("url".replace("", ""))).URL("file:" + __filename).href : document.currentScript && document.currentScript.src || new URL("main.js", document.baseURI).href;
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_node_module = require("node:module");
var import_helpers = require("./helpers.js");
const require2 = (0, import_node_module.createRequire)(__import_meta_url || `file://${__filename}`);
function getControllerDir(isInstall) {
  const possibilities = ["iobroker.js-controller", "ioBroker.js-controller"];
  let controllerDir2 = (0, import_helpers.tryResolvePackage)(possibilities);
  if (controllerDir2) {
    return controllerDir2;
  }
  controllerDir2 = (0, import_helpers.scanForPackage)(possibilities);
  if (controllerDir2) {
    return controllerDir2;
  }
  if (!isInstall) {
    console.log("Cannot find js-controller");
    return process.exit(10);
  }
  return process.exit();
}
__name(getControllerDir, "getControllerDir");
const controllerDir = getControllerDir(!!process?.argv?.includes("--install"));
function resolveAdapterConstructor() {
  let adapterPath = (0, import_helpers.tryResolvePackage)(["@iobroker/js-controller-adapter"]);
  if (adapterPath) {
    try {
      const { Adapter: Adapter2 } = require2(adapterPath);
      if (Adapter2) {
        return Adapter2;
      }
    } catch {
    }
  }
  adapterPath = (0, import_helpers.tryResolvePackage)(["@iobroker/js-controller-adapter"], [(0, import_node_path.join)(controllerDir, "node_modules")]);
  if (adapterPath) {
    try {
      const { Adapter: Adapter2 } = require2(adapterPath);
      if (Adapter2) {
        return Adapter2;
      }
    } catch {
    }
  }
  adapterPath = (0, import_node_path.join)(controllerDir, "build/cjs/lib/adapter.js");
  try {
    const Adapter2 = require2(adapterPath);
    if (Adapter2) {
      return Adapter2;
    }
  } catch {
  }
  adapterPath = (0, import_node_path.join)(controllerDir, "build/lib/adapter.js");
  try {
    const Adapter2 = require2(adapterPath);
    if (Adapter2) {
      return Adapter2;
    }
  } catch {
  }
  adapterPath = (0, import_node_path.join)(controllerDir, "lib/adapter.js");
  try {
    const Adapter2 = require2(adapterPath);
    if (Adapter2) {
      return Adapter2;
    }
  } catch {
  }
  throw new Error("Cannot resolve adapter class");
}
__name(resolveAdapterConstructor, "resolveAdapterConstructor");
function getConfig() {
  return JSON.parse((0, import_node_fs.readFileSync)((0, import_node_path.join)(controllerDir, "conf/iobroker.json"), "utf8"));
}
__name(getConfig, "getConfig");
const adapter = resolveAdapterConstructor();
const Adapter = adapter;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Adapter,
  adapter,
  controllerDir,
  getConfig
});
//# sourceMappingURL=utils.js.map
