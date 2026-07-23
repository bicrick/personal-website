import React from 'react';
import { Link } from 'react-router-dom';
import AboutPhotoGrid from '../components/AboutPhotoGrid';
import CursorActivityHeatmap from '../components/CursorActivityHeatmap';
import { useFadeNavigate } from '../components/PageTransition';

export default function AboutPage() {
  const { navigateWithFade } = useFadeNavigate();

  return (
    <section className="page-section about-page" aria-label="about">
      <div className="page-section-inner about-section">
        <div className="about-lead">
          <p>
            I&apos;m an engineer in the Austin, TX area. I studied computer engineering and artificial intelligence at the{' '}
            <a href="https://www.utexas.edu/" target="_blank" rel="noopener noreferrer">University of Texas at Austin</a>
            , and currently work as a data engineer at{' '}
            <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer">H-E-B</a>.
          </p>
          <p>
            My work spans large-scale ML data prep, pipelines, full-stack analytics dashboards, and cloud infrastructure. I&apos;m experienced on GCP and AWS.
          </p>
        </div>

        <AboutPhotoGrid />

        <div className="about-more">
          <p>
            I&apos;m generally pulled by what intrigues me, not pushed by what I&apos;m supposed to do.{' '}
            <Link
              to="/projects"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                navigateWithFade('/projects');
              }}
            >
              See projects
            </Link>
            .
          </p>
          <p>
            These days I am constantly experimenting with different agentic development workflows. I use{' '}
            <a href="https://cursor.com/@bicrick" target="_blank" rel="noopener noreferrer">Cursor</a>
            {' '}and Claude Code.
          </p>
          <p>
            These days I play a lot of golf (+1 handicap). I like puzzle and automation games (Factorio, Minecraft).
          </p>
        </div>

        <footer className="about-footer">
          <CursorActivityHeatmap />
        </footer>
      </div>
    </section>
  );
}
