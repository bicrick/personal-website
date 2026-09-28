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
        </header>
        <p>
          I love being outside and in the sun. I play a lot of golf (+2 handicap). I also
          love video games, mostly the puzzle and automation kind: Factorio, Minecraft.
        </p>
        <AboutPhotoGrid />
        <p>
          A lot of my time off the job goes into developing things because I want to, not
          because someone assigned them.
        </p>
        <h2>/ how I build</h2>
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
        <p>
          <Link to="/projects">
            See projects
          </Link>
          .
        </p>
      </article>
    </section>
  );
}
