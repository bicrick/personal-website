import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import VariantA from './VariantA';
import VariantB from './VariantB';
import VariantC from './VariantC';
import './TapestryThumbnailMockups.css';

const VARIANTS = [
  {
    id: 'a',
    label: 'A',
    caption: 'The strip fills the tile. The woven mark sits on it in crisp ink.',
    Node: VariantA,
  },
  {
    id: 'b',
    label: 'B',
    caption: 'The strip fills the tile. The infinity is frosted glass with a warm rim.',
    Node: VariantB,
  },
  {
    id: 'c',
    label: 'C',
    caption: 'The strip shows only inside the infinity, on the production dark field.',
    Node: VariantC,
  },
];

export default function TapestryThumbnailMockups() {
  const [params] = useSearchParams();
  const solo = (params.get('solo') || '').toLowerCase();
  const capture = params.get('capture') === '1';
  const shown = useMemo(
    () => VARIANTS.filter((variant) => !solo || variant.id === solo),
    [solo],
  );

  useEffect(() => {
    if (!capture) return undefined;
    document.body.classList.add('tap-mock-capture');
    return () => document.body.classList.remove('tap-mock-capture');
  }, [capture]);

  return (
    <main className={`tap-mock${capture ? ' is-capture' : ''}${solo ? ' is-solo' : ''}`}>
      <Helmet>
        <title>bicrick</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <header className="tap-mock-head">
        <p className="tap-mock-kicker">mockups</p>
        <h1>infinite tapestry thumbnail</h1>
        <p>
          Three studies for the project tile. The live thumbnail is unchanged.
          Each one scrolls the real strip at the production pace, and holds still
          when reduced motion is on.
        </p>
        <p className="tap-mock-back">
          <Link to="/projects">projects</Link>
        </p>
      </header>
      <div className="tap-mock-row">
        {shown.map(({ id, label, caption, Node }) => (
          <figure key={id} id={`variant-${id}`} className="tap-mock-figure">
            <div className="tap-mock-tile">
              <Node />
            </div>
            <figcaption>
              <span className="tap-mock-key">{label}</span>
              <span>{caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
