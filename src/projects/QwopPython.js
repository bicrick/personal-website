import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';

function QwopPython() {
  return (
    <ProjectDetail
      title="qwop-python"
      date="September 2026"
      linkHref="https://github.com/bicrick/qwop-python"
      linkLabel="view repo"
      secondaryLinkHref="/demos/qwop"
      secondaryLinkLabel="watch demo"
      secondaryLinkInternal
      abstract="A pure Python Box2D Gymnasium for QWOP — then a GCP farm, flex-gait PPO, and a 45.167 HUD finish on the official browser game that beat the human HTML5 world record (45.530)."
      seoTitle="qwop-python - HTML5 QWOP world record via RL - bicrick"
      seoDescription="qwop-python by bicrick — pure Python Box2D Gym for QWOP, then a WR hunt that landed 45.167 HUD on the official browser, beating the human record of 45.530."
      seoKeywords="bicrick, Patrick Brown, qwop-python, QWOP, world record, Gymnasium, reinforcement learning, Box2D, PPO, HTML5"
      seoUrl="https://bicrick.com/projects/qwop-python"
      seoImage="https://bicrick.com/images/qwop-python/qwop-python-1200x600.png"
    >
      <p style={{ marginBottom: '1.25rem' }}>
        <Link to="/demos/qwop" className="qwop-demo-cta">
          Watch agent run
        </Link>
      </p>

      <img
        src={`${process.env.PUBLIC_URL}/images/qwop-python/qwop-python-header.gif`}
        alt="qwop-python"
        width="1200"
        height="600"
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <p className="project-caption">
        A Gymnasium environment for Bennet Foddy&apos;s QWOP: pure Python Box2D, headless by default — then transfer to the real browser for the record
      </p>

      <h2>/ live demo</h2>

      <p>
        <Link to="/demos/qwop">Watch a recorded agent run</Link> in the browser — no install.
        The demo replays a ~43.7s Python early1 finish (pose trajectory from <code>model_118M</code>);
        the official browser WR keep was 45.167 HUD under the human 45.530.
      </p>

      <h2>/ part 1 — creating qwop-python</h2>

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

      <h2>/ part 2 — breaking the world record</h2>

      <p>
        Building the Gym was the prerequisite. The actual goal was the official HTML5 clock: beat{' '}
        <a href="https://www.speedrun.com/qwop/runs/y9vk0k2m" target="_blank" rel="noopener noreferrer">kurodo1916&apos;s human WR of 45.530 HUD</a>
        {' '}on Bennet Foddy&apos;s real page. We landed 45.167 HUD.
      </p>

      <h2>/ why we needed a farm</h2>

      <p>
        Parallel Box2D bought sample volume, but a laptop is not a fleet. We stood up a GCP project — spot / preemptible trainers, a shared GCS bucket as the control plane, TensorBoard synced from the bucket so we could compare siblings without SSHing into every VM. On top of that, an autonomous Grok Bot loop deployed configs, killed plateaus, and kept the spectate hunt pointed at promising checkpoints. Humans only interrupted for blockers, approvals, and milestones.
      </p>

      <h2>/ learning from Kurodo</h2>

      <p>
        Throughput alone does not invent a gait. We pulled structure from Kurodo&apos;s WR video: per-frame Q/W/O/P presses from the on-screen key UI, LiveSplit segment OCR, open-loop <code>.rec</code> replay attempts. Literal timestamps faceplanted in sim — the timings were not portable. What transferred was the phase structure: a flexible QO→WP cycle (soft holds, not a locked timeline). That flex-gait imitation was the first serious sub-50 Python finish line.
      </p>

      <h2>/ train in Python, prove it in the browser</h2>

      <p>
        Python finishes looked WR-class early — low–mid 40s on the sim clock, best landed finish around 43.592 <code>user/time</code> on the early1 line. Transfer to the official HTML/JS page exposed the remaining honesty problems. Mid-race pace already matched or beat the human splits; the hole was the start. Spawn settle parity (plant at rest before the clock, matching the browser reset) closed the dive / free-fall artifact that had been padding Python starts. After settle, the gap was almost entirely first-10m acceleration — not a uniform Box2D slowdown.
      </p>

      <h2>/ the winning recipe</h2>

      <p>
        The keep that scored 45.167 HUD on official physics:
      </p>

      <ul>
        <li>early1 flex-gait + EarlySurvival PPO (<code>model_118M</code>)</li>
        <li>spectate on the real page with settle spawn and official timestep</li>
        <li>stochastic hunt — many parallel browser episodes, keep only sub-WR finishes</li>
        <li>segment splits: 7.60 / 17.00 / 12.00 / 8.33 (0–10 / 10–50 / 50–80 / 80–100)</li>
      </ul>

      <p>
        That is under the human 45.530. Methodology, strategies, and the farm notes live in the repo under{' '}
        <a href="https://github.com/bicrick/qwop-python/tree/main/docs/wr-hunt" target="_blank" rel="noopener noreferrer">docs/wr-hunt</a>.
      </p>

      <p>
        <a href="https://github.com/bicrick/qwop-python" target="_blank" rel="noopener noreferrer">check out the repo</a>
        {' · '}
        <Link to="/demos/qwop">watch the demo</Link>
        {' · '}
        human WR 45.530 beaten at 45.167 HUD
      </p>
    </ProjectDetail>
  );
}

export default QwopPython;
