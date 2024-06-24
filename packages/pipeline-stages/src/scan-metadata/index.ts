import fs from 'fs-extra';
import path from 'path';
import createStage from '../make-pipeline-stage';
import { PackageInfo, ProjectDocsSection } from '../common/project-info';
import { ProjectDocsConfig } from '../common/configuration-options';
import getPackageInfo from './get-package-info';
import getDocsInfo from './get-docs-info';

interface StageInput {
  // Absolute path to the root of the project
  rootPath: string;
  // User configured glob patterns for where to find packages
  packagePathPatterns: string[];
  // User configured package field names to show in the website
  customPackageFields: string[];
  // User defined readme file to use as the get started page
  readmePath?: string;
  docs: ProjectDocsConfig[];
  showSubExamples: boolean;
}

// Boilerplate, uncomment when used
// interface StageConfig {}

interface StageOutput {
  // A list of packages to create pages for, segmented into groups
  packages: PackageInfo[];
  // sections of docs
  projectDocs: ProjectDocsSection[];
  // Absolute path to the project's README
  readmePath?: string;
}

export default createStage(
  'scan-metadata',
  async ({
    rootPath,
    packagePathPatterns,
    customPackageFields,
    readmePath,
    docs,
    showSubExamples,
  }: StageInput): Promise<StageOutput> => {
    const packages = await getPackageInfo({
      packagePathPatterns,
      customPackageFields,
      cwd: rootPath,
      showSubExamples,
    });

    const resolvedReadme = readmePath || path.join(rootPath, 'README.md');
    const hasReadme = await fs.pathExists(resolvedReadme);

    const projectDocs: (ProjectDocsSection | null)[] = await Promise.all(
      docs.map(({ path: docsPath, name, urlPath }) => {
        const docsInfo = getDocsInfo(docsPath);
        if (docsInfo) {
          const websitePath = urlPath || path.relative(rootPath, docsPath);
          return {
            docs: docsInfo,
            name,
            websitePath,
          };
        }

        return null;
      }),
    );

    return {
      packages,
      readmePath: hasReadme ? resolvedReadme : undefined,
      projectDocs: projectDocs.filter(
        (x: ProjectDocsSection | null): x is ProjectDocsSection => x !== null,
      ),
    };
  },
);
