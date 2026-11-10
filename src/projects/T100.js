import React, { useEffect, useRef } from 'react';
import ProjectDetail from '../components/ProjectDetail';
import './T100.css';

const SITE = 'https://t100-web.vercel.app';
const IMG = `${process.env.PUBLIC_URL}/images/t100`;

/** Muted looping hero; pauses under prefers-reduced-motion. */
function HeroVideo() {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return undefined;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (mq.matches) {
        video.pause();
        try {
          video.currentTime = 0;
        } catch (_) {
          /* ignore */
        }
        return;
      }
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <figure className="t100-hero">
      <div className="t100-hero-frame">
        <video
          ref={ref}
          className="t100-hero-video"
          src={`${IMG}/pebble-unfold.mp4`}
          poster={`${IMG}/pebble-unfold-poster.jpg`}
          width={960}
          height={672}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    </figure>
  );
}

function T100() {
  return (
    <ProjectDetail
      title="t100"
      date="draft · November 2026"
      linkHref={SITE}
      linkLabel="t100-web.vercel.app"
      abstract="How to read a paper golf scorecard — cut the card out of a photo, find the grid, ask a digit model first, and only bother the golfer when you are unsure."
    >
      <div className="t100-article">
        <HeroVideo />

        <p>
          t100 is an expo / react native app (also on web) with a fastapi extraction
          server on vercel. you photograph the card after the round. on device, an
          apple vision mask keeps the true paper silhouette. the server cleans the
          paper, rectifies it, and — only when a crease is found — runs a fold-aware
          dewarp before reading the grid.
        </p>

        <p>
          print is read with rapidocr (onnx, so no pytorch in the vercel bundle).
          hole columns snap to ruled lines; player rows come from lines plus
          ink-versus-print. each score cell is cropped and sent to jev, a hosted
          typesafe model, as a multiple choice: blank, 1–12, dash, or unreadable.
          a sure jev read (confidence ≥ 0.9) is never overwritten. sonnet only steps
          in for unusual notation, ambiguous rows, or totals that do not add up.
          anything still unsure becomes a short question with jev&apos;s top guesses
          as choices.
        </p>

        <p>
          that jev-first, ask-the-user loop is the whole product bet. on a
          hand-checked set it reaches 98.2% of cells correct after a median of two
          questions per card, at $0.0037/card — against opus at 98.8% and $0.044/card
          in a single pass. the test corpus behind the work is 1,508 internet
          scorecard images plus 52 complete front/back pairs (2 real, 50 synthetic).
        </p>

        <p>
          the app is local-first on firebase, with a reanimated 3d unfold for
          foldable front+back cards. the{' '}
          <a href={SITE} target="_blank" rel="noopener noreferrer">
            landing page
          </a>{' '}
          hero is the real pebble beach guest card; the scores inside are invented
          for the demo and written with scribe, my handwriting model.
        </p>
      </div>
    </ProjectDetail>
  );
}

export default T100;
