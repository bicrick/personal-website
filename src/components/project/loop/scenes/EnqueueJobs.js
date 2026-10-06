import Card from './Card';

const JOBS = [
  { n: 1, name: 'run 18', y: 36 },
  { n: 2, name: 'run 19', y: 62 },
  { n: 3, name: 'run 20', y: 88 },
];

export default function EnqueueJobs({ x, y }) {
  return (
    <Card id="enqueue" index="4" title="enqueue" x={x} y={y}>
      {JOBS.map((job) => (
        <g key={job.name} className={`ticket is-${job.n}`} transform={`translate(14 ${job.y})`}>
          <g className="ticket-in">
            <rect className="ticket-card" width="160" height="22" rx="3" />
            <text className="ticket-plus" x="10" y="15">+</text>
            <text className="ticket-name" x="24" y="15">{job.name}</text>
            <text className="ticket-state" x="150" y="15">queued</text>
          </g>
        </g>
      ))}
    </Card>
  );
}
