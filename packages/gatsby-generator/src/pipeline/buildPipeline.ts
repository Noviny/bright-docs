import path from 'path';
import fs from 'fs-extra';
import {
  scanMetadataStage,
  generateWebsiteInfoStage,
  generatePagesStage,
} from '@brisk-docs/pipeline-stages';
import runGatsby from './stages/run-gatsby';
import allPaths from './getAllPaths';

// TODO: build pipeline will have a build step and no run step
const buildPipeline = async (
  configPath?: string,
  gatsbyOptions: string[] = [],
) => {
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
        command: 'build',
        configPath,
        pkgRoot,
        rootPath,
        gatsbyOptions,
      }),
    )
    .then(() => {
      // Gatsby doesn't allow you to configure the output dir but we would like to hoist it out
      fs.move(path.join(pkgRoot, 'public'), path.join(rootPath, 'brisk-out'), {
        overwrite: true,
      });
    })
    .then(() => {
      console.log('Build with brisk-docs success! 🎿');
    });
};

export default buildPipeline;
