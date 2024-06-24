import filenamify from 'filenamify';

import createStage from '../make-pipeline-stage';
import generatePackageInfo, {
  PackageMeta,
  PackageSitemap,
} from './generate-package-info';
import { DocPage, GenericPage, PagesSpec } from '../common/page-specs';
import generateDocsInfo, { DocsSitemapEntry } from './generate-docs-info';
import { PackageInfo, ProjectDocsSection } from '../common/project-info';

export interface StageInput {
  // A list of packages to create pages for, segmented into groups
  packages: PackageInfo[];
  // sections of docs
  projectDocs: ProjectDocsSection[];
  // Absolute path to the project's README
  readmePath?: string;
}

interface ProjectDocsSitemap {
  [docId: string]: DocsSitemapEntry[];
}

interface Sitemap {
  packages: PackageSitemap[];
  docs: ProjectDocsSitemap;
}

export interface StageOutput {
  pages: PagesSpec;
  sitemap: Sitemap;
  packagesMeta: PackageMeta[];
  // data used by the readme nav
  readmePageData?: {
    id: string;
    pagePath: string;
  }[];
}

export default createStage(
  'generate-website-info',
  async ({
    packages,
    projectDocs,
    readmePath,
  }: StageInput): Promise<StageOutput> => {
    const packageInfo = generatePackageInfo(packages);

    const projectDocsSitemap: ProjectDocsSitemap = {};
    const projectDocsHomePages: GenericPage[] = [];
    const projectDocPages: DocPage[] = [];
    const docsMainPages: GenericPage[] = [];

    const readmePageData = [{ id: 'packages', pagePath: '/packages' }];

    projectDocs.forEach(({ name, websitePath, docs }) => {
      const docsKey = filenamify(
        name
          .toLowerCase()
          .split(' ')
          .join('-'),
      );

      docsMainPages.push({
        websitePath,
        pageData: { key: docsKey },
        title: name,
      });

      const docsInfo = generateDocsInfo(docs, websitePath, {}, docsKey);
      projectDocsSitemap[docsKey] = docsInfo.sitemap;
      projectDocsHomePages.push(...docsInfo.pages.docsHomePages);
      projectDocPages.push(...docsInfo.pages.docsPages);

      readmePageData.push({ id: docsKey, pagePath: `/${websitePath}` });
    });

    projectDocPages.push({
      websitePath: 'readme',
      markdownPath: readmePath,
      pageData: { key: 'readme' },
      meta: { data: 'readme' },
    });

    return {
      sitemap: {
        packages: packageInfo.sitemap,
        docs: projectDocsSitemap,
      },
      readmePageData,
      packagesMeta: packageInfo.meta,
      pages: {
        packageHomePages: packageInfo.pages.packageHomePages,
        packageDocPages: packageInfo.pages.docsPages,
        docsHomePages: [
          ...projectDocsHomePages,
          ...packageInfo.pages.docsHomePages,
        ],
        examplesHomePages: packageInfo.pages.examplesHomePages,
        examplePages: packageInfo.pages.examplesPages,
        changelogPages: packageInfo.pages.changelogPages,
        docsMainPages,
        projectDocPages,
      },
    };
  },
);
