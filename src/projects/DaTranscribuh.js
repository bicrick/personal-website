import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import DaTranscribuhDemo from '../components/project/datranscribuh';
import './DaTranscribuh.css';

const SITE = 'https://da-transcribuh-site.vercel.app';
const DOWNLOAD = 'https://da-transcribuh-site.vercel.app/download';
const REPO = 'https://github.com/bicrick/da-transcribuh';
const IMG = `${process.env.PUBLIC_URL}/images/da-transcribuh`;

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
      <DaTranscribuhDemo />

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
