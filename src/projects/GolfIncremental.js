import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import RangeRatEmbed from '../components/RangeRatEmbed';
import RangeRatIdle from '../components/RangeRatIdle';
import RangeRatYawn from '../components/RangeRatYawn';
import RangeRatPlaylist from '../components/RangeRatPlaylist';

function GolfIncremental() {
  return (
    <ProjectDetail
      title="range rat"
      date="August 2026"
      linkHref="https://golf.bicrick.com"
      linkLabel="play"
      secondaryLinkHref="https://github.com/bicrick/golf_incremental"
      secondaryLinkLabel="repo"
      abstract="I built a 2.5d golfing video game using coding agents and gen-ai assets (music, art)."
      seoTitle="Range Rat - a 2.5d golf incremental"
      seoDescription="I built a 2.5d golfing video game using coding agents and gen-ai assets (music, art). Play Range Rat at golf.bicrick.com."
      seoKeywords="bicrick, Patrick Brown, Range Rat, Godot, pixel art, sprites, Suno, MCPixel, golf incremental, coding agents"
      seoUrl="https://bicrick.com/projects/golf-incremental"
      seoImage="https://bicrick.com/images/golf-incremental/range-rat-1200x600.jpg"
    >
      <RangeRatEmbed />

      <h2>/ play</h2>

      <p>
        The game is live at{' '}
        <a href="https://golf.bicrick.com" target="_blank" rel="noopener noreferrer">golf.bicrick.com</a>.
        It&apos;s easy to play. If you are on mobile make sure you turn off your ringer so you can hear the music.
      </p>

      <h2>/ the inspiration</h2>

      <p>
        This game kind of spawned out of a youtube binge session. There is this guy,{' '}
        <a href="https://www.youtube.com/@DangerouslyFunny" target="_blank" rel="noopener noreferrer">
          Dangerously Funny
        </a>
        , who makes incremental brainrot content. I was watching his videos and figured, &quot;Hey I can make one of these....&quot;
      </p>

      <p>
        I initially wanted to make something more stimulating. Something obnoxiously dopamine-maxxing with tons of stimulus. After experimenting with different art styles, I ended up doing something a bit more calming.
      </p>

      <h2>/ tools - engine</h2>

      <p>
        The most important aspect of the game is what it runs on. After doing some research, it was clear Godot was the answer. Godot would be the engine powering the game. I could build the .gd scripts using Cursor.
      </p>

      <h2>/ tools - sprites</h2>

      <p>
        The sprites were challenging to make. Pixel art is different than most genai art. Most genai art is not actually very discrete or atomic in nature. Things often don&apos;t have extremely clean lines. Especially when prompted to make pixel art, these tools will create things that approximate pixel art, but when you look closely the pixels are synthetic. They aren&apos;t &apos;real&apos; pixels, but some are more rectangular, and they are not uniform.
      </p>

      <RangeRatIdle />

      <p>
        There are a few tools that exist online to try to make this process easier, notably{' '}
        <a href="https://www.pixellab.ai/" target="_blank" rel="noopener noreferrer">
          Pixellab
        </a>
        {' '}and{' '}
        <a href="https://retrodiffusion.ai/app" target="_blank" rel="noopener noreferrer">
          Retro Diffusion
        </a>
        . I used both to help me make the assets for this game. Each of these have simple API based MCP servers that allow coding agents to create assets autonomously, but in my experience these never worked very well.
      </p>

      <RangeRatYawn />

      <p>
        I actually made my own tool after getting tired of paying for{' '}
        <a href="https://www.pixellab.ai/" target="_blank" rel="noopener noreferrer">
          Pixellab
        </a>
        {' '}and{' '}
        <a href="https://retrodiffusion.ai/app" target="_blank" rel="noopener noreferrer">
          Retro Diffusion
        </a>
        {' '}and ended up creating{' '}
        <a href="https://github.com/bicrick/MCPixel" target="_blank" rel="noopener noreferrer">
          MCPixel
        </a>
        . The pipeline involves taking an asset from GPT-Image 2 and then using math to estimate how the original image &apos;intended&apos; for its pixel values to look. Then we draw a grid over our image using these new estimated pixel values to actually extract a real, low-resolution image from these high res outputs from GPT image. Although my tools had a reduced suite of tools, it was still useful for asset generation of the simple 2d sprites. (No animations)
      </p>

      <h2>/ tools - music</h2>

      <p>
        <a href="https://suno.ai/" target="_blank" rel="noopener noreferrer">
          Suno
        </a>
        {' '}helped me create the music for this game. I didn&apos;t realize how much fun it would be. Music really helps you ground the game&apos;s artstyle and overall feel. If the music is off the game is off. With Suno I was able to create the music I wanted (8-bit, chiptune, adventure) and iterate from existing songs. Please listen to the music in the game it was so much fun to make.
      </p>

      <RangeRatPlaylist />

      <h2>/ wrap up</h2>

      <p>
        We are still in the beginning stages of agentic game dev. I want to see a future where everything can be handled by agents, and the developer is really abstracted from a lot of the menial tasks of development.
      </p>

      <p>
        At almost every step, I would have to hop in manually for touch ups. I had to learn how to use Godot&apos;s IDE to place assets manually within the world. Often times you would deal with bugs where it would be impossible for a coding agent to understand unless they could physically see the 3d world that the game was being played in.
      </p>

      <p>
        Asset generation is clunky. The models don&apos;t see very well, so it&apos;s hard to iterate on designs agentically when the api suite is so limited. In terms of prompting, I wish the models had the capacity to select their own regions for inpainting.
      </p>

      <p>
        Overall we are very far from a world where these agents can fully create games autonomously. (I am not talking about shitty browser games in 3js){' '}
        <a href="https://golf.bicrick.com" target="_blank" rel="noopener noreferrer">
          Go check it out
        </a>
        ...
      </p>
    </ProjectDetail>
  );
}

export default GolfIncremental;
