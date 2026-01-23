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
    <div>
      <Navigation />
      <div className="home-container">
        <img src={`${process.env.PUBLIC_URL}/casual_logo.png`} alt="Patrick Brown" className="home-pic" />
        <h1 className="home-heading">patrick brown</h1>
        <div className="home-content">
          <p>I build tools to turn imagination into reality.</p>
          <p>currently working as a data engineer at <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer">H-E-B</a>. living in the Austin, TX area.</p>
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <div>
      <Navigation />
      <div className="container">
        <h1 className="about-heading">about</h1>
        <div className="about-content">
          <img src={`${process.env.PUBLIC_URL}/casual_logo.png`} alt="Patrick Brown" />
          <p>
            I'm an engineer working in the Austin, TX area. I studied Computer Engineering and Artificial Intelligence at the <a href="https://www.utexas.edu/" target="_blank" rel="noopener noreferrer">University of Texas at Austin</a>, and currently work as a Data Engineer at <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer">H-E-B</a> building ETL pipelines and data infrastructure.
          </p>
          <p>
            These days I play a lot of golf (+1 handicap). I like puzzle/automation games (Factorio, Minecraft). I like to experiment with different agentic tooling workflows.
          </p>
          <p>
            Generally I am pulled around by what intrigues me and not what I am 'supposed' to do.
          </p>
          <hr className="separator" />
          <div className="social">
            <p>twitter: <a href="https://x.com/patrickbbrown" target="_blank" rel="noopener noreferrer">patrickbbrown</a></p>
            <p>github: <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">bicrick</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Projects() {
  const projects = [
    {
      title: 'docprep',
      image: null,
      link: 'https://docprep.site'
    },
    {
      title: 'Ballistic Optimizer Research',
      image: null,
      link: 'https://github.com/bicrick/ballistic-gd'
    },
    {
      title: 'Gradient Descent Visualizer',
      image: null,
      link: 'https://github.com/bicrick/gd-visualizer'
    },
    {
      title: 'Multiplayer Backgammon',
      image: null,
      link: 'https://multiplayer-backgammon.vercel.app/'
    },
    {
      title: 'Multiplayer Connect 4',
      image: null,
      link: 'https://multiplayer-connect-4-xi.vercel.app/'
    },
    {
      title: 'Fighting Balls',
      image: null,
      link: 'https://bicrick.github.io/fighting-balls/'
    }
  ];

  return (
    <div>
      <Navigation />
      <div className="container">
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
                  {project.title}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
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

