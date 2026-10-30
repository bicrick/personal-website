import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import ProjectFigure from '../components/project/ProjectFigure';
import ProjectPair from '../components/project/ProjectPair';
import './DaTranscribuh.css';

const SITE = 'https://da-transcribuh-site.vercel.app';
const DOWNLOAD = 'https://da-transcribuh-site.vercel.app/download';
const REPO = 'https://github.com/bicrick/da-transcribuh';
const IMG = `${process.env.PUBLIC_URL}/images/da-transcribuh`;

// Marketing stills are a proposal — flip to false to drop the pair.
const SHOW_STILLS = true;

function DaTranscribuh() {
  return (
    <ProjectDetail
      title="da transcribuh"
      date="October 2026"
      linkHref={REPO}
      linkLabel="view repo"
      secondaryLinkHref={SITE}
      secondaryLinkLabel="try here"
      tertiaryLinkHref={DOWNLOAD}
      tertiaryLinkLabel="download"
      abstract="A free macOS menu bar app for voice-to-text. Hit option-space, talk, and the text pastes wherever you're typing. It all runs on your Mac."
    >
      <figure className="project-figure dt-theme-shot">
        <video
          className="dt-theme-shot-light"
          src={`${IMG}/da-transcribuh-hero-light.mp4`}
          poster={`${IMG}/da-transcribuh-hero-light-poster.jpg`}
          width={1280}
          height={720}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="da transcribuh waving pill"
        />
        <video
          className="dt-theme-shot-dark"
          src={`${IMG}/da-transcribuh-hero-dark.mp4`}
          poster={`${IMG}/da-transcribuh-hero-dark-poster.jpg`}
          width={1280}
          height={720}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="da transcribuh waving pill"
        />
      </figure>

      {SHOW_STILLS ? (
        <>
          <ProjectPair>
            <ProjectFigure
              src={`${IMG}/03-point-and-yap.webp`}
              alt="point at stuff and yap"
              width={1080}
              height={1080}
              contain
            />
            <ProjectFigure
              src={`${IMG}/07-one-paste.webp`}
              alt="pics and words, one paste"
              width={1600}
              height={900}
              contain
            />
          </ProjectPair>
          <p className="project-caption">point at stuff and yap, then one paste</p>
        </>
      ) : null}

      <figure className="project-figure dt-theme-shot">
        <a
          className="dt-theme-shot-link"
          href={SITE}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="dt-theme-shot-light"
            src={`${IMG}/desktop-light-fold.webp`}
            alt="da transcribuh site, light mode"
            width={1440}
            height={900}
          />
          <img
            className="dt-theme-shot-dark"
            src={`${IMG}/desktop-dark-fold.webp`}
            alt="da transcribuh site, dark mode"
            width={1440}
            height={900}
          />
        </a>
        <figcaption>
          the live site.{' '}
          <a href={SITE} target="_blank" rel="noopener noreferrer">
            open it
          </a>
        </figcaption>
      </figure>

      <p>
        free and MIT. Apple Silicon and Intel, macOS 14+. transcription runs on-device
        with Parakeet v2.
      </p>

      <p>
        <a href={SITE} target="_blank" rel="noopener noreferrer">try da transcribuh</a>
        {' | '}
        <a href={DOWNLOAD} target="_blank" rel="noopener noreferrer">download for mac</a>
        {' | '}
        <a href={REPO} target="_blank" rel="noopener noreferrer">source on github</a>
      </p>
    </ProjectDetail>
  );
}

export default DaTranscribuh;
