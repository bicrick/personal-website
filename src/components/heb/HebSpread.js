import React from 'react';

function HebSpread({ year, children }) {
  const nodes = React.Children.toArray(children);
  const copy = nodes.filter((node) => node.type === 'p');
  const visual = nodes.filter((node) => node.type !== 'p');

  return (
    <section className="heb-spread">
      {year ? <div className="heb-spread-year">{year}</div> : null}
      {copy.length > 0 ? <div className="heb-spread-copy">{copy}</div> : null}
      {visual.length > 0 ? <figure>{visual}</figure> : null}
    </section>
  );
}

export default HebSpread;
