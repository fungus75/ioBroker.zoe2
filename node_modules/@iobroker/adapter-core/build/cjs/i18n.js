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
var i18n_exports = {};
__export(i18n_exports, {
  default: () => i18n_default,
  getTranslatedObject: () => getTranslatedObject,
  init: () => init,
  t: () => t,
  translate: () => translate
});
module.exports = __toCommonJS(i18n_exports);
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
let language = "en";
let words = null;
async function init(rootDir, languageOrAdapter) {
  let adapter;
  if (languageOrAdapter && typeof languageOrAdapter === "object") {
    adapter = languageOrAdapter;
    const systemConfig = await adapter.getForeignObjectAsync("system.config");
    if (systemConfig?.common.language) {
      language = systemConfig?.common.language;
    }
  } else {
    language = languageOrAdapter;
  }
  let files;
  if ((0, import_node_fs.existsSync)((0, import_node_path.join)(rootDir, "i18n"))) {
    files = (0, import_node_fs.readdirSync)((0, import_node_path.join)(rootDir, "i18n"));
  } else if ((0, import_node_fs.existsSync)((0, import_node_path.join)(rootDir, "lib", "i18n"))) {
    rootDir = (0, import_node_path.join)(rootDir, "lib");
    files = (0, import_node_fs.readdirSync)((0, import_node_path.join)(rootDir, "i18n"));
  } else {
    throw new Error(`Cannot find i18n directory in "${(0, import_node_path.join)(rootDir, "i18n")}", "${(0, import_node_path.join)(rootDir, "lib", "i18n")}"`);
  }
  words = {};
  let count = 0;
  files.forEach((file) => {
    if (file.endsWith(".json")) {
      count++;
      const lang = file.split(".")[0];
      const wordsForLanguage = JSON.parse((0, import_node_fs.readFileSync)((0, import_node_path.join)(rootDir, "i18n", file)).toString("utf8"));
      Object.keys(wordsForLanguage).forEach((key) => {
        if (words) {
          if (!words[key]) {
            words[key] = {};
          }
          words[key][lang] = wordsForLanguage[key];
        }
      });
    }
  });
  if (!count) {
    files.forEach((file) => {
      if ((file.match(/^[a-z]{2}$/) || file === "zh-cn") && (0, import_node_fs.statSync)((0, import_node_path.join)(rootDir, "i18n", file)).isDirectory()) {
        if (adapter) {
          adapter.log.warn("Looks like you use old structure of i18n. Please switch to 1i8n/lang.json instead of i18n/lang/translation.json");
        }
        const lang = file;
        if ((0, import_node_fs.existsSync)((0, import_node_path.join)(rootDir, "i18n", lang, "translations.json"))) {
          const wordsForLanguage = JSON.parse((0, import_node_fs.readFileSync)((0, import_node_path.join)(rootDir, "i18n", lang, "translations.json")).toString("utf8"));
          Object.keys(wordsForLanguage).forEach((key) => {
            if (words) {
              if (!words[key]) {
                words[key] = {};
              }
              words[key][lang] = wordsForLanguage[key];
            }
          });
        }
      }
    });
  }
}
__name(init, "init");
function translate(key, ...args) {
  if (!words) {
    throw new Error("i18n not initialized. Please call 'init(__dirname, adapter)' before");
  }
  let text;
  if (!words[key]) {
    text = key;
  } else {
    text = words[key][language] || words[key].en || key;
  }
  if (args.length) {
    for (const arg of args) {
      text = text.replace("%s", arg === null ? "null" : arg.toString());
    }
  }
  return text;
}
__name(translate, "translate");
const t = translate;
function getTranslatedObject(key, ...args) {
  if (!words) {
    throw new Error("i18n not initialized. Please call 'init(__dirname, adapter)' before");
  }
  if (words[key]) {
    const word = words[key];
    if (word.en && word.en.includes("%s")) {
      const result = {};
      Object.keys(word).forEach((lang) => {
        for (const arg of args) {
          result[lang] = word[lang].replace("%s", arg === null ? "null" : arg.toString());
        }
      });
      return result;
    }
    return words[key];
  }
  return {
    en: key
  };
}
__name(getTranslatedObject, "getTranslatedObject");
var i18n_default = {
  init,
  translate,
  getTranslatedObject,
  t
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getTranslatedObject,
  init,
  t,
  translate
});
//# sourceMappingURL=i18n.js.map
