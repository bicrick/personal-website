import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { normalizePagePath } from '../constants/pages';

// 9x9 pixel glyphs to match the Geist Pixel type. '#' = filled pixel.
const GLYPHS = {
  home: [
    '....#....',
    '...###...',
    '..##.##..',
    '.##...##.',
    '##.....##',
    '.#.....#.',
    '.#.###.#.',
    '.#.#.#.#.',
    '.###.###.',
  ],
  about: [
    '...###...',
    '..#...#..',
    '..#...#..',
    '..#...#..',
    '...###...',
    '.........',
    '..#####..',
    '.#.....#.',
    '.#######.',
  ],
  career: [
    '.........',
    '...###...',
    '...#.#...',
    '#########',
    '#.......#',
    '####.####',
    '#.......#',
    '#.......#',
    '#########',
  ],
  projects: [
    '####.####',
    '#..#.#..#',
    '#..#.#..#',
    '####.####',
    '.........',
    '####.####',
    '#..#.#..#',
    '#..#.#..#',
    '####.####',
  ],
  tokens: [
    '..#####..',
    '.#.....#.',
    '#...#...#',
    '#..###..#',
    '#.#####.#',
    '#..###..#',
    '#...#...#',
    '.#.....#.',
    '..#####..',
  ],
  contact: [
    '.........',
    '#########',
    '##.....##',
    '#.#...#.#',
    '#..#.#..#',
    '#...#...#',
    '#.......#',
    '#########',
    '.........',
  ],
};

function glyphPath(rows) {
  let d = '';
  rows.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === '#') d += `M${x} ${y}h1v1h-1z`;
    });
  });
  return d;
}

const TABS = [
  { id: 'home', label: 'home', path: '/' },
  { id: 'about', label: 'about', path: '/about' },
  { id: 'career', label: 'career', path: '/career' },
  { id: 'projects', label: 'projects', path: '/projects' },
  { id: 'tokens', label: 'tokens', path: '/tokens' },
  { id: 'contact', label: 'contact', path: '/contact' },
].map((tab) => ({ ...tab, d: glyphPath(GLYPHS[tab.id]) }));

function activeIdFor(pathname) {
  const path = normalizePagePath(pathname);
  if (path === '/' || path.startsWith('/writing')) return 'home';
  if (path === '/heb' || path.startsWith('/career')) return 'career';
  if (path.startsWith('/projects') || path.startsWith('/demos/')) return 'projects';
  const match = TABS.find((t) => t.path !== '/' && path.startsWith(t.path));
  return match ? match.id : null;
}

/** Phone-only bottom navigation. Hidden on desktop by mobile.css. */
export default function MobileTabBar() {
  const { pathname } = useLocation();
  const activeId = activeIdFor(pathname);

  return (
    <nav className="m-tabbar" aria-label="site">
      {TABS.map((tab) => {
        const active = tab.id === activeId;
        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={`m-tab${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <svg viewBox="0 0 9 9" shapeRendering="crispEdges" aria-hidden="true">
              <path d={tab.d} />
            </svg>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
