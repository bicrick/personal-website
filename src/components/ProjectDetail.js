import React from 'react';
import { Link } from 'react-router-dom';
import './ProjectDetail.css';

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

function ProjectDetail({ title, children }) {
  return (
    <div className="App_mainContainer">
      <main className="App_mainColumn project-detail">
        <header className="App_header">
          <Navigation />
        </header>
        <article className="project-article">
          <h3 className="project-subtitle">{title}</h3>
          {children}
        </article>
      </main>
    </div>
  );
}

export default ProjectDetail;
