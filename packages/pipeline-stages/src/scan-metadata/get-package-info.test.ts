import path from 'path';
import { copyFixtureIntoTempDir } from 'jest-fixtures';

import getPackageInfo from './get-package-info';
import { PackageInfo } from '../common/project-info';

describe('Get package info utility', () => {
  it('finds all packages specified and groups them by parent folder', async () => {
    const mockNestedGroupPackagesDir = await copyFixtureIntoTempDir(
      __dirname,
      'mock-nested-group-packages',
    );
    const packageInfo = await getPackageInfo({
      packagePathPatterns: [
        path.join(mockNestedGroupPackagesDir, 'packages', '/**/*'),
      ],
      customPackageFields: [],
      cwd: mockNestedGroupPackagesDir,
      showSubExamples: false,
    });

    expect(packageInfo).toMatchObject([
      { id: 'mock-package-2', parentId: undefined },
      { id: 'mock-package-1', parentId: 'sub-folder' },
    ]);
  });

  describe('using the simple-mock-packages fixture', () => {
    let simpleMockPackagesDir: string;
    let packageInfo: PackageInfo[];

    beforeAll(async () => {
      simpleMockPackagesDir = await copyFixtureIntoTempDir(
        __dirname,
        'simple-mock-packages',
      );

      packageInfo = await getPackageInfo({
        packagePathPatterns: ['packages/*'],
        customPackageFields: ['author'],
        cwd: simpleMockPackagesDir,
        showSubExamples: false,
      });
    });

    it('gets info from package.json and adds it to the result', async () => {
      expect(packageInfo[0]).toMatchObject({
        packageTitle: 'mock-package1',
        name: 'mock-package-1',
        packageFields: {
          name: 'mock-package-1',
          description: 'This is a mock package to be used for doc website',
          version: '1.0.0',
          author: 'Test1',
        },
      });
    });

    it('gets the location of the package readme and changelog', () => {
      const packagesPath = path.join(simpleMockPackagesDir, 'packages');

      expect(packageInfo).toMatchObject([
        {
          readmePath: path.join(packagesPath, 'mock-package1', 'README.md'),
          changelogPath: path.join(
            packagesPath,
            'mock-package1',
            'CHANGELOG.md',
          ),
        },
        {
          readmePath: path.join(packagesPath, 'mock-package2', 'README.md'),
          changelogPath: undefined,
        },
        {
          readmePath: undefined,
          changelogPath: undefined,
        },
      ]);
    });

    it('extracts metadata from the frontmatter in the package readme', () => {
      expect(packageInfo).toMatchObject([
        { readmeMeta: { keywords: ['project', 'react'] } },
        { readmeMeta: {} },
        { readmeMeta: {} },
      ]);
    });

    it('scans for package docs', () => {
      const mockPackage1DocsPath = path.join(
        simpleMockPackagesDir,
        'packages',
        'mock-package1',
        'docs',
      );

      expect(packageInfo[0].docs).toEqual([
        {
          id: 'extended-info',
          markdownPath: path.join(mockPackage1DocsPath, 'extended-info.md'),
          meta: { title: 'Extended Information' },
        },

        {
          id: 'some-subdirectory',
          meta: { title: 'Some Subdirectory' },
          children: [
            {
              id: 'nesting-now-supported',
              markdownPath: path.join(
                mockPackage1DocsPath,
                'some-subdirectory',
                'nesting-now-supported.md',
              ),
              meta: { status: 'WIP', title: 'Nesting Now Supported' },
            },
          ],
        },
        {
          id: 'special-usecase',
          markdownPath: path.join(mockPackage1DocsPath, 'special-usecase.mdx'),
          meta: { title: 'Special Usecase' },
        },
      ]);
    });
  });

  describe('finds package examples', () => {
    let withExamplesMockPackagesDir: string;
    let packageInfo: PackageInfo[];

    beforeAll(async () => {
      withExamplesMockPackagesDir = await copyFixtureIntoTempDir(
        __dirname,
        'mock-package-with-sub-examples',
      );

      packageInfo = await getPackageInfo({
        packagePathPatterns: ['packages/*'],
        customPackageFields: [],
        cwd: withExamplesMockPackagesDir,
        showSubExamples: false,
      });
    });

    it('gets all top level examples', () => {
      const examplesPath = path.join(
        withExamplesMockPackagesDir,
        'packages',
        'mock-package1',
        'examples',
      );

      expect(packageInfo[0].examples).toEqual([
        {
          id: 'example1',
          exampleModulePath: path.join(examplesPath, 'example1.js'),
        },
        {
          id: 'example2',
          exampleModulePath: path.join(examplesPath, 'example2.js'),
        },
        {
          id: 'example3',
          exampleModulePath: path.join(examplesPath, 'example3.js'),
        },
      ]);
    });

    it.skip('finds sub-examples in the src directory', () => {
      expect(packageInfo[0].subExamples[0].id).toEqual('src');
      // @ts-ignore
      expect(packageInfo[0].subExamples[0].children[0].id).toEqual('examples');

      // nested examples
      // @ts-ignore
      expect(packageInfo[0].subExamples[0].children[1].id).toEqual(
        'test-examples',
      );
      // @ts-ignore
      expect(packageInfo[0].subExamples[0].children[1].children[0].id).toEqual(
        'examples',
      );
      // @ts-ignore
      expect(packageInfo[0].subExamples[0].children[2].id).toEqual('view');
      // @ts-ignore
      expect(packageInfo[0].subExamples[0].children[2].children[1].id).toEqual(
        'sub-dir',
      );
    });
  });
});
