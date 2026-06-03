"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var controllerTools_exports = {};
__export(controllerTools_exports, {
  commonTools: () => commonTools,
  controllerCommonModulesInternal: () => controllerCommonModulesInternal,
  controllerToolsInternal: () => controllerToolsInternal,
  resolveNamedModule: () => resolveNamedModule
});
module.exports = __toCommonJS(controllerTools_exports);
var __import_meta_url = typeof document === "undefined" ? new (require("url".replace("", ""))).URL("file:" + __filename).href : document.currentScript && document.currentScript.src || new URL("main.js", document.baseURI).href;
var import_node_path = require("node:path");
var import_node_module = require("node:module");
var import_helpers = require("./helpers.js");
var utils = __toESM(require("./utils.js"));
const require2 = (0, import_node_module.createRequire)(__import_meta_url || `file://${__filename}`);
let controllerCommonModulesInternal;
function resolveControllerTools() {
  let importPath = (0, import_helpers.tryResolvePackage)(["@iobroker/js-controller-common"]);
  if (importPath) {
    try {
      controllerCommonModulesInternal = require2(importPath);
      const { tools } = controllerCommonModulesInternal;
      if (tools) {
        return tools;
      }
    } catch {
    }
  }
  importPath = (0, import_helpers.tryResolvePackage)(["@iobroker/js-controller-common"], [(0, import_node_path.join)(utils.controllerDir, "node_modules")]);
  if (importPath) {
    try {
      controllerCommonModulesInternal = require2(importPath);
      const { tools } = controllerCommonModulesInternal;
      if (tools) {
        return tools;
      }
    } catch {
    }
  }
  importPath = (0, import_node_path.join)(utils.controllerDir, "lib");
  try {
    const tools = require2((0, import_node_path.join)(importPath, "tools"));
    if (tools) {
      return tools;
    }
  } catch {
  }
  throw new Error("Cannot resolve tools module");
}
__name(resolveControllerTools, "resolveControllerTools");
const controllerToolsInternal = resolveControllerTools();
function resolveNamedModule(name, exportName = name) {
  if (controllerCommonModulesInternal?.[exportName]) {
    return controllerCommonModulesInternal[exportName];
  }
  const importPaths = [
    // Attempt 1: JS-Controller 6+
    (0, import_node_path.join)(utils.controllerDir, "build/cjs/lib", name),
    // Attempt 2: JS-Controller 4.1+
    (0, import_node_path.join)(utils.controllerDir, "build/lib", name),
    // Attempt 3: JS-Controller <= 4.0
    (0, import_node_path.join)(utils.controllerDir, "lib", name)
  ];
  for (const importPath of importPaths) {
    try {
      const module2 = require2(importPath);
      if (module2) {
        return module2;
      }
    } catch {
    }
  }
  throw new Error(`Cannot resolve JS-Controller module ${name}.js`);
}
__name(resolveNamedModule, "resolveNamedModule");
function pattern2RegEx(pattern) {
  return controllerToolsInternal.pattern2RegEx(pattern);
}
__name(pattern2RegEx, "pattern2RegEx");
function getAdapterDir(adapter) {
  return controllerToolsInternal.getAdapterDir(adapter);
}
__name(getAdapterDir, "getAdapterDir");
function getInstalledInfo(hostJsControllerVersion) {
  return controllerToolsInternal.getInstalledInfo(hostJsControllerVersion);
}
__name(getInstalledInfo, "getInstalledInfo");
function isDocker() {
  return controllerToolsInternal.isDocker();
}
__name(isDocker, "isDocker");
function isLocalAddress(ip) {
  return controllerToolsInternal.isLocalAddress(ip);
}
__name(isLocalAddress, "isLocalAddress");
function isListenAllAddress(ip) {
  return controllerToolsInternal.isListenAllAddress(ip);
}
__name(isListenAllAddress, "isListenAllAddress");
function getLocalAddress() {
  return controllerToolsInternal.getLocalAddress();
}
__name(getLocalAddress, "getLocalAddress");
function getListenAllAddress() {
  return controllerToolsInternal.getListenAllAddress();
}
__name(getListenAllAddress, "getListenAllAddress");
const commonTools = {
  pattern2RegEx,
  getAdapterDir,
  getInstalledInfo,
  isDocker,
  getLocalAddress,
  getListenAllAddress,
  isLocalAddress,
  isListenAllAddress,
  // TODO: Add more methods from lib/tools.js as needed
  password: resolveNamedModule("password"),
  session: resolveNamedModule("session"),
  zipFiles: resolveNamedModule("zipFiles")
  // TODO: expose more (internal) controller modules as needed
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  commonTools,
  controllerCommonModulesInternal,
  controllerToolsInternal,
  resolveNamedModule
});
//# sourceMappingURL=controllerTools.js.map
