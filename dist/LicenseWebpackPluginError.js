"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var LicenseWebpackPluginError = /** @class */ (function (_super) {
    __extends(LicenseWebpackPluginError, _super);
    function LicenseWebpackPluginError(message) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var _this = this;
        var replacedMessage = 'license-webpack-plugin: ';
        replacedMessage += message
            .replace('{0}', params[0])
            .replace('{1}', params[1]);
        _this = _super.call(this, replacedMessage) || this;
        return _this;
    }
    return LicenseWebpackPluginError;
}(Error));
exports.LicenseWebpackPluginError = LicenseWebpackPluginError;
var LicenseWebpackPluginAbortError = /** @class */ (function (_super) {
    __extends(LicenseWebpackPluginAbortError, _super);
    function LicenseWebpackPluginAbortError(error) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var _this = this;
        if (error instanceof Error)
            _this = _super.call(this, error.message) || this;
        else
            _this = _super.call(this, new (LicenseWebpackPluginError.bind.apply(LicenseWebpackPluginError, [void 0, error].concat(params)))().message) || this;
        Object.setPrototypeOf(_this, LicenseWebpackPluginAbortError.prototype);
        return _this;
    }
    return LicenseWebpackPluginAbortError;
}(Error));
exports.LicenseWebpackPluginAbortError = LicenseWebpackPluginAbortError;
