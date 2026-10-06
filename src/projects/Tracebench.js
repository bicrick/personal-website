import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';
import ProjectFigure from '../components/project/ProjectFigure';
import ResultTable from '../components/project/ResultTable';
import FlowDiagram from '../components/project/FlowDiagram';

function Tracebench() {
  return (
    <ProjectDetail
      title="tracebench"
      date="September 2026"
      linkHref="https://github.com/bicrick/tracebench"
      linkLabel="view repo"
      abstract="A small offline eval harness for tool-using agents, and a companion that mines RL tasks from the traces it records. Toy scale on purpose: the point is the loop from agent behavior to a number to a training task."
    >
      <ProjectFigure
        src={`${process.env.PUBLIC_URL}/images/tracebench/tracebench-1600x900.png`}
        alt="tracebench CLI output next to a trace timeline"
        caption="Real output from the sample run: 4 traces, 9 tool calls."
      />

      <h2>/ what it is for</h2>

      <p>
        Shipping an agent means answering two questions. How often does it fail, and why? Tracebench answers both without a live model call: the agent writes JSONL traces, and everything after that is a replay. It scores each trace, then clusters the failures by tool and error class so you can see what to fix first.
      </p>

      <FlowDiagram
        caption="Trace in, score out, failures grouped."
        steps={[
          { title: 'run', detail: 'a scripted tool-using agent writes JSONL traces' },
          { title: 'replay', detail: 'offline runner feeds the same tool results back' },
          { title: 'score', detail: 'tool-error rate, task success, keep rate' },
          { title: 'cluster', detail: 'group failures by tool and error class' },
        ]}
      />

      <ResultTable
        caption="Default graders. Keep rate is the share of traces you would ship."
        columns={['metric', 'what it measures']}
        rows={[
          ['tool_error_rate', 'invalid or failed tool calls / all tool calls'],
          ['task_success', 'final state matches the task card'],
          ['keep_rate', 'traces that pass and stay under an error budget'],
        ]}
      />

      <h2>/ trace2tasks</h2>

      <p>
        The second half is{' '}
        <a href="https://github.com/bicrick/trace2tasks" target="_blank" rel="noopener noreferrer">trace2tasks</a>.
        It reads the same JSONL, picks success and failure pairs for a goal, attaches reward heuristics (invalid tool call, deferred edit, task complete), and exports a Gymnasium env plus a dataset card. That is the shape of the work behind agent RL environments: real behavior in, a task and a reward out.
      </p>

      <h2>/ honest scope</h2>

      <p>
        The sample agent is scripted and the trace set is four rows. I built it to get the eval and RL-data loop right end to end, not to claim a benchmark. The bigger, real version of that loop lives in{' '}
        <Link to="/writing/agent-research-loops">agentic research loops</Link>.
      </p>
    </ProjectDetail>
  );
}

export default Tracebench;
