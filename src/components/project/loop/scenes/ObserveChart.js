import Card from './Card';

export default function ObserveChart({ x, y }) {
  return (
    <Card id="observe" index="2" title="observe" x={x} y={y}>
      <text className="scene-kicker" x="174" y="24" textAnchor="end">loss</text>
      <line className="chart-grid" x1="18" y1="58" x2="174" y2="58" />
      <line className="chart-grid" x1="18" y1="80" x2="174" y2="80" />
      <line className="chart-axis" x1="18" y1="42" x2="18" y2="102" />
      <line className="chart-axis" x1="18" y1="102" x2="174" y2="102" />
      <path
        className="loss-curve"
        pathLength="100"
        d="M20 46 L46 52 L76 70 L108 87 L136 96 L158 100 L174 102"
      />
    </Card>
  );
}
