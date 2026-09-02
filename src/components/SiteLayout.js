import React, { useLayoutEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import SEO from './SEO';
import StructuredData from './StructuredData';
import PageTransition, { FadeNavigateProvider, useFadeNavigate } from './PageTransition';
import NextPageFooter from './NextPageFooter';
import { PAGE_SEO, normalizePagePath } from '../constants/pages';
import { SITE_SCROLL_ID, scrollPageToTop } from '../utils/pageScroll';

function Navigation() {
  const { pathname } = useLocation();
  const currentPath = normalizePagePath(pathname);
  const { navigateWithFade } = useFadeNavigate();

  const linkClass = (path) => (
    currentPath === path ? 'nav-link is-active' : 'nav-link'
  );

  const handleNav = (event, path) => {
    if (
      event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    navigateWithFade(path);
  };

  return (
    <div className="nav">
      <Link
        to="/"
        className={linkClass('/')}
        aria-current={currentPath === '/' ? 'page' : undefined}
        onClick={(e) => handleNav(e, '/')}
      >
        bicrick
      </Link>
      <span className="nav-separator">·</span>
      <Link
        to="/about"
        className={linkClass('/about')}
        aria-current={currentPath === '/about' ? 'page' : undefined}
        onClick={(e) => handleNav(e, '/about')}
      >
        about
      </Link>
      <span className="nav-separator">·</span>
      <Link
        to="/projects"
        className={linkClass('/projects')}
        aria-current={currentPath === '/projects' ? 'page' : undefined}
        onClick={(e) => handleNav(e, '/projects')}
      >
        projects
      </Link>
      <span className="nav-separator">·</span>
      <Link
        to="/contact"
        className={linkClass('/contact')}
        aria-current={currentPath === '/contact' ? 'page' : undefined}
        onClick={(e) => handleNav(e, '/contact')}
      >
        contact
      </Link>
    </div>
  );
}

function SiteChrome() {
  const { pathname } = useLocation();
  const currentPath = normalizePagePath(pathname);
  const seo = PAGE_SEO[currentPath] || PAGE_SEO['/'];

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add('site-scroll-lock');
    return () => {
      root.classList.remove('site-scroll-lock');
      scrollPageToTop();
    };
  }, []);

  return (
    <div id={SITE_SCROLL_ID} className="App_mainContainer landing-page">
      <SEO
        ogTitle={seo.ogTitle}
        description={seo.description}
        url={seo.url}
        keywords={seo.keywords}
      />
      <StructuredData />
      <header className="App_header landing-nav">
        <div className="App_mainColumn landing-nav-inner">
          <Navigation />
        </div>
      </header>
      <main className="App_mainColumn landing">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <NextPageFooter />
    </div>
  );
}

export default function SiteLayout() {
  return (
    <FadeNavigateProvider>
      <SiteChrome />
    </FadeNavigateProvider>
  );
}
