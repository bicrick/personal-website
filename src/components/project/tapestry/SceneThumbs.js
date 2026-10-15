import React from 'react';
import './tapestry.css';

const IMG = `${process.env.PUBLIC_URL}/images/infinite-tapestry`;

const SCENES = [
  {
    src: `${IMG}/ribbon-lighthouse.webp`,
    label: 'sea-glass lighthouse',
    href: 'https://infinitetapestry.app/s/47',
  },
  {
    src: `${IMG}/ribbon-labradors.webp`,
    label: 'labradors in daisies',
    href: 'https://infinitetapestry.app/s/85',
  },
  {
    src: `${IMG}/ribbon-lanterns.webp`,
    label: 'paper boat, lantern sky',
    href: 'https://infinitetapestry.app/s/52',
  },
];

export default function SceneThumbs() {
  return (
    <div className="it-thumbs" aria-label="Sample scenes from the live tapestry">
      {SCENES.map((scene) => (
        <figure key={scene.href}>
          <a href={scene.href} target="_blank" rel="noopener noreferrer">
            <img src={scene.src} alt={scene.label} loading="lazy" />
          </a>
          <figcaption>{scene.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
