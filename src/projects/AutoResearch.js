import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';
import CartPoleEmbed from '../components/CartPoleEmbed';

function AutoResearch() {
  return (
    <ProjectDetail
      title="experimenting with auto research"
      date="September 2026"
      linkHref="https://cart-pole-autoresearch.vercel.app/#triple"
      linkLabel="open demo"
      abstract="Training is shifting off hand-tuned hyperparameters. An agentic loop watches a run and changes the next experiment."
    >
      <CartPoleEmbed />

      <h2>/ ppo</h2>

      <p>
        This started the same way as <Link to="/projects/qwop-python">qwop-python</Link>.
        I pointed an autonomous{' '}
        <a href="https://cursor.com/docs/grok-bot" target="_blank" rel="noopener noreferrer">grok bot</a>
        {' '}at cart-pole PPO. On a timer it checked the farm, killed policies that had plateaued, and enqueued the next run. I watched TensorBoard. The bot owned the knobs.
      </p>

      <h2>/ the double pendulum</h2>

      <p>
        The plant got harder. PPO still learned the double pendulum, from a hang to upright, but the interesting part was the loop. Reward weights and learning rates moved because the agent saw the output, not because I sat in a grid search.
      </p>

      <h2>/ mppi</h2>

      <p>
        The triple pendulum is where a learned policy stopped being the right tool. Sampling thousands of short force plans at runtime, then keeping the cheap ones, swung it up more reliably than distilling that teacher into a small network. That controller now runs in the browser: WebGPU on a laptop, workers on a phone. The frame above is that deployment.
      </p>
    </ProjectDetail>
  );
}

export default AutoResearch;
