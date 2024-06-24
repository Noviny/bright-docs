const outdent = require('outdent');

/**
 * changelogTemplate - template for generating a changelog page
 *
 * @param {string} changelogPath relative path to the changelog file
 * @param {string} wrapperPath   relative path to the page template component
 * @param {object} [data={}]     extra data needed by the page
 *
 * @returns {string} source code for the page
 */
const changelogTemplate = (
  changelogPath: string,
  wrapperPath: string,
  data = {},
) => outdent`
  import React from 'react';
  import changelog from '!!raw-loader!${changelogPath}';
  import Wrapper from '${wrapperPath}';

  export default () => (
    <Wrapper data={${JSON.stringify(data)}}>
        {changelog}
    </Wrapper>
  );
`;

export default changelogTemplate;
