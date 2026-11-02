import React, { useEffect, useState } from 'react';
import TypewriterHeading from '../components/TypewriterHeading';
import QwopBand from '../components/QwopBand';
import CursorActivityHeatmap from '../components/CursorActivityHeatmap';
import ExperienceSnapshot from '../components/home/ExperienceSnapshot';
import FeaturedProjects from '../components/home/FeaturedProjects';
import WritingBlock from '../components/home/WritingBlock';
import HomeFooter from '../components/home/HomeFooter';
import { RESUME_URL } from '../constants/resume';
import './HomePage.css';

/**
 * Spacious QWOP-band hero (centered intro under the runner), then the
 * rest of the old homepage below. Name type-out matches live bicrick.com
 * (TypewriterHeading + .home-heading, ink caret).
 *
 * First-load intro (~1.5s): track draws center→out, runner fades in,
 * then name type-out, then place/role/socials/cue in a short stagger.
 * Module flag prevents StrictMode double-play; reduced-motion skips.
 */

// Once per full page load (survives StrictMode remount; resets on refresh).
let homeIntroConsumed = false;

function preferReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initialIntroClass() {
  if (typeof window === 'undefined') return 'home-intro-done';
  if (preferReducedMotion() || homeIntroConsumed) return 'home-intro-done';
  homeIntroConsumed = true;
  return 'home-intro-pending';
}

export default function HomePage() {
  const [introClass, setIntroClass] = useState(initialIntroClass);
  // Freeze at mount so flipping pending→done does not restart the type-out.
  const [delayMs] = useState(() => (
    preferReducedMotion() || introClass === 'home-intro-done' ? 0 : 560
  ));

  useEffect(() => {
    if (introClass !== 'home-intro-pending') return undefined;
    // Kick CSS transitions on the next frame so the pending state paints first.
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setIntroClass('home-intro-play');
      });
    });
    const done = window.setTimeout(() => setIntroClass('home-intro-done'), 1800);
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(done);
    };
  }, [introClass]);

  return (
    <section
      id="home"
      className={`page-section home-section home-band-page ${introClass}`}
      aria-label="home"
    >
      <div className="home-hero">
        <div className="home-band-slot home-intro-track">
          <div className="home-intro-runner">
            <QwopBand />
          </div>
        </div>

        <div className="home-band-inner">
          <div className="home-band-intro">
            <TypewriterHeading
              as="h1"
              className="home-heading home-intro-name"
              delayMs={delayMs}
            >
              Patrick Brown
            </TypewriterHeading>
            <p className="home-place home-intro-place">Austin, TX. Relocating to San Francisco.</p>
            <p className="home-band-role home-intro-role">Data Platform Engineer</p>
            <div className="home-links home-intro-links">
              <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">github</a>
              <span className="nav-separator">·</span>
              <a href="https://www.linkedin.com/in/patrick-brown-470617195/" target="_blank" rel="noopener noreferrer">linkedin</a>
              <span className="nav-separator">·</span>
              <a href="https://www.youtube.com/@bicrick-dev" target="_blank" rel="noopener noreferrer">youtube</a>
              <span className="nav-separator">·</span>
              <a href={RESUME_URL} target="_blank" rel="noopener noreferrer">resume</a>
              <span className="nav-separator">·</span>
              <a href="https://x.com/patrickbbrown" target="_blank" rel="noopener noreferrer">x</a>
            </div>
          </div>
        </div>

        <a className="home-hero-cue home-intro-cue" href="#home-rest" aria-label="More below">
          <span aria-hidden="true">↓</span>
        </a>
      </div>

      <div
        id="home-rest"
        className="page-section-inner home-inner home-rest"
      >
        <ExperienceSnapshot />
        <WritingBlock />
        <section className="home-block" aria-label="how I build">
          <div className="home-block-head">
            <h2>how I build</h2>
            <a href="https://cursor.com/@bicrick" target="_blank" rel="noopener noreferrer">
              cursor profile
            </a>
          </div>
          <figure className="home-heatmap">
            <CursorActivityHeatmap />
          </figure>
        </section>
        <FeaturedProjects />
        <HomeFooter />
      </div>
    </section>
  );
}
