// This script generates pages for the packages, without moving where they are in the
// file system. It maps over all the files that we want, and generates a new file in
// pages for them, that reference back to their original location.
//
// This script needs to be run before devving starts.

const path = require('path');
const fse = require('fs-extra');

const generatePages = require('./page-generator');

const packageRoot = path.resolve(__dirname, '..', '..');

module.exports = async ({
  packagesPaths,
  docsPath,
  useManifests,
  webpackConfiguration,
  showSubExamples,
  siteName,
}) => {
  const pagesPath = path.resolve(packageRoot, './pages');
  const componentsPath = path.resolve(
    packageRoot,
    './src/components/page-templates',
  );

  const pagesList = await generatePages(
    packagesPaths,
    docsPath,
    pagesPath,
    componentsPath,
    {
      useManifests,
      webpackConfiguration,
      showSubExamples,
    },
  );
  const { packages, docs, metaData } = pagesList;

  const pagesListPath = path.resolve(packageRoot, 'data/pages-list.json');
  const packagesDataPath = path.resolve(packageRoot, 'data/packages-data.json');
  const metaPath = path.resolve(packageRoot, 'data/site-meta.json');

  fse.ensureFileSync(pagesListPath);
  fse.writeFileSync(
    pagesListPath,

    JSON.stringify({ packages, docs }, undefined, 2),
  );

  fse.ensureFileSync(packagesDataPath);
  fse.writeFileSync(
    packagesDataPath,

    JSON.stringify({ metaData }, undefined, 2),
  );
  fse.writeFileSync(
    metaPath,

    JSON.stringify({ siteName }, undefined, 2),
  );
};
