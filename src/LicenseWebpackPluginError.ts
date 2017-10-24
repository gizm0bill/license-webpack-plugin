import { ErrorMessage } from './ErrorMessage';

class LicenseWebpackPluginError extends Error {
  constructor(message: ErrorMessage, ...params: string[]) {
    let replacedMessage: string = 'license-webpack-plugin: ';
    replacedMessage += message
      .replace('{0}', params[0])
      .replace('{1}', params[1]);
    super(replacedMessage);
  }
}

class LicenseWebpackPluginAbortError extends Error {
  constructor(error: Error | ErrorMessage, ...params: string[]) {
    if (error instanceof Error) super(error.message);
    else super(new LicenseWebpackPluginError(error, ...params).message);
    Object.setPrototypeOf(this, LicenseWebpackPluginAbortError.prototype);
    return this;
  }
}

export { LicenseWebpackPluginError, LicenseWebpackPluginAbortError };
