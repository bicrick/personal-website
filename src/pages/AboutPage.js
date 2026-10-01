import React from 'react';
import { Link } from 'react-router-dom';
import TypewriterHeading from '../components/TypewriterHeading';
import AboutPhotoGrid from '../components/AboutPhotoGrid';
import CursorActivityHeatmap from '../components/CursorActivityHeatmap';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <section
      id="about"
      className="page-section about-page"
      aria-label="about"
    >
      <article className="about-article">
        <header className="about-header">
          <TypewriterHeading as="h1" className="about-heading">
            about
          </TypewriterHeading>
          <p>
            I love being outside and in the sun. I play a lot of golf (+2 handicap). I also
            love video games, mostly the puzzle and automation kind: Factorio, Minecraft.
          </p>
        </header>
        <AboutPhotoGrid />

        <section className="about-build" aria-label="how I build">
          <div className="about-build-head">
            <h2>how I build</h2>
            <Link to="/projects">see projects</Link>
          </div>
          <p>
            I am constantly experimenting with different agentic development workflows. I use{' '}
            <a href="https://cursor.com/@bicrick" target="_blank" rel="noopener noreferrer">
              Cursor
            </a>{' '}
            and Claude Code.
          </p>
          <figure className="about-figure">
            <div className="about-heatmap">
              <CursorActivityHeatmap />
            </div>
          </figure>
        </section>
      </article>
    </section>
  );
}
