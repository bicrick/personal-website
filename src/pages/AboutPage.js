import React from 'react';
import { Link } from 'react-router-dom';
import TypewriterHeading from '../components/TypewriterHeading';
import CursorActivityHeatmap from '../components/CursorActivityHeatmap';
import './AboutPage.css';

const ABOUT = process.env.PUBLIC_URL + '/about';

function AboutFigure({ src, webp, alt, caption, contain }) {
  return (
    <figure className="about-figure">
      <picture>
        {webp ? <source srcSet={webp} type="image/webp" /> : null}
        <img
          src={src}
          alt={alt}
          className={contain ? 'is-contain' : undefined}
          loading="lazy"
          decoding="async"
        />
      </picture>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export default function AboutPage() {
  return (
    <section
      id="about"
      className="page-section about-page"
      aria-label="about"
    >
      <article className="about-article">
        <header className="about-header">
          <TypewriterHeading as="h1" className="about-heading">
            about
          </TypewriterHeading>
        </header>

        <p>
          My differentiating factor is my appetite. I want to learn, and I have the tenacity to do anything I put my mind to.
        </p>
        <p>
          That is the through line. School, sports, work, side projects. I like being outside and in the sun. I play a lot of golf.
          I also love video games, mostly the puzzle and automation kind: Factorio, Minecraft. When I care about something, I stay with it.
        </p>

        <h2>golf</h2>
        <p>
          I taught myself golf from YouTube during COVID. No lessons. Just reps. I kept going until I won the club championship at{' '}
          <a href="https://www.austintexas.gov/golfatx/hancock-course" target="_blank" rel="noopener noreferrer">
            Hancock golf course
          </a>{' '}
          in 2025, then again in 2026. I am a +2.4 handicap now. I took a shot at a US Amateur qualifier and came up short. That is part of it too.
          You put in the work, you take the test, and sometimes you lose. Then you go again.
        </p>
        <AboutFigure
          src={`${ABOUT}/golf-swing.gif`}
          alt="Addressing a ball on the range"
          caption="still working on it"
        />

        <h2>track</h2>
        <p>
          In college I ran with Odyssey Track Club five days a week. The 400m. I never ran high school track. My goal was to break 52 seconds.
          I ran 49.13.
        </p>
        <AboutFigure
          src={`${ABOUT}/img-4643.gif`}
          alt="Running the 400m with Odyssey Track Club"
          caption="odyssey track club"
        />

        <h2>paloma</h2>
        <p>
          I have started a few businesses. One of them still runs:{' '}
          <a href="https://palomapremiumwear.com" target="_blank" rel="noopener noreferrer">
            Paloma Premium Wear
          </a>
          . Hats. I designed the logo. I handed the business to younger Phi Gamma Delta members at Texas, and it gets passed down generationally.
        </p>
        <AboutFigure
          src={`${ABOUT}/paloma-logo.png`}
          webp={`${ABOUT}/paloma-logo.webp`}
          alt="Paloma Premium Wear logo"
          caption="the logo I designed"
          contain
        />
        <AboutFigure
          src={`${ABOUT}/paloma-hat.jpg`}
          webp={`${ABOUT}/paloma-hat.webp`}
          alt="Paloma Premium Wear hat"
          caption="still for sale"
        />

        <h2>building</h2>
        <p>
          I love building games and projects. AI lowered the barrier to building. Persistence and patience are what put something meaningful together.
        </p>
        <p>
          I am constantly experimenting with different agentic development workflows. I use{' '}
          <a href="https://cursor.com/@bicrick" target="_blank" rel="noopener noreferrer">
            Cursor
          </a>
          , Claude Code, and Grok Bot. The furthest I have taken it is{' '}
          <Link to="/writing/agent-research-loops">
            auto research loops for reinforcement learning with Grok Bot
          </Link>
          . More on the{' '}
          <Link to="/projects">projects</Link> page.
        </p>
        <figure className="about-figure about-heatmap-figure">
          <div className="about-heatmap">
            <CursorActivityHeatmap />
          </div>
          <figcaption>cursor activity</figcaption>
        </figure>

        <h2>drive</h2>
        <p>
          Eagle Scout, 2018. 36 on the ACT, 2017. Same pattern every time: pick something hard, stay with it longer than is comfortable.
        </p>
        <p>
          I do not stop easy.
        </p>
      </article>
    </section>
  );
}
