import generateDocsInfo from './generate-docs-info';
import { DocsTreeNode } from '../common/project-info';

describe('Docs tree info generator', () => {
  it('Creates page specs for input docs and adds them to the sitemap', () => {
    const docs: DocsTreeNode[] = [
      {
        id: 'doc-1',
        markdownPath: '/content/doc-1.md',
        meta: { value: 'foo' },
      },
      {
        id: 'doc-2',
        markdownPath: '/content/doc-2.md',
        meta: { value: 'bar' },
      },
    ];

    const { pages, sitemap } = generateDocsInfo(
      docs,
      'website/docs',
      {},
      'docs-key',
    );

    expect(pages.docsPages).toEqual([
      {
        websitePath: 'website/docs/doc-1',
        markdownPath: '/content/doc-1.md',
        pageData: { key: 'docs-key' },
        meta: { value: 'foo' },
      },
      {
        websitePath: 'website/docs/doc-2',
        markdownPath: '/content/doc-2.md',
        pageData: { key: 'docs-key' },
        meta: { value: 'bar' },
      },
    ]);

    expect(sitemap).toEqual([
      {
        id: 'doc-1',
        meta: { value: 'foo' },
        pagePath: '/website/docs/doc-1',
      },
      {
        id: 'doc-2',
        meta: { value: 'bar' },
        pagePath: '/website/docs/doc-2',
      },
    ]);
  });

  it('Adds extra page info to each doc', () => {
    const docs: DocsTreeNode[] = [
      {
        id: 'doc-1',
        markdownPath: '/content/doc-1.md',
        meta: {},
      },
    ];

    const { pages } = generateDocsInfo(
      docs,
      'website/docs',
      {
        extraData: 'baz',
      },
      'docs-key',
    );

    expect(pages.docsPages[0].pageData).toEqual({
      key: 'docs-key',
      extraData: 'baz',
    });
  });

  it('Generates page spec for child pages in the docs tree and adds them to the sitemap', () => {
    const docs: DocsTreeNode[] = [
      {
        id: 'doc-1',
        children: [
          {
            id: 'doc-2',
            markdownPath: '/content/doc-2.md',
            meta: {},
          },
          {
            id: 'doc-3',
            markdownPath: '/content/doc-3.md',
            meta: {},
          },
        ],
        meta: {},
      },
    ];

    const { pages, sitemap } = generateDocsInfo(
      docs,
      'website/docs',
      {},
      'docs-key',
    );

    expect(pages.docsPages).toMatchObject([
      { websitePath: 'website/docs/doc-1/doc-2' },
      { websitePath: 'website/docs/doc-1/doc-3' },
    ]);

    const rootPage = sitemap[0];
    expect(rootPage.pagePath).toEqual('/website/docs/doc-1');
    expect(rootPage.children).toMatchObject([
      { pagePath: '/website/docs/doc-1/doc-2' },
      { pagePath: '/website/docs/doc-1/doc-3' },
    ]);
  });

  it('Creates a docs home page for every level of docs nesting', () => {
    const docs: DocsTreeNode[] = [
      {
        id: 'doc-1',
        children: [
          {
            id: 'doc-2',
            children: [
              {
                id: 'doc-3',
                markdownPath: '/content/doc-3.md',
                meta: { value: 'bar' },
              },
            ],
            meta: { value: 'foo' },
          },
        ],
        meta: {},
      },
    ];

    const { pages } = generateDocsInfo(docs, 'website/docs', {}, 'docs-key');

    expect(pages.docsHomePages).toEqual([
      {
        websitePath: 'website/docs/doc-1',
        pageData: {
          key: 'docs-key',
          id: 'doc-1',
          children: [
            {
              id: 'doc-2',
              meta: { value: 'foo' },
              pagePath: '/website/docs/doc-1/doc-2',
            },
          ],
        },
      },
      {
        websitePath: 'website/docs/doc-1/doc-2',
        pageData: {
          key: 'docs-key',
          id: 'doc-2',
          children: [
            {
              id: 'doc-3',
              meta: { value: 'bar' },
              pagePath: '/website/docs/doc-1/doc-2/doc-3',
            },
          ],
        },
      },
    ]);
  });

  it('Uses a readme instead of a docs home page if one is present', () => {
    const docs: DocsTreeNode[] = [
      {
        id: 'doc-1',
        children: [
          {
            id: 'doc-2',
            markdownPath: '/content/doc-2.md',
            meta: {},
          },
          {
            id: 'readme',
            markdownPath: '/content/readme.md',
            meta: {},
          },
        ],
        meta: {},
      },
    ];

    const { pages, sitemap } = generateDocsInfo(
      docs,
      'website/docs',
      {},
      'docs-key',
    );

    expect(pages.docsHomePages).toHaveLength(0);

    expect(pages.docsPages).toContainEqual({
      websitePath: 'website/docs/doc-1',
      markdownPath: '/content/readme.md',
      pageData: { key: 'docs-key' },
      meta: {},
    });

    const rootPage = sitemap[0];
    expect(rootPage.children).toHaveLength(1);
  });
});
