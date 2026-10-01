import React from 'react';
import { Link } from 'react-router-dom';
import './CareerRecord.css';

function CareerRow({ item }) {
  const body = (
    <>
      <span className="career-logo">
        <img src={item.logo} alt={item.org} />
      </span>
      <span className="career-copy">
        <span className="career-role">{item.role}</span>
        <span className="career-dates">{item.dates}</span>
        {item.note ? <span className="career-note">{item.note}</span> : null}
      </span>
    </>
  );

  if (!item.href) {
    return <div className="career-record-row is-static">{body}</div>;
  }

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="career-record-row"
      >
        {body}
      </a>
    );
  }

  return (
    <Link to={item.href} className="career-record-row">
      {body}
    </Link>
  );
}

export default function CareerTimeline({ items }) {
  return (
    <ul className="career-record">
      {items.map((item) => (
        <li key={`${item.role}-${item.org}`}>
          <CareerRow item={item} />
        </li>
      ))}
    </ul>
  );
}
