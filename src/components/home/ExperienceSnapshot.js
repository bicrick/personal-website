import React from 'react';
import { Link } from 'react-router-dom';
import './ExperienceSnapshot.css';

const ROWS = [
  {
    role: 'Data Engineer II',
    org: 'H-E-B',
    dates: 'Apr 2025 – present',
    href: '/heb',
    logo: `${process.env.PUBLIC_URL}/images/heb/heb-logo.png`,
  },
  {
    role: 'M.S. Artificial Intelligence',
    org: 'UT Austin',
    dates: 'Aug 2024 – Dec 2025',
    href: '/projects/ai-masters',
    logo: `${process.env.PUBLIC_URL}/images/career/ut-austin.svg`,
  },
];

export default function ExperienceSnapshot() {
  return (
    <section className="home-block" aria-label="experience">
      <div className="home-block-head">
        <h2>experience</h2>
        <Link to="/career">full career</Link>
      </div>
      <ul className="experience-list">
        {ROWS.map((row) => (
          <li key={`${row.role}-${row.org}`}>
            <Link to={row.href} className="experience-row">
              <span className="experience-role">{row.role}</span>
              <span className="experience-logo">
                <img src={row.logo} alt={row.org} />
              </span>
              <span className="experience-dates">{row.dates}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
