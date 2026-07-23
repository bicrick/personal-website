import React from 'react';

export default function HomePage() {
  return (
    <section className="page-section home-section" aria-label="home">
      <div className="page-section-inner home-inner">
        <div className="home-compose">
          <div className="home-copy">
            <h2 className="home-heading">Patrick Brown</h2>
            <p className="home-bio">
              Engineer specializing in large-scale ML data preparation at{' '}
              <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer">H-E-B</a>
              . Austin, TX.
            </p>
            <div className="home-links">
              <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">github</a>
              <span className="nav-separator">·</span>
              <a href="https://resume.bicrick.com/" target="_blank" rel="noopener noreferrer">resume</a>
              <span className="nav-separator">·</span>
              <a href="https://x.com/patrickbbrown" target="_blank" rel="noopener noreferrer">x</a>
            </div>
          </div>
          <img
            src={`${process.env.PUBLIC_URL}/about/headshot.jpg`}
            alt="Patrick Brown"
            className="home-pic"
            width="260"
            height="260"
          />
        </div>
      </div>
    </section>
  );
}
