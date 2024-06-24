import assertValidTemplate from '../test-utils';
import changelogTemplate from './index';

describe('changelog page templates', () => {
  it('creates valid source code for a page', () => {
    const source = changelogTemplate('./component/path', './wrapper/path');

    assertValidTemplate(source);
  });
});
