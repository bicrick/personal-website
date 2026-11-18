import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/** Phone-only slim header. Slides away while scrolling down, returns on scroll up. */
export default function MobileTopBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      const next = y > last && y > 64;
      setHidden(next);
      document.documentElement.classList.toggle('m-chrome-hidden', next);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.documentElement.classList.remove('m-chrome-hidden');
    };
  }, []);

  return (
    <header className={`m-topbar${hidden ? ' is-hidden' : ''}`}>
      <Link to="/" className="m-topbar-name">patrick brown</Link>
    </header>
  );
}
