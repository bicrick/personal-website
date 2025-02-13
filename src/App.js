import React, { useEffect, createContext, useContext, useState, useRef, useCallback } from 'react';
import { Link, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectCube } from 'swiper/modules';
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

function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showArrow, setShowArrow] = useState(true);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [audioError, setAudioError] = useState(null);
  
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);
  const theme = useTheme();
  const isDarkMode = theme.name === 'night';

  const songs = [
    'lofi.mp3',
    'lofi-2.mp3',
    'lofi-3.mp3'
  ];

  // Initialize audio context and analyser
  const initializeAudio = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
      }

      if (!sourceRef.current && audioRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }

      setAudioError(null);
    } catch (error) {
      console.error('Error initializing audio:', error);
      setAudioError('Failed to initialize audio system');
    }
  }, []);

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    };
  }, []);

  // Handle visualization
  useEffect(() => {
    if (!isPlaying || !canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Set up canvas with device pixel ratio
    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      return rect;
    };

    let rect = setupCanvas();
    let lastDrawTime = 0;
    const fps = 30;
    const frameInterval = 1000 / fps;

    const draw = (timestamp) => {
      if (!canvasRef.current || !analyserRef.current) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      const elapsed = timestamp - lastDrawTime;
      if (elapsed < frameInterval) return;
      
      lastDrawTime = timestamp;
      
      // Check if canvas size has changed
      const currentRect = canvas.getBoundingClientRect();
      if (currentRect.width !== rect.width || currentRect.height !== rect.height) {
        rect = setupCanvas();
      }

      analyserRef.current.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = theme.colors.cardBg;
      ctx.fillRect(0, 0, rect.width, rect.height);

      const numBars = 8;
      const barWidth = Math.floor((rect.width - 8) / numBars);
      const barSpacing = 1;
      const pixelSize = 2;
      const maxBarHeight = rect.height - 8;

      // Draw bars
      for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor(Math.pow(i / numBars, 1.5) * 20);
        let value = 0;
        const binCount = 3;
        
        // Average multiple frequency bins for smoother visualization
        for (let j = 0; j < binCount; j++) {
          value += dataArray[dataIndex + j] || 0;
        }
        value = value / binCount;
        
        // Reduce amplitude for lower frequencies to prevent overwhelming visuals
        if (i < 3) value *= 0.7;

        const rawHeight = (value / 255) * maxBarHeight;
        const barHeight = Math.max(pixelSize, Math.floor(rawHeight / pixelSize) * pixelSize);
        const x = 4 + (i * (barWidth + barSpacing));

        // Draw main bar
        ctx.fillStyle = theme.colors.accent;
        ctx.fillRect(
          Math.floor(x),
          Math.floor(rect.height - 4 - barHeight),
          Math.floor(barWidth - barSpacing),
          barHeight
        );

        // Randomly add highlights
        if (Math.random() > 0.9) {
          ctx.fillStyle = isDarkMode ? theme.colors.cardBg : '#ffffff';
          ctx.fillRect(
            Math.floor(x),
            Math.floor(rect.height - 4 - barHeight),
            Math.floor((barWidth - barSpacing) / 2),
            pixelSize
          );
        }
      }
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, theme.colors, isDarkMode]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      await initializeAudio();
      
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (!audioRef.current.src) {
          audioRef.current.src = `${process.env.PUBLIC_URL}/sound/${songs[currentSongIndex]}`;
        }
        await audioRef.current.play();
      }
      
      setIsPlaying(!isPlaying);
      setShowArrow(false);
      setAudioError(null);
    } catch (error) {
      console.error('Error toggling playback:', error);
      setAudioError('Failed to play audio');
    }
  };

  const handleSongEnd = useCallback(() => {
    setCurrentSongIndex(prevIndex => (prevIndex + 1) % songs.length);
  }, [songs.length]);

  const handleSkip = () => {
    handleSongEnd();
  };

  // Set up audio element event listeners
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = false;
      audioRef.current.addEventListener('ended', handleSongEnd);
      
      // Add error handling
      const handleError = (e) => {
        console.error('Audio error:', e);
        setAudioError('Error playing audio');
        setIsPlaying(false);
      };
      
      audioRef.current.addEventListener('error', handleError);
      
      return () => {
        audioRef.current.removeEventListener('ended', handleSongEnd);
        audioRef.current.removeEventListener('error', handleError);
      };
    }
  }, [handleSongEnd]);

  // Handle song changes
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = `${process.env.PUBLIC_URL}/sound/${songs[currentSongIndex]}`;
      if (wasPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing new song:', error);
          setAudioError('Failed to play new song');
        });
      }
    }
  }, [currentSongIndex, songs]);

  return (
    <div className="audio-player">
      {showArrow && (
        <img
          src={`${process.env.PUBLIC_URL}/sound/down-arrow.svg`}
          alt="Click to play music"
          className="arrow-indicator"
          style={isDarkMode ? { filter: 'invert(1)' } : undefined}
        />
      )}
      <div className="audio-controls">
        <button
          onClick={togglePlay}
          className={`audio-button ${isDarkMode ? 'dark-mode' : ''}`}
          aria-label={isPlaying ? "Mute audio" : "Unmute audio"}
          style={{
            borderColor: theme.colors.border,
            boxShadow: `4px 4px 0 ${theme.colors.shadow}`
          }}
        >
          <img
            src={`${process.env.PUBLIC_URL}/sound/${isPlaying ? 'speaker.png' : 'speaker-mute.png'}`}
            alt={isPlaying ? "Mute" : "Unmute"}
            className="speaker-icon"
            style={isDarkMode ? { filter: 'invert(1)' } : undefined}
          />
        </button>
        {isPlaying && (
          <>
            <button
              onClick={handleSkip}
              className={`skip-button ${isDarkMode ? 'dark-mode' : ''}`}
              aria-label="Skip to next song"
              style={{
                borderColor: theme.colors.border,
                boxShadow: `4px 4px 0 ${theme.colors.shadow}`
              }}
            >
              <img
                src={`${process.env.PUBLIC_URL}/sound/skip.svg`}
                alt="Skip"
                className="skip-icon"
                style={isDarkMode ? { filter: 'invert(1)' } : undefined}
              />
            </button>
            <div className="visualizer-container">
              <canvas
                ref={canvasRef}
                className="visualizer-canvas"
                style={{
                  borderColor: theme.colors.border,
                  boxShadow: `4px 4px 0 ${theme.colors.shadow}`
                }}
              />
            </div>
          </>
        )}
      </div>
      {audioError && (
        <div className="audio-error" style={{ color: theme.colors.accent }}>
          {audioError}
        </div>
      )}
      <audio ref={audioRef} />
    </div>
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

        const layerNumbers = {
          1: [1, 2, 3, 5, 6, 7, 8], // Lake Meadow
          2: [1, 2, 3, 4], // Grasslands
          3: [1, 2, 3, 4], // Mountain
          4: [1, 2, 3, 4], // Forested Meadow
          5: [1, 2, 3, 4, 5], // Flower Meadow
          6: [1, 2, 3], // Northern Lights
          7: [1, 2] // Boulders
        };

        const newLayers = layerNumbers[sceneNumber].map(num => ({
          number: num,
          path: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_${sceneNumber}/${num}.png`
        }));

        // Set up scene transition
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

  const renderScene = (scene, key) => (
    <div key={key} className={`scene ${scene.state}`}>
      {scene.layers.map((layer, index) => (
        <div
          key={`${key}-${layer.number}`}
          className={`parallax-layer layer-${layer.number}`}
          style={{ 
            backgroundImage: `url("${layer.path}")`,
            animationDuration: `${(200 - (index * 30)) / (currentScene?.id === 1 ? 0.2 : 1)}s`
          }}
        />
      ))}
    </div>
  );

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
                        Data Engineer at 
                        <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer" className="heb-link">
                          <img src={`${process.env.PUBLIC_URL}/heb-logo.png`} alt="H-E-B" className="heb-logo" />
                        </a>
                      </span>
                      <span className="university-title" style={isDarkMode ? { color: '#9d4edd' } : undefined}>
                        University of Texas at Austin
                        <a href="https://www.utexas.edu/" target="_blank" rel="noopener noreferrer" className="ut-link">
                          <img src={`${process.env.PUBLIC_URL}/longhorn.png`} alt="UT Austin" className="ut-logo" />
                        </a>
                      </span>
                      <span style={isDarkMode ? { color: '#ffffff' } : undefined}>Masters in AI Student</span>
                      <span style={isDarkMode ? { color: '#ffffff' } : undefined}>BS Electrical Engineering '23</span>
                    </p>
                    <p className="pixel-text location" style={isDarkMode ? { color: '#9d4edd' } : undefined}>Based in Austin, TX</p>
                  </div>
                  <div className="bio-profile">
                    <div className="bio-profile-image">
                      <img src={`${process.env.PUBLIC_URL}/profile-pixelated.png`} alt="Profile" className="bio-avatar" />
                    </div>
                    <div className="bio-social-links">
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
                      Data Engineer at 
                      <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer" className="heb-link">
                        <img src={`${process.env.PUBLIC_URL}/heb-logo.png`} alt="H-E-B" className="heb-logo" />
                      </a>
                    </span>
                    <span className="university-title" style={isDarkMode ? { color: '#9d4edd' } : undefined}>
                      The University of Texas at Austin
                      <a href="https://www.utexas.edu/" target="_blank" rel="noopener noreferrer" className="ut-link">
                        <img src={`${process.env.PUBLIC_URL}/longhorn.png`} alt="UT Austin" className="ut-logo" />
                      </a>
                    </span>
                    <span style={isDarkMode ? { color: '#ffffff' } : undefined}>Masters in AI Student</span>
                    <span style={isDarkMode ? { color: '#ffffff' } : undefined}>BS Electrical Engineering '24</span>
                  </p>
                  <p className="pixel-text location" style={isDarkMode ? { color: '#9d4edd' } : undefined}>Based in Austin, TX</p>
                </div>
                <div className="bio-profile">
                  <div className="bio-profile-image">
                    <img src={`${process.env.PUBLIC_URL}/profile-pixelated.png`} alt="Profile" className="bio-avatar" />
                  </div>
                  <div className="bio-social-links">
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
            <a href="https://github.com/bicrick/MSAI" 
              target="_blank"
              rel="noopener noreferrer"
              className="header-nav-link"
              style={isDarkMode ? { 
                color: '#9d4edd', 
                borderColor: '#9d4edd',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              } : {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
              <span className="pixel-text">MSAI Coursework</span>
              <i className="fab fa-github" style={{ fontSize: '16px' }}></i>
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
  const theme = useTheme();
  const isDarkMode = theme.name === 'night';

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

const scenes = [
  { id: 1, name: 'Lake Meadow', accent: '#4834d4', thumbnail: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_1/orig.png` },
  { id: 7, name: 'Boulders', accent: '#d4954b', thumbnail: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_7/orig.png` },
  { id: 2, name: 'Warm', accent: '#ff7e67', thumbnail: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_2/orig.png` },
  { id: 3, name: 'Sunset', accent: '#a18cd1', thumbnail: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_3/orig.png` },
  { id: 4, name: 'Forest', accent: '#86c232', thumbnail: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_4/orig.png` },
  { id: 5, name: 'Flower', accent: '#ff4d94', thumbnail: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_5/orig.png` },
  { id: 6, name: 'Night', accent: '#9d4edd', thumbnail: `${process.env.PUBLIC_URL}/Nature Landscapes Free Pixel Art/nature_6/orig.png` },
];

function SceneSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [autoSwitch, setAutoSwitch] = useState(false);
  const { currentScene, setCurrentScene } = useScene();

  useEffect(() => {
    let interval;
    if (autoSwitch) {
      interval = setInterval(() => {
        const currentIndex = scenes.findIndex(scene => scene.id === currentScene?.id);
        const nextIndex = (currentIndex + 1) % scenes.length;
        setCurrentScene(scenes[nextIndex]);
      }, 15000); // Switch every 15 seconds
    }
    return () => clearInterval(interval);
  }, [autoSwitch, currentScene, setCurrentScene]);

  return (
    <div className={`scene-selector book-tabs ${isOpen ? 'open' : ''}`}>
      <div className="drawer-container">
        <button 
          className="drawer-pull"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close scene selector" : "Open scene selector"}
        >
          <span className="drawer-icon">{isOpen ? '>' : '<'}</span>
        </button>
        <div className="scenes-container">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              className={`scene-tab ${currentScene?.id === scene.id ? 'active' : ''}`}
              onClick={() => setCurrentScene(scene)}
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
      <span className="copyright">© 2025 Patrick Brown</span>
      <span className="separator">•</span>
      <Link to="/privacy" className="footer-link">Privacy Policy</Link>
    </footer>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const [currentScene, setCurrentScene] = useState(() => {
    // Set Lake Meadow (scene 1) as the default scene
    return scenes.find(scene => scene.id === 1);
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
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
    </Routes>
  );
}

export default App;
