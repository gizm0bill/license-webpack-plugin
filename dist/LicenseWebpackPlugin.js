"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var ejs = require("ejs");
var webpack_sources_1 = require("webpack-sources");
var LicenseWebpackPluginError_1 = require("./LicenseWebpackPluginError");
var ErrorMessage_1 = require("./ErrorMessage");
var FileUtils_1 = require("./FileUtils");
var ModuleProcessor_1 = require("./ModuleProcessor");
var LicenseWebpackPlugin = /** @class */ (function () {
    function LicenseWebpackPlugin(options) {
        this.errors = [];
        if (!options || !options.pattern || !(options.pattern instanceof RegExp)) {
            throw new LicenseWebpackPluginError_1.LicenseWebpackPluginError(ErrorMessage_1.ErrorMessage.NO_PATTERN);
        }
        if (options.unacceptablePattern !== undefined &&
            options.unacceptablePattern !== null &&
            !(options.unacceptablePattern instanceof RegExp)) {
            throw new LicenseWebpackPluginError_1.LicenseWebpackPluginError(ErrorMessage_1.ErrorMessage.UNACCEPTABLE_PATTERN_NOT_REGEX);
        }
        this.options = __assign({
            licenseFilenames: [
                'LICENSE',
                'LICENSE.md',
                'LICENSE.txt',
                'license',
                'license.md',
                'license.txt'
            ],
            perChunkOutput: true,
            outputTemplate: path.resolve(__dirname, '../output.template.ejs'),
            outputFilename: options.perChunkOutput === false
                ? 'licenses.txt'
                : '[name].licenses.txt',
            suppressErrors: false,
            includePackagesWithoutLicense: false,
            abortOnUnacceptableLicense: false,
            addBanner: false,
            bannerTemplate: '/*! 3rd party license information is available at <%- filename %> */',
            includedChunks: [],
            excludedChunks: [],
            additionalPackages: []
        }, options);
        if (!FileUtils_1.FileUtils.isThere(this.options.outputTemplate)) {
            throw new LicenseWebpackPluginError_1.LicenseWebpackPluginError(ErrorMessage_1.ErrorMessage.OUTPUT_TEMPLATE_NOT_EXIST, this.options.outputTemplate);
        }
        var templateString = fs.readFileSync(this.options.outputTemplate, 'utf8');
        this.template = ejs.compile(templateString);
    }
    LicenseWebpackPlugin.prototype.apply = function (compiler) {
        var _this = this;
        this.buildRoot = this.findBuildRoot(compiler.context);
        this.moduleProcessor = new ModuleProcessor_1.ModuleProcessor(this.buildRoot, this.options, this.errors);
        compiler.plugin('emit', function (compilation, callback) {
            var totalChunkModuleMap = {};
            var outerPromises = [];
            compilation.chunks.forEach(function (chunk) {
                var promises = [];
                if (_this.options.excludedChunks.indexOf(chunk.name) > -1) {
                    return;
                }
                if (_this.options.includedChunks.length > 0 &&
                    _this.options.includedChunks.indexOf(chunk.name) === -1) {
                    return;
                }
                var outputPath = compilation.getPath(_this.options.outputFilename, _this.options.perChunkOutput
                    ? {
                        chunk: chunk
                    }
                    : compilation);
                var chunkModuleMap = {};
                var moduleCallback = function (chunkModule) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.moduleProcessor
                                    .processFile(chunkModule.resource ||
                                    (chunkModule.rootModule && chunkModule.rootModule.resource))
                                    .then(function (pn) {
                                    if (!pn)
                                        return;
                                    chunkModuleMap[pn] = true;
                                    totalChunkModuleMap[pn] = true;
                                })
                                    .catch(function (reason) {
                                    // TODO: fix
                                    console.error('processFile ' + chunkModule.resource + ' failed:', reason);
                                    if (reason instanceof Error)
                                        throw Error;
                                })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                // scan all files used in compilation for this chunk
                if (typeof chunk.forEachModule === 'function') {
                    chunk.forEachModule(function (m) { return promises.push(moduleCallback(m)); });
                }
                else {
                    chunk.modules.forEach(function (m) { return promises.push(moduleCallback(m)); }); // chunk.modules was deprecated in webpack v3
                }
                // TODO
                _this.options.additionalPackages.forEach(function (packageName) {
                    promises.push(_this.moduleProcessor
                        .processPackage(packageName)
                        .then(function (pn) {
                        if (!pn)
                            return;
                        chunkModuleMap[pn] = true;
                        totalChunkModuleMap[pn] = true;
                    })
                        .catch(function (reason) {
                        return console.warn('processPackage ' + packageName + ' failed:', reason);
                    }));
                });
                outerPromises.push(Promise.all(promises)
                    .then(function () {
                    console.log('=========');
                    var renderedFile = _this.renderLicenseFile(Object.keys(chunkModuleMap));
                    // Only write license file if there is something to write.
                    if (renderedFile.trim() !== '') {
                        if (_this.options.addBanner) {
                            chunk.files
                                .filter(function (file) { return /\.js$/.test(file); })
                                .forEach(function (file) {
                                compilation.assets[file] = new webpack_sources_1.ConcatSource(ejs.render(_this.options.bannerTemplate, {
                                    filename: outputPath
                                }), '\n', compilation.assets[file]);
                            });
                        }
                        if (_this.options.perChunkOutput) {
                            compilation.assets[outputPath] = new webpack_sources_1.RawSource(renderedFile);
                        }
                    }
                })
                    .catch(function (reason) {
                    if (reason instanceof Error)
                        throw Error;
                }));
            });
            Promise.all(outerPromises)
                .then(function () {
                if (!_this.options.perChunkOutput) {
                    // produce master licenses file
                    var outputPath = compilation.getPath(_this.options.outputFilename, compilation);
                    var renderedFile = _this.renderLicenseFile(Object.keys(totalChunkModuleMap));
                    if (renderedFile.trim() !== '') {
                        compilation.assets[outputPath] = new webpack_sources_1.RawSource(renderedFile);
                    }
                }
                if (!_this.options.suppressErrors) {
                    _this.errors.forEach(function (error) { return console.error(error.message); });
                }
                callback();
            })
                .catch(function (reason) {
                console.warn(reason);
                if (reason instanceof Error) {
                    compilation.errors.push(reason);
                    callback();
                }
            });
        });
    };
    LicenseWebpackPlugin.prototype.renderLicenseFile = function (packageNames) {
        var packages = packageNames.map(this.moduleProcessor.getPackageInfo, this.moduleProcessor);
        return this.template({ packages: packages });
    };
    LicenseWebpackPlugin.prototype.findBuildRoot = function (context) {
        var buildRoot = context;
        var lastPathSepIndex;
        if (buildRoot.indexOf(FileUtils_1.FileUtils.MODULE_DIR) > -1) {
            buildRoot = buildRoot.substring(0, buildRoot.indexOf(FileUtils_1.FileUtils.MODULE_DIR) - 1);
        }
        else {
            var oldBuildRoot = null;
            while (!FileUtils_1.FileUtils.isThere(path.join(buildRoot, FileUtils_1.FileUtils.MODULE_DIR))) {
                lastPathSepIndex = buildRoot.lastIndexOf(path.sep);
                if (lastPathSepIndex === -1 || oldBuildRoot === buildRoot) {
                    throw new LicenseWebpackPluginError_1.LicenseWebpackPluginError(ErrorMessage_1.ErrorMessage.NO_PROJECT_ROOT);
                }
                oldBuildRoot = buildRoot;
                buildRoot = buildRoot.substring(0, buildRoot.lastIndexOf(path.sep));
            }
        }
        return buildRoot;
    };
    return LicenseWebpackPlugin;
}());
exports.LicenseWebpackPlugin = LicenseWebpackPlugin;
