import React from 'react';
import TypewriterHeading from '../components/TypewriterHeading';
import CursorActivityHeatmap from '../components/CursorActivityHeatmap';
import ExperienceSnapshot from '../components/home/ExperienceSnapshot';
import FeaturedProjects from '../components/home/FeaturedProjects';
import HomeFooter from '../components/home/HomeFooter';
import './HomePage.css';

export default function HomePage() {
  return (
    <section
      id="home"
      className="page-section home-section is-dossier"
      aria-label="home"
    >
      <div className="page-section-inner home-inner">
        <div className="home-compose">
          <img
            src={`${process.env.PUBLIC_URL}/about/headshot.jpg`}
            alt="Patrick Brown"
            className="home-pic"
            width="320"
            height="320"
            draggable={false}
          />
          <div className="home-copy">
            <TypewriterHeading as="h2" className="home-heading">
              Patrick Brown
            </TypewriterHeading>
            <p className="home-place">Austin, TX. Relocating to San Francisco.</p>
            <div className="home-links">
              <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">github</a>
              <span className="nav-separator">·</span>
              <a href="https://www.linkedin.com/in/patrick-brown-470617195/" target="_blank" rel="noopener noreferrer">linkedin</a>
              <span className="nav-separator">·</span>
              <a href="https://www.youtube.com/@bicrick-dev" target="_blank" rel="noopener noreferrer">youtube</a>
              <span className="nav-separator">·</span>
              <a href="https://resume.bicrick.com/" target="_blank" rel="noopener noreferrer">resume</a>
              <span className="nav-separator">·</span>
              <a href="https://x.com/patrickbbrown" target="_blank" rel="noopener noreferrer">x</a>
            </div>
          </div>
        </div>
        <ExperienceSnapshot />
        <FeaturedProjects />
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
