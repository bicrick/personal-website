import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTheme } from './App';

// Global audio context and state to persist across route changes
let globalAudioContext = null;
let globalAnalyser = null;
let globalSource = null;

// Global audio state to persist across re-renders
let globalCurrentSong = 0;
let globalIsPlaying = false;

function AudioPlayerPortal() {
  const [isPlaying, setIsPlaying] = useState(globalIsPlaying);
  const [showArrow, setShowArrow] = useState(!globalIsPlaying);
  const [currentSongIndex, setCurrentSongIndex] = useState(globalCurrentSong);
  const [audioError, setAudioError] = useState(null);
  
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const theme = useTheme();
  const isDarkMode = theme.name === 'night';
  
  // Store theme colors in a ref to access in visualization without causing re-renders
  const themeColorsRef = useRef({
    cardBg: theme.colors.cardBg,
    accent: theme.colors.accent
  });

  // Update theme colors ref when theme changes
  useEffect(() => {
    themeColorsRef.current = {
      cardBg: theme.colors.cardBg,
      accent: theme.colors.accent
    };
  }, [theme.colors.cardBg, theme.colors.accent]);

  // Base URL for assets - use direct paths in production, PUBLIC_URL in development
  const baseUrl = process.env.NODE_ENV === 'production'
    ? ''  // Use direct paths in production
    : process.env.PUBLIC_URL;  // Use PUBLIC_URL for development

  const songs = [
    `${baseUrl}/sound/lofi.mp3`,
    `${baseUrl}/sound/lofi-2.mp3`,
    `${baseUrl}/sound/lofi-3.mp3`
  ];

  // Initialize audio context and analyser
  const initializeAudio = useCallback(async () => {
    try {
      if (!globalAudioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        globalAudioContext = new AudioContext();
        globalAnalyser = globalAudioContext.createAnalyser();
        globalAnalyser.fftSize = 256;
        globalAnalyser.smoothingTimeConstant = 0.8;
      }

      if (globalAudioContext.state === 'suspended') {
        await globalAudioContext.resume();
      }

      if (!globalSource && audioRef.current) {
        globalSource = globalAudioContext.createMediaElementSource(audioRef.current);
        globalSource.connect(globalAnalyser);
        globalAnalyser.connect(globalAudioContext.destination);
      }

      setAudioError(null);
    } catch (error) {
      console.error('Error initializing audio:', error);
      setAudioError('Failed to initialize audio system');
    }
  }, []);

  // Handle visualization - only depends on isPlaying state
  useEffect(() => {
    if (!isPlaying || !canvasRef.current || !globalAnalyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = globalAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

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
      if (!canvasRef.current || !globalAnalyser) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      const elapsed = timestamp - lastDrawTime;
      if (elapsed < frameInterval) return;
      
      lastDrawTime = timestamp;
      
      const currentRect = canvas.getBoundingClientRect();
      if (currentRect.width !== rect.width || currentRect.height !== rect.height) {
        rect = setupCanvas();
      }

      globalAnalyser.getByteFrequencyData(dataArray);

      // Use theme colors from ref
      ctx.fillStyle = themeColorsRef.current.cardBg;
      ctx.fillRect(0, 0, rect.width, rect.height);

      const numBars = 8;
      const barWidth = Math.floor((rect.width - 8) / numBars);
      const barSpacing = 1;
      const pixelSize = 2;
      const maxBarHeight = rect.height - 8;

      for (let i = 0; i < numBars; i++) {
        // Evenly distribute bars across frequency range
        const startIndex = Math.floor((i / numBars) * (bufferLength / 2));
        const endIndex = Math.floor(((i + 1) / numBars) * (bufferLength / 2));
        
        // Average the frequency data for this bar
        let sum = 0;
        for (let j = startIndex; j < endIndex; j++) {
          sum += dataArray[j];
        }
        let value = sum / (endIndex - startIndex);
        
        // Apply smoothing for lower frequencies
        if (i < 3) value *= 0.8;
        
        // Ensure the value is within bounds
        value = Math.min(255, Math.max(0, value));

        const rawHeight = (value / 255) * maxBarHeight;
        // Quantize height to pixel size for pixelated look
        const barHeight = Math.max(pixelSize, Math.floor(rawHeight / pixelSize) * pixelSize);
        const x = 4 + (i * (barWidth + barSpacing));

        // Draw main bar with theme accent color
        ctx.fillStyle = themeColorsRef.current.accent;
        ctx.fillRect(
          Math.floor(x),
          Math.floor(rect.height - 4 - barHeight),
          Math.floor(barWidth - barSpacing),
          barHeight
        );

        // Add a subtle highlight at the top of each bar
        if (barHeight > pixelSize * 2) {
          ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.5)';
          ctx.fillRect(
            Math.floor(x),
            Math.floor(rect.height - 4 - barHeight),
            Math.floor(barWidth - barSpacing),
            pixelSize
          );
        }
      }
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying]); // Only depend on isPlaying state

  // Initialize audio source on mount and handle cleanup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set crossOrigin before setting src
    audio.crossOrigin = "anonymous";
    
    if (!audio.src) {
      audio.src = songs[currentSongIndex];
    }
    
    audio.loop = false;
    
    const handleEnded = () => {
      const nextIndex = (currentSongIndex + 1) % songs.length;
      globalCurrentSong = nextIndex;
      setCurrentSongIndex(nextIndex);
      audio.src = songs[nextIndex];
      if (isPlaying) {
        audio.play().catch(error => {
          console.error('Error playing next song:', error);
          setAudioError('Failed to play next song');
        });
      }
    };
    
    const handleError = (e) => {
      console.error('Audio error:', e);
      setAudioError('Error playing audio');
      setIsPlaying(false);
      globalIsPlaying = false;
    };
    
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    // Cleanup function
    return () => {
      // Only try to remove listeners if audio still exists
      if (audio) {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      }

      // Clean up global resources on unmount only
      if (audio === null) {
        if (globalSource) {
          globalSource.disconnect();
          globalSource = null;
        }

        if (globalAnalyser) {
          globalAnalyser.disconnect();
          globalAnalyser = null;
        }

        if (globalAudioContext) {
          globalAudioContext.close().catch(console.error);
          globalAudioContext = null;
        }

        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      }
    };
  }, [currentSongIndex, isPlaying, songs]); // Add necessary dependencies

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      await initializeAudio();
      
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      
      globalIsPlaying = !isPlaying;
      setIsPlaying(!isPlaying);
      setShowArrow(false);
      setAudioError(null);
    } catch (error) {
      console.error('Error toggling playback:', error);
      setAudioError('Failed to play audio');
      globalIsPlaying = false;
      setIsPlaying(false);
    }
  };

  const handleSkip = useCallback(() => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    globalCurrentSong = nextIndex;
    setCurrentSongIndex(nextIndex);
    
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = songs[nextIndex];
      if (wasPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing new song:', error);
          setAudioError('Failed to play new song');
          globalIsPlaying = false;
          setIsPlaying(false);
        });
      }
    }
  }, [currentSongIndex, songs]);

  // Update audio source when song changes
  useEffect(() => {
    if (audioRef.current && globalCurrentSong !== currentSongIndex) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = songs[currentSongIndex];
      if (wasPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing new song:', error);
          setAudioError('Failed to play new song');
          globalIsPlaying = false;
          setIsPlaying(false);
        });
      }
    }
  }, [currentSongIndex, songs]); // Add songs to dependency array

  const playerContent = (
    <div className="audio-player-portal">
      {showArrow && (
        <img
          src={`${baseUrl}/sound/down-arrow.svg`}
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
            backgroundColor: theme.colors.cardBg,
            borderColor: theme.colors.border,
            boxShadow: `4px 4px 0 ${theme.colors.shadow}`,
            transition: 'all 0.2s ease'
          }}
        >
          <img
            src={`${baseUrl}/sound/${isPlaying ? 'speaker.png' : 'speaker-mute.png'}`}
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
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.border,
                boxShadow: `4px 4px 0 ${theme.colors.shadow}`,
                transition: 'all 0.2s ease'
              }}
            >
              <img
                src={`${baseUrl}/sound/skip.svg`}
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
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.border,
                  boxShadow: `4px 4px 0 ${theme.colors.shadow}`,
                  transition: 'all 0.2s ease'
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
      <audio ref={audioRef} crossOrigin="anonymous" />
    </div>
  );

  return ReactDOM.createPortal(
    playerContent,
    document.body
  );
}

export default AudioPlayerPortal; 
