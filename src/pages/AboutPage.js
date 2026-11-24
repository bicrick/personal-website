import React from 'react';
import { Link } from 'react-router-dom';
import TypewriterHeading from '../components/TypewriterHeading';
import CursorActivityHeatmap from '../components/CursorActivityHeatmap';
import './AboutPage.css';
import './AboutPage.mobile.css';

const ABOUT = process.env.PUBLIC_URL + '/about';

function Photo({ src, webp, alt }) {
  return (
    <picture className="about-photo">
      {webp ? <source srcSet={webp} type="image/webp" /> : null}
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </picture>
  );
}

const external = { target: '_blank', rel: 'noopener noreferrer' };

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

        <div className="about-hero">
          <Photo src={`${ABOUT}/img-4149.jpg`} alt="Me and my dog" />
          <div className="about-prose">
            <p>
              I'm Patrick. I live in Austin and work at{' '}
              <Link to="/heb" className="home-intro-heb-link" aria-label="H-E-B">
                <img
                  src={`${process.env.PUBLIC_URL}/images/heb/heb-logo.png`}
                  alt="H-E-B"
                  className="home-intro-heb"
                  draggable={false}
                />
              </Link>{' '}
              as a data platform engineer. Most of my time outside of
              work goes into learning new things and building side projects.
            </p>
            <p>
              I have always loved learning, and I think getting better at learning is a skill you can practice like
              anything else. That is what pulled me into machine learning. I earned my{' '}
              <Link to="/projects/ai-masters">Master's in AI from UT</Link> in one year while working full time.
            </p>
          </div>
        </div>

        <div className="about-prose">
          <p>
            AI excites me. There has never been a better time to be curious. The friction between me and my goals is
            the smallest it has ever been, and these tools are massive enablers for ambitious, curious people to build
            whatever they want. Building doesn't mean you need to make money. You can make{' '}
            <Link to="/projects/golf-incremental">video games</Link>, or experiment with different kinds of{' '}
            <Link to="/projects/infinite-tapestry">art</Link>.
          </p>
          <p>
            My development workflow is always changing. I am very familiar with{' '}
            <a href="https://cursor.com/@bicrick" {...external}>
              Cursor
            </a>{' '}
            and Claude Code, and more recently I have been running{' '}
            <Link to="/writing/agent-research-loops">long horizon loops with Grok Bot</Link>. There is a lot more on my{' '}
            <Link to="/projects">projects</Link> page.
          </p>
        </div>

        <figure className="about-heatmap">
          <CursorActivityHeatmap />
        </figure>

        <div className="about-prose">
          <p>
            Learning and building come down to the same thing for me. I am hungry, and I have a knack for putting my
            mind to something and sticking with it until it works. Here are a few things I put my mind to and was able
            to accomplish.
          </p>
        </div>

        <div className="about-feats">
          <div className="about-feat">
            <Photo src={`${ABOUT}/golf-swing.gif`} alt="My golf swing on the range" />
            <p>
              I picked up a golf club for the first time during COVID. Watching YouTube instructional videos, I got my
              handicap down to a +2.4, and won back-to-back club championships at{' '}
              <a href="https://www.austintexas.gov/golfatx/hancock-course" {...external}>
                Hancock Golf Course
              </a>{' '}
              in 2025 and 2026. I tried to qualify for the US Amateur this past summer and didn't make it. I will try
              again this year.
            </p>
          </div>

          <div className="about-feat">
            <Photo src={`${ABOUT}/img-4643.gif`} alt="Running the 400m" />
            <p>
              I never ran track in high school. I was too busy with school and baseball, but I always loved sprinting.
              In college I joined Odyssey Track Club and trained for the 400m five days a week. I broke the 50 second
              barrier and ran a 49.13 at the Texas Relays, winning my heat.
            </p>
          </div>

          <div className="about-feat">
            <Photo
              src={`${ABOUT}/paloma-fishing.jpg`}
              webp={`${ABOUT}/paloma-fishing.webp`}
              alt="Fly fishing in a Paloma hat"
            />
            <p>
              I founded an apparel company, from designing the logo to sourcing materials and finding manufacturers to
              tie it all together. After college, my cofounders and I passed it down to the underclassmen, and it lives
              on.{' '}
              <a href="https://palomapremiumwear.com" {...external}>
                Go buy something!
              </a>
            </p>
          </div>
        </div>

        <div className="about-prose">
          <p>
            When I am not working I like to be active outside. I love to play golf and tennis, ride bikes, and go
            fishing. I grew up an Eagle Scout, and ideally I'd spend more of my waking hours outside than inside.
            When I am inside, I like puzzle games. Play my puzzle game,{' '}
            <a href="https://twist-game.vercel.app" {...external}>
              twist
            </a>
            .
          </p>
        </div>

        <div className="about-pair">
          <figure>
            <Photo src={`${ABOUT}/img-5371.png`} alt="Me and my brother Walker" />
            <figcaption>me and my brother walker</figcaption>
          </figure>
          <figure>
            <Photo src={`${ABOUT}/img-5095.jpg`} alt="Me and my girlfriend Izzy" />
            <figcaption>me and my girlfriend izzy</figcaption>
          </figure>
        </div>
      </article>
    </section>
  );
}
