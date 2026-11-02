import React from 'react';
import { Link } from 'react-router-dom';
import QwopBand from '../components/QwopBand';
import { RESUME_URL } from '../constants/resume';
import './HomePage.css';

/**
 * Homepage rebuilt around the QWOP track band.
 * Compact index underneath — not a two-project feature list.
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
            ML / data engineer. Beat the official{' '}
            <Link to="/projects/qwop-python">QWOP world record</Link>
            {' '}at 45.167s — that&apos;s the run above.
          </p>
        </header>

        <nav className="home-band-index" aria-label="site index">
          <Link to="/projects">projects</Link>
          <span className="home-band-sep" aria-hidden="true">·</span>
          <Link to="/career">career</Link>
          <span className="home-band-sep" aria-hidden="true">·</span>
          <Link to="/about">about</Link>
          <span className="home-band-sep" aria-hidden="true">·</span>
          <Link to="/contact">contact</Link>
          <span className="home-band-sep" aria-hidden="true">·</span>
          <a href={RESUME_URL} target="_blank" rel="noopener noreferrer">resume</a>
        </nav>

        <p className="home-band-social">
          <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">github</a>
          <span className="home-band-sep" aria-hidden="true">·</span>
          <a href="https://www.linkedin.com/in/patrick-brown-470617195/" target="_blank" rel="noopener noreferrer">linkedin</a>
          <span className="home-band-sep" aria-hidden="true">·</span>
          <a href="https://www.youtube.com/@bicrick-dev" target="_blank" rel="noopener noreferrer">youtube</a>
          <span className="home-band-sep" aria-hidden="true">·</span>
          <a href="https://x.com/patrickbbrown" target="_blank" rel="noopener noreferrer">x</a>
          <span className="home-band-sep" aria-hidden="true">·</span>
          <a href="mailto:patrickbrownai@gmail.com">email</a>
        </p>
      </div>
    </section>
  );
}
