const outdent = require('outdent');

/**
 * basicSingleComponentTemplate - Template for a page that renders a single component
 *
 * @param {string} wrapperPath absolute path to the component being rendered
 * @param {object} [data={}]   extra data needed for the page
 *
 * @returns {string} source code for the page
 */
const basicSingleComponentTemplate = (
  wrapperPath: string,
  data = {},
) => outdent`
    import React from 'react';
    import Wrapper from '${wrapperPath}';

    export default () => (
      <Wrapper data={${JSON.stringify(data)}} />
    );
`;

export default basicSingleComponentTemplate;
