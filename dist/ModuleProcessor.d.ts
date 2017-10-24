import { ConstructedOptions } from './ConstructedOptions';
import { Module } from './Module';
import { LicenseWebpackPluginError } from './LicenseWebpackPluginError';
declare class ModuleProcessor {
    private context;
    private options;
    private errors;
    private modulePrefix;
    private licenseExtractor;
    constructor(context: string, options: ConstructedOptions, errors: LicenseWebpackPluginError[]);
    processFile(filename: string): Promise<string | null>;
    processPackage(packageName: string): Promise<string | null>;
    getPackageInfo(packageName: string): Module;
    private extractPackageName(filename);
    private isFromNodeModules(filename);
}
export { ModuleProcessor };
