import Card from './Card';

const EXECS = [
  { n: 1, name: 'exec 12', x: 14, y: 40 },
  { n: 2, name: 'exec 13', x: 98, y: 40 },
  { n: 3, name: 'exec 14', x: 14, y: 76 },
  { n: 4, name: 'exec 15', x: 98, y: 76 },
];

export default function FarmRuns({ x, y }) {
  return (
    <Card id="farm" index="1" title="farm" x={x} y={y}>
      {EXECS.map((exec) => (
        <g key={exec.name} className={`exec is-${exec.n}`} transform={`translate(${exec.x} ${exec.y})`}>
          <rect className="exec-tile" width="76" height="30" rx="3" />
          <circle className="exec-dot" cx="13" cy="15" r="3.5" />
          <text className="exec-name" x="24" y="19">{exec.name}</text>
        </g>
      ))}
    </Card>
  );
}
