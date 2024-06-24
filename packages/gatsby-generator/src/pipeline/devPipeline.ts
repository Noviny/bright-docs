import {
  scanMetadataStage,
  generateWebsiteInfoStage,
  generatePagesStage,
} from '@brisk-docs/pipeline-stages';
import runGatsby from './stages/run-gatsby';
import allPaths from './getAllPaths';

const devPipeline = async (configPath?: string, gatsbyOptions?: string[]) => {
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
    .then(() =>
      runGatsby({
        command: 'develop',
        configPath,
        pkgRoot,
        rootPath,
        gatsbyOptions,
      }),
    );
};

export default devPipeline;
