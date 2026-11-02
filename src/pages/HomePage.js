import React from 'react';
import { Link } from 'react-router-dom';
import QwopBand from '../components/QwopBand';
import { RESUME_URL } from '../constants/resume';
import './HomePage.css';

/**
 * Homepage rebuilt around the QWOP track band.
 * Under-copy mirrors the old home socials row (resume folded in; no nav duplicate).
 * Title + WR wording match career / projects copy already on the site.
 */
export default function HomePage() {
  return (
    <section
      id="home"
      className="page-section home-section home-band-page"
      aria-label="home"
    >
      <div className="home-band-slot">
        <QwopBand />
      </div>

      <div className="page-section-inner home-inner home-band-inner">
        <header className="home-band-header">
          <h1 className="home-band-name">Patrick Brown</h1>
          <p className="home-band-place">Austin, TX. Relocating to San Francisco.</p>
          <p className="home-band-lead">
            Data Platform Engineer. Beat the official{' '}
            <Link to="/projects/qwop-python">world record</Link>
            {' '}at 45.167s — that&apos;s the run above.
          </p>
        </header>

        {/* Same socials row as the previous homepage (resume stays here, not a second nav). */}
        <p className="home-band-social">
          <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">github</a>
          <span className="home-band-sep" aria-hidden="true">·</span>
          <a href="https://www.linkedin.com/in/patrick-brown-470617195/" target="_blank" rel="noopener noreferrer">linkedin</a>
          <span className="home-band-sep" aria-hidden="true">·</span>
          <a href="https://www.youtube.com/@bicrick-dev" target="_blank" rel="noopener noreferrer">youtube</a>
          <span className="home-band-sep" aria-hidden="true">·</span>
          <a href={RESUME_URL} target="_blank" rel="noopener noreferrer">resume</a>
          <span className="home-band-sep" aria-hidden="true">·</span>
          <a href="https://x.com/patrickbbrown" target="_blank" rel="noopener noreferrer">x</a>
        </p>
      </div>
    </section>
  );
}
