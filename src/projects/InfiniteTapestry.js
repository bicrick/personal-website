import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import { TapestryRibbon } from '../components/project/tapestry';
import {
  StripGeometry,
  PaintLoop,
  OverlapInpaint,
  StorageServing,
  Controls,
} from '../components/project/tapestry/schematics';

function InfiniteTapestry() {
  return (
    <ProjectDetail
      title="infinite tapestry"
      tldr="One endless horizontal painting. One RTX 4090."
      date="October 2026"
      backHref="/"
      backLabel="home"
      linkHref="https://infinitetapestry.app"
      linkLabel="live"
      secondaryLinkHref="https://infinitetapestry.app/about"
      secondaryLinkLabel="about"
      abstract={
        <>
          This project was about building an endless, infinitely extending tapestry. Anyone can prompt the tapestry, and their creations will be woven in. It runs on a rented GPU from{' '}
          <a href="https://www.runpod.io/" target="_blank" rel="noopener noreferrer">RunPod</a>
          {', painting each new strip live as people watch.'}
        </>
      }
    >
      <TapestryRibbon />

      <h2>/ how it works</h2>
      <p>
        Inpainting happens off screen. Each new strip is painted and joined before it scrolls into view, so the tapestry on screen is already one piece.
      </p>
      <p>
        A prompt arrives as its own picture. We overlap the tail of the tapestry with the head of that picture and mask the band where the two meet. The model may only redraw the mask. Both halves stay put, which is how we convince it that it already drew them: the left half is the scene already on the wall, the right half is the scene someone just asked for. The model fills the gap between.
      </p>
      <p>
        A crossfade settles the seam. Then the strip goes live.
      </p>
      <OverlapInpaint />

      <p>
        When someone submits a prompt, it is enqueued. Prompts are painted in turn, each one taken as written, run out as its own scene, and woven into the scroll for everyone watching. A visitor prompt is painted before anything the tapestry was about to invent on its own.
      </p>
      <p>
        When the queue is empty, a Claude Haiku 5.5 agent fills the gaps. It switches themes, styles, and narratives on its own, so the scroll keeps moving.
      </p>

      <h2>/ geometry</h2>
      <p>
        Window 1024×1024. Strip 256×1024. Overlap 192. Repaint band 128.
        Emitted file 448×1024 (overlap + new). Height is fixed at 1024; the canvas grows right.
      </p>
      <StripGeometry />

      <h2>/ paint loop</h2>
      <p>
        Prompt in. RealVisXL (SDXL inpaint) on one RTX 4090. Stitch. Store. Index.
        Visitor prompts are painted first. Haiku fills the queue when it is empty.
      </p>
      <PaintLoop />

      <h2>/ join</h2>
      <p>
        Adjacent strips overlap; the join is inpainted. Crossfade over{' '}
        <code>seam_px</code>, then a masked repaint at <code>bridge_strength</code>.
      </p>
      <Controls />

      <h2>/ storage</h2>
      <p>
        WebP strips to R2. Rows to Supabase. WebSocket refs to the browser, which feathers
        the overlap and scrolls. LOD tiles for scrubbing.
      </p>
      <StorageServing />

      <p>
        The window above embeds the live site (SFW SDXL strips). Homepage thumbnail
        and schematics use a build-time bake from 11&nbsp;PM CT on Oct&nbsp;13, 2026 onward.
      </p>

      <p>
        <a href="https://infinitetapestry.app" target="_blank" rel="noopener noreferrer">
          infinitetapestry.app
        </a>
      </p>
    </ProjectDetail>
  );
}

export default InfiniteTapestry;
