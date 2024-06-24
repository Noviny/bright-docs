import { PackageInfo, ProjectDocsSection } from '../common/project-info';

export const singlePackageData: PackageInfo[] = [
  {
    id: 'package-1',
    name: 'package one',
    changelogPath: '/content/packages/package-1/CHANGELOG.md',
    readmePath: '/content/packages/package-1',
    readmeMeta: {
      labels: ['important', 'must-read'],
    },
    packageFields: {
      author: 'Jane Austen',
    },
    docs: [
      {
        id: 'docs-subject-1',
        meta: {},
        children: [
          {
            id: 'doc-1',
            meta: {
              outdated: true,
            },
            markdownPath:
              '/content/packages/package-1/docs/docs-subject-1/doc-1.md',
          },
        ],
      },
      {
        id: 'doc-2',
        meta: {},
        markdownPath: '/content/packages/package-1/docs/doc-2.md',
      },
    ],
    examples: [
      {
        id: 'example-1',
        exampleModulePath: '/content/packages/package-1/examples/example-1.js',
      },
      {
        id: 'example-2',
        exampleModulePath: '/content/packages/package-1/examples/example-2.js',
      },
    ],
    subExamples: [
      {
        id: 'sub-example-1',
        exampleModulePath:
          '/content/packages/package-1/src/examples/sub-example-1.js',
      },
      {
        id: 'sub-examples-group-1',
        children: [
          {
            id: 'sub-example-2',
            exampleModulePath:
              '/content/packages/package-1/src/examples/sub-examples-group-1/sub-example-2.js',
          },
        ],
      },
    ],
    pkg: {},
  },
];

export const projectDocsData: ProjectDocsSection[] = [
  {
    name: 'Helpful Guides',
    websitePath: 'docs/guides',
    docs: [
      {
        id: 'guide-1',
        markdownPath: '/content/guides/guide-1.md',
        meta: {},
      },
      {
        id: 'guide-group-1',
        meta: {},
        children: [
          {
            id: 'guide-2',
            markdownPath: '/content/guides/guide-group-1/guide-2.md',
            meta: {},
          },
        ],
      },
    ],
  },
];
