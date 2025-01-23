import debug from "react-native-debug";
const APP_NAME = "deriv-api-ts";
export default class Logger {
    _level;
    _trace;
    _debug;
    _info;
    _warn;
    _error;
    _fatal;
    constructor(prefix) {
        if (prefix) {
            this._level = debug(`${APP_NAME}:LEVEL:${prefix}`);
            this._trace = debug(`${APP_NAME}:TRACE:${prefix}`);
            this._debug = debug(`${APP_NAME}:${prefix}`);
            this._info = debug(`${APP_NAME}:INFO:${prefix}`);
            this._warn = debug(`${APP_NAME}:WARN:${prefix}`);
            this._error = debug(`${APP_NAME}:ERROR:${prefix}`);
            this._fatal = debug(`${APP_NAME}:FATAL:${prefix}`);
        }
        else {
            this._level = debug(`${APP_NAME}:LEVEL`);
            this._trace = debug(`${APP_NAME}:TRACE`);
            this._debug = debug(APP_NAME);
            this._info = debug(`${APP_NAME}:INFO`);
            this._warn = debug(`${APP_NAME}:WARN`);
            this._error = debug(`${APP_NAME}:ERROR`);
            this._fatal = debug(`${APP_NAME}:FATAL`);
        }
        /* eslint-disable no-console */
        this._level.log = console.info.bind(console);
        this._trace.log = console.trace.bind(console);
        this._debug.log = console.debug.bind(console);
        this._info.log = console.info.bind(console);
        this._warn.log = console.warn.bind(console);
        this._error.log = console.error.bind(console);
        this._fatal.log = console.error.bind(console);
        /* eslint-enable no-console */
    }
    get level() {
        return this._level;
    }
    get trace() {
        return this._trace;
    }
    get debug() {
        return this._debug;
    }
    get info() {
        return this._info;
    }
    get warn() {
        return this._warn;
    }
    get error() {
        return this._error;
    }
    get fatal() {
        return this._fatal;
    }
}
