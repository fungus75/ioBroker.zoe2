/**
 * Init internationalization
 *
 * @param rootDir The path, where i18n directory is located
 * @param languageOrAdapter The adapter instance or the language to use
 */
export declare function init(rootDir: string, languageOrAdapter: ioBroker.Adapter | ioBroker.Languages): Promise<void>;
/**
 * Get translation as one string
 *
 * @param key Word to translate
 * @param args Optional parameters to replace %s
 */
export declare function translate(key: string, ...args: (string | number | boolean | null)[]): string;
/** Alias shortcut for translate function */
export declare const t: typeof translate;
/**
 * Get translation as ioBroker.Translated object
 *
 * @param key Word to translate
 * @param args Optional parameters to replace %s
 */
export declare function getTranslatedObject(key: string, ...args: (string | number | boolean | null)[]): ioBroker.Translated;
declare const _default: {
    init: typeof init;
    translate: typeof translate;
    getTranslatedObject: typeof getTranslatedObject;
    t: typeof translate;
};
export default _default;
