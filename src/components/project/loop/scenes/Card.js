import { CARD } from '../pose';

export default function Card({ id, index, title, x, y, children }) {
  return (
    <g className={`loop-card is-${id}`} transform={`translate(${x} ${y})`}>
      <rect className="loop-card-frame" width={CARD.w} height={CARD.h} rx="6" />
      <text className="loop-card-index" x="14" y="24">{index}</text>
      <text className="loop-card-title" x="30" y="24">{title}</text>
      <g className="loop-card-body">{children}</g>
    </g>
  );
}
