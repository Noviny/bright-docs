/** This is metadata specified in the frontmatter of markdown pages */
export type PageMeta = {
  /** Title of the page, defaults to titlecased version of doc.id (filename) */
  title: string;
};

export interface BasePage<T> {
  id: string;
  pagePath: string;
  children?: Array<T>;
}

export interface DocsPage extends BasePage<DocsPage> {
  meta: PageMeta;
}

export interface ExamplePage extends BasePage<ExamplePage> {
  isolatedPath: string;
}

export interface NestedExamplePage extends ExamplePage {
  children: ExamplePage[];
}

export type Page = DocsPage | ExamplePage | NestedExamplePage;

type Maintainers = string | string[];

type Repository = string | { type: string; url: string; directory?: string };

type PackageMeta = {
  id: string;
  description: string;
  version: string;
  maintainers?: Maintainers;
  repository?: Repository;
};

export declare type PackageMetadata = {
  metaData: PackageMeta[];
};

export declare type PackageInfo = {
  id: string;
  description: string;
  version: string;
  maintainers?: Maintainers;
  packageId: string;
  homePath: string;
  homeMeta: PageMeta | undefined;
  changelogPath: string;
  docs: DocsPage[];
  examples: ExamplePage[];
  subExamples: NestedExamplePage[];
  repository: Repository;
  parentId?: string;
  packageTitle?: string;
};

export type pageType =
  | 'package:changelog'
  | 'package:doc'
  | 'package:exampe'
  | 'package:home'
  | 'doc:doc';

export type TemplateSpecifier = {
  page: pageType;
  position: 'above' | 'below' | 'replace';
  // Path to the component from the docs config
  component: string;
};
