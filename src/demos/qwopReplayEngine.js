/**
 * Pose-replay player matching qwop-python's pygame renderer math.
 * Renders into a fixed 640x400 game buffer, then scales into a stage element.
 */

const ASSET_BASE = `${process.env.PUBLIC_URL}/demos/qwop`;
// Bust CDN/browser cache when swapping trajectories or atlas assets
const ASSET_VERSION = '20260723j';
const CAMERA_HORIZONTAL_OFFSET = -14;
const INITIAL_CAMERA_Y = -200;
const TRACK_CENTER_Y = 10.74275;
const GAME_WIDTH = 640;
const GAME_HEIGHT = 400;
const TRACK_TILE_WIDTH = 640;
// JS/pygame startingLine world X (pixels); marker scaled to 37x77
const START_LINE_WORLD_X = 90;
const LANE_MARKER_W = 37;
const LANE_MARKER_H = 77;
const SAND_PIT_AT = 20000; // jump landing zone (world pixels)

// UISprites.json frame indices (match qwop-python renderer)
const UI_FRAME = {
  calves: 1,
  sandBoard: 16,
  startingLine: 17,
  thighs: 18,
  sandPit: 24,
  oUp: 10,
  oDown: 11,
  pUp: 12,
  pDown: 13,
  qUp: 14,
  qDown: 15,
  wUp: 19,
  wDown: 20,
};

function assetUrl(name) {
  return `${ASSET_BASE}/${name}?v=${ASSET_VERSION}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

async function loadJson(src) {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Failed to load ${src}`);
  return res.json();
}

function stretchSprintbg(source) {
  // sprintbg.jpg is 1x400 vertical gradient; pygame stretches to 640x400
  const c = document.createElement('canvas');
  c.width = GAME_WIDTH;
  c.height = GAME_HEIGHT;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(source, 0, 0, GAME_WIDTH, GAME_HEIGHT);
  return c;
}

function tileTexture(source, width, height) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  for (let y = 0; y < height; y += source.height) {
    for (let x = 0; x < width; x += source.width) {
      ctx.drawImage(source, x, y);
    }
  }
  return c;
}

function tileUnderground(source) {
  // Match pygame _tile_texture to 640 x texture.height
  return tileTexture(source, TRACK_TILE_WIDTH, source.height);
}

export async function loadQwopDemoAssets() {
  const [
    run,
    atlasJson,
    atlas,
    undergroundSrc,
    sprintbgSrc,
    uiJson,
    uiAtlas,
    sandSrc,
    sandtapeSrc,
  ] = await Promise.all([
    loadJson(assetUrl('best-run.json')),
    loadJson(assetUrl('playercolor.json')),
    loadImage(assetUrl('playercolor.png')),
    loadImage(assetUrl('underground.png')),
    loadImage(assetUrl('sprintbg.jpg')),
    loadJson(assetUrl('UISprites.json')),
    loadImage(assetUrl('UISprites.png')),
    loadImage(assetUrl('sand.png')),
    loadImage(assetUrl('sandtape.png')),
  ]);

  return {
    run,
    frames: atlasJson.frames,
    atlas,
    underground: tileUnderground(undergroundSrc),
    sprintbg: stretchSprintbg(sprintbgSrc),
    uiFrames: uiJson.frames,
    uiAtlas,
    sandTiled: tileTexture(sandSrc, 2000, 25),
    sandtapeTiled: tileTexture(sandtapeSrc, 2000, 14),
  };
}

function blitUiFrame(ctx, uiAtlas, uiFrames, frameIdx, x, y) {
  if (!uiAtlas || !uiFrames || frameIdx == null || frameIdx >= uiFrames.length) return;
  const fr = uiFrames[frameIdx].frame;
  ctx.drawImage(
    uiAtlas,
    fr.x,
    fr.y,
    fr.w,
    fr.h,
    Math.round(x - fr.w / 2),
    Math.round(y - fr.h / 2),
    fr.w,
    fr.h,
  );
}

function drawLaneMarkers(ctx, assets, cameraX, trackTopY, worldScale) {
  // Match pygame _draw_lane_markers: Starting_Line frame 17, scaled 37x77
  const { uiAtlas, uiFrames, run } = assets;
  if (!uiAtlas || !uiFrames || uiFrames.length <= UI_FRAME.startingLine) return;

  const fr = uiFrames[UI_FRAME.startingLine].frame;
  const blitY = Math.round(trackTopY - LANE_MARKER_H);

  const drawMarker = (worldX) => {
    const screenX = worldX - cameraX;
    if (screenX + LANE_MARKER_W <= 0 || screenX >= GAME_WIDTH) return;
    ctx.drawImage(
      uiAtlas,
      fr.x,
      fr.y,
      fr.w,
      fr.h,
      Math.round(screenX),
      blitY,
      LANE_MARKER_W,
      LANE_MARKER_H,
    );
  };

  drawMarker(START_LINE_WORLD_X);

  // Best/hs line at recorded final distance (same formula as JS: metres * 10 * worldScale)
  const bestMeters = Number(run?.meta?.final_distance);
  if (Number.isFinite(bestMeters) && bestMeters > 0) {
    drawMarker(bestMeters * 10 * worldScale);
  }
}

function drawSandPit(ctx, assets, cameraX, cameraY) {
  // Match pygame _draw_sand_pit (only when camera near ~1000 m)
  if (!(cameraX > SAND_PIT_AT - 500 && cameraX < SAND_PIT_AT + 2100)) return;

  const { sandTiled, sandtapeTiled, uiAtlas, uiFrames } = assets;
  const toScreen = (wx, wy) => [wx - cameraX, wy - cameraY];

  if (sandtapeTiled) {
    const [sx, sy] = toScreen(SAND_PIT_AT - 84, 160);
    ctx.drawImage(sandtapeTiled, Math.round(sx), Math.round(sy));
  }
  if (sandTiled) {
    const [sx, sy] = toScreen(SAND_PIT_AT - 6, 176);
    ctx.drawImage(sandTiled, Math.round(sx), Math.round(sy));
  }
  if (uiAtlas && uiFrames && uiFrames.length > UI_FRAME.sandPit) {
    const fr = uiFrames[UI_FRAME.sandPit].frame;
    const [sx, sy] = toScreen(SAND_PIT_AT, 188.5);
    ctx.drawImage(uiAtlas, fr.x, fr.y, fr.w, fr.h, Math.round(sx), Math.round(sy), fr.w, fr.h);
  }
  if (uiAtlas && uiFrames && uiFrames.length > UI_FRAME.sandBoard) {
    const fr = uiFrames[UI_FRAME.sandBoard].frame;
    const [sx, sy] = toScreen(SAND_PIT_AT - 183, 155);
    ctx.drawImage(uiAtlas, fr.x, fr.y, fr.w, fr.h, Math.round(sx), Math.round(sy), fr.w, fr.h);
  }
}

function drawKeyIndicators(ctx, assets, keys) {
  const { uiAtlas, uiFrames } = assets;
  if (!uiAtlas || !uiFrames) return;

  const cx = GAME_WIDTH / 2;
  const keyY = 46.5;
  const q = keys && keys[0];
  const w = keys && keys[1];
  const o = keys && keys[2];
  const p = keys && keys[3];

  // Match original / pygame layout: Q/W + THIGHS left, O/P + CALVES right
  blitUiFrame(ctx, uiAtlas, uiFrames, q ? UI_FRAME.qDown : UI_FRAME.qUp, cx - 274 + 0.5, keyY);
  blitUiFrame(ctx, uiAtlas, uiFrames, w ? UI_FRAME.wDown : UI_FRAME.wUp, cx - 274 + 52.5, keyY);
  blitUiFrame(ctx, uiAtlas, uiFrames, o ? UI_FRAME.oDown : UI_FRAME.oUp, cx + 274 - 52.5, keyY);
  blitUiFrame(ctx, uiAtlas, uiFrames, p ? UI_FRAME.pDown : UI_FRAME.pUp, cx + 274 + 0.5, keyY);
  blitUiFrame(ctx, uiAtlas, uiFrames, UI_FRAME.thighs, cx - 248, 85);
  blitUiFrame(ctx, uiAtlas, uiFrames, UI_FRAME.calves, cx + 248, 85);
}

function cameraForPose(pose, parts, worldScale) {
  const torso = pose[parts.indexOf('torso')];
  return {
    cameraX: (torso[0] + CAMERA_HORIZONTAL_OFFSET) * worldScale,
    cameraY: INITIAL_CAMERA_Y,
  };
}

function drawGameFrame(ctx, assets, index) {
  const { run, frames, atlas, underground, sprintbg } = assets;
  const pose = run.poses[index];
  const keys = run.keys[index];
  const { cameraX, cameraY } = cameraForPose(pose, run.parts, run.worldScale);
  const worldScale = run.worldScale;

  // 1. Background gradient (sprintbg)
  ctx.drawImage(sprintbg, 0, -16);

  // 2. Track segments (exact pygame formula)
  const trackCenterYPx = TRACK_CENTER_Y * worldScale;
  const segmentW = TRACK_TILE_WIDTH;
  const segmentH = underground.height;
  const base = Math.floor(cameraX / GAME_WIDTH);
  for (let i = 0; i < 3; i += 1) {
    const worldXPx = (base + i) * GAME_WIDTH;
    const screenX = worldXPx - cameraX;
    const screenY = trackCenterYPx - cameraY;
    ctx.drawImage(
      underground,
      Math.round(screenX - segmentW / 2),
      Math.round(screenY - segmentH / 2),
    );
  }

  // 2b. Start line + best line (UISprites Starting_Line)
  const trackTopY = trackCenterYPx - segmentH / 2 - cameraY;
  drawLaneMarkers(ctx, assets, cameraX, trackTopY, worldScale);

  // 2c. Sand pit (~1000 m) — assets loaded; visible only if a run reaches it
  drawSandPit(ctx, assets, cameraX, cameraY);

  // 3. Body parts in depth order (already encoded in run.parts).
  // Atlas frame sizes match physics boxes (half*2*worldScale); prefer atlas pixels.
  for (let i = 0; i < run.parts.length; i += 1) {
    const name = run.parts[i];
    const [x, y, angle] = pose[i];
    const fr = frames[run.frameIndex[name]].frame;
    const size = run.partSizes[name];
    const widthPx = fr.w || size.halfWidth * 2 * worldScale;
    const heightPx = fr.h || size.halfHeight * 2 * worldScale;

    const screenX = x * worldScale - cameraX;
    const screenY = y * worldScale - cameraY;

    // Canvas positive rotation is clockwise; pygame/PIL rotate() is CCW.
    // pygame uses rotate(-degrees(body.angle)) == clockwise by body.angle.
    // Matching that on canvas means rotate(+body.angle).
    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(angle);
    ctx.drawImage(
      atlas,
      fr.x,
      fr.y,
      fr.w,
      fr.h,
      -widthPx / 2,
      -heightPx / 2,
      widthPx,
      heightPx,
    );
    ctx.restore();
  }

  // 4. Original Q/W/O/P key sprites (top corners) + THIGHS / CALVES labels
  drawKeyIndicators(ctx, assets, keys);

  // 5. Distance HUD (centered top, like original score)
  const label = `${(run.distance[index] || 0).toFixed(1)} metres`;
  ctx.font = 'bold 28px Verdana, Geneva, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillText(label, GAME_WIDTH / 2 + 2, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(label, GAME_WIDTH / 2, 14);
}

export function createQwopReplayPlayer(canvas, assets, options = {}) {
  const ctx = canvas.getContext('2d');
  const gameCanvas = document.createElement('canvas');
  gameCanvas.width = GAME_WIDTH;
  gameCanvas.height = GAME_HEIGHT;
  const gameCtx = gameCanvas.getContext('2d');

  const stageEl = options.stageEl || canvas.parentElement;
  const seekDistance = Number.isFinite(options.seekDistance)
    ? options.seekDistance
    : null;
  let freezeAtSeek = Boolean(options.freezeAtSeek);
  const onFrame = typeof options.onFrame === 'function' ? options.onFrame : null;

  const findFrameForDistance = (meters) => {
    const distances = assets.run?.distance;
    if (!distances?.length || !Number.isFinite(meters)) return 0;
    let best = 0;
    let bestDelta = Infinity;
    for (let i = 0; i < distances.length; i += 1) {
      const delta = Math.abs(distances[i] - meters);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = i;
      }
    }
    return best;
  };

  let frameIndex = 0;
  if (seekDistance != null) {
    frameIndex = findFrameForDistance(seekDistance);
  }

  let lastTs = 0;
  let acc = 0;
  let rafId = 0;
  let running = false;
  let paused = false;
  let playbackRate = 1;
  let resizeObserver = null;

  const stageSize = () => {
    const width = Math.max(1, stageEl?.clientWidth || window.innerWidth);
    const height = Math.max(1, stageEl?.clientHeight || window.innerHeight);
    return { width, height };
  };

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = stageSize();
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const present = () => {
    const { width, height } = stageSize();
    const scale = Math.min(width / GAME_WIDTH, height / GAME_HEIGHT);
    const w = GAME_WIDTH * scale;
    const h = GAME_HEIGHT * scale;
    const x = (width - w) / 2;
    // Top-bias leftover letterbox so chrome sits tight above the game on tall phones
    const y = Math.max(0, (height - h) * 0.12);

    ctx.fillStyle = '#0a0e14';
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(gameCanvas, x, y, w, h);
  };

  const emitFrame = (index) => {
    if (!onFrame) return;
    onFrame({
      index,
      distance: assets.run.distance[index] || 0,
      keys: assets.run.keys[index],
      meta: assets.run.meta || {},
      dt: assets.run.dt,
      run: assets.run,
    });
  };

  const drawFrame = (index) => {
    gameCtx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawGameFrame(gameCtx, assets, index);
    present();
    emitFrame(index);
  };

  const tick = (ts) => {
    if (!running) return;
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;

    if (!paused && !freezeAtSeek) {
      acc += dt * playbackRate;
      while (acc >= assets.run.dt) {
        acc -= assets.run.dt;
        frameIndex += 1;
        if (frameIndex >= assets.run.poses.length) frameIndex = 0;
      }
    }

    drawFrame(frameIndex);
    rafId = window.requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    paused = false;
    resize();
    lastTs = 0;
    acc = 0;
    if (seekDistance == null) frameIndex = 0;
    window.addEventListener('resize', resize);
    if (typeof ResizeObserver !== 'undefined' && stageEl) {
      resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(stageEl);
    }
    rafId = window.requestAnimationFrame(tick);
  };

  const stop = () => {
    running = false;
    paused = false;
    window.removeEventListener('resize', resize);
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (rafId) window.cancelAnimationFrame(rafId);
  };

  const pause = () => {
    paused = true;
    acc = 0;
    lastTs = 0;
  };

  const resume = () => {
    if (!running) return;
    freezeAtSeek = false;
    paused = false;
    lastTs = 0;
    acc = 0;
  };

  const setPlaybackRate = (rate) => {
    const next = Number(rate);
    if (!Number.isFinite(next) || next <= 0) return;
    playbackRate = next;
  };

  const seekToDistance = (meters) => {
    freezeAtSeek = false;
    frameIndex = findFrameForDistance(meters);
    acc = 0;
    lastTs = 0;
    drawFrame(frameIndex);
  };

  return {
    start,
    stop,
    pause,
    resume,
    setPlaybackRate,
    seekToDistance,
    getFrameIndex: () => frameIndex,
    getPlaybackRate: () => playbackRate,
    getRun: () => assets.run,
  };
}
