import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

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
      <main className="App_mainColumn">
        <header className="App_header">
          <Navigation />
        </header>
        <section>
          <h2 className="home-heading">patrick brown</h2>
          <img src={`${process.env.PUBLIC_URL}/casual_logo.png`} alt="Patrick Brown" className="home-pic" />
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
      <main className="App_mainColumn">
        <header className="App_header">
          <Navigation />
        </header>
        <section>
          <h2 className="about-heading">about</h2>
          <img src={`${process.env.PUBLIC_URL}/casual_logo.png`} alt="Patrick Brown" className="about-pic" />
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
            <div className="social">
              <p>twitter: <a href="https://x.com/patrickbbrown" target="_blank" rel="noopener noreferrer">patrickbbrown</a></p>
              <p>github: <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">bicrick</a></p>
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
      image: `${process.env.PUBLIC_URL}/docprep-1200x600.png`,
      link: 'https://docprep.site'
    },
    {
      title: 'ballistic optimizer research',
      description: 'new optimizer methods to rival adam and sgd',
      image: `${process.env.PUBLIC_URL}/ballistic-gd-1200x600.png`,
      link: 'https://github.com/bicrick/ballistic-gd'
    },
    {
      title: 'gd-visualizer',
      description: 'an intuitive 3d gradient descent visualizer',
      image: `${process.env.PUBLIC_URL}/gd-visualizer-1200x600.png`,
      link: 'https://github.com/bicrick/gd-visualizer'
    },
    {
      title: 'multiplayer backgammon',
      description: 'play backgammon with friends online',
      image: null,
      link: 'https://multiplayer-backgammon.vercel.app/'
    },
    {
      title: 'multiplayer connect 4',
      description: 'classic connect 4 with multiplayer',
      image: null,
      link: 'https://multiplayer-connect-4-xi.vercel.app/'
    },
    {
      title: 'fighting balls',
      description: 'watch the balls fight! exciting',
      image: `${process.env.PUBLIC_URL}/fighting-balls-1200x600.png`,
      link: 'https://bicrick.github.io/fighting-balls/'
    }
  ];

  return (
    <div className="App_mainContainer">
      <main className="App_mainColumn">
        <header className="App_header">
          <Navigation />
        </header>
        <section>
          <h2 className="projects-heading">selected projects</h2>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <a 
                key={index} 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="project-card">
                  {project.image ? (
                    <img src={project.image} alt={project.title} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#e0e0e0' }} />
                  )}
                  <div className="project-overlay">
                    <div>{project.title} - {project.description}</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

