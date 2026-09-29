import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';
import FlowDiagram from '../components/project/FlowDiagram';

function AgentResearchLoops() {
  return (
    <ProjectDetail
      title="agent research loops"
      date="September 2026"
      abstract="A cron-driven agent that watches a training farm, kills plateaued policies, retunes rewards, and enqueues the next experiment. I used it to beat the QWOP world record and to stabilize a triple pendulum."
    >
      <h2>/ the claim</h2>

      <p>
        You do not have to live on the layer where you micromanage every run. A high-level agent can sit on TensorBoard, decide what failed, and start the next job. I first tried Andrej Karpathy&apos;s auto-research tool, then landed on a{' '}
        <a href="https://cursor.com/docs/grok-bot" target="_blank" rel="noopener noreferrer">grok bot</a>
        {' '}that checked in every 15 minutes.
      </p>

      <FlowDiagram
        caption="The same loop on two plants."
        steps={[
          { title: 'env', detail: 'a gym fast enough to waste runs' },
          { title: 'farm', detail: 'GCP VMs, parallel rollouts' },
          { title: 'bot', detail: 'kill, retune, enqueue' },
          { title: 'human', detail: 'watch curves, change the goal' },
        ]}
      />

      <h2>/ two plants</h2>

      <p>
        On <Link to="/projects/qwop-python">qwop-python</Link> the environment was the work. A chromedriver gym ran at 100–500 it/s. The Python Box2D gym hit about 10,000 it/s, 40,000 in parallel. That is what made a bot-managed hunt possible. Virgin PPO finished runs and went nowhere near the record. Literal imitation of the world-record keypresses faceplanted. A tunable gait metric learned the stride. Transfer still faceplanted on HTML5 physics until an opening fine-tune closed the gap. Final time: 45.167s against 45.530s.
      </p>

      <p>
        On <Link to="/projects/auto-research">cart-pole-autoresearch</Link> the task definition was the work. Early runs had bumpers and a near-upright start. The loop removed the help, added a second link, then a third. PPO stopped being the right controller on the triple pendulum, so the bot&apos;s next experiment became MPPI. The browser demo is that deployment.
      </p>

      <h2>/ what failed</h2>

      <p>
        Reward hacking is the default. A loose cart-pole reward finds a high score that is not the behavior you wanted. Literal QWOP imitation copies the keys and still falls over. Sim-to-real gaps show up at the start of a run, not in the average return. The loop only helps if the env is fast enough to waste, and if you can read a failure in the traces. That is why{' '}
        <Link to="/projects/tracebench">tracebench</Link> and{' '}
        <Link to="/projects/trace2tasks">trace2tasks</Link> exist.
      </p>
    </ProjectDetail>
  );
}

export default AgentResearchLoops;
