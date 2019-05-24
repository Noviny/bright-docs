import React from 'react';
import * as PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { colors } from '@atlaskit/theme';
import SectionMessage from '@atlaskit/section-message';
import titleCase from 'title-case';

import NavigationWrapper from '../navigation-wrapper';
import Wrapper from '../content-style-wrapper';
import PackageNavContent from '../navigation/package-nav-content';
import PackageMetaData from '../package-metadata';
import LinkButton from '../link-button';
import PageTitle from '../page-title';
import pageInfo from '../../pages-list';

export const Description = styled.h3`
  color: ${colors.N900};
  font-size: 16px;
  font-weight: 300;
  line-height: 1.4em;
  margin-top: 16px;
`;

const LinkButtonContainer = styled.div`
  margin: 0 2px;

  &:hover a {
    background-color: ${colors.N30A};
    cursor: pointer;
  }
`;

const Header = ({ id, heading }) => {
  const packages = pageInfo.packages.find(pkg => pkg.packageId === id);

  return (
    <div
      style={{ display: 'flex', justifyContent: 'space-between' }}
      data-testid={`${id}-header`}
    >
      <h1>{heading}</h1>
      <div style={{ display: 'inline-flex' }}>
        {packages && packages.examples.length > 0 && (
          <LinkButtonContainer>
            <LinkButton href={`/packages/${id}/examples`}>Examples</LinkButton>
          </LinkButtonContainer>
        )}
        {packages && packages.docs.length > 0 && (
          <LinkButtonContainer>
            <LinkButton href={`/packages/${id}/docs`}>Documentation</LinkButton>
          </LinkButtonContainer>
        )}
      </div>
    </div>
  );
};

Header.propTypes = {
  id: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
};

const MissingReadmeWarning = () => (
  <SectionMessage appearance="warning">
    This package does not have a README yet. Add one to include more detailed
    documentation, or even consider using MDX for interactive, richer docs.
  </SectionMessage>
);

const PackageHome = ({ data, children }) => {
  return (
    <>
      <PageTitle title={data.pageTitle} />
      <NavigationWrapper
        navContent={() => (
          <PackageNavContent
            packageId={data.id}
            packageName={data.packageName}
          />
        )}
      >
        <Wrapper pagePath={data.pagePath}>
          <Header id={data.id} heading={titleCase(data.packageName)} />
          <Description>{data.description}</Description>
          <PackageMetaData
            id={data.id}
            version={data.version}
            maintainers={data.maintainers}
            repository={data.repository}
          />
          {children || process.env.NODE_ENV !== 'development' ? (
            children
          ) : (
            <MissingReadmeWarning />
          )}
        </Wrapper>
      </NavigationWrapper>
    </>
  );
};

PackageHome.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    packageName: PropTypes.string.isRequired,
    description: PropTypes.string,
    version: PropTypes.string.isRequired,
    maintainers: PropTypes.arrayOf(PropTypes.string),
    repository: PropTypes.shape({
      url: PropTypes.string.isRequired,
      directory: PropTypes.string,
    }).isRequired,
    pageTitle: PropTypes.string,
  }).isRequired,
  children: PropTypes.node,
};

export default PackageHome;
