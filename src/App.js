import React from 'react';
import { Tooltip } from 'react-tooltip';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="container">
        <header className="profile-header">
          <div className="profile-image">
            {/* Profile image */}
            <img src="/profile.png" alt="Profile" className="avatar" />
          </div>
          <h1>Patrick Brown</h1>
          <p className="bio">
            <span className="job-title">
              Data Engineer at 
              <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer" className="heb-link">
                <img src="/heb-logo.png" alt="H-E-B" className="heb-logo" />
              </a>
            </span>
            <span className="separator">|</span>
            <span>MS AI Student at The University of Texas at Austin</span>
          </p>
          <p className="location">Based in Austin, TX</p>
          
          <div className="social-links">
            <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://www.linkedin.com/in/patrick-brown-470617195/" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://x.com/patrickbbrown" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            </a>
          </div>
        </header>

        <section className="projects-section">
          <h2>Projects</h2>
          <div className="project-card">
            <h3>
              <a href="https://github.com/bicrick/MSAI" target="_blank" rel="noopener noreferrer" className="project-title-link">
                <span className="project-title">MSAI Coursework Repository</span>
                <i className="fab fa-github"></i>
              </a>
            </h3>
            <p className="project-description">
              A comprehensive collection of coursework and assignments from my Master of Science in Artificial Intelligence program.
            </p>
            <div className="course-list">
              <h4>Courses:</h4>
              <ul>
                <li 
                  data-tooltip-id="course-tooltip" 
                  data-tooltip-content="Advanced topics in deep learning, covering optimization, computer vision, graphics, unsupervised learning, language models, and deep learning for games."
                >
                  Advances in Deep Learning
                </li>
                <li 
                  data-tooltip-id="course-tooltip" 
                  data-tooltip-content="Study of computational logic and its applications in software verification, covering logical theories and algorithms for determining satisfiability."
                >
                  Automated Logical Reasoning
                </li>
                <li 
                  data-tooltip-id="course-tooltip" 
                  data-tooltip-content="Fundamentals of deep learning, from optimization to computer vision, graphics, unsupervised learning, and applications in games."
                >
                  Deep Learning
                </li>
                <li 
                  data-tooltip-id="course-tooltip" 
                  data-tooltip-content="Core machine learning concepts including classification, neural networks, Bayesian methods, and computational learning theory."
                >
                  Machine Learning
                </li>
                <li 
                  data-tooltip-id="course-tooltip" 
                  data-tooltip-content="Focus on algorithms for large scale convex optimization and online learning, with applications in Machine Learning."
                >
                  Online Learning & Optimization
                </li>
                <li 
                  data-tooltip-id="course-tooltip" 
                  data-tooltip-content="Covers Linear Programming and Convex Optimization, including algorithms like gradient descent and newton method."
                >
                  Optimization
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      <Tooltip 
        id="course-tooltip"
        place="top"
        className="course-tooltip"
        style={{
          backgroundColor: "#333",
          color: "#fff",
          padding: "10px 15px",
          borderRadius: "6px",
          fontSize: "0.9rem",
          maxWidth: "300px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          lineHeight: "1.4"
        }}
      />
    </div>
  );
}

export default App;
