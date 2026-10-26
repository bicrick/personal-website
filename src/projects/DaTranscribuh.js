import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import LiveSiteEmbed from '../components/project/LiveSiteEmbed';

const SITE = 'https://da-transcribuh-site.vercel.app';
const DOWNLOAD = 'https://da-transcribuh-site.vercel.app/download';
const REPO = 'https://github.com/bicrick/da-transcribuh';

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
      <LiveSiteEmbed
        src={SITE}
        title="da transcribuh"
        viewW={1440}
        viewH={1320}
        offsetY={455}
        frameH={835}
        caption={
          <>
            The live site. Click to open{' '}
            <a href={SITE} target="_blank" rel="noopener noreferrer">da transcribuh</a>.
          </>
        }
      />

      <p>
        I talk to coding agents all day and got tired of typing prompts out. I wanted dictation
        that was fast and didn't send my voice anywhere, so I built this. Transcription runs
        locally with WhisperKit. Nothing leaves the Mac.
      </p>

      <p>
        The part I use the most: grab screen snips while you talk. They get stitched into one
        collage next to the transcript, so you can point an agent at five UI nits in one go
        instead of five messages. The whole take, collage and words, lands in clipboard history as
        one entry, so one paste drops both.
      </p>

      <p>
        It's free and open source (MIT), and it runs on Apple Silicon and Intel Macs on macOS 14
        or later. The site explains it better than I can here, so just go try it.
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
