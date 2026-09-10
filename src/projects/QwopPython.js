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
          {' '}is Bennet Foddy&apos;s browser game, and it is extremely hard. I stink at it, so I decided to beat the world record with ML instead. I built a gym in pure Python so I could train in a massively parallelized fashion, then used an autonomous{' '}
          <a href="https://cursor.com/docs/grok-bot" target="_blank" rel="noopener noreferrer">grok bot</a>
          {' '}research loop to hunt the recipe and transferred the policy to the real browser game. Final time: 45.167 seconds, under kurodo1916&apos;s human 45.530.
        </>
      }
      seoTitle="qwop-python - beat the HTML5 QWOP world record with RL - bicrick"
      seoDescription="qwop-python by bicrick: beat the human HTML5 QWOP record at 45.167 seconds with a parallel Python Box2D gym and flex-gait PPO."
      seoKeywords="bicrick, Patrick Brown, qwop-python, QWOP, world record, Gymnasium, reinforcement learning, Box2D, PPO, HTML5, grok bot"
      seoUrl="https://bicrick.com/projects/qwop-python"
      seoImage="https://bicrick.com/images/qwop-python/qwop-python-1200x600.png"
    >
      <QwopPreviewEmbed />

      <h2>/ the goal</h2>

      <p>
        Beat the official clock on kurodo1916&apos;s 45.530s.
      </p>

      <p>
        QWOP gyms already existed. I started from{' '}
        <a href="https://github.com/smanolloff/qwop-gym" target="_blank" rel="noopener noreferrer">Simeon Manolov&apos;s qwop-gym</a>
        {' '}(smanolloff), which wraps the real browser game for RL. The interface was solid, but it drove Chrome through chromedriver. That is slow, hard to parallelize, and a poor use of compute when you need to sweep recipes at scale. A few hundred iterations per second sustained was not going to cut it for a WR hunt.
      </p>

      <h2>/ the gym</h2>

      <p>
        So I forked the idea into <code>qwop-python</code>: the same gym shape (body-state obs, Q/W/O/P actions), reimplemented in pure Python + Box2D, headless, no browser. Many envs in parallel on one machine, ~10k+ it/s. That is what made massively parallel training actually possible.
      </p>

      <p>
        Everything trained in Python. Because the gym was a close 1:1 of the original JS physics, the learned policy transferred to the official browser game without a separate stack. Train in Python, prove it on Foddy&apos;s page.
      </p>

      <h2>/ the research loop</h2>

      <p>
        With the gym up, I ran about a day and a half of training and hunting on GCP (spot VMs, GCS, TensorBoard). I did not want to live in the loop of constantly checking runs, editing configs, and hand-tuning hyperparameters. I wanted an agentic research loop that could own that work. That is how I landed on{' '}
        <a href="https://cursor.com/docs/grok-bot" target="_blank" rel="noopener noreferrer">grok bot</a>
        .
      </p>

      <p>
        I put it to use with a routine every 15 minutes: check the farm, kill plateaus, swap hyperparameters, enqueue the next experiment, keep spectate pointed at good checkpoints. It directed almost all of the training. I checked in intermittently, mostly watching TensorBoard, while it ran the loop.
      </p>

      <h2>/ the gait</h2>

      <p>
        The gait itself came from studying Kurodo&apos;s WR video. Literal key replay faceplanted, but a flexible QO→WP cycle stuck. Flex-gait + early-survival PPO got us serious finishes; grok bot kept continuing the good line instead of reseeding plateaus.
      </p>

      <h2>/ the record</h2>

      <p>
        Transfer was another issue to conquer. Because we built the game in Python, there were slight mathematical differences in certain mechanics versus the browser. Parity was very close, but those gaps still showed up, mostly at the start. A lot of runs would faceplant right away. So I did a separate fine-tune focused on the opening. After that, a lot more runs made it past the first 4, 5, 10 meters, times started dropping, and after enough tries on Foddy&apos;s page we hit a world-record 45.167s, under 45.530 by about a third of a second.
      </p>

      <p>
        Below I&apos;ve embedded a YouTube video of the actual world record run.
      </p>

      <ProjectYoutubeEmbed
        videoId="ma_lPVRZyxw"
        title="QWOP 45.167 second world record"
        caption="Official QWOP 45.167s record time"
      />

      <p>
        I also have a <Link to="/demos/qwop">live demo</Link> where you can mess around with a recording from the Python environment (same run as the preview at the top).
      </p>

      <h2>/ how it learned</h2>

      <p>
        Stable-Baselines3 PPO with the usual knobs (clipped updates, GAE). Body-state observations, discrete Q/W/O/P. Reward mostly for covering ground and not wasting time, plus light gait shaping. Details live in the{' '}
        <a href="https://github.com/bicrick/qwop-python/tree/main/docs/wr-hunt" target="_blank" rel="noopener noreferrer">repo docs</a>.
      </p>

      <h2>/ conclusions</h2>

      <p>
        The gym mattered. The recipe mattered. What changed the project was grok bot. I gave it a hard goal (beat HTML5 QWOP) and it ran the farm: 15-minute check-ins, plateaus, hyperparams, next jobs. I stopped living on the layer where I micromanaged every run. A high-level AI was directing policy RL while I peeked at TensorBoard when I felt like it.
      </p>

      <p>
        If that&apos;s the world we&apos;re heading into, autonomous research loops like this aren&apos;t a gimmick. They&apos;re how you hunt a record. Fast gym, honest browser clock, and an AI that never gets bored of the 15-minute loop. grok bot was that layer here, and it was wild to watch.
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
