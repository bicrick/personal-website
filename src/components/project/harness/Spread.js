import React from 'react';

// Short copy over a figure, like the H-E-B page. Children render in
// order: each run of paragraphs becomes a copy block, anything else a
// figure, so a section can go copy, figure, copy, figure.
export default function Spread({ kicker, children }) {
  const blocks = [];
  React.Children.toArray(children).forEach((node) => {
    const isCopy = node.type === 'p' || node.type === 'ul';
    const lastBlock = blocks[blocks.length - 1];
    if (isCopy && lastBlock && lastBlock.copy) lastBlock.nodes.push(node);
    else blocks.push({ copy: isCopy, nodes: [node] });
  });
  return (
    <section className="hs-spread">
      {kicker ? <div className="hs-kicker">{kicker}</div> : null}
      {blocks.map((block, i) => (block.copy ? (
        <div key={i} className="hs-spread-copy">{block.nodes}</div>
      ) : (
        <figure key={i}>{block.nodes}</figure>
      )))}
    </section>
  );
}
