import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';
import ProjectYoutubeEmbed from '../components/ProjectYoutubeEmbed';
import QwopPreviewEmbed from '../components/QwopPreviewEmbed';

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
      abstract={
        <>
          <a href="https://www.foddy.net/legacy/Athletics.html" target="_blank" rel="noopener noreferrer">QWOP</a>
          {' '}is Bennet Foddy&apos;s browser game, and it is extremely hard. I wanted the world record, so I decided to try and beat it with machine learning. I built a highly performant gym in pure Python so I could train in parallel, then used an autonomous{' '}
          <a href="https://cursor.com/docs/grok-bot" target="_blank" rel="noopener noreferrer">grok bot</a>
          {' '}research loop to shape rewards and hunt hyperparameters without a human checking in. After transferring the Python-learned policy to the real browser game I achieved a final time of 45.167 seconds, ~0.4 seconds under the world record of{' '}
          <a href="https://www.speedrun.com/qwop/runs/y9vk0k2m" target="_blank" rel="noopener noreferrer">45.530</a>
          .
        </>
      }
    >
      <QwopPreviewEmbed />

      <h2>/ the goal</h2>

      <p>
        <a href="https://www.speedrun.com/qwop/runs/y9vk0k2m" target="_blank" rel="noopener noreferrer">45.530</a>
        {' '}is the record on speedrun.com, held by{' '}
        <a href="https://www.speedrun.com/users/kurodo1916" target="_blank" rel="noopener noreferrer">kurodo1916</a>
        . This is the record amongst both humans and RL agents.
      </p>

      <p>
        QWOP has been played by RL agents for the better part of 5 years. In that span of time, agents have taken first place on the leaderboard, and kurodo1916 has taken it back.
      </p>

      <h2>/ the gym</h2>

      <p>
        Given the game&apos;s simplistic controls, this game is a perfect candidate for reinforcement learning. Many QWOP gyms already exist today. I started with{' '}
        <a href="https://github.com/smanolloff/qwop-gym" target="_blank" rel="noopener noreferrer">Simeon Manolov&apos;s qwop-gym</a>
        , which wraps the real browser game for RL. The interface was solid, but the core game loop was driven through a browser-based Chrome driver. Running the env full bore on my M2 MacBook Pro, I could get around 100–500 it/s. The base game runs at 30fps, so this is only 15× faster than realtime for training (for one environment!). I would need a much more performant gym.
      </p>

      <p>
        So I forked the existing{' '}
        <a href="https://github.com/smanolloff/qwop-gym" target="_blank" rel="noopener noreferrer">smanolloff gym</a>
        {' '}into <code>qwop-python</code>: the same gym shape (body-state observations, Q/W/O/P actions) but reimplemented the core game in pure Python + Box2D. The game can run headless with no Chrome driver. Because the original game is a minified JS blob, I used coding agents to pull <code>QWOP.min.js</code> apart (physics, loop, input, rendering) and rebuild those pieces in Python. This is something that would not have been possible without the use of AI agents. The min.js sat at about 550KB — over 13,000 lines once you unpack it — with no variable names or anything.
      </p>

      <p>
        After constructing my new gym, a single Python env hit about 10,000 it/s; four in parallel about 40,000 it/s. Call it 100× on one process, and a few hundred times faster once you scale. This is what made massive parallel training actually possible.
      </p>

      <h2>/ the research loop</h2>

      <p>
        I stood up a few VMs on GCP to run my training. Because I did not want to live in the loop of hyperparameter grid-search hell, I wanted to try an agent research loop that could handle that part of the work for me. Originally trying{' '}
        <a href="https://github.com/karpathy/autoresearch" target="_blank" rel="noopener noreferrer">Andrej Karpathy&apos;s auto-research tool</a>
        , I found that there were better tools at my disposal. That is how I landed on{' '}
        <a href="https://cursor.com/docs/grok-bot" target="_blank" rel="noopener noreferrer">grok bot</a>
        .
      </p>

      <p>
        I stood up a routine that would check in on the farm every 15 minutes. It would kill policies that have clearly plateaued, swap hyperparameters, and enqueue the next experiment. While it directed almost all of the training, I checked in intermittently, mostly watching TensorBoard while it ran the loop.
      </p>

      <h2>/ imitation learning</h2>

      <p>
        Virgin PPO policies quickly converge on reliable, slow strategies that complete runs, but are nowhere near the world record. In order to achieve the world record, we would have to imitate the bounding strides found in the world record. I spun up a tool to extract in-game key logging based on the world record video from{' '}
        <a href="https://www.youtube.com/watch?v=4g9x7QJYx0M" target="_blank" rel="noopener noreferrer">kurodo1916</a>
        . Literally trying to imitate the keypresses face planted, but a more flexible, hyperparameter-tunable metric for imitation eventually allowed the agent to really learn the shape of the gait-cycle, as opposed to imitating it directly.
      </p>

      <p>
        I used Stable-Baselines3 PPO with the usual knobs (clipped updates, GAE). Body-state observations, discrete Q/W/O/P. Reward mostly for covering ground and not wasting time, plus light gait shaping. Details live in the{' '}
        <a href="https://github.com/bicrick/qwop-python/tree/main/docs/wr-hunt" target="_blank" rel="noopener noreferrer">repo docs</a>
        . Honestly grok bot handled most of the reward shaping.
      </p>

      <p>
        After learning to imitate the world record, and putting down about 36 hours of training in GCP, I was consistently getting runs well below the world record within my simulator.
      </p>

      <h2>/ the transfer</h2>

      <p>
        Because we built the game in Python, there were slight mathematical differences in our game versus the browser. Parity was very close, but those gaps still showed up, mostly at the start. When I moved my Python-trained policy to the real game, runs would faceplant right away. So I did a separate fine-tune focused on the opening. After that, more runs made it past the start, and times started dropping. After enough attempts I finally achieved a world-record 45.167s, under 45.530 by about a third of a second.
      </p>

      <p>
        You can watch the world record run below.
      </p>

      <ProjectYoutubeEmbed
        videoId="ma_lPVRZyxw"
        title="QWOP 45.167 second world record"
        caption="Official QWOP 45.167s record time"
      />

      <p>
        I also have a <Link to="/demos/qwop">live demo</Link> where you can mess around with a recording from the Python gym.
      </p>

      <h2>/ conclusions</h2>

      <p>
        What surprised me most about this project was the way the world record was achieved. We now live in a world where a cron-driven agent can periodically check in on training, tune hyperparameters, and enqueue the next job. It&apos;s like having another abstract layer on top of your training. I stopped living on the layer where I had to micromanage every run. A high-level AI was directing the policy while I watched TensorBoard for updates.
      </p>

      <p>
        Research loops like these are not a gimmick. This is how you build RSI.
      </p>

      <p>
        <a href="https://github.com/bicrick/qwop-python" target="_blank" rel="noopener noreferrer">repo</a>
        {' · '}
        <Link to="/demos/qwop">demo</Link>
        {' · '}
        45.530s beaten at 45.167s
      </p>
    </ProjectDetail>
  );
}

export default QwopPython;
