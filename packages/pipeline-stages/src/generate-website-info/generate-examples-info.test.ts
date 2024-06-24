import generateExamplesInfo from './generate-examples-info';
import { ExampleItem, ExampleTreeNode } from '../common/project-info';

describe('Examples website info generator', () => {
  it('creates example pages and adds them to the sitemap', () => {
    const examplesData: ExampleItem[] = [
      {
        id: 'example-1',
        exampleModulePath: 'content/example-1.js',
      },
      {
        id: 'example-2',
        exampleModulePath: 'content/example-2.js',
      },
    ];

    const { pages, sitemap } = generateExamplesInfo(
      examplesData,
      'website/examples',
      {},
    );

    expect(pages.examplePages).toEqual([
      {
        websitePath: 'website/examples/example-1',
        fullscreenExampleWebsitePath: 'website/examples/isolated/example-1',
        exampleModulePath: 'content/example-1.js',
        pageData: {
          pageTitle: 'Example 1',
          isolatedPath: '/website/examples/isolated/example-1',
        },
        title: 'Example 1',
      },
      {
        websitePath: 'website/examples/example-2',
        fullscreenExampleWebsitePath: 'website/examples/isolated/example-2',
        exampleModulePath: 'content/example-2.js',
        pageData: {
          pageTitle: 'Example 2',
          isolatedPath: '/website/examples/isolated/example-2',
        },
        title: 'Example 2',
      },
    ]);

    expect(sitemap).toEqual([
      {
        id: 'example-1',
        pagePath: '/website/examples/example-1',
        isolatedPagePath: '/website/examples/isolated/example-1',
      },
      {
        id: 'example-2',
        pagePath: '/website/examples/example-2',
        isolatedPagePath: '/website/examples/isolated/example-2',
      },
    ]);
  });

  it('adds extra page info to generated pages', () => {
    const examplesData: ExampleItem[] = [
      {
        id: 'example-1',
        exampleModulePath: 'content/example-1.js',
      },
    ];

    const { pages } = generateExamplesInfo(examplesData, 'website/examples', {
      value: 'foo',
    });

    expect(pages.examplePages[0].pageData).toEqual({
      pageTitle: 'Example 1',
      isolatedPath: '/website/examples/isolated/example-1',
      value: 'foo',
    });
  });

  it('processes trees of examples and generates pages and a sitemap', () => {
    const examplesData: ExampleTreeNode[] = [
      {
        id: 'group-1',
        children: [
          {
            id: 'group-2',
            children: [
              {
                id: 'example-1',
                exampleModulePath: 'content/example-1.js',
              },
            ],
          },
        ],
      },
    ];

    const { pages, sitemap } = generateExamplesInfo(
      examplesData,
      'website/examples',
      {},
    );

    expect(pages.examplePages[0]).toMatchObject({
      websitePath: 'website/examples/group-1/group-2/example-1',
      fullscreenExampleWebsitePath:
        'website/examples/group-1/group-2/isolated/example-1',
    });

    expect(sitemap).toEqual([
      {
        id: 'group-1',
        children: [
          {
            id: 'group-2',
            children: [
              {
                id: 'example-1',
                pagePath: '/website/examples/group-1/group-2/example-1',
                isolatedPagePath:
                  '/website/examples/group-1/group-2/isolated/example-1',
              },
            ],
          },
        ],
      },
    ]);
  });
});
