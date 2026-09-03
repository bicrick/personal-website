import React from 'react';
import { Link } from 'react-router-dom';
import AboutPhotoGrid from '../components/AboutPhotoGrid';
import CursorActivityHeatmap from '../components/CursorActivityHeatmap';
import { useFadeNavigate } from '../components/PageTransition';
import './AboutPage.css';

export default function AboutPage() {
  const { navigateWithFade } = useFadeNavigate();

  const goToProjects = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    navigateWithFade('/projects');
  };

  return (
    <section className="page-section about-page" aria-label="about">
      <article className="about-article">
        <header className="about-header">
          <h1 className="about-heading">about</h1>
        </header>

        <h2>/ work</h2>
        <p>
          I&apos;m an engineer in the Austin, TX area. I studied computer engineering and artificial
          intelligence at the{' '}
          <a href="https://www.utexas.edu/" target="_blank" rel="noopener noreferrer">
            University of Texas at Austin
          </a>
          , and currently work as a data engineer at{' '}
          <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer">
            H-E-B
          </a>
          .
        </p>
        <p>
          My work spans large-scale ML data prep, event-driven pipelines (Kafka, Pub/Sub,
          Kinesis), full-stack analytics dashboards, and cloud infrastructure on GCP and AWS.
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

        <h2>/ outside</h2>
        <p>
          I play a lot of golf (+2 handicap). I like puzzle and automation games (Factorio,
          Minecraft). I love being outside and in the sun.
        </p>
        <AboutPhotoGrid />
        <p>
          Generally what drives me is my curiosity and genuine enjoyment, not just obligations.{' '}
          <Link to="/projects" onClick={goToProjects}>
            See projects
          </Link>
          .
        </p>
      </article>
    </section>
  );
}
