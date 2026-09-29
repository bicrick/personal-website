import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';
import FlowDiagram from '../components/project/FlowDiagram';

function Trace2Tasks() {
  return (
    <ProjectDetail
      title="trace2tasks"
      date="September 2026"
      linkHref="https://github.com/bicrick/trace2tasks"
      linkLabel="view repo"
      abstract="Mine Gymnasium tasks and reward heuristics from agent traces. Success and failure logs become a dataset card and a tiny env researchers can train on."
    >
      <h2>/ why traces, not gym toys</h2>

      <p>
        <Link to="/projects/qwop-python">qwop-python</Link> is a classic RL environment. The harder problem for agent products is turning real tool traces into tasks and rewards. Trace2tasks takes JSONL from{' '}
        <Link to="/projects/tracebench">tracebench</Link>
        , finds candidate tasks, and attaches reward heuristics: invalid tool call, deferred edit, task complete.
      </p>

      <FlowDiagram
        caption="Traces in. A Gymnasium env and a dataset card out."
        steps={[
          { title: 'ingest', detail: 'read JSONL traces with tool calls and outcomes' },
          { title: 'mine', detail: 'cluster by goal, pick success and failure pairs' },
          { title: 'reward', detail: 'heuristics for invalid tools and completion' },
          { title: 'export', detail: 'Gymnasium env + dataset card' },
        ]}
      />

      <p>
        The env is small on purpose. The claim is the pipeline, not a new Atari. Code is in{' '}
        <a href="https://github.com/bicrick/trace2tasks" target="_blank" rel="noopener noreferrer">bicrick/trace2tasks</a>.
      </p>
    </ProjectDetail>
  );
}

export default Trace2Tasks;
