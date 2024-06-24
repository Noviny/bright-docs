import generateWebsiteInfoStage, { StageOutput } from './index';
import { singlePackageData, projectDocsData } from './sample-data';

describe('Generate website info build stage', () => {
  it('builds a website specification for a simple project', async () => {
    const output = await generateWebsiteInfoStage({
      packages: singlePackageData,
      projectDocs: projectDocsData,
      readmePath: '/content/README.md',
    });

    expect(output).toMatchSnapshot();
  });

  it('generates a root readme page and required data in the output', async () => {
    const output = await generateWebsiteInfoStage({
      packages: [],
      projectDocs: projectDocsData,
      readmePath: '/content/README.md',
    });

    expect(output.pages.projectDocPages).toContainEqual({
      websitePath: 'readme',
      markdownPath: '/content/README.md',
      pageData: { key: 'readme' },
      meta: { data: 'readme' },
    });

    expect(output.readmePageData).toEqual([
      { id: 'packages', pagePath: '/packages' },
      { id: 'helpful-guides', pagePath: '/docs/guides' },
    ]);
  });

  describe('Project level docs', () => {
    let output: StageOutput;

    beforeAll(async () => {
      output = await generateWebsiteInfoStage({
        packages: [],
        readmePath: '/content/README.md',
        projectDocs: [
          {
            name: 'My Amazing 💯 Docs',
            websitePath: 'docs/amazing',
            docs: [
              {
                id: 'section-1',
                meta: {},
                children: [
                  {
                    id: 'doc-1',
                    meta: {},
                    markdownPath: '/content/amazing/doc-1.md',
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('creates a docs main page for each section', () => {
      const { pages } = output;

      expect(pages.docsMainPages).toEqual([
        {
          websitePath: 'docs/amazing',
          pageData: { key: 'my-amazing-💯-docs' },
          title: 'My Amazing 💯 Docs',
        },
      ]);
    });

    it('creates docs pages from the listed sections and adds them to the sitemap', () => {
      const { pages, sitemap } = output;
      expect(pages.docsHomePages).toEqual([
        {
          pageData: {
            children: [
              {
                id: 'doc-1',
                meta: {},
                pagePath: '/docs/amazing/section-1/doc-1',
              },
            ],
            id: 'section-1',
            key: 'my-amazing-💯-docs',
          },
          websitePath: 'docs/amazing/section-1',
        },
      ]);
      expect(pages.projectDocPages).toContainEqual({
        markdownPath: '/content/amazing/doc-1.md',
        meta: {},
        pageData: { key: 'my-amazing-💯-docs' },
        websitePath: 'docs/amazing/section-1/doc-1',
      });
      expect(sitemap.docs).toHaveProperty('my-amazing-💯-docs', [
        {
          children: [
            {
              id: 'doc-1',
              meta: {},
              pagePath: '/docs/amazing/section-1/doc-1',
            },
          ],
          id: 'section-1',
          meta: {},
          pagePath: '/docs/amazing/section-1',
        },
      ]);
    });
  });
});
