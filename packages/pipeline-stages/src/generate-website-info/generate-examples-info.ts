import path from 'path';
import titleCase from 'title-case';

import { ExamplePage } from '../common/page-specs';
import { ExampleItem, ExampleTreeNode } from '../common/project-info';

export interface ExampleSitemapEntry {
  id: string;
  // Website path to the example page
  pagePath?: string;
  // Website path to the full screen example page
  isolatedPagePath?: string;
  // Nested examples
  children?: ExampleSitemapEntry[];
}

interface ExamplesInfo {
  sitemap: ExampleSitemapEntry[];
  pages: {
    examplePages: ExamplePage[];
  };
}

const isExampleItem = (exampleNode: any): exampleNode is ExampleItem =>
  !!exampleNode.exampleModulePath;

const generateExamplesInfo = (
  examples: ExampleTreeNode[],
  examplesPath: string,
  // additional data to be embedded in each page
  pageData: object,
): ExamplesInfo => {
  const sitemap: ExampleSitemapEntry[] = [];
  const examplePages: ExamplePage[] = [];

  examples.forEach(example => {
    const websitePath = path.join(examplesPath, example.id);

    if (isExampleItem(example)) {
      const fullscreenExampleWebsitePath = path.join(
        examplesPath,
        'isolated',
        example.id,
      );
      const isolatedPath = path.join('/', `${fullscreenExampleWebsitePath}`);
      const pageTitle = titleCase(example.id);

      examplePages.push({
        websitePath,
        fullscreenExampleWebsitePath,
        exampleModulePath: example.exampleModulePath,
        pageData: {
          pageTitle,
          isolatedPath,
          ...pageData,
        },
        title: pageTitle,
      });

      sitemap.push({
        id: example.id,
        pagePath: path.join('/', websitePath),
        isolatedPagePath: isolatedPath,
      });
    } else {
      const childrenInfo = generateExamplesInfo(
        example.children,
        websitePath,
        {},
      );

      sitemap.push({
        id: example.id,
        children: childrenInfo.sitemap,
      });
      examplePages.push(...childrenInfo.pages.examplePages);
    }
  });

  return {
    sitemap,
    pages: {
      examplePages,
    },
  };
};

export default generateExamplesInfo;
