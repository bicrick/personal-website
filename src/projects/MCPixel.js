import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';
import ProjectFigure from '../components/project/ProjectFigure';

function MCPixel() {
  return (
    <ProjectDetail
      title="mcpixel"
      date="July 2026"
      linkHref="https://github.com/bicrick/MCPixel"
      linkLabel="view repo"
      abstract="A local pixel-art suite: generate, remove background, snap to a grid, tweak. The art pipeline behind Range Rat. Your assets and keys stay on your machine."
    >
      <ProjectFigure
        src={`${process.env.PUBLIC_URL}/images/golf-incremental/range-rat-preview.gif`}
        alt="Range Rat sprites produced with MCPixel"
        caption="Range Rat sprites went through this pipeline"
      />

      <h2>/ why</h2>

      <p>
        Making game-ready pixel sprites usually means bouncing between an image generator, a background remover, and a snapping tool. MCPixel pipes those steps together in one local Docker app. Describe a sprite or upload a PNG, cut out the background, snap colors and edges to a grid, then re-snap without paying for a new generation.
      </p>

      <h2>/ stack</h2>

      <p>
        FastAPI, rembg (u2net, BiRefNet optional), and Pixel Snapper baked into the image. OpenAI Images is optional and bring-your-own-key. I used it to produce the sprites for{' '}
        <Link to="/projects/golf-incremental">Range Rat</Link>.
      </p>
    </ProjectDetail>
  );
}

export default MCPixel;
