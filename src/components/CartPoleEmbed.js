import { useEffect, useState } from 'react';
import './CartPoleEmbed.css';

const ORIGIN = 'https://cart-pole-autoresearch.vercel.app';
const FULL_HREF = `${ORIGIN}/#triple`;
const THEME_MSG = 'cart-pole-theme';

function isDark() {
  return document.documentElement.classList.contains('is-dark');
}

function embedSrc(dark) {
  return `${ORIGIN}/?embed=1&theme=${dark ? 'dark' : 'light'}#triple`;
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

function CartPoleFrame({ dark, className, title }) {
  const [frame, setFrame] = useState(null);

  useEffect(() => {
    postTheme(frame, dark);
  }, [frame, dark]);

  return (
    <iframe
      ref={setFrame}
      className={className}
      src={embedSrc(dark)}
      title={title}
      loading="lazy"
      tabIndex={-1}
    />
  );
}

function CartPoleTilePreview() {
  const dark = useSiteDark();
  return (
    <div className="cart-pole-tile-preview">
      <CartPoleFrame dark={dark} className="cart-pole-tile-frame" title="cart-pole demo" />
    </div>
  );
}

function CartPoleEmbed() {
  const dark = useSiteDark();
  return (
    <figure className="project-figure cart-pole-embed">
      <div className="cart-pole-embed-stage">
        <CartPoleFrame dark={dark} className="cart-pole-embed-frame" title="cart-pole demo" />
        <a
          className="cart-pole-embed-hit"
          href={FULL_HREF}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="cart-pole-embed-hit-label">Open demo</span>
        </a>
      </div>
      <figcaption>
        The triple pendulum swings up, holds, then drops and goes again.{' '}
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
