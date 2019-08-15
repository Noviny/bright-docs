const fs = require('fs-extra');
const path = require('path');

const {
  changelogTemplate,
  exampleTemplate,
  singleComponentTemplate,
  wrappedComponentTemplate,
} = require('./templates');

const writeFile = (pagePath, content) => {
  fs.ensureFileSync(pagePath);
  fs.writeFileSync(pagePath, content);
};

/**
 * Generates an import path to a destination file relative from a given path
 * @param from absolute path of the js file doing the import
 * @param to absolute path of the file being imported
 */
const getImportPath = (from, to) => {
  const fromDir = path.dirname(from);
  return path.relative(fromDir, to).replace('.js', '');
};

const getGenericPageInfo = (
  pagesPath,
  pagePath,
  componentPath,
  wrappersPath,
  wrapperName,
) => {
  const absolutePagePath = path.resolve(pagesPath, pagePath);
  const componentImportPath = componentPath
    ? getImportPath(absolutePagePath, componentPath)
    : undefined;
  const packageHomeWrapperPath = getImportPath(
    absolutePagePath,
    path.join(wrappersPath, `${wrapperName}.js`),
  );

  return {
    absolutePagePath,
    componentImportPath,
    packageHomeWrapperPath,
  };
};

const generateBasicPage = (
  pagePath,
  componentPath,
  data,
  wrapperName,
  { wrappersPath, pagesPath },
  meta,
) => {
  const { componentImportPath, packageHomeWrapperPath } = getGenericPageInfo(
    pagesPath,
    pagePath,
    componentPath,
    wrappersPath,
    wrapperName,
  );

  const templateData = { ...data, pagePath, pageTitle: meta.title };

  const source = componentImportPath
    ? wrappedComponentTemplate(
        componentImportPath,
        packageHomeWrapperPath,
        templateData,
      )
    : singleComponentTemplate(packageHomeWrapperPath, templateData);

  writeFile(path.join(pagesPath, pagePath), source);
};

const generateNonComponentPage = (
  pagePath,
  data,
  wrapperName,
  { wrappersPath, pagesPath },
  type,
  title,
) => {
  const absolutePagePath = path.resolve(pagesPath, pagePath);
  const packageHomeWrapperPath = getImportPath(
    absolutePagePath,
    path.join(wrappersPath, `${wrapperName}.js`),
  );

  writeFile(
    path.join(pagesPath, pagePath),
    singleComponentTemplate(packageHomeWrapperPath, {
      ...data,
      pagePath,
      pageTitle: title,
      pageType: type,
    }),
  );
};

const generateHomePage = (pagePath, readmePath, data, config, meta) => {
  generateBasicPage(pagePath, readmePath, data, 'package-home', config, meta);
};

const generateChangelogPage = (
  pagePath,
  changelogPath,
  data,
  config,
  title = '',
) => {
  const componentPath = changelogPath;
  const wrapperName = 'package-changelog';
  const { wrappersPath, pagesPath } = config;

  const { componentImportPath, packageHomeWrapperPath } = getGenericPageInfo(
    pagesPath,
    pagePath,
    componentPath,
    wrappersPath,
    wrapperName,
  );

  const templateData = { ...data, pagePath };

  const source = componentImportPath
    ? changelogTemplate(
        componentImportPath,
        packageHomeWrapperPath,
        templateData,
        title,
      )
    : singleComponentTemplate(packageHomeWrapperPath, templateData, title);

  writeFile(path.join(pagesPath, pagePath), source);
};

const generatePackageDocPage = (pagePath, markdownPath, data, config, meta) => {
  generateBasicPage(pagePath, markdownPath, data, 'package-docs', config, meta);
};

const generateExamplePage = (
  pagePath,
  rawPagesPath,
  exampleModulePath,
  data,
  config,
  title = '',
) => {
  const componentPath = exampleModulePath;
  const wrapperName = 'package-example';
  const { wrappersPath, pagesPath } = config;

  const { componentImportPath, packageHomeWrapperPath } = getGenericPageInfo(
    pagesPath,
    pagePath,
    componentPath,
    wrappersPath,
    wrapperName,
  );

  const pageData = { ...data, pageTitle: title };

  writeFile(
    path.join(pagesPath, pagePath),
    exampleTemplate(componentImportPath, packageHomeWrapperPath, pageData),
  );

  writeFile(
    path.join(pagesPath, rawPagesPath),
    singleComponentTemplate(path.join('..', componentImportPath), pageData),
  );
};

const generateDocsHomePage = (pagePath, data, config, title = '') => {
  generateNonComponentPage(pagePath, data, 'item-list', config, 'docs', title);
};

const generateDocumentsMainPage = (pagePath, data, config, title = '') => {
  generateNonComponentPage(
    pagePath,
    data,
    'documents-index',
    config,
    'docs',
    title,
  );
};

const generateExamplesHomePage = (pagePath, data, config, title = '') => {
  generateNonComponentPage(
    pagePath,
    data,
    'item-list',
    config,
    'examples',
    title,
  );
};

const generateProjectDocPage = (pagePath, markdownPath, data, config, meta) => {
  generateBasicPage(pagePath, markdownPath, data, 'project-docs', config, meta);
};

const addBasePages = async (packageRoot, pagesPath) => {
  const defaultPagesPath = path.join(packageRoot, 'default-pages');
  await fs.copy(defaultPagesPath, pagesPath);
};

/**
 * Clean up packages and docs so we don't have ghost pages
 * @param pagesPath the absolute path to the `/pages` directory in next
 * @param docsList list of documents
 */
const cleanPages = async pagesPath => {
  // This error handling should likely be lifted to when we start executing the whole thing
  if (typeof pagesPath !== 'string' || pagesPath.length < 1) {
    throw new Error(
      "We were worried we were going to erase files from the wrong place so we're stopping",
    );
  }

  await fs.remove(pagesPath);
};

const generateDataPages = (input) => {
  const pagesListPath = path.resolve(input.packageRoot, 'data/pages-list.json');
  writeFile(pagesListPath, JSON.stringify({ packages: input.sitemap.packages, ...input.sitemap.docs, readMe: input.readmePageData }, undefined, 2));

  const packagesDataPath = path.resolve(input.packageRoot, 'data/packages-data.json');
  writeFile(packagesDataPath, JSON.stringify({ metaData: input.packagesMeta }, undefined, 2))

  const readMe =
    input.readmePageData && input.readmePageData.length > 0
      ? {
        imgSrc: input.readMeImgSrc,
      }
      : undefined;

  const packagesMeta = {
    description: input.packagesDescription,
    imgSrc: input.packagesImgSrc,
  };

  const metaPath = path.resolve(input.packageRoot, 'data/site-meta.json');
  writeFile(metaPath, JSON.stringify(
    {
      siteName: input.siteName,
      packages: packagesMeta,
      links: input.links,
      readMe,
      docs: input.docs,
    },
    undefined,
    2,
  ));
};

module.exports = {
  generateHomePage,
  generateChangelogPage,
  generatePackageDocPage,
  generateExamplePage,
  generateDocsHomePage,
  generateExamplesHomePage,
  generateProjectDocPage,
  generateDocumentsMainPage,
  addBasePages,
  cleanPages,
  writeFile,
  generateDataPages,
};
