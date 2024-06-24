import createStage from '../make-pipeline-stage';
import { GenericPage } from '../common/page-specs';
import { BriskConfiguration } from '../common/configuration-options';
import { StageOutput as WebsiteInfoSpec } from '../generate-website-info';

import * as pageWriters from './page-writers';

const {
  generatePackageDocPage,
  generateProjectDocPage,
  generateDocsHomePage,
  generateDocumentsMainPage,
  generateExamplesHomePage,
  generateExamplePage,
  generateChangelogPage,
  generateHomePage,
  addBasePages,
  cleanPages,
  generateDataPages,
} = pageWriters;

export type StageInput = {
  // Absolute path to directory containing page wrapper components
  wrappersPath: string;
  // Absolute path to the output pages directory
  pagesPath: string;
  // The absolute path to the root of the package.
  packageRoot: string;
  // The absolute path to the directory containing default pages
  defaultPagesPath: string;
} & WebsiteInfoSpec &
  BriskConfiguration;

export type StageOutput = void;

const generateGenericPage = (
  generateFn: (
    pagePath: string,
    pageData: Object,
    config: { pagesPath: string; wrappersPath: string },
    title?: string,
  ) => void,
  { websitePath, pageData, title }: GenericPage,
  config: { pagesPath: string; wrappersPath: string },
) => {
  generateFn(`${websitePath}.js`, pageData, config, title);
};

export default createStage(
  'generate-pages',
  async (input: StageInput): Promise<StageOutput> => {
    const { pagesPath, wrappersPath, defaultPagesPath } = input;
    await cleanPages(pagesPath);
    await addBasePages(defaultPagesPath, pagesPath);

    const generatorConfig = { pagesPath, wrappersPath };

    input.pages.packageDocPages.forEach(
      ({ websitePath, markdownPath, meta, pageData }) => {
        generatePackageDocPage(
          `${websitePath}.js`,
          markdownPath!,
          pageData,
          generatorConfig,
          // @ts-ignore
          meta,
        );
      },
    );

    input.pages.projectDocPages.forEach(
      ({ websitePath, markdownPath, meta, pageData }) => {
        generateProjectDocPage(
          `${websitePath}.js`,
          markdownPath!,
          pageData,
          generatorConfig,
          // @ts-ignore
          meta,
        );
      },
    );

    input.pages.examplePages.forEach(
      ({
        websitePath,
        fullscreenExampleWebsitePath,
        exampleModulePath,
        pageData,
        title,
      }) => {
        generateExamplePage(
          `${websitePath}.js`,
          `${fullscreenExampleWebsitePath}.js`,
          exampleModulePath,
          pageData,
          generatorConfig,
          title,
        );
      },
    );

    input.pages.changelogPages.forEach(
      ({ websitePath, changelogPath, pageData }) => {
        generateChangelogPage(
          `${websitePath}.js`,
          changelogPath!,
          pageData,
          generatorConfig,
        );
      },
    );

    input.pages.packageHomePages.forEach(
      ({ websitePath, markdownPath, meta, pageData }) => {
        generateHomePage(
          `${websitePath}.js`,
          markdownPath!,
          pageData,
          generatorConfig,
          // @ts-ignore
          meta,
          input.templates,
        );
      },
    );

    input.pages.docsHomePages.forEach(page => {
      generateGenericPage(generateDocsHomePage, page, generatorConfig);
    });

    input.pages.docsMainPages.forEach(page => {
      generateGenericPage(generateDocumentsMainPage, page, generatorConfig);
    });

    input.pages.examplesHomePages.forEach(page => {
      generateGenericPage(generateExamplesHomePage, page, generatorConfig);
    });

    generateDataPages(input);
  },
);
