import path from 'path';

import { DocPage, GenericPage } from '../common/page-specs';
import { DocsGroup, DocsItem, DocsTreeNode } from '../common/project-info';

export interface DocsSitemapEntry {
  // id of the root page in the sitemap entry
  id: string;
  // metadata about the root page in the sitemap entry
  meta: object;
  // path to this doc page in the website
  pagePath: string;
  // Child docs to this one
  children?: DocsSitemapEntry[];
}

// Website information about a collection of docs
export interface DocsInfo {
  // The hierarchy of docs as it appears in the website
  sitemap: DocsSitemapEntry[];
  // Specs for all the pages that appear in the sitemap
  pages: {
    docsPages: DocPage[];
    docsHomePages: GenericPage[];
  };
}

const isDocsGroup = (docsNode: any): docsNode is DocsGroup =>
  !!docsNode.children;

const generateDocsInfo = (
  docs: DocsTreeNode[],
  // website path to the root page for where the docs will be placed
  docsPath: string,
  // additional data to be embedded in each page
  pageData: object,
  // identifier for which docs section is being generated
  key?: string,
): DocsInfo => {
  const docsPages: DocPage[] = [];
  const docsHomePages: GenericPage[] = [];
  const sitemap: DocsSitemapEntry[] = [];

  docs.forEach(doc => {
    const websitePath = path.join(docsPath, doc.id);

    if (isDocsGroup(doc)) {
      // If the children contains a readme, use it as the index for this group
      // in the tree. Otherwise, create a home page to act as the index.
      const isReadme = (docsNode: DocsTreeNode): boolean =>
        !isDocsGroup(docsNode) &&
        path.basename(docsNode.markdownPath).toLowerCase() === 'readme.md';

      const readme = doc.children.find(isReadme);
      const childDocs = doc.children.filter(c => !isReadme(c));

      if (readme) {
        docsPages.push({
          websitePath,
          markdownPath: (readme as DocsItem).markdownPath,
          pageData: { ...pageData, key },
          meta: readme.meta,
        });
      } else {
        docsHomePages.push({
          websitePath,
          pageData: {
            key,
            id: doc.id,
            children: childDocs.map(child => ({
              id: child.id,
              meta: child.meta,
              pagePath: path.join(`/${websitePath}`, child.id),
            })),
          },
        });
      }

      const childDocsInfo = generateDocsInfo(
        childDocs,
        websitePath,
        pageData,
        key,
      );
      docsPages.push(...childDocsInfo.pages.docsPages);
      docsHomePages.push(...childDocsInfo.pages.docsHomePages);

      sitemap.push({
        id: doc.id,
        pagePath: path.join('/', websitePath),
        meta: doc.meta,
        children: childDocsInfo.sitemap,
      });
    } else {
      docsPages.push({
        websitePath,
        markdownPath: doc.markdownPath,
        pageData: { ...pageData, key },
        meta: doc.meta,
      });

      sitemap.push({
        id: doc.id,
        pagePath: path.join('/', websitePath),
        meta: doc.meta,
      });
    }
  });

  return {
    sitemap,
    pages: {
      docsPages,
      docsHomePages,
    },
  };
};

export default generateDocsInfo;
