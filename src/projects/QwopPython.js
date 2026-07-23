import React from 'react';
import ProjectDetail from '../components/ProjectDetail';

function QwopPython() {
  return (
    <ProjectDetail
      title="qwop-python"
      date="February 2026"
      linkHref="https://github.com/bicrick/qwop-python"
      linkLabel="view repo"
      abstract="A highly performant headless Gymnasium environment for QWOP: pure Python Box2D, no browser, no chromedriver. Roughly 20x faster training throughput so RL experiments can actually scale."
      seoTitle="qwop-python - Gymnasium QWOP Environment by bicrick"
      seoDescription="qwop-python by bicrick - Pure Python Box2D Gymnasium environment for QWOP. Headless RL training, 20x faster than chromedriver-based alternatives."
      seoKeywords="bicrick, Patrick Brown, qwop-python, QWOP, Gymnasium, reinforcement learning, Box2D, RL training"
      seoUrl="https://bicrick.com/projects/qwop-python"
      seoImage="https://bicrick.com/images/qwop-python/qwop-python-1200x600.png"
    >
      <img
        src={`${process.env.PUBLIC_URL}/images/qwop-python/qwop-python-header.gif`}
        alt="qwop-python"
        width="1200"
        height="600"
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <p className="project-caption">
        A Gymnasium environment for Bennet Foddy&apos;s QWOP: pure Python Box2D, headless by default
      </p>

      <h2>/ motivations</h2>

      <p>
        <a href="https://www.foddy.net/legacy/Athletics.html" target="_blank" rel="noopener noreferrer">QWOP</a> is Bennet Foddy&apos;s browser game. I was inspired by <a href="https://github.com/smanolloff/qwop-gym" target="_blank" rel="noopener noreferrer">qwop-gym</a>, which wraps the game for RL, but it&apos;s driven by chromedriver. The goal was a 1:1 representation in raw Python so it could run massively parallelized. No browser, no WebGL, no chromedriver. Just Box2D physics in process.
      </p>

      <h2>/ building it</h2>

      <p>
        The original QWOP runs in the browser as minified JavaScript. I extracted the min.js, beautified it, and ended up with a 12k-line mammoth. Used AI to break it into pieces: physics logic, rendering, game loop, input handling. Extracted each part, understood the behavior, then replicated it 1:1 in Python with Box2D. Same runner, same track, same failure modes.
      </p>

      <h2>/ the approach</h2>

      <p>
        Pure Python and Box2D. Training runs headless; play, spectate, and replay use Pygame when you want to see the runner. Same interface as qwop-gym: 60-dim observations, Discrete 9/16 actions, compatible reward model. Drop-in replacement if you&apos;re already using the original. Supports PPO, DQN, QRDQN, RPPO, A2C via stable-baselines3.
      </p>

      <p>
        On rented GPU clusters (Lambda, RunPod, etc.) that means training in a fraction of the time. The chromedriver-based envs cap out around 500 iterations per second sustained. This one hits 10,000+. Roughly 20x. More throughput means more experimentation (hyperparameter sweeps, architecture changes, different reward shapes) without burning through cloud credits.
      </p>

      <h2>/ takeaways</h2>

      <p>
        Agentic AI can turn many browser-based JavaScript games into interactive pure Python gyms. Extract the source, break it apart, replicate the physics. The result is more performant and simpler for extracting observations. No DOM scraping, no chromedriver, just direct state access.
      </p>

      <p>
        <a href="https://github.com/bicrick/qwop-python" target="_blank" rel="noopener noreferrer">check out the repo</a>
      </p>
    </ProjectDetail>
  );
}

export default QwopPython;
