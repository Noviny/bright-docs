// Collection of shared interfaces for specifying pages to generate

export interface GenericPage {
  // The path this page should appear at in the finished website
  websitePath: string;
  // Additional data used by the page
  pageData: object;
  // Window title for this page
  title?: string;
}

export interface DocPage {
  // The path this page should appear at in the finished website
  websitePath: string;
  // An absolute path to the location of the user generated markdown content
  markdownPath?: string;
  // Additional data used by the page
  pageData: object;
  // Metadata about the page
  meta: object;
}

export interface ExamplePage {
  // The path the example page should appear at in the finished website
  websitePath: string;
  // The path the fullscreen example page should appear at in the finished website
  fullscreenExampleWebsitePath: string;
  // An absolute path to the location of the user generated example
  exampleModulePath: string;
  // Additional data used by the page
  pageData: object;
  // Window title for this page
  title?: string;
}

export interface ChangelogPage {
  // The path this page should appear at in the finished website
  websitePath: string;
  // An absolute path to the location of the user generated changelogs
  changelogPath?: string;
  // Additional data used by the page
  pageData: object;
  // Window title for this page
  title?: string;
}

// A specification for what pages should be created in the website
export interface PagesSpec {
  // List of package level docs to be generated
  packageDocPages: DocPage[];
  // List of project level docs to be generated
  projectDocPages: DocPage[];
  // List of docs index pages to be generated.
  docsHomePages: GenericPage[];
  // List of home pages for docs sections
  docsMainPages: GenericPage[];
  // List of examples to be generated
  examplePages: ExamplePage[];
  // List of examples index pages to be generated.
  examplesHomePages: GenericPage[];
  // List of changelogs to be generated
  changelogPages: ChangelogPage[];
  // List of package landing pages to be generated
  packageHomePages: DocPage[];
}
