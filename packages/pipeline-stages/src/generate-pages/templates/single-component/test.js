import assertValidTemplate from '../test-utils';
import singleComponentTemplate from './index';

describe('single component page template', () => {
  it('creates valid source code for a page', () => {
    const source = singleComponentTemplate('./wrapper/path');

    assertValidTemplate(source);
  });
});
