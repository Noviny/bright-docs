import assertValidTemplate from '../test-utils';
import exampleTemplate from './index';

describe('example page template', () => {
  const source = exampleTemplate('./component/path', './wrapper/path');

  it('creates valid source code for a page', () => {
    assertValidTemplate(source);
  });

  it('should create an array of children that includes the default export', () => {
    expect(source).toMatch(
      /\[{\s*name: 'default',\s*component: <Components.default \/>\s*}/,
    );
  });

  it('create an array of children that includes non-default exports', () => {
    expect(source).toMatch(
      /\.{3}Object\.keys.*componentName => componentName !== 'default'/,
    );

    expect(source).toMatch(
      /map\(([a-zA-Z]*) => .*return .*name: ([a-zA-Z]*).*component: <[a-zA-Z]* \/>/s,
    );
  });
});
