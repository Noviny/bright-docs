import globCb from 'glob';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs-extra';
import flatten from 'lodash.flatten';

import {
  ExampleItem,
  ExampleTreeNode,
  PackageInfo,
} from '../common/project-info';
import getMarkdownMeta from './get-markdown-meta';
import getDocsInfo from './get-docs-info';

const glob = promisify(globCb);

interface PackageDefinition {
  // absolute path to the location of the package on disk
  directoryPath: string;
  // the contents of the package.json for this package
  packageDefinition: any;
}

const getPackagesFromPatterns = async (
  globPatterns: string[],
  cwd: string,
): Promise<PackageDefinition[]> => {
  const matchedFilenames = await Promise.all(
    globPatterns.map(pattern => glob(pattern, { cwd })),
  ).then(flatten);

  const matchedPaths = matchedFilenames.map(fName => path.resolve(cwd, fName));

  // find all packages that aren't inside node_modules
  const foundPackages = await Promise.all(
    matchedPaths.map(async dirPath => {
      const stats = await fs.stat(dirPath);
      if (stats.isDirectory() && !dirPath.includes('node_modules')) {
        const pkgJSONPath = path.resolve(dirPath, 'package.json');

        const isPkgJsonPresent = await fs.pathExists(pkgJSONPath);

        if (isPkgJsonPresent) {
          const packageJsonContent = await fs.readJson(pkgJSONPath);

          return {
            directoryPath: dirPath,
            packageDefinition: packageJsonContent,
          };
        }
      }

      return undefined;
    }),
  );

  function isDefined<T>(x: T | undefined): x is T {
    return x !== undefined;
  }

  return foundPackages.filter(isDefined);
};

const getParentId = (
  packagePath: string,
  globPatterns: string[],
): string | undefined => {
  if (globPatterns.includes(packagePath)) return undefined;

  // This finds the parent folder id by matching the package directory against
  // the user defined package glob paths. This method only accounts for globs of
  // the format <path>/* or <path>/*/**.
  const baseDirectories = globPatterns
    ? globPatterns.map(dir => dir.substring(0, dir.indexOf('/*')))
    : [];

  const parentDir = baseDirectories
    .map(dir => packagePath.match(`^${dir}/(.*)/.*`))
    .find(a => !!a && a[1] !== '/');

  if (parentDir && parentDir[1]) {
    return parentDir[1];
  }

  return undefined;
};

const allowedExampleExtensions = ['.js', '.jsx', '.ts', '.tsx'];

const getExamplesInDirectory = async (
  dirPath: string,
): Promise<ExampleItem[]> => {
  const dirContents = await fs.readdir(dirPath);
  return dirContents
    .filter(fName => allowedExampleExtensions.includes(path.extname(fName)))
    .map(exampleFile => ({
      id: exampleFile.replace(path.extname(exampleFile), ''),
      exampleModulePath: path.resolve(dirPath, exampleFile),
    }));
};

const getNestedExamples = async (
  directoryPath: string,
): Promise<ExampleTreeNode | null> => {
  const dirContents = await fs.readdir(directoryPath);

  const processedContents = dirContents.map(
    async (fName): Promise<ExampleTreeNode | null> => {
      const subPath = path.resolve(directoryPath, fName);
      const dirStats = await fs.stat(subPath);

      if (dirStats.isDirectory()) {
        const childExamples = await getNestedExamples(subPath);
        return childExamples;
      }

      const extname = path.extname(subPath);
      const baseName = path.basename(subPath, extname);
      if (
        allowedExampleExtensions.includes(extname) &&
        baseName === 'examples'
      ) {
        return {
          id: baseName,
          exampleModulePath: subPath,
        };
      }

      return null;
    },
  );

  const nodes = await Promise.all(processedContents);

  const children = nodes.filter(
    (x: ExampleTreeNode | null): x is ExampleTreeNode => x !== null,
  );

  if (children.length > 0) {
    return {
      id: path.basename(directoryPath),
      children,
    };
  }

  return null;
};

const getSubExamplesInPackage = async (
  packagePath: string,
): Promise<ExampleTreeNode[]> => {
  const dirContents = await fs.readdir(packagePath);
  const subExamples = await Promise.all(
    dirContents.map(
      async (fName): Promise<ExampleTreeNode | null> => {
        const dir = path.resolve(packagePath, fName);
        const stats = await fs.stat(dir);
        // find all directories in the project except the top level examples and node_modules
        const excludedDirs = ['examples', 'node_modules'];
        if (stats.isDirectory() && !excludedDirs.includes(path.basename(dir))) {
          return getNestedExamples(dir);
        }

        return null;
      },
    ),
  );

  return subExamples.filter(
    (x: ExampleTreeNode | null): x is ExampleTreeNode => x !== null,
  );
};

export default async ({
  packagePathPatterns,
  customPackageFields,
  cwd,
  showSubExamples,
}: {
  packagePathPatterns: string[];
  // user defined package.json fields to include in the output
  customPackageFields: string[];
  // absolute path to the working directory to search in
  cwd: string;
  showSubExamples: boolean;
}): Promise<PackageInfo[]> => {
  const packages = await getPackagesFromPatterns(packagePathPatterns, cwd);

  const packagesInfo = packages.map(
    async ({ packageDefinition, directoryPath }) => {
      const pkgId = path.basename(directoryPath);
      const id = packageDefinition.name
        ? packageDefinition.name.replace(/(@\w*\/)/g, '')
        : pkgId;

      // Get data from the package.json

      const basePackageFields = [
        'name',
        'description',
        'version',
        'maintainers',
        'repository',
      ];

      const packageFields = [
        ...basePackageFields,
        ...customPackageFields,
      ].reduce((acc, fieldName) => {
        if (fieldName in packageDefinition) {
          return { ...acc, [fieldName]: packageDefinition[fieldName] };
        }

        return acc;
      }, {});

      // Find important package files

      const readmePath = path.resolve(directoryPath, 'README.md');
      const hasReadme = await fs.pathExists(readmePath);

      const changelogPath = path.resolve(directoryPath, 'CHANGELOG.md');
      const hasChangelog = await fs.pathExists(changelogPath);

      const examplesPath = path.join(directoryPath, 'examples');
      const hasExamples = await fs.pathExists(examplesPath);
      const examples = hasExamples
        ? await getExamplesInDirectory(examplesPath)
        : [];

      const subExamples = showSubExamples
        ? await getSubExamplesInPackage(directoryPath)
        : [];

      const packageInfo: PackageInfo = {
        id,
        parentId: getParentId(directoryPath, packagePathPatterns),
        name: packageDefinition.name,
        packageTitle: packageDefinition.name ? pkgId : undefined, // old behaviour. Can be removed during links refactor
        packageFields,
        readmePath: hasReadme ? readmePath : undefined,
        changelogPath: hasChangelog ? changelogPath : undefined,
        readmeMeta: hasReadme ? getMarkdownMeta(readmePath) : {},
        docs: getDocsInfo(path.join(directoryPath, 'docs')) || [],
        examples,
        subExamples,
        pkg: packageDefinition,
      };

      return packageInfo;
    },
  );

  const resolvedPackageInfo = await Promise.all(packagesInfo);
  return resolvedPackageInfo;
};
