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
      <div className="page-section-inner about-compose">
        <h2 className="about-heading">about</h2>

        <div className="about-lead page-prose">
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
        </div>

        <AboutPhotoGrid />

        <div className="about-notes page-prose">
          <p>
            I am constantly experimenting with different agentic development workflows. I use{' '}
            <a href="https://cursor.com/@bicrick" target="_blank" rel="noopener noreferrer">
              Cursor
            </a>{' '}
            and Claude Code. Here is a live chart of my token usage over the year:
          </p>

          <div className="about-heatmap">
            <CursorActivityHeatmap />
          </div>

          <p>
            I play a lot of golf (+2 handicap). I like puzzle and automation games (Factorio,
            Minecraft). I love being outside and in the sun.
          </p>
          <p>
            Generally what drives me is my curiosity and genuine enjoyment, not just obligations.{' '}
            <Link to="/projects" onClick={goToProjects}>
              See projects
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
