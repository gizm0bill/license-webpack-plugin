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
var FileUtils_1 = require("./FileUtils");
var LicenseExtractor_1 = require("./LicenseExtractor");
var ModuleProcessor = /** @class */ (function () {
    function ModuleProcessor(context, options, errors) {
        this.context = context;
        this.options = options;
        this.errors = errors;
        this.modulePrefix = path.join(this.context, FileUtils_1.FileUtils.MODULE_DIR);
        this.licenseExtractor = new LicenseExtractor_1.LicenseExtractor(this.context, this.options, this.errors);
    }
    ModuleProcessor.prototype.processFile = function (filename) {
        return __awaiter(this, void 0, void 0, function () {
            var packageName, processedPackage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!filename ||
                            filename.trim() === '' ||
                            !this.isFromNodeModules(filename)) {
                            return [2 /*return*/, Promise.resolve(null)];
                        }
                        packageName = this.extractPackageName(filename);
                        return [4 /*yield*/, this.processPackage(packageName)];
                    case 1:
                        processedPackage = _a.sent();
                        return [2 /*return*/, processedPackage];
                }
            });
        });
    };
    ModuleProcessor.prototype.processPackage = function (packageName) {
        return __awaiter(this, void 0, void 0, function () {
            var isParsed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.licenseExtractor.parsePackage(packageName)];
                    case 1:
                        isParsed = _a.sent();
                        return [2 /*return*/, isParsed ? packageName : null];
                }
            });
        });
    };
    ModuleProcessor.prototype.getPackageInfo = function (packageName) {
        return this.licenseExtractor.getCachedPackage(packageName);
    };
    ModuleProcessor.prototype.extractPackageName = function (filename) {
        var tokens = filename
            .replace(path.join(this.context, FileUtils_1.FileUtils.MODULE_DIR) + path.sep, '')
            .split(path.sep);
        return tokens[0].charAt(0) === '@'
            ? tokens.slice(0, 2).join('/')
            : tokens[0];
    };
    ModuleProcessor.prototype.isFromNodeModules = function (filename) {
        return (!!filename &&
            filename.startsWith(this.modulePrefix) &&
            // files such as node_modules/foo.js are not considered to be from a module inside node_modules
            filename.replace(this.modulePrefix + path.sep, '').indexOf(path.sep) > -1);
    };
    return ModuleProcessor;
}());
exports.ModuleProcessor = ModuleProcessor;
