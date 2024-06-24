import { createTempDir, copyFixtureIntoTempDir } from 'jest-fixtures';
import path from 'path';
import fs from 'fs-extra';
import generatePagesStage, { StageInput } from './index';

describe('Generate pages build stage integration', () => {
  let pagesPath: string;
  let wrappersPath: string;
  let defaultPagesPath: string;

  beforeEach(async () => {
    const cwd = await createTempDir();
    defaultPagesPath = await copyFixtureIntoTempDir(__dirname, 'default-pages');
    pagesPath = path.join(cwd, 'pages');
    wrappersPath = path.join(cwd, 'wrappers');
  });

  it('creates files for website pages', async () => {
    // @ts-ignore
    const input: StageInput = {
      pagesPath,
      wrappersPath,
      defaultPagesPath,
      pages: {
        packageDocPages: [
          {
            websitePath: 'package-docs/doc1',
            markdownPath: '/content/package-docs/doc1',
            pageData: {},
            meta: {},
          },
        ],
        projectDocPages: [
          {
            websitePath: 'project-docs/doc1',
            markdownPath: '/content/project-docs/doc1',
            pageData: {},
            meta: {},
          },
        ],
        docsHomePages: [
          {
            websitePath: 'docs-home-pages/home1',
            pageData: {},
            title: 'home1-title',
          },
        ],
        docsMainPages: [
          {
            websitePath: 'docs-main-pages/main1',
            pageData: {},
            title: 'main1-title',
          },
        ],
        examplePages: [
          {
            websitePath: 'examples/example1',
            fullscreenExampleWebsitePath: 'examples/example1-full',
            exampleModulePath: '/content/examples/example1',
            pageData: {},
          },
        ],
        examplesHomePages: [
          {
            websitePath: 'examples-home-pages/home1',
            pageData: {},
          },
        ],
        changelogPages: [
          {
            websitePath: 'changelogs/changelog1',
            changelogPath: '/content/changelogs/changelog1',
            pageData: {},
          },
        ],
        packageHomePages: [
          {
            websitePath: 'package-home-pages/home1',
            markdownPath: '/content/package1/README',
            pageData: {},
            meta: {},
          },
        ],
      },
      packageRoot: path.resolve(__dirname, '..', '..'),
      sitemap: { packages: [], docs: { docs: [] } },
      readmePageData: [],
      packagesMeta: [],
      customPackageFields: [],
      packagesPaths: [],
      docs: [],
      siteName: '',
      templates: [],
    };

    await generatePagesStage(input);

    const packageDocs = await fs.readdir(path.join(pagesPath, 'package-docs'));
    expect(packageDocs).toEqual(['doc1.js']);

    const projectDocs = await fs.readdir(path.join(pagesPath, 'project-docs'));
    expect(projectDocs).toEqual(['doc1.js']);

    const docsMainPages = await fs.readdir(
      path.join(pagesPath, 'docs-main-pages'),
    );
    expect(docsMainPages).toEqual(['main1.js']);

    const docsHomePages = await fs.readdir(
      path.join(pagesPath, 'docs-home-pages'),
    );
    expect(docsHomePages).toEqual(['home1.js']);

    const examples = await fs.readdir(path.join(pagesPath, 'examples'));
    expect(examples).toEqual(['example1-full.js', 'example1.js']);

    const examplesHomePages = await fs.readdir(
      path.join(pagesPath, 'examples-home-pages'),
    );
    expect(examplesHomePages).toEqual(['home1.js']);

    const changelogs = await fs.readdir(path.join(pagesPath, 'changelogs'));
    expect(changelogs).toEqual(['changelog1.js']);

    const packageHomePages = await fs.readdir(
      path.join(pagesPath, 'package-home-pages'),
    );
    expect(packageHomePages).toEqual(['home1.js']);

    const rootPages = await fs.readdir(pagesPath);
    expect(rootPages).toContain('default-page.js');
  });
});
