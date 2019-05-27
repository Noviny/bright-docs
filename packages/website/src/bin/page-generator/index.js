const path = require('path');
const fs = require('fs-extra');

const rimraf = require('rimraf');
const titleCase = require('title-case');
const filenamify = require('filenamify');

const getPackageInfo = require('./get-package-info');
const getDocsInfo = require('./get-docs-info');
const {
  generateHomePage,
  generateChangelogPage,
  generatePackageDocPage,
  generateExamplePage,
  generateDocsHomePage,
  generateExamplesHomePage,
  generateProjectDocPage,
  generateDocumentsMainPage,
} = require('./write-pages');

const packagesData = [];

/**
 * Maps over all packages and creates website pages for each
 * @param packageInfo data representing the packages that exist
 * @param generatorConfig info about the locations of important directories used for page generation
 * @returns a sitemap of all the pages created
 */
function generatePackagePages(packageInfo, generatorConfig) {
  const packageSitemap = packageInfo.map(pkg => {
    const pageData = { id: pkg.id, packageName: pkg.name };
    const homePageData = {
      description: pkg.description,
      version: pkg.version,
      maintainers: pkg.maintainers,
      repository: pkg.repository,
    };
    packagesData.push({ id: pkg.id, ...homePageData });
    const homePath = path.join('packages', pkg.id);
    generateHomePage(
      path.join(homePath, 'index.js'),
      pkg.readmePath,
      { ...pageData, ...homePageData },
      generatorConfig,
      titleCase(pkg.id),
    );

    const changelogPath = path.join(homePath, 'changelog');
    generateChangelogPage(
      `${changelogPath}.js`,
      pkg.changelogPath,
      pageData,
      generatorConfig,
      'Changelog',
    );

    const docPath = path.join(homePath, 'docs');
    generateDocsHomePage(
      path.join(docPath, 'index.js'),
      pageData,
      generatorConfig,
      'Documents',
    );

    const examplePath = path.join(homePath, 'examples');
    generateExamplesHomePage(
      path.join(examplePath, 'index.js'),
      pageData,
      generatorConfig,
      'Examples',
    );

    const docs = pkg.docsPaths.map(doc => {
      const pagePath = path.join(homePath, 'docs', doc.id);
      generatePackageDocPage(
        `${pagePath}.js`,
        doc.path,
        pageData,
        generatorConfig,
        titleCase(doc.id),
      );

      return { id: doc.id, pagePath: path.join('/', pagePath) };
    });

    const examples = pkg.examplesPaths.map(example => {
      const pagePath = path.join(homePath, 'examples', example.id);

      const rawPagesPath = path.join(homePath, 'examples/isolated', example.id);
      const isolatedPath = path.join('/', `${rawPagesPath}`);
      const pageTitle = titleCase(example.id);

      generateExamplePage(
        `${pagePath}.js`,
        `${rawPagesPath}.js`,
        example.path,
        { ...pageData, isolatedPath, pageTitle },
        generatorConfig,
        pageTitle,
      );

      return {
        id: example.id,
        pagePath: path.join('/', pagePath),
        isolatedPath,
      };
    });

    const subExamples = pkg.subExamplesPaths.map(example => {
      const pagePath = path.join(
        homePath,
        `subExamples/${example.id}`,
        'examples',
      );

      const rawPagesPath = path.join(
        homePath,
        `subExamples/${example.id}/isolated`,
        'examples',
      );
      const isolatedPath = path.join('/', `${rawPagesPath}`);

      generateExamplePage(
        `${pagePath}.js`,
        `${rawPagesPath}.js`,
        example.path,
        { ...pageData, isolatedPath },
        generatorConfig,
        'Examples',
      );

      return {
        id: `${example.id}/examples`,
        pagePath: path.join('/', pagePath),
        isolatedPath,
        folderPath: example.id,
      };
    });

    /**
     * Recursively scans through the folder structure from folder path and generate children
     * for each sub example
     * @param folders the folder array
     * @param children
     * @param subExample each item in subExample
     */
    const processSubExamples = (folders, children, subExample) => {
      const [folder, ...rest] = folders;
      const requiresFurtherNesting = !!rest.length;

      let addToFolder = children.find(child => child.id === folder);
      if (!addToFolder) {
        children.push({
          id: folder,
          children: [],
        });
        addToFolder = children.find(child => child.id === folder);
      }

      if (requiresFurtherNesting) {
        processSubExamples(rest, addToFolder.children, subExample);
      } else {
        // When it reach the last element add it as a plain object and delete the [] children array.
        addToFolder.pagePath = subExample.pagePath;
        addToFolder.isolatedPath = subExample.isolatedPath;
        delete addToFolder.children;
      }
    };

    /**
     * Recursively scans through the top level sub examples and generate a tree structure
     * @returns array like sub examples structure
     */
    const formatSubExamples = () => {
      const formatted = [];
      subExamples.forEach(subExample => {
        const folders = subExample.id.split('/').filter(Boolean);
        processSubExamples(folders, formatted, subExample);
      });

      return formatted;
    };

    const env = process.env.NODE_ENV || 'development';
    const displayChangelog = pkg.changelogPath || env === 'development';

    return {
      packageId: pkg.id,
      homePath: path.join('/', homePath),
      changelogPath: displayChangelog ? path.join('/', changelogPath) : null,
      docPath: path.join('/', docPath),
      examplePath: path.join('/', examplePath),
      docs,
      examples,
      subExamples: formatSubExamples(),
    };
  });
  return packageSitemap;
}

/**
 * Recursively scans through the top level docs structure and generates pages
 * for each markdown file
 * @param docsInfo info about the docs markdown that exist in the project
 * @param generatorConfig info about the locations of important directories used for page generation
 * @param name name of the parent path
 * @returns sitemap for the generated docs pages
 */
const generateProjectDocsPages = (docsInfo, generatorConfig, name) => {
  generateDocumentsMainPage(
    path.join(name, 'index.js'),
    { key: name },
    generatorConfig,
    name,
  );

  const scanAndGenerate = (docs, docsPath) =>
    docs.map(doc => {
      const pagePath = path.join(docsPath, doc.id);

      if (doc.children) {
        const readme = doc.children.find(
          c => c.path && c.path.toLowerCase().match(/readme\.md$/),
        );

        const docData = {
          key: name,
          id: doc.id,
          children: doc.children.map(child => ({
            id: child.id,
            pagePath: path.join(doc.id, child.id),
          })),
        };
        if (readme) {
          generateDocsHomePage(
            path.join(pagePath, 'index.js'),
            docData,
            generatorConfig,
            'Documents',
          );

          generateProjectDocPage(
            path.join(pagePath, readme.id, 'index.js'),
            readme.path,
            { key: name },
            generatorConfig,
            titleCase(doc.id),
          );

          return {
            id: doc.id,
            pagePath: path.join('/', pagePath, readme.id),
            children: scanAndGenerate(
              doc.children.filter(c => !(c.id.toLowerCase() === 'readme')),
              path.join(docsPath, doc.id),
            ),
          };
        }
        generateDocsHomePage(
          path.join(pagePath, 'index.js'),
          docData,
          generatorConfig,
          'Documents',
        );
        return {
          id: doc.id,
          pagePath: path.join('/', pagePath),
          children: scanAndGenerate(doc.children, path.join(docsPath, doc.id)),
        };
      }

      generateProjectDocPage(
        `${pagePath}.js`,
        doc.path,
        { key: name },
        generatorConfig,
        titleCase(doc.id),
      );

      return {
        id: doc.id,
        pagePath: path.join('/', pagePath),
      };
    });

  return scanAndGenerate(docsInfo, name);
};

/**
 * Clean up packages and docs so we don't have ghost pages
 * @param pagesPath the absolute path to the `/pages` directory in next
 * @param docsList list of documents
 */
const cleanPages = (pagesPath, docsList) => {
  // This error handling should likely be lifted to when we start executing the whole thing
  if (typeof pagesPath !== 'string' || pagesPath.length < 1) {
    throw new Error(
      "We were worried we were going to erase files from the wrong place so we're stopping",
    );
  }
  const oldPackagePages = path.join(pagesPath, 'packages');
  const oldRootPage = path.join(pagesPath, 'readme.js');
  rimraf.sync(oldPackagePages);
  rimraf.sync(oldRootPage);

  docsList.forEach(oldDoc => {
    const oldDocsPaths = path.join(pagesPath, oldDoc.name.toLowerCase());
    rimraf.sync(oldDocsPaths);
  });
};

const generateRootReadMePage = (pagePath, generatorConfig, docKeys) => {
  if (fs.existsSync(pagePath)) {
    generateProjectDocPage(
      'readme.js',
      pagePath,
      { key: 'readme' },
      generatorConfig,
      'readme',
    );
    const navItems = [{ id: 'packages', pagePath: '/packages' }];

    return [...navItems, ...docKeys.map(x => ({ id: x, pagePath: `/${x}` }))];
  }

  return undefined;
};

/**
 * generates all the pages needed for the docs website
 * @param packagesPaths a list of directory path patterns to be scanned
 * @param docsList
 * @param pagesPath path to the output pages directory
 * @param componentsPath path to helper components/wrappers
 * @param options configuration options
 *
 * @param readMePath
 * @returns a promise resolving to an object representing the
 * schema of the pages created
 */
module.exports = async function generatePages(
  packagesPaths,
  docsList,
  pagesPath,
  componentsPath,
  options = {},
  readMePath,
) {
  cleanPages(pagesPath, docsList);

  const packageInfo = getPackageInfo(packagesPaths, {
    useManifests: options.useManifests,
    showSubExamples: options.showSubExamples,
  });

  const generatorConfig = {
    pagesPath,
    wrappersPath: componentsPath,
  };

  const packageSitemap = generatePackagePages(packageInfo, generatorConfig);
  const docsSitemap = {};

  docsList.forEach(item => {
    const docsInfo = getDocsInfo(item.docsPath);
    const pathName = filenamify(
      item.name
        .toLowerCase()
        .split(' ')
        .join('-'),
    );

    if (docsInfo) {
      docsSitemap[pathName] = generateProjectDocsPages(
        docsInfo,
        generatorConfig,
        pathName,
      );
    }
  });

  const readme = generateRootReadMePage(
    readMePath,
    generatorConfig,
    Object.keys(docsSitemap),
  );

  return {
    packages: packageSitemap,
    ...docsSitemap,
    metaData: packagesData,
    readme,
  };
};
