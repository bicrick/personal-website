import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ProjectDetail.css';
import SEO from './SEO';
import StructuredData from './StructuredData';
import LandingNavBar from './LandingNavBar';
import TypewriterHeading from './TypewriterHeading';
import { getPageSeo } from '../constants/pages';

function Navigation() {
  const { pathname } = useLocation();
  const linkClass = (path) => (
    pathname === path || (path === '/projects' && pathname.startsWith('/projects/'))
      ? 'nav-link is-active'
      : 'nav-link'
  );

  return (
    <div className="nav">
      <Link to="/" className={linkClass('/')}>bicrick</Link>
      <span className="nav-separator">·</span>
      <Link to="/about" className={linkClass('/about')}>about</Link>
      <span className="nav-separator">·</span>
      <Link to="/projects" className={linkClass('/projects')} aria-current={pathname.startsWith('/projects') ? 'page' : undefined}>projects</Link>
      <span className="nav-separator">·</span>
      <Link to="/contact" className={linkClass('/contact')}>contact</Link>
    </div>
  );
}

function ProjectDetail({
  title,
  date,
  linkHref,
  linkLabel,
  secondaryLinkHref,
  secondaryLinkLabel,
  secondaryLinkInternal = false,
  abstract,
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
        <Navigation />
      </LandingNavBar>
      <main className="App_mainColumn landing project-detail">
        <article className="project-article">
          <Link to="/projects" className="project-back">
            ← projects
          </Link>
          <header className="project-header">
            <TypewriterHeading as="h1">{title}</TypewriterHeading>
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
        </article>
      </main>
    </div>
  );
}

export default ProjectDetail;
