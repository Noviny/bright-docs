import assertValidTemplate from '../test-utils';
import wrappedComponentTemplate from './index';

describe('wrapped component page template', () => {
  it('creates valid source code for a page', () => {
    const source = wrappedComponentTemplate(
      './component/path',
      './wrapper/path',
    );

    assertValidTemplate(source);
  });
});
