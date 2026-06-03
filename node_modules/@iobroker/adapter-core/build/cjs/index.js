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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var index_exports = {};
__export(index_exports, {
  EXIT_CODES: () => EXIT_CODES,
  I18n: () => I18n,
  TokenRefresher: () => TokenRefresher,
  commonTools: () => import_controllerTools2.commonTools,
  getAbsoluteDefaultDataDir: () => getAbsoluteDefaultDataDir,
  getAbsoluteInstanceDataDir: () => getAbsoluteInstanceDataDir
});
module.exports = __toCommonJS(index_exports);
var import_node_path = require("node:path");
var import_controllerTools = require("./controllerTools.js");
var utils = __toESM(require("./utils.js"));
var import_types = require("@iobroker/types");
var import_controllerTools2 = require("./controllerTools.js");
__reExport(index_exports, require("./utils.js"), module.exports);
var I18n = __toESM(require("./i18n.js"));
var TokenRefresher = __toESM(require("./TokenRefresher.js"));
function getAbsoluteDefaultDataDir() {
  return (0, import_node_path.join)(utils.controllerDir, import_controllerTools.controllerToolsInternal.getDefaultDataDir());
}
__name(getAbsoluteDefaultDataDir, "getAbsoluteDefaultDataDir");
function getAbsoluteInstanceDataDir(adapterObjectOrNamespace) {
  return (0, import_node_path.join)(getAbsoluteDefaultDataDir(), typeof adapterObjectOrNamespace === "string" ? adapterObjectOrNamespace : adapterObjectOrNamespace.namespace);
}
__name(getAbsoluteInstanceDataDir, "getAbsoluteInstanceDataDir");
const EXIT_CODES = Object.freeze({
  // Create a shallow copy so compact adapters cannot overwrite the dict in js-controller
  ...(0, import_controllerTools.resolveNamedModule)("exitCodes", "EXIT_CODES")
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EXIT_CODES,
  I18n,
  TokenRefresher,
  commonTools,
  getAbsoluteDefaultDataDir,
  getAbsoluteInstanceDataDir,
  ...require("./utils.js")
});
//# sourceMappingURL=index.js.map
