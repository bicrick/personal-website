import React, { useEffect } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import './App.css';
import PrivacyPolicy from './PrivacyPolicy';

function TableOfContents() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="table-of-contents">
      <ul className="toc-list">
        <li>
          <button className="toc-button" onClick={() => scrollToSection('about')}>
            About
          </button>
        </li>
        <li>
          <button className="toc-button" onClick={() => scrollToSection('projects')}>
            Projects
          </button>
        </li>
        <li>
          <button className="toc-button" onClick={() => scrollToSection('contact')}>
            Contact
          </button>
        </li>
      </ul>
    </nav>
  );
}

function MainContent() {
  useEffect(() => {
    const layers = document.getElementsByClassName('parallax-layer');
    const speeds = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35];
    let animationFrameId;
    let position = 0;

    const animate = () => {
      position += 0.1;
      Array.from(layers).forEach((layer, index) => {
        const speed = speeds[index] || 0.2;
        const xPos = -(position * speed);
        layer.style.transform = `translateX(${xPos}px)`;
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <>
      <div className="parallax-container">
        <div className="parallax-layer layer-1" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/1.png")' }} />
        <div className="parallax-layer layer-2" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/2.png")' }} />
        <div className="parallax-layer layer-3" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/3.png")' }} />
        <div className="parallax-layer layer-5" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/5.png")' }} />
        <div className="parallax-layer layer-6" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/6.png")' }} />
        <div className="parallax-layer layer-7" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/7.png")' }} />
        <div className="parallax-layer layer-8" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/8.png")' }} />
      </div>
      <TableOfContents />
      <div className="App">
        <div className="container">
          <div id="about" className="pixel-card">
            <div className="profile-image">
              <img src="/profile-pixelated.png" alt="Profile" className="avatar" />
            </div>
            <h1 className="pixel-text">Patrick Brown</h1>
            <p className="pixel-text bio">
              <span className="job-title">
                Data Engineer at 
                <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer" className="heb-link">
                  <img src="/heb-logo.png" alt="H-E-B" className="heb-logo" />
                </a>
              </span>
              <span>The University of Texas at Austin</span>
              <span>Masters in AI Student</span>
              <span>B.S. Electrical Engineering, Cockrell School of Engineering '24</span>
            </p>
            <p className="pixel-text location">Based in Austin, TX</p>
            
            <div className="social-links">
              <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer" className="pixel-button">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://www.linkedin.com/in/patrick-brown-470617195/" target="_blank" rel="noopener noreferrer" className="pixel-button">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://x.com/patrickbbrown" target="_blank" rel="noopener noreferrer" className="pixel-button">
                <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                  <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </a>
            </div>
          </div>

          <h2 id="projects" className="pixel-text section-title">Projects</h2>
          <div className="pixel-card">
            <h3>
              <a href="https://github.com/bicrick/MSAI" target="_blank" rel="noopener noreferrer" className="project-title-link">
                <span className="pixel-text">MSAI Coursework Repository</span>
              </a>
            </h3>
            <p className="pixel-text project-description">
              A comprehensive collection of coursework and assignments from my Master of Science in Artificial Intelligence program.
            </p>
            <div id="courses" className="course-list">
              <h4 className="pixel-text">Courses:</h4>
              <ul className="pixel-grid">
                <li 
                  className="pixel-button"
                  data-tooltip-id="course-tooltip" 
                  data-tooltip-content="Advanced topics in deep learning, covering optimization, computer vision, graphics, unsupervised learning, language models, and deep learning for games."
                >
                  Advances in Deep Learning
                </li>
                <li 
                  className="pixel-button"
                  data-tooltip-id="course-tooltip" 
                  data-tooltip-content="Study of computational logic and its applications in software verification, covering logical theories and algorithms for determining satisfiability."
                >
                  Automated Logical Reasoning
                </li>
                <li 
                  className="pixel-button"
                  data-tooltip-id="course-tooltip" 
                  data-tooltip-content="Fundamentals of deep learning, from optimization to computer vision, graphics, unsupervised learning, and applications in games."
                >
                  Deep Learning
                </li>
                <li 
                  className="pixel-button"
                  data-tooltip-id="course-tooltip" 
                  data-tooltip-content="Core machine learning concepts including classification, neural networks, Bayesian methods, and computational learning theory."
                >
                  Machine Learning
                </li>
                <li 
                  className="pixel-button"
                  data-tooltip-id="course-tooltip" 
                  data-tooltip-content="Focus on algorithms for large scale convex optimization and online learning, with applications in Machine Learning."
                >
                  Online Learning & Optimization
                </li>
                <li 
                  className="pixel-button"
                  data-tooltip-id="course-tooltip" 
                  data-tooltip-content="Covers Linear Programming and Convex Optimization, including algorithms like gradient descent and newton method."
                >
                  Optimization
                </li>
              </ul>
            </div>
          </div>

          <h2 id="contact" className="pixel-text section-title">Contact</h2>
          <div className="pixel-card">
            <div className="email-container">
              <div className="email-group">
                <h3 className="pixel-text">Personal</h3>
                <a href="mailto:patrickbrownai@gmail.com" className="email-link">
                  <span className="selectable">patrickbrownai@gmail.com</span>
                </a>
              </div>
              <div className="email-group">
                <h3 className="pixel-text">Work</h3>
                <a href="mailto:patrickbrown@heb.com" className="email-link">
                  <span className="selectable">patrickbrown@heb.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <span className="copyright">© 2025 Patrick Brown</span>
            <span className="separator">•</span>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          </div>
        </div>
      </footer>

      <Tooltip 
        id="course-tooltip"
        place="top"
        className="pixel-tooltip"
        style={{
          backgroundColor: '#ffffff',
          color: '#2f3542',
          border: '4px solid #2f3542',
          borderRadius: '0',
          padding: '1rem',
          fontSize: '0.8rem',
          maxWidth: '300px',
          zIndex: 9999,
          boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.3)',
          fontFamily: '"Press Start 2P", cursive'
        }}
        float={true}
      />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainContent />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>
  );
}

export default App;
