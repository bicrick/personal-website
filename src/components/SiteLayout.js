import React, { useLayoutEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import SEO from './SEO';
import StructuredData from './StructuredData';
import LandingNavBar from './LandingNavBar';
import { getPageSeo, normalizePagePath } from '../constants/pages';

function Navigation() {
  const { pathname } = useLocation();
  const currentPath = normalizePagePath(pathname);
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const indicatorReadyRef = useRef(false);

  const linkClass = (path) => (
    currentPath === path ? 'nav-link is-active' : 'nav-link'
  );

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
  }, [currentPath]);

  return (
    <div className="nav" ref={navRef}>
      <span className="nav-indicator" ref={indicatorRef} aria-hidden="true" />
      <Link
        to="/"
        className={linkClass('/')}
        data-nav-id="home"
        aria-current={currentPath === '/' ? 'page' : undefined}
      >
        bicrick
      </Link>
      <span className="nav-separator">·</span>
      <Link
        to="/career"
        className={linkClass('/career')}
        data-nav-id="career"
        aria-current={currentPath === '/career' ? 'page' : undefined}
      >
        career
      </Link>
      <span className="nav-separator">·</span>
      <Link
        to="/about"
        className={linkClass('/about')}
        data-nav-id="about"
        aria-current={currentPath === '/about' ? 'page' : undefined}
      >
        about
      </Link>
      <span className="nav-separator">·</span>
      <Link
        to="/projects"
        className={linkClass('/projects')}
        data-nav-id="projects"
        aria-current={currentPath === '/projects' ? 'page' : undefined}
      >
        projects
      </Link>
      <span className="nav-separator">·</span>
      <Link
        to="/contact"
        className={linkClass('/contact')}
        data-nav-id="contact"
        aria-current={currentPath === '/contact' ? 'page' : undefined}
      >
        contact
      </Link>
    </div>
  );
}

export default function SiteLayout() {
  const { pathname } = useLocation();
  const seo = getPageSeo(normalizePagePath(pathname));

  return (
    <div className="App_mainContainer landing-page">
      <SEO {...seo} />
      <StructuredData />
      <LandingNavBar>
        <Navigation />
      </LandingNavBar>
      <main className="App_mainColumn landing">
        <Outlet />
      </main>
    </div>
  );
}
