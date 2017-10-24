"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var request = require("https");
var FileUtils_1 = require("./FileUtils");
var LicenseWebpackPluginError_1 = require("./LicenseWebpackPluginError");
var ErrorMessage_1 = require("./ErrorMessage");
var LicenseExtractor = /** @class */ (function () {
    function LicenseExtractor(context, options, errors) {
        this.context = context;
        this.options = options;
        this.errors = errors;
        this.moduleCache = {};
        this.modulePrefix = path.join(this.context, FileUtils_1.FileUtils.MODULE_DIR);
    }
    // returns true if the package is included as part of license report
    LicenseExtractor.prototype.parsePackage = function (packageName) {
        return __awaiter(this, void 0, void 0, function () {
            var packageJson, licenseName, error, licenseText, moduleCacheEntry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.moduleCache[packageName]) {
                            return [2 /*return*/, Promise.resolve(true)];
                        }
                        packageJson = this.readPackageJson(packageName);
                        licenseName = this.getLicenseName(packageJson);
                        if (licenseName === LicenseExtractor.UNKNOWN_LICENSE &&
                            !this.options.includePackagesWithoutLicense) {
                            return [2 /*return*/, Promise.resolve(false)];
                        }
                        if (licenseName !== LicenseExtractor.UNKNOWN_LICENSE &&
                            !this.options.pattern.test(licenseName)) {
                            return [2 /*return*/, Promise.resolve(false)];
                        }
                        if (licenseName !== LicenseExtractor.UNKNOWN_LICENSE &&
                            this.options.unacceptablePattern &&
                            this.options.unacceptablePattern.test(licenseName)) {
                            error = new LicenseWebpackPluginError_1.LicenseWebpackPluginError(ErrorMessage_1.ErrorMessage.UNNACEPTABLE_LICENSE, packageName, licenseName);
                            if (this.options.abortOnUnacceptableLicense) {
                                throw new LicenseWebpackPluginError_1.LicenseWebpackPluginAbortError(error);
                            }
                            else {
                                this.errors.push(error);
                            }
                        }
                        licenseText = '';
                        return [4 /*yield*/, this.getLicenseText(packageJson, licenseName)
                                .then(function (s) { return (licenseText = s); })
                                .catch(function (reason) { return console.warn(reason); })];
                    case 1:
                        _a.sent();
                        moduleCacheEntry = {
                            packageJson: packageJson,
                            license: {
                                name: licenseName,
                                text: licenseText
                            }
                        };
                        this.moduleCache[packageName] = moduleCacheEntry;
                        return [2 /*return*/, Promise.resolve(true)];
                }
            });
        });
    };
    LicenseExtractor.prototype.getCachedPackage = function (packageName) {
        return this.moduleCache[packageName];
    };
    LicenseExtractor.prototype.getLicenseName = function (packageJson) {
        var overriddenLicense = this.options.licenseTypeOverrides &&
            this.options.licenseTypeOverrides[packageJson.name];
        if (overriddenLicense) {
            return overriddenLicense;
        }
        var license = packageJson.license;
        // add support license like `{type: '...', url: '...'}`
        if (license && license.type) {
            license = license.type;
        }
        // add support licenses like `[{type: '...', url: '...'}]`
        if (!license && packageJson.licenses) {
            var licenses = packageJson.licenses;
            if (Array.isArray(licenses) && licenses[0].type) {
                license = licenses[0].type;
                if (licenses.length > 1) {
                    this.errors.push(new LicenseWebpackPluginError_1.LicenseWebpackPluginError(ErrorMessage_1.ErrorMessage.MULTIPLE_LICENSE_AMBIGUITY, packageJson.name, license));
                }
            }
        }
        if (!license) {
            license = LicenseExtractor.UNKNOWN_LICENSE;
        }
        return license;
    };
    LicenseExtractor.prototype.getLicenseFilename = function (packageJson, licenseName) {
        var filename;
        var packageName = packageJson.name;
        var overrideFile = this.options.licenseFileOverrides &&
            this.options.licenseFileOverrides[packageName];
        if (overrideFile) {
            if (!FileUtils_1.FileUtils.isThere(overrideFile)) {
                this.errors.push(new LicenseWebpackPluginError_1.LicenseWebpackPluginError(ErrorMessage_1.ErrorMessage.NO_LICENSE_OVERRIDE_FILE_FOUND, packageName, overrideFile));
            }
            return overrideFile;
        }
        for (var i = 0; i < this.options.licenseFilenames.length; i = i + 1) {
            var licenseFile = path.join(this.modulePrefix, packageName, this.options.licenseFilenames[i]);
            if (FileUtils_1.FileUtils.isThere(licenseFile)) {
                filename = licenseFile;
                break;
            }
        }
        if (!filename && this.options.licenseTemplateDir) {
            var templateFilename = path.join(this.options.licenseTemplateDir, licenseName + '.txt');
            if (FileUtils_1.FileUtils.isThere(templateFilename)) {
                filename = templateFilename;
            }
        }
        return filename;
    };
    LicenseExtractor.prototype.getLicenseText = function (packageJson, licenseName) {
        return __awaiter(this, void 0, void 0, function () {
            var licenseFilename, licenseUrl_1, licenseFilenames, requestChain_1, getLicenseFromRepo_1;
            return __generator(this, function (_a) {
                if (licenseName === LicenseExtractor.UNKNOWN_LICENSE) {
                    return [2 /*return*/, ''];
                }
                licenseFilename = this.getLicenseFilename(packageJson, licenseName);
                if (!licenseFilename) {
                    this.errors.push(new LicenseWebpackPluginError_1.LicenseWebpackPluginError(ErrorMessage_1.ErrorMessage.NO_LICENSE_FILE, packageJson.name, licenseName));
                    licenseUrl_1 = '';
                    licenseFilenames = [false];
                    requestChain_1 = Promise.resolve();
                    if (packageJson.repository && packageJson.repository.url) {
                        licenseUrl_1 =
                            packageJson.repository.url
                                .replace(/^git\+/, '')
                                .replace(/github\.com/, 'raw.githubusercontent.com')
                                .replace(/\.git$/, '') + '/master/';
                        licenseFilenames = this.options
                            .licenseFilenames.concat([false]);
                    }
                    getLicenseFromRepo_1 = function (fn) {
                        return new Promise(function (resolve, reject) {
                            if (!fn)
                                reject('');
                            request.get(licenseUrl_1 + fn, function (res) {
                                if (res.statusCode !== 200)
                                    resolve(new Error(res.statusCode + ' ' + licenseUrl_1 + fn));
                                else
                                    res.on('data', function (d) { return reject(d.toString()); });
                            });
                        });
                    };
                    licenseFilenames.forEach(function (fn) {
                        requestChain_1 = requestChain_1.then(function () {
                            return (function (fn) { return getLicenseFromRepo_1(fn); })(fn);
                        });
                    });
                    return [2 /*return*/, new Promise(function (resolve) {
                            requestChain_1.catch(function (reason) {
                                resolve(reason);
                            });
                        })];
                }
                return [2 /*return*/, Promise.resolve(fs
                        .readFileSync(licenseFilename, 'utf8')
                        .trim()
                        .replace(/\r\n/g, '\n'))];
            });
        });
    };
    LicenseExtractor.prototype.readPackageJson = function (packageName) {
        var pathName = path.join(this.modulePrefix, packageName, 'package.json');
        var file = fs.readFileSync(pathName, 'utf8');
        return JSON.parse(file);
    };
    LicenseExtractor.UNKNOWN_LICENSE = 'Unknown license';
    return LicenseExtractor;
}());
exports.LicenseExtractor = LicenseExtractor;
