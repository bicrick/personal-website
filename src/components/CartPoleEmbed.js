import { useEffect, useState } from 'react';
import './CartPoleEmbed.css';

const ORIGIN = 'https://cart-pole-autoresearch.vercel.app';
const FULL_HREF = `${ORIGIN}/#triple`;

// The demo's ?card=1 cut is always navy, whatever the site theme, so it reads as a
// distinct panel in both the featured tiles and the article.
const CARD_SRC = `${ORIGIN}/?embed=1&card=1#single`;

function useNarrow() {
  const query = '(max-width: 800px)';
  const [narrow, setNarrow] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia(query).matches
  ));

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return narrow;
}

function CartPoleTilePreview() {
  return (
    <div className="cart-pole-tile-preview">
      <iframe
        className="cart-pole-tile-frame"
        src={CARD_SRC}
        title="cart-pole demo"
        loading="lazy"
        tabIndex={-1}
      />
    </div>
  );
}

function CartPoleEmbed() {
  const narrow = useNarrow();
  return (
    <figure className="project-figure cart-pole-embed">
      <div className={`cart-pole-embed-stage${narrow ? '' : ' is-live'}`}>
        <iframe
          className="cart-pole-embed-frame"
          src={CARD_SRC}
          title="cart-pole demo"
          loading="lazy"
          tabIndex={narrow ? -1 : 0}
        />
        {narrow ? (
          <a
            className="cart-pole-embed-hit"
            href={FULL_HREF}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="cart-pole-embed-hit-label">Open demo</span>
          </a>
        ) : null}
      </div>
      <figcaption>
        The live reel, from one link through the quad.{' '}
        <a href={FULL_HREF} target="_blank" rel="noopener noreferrer">
          Open the demo
        </a>
        .
      </figcaption>
    </figure>
  );
}

export { FULL_HREF as DEMO_HREF, CartPoleTilePreview };
export default CartPoleEmbed;
