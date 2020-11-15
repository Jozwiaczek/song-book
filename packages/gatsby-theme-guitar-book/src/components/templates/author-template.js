import PropTypes from 'prop-types';
import React, { createContext, useContext } from 'react';
import { graphql, navigate } from 'gatsby';

import Img from 'gatsby-image';

import styled from '@emotion/styled';

import SEO from '../seo';
import ContentWrapper from '../content-wrapper';
import PageHeader from '../page-header';
import Footer from '../footer';
import PageContent from '../page-content';
import { getSlug } from '../../utils/getSlug';
import ListView from '../list-view';
import SeeMore from '../see-more';

const CustomLinkContext = createContext();

function CustomLink(props) {
  const { pathPrefix, baseUrl } = useContext(CustomLinkContext);

  const linkProps = { ...props };
  if (props.href) {
    if (props.href.startsWith('/')) {
      linkProps.onClick = function handleClick(event) {
        const href = event.target.getAttribute('href');
        if (href.startsWith('/')) {
          event.preventDefault();
          navigate(href.replace(pathPrefix, ''));
        }
      };
    } else if (!props.href.startsWith('#') && !props.href.startsWith(baseUrl)) {
      linkProps.target = '_blank';
      linkProps.rel = 'noopener noreferrer';
    }
  }

  return <a {...linkProps} />;
}

CustomLink.propTypes = {
  href: PropTypes.string,
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 5rem;
`;

const DescriptionWrapper = styled.div`
  text-align: justify;
  text-justify: auto;
`;

export default function AuthorTemplate(props) {
  const { hash, pathname } = props.location;
  const { site, contentfulAuthor } = props.data;
  const { title, description } = site.siteMetadata;
  const { avatar, name, song: songs, description: authorDescription } = contentfulAuthor;
  const { sidebarContents, githubUrl, twitterHandle, adSense, baseUrl } = props.pageContext;

  const pages = sidebarContents
    .reduce((acc, { pages }) => acc.concat(pages), [])
    .filter((page) => !page.anchor);

  return (
    <>
      <SEO
        title={name}
        description={name || description}
        siteName={title}
        baseUrl={baseUrl}
        twitterHandle={twitterHandle}
        adSense={adSense}
      />
      <ContentWrapper>
        <PageHeader title={name} description="Author" />
        <hr />
        <PageContent pathname={pathname} pages={pages} hash={hash} githubUrl={githubUrl}>
          <Container>
            {avatar && (
              <Img
                fluid={avatar.fluid}
                style={{
                  height: 'auto',
                  maxHeight: '400px',
                  width: '100%',
                }}
                imgStyle={{
                  objectFit: 'contain',
                }}
              />
            )}
            {authorDescription && (
              <DescriptionWrapper>
                <SeeMore text={authorDescription.description} limit={1000} />
              </DescriptionWrapper>
            )}
          </Container>
          {songs && (
            <ListView
              title="Song list"
              items={songs.map(({ title }) => ({ title, path: getSlug(name, title) }))}
            />
          )}
          <CustomLinkContext.Provider
            value={{
              pathPrefix: site.pathPrefix,
              baseUrl,
            }}
          >
            <div style={{ whiteSpace: 'break-spaces' }} />
          </CustomLinkContext.Provider>
        </PageContent>
        <Footer />
      </ContentWrapper>
    </>
  );
}

AuthorTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export const AuthorTemplateQuery = graphql`
  query AuthorTemplateQuery($id: String) {
    site {
      pathPrefix
      siteMetadata {
        title
        description
      }
    }
    contentfulAuthor(id: { eq: $id }) {
      name
      description {
        description
      }
      avatar {
        fluid(maxHeight: 600, quality: 100) {
          ...GatsbyContentfulFluid
        }
      }
      song {
        title
      }
    }
  }
`;