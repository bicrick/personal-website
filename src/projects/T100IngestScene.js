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

const PHOTO = {
  // Phone held above the desk — full sheet above the plane (no desk intersection)
  camPos: new THREE.Vector3(0.2, 2.5, 2.7),
  camTarget: new THREE.Vector3(0.0, 0.5, 0),
  cardPos: new THREE.Vector3(0, 0.78, 0),
  cardRot: new THREE.Euler(-34 * DEG, 16 * DEG, -2 * DEG),
  bend: 0.65,
  desk: 1,
  cardScale: 1.0,
};

const FLAT = {
  camPos: new THREE.Vector3(0, 0, 2.85),
  camTarget: new THREE.Vector3(0, 0, 0),
  cardPos: new THREE.Vector3(0, 0.02, 0),
  cardRot: new THREE.Euler(0, 0, 0),
  bend: 0,
  desk: 0,
  cardScale: 1.12,
};

function lerpPose(a, b, t) {
  // three.js signature is smoothstep(x, min, max)
  const k = THREE.MathUtils.smoothstep(t, 0, 1);
  return {
    camPos: a.camPos.clone().lerp(b.camPos, k),
    camTarget: a.camTarget.clone().lerp(b.camTarget, k),
    cardPos: a.cardPos.clone().lerp(b.cardPos, k),
    cardRot: new THREE.Euler(
      THREE.MathUtils.lerp(a.cardRot.x, b.cardRot.x, k),
      THREE.MathUtils.lerp(a.cardRot.y, b.cardRot.y, k),
      THREE.MathUtils.lerp(a.cardRot.z, b.cardRot.z, k),
    ),
    bend: THREE.MathUtils.lerp(a.bend, b.bend, k),
    desk: THREE.MathUtils.lerp(a.desk, b.desk, k),
    cardScale: THREE.MathUtils.lerp(a.cardScale, b.cardScale, k),
  };
}

function poseForStep(step, cutProgress) {
  if (step <= 0) return PHOTO;
  if (step === 1) return lerpPose(PHOTO, FLAT, cutProgress);
  return FLAT;
}

function makeDeskTexture(isDark) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const base = isDark ? '#2c2722' : '#cbb79a';
  const grain = isDark ? '#3a342e' : '#b9a486';
  const stripe = isDark ? '#221e1a' : '#d6c4a8';
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 3) {
    const wobble = Math.sin(y * 0.07) * 8;
    ctx.fillStyle = y % 9 === 0 ? stripe : grain;
    ctx.globalAlpha = isDark ? 0.18 : 0.22;
    ctx.fillRect(0, y, size, 1);
    ctx.globalAlpha = isDark ? 0.08 : 0.1;
    ctx.fillRect(wobble, y, size, 1);
  }
  for (let i = 0; i < 900; i += 1) {
    ctx.globalAlpha = isDark ? 0.04 : 0.05;
    ctx.fillStyle = isDark ? '#000' : '#8a7355';
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.2, 1.2);
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function applyBend(geometry, bend, basePositions) {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = basePositions[i * 3];
    const y = basePositions[i * 3 + 1];
    const nx = x / (CARD_W * 0.5);
    const ny = y / (CARD_H * 0.5);
    // Mild paper lift at the near edge — keeps the face readable
    const curl =
      bend *
      (0.028 * Math.sin((nx * 0.5 + 0.5) * Math.PI) +
        0.042 * Math.max(0, -ny) * Math.max(0, -ny) +
        0.01 * Math.sin((ny * 0.5 + 0.5) * Math.PI));
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
      const x = box.x * canvas.width;
      const y = box.y * canvas.height;
      const w = box.w * canvas.width;
      const h = box.h * canvas.height;
      const r = 3;
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
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    if (litCount > 0) {
      paint(META.nameBox, 'rgba(59,130,184,0.95)', null);
    }
    META.cells.forEach((cell, idx) => {
      if (litCount > idx) {
        paint(cell, 'rgba(201,162,39,0.9)', 'rgba(245,215,110,0.32)');
        ctx.fillStyle = '#1a1408';
        ctx.font = '650 13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          String(cell.value),
          (cell.x + cell.w / 2) * canvas.width,
          (cell.y + cell.h / 2) * canvas.height,
        );
      }
    });
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
  const geo = useMemo(() => new THREE.PlaneGeometry(CARD_W, CARD_H, 48, 24), []);
  const basePositions = useMemo(() => {
    const arr = new Float32Array(geo.attributes.position.array.length);
    arr.set(geo.attributes.position.array);
    return arr;
  }, [geo]);

  useEffect(() => {
    geoRef.current = geo;
    basePositionsRef.current = basePositions;
  }, [geo, basePositions, geoRef, basePositionsRef]);

  useEffect(() => () => geo.dispose(), [geo]);

  const textures = useTexture({
    front: CARD_TEXTURE,
    grid: CARD_GRID_TEXTURE,
  });

  useEffect(() => {
    Object.values(textures).forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
  }, [textures]);

  const overlay = useReadOverlayTexture(litCount, showRead);

  return (
    <group ref={groupRef}>
      <mesh geometry={geo}>
        <meshStandardMaterial
          map={useGrid ? textures.grid : textures.front}
          roughness={0.78}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={overlayMeshRef} position={[0, 0, 0.004]} visible={showRead}>
        <planeGeometry args={[CARD_W, CARD_H]} />
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

function Desk({ meshRef, isDark }) {
  const tex = useMemo(() => makeDeskTexture(isDark), [isDark]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial
        map={tex}
        roughness={0.92}
        metalness={0.02}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

function makeBlobShadowTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.08,
    size / 2,
    size / 2,
    size * 0.48,
  );
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.45, 'rgba(0,0,0,0.22)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function BlobShadow({ groupRef }) {
  const tex = useMemo(() => makeBlobShadowTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group ref={groupRef} position={[0.05, 0.002, 0.02]}>
      <mesh rotation={[-Math.PI / 2, 0, 0.15]} scale={[2.6, 1.35, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={tex}
          transparent
          depthWrite={false}
          toneMapped={false}
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
  const { camera, gl, scene, invalidate } = useThree();
  const cardRef = useRef();
  const deskRef = useRef();
  const shadowRef = useRef();
  const geoRef = useRef();
  const basePositionsRef = useRef();
  const overlayMeshRef = useRef();
  const bendRef = useRef(-1);
  const lookTarget = useRef(PHOTO.camTarget.clone());

  const state = useRef({
    camPos: PHOTO.camPos.clone(),
    camTarget: PHOTO.camTarget.clone(),
    cardPos: PHOTO.cardPos.clone(),
    cardRot: PHOTO.cardRot.clone(),
    bend: PHOTO.bend,
    desk: PHOTO.desk,
    cardScale: PHOTO.cardScale,
  });

  const drivers = useRef({ step, cutProgress, reducedMotion });
  drivers.current = { step, cutProgress, reducedMotion };

  useEffect(() => {
    scene.background = new THREE.Color(isDark ? '#121212' : '#eceae4');
    gl.setClearColor(isDark ? '#121212' : '#eceae4', 1);
    invalidate();
  }, [isDark, gl, scene, invalidate]);

  useEffect(() => {
    invalidate();
  }, [step, cutProgress, litCount, reducedMotion, invalidate]);

  useFrame((_, dt) => {
    const { step: s, cutProgress: cp, reducedMotion: rm } = drivers.current;
    const desired = poseForStep(s, cp);
    const speed = rm ? 1 : Math.min(1, dt * (s === 1 ? 1.55 : 2.5));
    const c = state.current;
    if (rm) {
      c.camPos.copy(desired.camPos);
      c.camTarget.copy(desired.camTarget);
      c.cardPos.copy(desired.cardPos);
      c.cardRot.copy(desired.cardRot);
      c.bend = desired.bend;
      c.desk = desired.desk;
      c.cardScale = desired.cardScale;
    } else {
      c.camPos.lerp(desired.camPos, speed);
      c.camTarget.lerp(desired.camTarget, speed);
      c.cardPos.lerp(desired.cardPos, speed);
      c.cardRot.x = THREE.MathUtils.lerp(c.cardRot.x, desired.cardRot.x, speed);
      c.cardRot.y = THREE.MathUtils.lerp(c.cardRot.y, desired.cardRot.y, speed);
      c.cardRot.z = THREE.MathUtils.lerp(c.cardRot.z, desired.cardRot.z, speed);
      c.bend = THREE.MathUtils.lerp(c.bend, desired.bend, speed);
      c.desk = THREE.MathUtils.lerp(c.desk, desired.desk, speed);
      c.cardScale = THREE.MathUtils.lerp(c.cardScale, desired.cardScale, speed);
    }

    camera.position.copy(c.camPos);
    lookTarget.current.copy(c.camTarget);
    camera.lookAt(lookTarget.current);

    if (cardRef.current) {
      cardRef.current.position.copy(c.cardPos);
      cardRef.current.rotation.set(c.cardRot.x, c.cardRot.y, c.cardRot.z);
      cardRef.current.scale.setScalar(c.cardScale);
    }

    if (deskRef.current) {
      deskRef.current.visible = c.desk > 0.01;
      const mat = deskRef.current.material;
      if (mat) mat.opacity = c.desk;
    }

    if (shadowRef.current) {
      shadowRef.current.visible = c.desk > 0.05;
      shadowRef.current.scale.setScalar(0.85 + 0.2 * c.desk);
      const shadowMat = shadowRef.current.children?.[0]?.material;
      if (shadowMat) shadowMat.opacity = c.desk;
    }

    if (
      geoRef.current &&
      basePositionsRef.current &&
      Math.abs(c.bend - bendRef.current) > 0.0008
    ) {
      applyBend(geoRef.current, c.bend, basePositionsRef.current);
      bendRef.current = c.bend;
    }

    if (overlayMeshRef.current) {
      overlayMeshRef.current.visible = s === 2;
    }
  });

  const showRead = step === 2;
  const useGrid = step === 2;

  return (
    <>
      <ambientLight intensity={isDark ? 0.42 : 0.62} />
      <directionalLight
        position={[2.4, 4.2, 2.2]}
        intensity={isDark ? 0.95 : 1.15}
      />
      <directionalLight
        position={[-2.2, 1.4, -1.5]}
        intensity={isDark ? 0.25 : 0.35}
      />
      <hemisphereLight
        args={[
          isDark ? '#3a3a40' : '#f5f0e6',
          isDark ? '#0c0c0c' : '#a89880',
          0.45,
        ]}
      />

      <Desk meshRef={deskRef} isDark={isDark} />
      <BlobShadow groupRef={shadowRef} />

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
      camera={{ fov: 38, near: 0.1, far: 40, position: [0.35, 2.55, 2.35] }}
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
