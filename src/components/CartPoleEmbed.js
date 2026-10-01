import { useEffect, useState } from 'react';
import './CartPoleEmbed.css';

const ORIGIN = 'https://cart-pole-autoresearch.vercel.app';
const FULL_HREF = `${ORIGIN}/#triple`;
const THEME_MSG = 'cart-pole-theme';

function isDark() {
  return document.documentElement.classList.contains('is-dark');
}

// ?card=1 is the tinted panel: pale blue in light mode, navy in dark mode.
function cardSrc(dark) {
  return `${ORIGIN}/?embed=1&card=1&theme=${dark ? 'dark' : 'light'}#single`;
}

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

function useSiteDark() {
  const [dark, setDark] = useState(isDark);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains('is-dark'));
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return dark;
}

function postTheme(frame, dark) {
  frame?.contentWindow?.postMessage(
    { type: THEME_MSG, theme: dark ? 'dark' : 'light' },
    ORIGIN,
  );
}

function CartPoleFrame({ dark, className, title, interactive = false }) {
  const [frame, setFrame] = useState(null);

  useEffect(() => {
    postTheme(frame, dark);
  }, [frame, dark]);

  return (
    <iframe
      ref={setFrame}
      className={className}
      src={cardSrc(dark)}
      title={title}
      loading="lazy"
      tabIndex={interactive ? 0 : -1}
    />
  );
}

function CartPoleTilePreview() {
  const dark = useSiteDark();
  return (
    <div className="cart-pole-tile-preview">
      <CartPoleFrame
        dark={dark}
        className="cart-pole-tile-frame"
        title="cart-pole demo"
      />
    </div>
  );
}

function CartPoleEmbed() {
  const dark = useSiteDark();
  const narrow = useNarrow();
  return (
    <figure className="project-figure cart-pole-embed">
      <div className={`cart-pole-embed-stage${narrow ? '' : ' is-live'}`}>
        <CartPoleFrame
          dark={dark}
          className="cart-pole-embed-frame"
          title="cart-pole demo"
          interactive={!narrow}
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
