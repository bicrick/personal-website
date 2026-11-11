import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import {
  CARD_GRID_TEXTURE,
  CARD_H,
  CARD_TEXTURE,
  CARD_W,
  META,
} from './T100IngestMeta';

const DEG = Math.PI / 180;

/**
 * Card PlaneGeometry lives in XY (normal +Z). Rest pose is face-up on the
 * desk via YXZ Euler (-PI/2, yaw, 0). Camera stays steep so the desk fills
 * every frame edge; a small +Z bias foreshortens the far (top) edge.
 */
const PHOTO = {
  camPos: new THREE.Vector3(0.1, 2.42, 0.78),
  camTarget: new THREE.Vector3(0, 0.004, -0.06),
  cardPos: new THREE.Vector3(0, 0.004, 0),
  cardQuat: new THREE.Quaternion().setFromEuler(
    new THREE.Euler(-Math.PI / 2, 8 * DEG, 0, 'YXZ'),
  ),
  bend: 1,
  cardScale: 0.86,
};

const FLAT = {
  camPos: new THREE.Vector3(0, 2.72, 0.32),
  camTarget: new THREE.Vector3(0, 0.004, 0),
  cardPos: new THREE.Vector3(0, 0.004, 0),
  cardQuat: new THREE.Quaternion().setFromEuler(
    new THREE.Euler(-Math.PI / 2, 0, 0, 'YXZ'),
  ),
  bend: 0,
  cardScale: 0.9,
};

function lerpPose(a, b, t) {
  const k = THREE.MathUtils.smoothstep(t, 0, 1);
  return {
    camPos: a.camPos.clone().lerp(b.camPos, k),
    camTarget: a.camTarget.clone().lerp(b.camTarget, k),
    cardPos: a.cardPos.clone().lerp(b.cardPos, k),
    cardQuat: a.cardQuat.clone().slerp(b.cardQuat, k),
    // Curl clears early so mid-Cutout never shears printed rows
    bend: THREE.MathUtils.lerp(a.bend, b.bend, Math.min(1, k * 4.5)),
    cardScale: THREE.MathUtils.lerp(a.cardScale, b.cardScale, k),
  };
}

function poseForStep(step, cutProgress) {
  if (step <= 0) return PHOTO;
  if (step === 1) return lerpPose(PHOTO, FLAT, cutProgress);
  return FLAT;
}

/** Keep ≥12px side margin; no-ops on desktop where the card already fits. */
function maxCardScaleForView(camY, fovDeg, canvasW, canvasH, yawPad) {
  if (canvasW < 8 || canvasH < 8) return Number.POSITIVE_INFINITY;
  const vFov = THREE.MathUtils.degToRad(fovDeg);
  const visibleH = 2 * Math.tan(vFov * 0.5) * Math.max(0.4, camY);
  const visibleW = visibleH * (canvasW / canvasH);
  const marginPx = 14;
  const usableW = visibleW * Math.max(0.5, (canvasW - marginPx * 2) / canvasW);
  return usableW / (CARD_W * yawPad);
}

function makeDeskTexture(isDark) {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (isDark) {
    // Visible dark walnut — grain must read under the card
    ctx.fillStyle = '#5a4a3c';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 2) {
      const wobble = Math.sin(y * 0.04) * 18 + Math.sin(y * 0.13) * 7;
      ctx.globalAlpha = 0.32;
      ctx.fillStyle = y % 7 === 0 ? '#3d3228' : '#6b5746';
      ctx.fillRect(0, y, size, 1);
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#7d6552';
      ctx.fillRect(wobble, y, size, 1);
    }
    for (let i = 0; i < 2600; i += 1) {
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = Math.random() > 0.5 ? '#2e241c' : '#8a705a';
      ctx.fillRect(Math.random() * size, Math.random() * size, 1.8, 1.8);
    }
    // Soft pool of light centered under the card footprint
    const pool = ctx.createRadialGradient(
      size * 0.5,
      size * 0.5,
      size * 0.03,
      size * 0.5,
      size * 0.5,
      size * 0.38,
    );
    pool.addColorStop(0, 'rgba(210, 175, 135, 0.55)');
    pool.addColorStop(0.35, 'rgba(140, 110, 82, 0.28)');
    pool.addColorStop(0.7, 'rgba(70, 55, 42, 0.1)');
    pool.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = pool;
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.fillStyle = '#cbb79a';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 2) {
      const wobble = Math.sin(y * 0.07) * 10;
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = y % 9 === 0 ? '#d6c4a8' : '#b9a486';
      ctx.fillRect(0, y, size, 1);
      ctx.globalAlpha = 0.1;
      ctx.fillRect(wobble, y, size, 1);
    }
    for (let i = 0; i < 1400; i += 1) {
      ctx.globalAlpha = 0.055;
      ctx.fillStyle = '#8a7355';
      ctx.fillRect(Math.random() * size, Math.random() * size, 1.2, 1.2);
    }
    ctx.globalAlpha = 1;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  // Dense repeat + large plane so foreshortened far desk never blanks out
  tex.repeat.set(16, 16);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/**
 * Soft parabolic curl along the short axis only — left/right edges lift,
 * center stays on the desk. No crease line through printed text.
 */
function applyBend(geometry, bend, basePositions) {
  const pos = geometry.attributes.position;
  const amp = 0.032 * bend;
  const halfW = CARD_W * 0.5;
  for (let i = 0; i < pos.count; i += 1) {
    const x = basePositions[i * 3];
    const y = basePositions[i * 3 + 1];
    const nx = x / halfW;
    const curl = amp * nx * nx;
    pos.setXYZ(i, x, y, curl);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

function useReadOverlayTexture(litCount, active) {
  const { invalidate } = useThree();
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 719;
    c.height = 341;
    return c;
  }, []);

  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.flipY = true;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    return t;
  }, [canvas]);

  useEffect(() => () => texture.dispose(), [texture]);

  useEffect(() => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!active) {
      texture.needsUpdate = true;
      invalidate();
      return;
    }
    const paint = (box, stroke, fill) => {
      // Inset by half the stroke so the outline sits on the cell, not outside it
      const lw = 2;
      const x = box.x * canvas.width + lw / 2;
      const y = box.y * canvas.height + lw / 2;
      const w = box.w * canvas.width - lw;
      const h = box.h * canvas.height - lw;
      const r = 2.5;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.stroke();
    };

    if (litCount > 0) {
      paint(META.nameBox, 'rgba(59,130,184,0.95)', null);
    }
    META.cells.forEach((cell, idx) => {
      if (litCount > idx) {
        paint(cell, 'rgba(201,162,39,0.9)', 'rgba(245,215,110,0.28)');
      }
    });
    // OUT 30 — lights with the last hole so the full handwritten row is framed
    if (META.outBox && litCount >= META.cells.length) {
      paint(META.outBox, 'rgba(59,130,184,0.85)', 'rgba(120,180,220,0.18)');
    }
    texture.needsUpdate = true;
    invalidate();
  }, [active, litCount, canvas, texture, invalidate]);

  return texture;
}

function ScorecardMesh({
  groupRef,
  geoRef,
  basePositionsRef,
  overlayMeshRef,
  litCount,
  showRead,
  useGrid,
}) {
  // Dense X segments for a smooth cylinder curl; few Y segments (no Y bend)
  const geo = useMemo(() => new THREE.PlaneGeometry(CARD_W, CARD_H, 96, 6), []);
  const basePositions = useMemo(() => {
    const arr = new Float32Array(geo.attributes.position.array.length);
    arr.set(geo.attributes.position.array);
    return arr;
  }, [geo]);

  useEffect(() => {
    geoRef.current = geo;
    basePositionsRef.current = basePositions;
    applyBend(geo, 0, basePositions);
  }, [geo, basePositions, geoRef, basePositionsRef]);

  useEffect(() => () => geo.dispose(), [geo]);

  const textures = useTexture({
    front: CARD_TEXTURE,
    grid: CARD_GRID_TEXTURE,
  });

  useEffect(() => {
    Object.values(textures).forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      // Match canvas overlay — keep UV origin locked to the card texture
      t.flipY = true;
      // No mipmaps — grazing near-edge of HANDICAP was smearing into a ghost fold
      t.generateMipmaps = false;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = 1;
      t.needsUpdate = true;
    });
  }, [textures]);

  const overlay = useReadOverlayTexture(litCount, showRead);

  return (
    <group ref={groupRef}>
      <mesh geometry={geo}>
        <meshStandardMaterial
          map={useGrid ? textures.grid : textures.front}
          roughness={0.82}
          metalness={0}
          side={THREE.FrontSide}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
      {/* Same geometry/UVs as the card so Read boxes stay locked under transform */}
      <mesh
        ref={overlayMeshRef}
        geometry={geo}
        position={[0, 0, 0.0008]}
        visible={showRead}
      >
        <meshBasicMaterial
          map={overlay}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/**
 * 0 = wood desk (Photo only).
 * Cutout fades wood out early so the step (and static tab) is fully plain;
 * Read / Done stay plain. Wood returns only when Photo restarts.
 */
function plainAmount(step, cutProgress) {
  if (step <= 0) return 0;
  if (step === 1) return THREE.MathUtils.smoothstep(cutProgress, 0, 0.28);
  return 1;
}

const WOOD_BG = { light: '#cbb79a', dark: '#5a4a3c' };
const PLAIN_BG = { light: '#f4f1ea', dark: '#121412' }; // --t100-paper

function Desk({ meshRef, isDark }) {
  const tex = useMemo(() => makeDeskTexture(isDark), [isDark]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial
        map={tex}
        roughness={isDark ? 0.82 : 0.9}
        metalness={0.02}
        transparent
        opacity={1}
        depthWrite
      />
    </mesh>
  );
}

/**
 * Contact shadow as an edge ring: darkest right at the paper silhouette
 * (visible as a tight line), with a short soft ambient falloff outside.
 * Interior under the sheet stays light — the card occludes it anyway.
 */
function makeContactShadowTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  const data = img.data;

  const cx = size * 0.5;
  const cy = size * 0.5;
  // Match card aspect inside the square atlas (plane is scaled to card later)
  const hw = size * 0.435;
  const hh = size * 0.435;
  const radius = size * 0.03;
  const contactPx = size * 0.012;
  const ambientPx = size * 0.07;

  const roundedBoxSDF = (px, py) => {
    const dx = Math.abs(px - cx) - hw + radius;
    const dy = Math.abs(py - cy) - hh + radius;
    const ax = Math.max(dx, 0);
    const ay = Math.max(dy, 0);
    return (
      Math.min(Math.max(dx, dy), 0) + Math.sqrt(ax * ax + ay * ay) - radius
    );
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const d = roundedBoxSDF(x + 0.5, y + 0.5);
      let a = 0;
      if (d < -contactPx) {
        // Deep under the sheet — faint only (occlusion hides most of it)
        a = 0.12;
      } else if (d <= contactPx) {
        // Peak contact straddling the silhouette
        const t = Math.abs(d) / contactPx;
        a = 0.72 * (1 - t * t) + 0.18;
      } else if (d < ambientPx) {
        const t = (d - contactPx) / (ambientPx - contactPx);
        const s = 1 - t;
        a = 0.28 * s * s * s;
      }
      const i = (y * size + x) * 4;
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = Math.round(Math.min(1, a) * 255);
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function ContactShadow({ groupRef }) {
  const tex = useMemo(() => makeContactShadowTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group ref={groupRef} position={[0, 0.0005, 0]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        // Slightly larger than the card so the contact ring peeks at the edge
        scale={[CARD_W * 1.08, CARD_H * 1.1, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={tex}
          transparent
          depthWrite={false}
          toneMapped={false}
          opacity={1}
        />
      </mesh>
    </group>
  );
}

function SceneRig({
  step,
  cutProgress,
  litCount,
  isDark,
  reducedMotion,
}) {
  const { camera, gl, scene, invalidate, size } = useThree();
  const cardRef = useRef();
  const deskRef = useRef();
  const shadowRef = useRef();
  const hemiRef = useRef();
  const geoRef = useRef();
  const basePositionsRef = useRef();
  const overlayMeshRef = useRef();
  const bendRef = useRef(-1);
  const lookTarget = useRef(PHOTO.camTarget.clone());
  const yawEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const bgWood = useRef(new THREE.Color());
  const bgPlain = useRef(new THREE.Color());
  const bgMix = useRef(new THREE.Color());
  const hemiSky = useRef(new THREE.Color());
  const hemiGroundWood = useRef(new THREE.Color());
  const hemiGroundPlain = useRef(new THREE.Color());
  const hemiGroundMix = useRef(new THREE.Color());
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const state = useRef({
    camPos: PHOTO.camPos.clone(),
    camTarget: PHOTO.camTarget.clone(),
    cardPos: PHOTO.cardPos.clone(),
    cardQuat: PHOTO.cardQuat.clone(),
    bend: PHOTO.bend,
    cardScale: PHOTO.cardScale,
  });

  const drivers = useRef({ step, cutProgress, reducedMotion, isDark });
  drivers.current = { step, cutProgress, reducedMotion, isDark };

  useEffect(() => {
    bgWood.current.set(isDark ? WOOD_BG.dark : WOOD_BG.light);
    bgPlain.current.set(isDark ? PLAIN_BG.dark : PLAIN_BG.light);
    hemiSky.current.set(isDark ? '#6a5644' : '#f5f0e6');
    hemiGroundWood.current.set(isDark ? '#2e241c' : '#a89880');
    hemiGroundPlain.current.set(isDark ? '#121412' : '#f4f1ea');
    invalidate();
  }, [isDark, invalidate]);

  useEffect(() => {
    invalidate();
  }, [step, cutProgress, litCount, reducedMotion, size.width, size.height, invalidate]);

  useFrame((_, dt) => {
    const { step: s, cutProgress: cp, reducedMotion: rm, isDark: dark } =
      drivers.current;
    const desired = poseForStep(s, cp);
    const speed = rm ? 1 : Math.min(1, dt * (s === 1 ? 1.45 : 2.3));
    const c = state.current;
    const plain = plainAmount(s, cp);
    const deskVis = 1 - plain;

    if (rm) {
      c.camPos.copy(desired.camPos);
      c.camTarget.copy(desired.camTarget);
      c.cardPos.copy(desired.cardPos);
      c.cardQuat.copy(desired.cardQuat);
      c.bend = desired.bend;
      c.cardScale = desired.cardScale;
    } else {
      c.camPos.lerp(desired.camPos, speed);
      c.camTarget.lerp(desired.camTarget, speed);
      c.cardPos.lerp(desired.cardPos, speed);
      c.cardQuat.slerp(desired.cardQuat, speed);
      c.bend = THREE.MathUtils.lerp(c.bend, desired.bend, speed);
      c.cardScale = THREE.MathUtils.lerp(c.cardScale, desired.cardScale, speed);
    }

    camera.position.copy(c.camPos);
    lookTarget.current.copy(c.camTarget);
    camera.lookAt(lookTarget.current);

    // Fit whole card on narrow/mobile canvases without changing desktop framing
    const { width: cw, height: ch } = sizeRef.current;
    const yawPad = s <= 0 ? 1.1 : s === 1 ? 1.06 : 1.04;
    const fit = maxCardScaleForView(c.camPos.y, camera.fov, cw, ch, yawPad);
    const drawnScale = Math.min(c.cardScale, fit);

    if (cardRef.current) {
      cardRef.current.position.copy(c.cardPos);
      cardRef.current.quaternion.copy(c.cardQuat);
      cardRef.current.scale.setScalar(drawnScale);
    }

    // Wood desk → plain panel: fade texture + swap clear color to --t100-paper
    bgMix.current.copy(bgWood.current).lerp(bgPlain.current, plain);
    scene.background = bgMix.current;
    gl.setClearColor(bgMix.current, 1);

    if (deskRef.current) {
      const deskMat = deskRef.current.material;
      if (deskMat) {
        deskMat.transparent = true;
        deskMat.opacity = deskVis;
        deskMat.depthWrite = deskVis > 0.15;
        deskMat.needsUpdate = true;
      }
      deskRef.current.visible = deskVis > 0.01;
    }

    if (shadowRef.current) {
      shadowRef.current.position.x = c.cardPos.x;
      shadowRef.current.position.z = c.cardPos.z;
      shadowRef.current.position.y = 0.0004;
      yawEuler.current.setFromQuaternion(c.cardQuat, 'YXZ');
      shadowRef.current.rotation.set(0, yawEuler.current.y, 0);
      shadowRef.current.scale.setScalar(drawnScale);
      shadowRef.current.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          obj.material.opacity = deskVis;
          obj.material.transparent = true;
        }
      });
      shadowRef.current.visible = deskVis > 0.02;
    }

    if (hemiRef.current) {
      hemiGroundMix.current
        .copy(hemiGroundWood.current)
        .lerp(hemiGroundPlain.current, plain);
      hemiRef.current.color.copy(hemiSky.current);
      hemiRef.current.groundColor.copy(hemiGroundMix.current);
      hemiRef.current.intensity = dark
        ? THREE.MathUtils.lerp(0.5, 0.35, plain)
        : THREE.MathUtils.lerp(0.4, 0.28, plain);
    }

    if (
      geoRef.current &&
      basePositionsRef.current &&
      Math.abs(c.bend - bendRef.current) > 0.0004
    ) {
      applyBend(geoRef.current, c.bend, basePositionsRef.current);
      bendRef.current = c.bend;
    }

    if (overlayMeshRef.current) {
      overlayMeshRef.current.visible = s === 2;
    }
  });

  const showRead = step === 2;
  // Always the clean cutout — step-grid.webp has baked OCR boxes that sit low/left
  const useGrid = false;

  return (
    <>
      <ambientLight intensity={isDark ? 0.55 : 0.78} />
      <directionalLight
        position={[0.8, 5.0, 1.2]}
        intensity={isDark ? 0.7 : 0.85}
      />
      <directionalLight
        position={[-1.6, 2.4, -0.8]}
        intensity={isDark ? 0.25 : 0.28}
      />
      <spotLight
        position={[0.05, 2.4, 0.55]}
        angle={0.55}
        penumbra={0.95}
        intensity={isDark ? 2.8 : 0.4}
        distance={14}
        castShadow={false}
        color={isDark ? '#ffd4b0' : '#fff6e8'}
      />
      <hemisphereLight
        ref={hemiRef}
        args={[
          isDark ? '#6a5644' : '#f5f0e6',
          isDark ? '#2e241c' : '#a89880',
          isDark ? 0.5 : 0.4,
        ]}
      />

      <Desk meshRef={deskRef} isDark={isDark} />
      <ContactShadow groupRef={shadowRef} />

      <ScorecardMesh
        groupRef={cardRef}
        geoRef={geoRef}
        basePositionsRef={basePositionsRef}
        overlayMeshRef={overlayMeshRef}
        litCount={litCount}
        showRead={showRead}
        useGrid={useGrid}
      />
    </>
  );
}

function T100IngestScene({
  step,
  cutProgress,
  litCount,
  isDark,
  reducedMotion,
}) {
  return (
    <Canvas
      className="t100-ig-canvas"
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ fov: 32, near: 0.05, far: 120, position: [0.05, 2.2, 0.9] }}
      frameloop="always"
    >
      <SceneRig
        step={step}
        cutProgress={cutProgress}
        litCount={litCount}
        isDark={isDark}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}

export default T100IngestScene;
