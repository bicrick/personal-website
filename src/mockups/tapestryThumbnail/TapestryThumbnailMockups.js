import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import VariantA from './VariantA';
import './TapestryThumbnailMockups.css';

const VARIANTS = [
  {
    id: 'a2',
    label: 'A2',
    caption: 'Production band, three fifths of the tile. Small woven mark centered on it.',
    ribbon: 0.6,
    mark: 0.22,
  },
  {
    id: 'a3',
    label: 'A3',
    caption: 'Shorter band, smaller mark. Same scroll, same cream field, same reflections.',
    ribbon: 0.48,
    mark: 0.15,
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
          Two studies of the striped mark on a production ribbon. The band
          scrolls through the middle of the tile, with cream above and below
          and the live viewer's mirror. The live thumbnail is unchanged.
          Reduced motion holds one frame.
        </p>
        <p className="tap-mock-back">
          <Link to="/projects">projects</Link>
        </p>
      </header>
      <div className="tap-mock-row">
        {shown.map(({ id, label, caption, ribbon, mark }) => (
          <figure key={id} id={`variant-${id}`} className="tap-mock-figure">
            <div className="tap-mock-tile" data-shot={id}>
              <VariantA ribbon={ribbon} mark={mark} />
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
