import {
  scanMetadataStage,
  generateWebsiteInfoStage,
  generatePagesStage,
} from '@brisk-docs/pipeline-stages';

import allPaths from './getAllPaths';

const buildPipeline = async (configPath?: string) => {
  const {
    rootPath,
    wrappersPath,
    pagesPath,
    pkgRoot,
    config,
    defaultPagesPath,
  } = await allPaths(configPath);

  return scanMetadataStage({
    rootPath,
    packagePathPatterns: config.packagesPaths,
    customPackageFields: config.customPackageFields,
    docs: config.docs,
    showSubExamples: config.showSubExamples,
  })
    .then(projectData => generateWebsiteInfoStage(projectData))
    .then(websiteInfo =>
      generatePagesStage({
        wrappersPath,
        pagesPath,
        defaultPagesPath,
        packageRoot: pkgRoot,
        ...websiteInfo,
        ...config,
      }),
    )
    .then(() => console.log('pages built'));
};

export default buildPipeline;
