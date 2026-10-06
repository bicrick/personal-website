import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';
import QwopPreviewEmbed from '../components/QwopPreviewEmbed';
import CartPoleEmbed from '../components/CartPoleEmbed';
import LoopRing from '../components/project/loop/LoopRing';
import MazeSearch from '../components/project/maze/MazeSearch';
import ParallelLanes from '../components/project/figures/ParallelLanes';
import ProjectPair from '../components/project/ProjectPair';

function AgentResearchLoops() {
  return (
    <ProjectDetail
      title="agentic research loops"
      date="October 2026"
      backHref="/"
      backLabel="home"
      abstract="We could always run many experiments at once, but a human had to sit in the loop: read the results, decide what to try next, and set it going. Agentic research loops, where an autonomous coding agent does all of that, take the human out of the loop, and they have sped up how fast we can make progress in reinforcement learning."
    >
      <LoopRing />

      <p>
        An agent watches the training runs, reads why one stalled or cheated, changes the setup, and queues the next one, again and again. Mine is a{' '}
        <a href="https://cursor.com/docs/grok-bot" target="_blank" rel="noopener noreferrer">Grok bot</a>
        .
      </p>

      <h2>/ the problem</h2>

      <p>
        Say you want a computer to do something hard, like beat the world record at QWOP, a browser game where you run 100 meters with four keys. You cannot write the answer down. So you let it try, score each attempt, and keep what works. That is called reinforcement learning.
      </p>

      <h2>/ why it gets stuck</h2>

      <p>
        The trap is settling for something the score likes. QWOP learned to scoot along on its knees. The score only says closer to the finish is better, so it was happy, and it is hard to talk it out of the habit. Finding what you actually wanted is a search, and the way out often backs up before it gets better.
      </p>

      <MazeSearch />

      <h2>/ the bottleneck</h2>

      <p>
        Getting unstuck means trying a lot of things: different reward shapes, different settings. By hand, you enqueue a run, wait, read the curves, change something, and enqueue the next. Most of that time is you waiting on yourself.
      </p>

      <ParallelLanes />

      <p>
        A loop does not wait. It enqueues many runs side by side and reads them all when they land. This is not just a bigger grid search, which you could always run if you had the compute. Each next try is founded on what the last ones showed, including hunches that live outside the math: this reward is being gamed, this start is too hard. Same compute, aimed better.
      </p>

      <h2>/ two examples</h2>

      <ProjectPair>
        <QwopPreviewEmbed caption="QWOP, a replay of a trained run." />
        <CartPoleEmbed />
      </ProjectPair>

      <p>
        QWOP finished under the 45.530 record. The triple pendulum balances and recovers when you grab it. The details are in the{' '}
        <Link to="/projects/qwop-python">qwop-python</Link>
        {' '}and{' '}
        <Link to="/projects/auto-research">cart-pole-autoresearch</Link>
        {' '}writeups.
      </p>

      <h2>/ what it lets you do</h2>

      <p>
        I think the edges of science will move faster, because we can try more things in parallel, and each try is founded on the last. A scientist in control of a fleet of agents is much more powerful than one scientist alone. These projects are a microcosm of what&apos;s to come.
      </p>
    </ProjectDetail>
  );
}

export default AgentResearchLoops;
