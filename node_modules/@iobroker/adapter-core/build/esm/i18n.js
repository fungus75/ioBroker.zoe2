import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
let language = 'en';
let words = null;
/**
 * Init internationalization
 *
 * @param rootDir The path, where i18n directory is located
 * @param languageOrAdapter The adapter instance or the language to use
 */
export async function init(rootDir, languageOrAdapter) {
    let adapter;
    if (languageOrAdapter && typeof languageOrAdapter === 'object') {
        adapter = languageOrAdapter;
        const systemConfig = await adapter.getForeignObjectAsync('system.config');
        if (systemConfig?.common.language) {
            language = systemConfig?.common.language;
        }
    }
    else {
        language = languageOrAdapter;
    }
    let files;
    if (existsSync(join(rootDir, 'i18n'))) {
        files = readdirSync(join(rootDir, 'i18n'));
    }
    else if (existsSync(join(rootDir, 'lib', 'i18n'))) {
        // if iobroker.adapter folder and in it exists lib/i18n
        rootDir = join(rootDir, 'lib');
        files = readdirSync(join(rootDir, 'i18n'));
    }
    else {
        throw new Error(`Cannot find i18n directory in "${join(rootDir, 'i18n')}", "${join(rootDir, 'lib', 'i18n')}"`);
    }
    words = {};
    let count = 0;
    files.forEach((file) => {
        if (file.endsWith('.json')) {
            count++;
            const lang = file.split('.')[0];
            const wordsForLanguage = JSON.parse(readFileSync(join(rootDir, 'i18n', file)).toString('utf8'));
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
        // may be it is an old structure: i18n/lang/translation.json
        files.forEach((file) => {
            if ((file.match(/^[a-z]{2}$/) || file === 'zh-cn') && statSync(join(rootDir, 'i18n', file)).isDirectory()) {
                if (adapter) {
                    adapter.log.warn('Looks like you use old structure of i18n. ' +
                        'Please switch to 1i8n/lang.json instead of i18n/lang/translation.json');
                }
                const lang = file;
                if (existsSync(join(rootDir, 'i18n', lang, 'translations.json'))) {
                    const wordsForLanguage = JSON.parse(readFileSync(join(rootDir, 'i18n', lang, 'translations.json')).toString('utf8'));
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
/**
 * Get translation as one string
 *
 * @param key Word to translate
 * @param args Optional parameters to replace %s
 */
export function translate(key, ...args) {
    if (!words) {
        throw new Error("i18n not initialized. Please call 'init(__dirname, adapter)' before");
    }
    let text;
    if (!words[key]) {
        text = key;
    }
    else {
        text = words[key][language] || words[key].en || key;
    }
    if (args.length) {
        for (const arg of args) {
            text = text.replace('%s', arg === null ? 'null' : arg.toString());
        }
    }
    return text;
}
/** Alias shortcut for translate function */
export const t = translate;
/**
 * Get translation as ioBroker.Translated object
 *
 * @param key Word to translate
 * @param args Optional parameters to replace %s
 */
export function getTranslatedObject(key, ...args) {
    if (!words) {
        throw new Error("i18n not initialized. Please call 'init(__dirname, adapter)' before");
    }
    if (words[key]) {
        const word = words[key];
        if (word.en && word.en.includes('%s')) {
            const result = {};
            Object.keys(word).forEach((lang) => {
                for (const arg of args) {
                    result[lang] = word[lang].replace('%s', arg === null ? 'null' : arg.toString());
                }
            });
            return result;
        }
        return words[key];
    }
    return {
        en: key,
    };
}
export default {
    init,
    translate,
    getTranslatedObject,
    t,
};
