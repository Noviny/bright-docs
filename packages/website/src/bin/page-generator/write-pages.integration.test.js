import { createTempDir } from 'jest-fixtures';
import path from 'path';
import fse from 'fs-extra';

import * as generators from './write-pages';

import getMarkdownMeta from './get-markdown-meta';

const assertNoAbsoluteImports = source => {
  expect(source).not.toMatch(/^import .+ from '\/.+'/m);
};

jest.mock('./get-markdown-meta', () => jest.fn(() => ({ mocked: 'meta' })));

describe('Page templates', () => {
  let cwd;
  let pagesPath;
  let wrappersPath;

  const getOutput = filename => {
    const outputPath = path.join(pagesPath, filename);
    return fse.readFileSync(outputPath, { encoding: 'utf-8' });
  };

  beforeEach(async () => {
    cwd = await createTempDir();
    pagesPath = path.join(cwd, 'pages');
    wrappersPath = path.join(cwd, 'wrappers');
  });

  it('creates js for a package home page', () => {
    const readmePath = path.join(cwd, 'README.md');
    fse.writeFileSync(readmePath, '');
    generators.generateHomePage(
      'output.js',
      readmePath,
      {},
      { wrappersPath, pagesPath },
    );

    const output = getOutput('output.js');

    assertNoAbsoluteImports(output);
    expect(output).toMatchInlineSnapshot(`
"import React from 'react';
import Component from '../README.md';
import Wrapper from '../wrappers/package-home';

export default () => (
  <Wrapper data={{\\"pagePath\\":\\"output.js\\",\\"pageTitle\\":\\"\\"}}>
      <Component />
  </Wrapper>
);"
`);
  });

  it('parses and returns meta from package home page readme', () => {
    const readmePath = path.join(cwd, 'README.md');
    const returnVal = generators.generateHomePage(
      'output.js',
      readmePath,
      {},
      { wrappersPath, pagesPath },
    );

    expect(getMarkdownMeta).toHaveBeenCalledWith(readmePath);
    expect(returnVal).toEqual({ meta: { mocked: 'meta' } });
  });

  it('creates js for a package home page even when there is no README file', () => {
    generators.generateHomePage(
      'output.js',
      '',
      {},
      { wrappersPath, pagesPath },
    );

    const output = getOutput('output.js');
    expect(output).not.toMatch(/^import .+ from '\undefined'/m);
    expect(output).toMatchInlineSnapshot(`
"import React from 'react';
import Wrapper from '../wrappers/package-home';

export default () => (
  <Wrapper data={{\\"pagePath\\":\\"output.js\\",\\"pageTitle\\":\\"\\"}} />
);"
`);
  });

  it('should not attempt to retrieve meta if README file does not exist', () => {
    const returnVal = generators.generateHomePage(
      'output.js',
      '',
      {},
      { wrappersPath, pagesPath },
    );

    expect(getMarkdownMeta).not.toHaveBeenCalled();
    expect(returnVal).toEqual({ meta: {} });
  });

  it('creates js for a package doc page', () => {
    const readmePath = path.join(cwd, 'README.md');
    generators.generatePackageDocPage(
      'output.js',
      readmePath,
      {},
      { wrappersPath, pagesPath },
    );

    const output = getOutput('output.js');

    assertNoAbsoluteImports(output);
    expect(output).toMatchInlineSnapshot(`
"import React from 'react';
import Component from '../README.md';
import Wrapper from '../wrappers/package-docs';

export default () => (
  <Wrapper data={{\\"pagePath\\":\\"output.js\\",\\"pageTitle\\":\\"\\"}}>
      <Component />
  </Wrapper>
);"
`);
  });

  it('parses and returns meta from package doc pages', () => {
    const readmePath = path.join(cwd, 'README.md');
    const returnVal = generators.generatePackageDocPage(
      'output.js',
      readmePath,
      {},
      { wrappersPath, pagesPath },
    );

    expect(getMarkdownMeta).toHaveBeenCalledWith(readmePath);
    expect(returnVal).toEqual({ meta: { mocked: 'meta' } });
  });

  it('creates js for a package example pages', () => {
    generators.generateExamplePage(
      'output.js',
      'output-raw.js',
      path.join(cwd, 'example.js'),
      {},
      { wrappersPath, pagesPath },
    );

    const output = getOutput('output.js');

    const outputRaw = getOutput('output-raw.js');

    assertNoAbsoluteImports(output);

    assertNoAbsoluteImports(outputRaw);
    expect(output).toMatchSnapshot();
    expect(outputRaw).toMatchInlineSnapshot(`
"import React from 'react';
import Wrapper from '../../example';

export default () => (
  <Wrapper data={{\\"pageTitle\\":\\"\\"}} />
);"
`);
  });

  it('creates js for a docs home page', () => {
    generators.generateDocsHomePage(
      'output.js',
      {},
      { wrappersPath, pagesPath },
    );

    const output = getOutput('output.js');

    assertNoAbsoluteImports(output);

    expect(output).toMatchInlineSnapshot(`
"import React from 'react';
import Wrapper from '../wrappers/item-list';

export default () => (
  <Wrapper data={{\\"pagePath\\":\\"output.js\\",\\"pageTitle\\":\\"\\",\\"pageType\\":\\"docs\\"}} />
);"
`);
  });

  it('creates js for an examples home page', () => {
    generators.generateExamplesHomePage(
      'output.js',
      {},
      { wrappersPath, pagesPath },
    );

    const output = getOutput('output.js');

    assertNoAbsoluteImports(output);

    expect(output).toMatchInlineSnapshot(`
"import React from 'react';
import Wrapper from '../wrappers/item-list';

export default () => (
  <Wrapper data={{\\"pagePath\\":\\"output.js\\",\\"pageTitle\\":\\"\\",\\"pageType\\":\\"examples\\"}} />
);"
`);
  });

  it('creates js for project doc page', () => {
    const readmePath = path.join(cwd, 'README.md');
    generators.generateProjectDocPage(
      'output.js',
      readmePath,
      {},
      { wrappersPath, pagesPath },
    );

    const output = getOutput('output.js');

    assertNoAbsoluteImports(output);
    expect(output).toMatchInlineSnapshot(`
"import React from 'react';
import Component from '../README.md';
import Wrapper from '../wrappers/project-docs';

export default () => (
  <Wrapper data={{\\"pagePath\\":\\"output.js\\",\\"pageTitle\\":\\"\\"}}>
      <Component />
  </Wrapper>
);"
`);
  });

  it('parses and returns meta from project doc pages', () => {
    const readmePath = path.join(cwd, 'README.md');
    const returnVal = generators.generateProjectDocPage(
      'output.js',
      readmePath,
      {},
      { wrappersPath, pagesPath },
    );
    expect(getMarkdownMeta).toHaveBeenCalledWith(readmePath);
    expect(returnVal).toEqual({ meta: { mocked: 'meta' } });
  });
});
