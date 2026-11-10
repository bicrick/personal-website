import React, { useEffect, useRef } from 'react';
import ProjectDetail from '../components/ProjectDetail';
import './T100.css';

const SITE = 'https://t100-web.vercel.app';
const IMG = `${process.env.PUBLIC_URL}/images/t100`;

/** Muted looping demo; pauses under prefers-reduced-motion. */
function LoopVideo({
  src,
  poster,
  width,
  height,
  className = '',
  preload = 'none',
  eager = false,
}) {
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
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      width={width}
      height={height}
      autoPlay
      muted
      loop
      playsInline
      preload={eager ? 'metadata' : preload}
    />
  );
}

function PhoneDemo({ src, poster, label }) {
  return (
    <figure className="t100-phone">
      <LoopVideo
        src={src}
        poster={poster}
        width={390}
        height={844}
        className="t100-phone-video"
      />
      {label ? <figcaption>{label}</figcaption> : null}
    </figure>
  );
}

function T100() {
  return (
    <ProjectDetail
      title="t100"
      titleLabel="t100"
      titleSuffix={(
        <img
          className="project-title-logo t100-title-mark"
          src={`${IMG}/t100-header-mark.png`}
          alt=""
          width={81}
          height={80}
        />
      )}
      date="draft · November 2026"
      linkHref={SITE}
      linkLabel="t100-web.vercel.app"
      abstract="Lose the phone on the golf course. T100 keeps every paper scorecard you play in a digital library — photograph the card after the round, keep the crease and the pencil marks."
    >
      <div className="t100-article">
        <figure className="t100-hero">
          <LoopVideo
            src={`${IMG}/pebble-unfold.mp4`}
            poster={`${IMG}/pebble-unfold-poster.jpg`}
            width={800}
            height={1036}
            className="t100-hero-video"
            eager
            preload="metadata"
          />
          <figcaption>
            the real Pebble Beach guest card, unfolding — same hero as{' '}
            <a href={SITE} target="_blank" rel="noopener noreferrer">
              the landing page
            </a>
          </figcaption>
        </figure>

        <p>
          golf was meant to be scored with pencil and paper, not on your phone.
          t100 is an ios app (expo / react native, also on web) for the rounds you
          already mark on a card. you play the round, photograph the card when it
          is over, and every card sits in a library on a mahogany wood shelf —
          cut out of the photo at its true paper shape, with even lighting.
        </p>

        <h2>/ unfold</h2>
        <p>
          folded cards with front and back photos animate open at the detected
          fold. the motion is 3d, driven by reanimated, so the crease feels like
          paper rather than a page flip.
        </p>
        <PhoneDemo
          src={`${IMG}/unfold.mp4`}
          poster={`${IMG}/unfold-poster.jpg`}
          label="front and back, opening at the fold"
        />

        <h2>/ scores</h2>
        <p>
          a custom fastapi server on vercel reads the card. a per-cell handwritten
          digit classifier handles most holes; an llm fallback steps in when the
          ink is messy, and the app asks you to confirm when it is unsure. it
          understands score notation and circled tees.
        </p>
        <figure className="t100-still">
          <img
            src={`${IMG}/tee.webp`}
            alt="Scorecard detail with circled tee markers and handwritten scores"
            width={900}
            height={1948}
            loading="lazy"
            decoding="async"
          />
          <figcaption>circled tees and handwritten scores, kept as they were</figcaption>
        </figure>

        <h2>/ library</h2>
        <p>
          sort by date or course. edit or delete a round. zoom into a card on the
          shelf. import from 18birdies exports and generate scorecards for those
          rounds. accounts run on firebase.
        </p>
        <div className="t100-phone-row" aria-label="library demos">
          <PhoneDemo
            src={`${IMG}/sort.mp4`}
            poster={`${IMG}/sort-poster.jpg`}
            label="sort"
          />
          <PhoneDemo
            src={`${IMG}/delete-edit.mp4`}
            poster={`${IMG}/delete-edit-poster.jpg`}
            label="edit and delete"
          />
          <PhoneDemo
            src={`${IMG}/zoom.mp4`}
            poster={`${IMG}/zoom-poster.jpg`}
            label="zoom"
          />
        </div>

        <h2>/ handicap</h2>
        <p>
          whs handicap from course rating and slope. the app remembers your usual
          tees per course so the next round starts where you left off.
        </p>
        <PhoneDemo
          src={`${IMG}/profile.mp4`}
          poster={`${IMG}/profile-poster.jpg`}
          label="profile and tees"
        />

        <h2>/ reading the cards</h2>
        <p>
          the reading pipeline was benchmarked on a test corpus of about 1,500
          internet scorecards plus synthetic front/back pairs — enough variety to
          stress the digit model and the llm fallback before asking a golfer to
          trust a round.
        </p>

        <h2>/ web</h2>
        <p>
          the same library runs on the web. the landing page uses the pebble beach
          guest card as its scroll hero.
        </p>
        <figure className="t100-still t100-still-wide">
          <img
            src={`${IMG}/landing.webp`}
            alt="T100 landing page with paper scorecards"
            width={1400}
            height={876}
            loading="lazy"
            decoding="async"
          />
        </figure>
        <figure className="t100-still t100-still-wide">
          <img
            src={`${IMG}/web-library.webp`}
            alt="T100 web library of paper scorecards on a wood shelf"
            width={1400}
            height={3030}
            loading="lazy"
            decoding="async"
          />
          <figcaption>web library — cards on the shelf</figcaption>
        </figure>

        <p>
          <a href={SITE} target="_blank" rel="noopener noreferrer">
            see t100
          </a>
        </p>
      </div>
    </ProjectDetail>
  );
}

export default T100;
