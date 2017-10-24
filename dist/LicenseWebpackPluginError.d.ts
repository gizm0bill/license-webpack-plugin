import { ErrorMessage } from './ErrorMessage';
declare class LicenseWebpackPluginError extends Error {
    constructor(message: ErrorMessage, ...params: string[]);
}
declare class LicenseWebpackPluginAbortError extends Error {
    constructor(error: Error | ErrorMessage, ...params: string[]);
}
export { LicenseWebpackPluginError, LicenseWebpackPluginAbortError };
