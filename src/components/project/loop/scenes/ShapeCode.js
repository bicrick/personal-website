import Card from './Card';

const LINES = [
  { text: 'reward = gait', y: 56 },
  { text: 'speed *= .4', y: 78 },
  { text: 'wheels = off', y: 100 },
];

export default function ShapeCode({ x, y }) {
  return (
    <Card id="shape" index="3" title="shape" x={x} y={y}>
      {LINES.map((line, i) => (
        <text key={line.text} className={`code-line is-${i + 1}`} x="14" y={line.y}>
          {line.text}
        </text>
      ))}
      <rect className="code-caret" width="1.5" height="14" />
    </Card>
  );
}
