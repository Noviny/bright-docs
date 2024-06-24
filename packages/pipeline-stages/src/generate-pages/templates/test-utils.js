const assertImportsReact = source => {
  expect(source).toMatch(/^import React from 'react';$/m);
};

const assertValidTemplate = source => {
  assertImportsReact(source);
};

export default assertValidTemplate;
