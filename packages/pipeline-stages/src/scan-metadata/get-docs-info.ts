// Script for building info about the top level documentation for a project.

import titleCase from 'title-case';
import fs from 'fs-extra';
import path from 'path';
import getMarkdownMeta from './get-markdown-meta';
import { DocsTreeNode } from '../common/project-info';

interface DirConfig {
  sortOrder: string[];
}

const handleConfig = (dirPath: string): DirConfig | null => {
  const defaultConfigPath = path.join(dirPath, 'docs.config.js');
  if (fs.existsSync(defaultConfigPath)) {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    return require(defaultConfigPath)();
  }

  return null;
};

// Sorts the docs for a directory inline
const sortDirectory = (processedDir: DocsTreeNode[], dirPath: string) => {
  const dirConfig = handleConfig(dirPath);

  if (dirConfig && dirConfig.sortOrder) {
    processedDir.sort((a, b) => {
      const aIndex = dirConfig.sortOrder.indexOf(a.id);
      const bIndex = dirConfig.sortOrder.indexOf(b.id);
      const wildcardIndex = dirConfig.sortOrder.indexOf('*');

      const defaultSortOrder =
        wildcardIndex === -1 ? dirConfig.sortOrder.length : wildcardIndex;
      const aSortOrder = aIndex === -1 ? defaultSortOrder : aIndex;
      const bSortOrder = bIndex === -1 ? defaultSortOrder : bIndex;

      if (aSortOrder < bSortOrder) {
        return -1;
      }
      if (bSortOrder < aSortOrder) {
        return 1;
      }

      return a.id.localeCompare(b.id);
    });
  }
};

const processDirectory = (dirPath: string): DocsTreeNode[] | null => {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    return null;
  }

  const processedDir: DocsTreeNode[] = fs
    .readdirSync(dirPath)
    .filter(file => !file.startsWith('_'))
    .map(fname => ({
      id: path.parse(fname).name,
      fullPath: path.resolve(dirPath, fname),
    }))
    .map(
      ({ id, fullPath }): DocsTreeNode | null => {
        if (fs.statSync(fullPath).isFile()) {
          if (
            path.extname(fullPath) !== '.md' &&
            path.extname(fullPath) !== '.mdx'
          ) {
            return null;
          }

          return {
            id,
            markdownPath: fullPath,
            meta: { title: titleCase(id), ...getMarkdownMeta(fullPath) },
          };
        }

        const children = processDirectory(fullPath);

        return children && children.length > 0
          ? {
              id,
              children,
              meta: {
                title: titleCase(id),
              },
            }
          : null;
      },
    )
    .filter((x: DocsTreeNode | null): x is DocsTreeNode => x !== null);

  sortDirectory(processedDir, dirPath);

  return processedDir;
};

/**
 * @param docsPath absolute path to where the docs are located
 * @returns Nested structure representing the docs in the project
 * Filter the nested structure with empty children
 */
export default function getDocsInfo(docsPath: string) {
  return processDirectory(docsPath);
}
