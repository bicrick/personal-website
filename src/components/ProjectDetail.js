import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ProjectDetail.css';
import SEO from './SEO';
import StructuredData from './StructuredData';
import LandingNavBar from './LandingNavBar';
import SiteNav from './SiteNav';
import TypewriterHeading from './TypewriterHeading';
import { getPageSeo } from '../constants/pages';

function ProjectDetail({
  title,
  titleLabel,
  titleSuffix = null,
  date,
  linkHref,
  linkLabel,
  secondaryLinkHref,
  secondaryLinkLabel,
  secondaryLinkInternal = false,
  abstract,
  backHref = '/projects',
  backLabel = 'projects',
  children,
}) {
  const { pathname } = useLocation();
  const seo = getPageSeo(pathname);
  const hasPrimary = Boolean(linkHref && linkLabel);
  const hasSecondary = Boolean(secondaryLinkHref && secondaryLinkLabel);

  return (
    <div className="App_mainContainer landing-page">
      <SEO {...seo} />
      <StructuredData />
      <LandingNavBar>
        <SiteNav />
      </LandingNavBar>
      <main className="App_mainColumn landing project-detail">
        <article className="project-article">
          <Link to={backHref} className="project-back">
            ← {backLabel}
          </Link>
          <header className="project-header">
            <TypewriterHeading as="h1" label={titleLabel} suffix={titleSuffix}>
              {title}
            </TypewriterHeading>
            <div className="project-meta">
              {hasPrimary && (
                <a href={linkHref} target="_blank" rel="noopener noreferrer">
                  {linkLabel}
                </a>
              )}
              {hasPrimary && hasSecondary && (
                <span className="project-meta-sep" aria-hidden="true">·</span>
              )}
              {hasSecondary && (
                secondaryLinkInternal ? (
                  <Link to={secondaryLinkHref}>{secondaryLinkLabel}</Link>
                ) : (
                  <a href={secondaryLinkHref} target="_blank" rel="noopener noreferrer">
                    {secondaryLinkLabel}
                  </a>
                )
              )}
              {(hasPrimary || hasSecondary) && date && (
                <span className="project-meta-sep" aria-hidden="true">·</span>
              )}
              {date && <span className="project-date">{date}</span>}
            </div>
          </header>

          {abstract && (
            <section className="project-abstract" aria-label="abstract">
              <h2>/ abstract</h2>
              <p>{abstract}</p>
            </section>
          )}

          <div className="project-body">
            {children}
          </div>
          <Link to={backHref} className="project-back is-end">
            ← {backLabel}
          </Link>
        </article>
      </main>
    </div>
  );
}

export default ProjectDetail;
