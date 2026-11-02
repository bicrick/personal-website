import React from 'react';
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
 */
export default function HomePage() {
  return (
    <section
      id="home"
      className="page-section home-section home-band-page"
      aria-label="home"
    >
      <div className="home-hero">
        <div className="home-band-slot">
          <QwopBand />
        </div>

        <div className="home-band-inner">
          <div className="home-band-intro">
            <TypewriterHeading as="h1" className="home-heading">
              Patrick Brown
            </TypewriterHeading>
            <p className="home-place">Austin, TX. Relocating to San Francisco.</p>
            <p className="home-band-role">Data Platform Engineer</p>
            <div className="home-links">
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

        <a className="home-hero-cue" href="#home-rest" aria-label="More below">
          <span aria-hidden="true">↓</span>
        </a>
      </div>

      <div
        id="home-rest"
        className="page-section-inner home-inner home-rest"
      >
        <ExperienceSnapshot />
        <FeaturedProjects />
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
        <HomeFooter />
      </div>
    </section>
  );
}
