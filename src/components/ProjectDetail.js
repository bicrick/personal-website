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

function ProjectDetail({ title, children, seoTitle, seoDescription, seoKeywords, seoUrl, seoImage }) {
  return (
    <div className="App_mainContainer">
      <SEO 
        ogTitle={seoTitle || `${title} - bicrick`}
        description={seoDescription || `${title} project by bicrick (Patrick Brown)`}
        keywords={seoKeywords || `bicrick, Patrick Brown, ${title}, Project`}
        url={seoUrl || `https://bicrick.com/projects/${title.toLowerCase().replace(/\s+/g, '-')}`}
        image={seoImage || "https://bicrick.com/casual_logo.png"}
      />
      <StructuredData />
      <main className="App_mainColumn project-detail">
        <header className="App_header">
          <Navigation />
        </header>
        <article className="project-article">
          <h3 className="project-subtitle">{title}</h3>
          {children}
        </article>
      </main>
    </div>
  );
}

export default ProjectDetail;
