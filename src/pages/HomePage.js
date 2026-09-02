import React from 'react';

export default function HomePage() {
  return (
    <section className="page-section home-section" aria-label="home">
      <div className="page-section-inner home-inner">
        <div className="home-compose">
          <img
            src={`${process.env.PUBLIC_URL}/about/headshot.jpg`}
            alt="Patrick Brown"
            className="home-pic"
            width="320"
            height="320"
          />
          <div className="home-copy">
            <h2 className="home-heading">Patrick Brown</h2>
            <p className="home-bio">
              Agent-first engineer specializing in machine learning.
              Austin, TX.
            </p>
            <p className="home-bio-sub">
              Currently at{' '}
              <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer">H-E-B</a>
              .
            </p>
            <div className="home-links">
              <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">github</a>
              <span className="nav-separator">·</span>
              <a href="https://resume.bicrick.com/" target="_blank" rel="noopener noreferrer">resume</a>
              <span className="nav-separator">·</span>
              <a href="https://x.com/patrickbbrown" target="_blank" rel="noopener noreferrer">x</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
