import React from 'react';

// Short copy over one figure, like the H-E-B page.
export default function Spread({ kicker, children }) {
  const nodes = React.Children.toArray(children);
  const copy = nodes.filter((node) => node.type === 'p');
  const visual = nodes.filter((node) => node.type !== 'p');
  return (
    <section className="hs-spread">
      {kicker ? <div className="hs-kicker">{kicker}</div> : null}
      {copy.length > 0 ? <div className="hs-spread-copy">{copy}</div> : null}
      {visual.length > 0 ? <figure>{visual}</figure> : null}
    </section>
  );
}
