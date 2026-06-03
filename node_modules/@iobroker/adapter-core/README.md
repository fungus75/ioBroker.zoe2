# Adapter-Core

Core module to be used in ioBroker adapters. Acts as the bridge to js-controller.

This replaces the `utils.js` included in the ioBroker template adapter.

## Usage

1. Add this as a dependency: `npm i @iobroker/adapter-core`
2. Replace
    ```js
    const utils = require(__dirname + '/lib/utils');
    ```
    with
    ```js
    const utils = require('@iobroker/adapter-core');
    ```
3. Create an adapter instance as usual:
    ```js
    // old style
    const adapter = utils.adapter(/* options */);
    // new style (classes). See https://github.com/ioBroker/ioBroker.template/ for a more detailed usage
    class MyAdapter extends utils.Adapter {...}
    ```

## Utility methods

Compared to the old `utils.js`, some utility methods were added.

### `getAbsoluteDefaultDataDir`

```js
const dataDir = utils.getAbsoluteDefaultDataDir();
```

This returns the absolute path of the data directory for the current host. On linux, this is usually `/opt/iobroker/iobroker-data`

### `getAbsoluteInstanceDataDir`

```js
// old style
const instanceDataDir = utils.getAbsoluteInstanceDataDir(adapter);
// new style (classes)
const instanceDataDir = utils.getAbsoluteInstanceDataDir(this);
```

Returns the absolute path of the data directory for the current adapter instance.
On linux, this is usually `/opt/iobroker/iobroker-data/<adapterName>.<instanceNr>`

### `EXIT_CODES`

```js
adapter.terminate('for some reason', utils.EXIT_CODES.ADAPTER_REQUESTED_TERMINATION);
```

Use standardized exit codes if your adapter needs to terminate.

### `commonTools`

A collection of various utility methods and modules from JS-Controller. Prefer this over trying to find `lib/tools.js` and similar internal modules from the controller yourself!

Currently, the following **methods** are available:

-   `commonTools.pattern2RegEx` - Converts a pattern to match object IDs into a RegEx string that can be used in `new RegExp(...)`
-   `commonTools.getAdapterDir` - Finds the adapter directory of a given adapter
-   `commonTools.getInstalledInfo` - Get a list of all installed adapters and controller version on this host
-   `commonTools.getLocalAddress` - Get the localhost (IPv6 or IPv4) address according to the ioBroker config
-   `commonTools.getListenAllAddress` - Get the "listen all" (IPv6 or IPv4) address according to the ioBroker config
-   `commonTools.isLocalAddress` - Check if given IPv4 or IPv6 ip address corresponds to localhost
-   `commonTools.isListenAllAddress` - Check if given IPv4 or IPv6 ip address corresponds to "listen all" address
-   `commonTools.ensureDNSOrder` - Ensure that DNS resolution is performed according to ioBroker config

And the following **modules** are exposed:

-   `commonTools.password` - Previously exposed as `lib/password.js` in JS-Controller.
-   `commonTools.session` - Previously exposed as `lib/session.js` in JS-Controller.
-   `commonTools.zipFiles` - Previously exposed as `lib/zipFiles.js` in JS-Controller.
-   `commonTools.isDocker` - Checks if we are running inside a docker container

Note that `commonTools.letsEncrypt` is not available anymore as the next controller won't support it (use `@iobroker/webserver` instead).

## I18n

Developers can use internationalisation in backend.

For that call

```javascript
const I18n = require('@iobroker/adapter-core').I18n;

// later in "ready" method
await I18n.init(__dirname, adapter);
// If you use class syntax, you can use `this` instead of `adapter`
await I18n.init(__dirname, this);
// You can provide the language directly
await I18n.init(__dirname, 'de');
```

and then in code

```javascript
console.log(I18n.translate('text to translate %s', 'argument1'));

// Or you can use short form
console.log(I18n.t('text to translate %s', 'argument1'));

// or to get the ioBroker.Translated object
console.log(JSON.stringify(I18n.getTranslatedObject('text to translate %s and %s', 'argument1', 'argument2')));
```

You can place your `i18n` folder in root of adapter or in `lib` folder. If your `i18n` files are in `lib` directory, so call the `init` function like this:

```javascript
const { join } = require('node:path');
const I18n = require('@iobroker/adapter-core').I18n;

await I18n.init(join(__dirname, 'lib'), adapter);
```

Expected structure of `i18n` directory

```
+ i18n
  - de.json
  - en.json
  - es.json
  - fr.json
  - it.json
  - nl.json
  - pl.json
  - pt.json
  - ru.json
  - uk.json
  - zh-cn.json
```

And an example of i18n files could be found [here](test/i18n/de.json)

## Automatic backup of data files

ioBroker has the ability to include files written by adapters in its backups. To enable that, you need to add the following to `io-package.json`:

```json5
{
    // ...
    "common": {
        // ...
        "dataFolder": "path/where/your/files/are"
    }
}
```

This path is relative to the path returned by `getAbsoluteDefaultDataDir()`. The placeholder `%INSTANCE%` is automatically replaced by the instance number of each adapter, for example `"dataFolder": "my-adapter.%INSTANCE%"`.

## OAuth2 token refresher
To keep the OAuth2 access token up to date, you can use the `TokenRefresher` class and do not forget to include `axios` in your adapter dependencies (in `package.json`).

```Typescript
import { TokenRefresher } from '@iobroker/adapter-core';

export class YourAdapter extends Adapter {
    private tokenWorker?: TokenRefresher;

    // It is important to call this method in the `onReady` method of your adapter and not in the constructor.
    async onReady(): Promise<void> {
        // Not in constructor, but in onReady
        this.tokenWorker = new TokenRefresher(this, 'yourService');
        // Your other initialization code...

        // Then later in code, you can get the access token like this:
        try {
            const accessToken = await this.tokenWorker.getAccessToken();
            this.log.info(`Spotify OAuth2 Token Refresher is ready: ${accessToken}`);
        } catch (error) {
            this.log.error(`Error initializing Spotify OAuth2 Token Refresher: ${error}`);
        }
    }
    
    onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        // It detects `adapterName.X.oauth2Tokens` or similar
        this.tokenWorker?.onStateChange(id, state);
        // Your other state change code...
    }
    
    onUnload(callback: () => void): void {
        this.tokenWorker?.destroy();
        // Your other unload code...
        callback();
    }
}
```

Important to use OAuth2 infrastructure in your adapter [contact](mailto:info@iobroker.net) the ioBroker team so we can implement a cloud code for https://oauth2.iobroker.in/YOUR_SERVICE_NAME.
This will allow you to use the OAuth2 infrastructure in your adapter without having to implement it yourself.

Here is a description of how to implement OAuth2 in your adapter: https://github.com/ioBroker/ioBroker.admin/blob/master/packages/jsonConfig/OAUTH2.md

## Tips while working on this module

-   `npm run build` creates a clean rebuild of the module. This is done automatically before every build;
-   `npm run lint` checks for linting errors;
-   `npm run watch` creates an initial build and then incrementally compiles the changes while working.

## Errors in the definitions?

If you find errors in the definitions, e.g., function calls that should be allowed but aren't, please open an issue here or over at https://github.com/DefinitelyTyped/DefinitelyTyped and make sure to mention @AlCalzone.

## Changelog

<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->
### 3.3.2 (2025-08-18)

- (@jogibear9988) Fixed ESM export of TokenRefresher

### 3.3.1 (2025-08-01)

- (@GermanBluefox) Changed getAbsoluteInstanceDataDir to accept the namespace as argument

### 3.3.0 (2025-08-01)

- (@GermanBluefox) Added the token refresher class

### 3.2.3 (2024-12-04)

- (@foxriver76) loosen `@iobroker/types` peer dependency

### 3.2.2 (2024-10-02)

- (Apollon77) Fix types

### 3.2.1 (2024-09-28)

-   (@foxriver76) updated types
-   (@GermanBluefox) Added i18n module
-   (@GermanBluefox) Migrated eslint to iobroker.eslint-config

### 3.1.6 (2024-06-04)

-   (foxriver76) improve exported types

### 3.1.5 (2024-06-03)

-   (foxriver76) provide up-to-date types

### 3.1.4 (2024-04-19)

-   (foxriver76) fixes for adapters which are written in ESM

### 3.1.3 (2024-04-19)

-   (foxriver76) fixes for cjs adapters

### 3.1.2 (2024-04-19)

-   (foxriver76) fixes for adapters which are written in ESM

### 3.1.1 (2024-04-19)

-   (foxriver76) removed letsEncrypt support as next controller won't support it anymore (use `@iobroker/webserver` instead)

### 3.1.0 (2024-04-16)

-   (foxriver76) provide `esm` and `cjs` exports

### 3.0.6 (2024-03-24)

-   (foxriver76) hotfix previous release: compatibility with next controller with new esm/cjs exports

### 3.0.5 (2024-03-24)

-   (foxriver76) compatibility with next controller with new esm/cjs exports

### 3.0.4 (2023-10-12)

-   (foxriver76) ensure that utility methods work with the returned adapter instance on type level

### 3.0.3 (2023-07-30)

-   (foxriver76) upgrade to a new version of types package

### 3.0.2 (2023-07-30)

-   (foxriver76) fix require of `@iobroker/types` in built module

### 3.0.1 (2023-07-29)

-   (foxriver76) remove non-existing webserver from tools

### 3.0.0 (2023-07-28)

-   (foxriver76) port from `@types/iobroker` to `@iobroker/types`
-   (foxriver76) export dns resolution methods
-   **BREAKING:** requires `npm` v7 or newer and/or Node.js 16 or newer

### 2.6.8 (2023-03-24)

-   (Apollon77) Expose more JS-Controller internals under the `commonTools` export

### 2.6.7 (2022-10-08)

-   (Apollon77) Expose more JS-Controller internals under the `commonTools` export

### 2.6.6 (2022-09-13)

-   (AlCalzone) Expose more JS-Controller internals under the `commonTools` export

### 2.6.2 (2022-09-07)

-   (AlCalzone) Fix: Restore compatibility with JS-Controller < 4.1

### 2.6.1 (2022-09-06)

-   (AlCalzone) Fix: detecting JS-Controller now finds the correct directory and not a subdirectory.

### 2.6.0 (2022-02-20)

-   (AlCalzone) Updated core declarations to `v4.0.1` for support with JS-Controller 4.x

### 2.5.1 (2021-07-22)

-   (AlCalzone) Updated core declarations to `v3.3.4`.

### 2.5.0 (2021-05-19)

-   (AlCalzone) Added the fallback solution to detect js-controller if require.resolve fails in dev situations with symlinks
-   (AlCalzone) Use release-script for releases
-   (AlCalzone) Updated core declarations to `v3.3.0` to be up to date with JS-Controller 3.3.x.

### v2.4.0 (2020-05-03)

-   (AlCalzone) Updated core declarations to v3.0.6.
-   (AlCalzone) Expose the predefined collection of adapter exit codes as `utils.EXIT_CODES`

### v2.3.1 (2020-04-17)

-   (AlCalzone) Updated core declarations to v3.0.4.

### v2.3.0 (2020-04-15)

-   (AlCalzone) Updated core declarations to v3.0.2. This includes support for new methods in JS-Controller 3.0

### v2.2.1 (2020-01-27)

-   (AlCalzone) Included the typings for the objects and states cache in the adapter class

### v2.0.0 (2019-12-27)

-   (AlCalzone) Updated core declarations to v2.0.0. This removes access to `adapter.objects` and `adapter.states`. You must use the new methods `adapter.getObjectView` and `adapter.getObjectList` instead of their counterparts from `objects`.

### v1.0.3 (2019-01-06)

-   (AlCalzone) Updated core declarations
-   (AlCalzone) Fix included declarations to allow creating adapter instances with `new`.

### v1.0.0 (2018-27-11)

-   (AlCalzone) Initial version

## MIT License

Copyright (c) 2018-2025 AlCalzone

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
