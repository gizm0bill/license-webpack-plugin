import * as path from 'path';
import * as fs from 'fs';
import * as request from 'https';
import { FileUtils } from './FileUtils';
import { ConstructedOptions } from './ConstructedOptions';
import { Module } from './Module';
import { ModuleCache } from './ModuleCache';
import { LicenseWebpackPluginError } from './LicenseWebpackPluginError';
import { ErrorMessage } from './ErrorMessage';

class LicenseExtractor {
  static UNKNOWN_LICENSE: string = 'Unknown license';
  private modulePrefix: string;
  private moduleCache: ModuleCache = {};

  constructor(
    private context: string,
    private options: ConstructedOptions,
    private errors: LicenseWebpackPluginError[]
  ) {
    this.modulePrefix = path.join(this.context, FileUtils.MODULE_DIR);
  }

  // returns true if the package is included as part of license report
  async parsePackage(packageName: string): Promise<boolean> {
    if (this.moduleCache[packageName]) {
      return true;
    }

    const packageJson = this.readPackageJson(packageName);
    const licenseName = this.getLicenseName(packageJson);

    if (
      licenseName === LicenseExtractor.UNKNOWN_LICENSE &&
      !this.options.includePackagesWithoutLicense
    ) {
      return false;
    }

    if (
      licenseName !== LicenseExtractor.UNKNOWN_LICENSE &&
      !this.options.pattern.test(licenseName)
    ) {
      return false;
    }

    if (
      licenseName !== LicenseExtractor.UNKNOWN_LICENSE &&
      this.options.unacceptablePattern &&
      this.options.unacceptablePattern.test(licenseName)
    ) {
      const error = new LicenseWebpackPluginError(
        ErrorMessage.UNNACEPTABLE_LICENSE,
        packageName,
        licenseName
      );
      if (this.options.abortOnUnacceptableLicense) {
        throw error;
      } else {
        this.errors.push(error);
      }
    }

    let licenseText = '';
    await this.getLicenseText(packageJson, licenseName)
      .then(s => (licenseText = s))
      .catch(reason => console.warn(reason));

    const moduleCacheEntry = {
      packageJson,
      license: {
        name: licenseName,
        text: licenseText
      }
    };
    this.moduleCache[packageName] = moduleCacheEntry;
    return Promise.resolve(true);
  }

  getCachedPackage(packageName: string): Module {
    return this.moduleCache[packageName];
  }

  private getLicenseName(packageJson: any): string {
    const overriddenLicense =
      this.options.licenseTypeOverrides &&
      this.options.licenseTypeOverrides[packageJson.name];
    if (overriddenLicense) {
      return overriddenLicense;
    }
    let license = packageJson.license;
    // add support license like `{type: '...', url: '...'}`
    if (license && license.type) {
      license = license.type;
    }
    // add support licenses like `[{type: '...', url: '...'}]`
    if (!license && packageJson.licenses) {
      const licenses = packageJson.licenses;
      if (Array.isArray(licenses) && licenses[0].type) {
        license = licenses[0].type;
        if (licenses.length > 1) {
          this.errors.push(
            new LicenseWebpackPluginError(
              ErrorMessage.MULTIPLE_LICENSE_AMBIGUITY,
              packageJson.name,
              license
            )
          );
        }
      }
    }

    if (!license) {
      license = LicenseExtractor.UNKNOWN_LICENSE;
    }

    return license;
  }

  private getLicenseFilename(
    packageJson: any,
    licenseName: string
  ): string | undefined {
    let filename;
    const packageName = packageJson.name;
    const overrideFile =
      this.options.licenseFileOverrides &&
      this.options.licenseFileOverrides[packageName];

    if (overrideFile) {
      if (!FileUtils.isThere(overrideFile)) {
        this.errors.push(
          new LicenseWebpackPluginError(
            ErrorMessage.NO_LICENSE_OVERRIDE_FILE_FOUND,
            packageName,
            overrideFile
          )
        );
      }
      return overrideFile;
    }

    for (let i = 0; i < this.options.licenseFilenames.length; i = i + 1) {
      const licenseFile = path.join(
        this.modulePrefix,
        packageName,
        this.options.licenseFilenames[i]
      );
      if (FileUtils.isThere(licenseFile)) {
        filename = licenseFile;
        break;
      }
    }

    if (!filename && this.options.licenseTemplateDir) {
      const templateFilename = path.join(
        this.options.licenseTemplateDir,
        licenseName + '.txt'
      );
      if (FileUtils.isThere(templateFilename)) {
        filename = templateFilename;
      }
    }

    return filename;
  }

  private async getLicenseText(
    packageJson: any,
    licenseName: string
  ): Promise<string> {
    if (licenseName === LicenseExtractor.UNKNOWN_LICENSE) {
      return '';
    }

    const licenseFilename = this.getLicenseFilename(packageJson, licenseName);
    if (!licenseFilename) {
      this.errors.push(
        new LicenseWebpackPluginError(
          ErrorMessage.NO_LICENSE_FILE,
          packageJson.name,
          licenseName
        )
      );

      let licenseUrl = '';
      let licenseFilenames: (string | boolean)[] = [false];
      let requestChain: Promise<any> = Promise.resolve();

      if (packageJson.repository && packageJson.repository.url) {
        licenseUrl =
          packageJson.repository.url
            .replace(/^git\+/, '')
            .replace(/github\.com/, 'raw.githubusercontent.com')
            .replace(/\.git$/, '') + '/master/';
        licenseFilenames = (<(string | boolean)[]>this.options
          .licenseFilenames).concat([false]);
      }

      const getLicenseFromRepo = (fn: string | boolean) => {
        return new Promise((resolve, reject) => {
          if (!fn) reject('');
          request.get(licenseUrl + fn, res => {
            if (res.statusCode !== 200)
              resolve(new Error(res.statusCode + ' ' + licenseUrl + fn));
            else res.on('data', (d: Buffer) => reject(d.toString()));
          });
        });
      };

      licenseFilenames.forEach(fn => {
        requestChain = requestChain.then(() =>
          (fn => getLicenseFromRepo(fn))(fn)
        );
      });

      return new Promise<string>(resolve => {
        requestChain.catch(reason => {
          resolve(reason as string);
        });
      });
    }

    return Promise.resolve(
      fs
        .readFileSync(licenseFilename, 'utf8')
        .trim()
        .replace(/\r\n/g, '\n')
    );
  }

  private readPackageJson(packageName: string) {
    const pathName = path.join(this.modulePrefix, packageName, 'package.json');
    const file = fs.readFileSync(pathName, 'utf8');
    return JSON.parse(file);
  }
}

export { LicenseExtractor };
