import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './App.css';
import Docprep from './projects/Docprep';
// import BallisticGD from './projects/BallisticGD';
import GDVisualizer from './projects/GDVisualizer';
// import FightingBalls from './projects/FightingBalls';
// import Connect4 from './projects/Connect4';
import AIMasters from './projects/AIMasters';
import SEO from './components/SEO';
import StructuredData from './components/StructuredData';

function Navigation() {
  return (
    <div className="nav">
      <Link to="/">bicrick</Link>
      <span className="nav-separator">·</span>
      <Link to="/about">about</Link>
      <span className="nav-separator">·</span>
      <Link to="/projects">projects</Link>
    </div>
  );
}

function Home() {
  return (
    <div className="App_mainContainer">
      <SEO 
        ogTitle="bicrick - Patrick Brown | Data Engineer & Software Developer"
        description="Patrick Brown (bicrick) - Data Engineer at H-E-B building ETL pipelines and data infrastructure. Software developer working in Austin, TX."
        url="https://bicrick.com"
      />
      <StructuredData />
      <main className="App_mainColumn">
        <header className="App_header">
          <Navigation />
        </header>
        <section>
          <h2 className="home-heading">patrick brown</h2>
          <img src={`${process.env.PUBLIC_URL}/casual_logo.png`} alt="bicrick - Patrick Brown" className="home-pic" width="200" height="200" />
          <div className="home-content">
            <p>I build software to solve problems.</p>
            <p>currently working as a data engineer at <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer">H-E-B</a>. living in the Austin, TX area.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function About() {
  return (
    <div className="App_mainContainer">
      <SEO 
        ogTitle="About bicrick - Patrick Brown | Data Engineer"
        description="About Patrick Brown (bicrick) - Data Engineer at H-E-B, UT Austin AI Masters graduate, software developer in Austin, TX."
        url="https://bicrick.com/about"
        keywords="bicrick, Patrick Brown, About, Data Engineer, Software Developer, Austin, HEB, UT Austin, AI Masters"
      />
      <StructuredData />
      <main className="App_mainColumn">
        <header className="App_header">
          <Navigation />
        </header>
        <section>
          <h2 className="about-heading">about</h2>
          <img src={`${process.env.PUBLIC_URL}/casual_logo.png`} alt="bicrick - Patrick Brown" className="about-pic" width="200" height="200" />
          <div className="about-content">
            <p>
              I'm an engineer working in the Austin, TX area. I studied Computer Engineering and Artificial Intelligence at the <a href="https://www.utexas.edu/" target="_blank" rel="noopener noreferrer">University of Texas at Austin</a>, and currently work as a Data Engineer at <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer">H-E-B</a> building ETL pipelines and data infrastructure.
            </p>
            <p>
              Generally I am pulled by what intrigues me and not pushed by what I am supposed to do. I like to experiment with different agentic development workflows. I currently use Cursor and Claude Code.
            </p>
            <p>
              These days I play a lot of golf (+1 handicap). I like puzzle/automation games (Factorio, Minecraft).
            </p>
            <hr className="separator" />
            <div className="social-links">
              <a
                href="https://x.com/patrickbbrown"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter): patrickbbrown"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>patrickbbrown</span>
              </a>
              <a
                href="https://github.com/bicrick"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub: bicrick"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span>bicrick</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Projects() {
  const projects = [
    {
      title: 'docprep',
      description: 'msoffice plaintext extractor',
      image: `${process.env.PUBLIC_URL}/images/docprep/docprep-1200x600.png`,
      link: '/projects/docprep',
      external: false,
      seoDescription: 'docprep by bicrick - Microsoft Office plaintext extractor for AI-ready document processing'
    },
    {
      title: 'artificial intelligence masters',
      description: 'coursework and takeaways',
      image: `${process.env.PUBLIC_URL}/images/ai-masters/ut-msai-1200x600.png`,
      link: '/projects/ai-masters',
      external: false,
      seoDescription: 'UT Austin AI Masters coursework by bicrick - Deep learning, NLP, and machine learning projects'
    },
    {
      title: 'gd-visualizer',
      description: 'compare optimizer performance in 3d',
      image: `${process.env.PUBLIC_URL}/images/gd-visualizer/gd-visualizer-1200x600.png`,
      link: '/projects/gd-visualizer',
      external: false,
      seoDescription: 'GD Visualizer by bicrick - 3D gradient descent optimizer comparison tool'
    }
    // Hidden projects - to be worked on later
    // {
    //   title: 'ballistic optimizer research',
    //   description: 'new optimizer methods to rival adam and sgd',
    //   image: `${process.env.PUBLIC_URL}/images/ballistic-gd/ballistic-gd-1200x600.png`,
    //   link: '/projects/ballistic-gd',
    //   external: false
    // },
    // {
    //   title: 'fighting balls',
    //   description: 'watch the balls fight! exciting',
    //   image: `${process.env.PUBLIC_URL}/images/fighting-balls/fighting-balls-1200x600.png`,
    //   link: '/projects/fighting-balls',
    //   external: false
    // },
    // {
    //   title: 'multiplayer connect 4',
    //   description: 'classic connect 4 with multiplayer',
    //   image: null,
    //   link: '/projects/connect4',
    //   external: false
    // }
  ];

  return (
    <div className="App_mainContainer">
      <SEO 
        ogTitle="Projects by bicrick - Software Development Portfolio"
        description="Software projects by bicrick (Patrick Brown) - docprep, AI Masters coursework, gradient descent visualizer, and more."
        url="https://bicrick.com/projects"
        keywords="bicrick, Patrick Brown, Projects, Portfolio, Software Development, docprep, AI, Machine Learning"
      />
      <StructuredData />
      <main className="App_mainColumn">
        <header className="App_header">
          <Navigation />
        </header>
        <section>
          <h2 className="projects-heading">selected projects</h2>
          <div className="projects-grid">
            {projects.map((project, index) => (
              project.external ? (
                <a 
                  key={index} 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="project-card">
                    {project.image ? (
                      <img src={project.image} alt={project.title} width="1200" height="600" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#e0e0e0' }} />
                    )}
                    <div className="project-overlay">
                      <div>{project.title} - {project.description}</div>
                    </div>
                  </div>
                </a>
              ) : (
                <Link 
                  key={index} 
                  to={project.link}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="project-card">
                    {project.image ? (
                      <img src={project.image} alt={project.title} width="1200" height="600" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#e0e0e0' }} />
                    )}
                    <div className="project-overlay">
                      <div>{project.title} - {project.description}</div>
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/docprep" element={<Docprep />} />
        <Route path="/projects/ai-masters" element={<AIMasters />} />
        {/* Hidden project routes - to be worked on later */}
        {/* <Route path="/projects/ballistic-gd" element={<BallisticGD />} /> */}
        <Route path="/projects/gd-visualizer" element={<GDVisualizer />} />
        {/* <Route path="/projects/fighting-balls" element={<FightingBalls />} /> */}
        {/* <Route path="/projects/connect4" element={<Connect4 />} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;

