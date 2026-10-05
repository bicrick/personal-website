import React from 'react';
import { Link } from 'react-router-dom';
import './HomeFooter.css';

export default function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="home-block-head">
        <h2>contact</h2>
        <Link to="/contact">all links</Link>
      </div>
      <p className="home-footer-lead">
        Email is the fastest way to reach me. I am relocating to San Francisco.
      </p>
      <p className="home-footer-links">
        <a href="mailto:patrickbrownai@gmail.com">patrickbrownai@gmail.com</a>
      </p>
    </footer>
  );
}
