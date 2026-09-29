import React from 'react';
import { Link } from 'react-router-dom';
import './HomeFooter.css';

const LINKS = [
  { label: 'email', href: 'mailto:patrickbrownai@gmail.com' },
  { label: 'github', href: 'https://github.com/bicrick', external: true },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/patrick-brown-470617195/', external: true },
  { label: 'resume', href: 'https://resume.bicrick.com/', external: true },
  { label: 'x', href: 'https://x.com/patrickbbrown', external: true },
  { label: 'cursor', href: 'https://cursor.com/@bicrick', external: true },
];

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
        {LINKS.map((link, index) => (
          <React.Fragment key={link.label}>
            {index > 0 ? <span className="nav-separator">·</span> : null}
            {link.external ? (
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ) : (
              <a href={link.href}>{link.label}</a>
            )}
          </React.Fragment>
        ))}
      </p>
    </footer>
  );
}
