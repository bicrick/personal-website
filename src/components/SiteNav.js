import React, { useLayoutEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { normalizePagePath } from '../constants/pages';

const NAV_ITEMS = [
  { id: 'home', label: 'bicrick', path: '/' },
  { id: 'career', label: 'career', path: '/career' },
  { id: 'about', label: 'about', path: '/about' },
  { id: 'projects', label: 'projects', path: '/projects' },
  { id: 'contact', label: 'contact', path: '/contact' },
];

/** Which nav item a URL belongs to. Writeups and demos sit under their section. */
function activeIdFor(pathname) {
  const path = normalizePagePath(pathname);
  if (path === '/') return 'home';
  if (path === '/heb' || path.startsWith('/career')) return 'career';
  if (path.startsWith('/projects') || path.startsWith('/demos/')) return 'projects';
  const match = NAV_ITEMS.find((item) => item.path !== '/' && path.startsWith(item.path));
  return match ? match.id : null;
}

/**
 * The one site nav, shared by every page. Desktop shows dot-separated links;
 * phones drop the dots and spread the five links across a single row.
 */
export default function SiteNav() {
  const { pathname } = useLocation();
  const activeId = activeIdFor(pathname);
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const indicatorReadyRef = useRef(false);

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
      indicator.style.width = `${linkBox.width}px`;
      indicator.style.transform = `translateX(${linkBox.left - navBox.left}px)`;
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
  }, [activeId]);

  return (
    <nav className="nav" ref={navRef} aria-label="site">
      <span className="nav-indicator" ref={indicatorRef} aria-hidden="true" />
      {NAV_ITEMS.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 ? <span className="nav-separator" aria-hidden="true">·</span> : null}
          <Link
            to={item.path}
            className={activeId === item.id ? 'nav-link is-active' : 'nav-link'}
            data-nav-id={item.id}
            aria-current={activeId === item.id ? 'page' : undefined}
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}
