import React, { useLayoutEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from './SEO';
import StructuredData from './StructuredData';
import LandingNavBar from './LandingNavBar';
import {
  LandingProvider,
  LandingSections,
} from '../pages/LandingPage';
import { useLandingNav } from '../hooks/landingNavContext';
import { getPageSeo, normalizePagePath } from '../constants/pages';
import { getLandingPage, isLandingPath, LANDING_PAGES } from '../constants/sections';

function Navigation() {
  const { pathname } = useLocation();
  const currentPath = normalizePagePath(pathname);
  const { activeId, scrollToSection } = useLandingNav();
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const indicatorReadyRef = useRef(false);

  const activePath = isLandingPath(currentPath)
    ? (LANDING_PAGES.find((page) => page.id === activeId)?.path || currentPath)
    : currentPath;

  const linkClass = (path) => (
    activePath === path ? 'nav-link is-active' : 'nav-link'
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
    const page = getLandingPage(path);
    scrollToSection(page.id);
  };

  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return undefined;

    const place = () => {
      const active = nav.querySelector('.nav-link.is-active');
      if (!active) {
        indicator.style.opacity = '0';
        return;
      }
      const navBox = nav.getBoundingClientRect();
      const linkBox = active.getBoundingClientRect();
      const left = linkBox.left - navBox.left;
      indicator.style.width = `${linkBox.width}px`;
      indicator.style.transform = `translateX(${left}px)`;
      indicator.style.opacity = '1';

      if (!indicatorReadyRef.current) {
        // First paint: sit under the active link with no slide-from-zero
        indicatorReadyRef.current = true;
        window.requestAnimationFrame(() => {
          indicator.classList.add('is-ready');
        });
      } else {
        indicator.classList.add('is-ready');
      }
    };

    place();
    const raf = window.requestAnimationFrame(place);
    window.addEventListener('resize', place);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', place);
    };
  }, [activePath, activeId]);

  return (
    <div className="nav" ref={navRef}>
      <span className="nav-indicator" ref={indicatorRef} aria-hidden="true" />
      <Link
        to="/"
        className={linkClass('/')}
        data-nav-id="home"
        aria-current={activePath === '/' ? 'page' : undefined}
        onClick={(e) => handleNav(e, '/')}
      >
        bicrick
      </Link>
      <span className="nav-separator">·</span>
      <Link
        to="/about"
        className={linkClass('/about')}
        data-nav-id="about"
        aria-current={activePath === '/about' ? 'page' : undefined}
        onClick={(e) => handleNav(e, '/about')}
      >
        about
      </Link>
      <span className="nav-separator">·</span>
      <Link
        to="/projects"
        className={linkClass('/projects')}
        data-nav-id="projects"
        aria-current={activePath === '/projects' ? 'page' : undefined}
        onClick={(e) => handleNav(e, '/projects')}
      >
        projects
      </Link>
      <span className="nav-separator">·</span>
      <Link
        to="/contact"
        className={linkClass('/contact')}
        data-nav-id="contact"
        aria-current={activePath === '/contact' ? 'page' : undefined}
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
  const seo = getPageSeo(currentPath);

  useLayoutEffect(() => {
    document.documentElement.classList.remove('site-scroll-lock');
  }, []);

  return (
    <div className="App_mainContainer landing-page">
      <SEO {...seo} />
      <StructuredData />
      <LandingProvider>
        <LandingNavBar>
          <Navigation />
        </LandingNavBar>
        <main className="App_mainColumn landing">
          <LandingSections />
        </main>
      </LandingProvider>
    </div>
  );
}

/**
 * SiteLayout keeps one LandingPage mounted for all landing URLs so scroll
 * state, ink, and chapter focus survive / → /about → /projects transitions.
 */
export default function SiteLayout() {
  return <SiteChrome />;
}
