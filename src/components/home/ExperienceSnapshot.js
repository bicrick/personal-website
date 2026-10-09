import React from 'react';
import { Link } from 'react-router-dom';
import './ExperienceSnapshot.css';

const ROWS = [
  {
    org: 'H-E-B',
    href: '/heb',
    logo: `${process.env.PUBLIC_URL}/images/heb/heb-logo.png`,
    entries: [
      { role: 'Data Platform Engineer', dates: 'Jun 2023 – present' },
    ],
  },
  {
    org: 'UT Austin',
    href: '/projects/ai-masters',
    logo: `${process.env.PUBLIC_URL}/images/career/ut-austin.svg`,
    entries: [
      { role: 'M.S. Artificial Intelligence', dates: 'Aug 2024 – Dec 2025' },
      { role: 'B.S. Electrical and Computer Engineering', dates: 'May 2023' },
    ],
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
          <li key={row.org}>
            <Link to={row.href} className="experience-row">
              <span className="experience-logo">
                <img src={row.logo} alt={row.org} />
              </span>
              <span className="experience-entries">
                {row.entries.map((entry) => (
                  <span key={entry.role} className="experience-entry">
                    <span className="experience-role">{entry.role}</span>
                    <span className="experience-dates">{entry.dates}</span>
                  </span>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
