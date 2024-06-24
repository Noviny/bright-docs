const outdent = require('outdent');

/**
 * exampleTemplate - template for an example page where the source code
 * for the wrapped component is also passed to the wrapper
 *
 * @param {string} componentPath absolute path to the example
 * @param {string} wrapperPath   absolute path to the page wrapper
 * @param {object} [data={}]     extra data needed for the page
 *
 * @returns {string} source code for the page
 */
const exampleTemplate = (
  componentPath: string,
  wrapperPath: string,
  data = {},
) => outdent`
import React from 'react';
import fileContents from '!!raw-loader!${componentPath}';
import * as Components from '${componentPath}';
import Wrapper from '${wrapperPath}';

const Example = () => ( 
  <Wrapper data={${JSON.stringify(data)}} fileContents={fileContents}>
    {
      [{ 
          name: 'default', 
          component: <Components.default /> 
        }, 
        ...Object.keys(Components).filter(componentName => componentName !== 'default')
        .map(componentName => {
          const Component = Components[componentName];
          return {
            name: componentName,
            component: <Component />
          }
        })
      ]
    }
  </Wrapper>
)
export default Example
`;

export default exampleTemplate;
