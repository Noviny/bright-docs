export interface DocsItem {
  // Id of the root page in the tree
  id: string;
  // Metadata about the doc page
  meta: object;
  // Absolute path to the user generated markdown for this doc
  markdownPath: string;
}

export interface DocsGroup {
  // Id of the root page in the tree
  id: string;
  // Metadata about the doc page
  meta: object;
  // Child docs from this docs item
  children: DocsTreeNode[];
}

export type DocsTreeNode = DocsGroup | DocsItem;

export interface ExampleGroup {
  id: string;
  children: ExampleTreeNode[];
}

export interface ExampleItem {
  id: string;
  // Absolute path to the example file
  exampleModulePath: string;
}

export type ExampleTreeNode = ExampleGroup | ExampleItem;

export interface PackageInfo {
  id: string;
  // The id of the parent folder if this is a nested package
  parentId?: string;
  name?: string;
  // package.json fields to display
  packageFields: {
    [field: string]: any;
  };
  // Absolute path to the README of the package
  readmePath?: string;
  // Metdata extracted from the README frontmatter
  readmeMeta: object;
  // Display name for the package. This can be removed during Links refactor.
  packageTitle?: string;
  // Absolute path to the changelog for the package
  changelogPath?: string;
  // Nested docs for this package
  docs: DocsTreeNode[];
  // Top level examples for this package
  examples: ExampleItem[];
  // Tree of inner package examples
  subExamples: ExampleTreeNode[];
  pkg: {
    [key: string]: any;
  };
}

// A group of docs to be shown on the top level of the website
export interface ProjectDocsSection {
  name: string;
  docs: DocsTreeNode[];
  // User configurable path for where this group of docs should live on the website
  websitePath: string;
}
