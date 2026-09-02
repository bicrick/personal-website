import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ProjectDetail.css';
import SEO from './SEO';
import StructuredData from './StructuredData';

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
  seoTitle,
  seoDescription,
  seoKeywords,
  seoUrl,
  seoImage,
}) {
  const hasPrimary = Boolean(linkHref && linkLabel);
  const hasSecondary = Boolean(secondaryLinkHref && secondaryLinkLabel);

  return (
    <div className="App_mainContainer landing-page">
      <SEO
        ogTitle={seoTitle || `${title} - bicrick`}
        description={seoDescription || `${title} project by bicrick (Patrick Brown)`}
        keywords={seoKeywords || `bicrick, Patrick Brown, ${title}, Project`}
        url={seoUrl || `https://bicrick.com/projects/${String(title).toLowerCase().replace(/\s+/g, '-')}`}
        image={seoImage || 'https://bicrick.com/casual_logo.png'}
      />
      <StructuredData />
      <header className="App_header landing-nav">
        <div className="App_mainColumn landing-nav-inner">
          <Navigation />
        </div>
      </header>
      <main className="App_mainColumn landing project-detail">
        <article className="project-article">
          <Link to="/projects" className="project-back">
            ← projects
          </Link>
          <header className="project-header">
            <h1 className="project-title">{title}</h1>
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
