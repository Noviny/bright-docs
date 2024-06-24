import { TemplateSpecifier } from '../../../types';

const outdent = require('outdent');

const getTemplateAtPosition = (
  templates: TemplateSpecifier[],
  position: 'above' | 'below' | 'replace',
) => {
  const template = templates.find(t => t.position === position);
  if (template)
    return `<Template${position} data={data} pageComponent={Component} />`;
  return '';
};

const getTemplateImports = (templates: TemplateSpecifier[]) => {
  return templates
    .map(
      ({ component, position }) =>
        `import Template${position} from '${component}'`,
    )
    .join('\n');
};

/**
 * wrappedComponentTemplate - template for a page containing one
 * component wrapped is another, usually user content being wrapped
 * inside a page template component
 *
 * @param {string} componentPath absolute path to the inner component
 * @param {string} wrapperPath   absolute path to the wrapper component
 * @param {object} [data={}]     extra data needed by the page
 *
 * @returns {type} source code for the page
 */
const wrappedComponentTemplate = (
  componentPath: string,
  wrapperPath: string,
  data = {},
  templates: TemplateSpecifier[] = [],
) => outdent`
  import React from 'react';
  import Component from '${componentPath}';
  import Wrapper from '${wrapperPath}';
  ${getTemplateImports(templates)}


  const data = ${JSON.stringify(data)}

  export default () => (
    <Wrapper data={data}>
      ${getTemplateAtPosition(templates, 'above')}
      ${getTemplateAtPosition(templates, 'replace') || '<Component />'}
      ${getTemplateAtPosition(templates, 'below')}
    </Wrapper>
  );
`;

export default wrappedComponentTemplate;
