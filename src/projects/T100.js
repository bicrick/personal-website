import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import T100Card from './T100Card';
import T100Ingest from './T100Ingest';
import './T100.css';

const SITE = 'https://t100-web.vercel.app';
const LOGO = `${process.env.PUBLIC_URL}/images/t100/logos`;

const STACK = [
  {
    id: 'typesafe',
    label: 'Jev',
    detail: 'TypeSafe AI',
    src: `${LOGO}/typesafe.png`,
    kind: 'img',
  },
  {
    id: 'claude',
    label: 'Claude',
    detail: 'Haiku & Sonnet',
    src: `${LOGO}/claude.svg`,
    kind: 'svg',
  },
  {
    id: 'gcp',
    label: 'Google Cloud',
    detail: 'GCP',
    src: `${LOGO}/googlecloud.svg`,
    kind: 'svg',
  },
  {
    id: 'firebase',
    label: 'Firestore',
    detail: 'Firebase',
    src: `${LOGO}/firebase.svg`,
    kind: 'svg',
  },
  {
    id: 'vercel',
    label: 'Vercel',
    detail: 'extraction host',
    src: `${LOGO}/vercel.svg`,
    kind: 'svg',
  },
  {
    id: 'fastapi',
    label: 'FastAPI',
    detail: 'Python server',
    src: `${LOGO}/fastapi.svg`,
    kind: 'svg',
  },
  {
    id: 'rapidocr',
    label: 'RapidOCR',
    detail: 'ONNX Runtime',
    src: `${LOGO}/rapidocr.png`,
    kind: 'img-wide',
  },
  {
    id: 'apple',
    label: 'Apple Vision',
    detail: 'on-device cutout',
    src: `${LOGO}/apple.svg`,
    kind: 'svg',
  },
  {
    id: 'expo',
    label: 'Expo',
    detail: 'React Native',
    src: `${LOGO}/expo.svg`,
    kind: 'svg',
  },
];

function BuiltWith() {
  return (
    <section className="t100-stack" aria-labelledby="t100-built-with">
      <h2 id="t100-built-with">Built with</h2>
      <ul className="t100-stack-list">
        {STACK.map((item) => (
          <li key={item.id} className={`t100-stack-item is-${item.kind}`}>
            <span className="t100-stack-icon" aria-hidden="true">
              <img src={item.src} alt="" />
            </span>
            <span className="t100-stack-label">{item.label}</span>
            <span className="t100-stack-detail">{item.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function T100() {
  return (
    <ProjectDetail
      title="t100"
      date="draft · November 2026"
      linkHref={SITE}
      linkLabel="t100-web.vercel.app"
      staticTitle
    >
      <div className="t100-article">
        <figure className="t100-hero">
          <div className="t100-hero-stage">
            <T100Card />
          </div>
        </figure>

        <p>
          T100 is an Expo / React Native app with a FastAPI extraction server on
          Vercel. Photograph the card after the round. On device, an Apple Vision
          mask keeps the paper silhouette; the server rectifies with LSD quads and
          — only when a crease is found — runs a fold-aware dewarp.
        </p>

        <T100Ingest />

        <p>
          RapidOCR (ONNX) finds the grid. Each score cell goes to Jev, a hosted
          TypeSafe model. A sure read (confidence ≥ 0.9) is never overwritten.
          Haiku fills the course, date, and player names; Sonnet only steps in for
          unusual notation or totals that do not add up. Anything still unsure
          becomes a short question with Jev&apos;s top guesses as choices.
        </p>

        <p>
          That Jev-first, ask-the-user loop reaches 98.2% of cells correct after a
          median of two questions per card, at $0.0037/card — against Opus at
          98.8% and $0.044/card in a single pass. The demo card is the real
          Pebble Beach guest card; scores inside were written with Scribe for the
          landing demo.
        </p>

        <BuiltWith />
      </div>
    </ProjectDetail>
  );
}

export default T100;
