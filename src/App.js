import React, { useEffect, createContext, useContext, useState } from 'react';
import { Link, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-cube';
import './App.css';
import PrivacyPolicy from './PrivacyPolicy';
import AudioPlayerPortal from './AudioPlayer';

const SceneContext = createContext();
const ThemeContext = createContext();

export function useScene() {
  return useContext(SceneContext);
}

export function useTheme() {
  return useContext(ThemeContext);
}

const themes = {
  // Nature themes
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
  },
  // Ocean themes
  'ocean1': {
    name: 'bright-ocean',
    colors: {
      background: '#87ceeb',
      cardBg: 'rgba(255, 255, 255, 0.95)',
      text: '#1e3a5f',
      accent: '#2196f3',
      border: '#1e3a5f',
      buttonBg: '#e3f2fd',
      buttonHoverBg: '#ffffff',
      shadow: 'rgba(30, 58, 95, 0.3)'
    }
  },
  'ocean2': {
    name: 'sunset-ocean',
    colors: {
      background: '#ff7043',
      cardBg: 'rgba(255, 245, 238, 0.95)',
      text: '#4a2c2a',
      accent: '#ff5722',
      border: '#4a2c2a',
      buttonBg: '#fff3e0',
      buttonHoverBg: '#ffffff',
      shadow: 'rgba(74, 44, 42, 0.3)'
    }
  },
  'ocean3': {
    name: 'tropical-ocean',
    colors: {
      background: '#26c6da',
      cardBg: 'rgba(240, 253, 255, 0.95)',
      text: '#006064',
      accent: '#00bcd4',
      border: '#006064',
      buttonBg: '#e0f7fa',
      buttonHoverBg: '#ffffff',
      shadow: 'rgba(0, 96, 100, 0.3)'
    }
  },
  'ocean4': {
    name: 'evening-ocean',
    colors: {
      background: '#5c6bc0',
      cardBg: 'rgba(245, 245, 255, 0.95)',
      text: '#283593',
      accent: '#3f51b5',
      border: '#283593',
      buttonBg: '#e8eaf6',
      buttonHoverBg: '#ffffff',
      shadow: 'rgba(40, 53, 147, 0.3)'
    }
  },
  'ocean5': {
    name: 'moonlit-ocean',
    colors: {
      background: '#1a237e',
      cardBg: 'rgba(30, 30, 50, 0.95)',
      text: '#ffffff',
      accent: '#7986cb',
      border: '#7986cb',
      buttonBg: 'rgba(121, 134, 203, 0.1)',
      buttonHoverBg: 'rgba(121, 134, 203, 0.2)',
      shadow: 'rgba(121, 134, 203, 0.2)'
    }
  },
  'ocean6': {
    name: 'stormy-ocean',
    colors: {
      background: '#455a64',
      cardBg: 'rgba(240, 240, 240, 0.95)',
      text: '#263238',
      accent: '#607d8b',
      border: '#263238',
      buttonBg: '#eceff1',
      buttonHoverBg: '#ffffff',
      shadow: 'rgba(38, 50, 56, 0.3)'
    }
  },
  'ocean7': {
    name: 'golden-ocean',
    colors: {
      background: '#ffb74d',
      cardBg: 'rgba(255, 252, 245, 0.95)',
      text: '#e65100',
      accent: '#ff9800',
      border: '#e65100',
      buttonBg: '#fff8e1',
      buttonHoverBg: '#ffffff',
      shadow: 'rgba(230, 81, 0, 0.3)'
    }
  },
  'ocean8': {
    name: 'misty-ocean',
    colors: {
      background: '#90a4ae',
      cardBg: 'rgba(250, 250, 250, 0.95)',
      text: '#37474f',
      accent: '#546e7a',
      border: '#37474f',
      buttonBg: '#f5f5f5',
      buttonHoverBg: '#ffffff',
      shadow: 'rgba(55, 71, 79, 0.3)'
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
          </nav>
        </div>
      </div>
    </header>
  );
}

function ParallaxBackground({ scrollSpeedMultiplier = 1 }) {
  const { currentScene } = useScene();
  const [scenes, setScenes] = useState({
    current: {
      layers: [],
      state: 'entering'
    },
    previous: null
  });

  useEffect(() => {
    const loadScene = async () => {
      try {
        const sceneNumber = currentScene?.id;
        if (!sceneNumber) return;

        // Handle both nature and ocean scenes
        if (typeof sceneNumber === 'string' && sceneNumber.startsWith('ocean')) {
          const oceanNumber = sceneNumber.replace('ocean', '');
          const oceanLayerNumbers = {
            '1': [1, 2, 3, 4],
            '2': [2, 3, 4, 5],
            '3': [1, 2, 3, 4, 5],
            '4': [1, 2, 3, 4, 5],
            '5': [1, 2, 3, 4, 5],
            '6': [1, 2, 3, 4, 5],
            '7': [1, 2, 3, 4, 5, 6],
            '8': [1, 2, 3, 4, 5, 6]
          };

          const newLayers = oceanLayerNumbers[oceanNumber].map(num => ({
            number: num,
            path: `${process.env.PUBLIC_URL}/ocean-and-clouds-free-pixel-art-backgrounds/Ocean_${oceanNumber}/${num}.png`
          }));

          setScenes(prev => ({
            current: {
              layers: newLayers,
              state: 'entering'
            },
            previous: prev.current.layers.length ? {
              layers: prev.current.layers,
              state: 'exiting'
            } : null
          }));
        } else {
          // Nature scenes
          const layerNumbers = {
            1: [1, 2, 3, 5, 6, 7, 8], // Lake Meadow
            2: [1, 2, 3, 4], // Grasslands
            3: [1, 2, 3, 4], // Mountain
            4: [1, 2, 3, 4], // Forested Meadow
            5: [1, 2, 3, 4, 5], // Flower Meadow
            6: [1, 2, 3], // Northern Lights
          };

          const newLayers = layerNumbers[sceneNumber].map(num => ({
            number: num,
            path: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_${sceneNumber}/${num}.png`
          }));

          setScenes(prev => ({
            current: {
              layers: newLayers,
              state: 'entering'
            },
            previous: prev.current.layers.length ? {
              layers: prev.current.layers,
              state: 'exiting'
            } : null
          }));
        }

        // Activate new scene after a short delay to ensure CSS transitions work
        const activateTimeout = setTimeout(() => {
          setScenes(prev => ({
            current: {
              ...prev.current,
              state: 'active'
            },
            previous: prev.previous
          }));
        }, 50);

        // Clean up old scene after transition completes
        const cleanup = setTimeout(() => {
          setScenes(prev => ({
            current: prev.current,
            previous: null
          }));
        }, 1500);

        return () => {
          clearTimeout(activateTimeout);
          clearTimeout(cleanup);
        };
      } catch (error) {
        console.error('Error loading scene:', error);
      }
    };

    loadScene();
  }, [currentScene]);

  const renderScene = (scene, key) => {
    // Determine if we should use slower speeds based on scene type
    const useSlowerSpeeds = currentScene?.id === 1 || 
                           (typeof currentScene?.id === 'string' && currentScene?.id.startsWith('ocean'));
    
    return (
      <div key={key} className={`scene ${scene.state}`}>
        {scene.layers.map((layer, index) => (
          <div
            key={`${key}-${layer.number}`}
            className={`parallax-layer layer-${layer.number}`}
            style={{ 
              backgroundImage: `url("${layer.path}")`,
              animationDuration: `${(200 - (index * 30)) / (useSlowerSpeeds ? 0.2 : 1)}s`
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="parallax-container">
      {scenes.previous && renderScene(scenes.previous, 'previous')}
      {renderScene(scenes.current, 'current')}
    </div>
  );
}

function Home() {
  const theme = useTheme();
  const isDarkMode = theme.name === 'night';
  const isMobile = window.innerWidth <= 768;

  return (
    <div className="App">
      <div className="container" style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}>
        {isMobile ? (
          <Swiper
            grabCursor={true}
            modules={[Pagination]}
            className="mobile-swiper"
            pagination={{
              clickable: true,
            }}
            spaceBetween={30}
            style={{
              padding: '20px 0',
              width: '100%',
              marginTop: '-100px'
            }}
          >
            <SwiperSlide style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div className="pixel-card" style={{ width: '85%', maxWidth: '400px' }}>
                <div className="bio-container">
                  <div className="bio-content">
                    <p className="pixel-text bio">
                      <span className="job-title" style={isDarkMode ? { color: '#9d4edd' } : undefined}>
                        Data Engineer II at 
                        <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer" className="heb-link">
                          <img src={`${process.env.PUBLIC_URL}/heb-logo.png`} alt="H-E-B" className="heb-logo" />
                        </a>
                        <span style={isDarkMode ? { color: '#9d4edd' } : undefined}> • Based in Austin, TX</span>
                      </span>
                      <span style={isDarkMode ? { color: '#ffffff' } : undefined}>Masters in AI Student</span>
                      <span style={isDarkMode ? { color: '#ffffff' } : undefined}>BS Computer Engineering '23</span>
                      <span className="university-title" style={isDarkMode ? { color: '#9d4edd' } : undefined}>
                        The University of Texas at Austin
                        <a href="https://www.utexas.edu/" target="_blank" rel="noopener noreferrer" className="ut-link">
                          <img src={`${process.env.PUBLIC_URL}/longhorn.png`} alt="UT Austin" className="ut-logo" />
                        </a>
                      </span>
                    </p>
                  <div className="bio-social-links-centered" style={{ 
                    marginTop: '1.5rem', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '1rem',
                    paddingRight: '2rem' 
                  }}>
                    <a 
                      href="https://github.com/bicrick" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="pixel-button"
                      style={isDarkMode ? { 
                        backgroundColor: 'rgba(20, 20, 35, 0.95)',
                        borderColor: '#9d4edd',
                        color: '#ffffff'
                      } : undefined}
                    >
                      <i className="fab fa-github"></i>
                    </a>
                    <a 
                      href="https://www.linkedin.com/in/patrick-brown-470617195/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="pixel-button"
                      style={isDarkMode ? { 
                        backgroundColor: 'rgba(20, 20, 35, 0.95)',
                        borderColor: '#9d4edd',
                        color: '#ffffff'
                      } : undefined}
                    >
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a 
                      href="https://x.com/patrickbbrown" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="pixel-button"
                      style={isDarkMode ? { 
                        backgroundColor: 'rgba(20, 20, 35, 0.95)',
                        borderColor: '#9d4edd',
                        color: '#ffffff'
                      } : undefined}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                        <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                      </svg>
                    </a>
                  </div>
                  </div>
                  <div className="bio-profile">
                    <div className="bio-profile-image-large">
                      <img src={`${process.env.PUBLIC_URL}/profile.png`} alt="Profile" className="bio-avatar-large" />
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div className="pixel-card" style={{ width: '85%', maxWidth: '400px' }}>
                <h3 className="about-me-title" style={{ color: theme.colors.accent }}>About Me</h3>
                <div className="about-me-content">
                  <p className="pixel-text about-text" style={{ color: theme.colors.text }}>
                    I am a serial learner, always eager to dive into new challenges and technologies. When I'm not tinkering with code, you'll find me running track, playing golf, hiking trails, or cheering on Texas Football.
                  </p>
                  <p className="pixel-text about-text" style={{ color: theme.colors.text }}>
                    In tech, I'm focused on AI's creative applications, particularly in generative models. I work on projects spanning image synthesis, music generation, and point cloud processing, pushing the boundaries of what's possible with computational creativity.
                  </p>
                  <p className="pixel-text about-text" style={{ color: theme.colors.text }}>
                    Currently exploring diffusion models and their applications across different domains, while keeping an eye on emerging architectures and techniques in the field.
                  </p>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        ) : (
          <>
            <div className="pixel-card">
              <div className="bio-container">
                <div className="bio-content">
                  <p className="pixel-text bio">
                    <span className="job-title" style={isDarkMode ? { color: '#9d4edd' } : undefined}>
                      Data Engineer II at 
                      <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer" className="heb-link">
                        <img src={`${process.env.PUBLIC_URL}/heb-logo.png`} alt="H-E-B" className="heb-logo" />
                      </a>
                      <span style={isDarkMode ? { color: '#9d4edd' } : undefined}> • Based in Austin, TX</span>
                    </span>
                    <span style={isDarkMode ? { color: '#ffffff' } : undefined}>Masters in AI Student</span>
                    <span style={isDarkMode ? { color: '#ffffff' } : undefined}>BS Computer Engineering '23</span>
                    <span className="university-title" style={isDarkMode ? { color: '#9d4edd' } : undefined}>
                      The University of Texas at Austin
                      <a href="https://www.utexas.edu/" target="_blank" rel="noopener noreferrer" className="ut-link">
                        <img src={`${process.env.PUBLIC_URL}/longhorn.png`} alt="UT Austin" className="ut-logo" />
                      </a>
                    </span>
                  </p>
                  <div className="bio-social-links-centered" style={{ 
                    marginTop: '1.5rem', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '1rem',
                    paddingRight: '2rem' 
                  }}>
                    <a 
                      href="https://github.com/bicrick" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="pixel-button"
                      style={isDarkMode ? { 
                        backgroundColor: 'rgba(20, 20, 35, 0.95)',
                        borderColor: '#9d4edd',
                        color: '#ffffff'
                      } : undefined}
                    >
                      <i className="fab fa-github"></i>
                    </a>
                    <a 
                      href="https://www.linkedin.com/in/patrick-brown-470617195/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="pixel-button"
                      style={isDarkMode ? { 
                        backgroundColor: 'rgba(20, 20, 35, 0.95)',
                        borderColor: '#9d4edd',
                        color: '#ffffff'
                      } : undefined}
                    >
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a 
                      href="https://x.com/patrickbbrown" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="pixel-button"
                      style={isDarkMode ? { 
                        backgroundColor: 'rgba(20, 20, 35, 0.95)',
                        borderColor: '#9d4edd',
                        color: '#ffffff'
                      } : undefined}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                        <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                      </svg>
                    </a>
                  </div>
                </div>
                <div className="bio-profile">
                  <div className="bio-profile-image-large">
                    <img src={`${process.env.PUBLIC_URL}/profile.png`} alt="Profile" className="bio-avatar-large" />
                  </div>
                </div>
              </div>
            </div>
            <div className="pixel-card">
              <h3 className="about-me-title" style={{ color: theme.colors.accent }}>About Me</h3>
              <div className="about-me-content">
                <p className="pixel-text about-text" style={{ color: theme.colors.text }}>
                  I am a serial learner, always eager to dive into new challenges and technologies. When I'm not tinkering with code, you'll find me running track, playing golf, hiking trails, or cheering on Texas Football.
                </p>
                <p className="pixel-text about-text" style={{ color: theme.colors.text }}>
                  In tech, I'm focused on AI's creative applications, particularly in generative models. I work on projects spanning image synthesis, music generation, and point cloud processing, pushing the boundaries of what's possible with computational creativity.
                </p>
                <p className="pixel-text about-text" style={{ color: theme.colors.text }}>
                  Currently exploring diffusion models and their applications across different domains, while keeping an eye on emerging architectures and techniques in the field.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Projects() {
  const theme = useTheme();
  const isDarkMode = theme.name === 'night';
  const isMobile = window.innerWidth <= 768;

  const tooltipStyle = isDarkMode ? {
    backgroundColor: 'rgba(20, 20, 35, 0.95) !important',
    color: '#ffffff !important',
    border: '4px solid #9d4edd !important',
    boxShadow: '6px 6px 0 rgba(157, 78, 221, 0.2) !important'
  } : undefined;

  return (
    <div className="App">
      <div className="container" style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        minHeight: '100vh',
        paddingBottom: '50px'
      }}>
        <div className="pixel-card" style={{ 
          width: isMobile ? '85%' : '100%',
          maxWidth: isMobile ? '400px' : 'none',
          marginBottom: '30px',
          paddingBottom: '20px',
          overflow: 'visible'
        }}>
          <h3>
            <span className="pixel-text" style={isDarkMode ? { color: '#9d4edd' } : undefined}>
              University of Texas AI Masters Coursework
            </span>
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
              <li 
                className="pixel-button"
                data-tooltip-id="course-tooltip" 
                data-tooltip-content="Covers multi-armed bandits, MDPs, dynamic programming, Monte Carlo methods, and policy gradients."
                style={isDarkMode ? { 
                  borderColor: '#9d4edd', 
                  color: '#ffffff',
                  backgroundColor: 'rgba(157, 78, 221, 0.1)',
                  boxShadow: '4px 4px 0 rgba(157, 78, 221, 0.2)'
                } : undefined}
              >
                Reinforcement Learning
              </li>
              <li 
                className="pixel-button"
                data-tooltip-id="course-tooltip" 
                data-tooltip-content="Covers neural networks, attention mechanisms, transformers, and language models like BERT and GPT."
                style={isDarkMode ? { 
                  borderColor: '#9d4edd', 
                  color: '#ffffff',
                  backgroundColor: 'rgba(157, 78, 221, 0.1)',
                  boxShadow: '4px 4px 0 rgba(157, 78, 221, 0.2)'
                } : undefined}
              >
                Natural Language Processing
              </li>
            </ul>
          </div>
        </div>

        <div className="pixel-card" style={{ 
          width: isMobile ? '85%' : '100%',
          maxWidth: isMobile ? '400px' : 'none',
          marginBottom: '30px',
          paddingBottom: '20px',
          overflow: 'visible'
        }}>
          <h3>
            <span className="pixel-text" style={isDarkMode ? { color: '#9d4edd' } : undefined}>
              Multiplayer Connect 4
            </span>
          </h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <p className="pixel-text project-description" style={{ 
              ...(isDarkMode ? { color: '#ffffff' } : {}),
              flex: 1,
              margin: 0,
              minWidth: isMobile ? '100%' : '300px'
            }}>
              Real-time multiplayer Connect 4 built with Next.js, Supabase, and TypeScript. Features room codes and arcade-style design.
            </p>
            <div className="project-buttons" style={{ 
              display: 'flex', 
              gap: '15px',
              flexWrap: 'wrap',
              alignItems: 'flex-start'
            }}>
              <Link 
                to="/connect4"
                className="pixel-button"
                style={isDarkMode ? { 
                  backgroundColor: 'rgba(157, 78, 221, 0.2)',
                  borderColor: '#9d4edd',
                  color: '#ffffff',
                  boxShadow: '4px 4px 0 rgba(157, 78, 221, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 20px'
                } : {
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 20px'
                }}
              >
                <span>Play Now</span>
              </Link>
              <a 
                href="https://github.com/bicrick/multiplayer-connect-4" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="pixel-button"
                style={isDarkMode ? { 
                  backgroundColor: 'rgba(20, 20, 35, 0.95)',
                  borderColor: '#9d4edd',
                  color: '#ffffff',
                  boxShadow: '4px 4px 0 rgba(157, 78, 221, 0.2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 20px'
                } : {
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 20px'
                }}
              >
                <i className="fab fa-github" style={{ fontSize: '16px' }}></i>
              </a>
            </div>
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

function Connect4Game() {
  // Prevent body scrolling when component mounts
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Cleanup: restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);
  
  return (
    <>
      <iframe
        src="https://multiplayer-connect-4-xi.vercel.app/"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          border: 'none',
          margin: 0,
          padding: 0,
          zIndex: 9999
        }}
        title="Multiplayer Connect 4 Game"
        allow="microphone; camera"
      />
      <Link
        to="/projects"
        className="pixel-button"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 10000,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '4px solid #2f3542',
          color: '#2f3542',
          textDecoration: 'none',
          boxShadow: '6px 6px 0 rgba(47, 53, 66, 0.3)',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.transform = 'translate(-2px, -2px)';
          e.target.style.boxShadow = '8px 8px 0 rgba(47, 53, 66, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
          e.target.style.transform = 'translate(0, 0)';
          e.target.style.boxShadow = '6px 6px 0 rgba(47, 53, 66, 0.3)';
        }}
      >
        <span>←</span>
        <span>Back</span>
      </Link>
    </>
  );
}

function Contact() {
  const theme = useTheme();

  return (
    <div className="App">
      <div className="container">
        <div className="pixel-card" style={{
          maxWidth: '280px',
          margin: '20px auto'
        }}>
          <div className="contact-section">
            <h3 className="contact-label" style={{ color: theme.colors.accent }}>Personal</h3>
            <div className="contact-email-wrapper">
              <a 
                href="mailto:patrickbrownai@gmail.com" 
                className="contact-email"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.buttonBg,
                  color: theme.colors.text,
                  boxShadow: `4px 4px 0 ${theme.colors.shadow}`,
                  textAlign: 'center'
                }}
              >
                <span className="contact-text">patrickbrownai@gmail.com</span>
              </a>
            </div>
          </div>
          <div className="contact-section">
            <h3 className="contact-label" style={{ color: theme.colors.accent }}>Work</h3>
            <div className="contact-email-wrapper">
              <a 
                href="mailto:patrickbrown@heb.com" 
                className="contact-email"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.buttonBg,
                  color: theme.colors.text,
                  boxShadow: `4px 4px 0 ${theme.colors.shadow}`,
                  textAlign: 'center'
                }}
              >
                <span className="contact-text">patrickbrown@heb.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const natureScenes = [
  { id: 1, name: 'Lake Meadow', accent: '#4834d4', thumbnail: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_1/orig.png` },
  { id: 2, name: 'Warm', accent: '#ff7e67', thumbnail: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_2/orig.png` },
  { id: 3, name: 'Sunset', accent: '#a18cd1', thumbnail: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_3/orig.png` },
  { id: 4, name: 'Forest', accent: '#86c232', thumbnail: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_4/orig.png` },
  { id: 5, name: 'Flower', accent: '#ff4d94', thumbnail: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_5/orig.png` },
  { id: 6, name: 'Night', accent: '#9d4edd', thumbnail: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_6/orig.png` },
];

const oceanScenes = [
  { id: 'ocean1', name: 'Bright Ocean', accent: '#2196f3', thumbnail: `${process.env.PUBLIC_URL}/ocean-and-clouds-free-pixel-art-backgrounds/Ocean_1/4.png` },
  { id: 'ocean2', name: 'Sunset Ocean', accent: '#ff5722', thumbnail: `${process.env.PUBLIC_URL}/ocean-and-clouds-free-pixel-art-backgrounds/Ocean_2/5.png` },
  { id: 'ocean3', name: 'Tropical Ocean', accent: '#00bcd4', thumbnail: `${process.env.PUBLIC_URL}/ocean-and-clouds-free-pixel-art-backgrounds/Ocean_3/5.png` },
  { id: 'ocean4', name: 'Evening Ocean', accent: '#3f51b5', thumbnail: `${process.env.PUBLIC_URL}/ocean-and-clouds-free-pixel-art-backgrounds/Ocean_4/5.png` },
  { id: 'ocean5', name: 'Moonlit Ocean', accent: '#7986cb', thumbnail: `${process.env.PUBLIC_URL}/ocean-and-clouds-free-pixel-art-backgrounds/Ocean_5/5.png` },
  { id: 'ocean6', name: 'Stormy Ocean', accent: '#607d8b', thumbnail: `${process.env.PUBLIC_URL}/ocean-and-clouds-free-pixel-art-backgrounds/Ocean_6/5.png` },
  { id: 'ocean7', name: 'Golden Ocean', accent: '#ff9800', thumbnail: `${process.env.PUBLIC_URL}/ocean-and-clouds-free-pixel-art-backgrounds/Ocean_7/6.png` },
  { id: 'ocean8', name: 'Misty Ocean', accent: '#546e7a', thumbnail: `${process.env.PUBLIC_URL}/ocean-and-clouds-free-pixel-art-backgrounds/Ocean_8/6.png` },
];

// Combine all scenes for backwards compatibility
const scenes = [...natureScenes, ...oceanScenes];

function SceneSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [autoSwitch, setAutoSwitch] = useState(false);
  const [showArrow, setShowArrow] = useState(true);
  const { currentScene, setCurrentScene } = useScene();
  const theme = useTheme();
  const isDarkMode = theme.name === 'night';
  
  // Determine active tab based on current scene
  const [activeTab, setActiveTab] = useState(() => {
    if (currentScene && typeof currentScene.id === 'string' && currentScene.id.startsWith('ocean')) {
      return 'ocean';
    }
    return 'nature';
  });

  // Update active tab when current scene changes
  useEffect(() => {
    if (currentScene && typeof currentScene.id === 'string' && currentScene.id.startsWith('ocean')) {
      setActiveTab('ocean');
    } else {
      setActiveTab('nature');
    }
  }, [currentScene]);

  useEffect(() => {
    let interval;
    if (autoSwitch) {
      const currentScenes = activeTab === 'nature' ? natureScenes : oceanScenes;
      interval = setInterval(() => {
        const currentIndex = currentScenes.findIndex(scene => scene.id === currentScene?.id);
        const nextIndex = (currentIndex + 1) % currentScenes.length;
        setCurrentScene(currentScenes[nextIndex]);
      }, 15000); // Switch every 15 seconds
    }
    return () => clearInterval(interval);
  }, [autoSwitch, currentScene, setCurrentScene, activeTab]);

  const handleDrawerClick = () => {
    setIsOpen(!isOpen);
    setShowArrow(false);
  };

  const handleSceneChange = (scene) => {
    setCurrentScene(scene);
  };

  const currentScenes = activeTab === 'nature' ? natureScenes : oceanScenes;

  return (
    <div className={`scene-selector book-tabs ${isOpen ? 'open' : ''}`}>
      <div className="drawer-container">
        <button 
          className="drawer-pull"
          onClick={handleDrawerClick}
          aria-label={isOpen ? "Close scene selector" : "Open scene selector"}
        >
          {showArrow && !isOpen && (
            <img
              src={`${process.env.NODE_ENV === 'production' ? '' : process.env.PUBLIC_URL}/sound/down-arrow.svg`}
              alt="Click to open scene selector"
              className="scene-arrow-indicator"
              style={isDarkMode ? { filter: 'invert(1)' } : undefined}
            />
          )}
          <span className="drawer-icon">{isOpen ? '>' : '<'}</span>
        </button>
        <div className="scenes-container">
          <div className="theme-tabs">
            <button
              className={`theme-tab ${activeTab === 'nature' ? 'active' : ''}`}
              onClick={() => setActiveTab('nature')}
            >
              Nature
            </button>
            <button
              className={`theme-tab ${activeTab === 'ocean' ? 'active' : ''}`}
              onClick={() => setActiveTab('ocean')}
            >
              Ocean
            </button>
          </div>
          <div className="scenes-grid">
            {currentScenes.map((scene) => (
              <button
                key={scene.id}
                className={`scene-tab ${currentScene?.id === scene.id ? 'active' : ''}`}
                onClick={() => handleSceneChange(scene)}
                style={{ '--tab-accent': scene.accent, '--tab-bg': 'white' }}
              >
                <div className="tab-thumbnail-wrapper">
                  <img
                    className="tab-thumbnail"
                    src={scene.thumbnail}
                    alt={scene.name}
                  />
                </div>
              </button>
            ))}
          </div>
          <div className="auto-switch-container">
            <span className="toggle-label">Auto</span>
            <button
              className={`toggle-switch ${autoSwitch ? 'active' : ''}`}
              onClick={() => setAutoSwitch(!autoSwitch)}
              aria-label="Toggle auto switch scenes"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


function Footer() {
  return (
    <footer className="footer">
      <span className="copyright">© 2025 Patrick Brown</span>
      <span className="separator">•</span>
      <Link to="/privacy" className="footer-link">Privacy Policy</Link>
    </footer>
  );
}

function Layout({ children }) {
  const [currentScene, setCurrentScene] = useState(() => {
    // Pick randomly between Nature 1 (Lake Meadow) and Ocean 8 (Misty Ocean)
    const defaultScenes = [
      scenes.find(scene => scene.id === 1), // Nature 1 - Lake Meadow
      scenes.find(scene => scene.id === 'ocean8') // Ocean 8 - Misty Ocean
    ];
    const randomIndex = Math.floor(Math.random() * 2);
    return defaultScenes[randomIndex];
  });
  const theme = themes[currentScene?.id];

  useEffect(() => {
    // Update CSS variables when theme changes
    if (theme) {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
  }, [theme]);

  return (
    <SceneContext.Provider value={{ currentScene, setCurrentScene }}>
      <ThemeContext.Provider value={theme}>
        <ParallaxBackground scrollSpeedMultiplier={1} />
        <Header />
        <TableOfContents />
        <SceneSelector />
        {children}
        <Footer />
        <AudioPlayerPortal />
      </ThemeContext.Provider>
    </SceneContext.Provider>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/projects" element={<Layout><Projects /></Layout>} />
      <Route path="/connect4" element={<Connect4Game />} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
    </Routes>
  );
}

export default App;
