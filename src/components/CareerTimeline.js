import React from 'react';
import { Link } from 'react-router-dom';
import './CareerRecord.css';

function CareerRow({ item }) {
  const mediaClass = item.fit === 'contain'
    ? 'career-record-media is-logo'
    : 'career-record-media';

  const body = (
    <>
      <div className={mediaClass} aria-hidden="true">
        <img src={item.image} alt="" />
      </div>
      <div className="career-record-copy">
        <div className="career-record-head">
          <h3 className="career-record-title">{item.title}</h3>
          {item.date ? <p className="career-record-meta">{item.date}</p> : null}
        </div>
        {item.description ? (
          <p className="career-record-desc">{item.description}</p>
        ) : null}
        {item.bullets ? (
          <ul className="career-record-bullets">
            {item.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        ) : null}
      </div>
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
    <div className="career-record" role="list">
      {items.map((item) => (
        <div key={item.title} role="listitem">
          <CareerRow item={item} />
        </div>
      ))}
    </div>
  );
}
