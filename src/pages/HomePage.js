import React from 'react';
import { Link } from 'react-router-dom';
import TypewriterHeading from '../components/TypewriterHeading';
import CursorActivityHeatmap from '../components/CursorActivityHeatmap';
import FeaturedProjects from '../components/home/FeaturedProjects';
import WritingBlock from '../components/home/WritingBlock';
import HomeFooter from '../components/home/HomeFooter';
import { RESUME_URL } from '../constants/resume';
import './HomePage.css';

const HEB_LOGO = `${process.env.PUBLIC_URL}/images/heb/heb-logo.png`;

export default function HomePage() {
  return (
    <section
      id="home"
      className="page-section home-section is-dossier"
      aria-label="home"
    >
      <div className="page-section-inner home-inner">
        <div className="home-compose">
          <picture>
            <source
              type="image/webp"
              srcSet={`${process.env.PUBLIC_URL}/about/headshot.webp`}
            />
            <img
              src={`${process.env.PUBLIC_URL}/about/headshot.jpg`}
              alt="Patrick Brown"
              className="home-pic"
              width="320"
              height="320"
              draggable={false}
            />
          </picture>
          <div className="home-copy">
            <TypewriterHeading as="h2" className="home-heading">
              Patrick Brown
            </TypewriterHeading>
            <p className="home-place">Austin, TX. Relocating to San Francisco.</p>
            <div className="home-edu" aria-label="Education, UT Austin">
              <p className="home-edu-school">UT Austin</p>
              <ul className="home-edu-degrees">
                <li>M.S. Artificial Intelligence</li>
                <li>B.S. Electrical and Computer Engineering</li>
              </ul>
            </div>
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
        <div className="home-intro">
          <p className="home-intro-lead">
            {"Hi. I'm Patrick. I genuinely think there has never been a better time to be a young, curious person with high aptitude. The friction between me and my goals has never been smaller."}
          </p>
          <p>
            My differentiating factor is my appetite. I want to learn, and I have the tenacity to do anything I put{' '}
            <span className="nowrap">my mind to.</span>
          </p>
          <p>
            I am constantly building. At work, I am a platform engineer creating tooling and infrastructure for our data engineering teams at{' '}
            <Link to="/heb" className="home-intro-heb-link" aria-label="H-E-B">
              <img
                src={HEB_LOGO}
                alt="H-E-B"
                className="home-intro-heb"
                draggable={false}
              />
            </Link>
            . I am always iterating on my workflow, leaning heavily on Cursor, <span className="nowrap">Grok Bot</span>, and{' '}
            <span className="nowrap">Claude Code.</span>
          </p>
          <p>
            Outside of work, I enjoy building small <span className="nowrap">RL projects.</span>
          </p>
        </div>
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
