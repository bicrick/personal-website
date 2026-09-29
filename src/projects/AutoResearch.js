import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';
import CartPoleEmbed from '../components/CartPoleEmbed';
import ResultTable from '../components/project/ResultTable';
import FlowDiagram from '../components/project/FlowDiagram';

function AutoResearch() {
  return (
    <ProjectDetail
      title="cart-pole-autoresearch"
      date="September 2026"
      linkHref="https://cart-pole-autoresearch.vercel.app/#triple"
      linkLabel="open demo"
      secondaryLinkHref="https://github.com/bicrick/cart-pole-autoresearch"
      secondaryLinkLabel="repo"
      abstract={
        <>
          An auto research loop is an AI agent that manages a reinforcement learning environment. I used one here on cart-pole, from a pole near upright to the triple pendulum in the frame above. I started experimenting with these loops on{' '}
          <Link to="/projects/qwop-python">qwop-python</Link>.
        </>
      }
    >
      <CartPoleEmbed />

      <h2>/ ppo</h2>

      <p>
        The environment here is cart-pole. A cart sits on a straight track with a pole attached by a hinge. You apply a force to the cart, and the goal is to keep the pole upright and keep the cart on the track. I trained that with PPO, and the loop managed the run. I started experimenting with auto research loops on{' '}
        <Link to="/projects/qwop-python">qwop-python</Link>.
      </p>

      <p>
        The agent was an autonomous{' '}
        <a href="https://cursor.com/docs/grok-bot" target="_blank" rel="noopener noreferrer">grok bot</a>
        {' '}pointed at the training farm. Every 15 minutes it looked at the runs, killed policies that had plateaued, changed the hyperparameters, and enqueued the next experiment. I checked TensorBoard once in a while.
      </p>

      <h2>/ why cart-pole</h2>

      <p>
        I picked cart-pole because most of the work is in how you define the task. The pole has to stay up, and the cart has to stay centered, and a loose reward gets hacked. The policy finds some behavior that scores well and is not the behavior you wanted. That is the kind of thing I wanted the loop to adjust, since it can rewrite the next experiment after it has seen how a run actually went.
      </p>

      <p>
        The other reason is that you can make the task easy and then take the help away. A clean swing-up from a dead hang is a big jump if the policy has never held a balance, the same way a backflip is a big jump if someone has never ridden a bike. The early runs had training wheels. I put bumpers on the track so the cart could not fly off, and I kept the rail short. The pole started already near upright, only a little off equilibrium, so the policy only had to hold that pose. Once it could, the loop removed the simplifications. The track got longer, the initial states moved farther from upright, and a second pendulum was added. The model needed the basic skill before the task asked for the harder one.
      </p>

      <h2>/ the double pendulum</h2>

      <p>
        With two links, PPO still learned the swing from a hanging start to upright. Across those runs, the bot read the previous result and chose the next reward weights and learning rates. I mostly watched the curves.
      </p>

      <h2>/ the triple pendulum</h2>

      <p>
        As soon as the system became a triple pendulum, I stopped training a PPO policy and switched the controller to MPPI. PPO learns a network from the trajectories it collects, then acts with that network. MPPI plans while the pendulum is already moving. At each step it samples thousands of short futures, simulates them, keeps the cheapest ones, and interpolates a force from those predictions. That is why you can grab the cart or a joint in the demo and it tries to recover.
      </p>

      <p>
        The specific controller matters less to me than the loop around it. The same grok bot was still checking in every 15 minutes and changing the next experiment, and that is how the triple pendulum got stable enough to run in the browser. On a laptop it uses WebGPU. On a phone it falls back to workers. The frame above is that deployment, and you can mess with it.         The code is in{' '}
        <a href="https://github.com/bicrick/cart-pole-autoresearch" target="_blank" rel="noopener noreferrer">cart-pole-autoresearch</a>.
      </p>

      <h2>/ results</h2>

      <ResultTable
        caption="Browser MPPI profiles gated in Python. Lite is the phone path."
        columns={['profile', 'samples', 'upright in 12.5s', '4096-sample replan']}
        rows={[
          ['full (WebGPU)', '4,096 / replan 4', '100%', '~3 ms on M2 Pro'],
          ['full (workers)', '4,096 / replan 4', '100%', '~15–23 ms on 10 workers'],
          ['lite', '2,048 / replan 8', '95%', 'about 4× less compute'],
        ]}
      />

      <FlowDiagram
        caption="Same grok-bot loop as qwop-python, pointed at a harder plant."
        steps={[
          { title: 'PPO hold', detail: 'pole starts near upright, bumpers on the track' },
          { title: 'remove help', detail: 'longer track, farther initial states' },
          { title: 'double', detail: 'bot retunes reward weights and learning rates' },
          { title: 'triple / MPPI', detail: 'plan online, recover from a grab' },
        ]}
      />

      <p>
        Failure mode on PPO: a loose reward gets hacked. The policy finds a high score that is not the behavior you wanted. That is why the loop had to rewrite the next experiment after it had seen the run. The longer note is{' '}
        <Link to="/projects/agent-research-loops">agent research loops</Link>.
      </p>
    </ProjectDetail>
  );
}

export default AutoResearch;
