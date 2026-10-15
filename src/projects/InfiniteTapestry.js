import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import {
  BeforeAfterSlider,
  SeamReview,
  GapFillRibbons,
  TapestryRibbon,
  SceneThumbs,
} from '../components/project/tapestry';

const IMG = `${process.env.PUBLIC_URL}/images/infinite-tapestry`;

function InfiniteTapestry() {
  return (
    <ProjectDetail
      title="infinite tapestry"
      tldr="One endless horizontal painting, painted live. I tried this idea for a year before it stuck."
      date="October 2026"
      backHref="/"
      backLabel="home"
      linkHref="https://infinitetapestry.app"
      linkLabel="open live"
      abstract="An endless AI painting on a single RTX 4090. Visitors type an idea. The painter takes it word for word. Strips land about every 2.7 seconds."
    >
      <TapestryRibbon />

      <h2>/ how many times I tried this</h2>

      <p>
        I kept wanting a painting that never stopped. Not a gallery of images. One continuous
        surface you could walk along forever. For about a year the repos just piled up.
      </p>

      <p>
        February 2025:{' '}
        <a href="https://github.com/bicrick/diffusion-test" target="_blank" rel="noopener noreferrer">
          diffusion-test
        </a>
        {' '}was an educational diffusion viewer. Last commit message:{' '}
        <code>Broken</code>. Same month,{' '}
        <a href="https://github.com/bicrick/pixel-art-generator" target="_blank" rel="noopener noreferrer">
          pixel-art-generator
        </a>
        {' '}was a one-commit experiment titled &quot;testing pixel diffusion.&quot; Neither became a product.
      </p>

      <p>
        August 2025 I circled back with{' '}
        <a href="https://github.com/bicrick/diffusion-visualization" target="_blank" rel="noopener noreferrer">
          diffusion-visualization
        </a>
        : a 3D teaching tool for how images emerge from noise. Useful for intuition. Still not an
        endless painting.
      </p>

      <p>
        September 2025 is where the horizontal idea got concrete.{' '}
        <a href="https://github.com/bicrick/parallax-generator" target="_blank" rel="noopener noreferrer">
          parallax-generator
        </a>
        {' '}(Sep 10) used SDXL with circular UNet padding to make tileable parallax layers.
        Two days later{' '}
        <a href="https://github.com/bicrick/transparent-diffuse" target="_blank" rel="noopener noreferrer">
          transparent-diffuse
        </a>
        {' '}tried LayerDiffuse for transparent layers. Then{' '}
        <a href="https://github.com/bicrick/parallax-app" target="_blank" rel="noopener noreferrer">
          parallax-app
        </a>
        {' '}(&quot;Generate parallax looping wallpapers using AI&quot;) ran from September into January 2026,
        until the last commit was just me turning it into my own wallpaper. Looping wallpaper was
        close. It still wasn&apos;t one endless live canvas.
      </p>

      <h2>/ what finally shipped</h2>

      <p>
        <a href="https://infinitetapestry.app" target="_blank" rel="noopener noreferrer">
          Infinite Tapestry
        </a>
        {' '}is that canvas. One horizontal painting, streamed live. A single RTX 4090 runs
        RealVisXL on SDXL. Each strip is 256×1024 and takes about 2.7 seconds. In a recent six-hour
        stretch that was about 8,600 strips. Auto picks the next scene when the queue is empty.
        When a visitor types an idea, the painter gets it word for word.
      </p>

      <p>
        The first 1,269 strips (0–1268) were an OG era on SD 1.5. Strip 1269 is where SDXL
        starts. The scrolling ribbon above is a build-time bake of real SDXL strips from the
        public history feed — SFW scenes only, no runtime hotlink.
      </p>

      <picture>
        <source type="image/webp" srcSet={`${IMG}/hero-nile.webp`} />
        <img
          src={`${IMG}/about-nile.webp`}
          alt="A stretch of the Infinite Tapestry crossing the Nile"
          width="1400"
          height="114"
        />
      </picture>
      <p className="project-caption">
        Unedited stretch from the live run: Giza into the Nile. From the public about page.
      </p>

      <SceneThumbs />

      <h2>/ colour banding</h2>

      <p>
        Early joins showed vertical colour banding across the strip. The fix was boring and it
        worked: fill the masked region with the context mean plus a little noise before the
        inpaint, instead of leaving a flat hole for the model to invent structure into.
      </p>

      <BeforeAfterSlider />

      <h2>/ seams</h2>

      <p>
        Joining two finished scenes is the hard part. The current approach blends the two scenes
        in latent space inside the model, then repaints the join. On a visual bake-off that dropped
        seam roughness from about 3.71 to about 2.30 (lower is smoother).
      </p>

      <SeamReview />

      <h2>/ gap fill</h2>

      <p>
        Another arm leaves both finished images untouched and only paints a blank gap between
        them, with a short feather on each side. That preserves detail the older join used to
        rewrite, at the cost of a harder edge when the two backgrounds disagree. The ribbons below
        are the same sixty scene pairs, A on top and gap-fill B2-256 underneath.
      </p>

      <GapFillRibbons />

      <h2>/ fuel</h2>

      <p>
        The tapestry only moves while the GPU is paid for. Fuel on the site is prepaid GPU
        inference time. I am a Data Platform Engineer at H-E-B by day; this runs on rented compute
        at night. If you want it to keep painting, that is what fuel buys.
      </p>

      <p>
        <a href="https://infinitetapestry.app" target="_blank" rel="noopener noreferrer">
          infinitetapestry.app
        </a>
        {' · '}
        type an idea, watch it land
      </p>
    </ProjectDetail>
  );
}

export default InfiniteTapestry;
