import * as React from 'react';
import '@atlaskit/css-reset';
import { MDXProvider } from '@mdx-js/react';
import components from '../un-src/components/mdx';
import Meta, { metadata } from '../un-src/components/meta-context';

export default class AppProvider extends React.Component<any> {
  componentDidMount() {
    /**
     * Set a marker on body indicating that we've rendered on the client side (componentDidMount does not execute on the server).
     * This is required for our cypress tests to wait before trying to fetch elements otherwise they may become stale if they are
     * fetched before React renders over the server-side DOM.
     * See https://github.com/cypress-io/cypress/issues/695#issuecomment-333158645
     */
    // eslint-disable-next-line no-undef
    document.body.dataset.clientLoaded = 'true';
  }

  render() {
    const { children } = this.props;

    return (
      <Meta.Provider value={metadata}>
        <MDXProvider components={components}>{children}</MDXProvider>
      </Meta.Provider>
    );
  }
}
