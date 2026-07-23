import React, { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './App.css';
import Docprep from './projects/Docprep';
import QwopPython from './projects/QwopPython';
// import BallisticGD from './projects/BallisticGD';
import GDVisualizer from './projects/GDVisualizer';
// import FightingBalls from './projects/FightingBalls';
// import Connect4 from './projects/Connect4';
import AIMasters from './projects/AIMasters';
import Notepadable from './projects/Notepadable';
import SEO from './components/SEO';
import StructuredData from './components/StructuredData';
import CursorActivityHeatmap from './components/CursorActivityHeatmap';

function Navigation() {
  return (
    <div className="nav">
      <Link to="/">bicrick</Link>
      <span className="nav-separator">·</span>
      <Link to="/about">about</Link>
      <span className="nav-separator">·</span>
      <Link to="/projects">projects</Link>
      <span className="nav-separator">·</span>
      <Link to="/contact">contact</Link>
    </div>
  );
}

function Home() {
  return (
    <div className="App_mainContainer">
      <SEO 
        ogTitle="bicrick - Patrick Brown | Data Engineer & Software Developer"
        description="Patrick Brown (bicrick) - Data Engineer at H-E-B specializing in large-scale ML data preparation. Pipelines, analytics dashboards, GCP and AWS. Austin, TX."
        url="https://bicrick.com"
      />
      <StructuredData />
      <main className="App_mainColumn">
        <header className="App_header">
          <Navigation />
        </header>
        <section>
          <h2 className="home-heading">patrick brown</h2>
          <img src={`${process.env.PUBLIC_URL}/about/headshot.jpg`} alt="Patrick Brown" className="home-pic" width="200" height="200" />
          <div className="home-content">
            <p>data engineer specializing in large-scale ML data preparation at <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer">H-E-B</a>. living in the austin, tx area.</p>
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
        description="About Patrick Brown (bicrick) - Data Engineer at H-E-B focused on large-scale ML data prep, pipelines, analytics dashboards, and cloud infrastructure on GCP and AWS. UT Austin AI Masters. Austin, TX."
        url="https://bicrick.com/about"
        keywords="bicrick, Patrick Brown, About, Data Engineer, ML Data Prep, GCP, AWS, Austin, HEB, UT Austin, AI Masters"
      />
      <StructuredData />
      <main className="App_mainColumn">
        <header className="App_header">
          <Navigation />
        </header>
        <section>
          <div className="about-header-row">
            <h2 className="about-heading">about</h2>
            <div className="about-links">
              <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">github</a>
              <span className="nav-separator">·</span>
              <a href="https://resume.bicrick.com/" target="_blank" rel="noopener noreferrer">resume</a>
              <span className="nav-separator">·</span>
              <a href="https://x.com/patrickbbrown" target="_blank" rel="noopener noreferrer">x</a>
            </div>
          </div>
          <div className="about-pics">
            <img src={`${process.env.PUBLIC_URL}/casual_logo.png`} alt="bicrick" className="about-pic" width="200" height="200" />
            <img src={`${process.env.PUBLIC_URL}/about/img-4149.jpg`} alt="With puppy" className="about-pic" width="200" height="200" />
            <img src={`${process.env.PUBLIC_URL}/about/img-5095.jpg`} alt="Outdoor selfie" className="about-pic" width="200" height="200" />
            <img src={`${process.env.PUBLIC_URL}/about/img-5482.jpg`} alt="Pumpkin Open" className="about-pic" width="200" height="200" />
            <img src={`${process.env.PUBLIC_URL}/about/golf-swing.gif`} alt="Golf swing" className="about-pic" width="200" height="200" />
          </div>
          <div className="about-content">
            <p>
              I'm an engineer in the Austin, TX area. I studied computer engineering and artificial intelligence at the <a href="https://www.utexas.edu/" target="_blank" rel="noopener noreferrer">University of Texas at Austin</a>, and currently work as a data engineer at <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer">H-E-B</a>.
            </p>
            <p>
              My work spans large-scale ML data prep, pipelines, full-stack analytics dashboards, and cloud infrastructure. I'm experienced on GCP and AWS.
            </p>
            <p>
              I'm generally pulled by what intrigues me, not pushed by what I'm supposed to do. <Link to="/projects">See projects</Link>.
            </p>
            <p>
              These days I am constantly experimenting with different agentic development workflows. I use <a href="https://cursor.com/@bicrick" target="_blank" rel="noopener noreferrer">Cursor</a> and Claude Code.
            </p>
            <p>
              These days I play a lot of golf (+1 handicap). I like puzzle and automation games (Factorio, Minecraft).
            </p>
          </div>
          <footer className="about-footer">
            <CursorActivityHeatmap />
          </footer>
        </section>
      </main>
    </div>
  );
}

function Contact() {
  return (
    <div className="App_mainContainer">
      <SEO
        ogTitle="Contact bicrick - Patrick Brown"
        description="Contact Patrick Brown (bicrick) — email patrickbrownai@gmail.com"
        url="https://bicrick.com/contact"
        keywords="bicrick, Patrick Brown, Contact, Email"
      />
      <StructuredData />
      <main className="App_mainColumn">
        <header className="App_header">
          <Navigation />
        </header>
        <section>
          <h2 className="contact-heading">contact</h2>
          <div className="contact-content">
            <p>
              email: <a href="mailto:patrickbrownai@gmail.com">patrickbrownai@gmail.com</a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function SortDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const options = [
    { value: 'relevance', label: 'relevance' },
    { value: 'date', label: 'newest first' }
  ];
  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div
      className="sort-dropdown"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="sort-dropdown-button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{selectedOption.label}</span>
        <span className="sort-dropdown-caret" aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="sort-dropdown-menu" role="listbox" aria-label="sort projects">
          {options.filter((option) => option.value !== value).map((option) => (
            <button
              key={option.value}
              type="button"
              className={`sort-dropdown-option${option.value === value ? ' active' : ''}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Projects() {
  const [sortBy, setSortBy] = useState('relevance');

  const projects = [
    {
      title: 'notepadable',
      description: 'text editor encoded in the URL',
      image: `${process.env.PUBLIC_URL}/images/notepadable/notepadable-logo.png`,
      link: '/projects/notepadable',
      external: false,
      relevanceRank: 4,
      dateRank: 1,
      seoDescription: 'notepadable by bicrick - Minimalist text editor that encodes your document into the URL. No server, no database. Share a link, share the doc.'
    },
    {
      title: 'qwop-python',
      description: 'reinforcement learning gym environment for QWOP',
      image: `${process.env.PUBLIC_URL}/images/qwop-python/qwop-python-1200x600.png`,
      link: '/projects/qwop-python',
      external: false,
      relevanceRank: 1,
      dateRank: 2,
      seoDescription: 'qwop-python by bicrick - Gymnasium environment for QWOP game, pure Python Box2D for RL training'
    },
    {
      title: 'gd-visualizer',
      description: 'compare optimizer performance in 3d',
      image: `${process.env.PUBLIC_URL}/images/gd-visualizer/gd-visualizer-1200x600.png`,
      link: '/projects/gd-visualizer',
      external: false,
      relevanceRank: 2,
      dateRank: 3,
      seoDescription: 'GD Visualizer by bicrick - 3D gradient descent optimizer comparison tool'
    },
    {
      title: 'artificial intelligence masters',
      description: 'coursework and takeaways',
      image: `${process.env.PUBLIC_URL}/images/ai-masters/ut-msai-1200x600.png`,
      link: '/projects/ai-masters',
      external: false,
      relevanceRank: 3,
      dateRank: 5,
      seoDescription: 'UT Austin AI Masters coursework by bicrick - Deep learning, NLP, and machine learning projects'
    },
    {
      title: 'docprep',
      description: 'msoffice plaintext extractor',
      image: `${process.env.PUBLIC_URL}/images/docprep/docprep-1200x600.png`,
      link: '/projects/docprep',
      external: false,
      relevanceRank: 5,
      dateRank: 4,
      seoDescription: 'docprep by bicrick - Microsoft Office plaintext extractor for AI-ready document processing'
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

  const sortedProjects = [...projects].sort((a, b) => (
    sortBy === 'date'
      ? a.dateRank - b.dateRank
      : a.relevanceRank - b.relevanceRank
  ));

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
          <div className="projects-header-row">
            <h2 className="projects-heading">selected projects</h2>
            <div className="projects-sort">
              <span>sort</span>
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>
          <div className="projects-grid">
            {sortedProjects.map((project, index) => (
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
          <hr className="separator" />
          <p>
            to see other work <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">click here</a>
          </p>
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
        <Route path="/contact" element={<Contact />} />
        <Route path="/projects/docprep" element={<Docprep />} />
        <Route path="/projects/qwop-python" element={<QwopPython />} />
        <Route path="/projects/ai-masters" element={<AIMasters />} />
        {/* Hidden project routes - to be worked on later */}
        {/* <Route path="/projects/ballistic-gd" element={<BallisticGD />} /> */}
        <Route path="/projects/gd-visualizer" element={<GDVisualizer />} />
        <Route path="/projects/notepadable" element={<Notepadable />} />
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

