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
          Vercel. After the round you shoot the score sides — Front required, Back
          optional — with the system camera or photo library. On iOS, Apple Vision
          builds a per-pixel paper silhouette for the slot; the server still gets
          the original photo, scores identity against contour and LSD quads, and
          keeps identity unless a quad wins by more than 0.03. Fold-aware dewarp
          runs after rectify and stays only when the crease score is at least 0.05
          or the warp is at least 45&nbsp;px.
        </p>

        <T100Ingest />

        <p>
          RapidOCR (ONNX) maps the printed hole grid and header. Jev reads each
          handwritten cell and also gates scorecard-ness, notation, player count,
          row kind, and totals. Haiku is only a fallback when the course is missing
          or confidence is below 0.7. The app asks one question per screen —
          course, date, tees, or a low-confidence cell below 0.72.
        </p>

        <p>
          Latest production-shaped check: 191/194 holes = 98.45%, $0.154 for six
          cards (about $2.57 per 100). The floating card above is a Pebble Beach
          guest cover; the sequence below walks one Crow Canyon front card from
          photo through extract on develop e548054.
        </p>

        <BuiltWith />
      </div>
    </ProjectDetail>
  );
}

export default T100;
