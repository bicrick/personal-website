import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import LandingNavBar from '../components/LandingNavBar';
import SiteNav from '../components/SiteNav';
import TapestryTilePreview, { THUMB_VARIANTS } from '../components/TapestryTilePreview';
import { getPageSeo } from '../constants/pages';
import '../components/TapestryTilePreview.css';

const COPY = {
  a: {
    title: 'A · path scroll',
    blurb: 'Real strips scroll endlessly along the woven infinity loop.',
  },
  b: {
    title: 'B · mark mask',
    blurb: 'The painting scrolls inside the infinity shape as a mask.',
  },
  c: {
    title: 'C · stroke draw',
    blurb: 'Infinity stroke draws itself while strips paint in behind it.',
  },
};

export default function TapestryThumbsPage() {
  const [params] = useSearchParams();
  const raw = (params.get('thumb') || '').toLowerCase();
  const solo = THUMB_VARIANTS.includes(raw) ? raw : null;
  const seo = getPageSeo('/projects/infinite-tapestry/thumbs');

  return (
    <div className="App_mainContainer landing-page">
      <SEO {...seo} />
      <LandingNavBar>
        <SiteNav />
      </LandingNavBar>
      <main className="tapestry-thumbs-page">
        <p>
          <Link to="/projects/infinite-tapestry">← infinite tapestry</Link>
          {' · '}
          <Link to="/">home</Link>
        </p>
        <h1>thumbnail mockups</h1>
        <p className="thumbs-lead">
          Three homepage-card treatments built around the official infinity mark
          (cream #efe9df on near-black #0b0b0d). Pick one — nothing is final until you say so.
          Deep-link with <code>?thumb=a</code>, <code>b</code>, or <code>c</code>.
        </p>

        <nav className="tapestry-thumbs-nav" aria-label="thumbnail variants">
          <Link to="/projects/infinite-tapestry/thumbs" className={!solo ? 'is-on' : undefined}>
            all
          </Link>
          {THUMB_VARIANTS.map((id) => (
            <Link
              key={id}
              to={`/projects/infinite-tapestry/thumbs?thumb=${id}`}
              className={solo === id ? 'is-on' : undefined}
            >
              {id.toUpperCase()}
            </Link>
          ))}
        </nav>

        {solo ? (
          <figure className="tapestry-thumbs-solo">
            <div className="tapestry-thumbs-frame">
              <TapestryTilePreview variant={solo} />
            </div>
            <h2>{COPY[solo].title}</h2>
            <p>{COPY[solo].blurb}</p>
          </figure>
        ) : (
          <div className="tapestry-thumbs-grid">
            {THUMB_VARIANTS.map((id) => (
              <figure key={id} className="tapestry-thumbs-card">
                <Link to={`/projects/infinite-tapestry/thumbs?thumb=${id}`} className="tapestry-thumbs-frame">
                  <TapestryTilePreview variant={id} />
                </Link>
                <h2>{COPY[id].title}</h2>
                <p>{COPY[id].blurb}</p>
              </figure>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
