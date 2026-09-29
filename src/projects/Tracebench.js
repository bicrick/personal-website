import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';
import ResultTable from '../components/project/ResultTable';
import FlowDiagram from '../components/project/FlowDiagram';

function Tracebench() {
  return (
    <ProjectDetail
      title="tracebench"
      date="September 2026"
      linkHref="https://github.com/bicrick/tracebench"
      linkLabel="view repo"
      abstract="An offline eval harness for tool-using agents. Dump JSONL traces, replay them, and score tool-error rate, task success, and keep rate. Built to turn messy agent behavior into a measurable loop."
    >
      <h2>/ the gap</h2>

      <p>
        I can run agents. I could not measure them. Production evals need traces you can replay, graders that do not depend on a live model call, and a place to cluster failures. Tracebench is that loop at toy scale.
      </p>

      <FlowDiagram
        caption="Instrument, dump, replay, score."
        steps={[
          { title: 'run', detail: 'a scripted tool-using agent writes JSONL traces' },
          { title: 'replay', detail: 'offline runner feeds the same tool results back' },
          { title: 'score', detail: 'tool-error rate, task success, keep rate' },
          { title: 'cluster', detail: 'group failures by tool and error class' },
        ]}
      />

      <h2>/ metrics</h2>

      <ResultTable
        caption="Default graders. Keep rate is the share of traces you would ship."
        columns={['metric', 'what it measures']}
        rows={[
          ['tool_error_rate', 'invalid or failed tool calls / all tool calls'],
          ['task_success', 'final state matches the task card'],
          ['keep_rate', 'traces that pass success and stay under an error budget'],
        ]}
      />

      <p>
        Pair it with{' '}
        <Link to="/projects/trace2tasks">trace2tasks</Link>
        {' '}when you want those traces turned into RL tasks. Code is in{' '}
        <a href="https://github.com/bicrick/tracebench" target="_blank" rel="noopener noreferrer">bicrick/tracebench</a>.
      </p>
    </ProjectDetail>
  );
}

export default Tracebench;
