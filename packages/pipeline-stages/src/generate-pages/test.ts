import generatePagesStage from './index';
// @ts-ignore: Implicit any
import pageWriters from './page-writers';

jest.mock('./page-writers', () => ({
  generatePackageDocPage: jest.fn(),
  generateProjectDocPage: jest.fn(),
  generateDocsHomePage: jest.fn(),
  generateDocumentsMainPage: jest.fn(),
  generateExamplesHomePage: jest.fn(),
  generateExamplePage: jest.fn(),
  generateChangelogPage: jest.fn(),
  generateHomePage: jest.fn(),
  cleanPages: jest.fn(),
  addBasePages: jest.fn(),
  generateDataPages: jest.fn(),
}));

const inputBase = {
  wrappersPath: 'WRAPPERS_PATH',
  pagesPath: 'PAGES_PATH',
  defaultPagesPath: 'DEFAULT_PAGES_PATH',
  pages: {
    packageDocPages: [],
    projectDocPages: [],
    docsHomePages: [],
    docsMainPages: [],
    examplePages: [],
    examplesHomePages: [],
    changelogPages: [],
    packageHomePages: [],
  },
  packageRoot: '',
  sitemap: { packages: [], docs: { docs: [] } },
  readmePageData: [],
  packagesMeta: [],
  customPackageFields: [],
  packagesPaths: [],
  docs: [],
  siteName: '',
  templates: [],
};

describe('Generate pages build stage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates package docs', async () => {
    // @ts-ignore
    await generatePagesStage({
      ...inputBase,
      pages: {
        ...inputBase.pages,
        packageDocPages: [
          {
            websitePath: 'package/path/docs/doc1',
            markdownPath: '/markdown/path/doc1',
            pageData: { value: 'foo' },
            meta: { value: 'bar' },
          },
        ],
      },
    });

    expect(pageWriters.generatePackageDocPage).toHaveBeenCalledWith(
      'package/path/docs/doc1.js',
      '/markdown/path/doc1',
      { value: 'foo' },
      { wrappersPath: 'WRAPPERS_PATH', pagesPath: 'PAGES_PATH' },
      { value: 'bar' },
    );
  });

  it('generates project/system docs', async () => {
    // @ts-ignore
    await generatePagesStage({
      ...inputBase,
      pages: {
        ...inputBase.pages,
        projectDocPages: [
          {
            websitePath: 'docs/path/docs/doc1',
            markdownPath: '/markdown/path/doc1',
            pageData: { value: 'foo' },
            meta: { value: 'bar' },
          },
        ],
      },
    });

    expect(pageWriters.generateProjectDocPage).toHaveBeenCalledWith(
      'docs/path/docs/doc1.js',
      '/markdown/path/doc1',
      { value: 'foo' },
      { wrappersPath: 'WRAPPERS_PATH', pagesPath: 'PAGES_PATH' },
      { value: 'bar' },
    );
  });

  it('generates docs home pages', async () => {
    // @ts-ignore
    await generatePagesStage({
      ...inputBase,
      pages: {
        ...inputBase.pages,
        docsHomePages: [
          {
            websitePath: 'docs/path/home',
            pageData: { value: 'foo' },
            title: 'TITLE',
          },
          {
            websitePath: 'docs/path/other/home',
            pageData: { value: 'foo' },
          },
        ],
      },
    });

    expect(pageWriters.generateDocsHomePage).toHaveBeenCalledWith(
      'docs/path/home.js',
      { value: 'foo' },
      { wrappersPath: 'WRAPPERS_PATH', pagesPath: 'PAGES_PATH' },
      'TITLE',
    );

    expect(pageWriters.generateDocsHomePage).toHaveBeenCalledWith(
      'docs/path/other/home.js',
      { value: 'foo' },
      { wrappersPath: 'WRAPPERS_PATH', pagesPath: 'PAGES_PATH' },
      undefined,
    );
  });

  it('generates docs main pages', async () => {
    // @ts-ignore
    await generatePagesStage({
      ...inputBase,
      pages: {
        ...inputBase.pages,
        docsMainPages: [
          {
            websitePath: 'docs/path/main',
            pageData: { value: 'foo' },
            title: 'TITLE',
          },
          {
            websitePath: 'docs/path/other/main',
            pageData: { value: 'foo' },
          },
        ],
      },
    });

    expect(pageWriters.generateDocumentsMainPage).toHaveBeenCalledWith(
      'docs/path/main.js',
      { value: 'foo' },
      { wrappersPath: 'WRAPPERS_PATH', pagesPath: 'PAGES_PATH' },
      'TITLE',
    );

    expect(pageWriters.generateDocumentsMainPage).toHaveBeenCalledWith(
      'docs/path/other/main.js',
      { value: 'foo' },
      { wrappersPath: 'WRAPPERS_PATH', pagesPath: 'PAGES_PATH' },
      undefined,
    );
  });

  it('generates examples', async () => {
    // @ts-ignore
    await generatePagesStage({
      ...inputBase,
      pages: {
        ...inputBase.pages,
        examplePages: [
          {
            websitePath: 'package/path/examples/example1',
            fullscreenExampleWebsitePath: 'package/path/examples/example1-full',
            exampleModulePath: '/examples/path/example1',
            pageData: { value: 'foo' },
            title: 'PAGE_TITLE',
          },
        ],
      },
    });

    expect(pageWriters.generateExamplePage).toHaveBeenCalledWith(
      'package/path/examples/example1.js',
      'package/path/examples/example1-full.js',
      '/examples/path/example1',
      { value: 'foo' },
      { wrappersPath: 'WRAPPERS_PATH', pagesPath: 'PAGES_PATH' },
      'PAGE_TITLE',
    );
  });

  it('generates examples home pages', async () => {
    // @ts-ignore
    await generatePagesStage({
      ...inputBase,
      pages: {
        ...inputBase.pages,
        examplesHomePages: [
          {
            websitePath: 'examples/path/home',
            pageData: { value: 'foo' },
            title: 'TITLE',
          },
          {
            websitePath: 'examples/path/other/home',
            pageData: { value: 'foo' },
          },
        ],
      },
    });

    expect(pageWriters.generateExamplesHomePage).toHaveBeenCalledWith(
      'examples/path/home.js',
      { value: 'foo' },
      { wrappersPath: 'WRAPPERS_PATH', pagesPath: 'PAGES_PATH' },
      'TITLE',
    );

    expect(pageWriters.generateExamplesHomePage).toHaveBeenCalledWith(
      'examples/path/other/home.js',
      { value: 'foo' },
      { wrappersPath: 'WRAPPERS_PATH', pagesPath: 'PAGES_PATH' },
      undefined,
    );
  });

  it('generates package changelogs', async () => {
    // @ts-ignore
    await generatePagesStage({
      ...inputBase,
      pages: {
        ...inputBase.pages,
        changelogPages: [
          {
            websitePath: 'package/path/changelog',
            changelogPath: '/package/changelog',
            pageData: { value: 'foo' },
            title: 'TITLE',
          },
          {
            websitePath: 'other/package/path/changelog',
            changelogPath: '/other/package/changelog',
            pageData: { value: 'foo' },
          },
        ],
      },
    });

    expect(pageWriters.generateChangelogPage).toHaveBeenCalledWith(
      'package/path/changelog.js',
      '/package/changelog',
      { value: 'foo' },
      { wrappersPath: 'WRAPPERS_PATH', pagesPath: 'PAGES_PATH' },
    );

    expect(pageWriters.generateChangelogPage).toHaveBeenCalledWith(
      'other/package/path/changelog.js',
      '/other/package/changelog',
      { value: 'foo' },
      { wrappersPath: 'WRAPPERS_PATH', pagesPath: 'PAGES_PATH' },
    );
  });

  it('generates package home pages', async () => {
    // @ts-ignore
    await generatePagesStage({
      ...inputBase,
      pages: {
        ...inputBase.pages,
        packageHomePages: [
          {
            websitePath: 'package/path',
            markdownPath: '/markdown/path/package1',
            pageData: { value: 'foo' },
            meta: { value: 'bar' },
          },
        ],
      },
    });

    expect(pageWriters.generateHomePage).toHaveBeenCalledWith(
      'package/path.js',
      '/markdown/path/package1',
      { value: 'foo' },
      { wrappersPath: 'WRAPPERS_PATH', pagesPath: 'PAGES_PATH' },
      { value: 'bar' },
      [],
    );
  });
});
