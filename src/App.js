import React, { useEffect, createContext, useContext, useState } from 'react';
import { Link, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import './App.css';
import PrivacyPolicy from './PrivacyPolicy';

const SceneContext = createContext();
const ThemeContext = createContext();

export function useScene() {
  return useContext(SceneContext);
}

export function useTheme() {
  return useContext(ThemeContext);
}

const themes = {
  1: {
    name: 'light',
    colors: {
      background: '#87ceeb',
      cardBg: 'rgba(255, 255, 255, 0.95)',
      text: '#2f3542',
      accent: '#4834d4',
      border: '#2f3542',
      buttonBg: '#e3f2fd',
      buttonHoverBg: '#ffffff',
      shadow: 'rgba(0, 0, 0, 0.3)'
    }
  },
  7: {
    name: 'sandy',
    colors: {
      background: '#f5d6a7',
      cardBg: 'rgba(255, 252, 248, 0.95)',
      text: '#4a3b2f',
      accent: '#d4954b',
      border: '#4a3b2f',
      buttonBg: '#fff5e6',
      buttonHoverBg: '#ffffff',
      shadow: 'rgba(74, 59, 47, 0.3)'
    }
  },
  2: {
    name: 'warm',
    colors: {
      background: '#ffd6a5',
      cardBg: 'rgba(255, 250, 245, 0.95)',
      text: '#4a4037',
      accent: '#ff7e67',
      border: '#4a4037',
      buttonBg: '#fff1e6',
      buttonHoverBg: '#ffffff',
      shadow: 'rgba(74, 64, 55, 0.3)'
    }
  },
  3: {
    name: 'sunset',
    colors: {
      background: '#ff9a9e',
      cardBg: 'rgba(255, 245, 245, 0.95)',
      text: '#433455',
      accent: '#a18cd1',
      border: '#433455',
      buttonBg: '#fef6f6',
      buttonHoverBg: '#ffffff',
      shadow: 'rgba(67, 52, 85, 0.3)'
    }
  },
  4: {
    name: 'forest',
    colors: {
      background: '#2f4858',
      cardBg: 'rgba(240, 245, 240, 0.95)',
      text: '#1a2634',
      accent: '#86c232',
      border: '#1a2634',
      buttonBg: '#e8f3e8',
      buttonHoverBg: '#ffffff',
      shadow: 'rgba(26, 38, 52, 0.3)'
    }
  },
  5: {
    name: 'flower',
    colors: {
      background: '#ff9ecd',
      cardBg: 'rgba(255, 245, 250, 0.95)',
      text: '#2d1b24',
      accent: '#ff4d94',
      border: '#2d1b24',
      buttonBg: '#ffebf4',
      buttonHoverBg: '#ffffff',
      shadow: 'rgba(45, 27, 36, 0.3)'
    }
  },
  6: {
    name: 'night',
    colors: {
      background: '#1a1a2e',
      cardBg: 'rgba(20, 20, 35, 0.95)',
      text: '#ffffff',
      accent: '#9d4edd',
      border: '#9d4edd',
      buttonBg: 'rgba(157, 78, 221, 0.1)',
      buttonHoverBg: 'rgba(157, 78, 221, 0.2)',
      shadow: 'rgba(157, 78, 221, 0.2)'
    }
  }
};

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

function Header() {
  const location = useLocation();
  
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="header-info">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h1 className="header-name">Patrick Brown</h1>
            </Link>
          </div>
        </div>
        <div className="header-right">
          <nav className="header-nav">
            <NavLink to="/" className="header-nav-link" end>About</NavLink>
            <NavLink to="/projects" className="header-nav-link">Projects</NavLink>
            <NavLink to="/contact" className="header-nav-link">Contact</NavLink>
            <NavLink to="/scene-viewer" className="header-nav-link">Scenes</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

function ParallaxBackground({ scrollSpeedMultiplier = 1 }) {
  const { currentScene } = useScene();
  const [layers, setLayers] = useState([]);

  useEffect(() => {
    // Load the layers for the current scene
    const loadLayers = async () => {
      try {
        const sceneNumber = currentScene;
        const layerNumbers = {
          1: [1, 2, 3, 5, 6, 7, 8], // Lake Meadow
          2: [1, 2, 3, 4], // Grasslands
          3: [1, 2, 3, 4], // Mountain
          4: [1, 2, 3, 4], // Forested Meadow
          5: [1, 2, 3, 4, 5], // Flower Meadow
          6: [1, 2, 3], // Northern Lights
          7: [1, 2] // Boulders
        };

        const sceneLayers = layerNumbers[sceneNumber].map(num => ({
          number: num,
          path: `/Nature Landscapes Free Pixel Art/nature_${sceneNumber}/${num}.png`
        }));

        setLayers(sceneLayers);
      } catch (error) {
        console.error('Error loading scene layers:', error);
      }
    };

    loadLayers();
  }, [currentScene]);

  return (
    <div className="parallax-container">
      {layers.map((layer, index) => (
        <div
          key={layer.number}
          className={`parallax-layer layer-${layer.number}`}
          style={{ 
            backgroundImage: `url("${layer.path}")`,
            zIndex: index + 1,
            animationDuration: `${(200 - (index * 30)) / (currentScene === 1 ? 0.2 : 1)}s`
          }}
        />
      ))}
    </div>
  );
}

function Home() {
  const theme = useTheme();
  const isDarkMode = theme.name === 'night';

  return (
    <div className="App">
      <div className="container">
        <div id="about" className="pixel-card">
          <div className="bio-container">
            <div className="bio-content">
              <p className="pixel-text bio">
                <span className="job-title" style={isDarkMode ? { color: '#9d4edd' } : undefined}>
                  Data Engineer at 
                  <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer" className="heb-link">
                    <img src="/heb-logo.png" alt="H-E-B" className="heb-logo" />
                  </a>
                </span>
                <span className="university-title" style={isDarkMode ? { color: '#9d4edd' } : undefined}>
                  The University of Texas at Austin
                  <a href="https://www.utexas.edu/" target="_blank" rel="noopener noreferrer" className="ut-link">
                    <img src="/longhorn.png" alt="UT Austin" className="ut-logo" />
                  </a>
                </span>
                <span style={isDarkMode ? { color: '#ffffff' } : undefined}>Masters in AI Student</span>
                <span style={isDarkMode ? { color: '#ffffff' } : undefined}>BS Electrical Engineering '24</span>
              </p>
              <p className="pixel-text location" style={isDarkMode ? { color: '#9d4edd' } : undefined}>Based in Austin, TX</p>
            </div>
            <div className="bio-profile">
              <div className="bio-profile-image">
                <img src="/profile-pixelated.png" alt="Profile" className="bio-avatar" />
              </div>
              <div className="bio-social-links">
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
          </div>
        </div>

        <div className="pixel-card">
          <h3 className="about-me-title" style={isDarkMode ? { color: '#9d4edd' } : undefined}>About Me</h3>
          <div className="about-me-content">
            <p className="pixel-text about-text" style={isDarkMode ? { color: '#ffffff' } : undefined}>
              When I discover something new, I become obsessed. Outside of tech, you'll find me running track, playing golf, hiking trails, or cheering on Texas Football.
            </p>

            <p className="pixel-text about-text" style={isDarkMode ? { color: '#ffffff' } : undefined}>
              In tech, I'm focused on AI's creative applications, particularly in generative models. I work on projects spanning image synthesis, music generation, and point cloud processing, pushing the boundaries of what's possible with computational creativity.
            </p>

            <p className="pixel-text about-text" style={isDarkMode ? { color: '#ffffff' } : undefined}>
              Currently exploring diffusion models and their applications across different domains, while keeping an eye on emerging architectures and techniques in the field.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Projects() {
  const theme = useTheme();
  const isDarkMode = theme.name === 'night';

  const tooltipStyle = isDarkMode ? {
    backgroundColor: 'rgba(20, 20, 35, 0.95) !important',
    color: '#ffffff !important',
    border: '4px solid #9d4edd !important',
    boxShadow: '6px 6px 0 rgba(157, 78, 221, 0.2) !important'
  } : undefined;

  return (
    <div className="App">
      <div className="container">
        <div className="pixel-card">
          <h3>
            <a href="https://github.com/bicrick/MSAI" 
          target="_blank"
          rel="noopener noreferrer"
              className="project-title-link"
              style={isDarkMode ? { 
                color: '#9d4edd', 
                borderColor: '#9d4edd', 
                backgroundColor: 'rgba(157, 78, 221, 0.1)',
                boxShadow: '4px 4px 0 rgba(157, 78, 221, 0.2)'
              } : undefined}>
              <span className="pixel-text">MSAI Coursework →</span>
            </a>
          </h3>
          <p className="pixel-text project-description" style={isDarkMode ? { color: '#ffffff' } : undefined}>
            A comprehensive collection of coursework and assignments from my Master of Science in Artificial Intelligence program.
          </p>
          <div id="courses" className="course-list">
            <h4 className="pixel-text" style={isDarkMode ? { color: '#9d4edd' } : undefined}>Courses:</h4>
            <ul className="pixel-grid">
              <li 
                className="pixel-button"
                data-tooltip-id="course-tooltip" 
                data-tooltip-content="Advanced topics in deep learning, covering optimization, computer vision, graphics, unsupervised learning, language models, and deep learning for games."
                style={isDarkMode ? { 
                  borderColor: '#9d4edd', 
                  color: '#ffffff',
                  backgroundColor: 'rgba(157, 78, 221, 0.1)',
                  boxShadow: '4px 4px 0 rgba(157, 78, 221, 0.2)'
                } : undefined}
              >
                Advances in Deep Learning
              </li>
              <li 
                className="pixel-button"
                data-tooltip-id="course-tooltip" 
                data-tooltip-content="Study of computational logic and its applications in software verification, covering logical theories and algorithms for determining satisfiability."
                style={isDarkMode ? { 
                  borderColor: '#9d4edd', 
                  color: '#ffffff',
                  backgroundColor: 'rgba(157, 78, 221, 0.1)',
                  boxShadow: '4px 4px 0 rgba(157, 78, 221, 0.2)'
                } : undefined}
              >
                Automated Logical Reasoning
              </li>
              <li 
                className="pixel-button"
                data-tooltip-id="course-tooltip" 
                data-tooltip-content="Fundamentals of deep learning, from optimization to computer vision, graphics, unsupervised learning, and applications in games."
                style={isDarkMode ? { 
                  borderColor: '#9d4edd', 
                  color: '#ffffff',
                  backgroundColor: 'rgba(157, 78, 221, 0.1)',
                  boxShadow: '4px 4px 0 rgba(157, 78, 221, 0.2)'
                } : undefined}
              >
                Deep Learning
              </li>
              <li 
                className="pixel-button"
                data-tooltip-id="course-tooltip" 
                data-tooltip-content="Core machine learning concepts including classification, neural networks, Bayesian methods, and computational learning theory."
                style={isDarkMode ? { 
                  borderColor: '#9d4edd', 
                  color: '#ffffff',
                  backgroundColor: 'rgba(157, 78, 221, 0.1)',
                  boxShadow: '4px 4px 0 rgba(157, 78, 221, 0.2)'
                } : undefined}
              >
                Machine Learning
              </li>
              <li 
                className="pixel-button"
                data-tooltip-id="course-tooltip" 
                data-tooltip-content="Focus on algorithms for large scale convex optimization and online learning, with applications in Machine Learning."
                style={isDarkMode ? { 
                  borderColor: '#9d4edd', 
                  color: '#ffffff',
                  backgroundColor: 'rgba(157, 78, 221, 0.1)',
                  boxShadow: '4px 4px 0 rgba(157, 78, 221, 0.2)'
                } : undefined}
              >
                Online Learning & Optimization
              </li>
              <li 
                className="pixel-button"
                data-tooltip-id="course-tooltip" 
                data-tooltip-content="Covers Linear Programming and Convex Optimization, including algorithms like gradient descent and newton method."
                style={isDarkMode ? { 
                  borderColor: '#9d4edd', 
                  color: '#ffffff',
                  backgroundColor: 'rgba(157, 78, 221, 0.1)',
                  boxShadow: '4px 4px 0 rgba(157, 78, 221, 0.2)'
                } : undefined}
              >
                Optimization
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Tooltip 
        id="course-tooltip"
        place="top"
        className="pixel-tooltip"
        float={true}
        style={tooltipStyle}
      />
    </div>
  );
}

function Contact() {
  return (
    <div className="App">
      <div className="container">
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
  );
}

function SceneSelector() {
  const { currentScene, setCurrentScene } = useScene();
  const theme = useTheme();
  const isDarkMode = theme.name === 'night';
  
  const scenes = [
    { id: 1, name: 'Lake Meadow', accent: '#4834d4' },
    { id: 7, name: 'Boulders', accent: '#d4954b' },
    { id: 2, name: 'Grasslands', accent: '#ff7e67' },
    { id: 3, name: 'Mountain', accent: '#a18cd1' },
    { id: 4, name: 'Forrested Meadow', accent: '#86c232' },
    { id: 5, name: 'Flower Meadow', accent: '#ff4d94' },
    { id: 6, name: 'Northern Lights', accent: '#9d4edd' },
  ];

  return (
    <div className="scene-selector">
      {scenes.map((scene) => (
        <button
          key={scene.id}
          className={`scene-button ${currentScene === scene.id ? 'active' : ''}`}
          onClick={() => setCurrentScene(scene.id)}
          style={{
            borderColor: scene.accent,
            background: currentScene === scene.id ? scene.accent : 'transparent',
            '--hover-accent': scene.accent
          }}
        />
      ))}
    </div>
  );
}

function SceneViewer() {
  return (
    <div className="scene-viewer">
      <div className="scene-viewer-content">
        <SceneSelector />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-top">
            <span className="copyright">© 2025 Patrick Brown</span>
            <span className="separator">•</span>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Layout({ children, hideSceneSelector = false }) {
  const location = useLocation();
  const [currentScene, setCurrentScene] = useState(() => {
    // Generate a random scene number between 1 and 7 on initial load
    return Math.floor(Math.random() * 7) + 1;
  });
  const theme = themes[currentScene];

  useEffect(() => {
    // Update CSS variables when theme changes
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [theme]);

  return (
    <SceneContext.Provider value={{ currentScene, setCurrentScene }}>
      <ThemeContext.Provider value={theme}>
        <ParallaxBackground scrollSpeedMultiplier={1} />
        <Header />
        <TableOfContents />
        {!hideSceneSelector && location.pathname === '/scene-viewer' && <SceneSelector />}
        {children}
        <Footer />
      </ThemeContext.Provider>
    </SceneContext.Provider>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/projects" element={<Layout><Projects /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
      <Route path="/scene-viewer" element={<Layout hideSceneSelector={true}><SceneViewer /></Layout>} />
    </Routes>
  );
}

export default App;
