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
      linkLabel="open live"
      abstract="256×1024 strips, ~2.7 s each. Adjacent strips overlap; the join is inpainted. Auto paints when the queue is empty. A visitor idea is taken word for word."
    >
      <TapestryRibbon />

      <h2>/ geometry</h2>
      <p>
        Window 1024×1024. Strip 256×1024. Overlap 192. Repaint band 128.
        Emitted file 448×1024 (overlap + new). Height is fixed at 1024; the canvas grows right.
      </p>
      <StripGeometry />

      <h2>/ paint loop</h2>
      <p>
        Prompt in. RealVisXL (SDXL inpaint) on one RTX 4090. Stitch. Store. Index.
        Auto fills the queue; visitor ideas take over first.
      </p>
      <PaintLoop />

      <h2>/ join</h2>
      <p>
        Adjacent strips overlap; the join is inpainted. Crossfade over{' '}
        <code>seam_px</code>, then a masked repaint at <code>bridge_strength</code>.
      </p>
      <OverlapInpaint />
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
