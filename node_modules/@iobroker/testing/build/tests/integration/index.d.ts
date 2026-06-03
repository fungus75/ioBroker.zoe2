/// <reference types="iobroker" />
/// <reference types="mocha" />
import { TestHarness } from "./lib/harness";
export interface TestAdapterOptions {
    allowedExitCodes?: (number | string)[];
    /** The loglevel to use for DB and adapter related logs */
    loglevel?: ioBroker.LogLevel;
    /** How long to wait before the adapter startup is considered successful */
    waitBeforeStartupSuccess?: number;
    /**
     * Which JS-Controller version or dist-tag should be used for the tests. Default: dev
     * This should only be changed during active development.
     */
    controllerVersion?: string;
    /** Allows you to define additional tests */
    defineAdditionalTests?: (args: TestContext) => void;
}
export interface TestSuiteFn {
    (name: string, fn: (getHarness: () => TestHarness) => void): void;
}
export interface TestSuite extends TestSuiteFn {
    /** Only runs the tests inside this `suite` for the current file */
    only: TestSuiteFn;
    /** Skips running the tests inside this `suite` for the current file */
    skip: TestSuiteFn;
}
export interface TestContext {
    /**
     * Defines a test suite. At the start of each suite, the adapter will be started with a fresh environment.
     * To define tests in each suite, use describe and it as usual.
     *
     * Each suite has its own test harness, which can be retrieved using the function that is passed to the suite callback.
     */
    suite: TestSuite;
    describe: Mocha.SuiteFunction;
    it: Mocha.TestFunction;
}
export declare function testAdapter(adapterDir: string, options?: TestAdapterOptions): void;
