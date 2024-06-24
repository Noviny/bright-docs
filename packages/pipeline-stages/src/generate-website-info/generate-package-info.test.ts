import generatePackageInfo from './generate-package-info';
import { PackageInfo } from '../common/project-info';

const mockData: PackageInfo[] = [
  {
    id: 'package-1',
    parentId: 'group-1',
    name: 'Package One',
    packageFields: {
      customField1: 'foo',
      customField2: 'bar',
    },
    readmePath: '/content/packages/package-1/README.md',
    readmeMeta: {
      metaField1: 'baz',
    },
    packageTitle: 'Package 1 title',
    changelogPath: '/content/packages/package-1/CHANGELOG.md',
    docs: [],
    examples: [],
    subExamples: [],
    pkg: {},
  },

  {
    pkg: {},
    id: 'package-2',
    name: 'Package Two',
    packageFields: {},
    readmePath: '/content/packages/package-2/README.md',
    readmeMeta: {},
    docs: [],
    examples: [],
    subExamples: [],
  },
];

describe('Package website info generator', () => {
  it('processes the packages from groups and sets the parent field on the sitemap entries', () => {
    const { sitemap } = generatePackageInfo(mockData);

    expect(sitemap).toMatchObject([
      {
        packageId: 'package-1',
        parentId: 'group-1',
      },
      {
        packageId: 'package-2',
        parentId: undefined,
      },
    ]);
  });

  it('outputs package metadata using custom package fields', () => {
    const { meta } = generatePackageInfo(mockData);

    expect(meta).toHaveLength(2);

    expect(meta[0]).toEqual({
      id: 'package-1',
      customPackageFields: ['customField1', 'customField2'],
      customField1: 'foo',
      customField2: 'bar',
    });
  });

  it('adds extra display info into the sitemap', () => {
    const { sitemap } = generatePackageInfo(mockData);

    expect(sitemap[0]).toMatchObject({
      packageTitle: 'Package 1 title',
      homeMeta: {
        metaField1: 'baz',
      },
    });
  });

  it('outputs a home page for packages and adds its path in the sitemap', () => {
    const { sitemap, pages } = generatePackageInfo(mockData);

    expect(sitemap[0].homePath).toEqual('/packages/package-1');

    expect(pages.packageHomePages).toHaveLength(2);

    expect(pages.packageHomePages).toContainEqual({
      websitePath: 'packages/package-1',
      markdownPath: '/content/packages/package-1/README.md',
      pageData: {
        id: 'package-1',
        packageName: 'Package One',
        customPackageFields: ['customField1', 'customField2'],
        customField1: 'foo',
        customField2: 'bar',
        metaField1: 'baz',
        pkg: {},
      },
      meta: { title: 'Package 1' },
    });
  });

  it('outputs a changelog page for packages and adds its path in the sitemap', () => {
    const { sitemap, pages } = generatePackageInfo(mockData);

    expect(sitemap[0].changelogPath).toEqual('/packages/package-1/changelog');

    expect(pages.changelogPages).toHaveLength(1);
    expect(pages.changelogPages[0]).toEqual({
      websitePath: 'packages/package-1/changelog',
      changelogPath: '/content/packages/package-1/CHANGELOG.md',
      pageData: {
        id: 'package-1',
        packageName: 'Package One',
      },
      title: 'Changelog',
    });
  });

  it('outputs a docs home page for packages and adds its path in the sitemap', () => {
    const { sitemap, pages } = generatePackageInfo(mockData);

    expect(sitemap[0].docPath).toEqual('/packages/package-1/docs');

    expect(pages.docsHomePages).toHaveLength(2);
    expect(pages.docsHomePages[0]).toEqual({
      websitePath: 'packages/package-1/docs',
      pageData: {
        id: 'package-1',
        packageName: 'Package One',
      },
      title: 'Documents',
    });
  });

  it('outputs a examples home page for packages and adds its path in the sitemap', () => {
    const { sitemap, pages } = generatePackageInfo(mockData);

    expect(sitemap[0].examplePath).toEqual('/packages/package-1/examples');

    expect(pages.examplesHomePages).toHaveLength(2);
    expect(pages.examplesHomePages[0]).toEqual({
      websitePath: 'packages/package-1/examples',
      pageData: {
        id: 'package-1',
        packageName: 'Package One',
      },
      title: 'Examples',
    });
  });

  it('processes docs website information', () => {
    const mockDataWithDocs = [
      {
        pkg: {},
        id: 'package-1',
        name: 'Package One',
        packageFields: {},
        readmePath: '/content/packages/package-1/README.md',
        readmeMeta: {},
        examples: [],
        subExamples: [],
        docs: [
          {
            id: 'doc-home-1',
            meta: {},
            children: [
              {
                id: 'doc-1',
                meta: {},
                markdownPath: 'content/markdown-1.md',
              },
            ],
          },
        ],
      },
    ];
    const { sitemap, pages } = generatePackageInfo(mockDataWithDocs);

    expect(sitemap[0].docs).toContainEqual(
      expect.objectContaining({ id: 'doc-home-1' }),
    );

    expect(pages.docsHomePages).toContainEqual(
      expect.objectContaining({
        websitePath: 'packages/package-1/docs/doc-home-1',
      }),
    );
    expect(pages.docsPages).toContainEqual(
      expect.objectContaining({
        websitePath: 'packages/package-1/docs/doc-home-1/doc-1',
      }),
    );
  });

  it('outputs top level examples', () => {
    const mockDataWithExamples = [
      {
        pkg: {},
        id: 'package-1',
        name: 'Package One',
        packageFields: {},
        readmePath: '/content/packages/package-1/README.md',
        readmeMeta: {},
        docs: [],
        examples: [
          {
            id: 'example-1',
            exampleModulePath: 'content/example-1.js',
          },
        ],
        subExamples: [],
      },
    ];
    const { sitemap, pages } = generatePackageInfo(mockDataWithExamples);

    expect(pages.examplesPages).toMatchObject([
      {
        websitePath: 'packages/package-1/examples/example-1',
      },
    ]);

    expect(sitemap[0].examples).toMatchObject([{ id: 'example-1' }]);
  });

  it('outputs package sub-examples', () => {
    const mockDataWithExamples = [
      {
        id: 'package-1',
        name: 'Package One',
        packageFields: {},
        readmePath: '/content/packages/package-1/README.md',
        readmeMeta: {},
        docs: [],
        examples: [],
        pkg: {},
        subExamples: [
          {
            id: 'sub-examples-group-1',
            children: [
              {
                id: 'sub-example-1',
                exampleModulePath: 'content/sub-example-1.js',
              },
            ],
          },
        ],
      },
    ];
    const { sitemap, pages } = generatePackageInfo(mockDataWithExamples);

    expect(pages.examplesPages).toMatchObject([
      {
        websitePath:
          'packages/package-1/subExamples/sub-examples-group-1/sub-example-1',
      },
    ]);

    expect(sitemap[0].subExamples).toMatchObject([
      { id: 'sub-examples-group-1' },
    ]);
  });
});
