import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LADDER, MINI_REPO, demoTokensForLevel } from '../data';
import useReducedMotion from '../../useReducedMotion';
import './Demo.css';

const STEP_MS = 1400;
const HOLD_FULL_MS = 2800;
const FINAL_IDX = LADDER.length - 1;

function fileChunk(file, levelId) {
  if (levelId === 'L0') return null;
  if (levelId === 'L1') {
    return file.imports.length ? file.imports.join('\n') : null;
  }
  if (levelId === 'L2') {
    const lines = [...file.imports, file.signature].filter(Boolean);
    return lines.length ? lines.join('\n') : null;
  }
  if (levelId === 'L3') {
    const lines = [...file.imports, file.signature, file.docstring].filter(Boolean);
    return lines.length ? lines.join('\n') : null;
  }
  return file.body;
}

function renderLadderView(levelId) {
  if (levelId === 'L0') {
    return MINI_REPO.files.map((f) => f.path).join('\n');
  }
  return MINI_REPO.files
    .map((f) => {
      const chunk = fileChunk(f, levelId);
      if (!chunk) return null;
      return `# ${f.path}\n${chunk}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

export default function SkeletonDemo() {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [idx, setIdx] = useState(reduce ? FINAL_IDX : 0);
  const [tick, setTick] = useState(0);

  const level = LADDER[idx];
  const tokens = demoTokensForLevel(level.id);
  const view = useMemo(() => renderLadderView(level.id), [level.id]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce) {
      setIdx(FINAL_IDX);
      return undefined;
    }
    if (!inView) return undefined;

    const delay = idx === FINAL_IDX ? HOLD_FULL_MS : STEP_MS;
    const id = window.setTimeout(() => {
      setIdx((prev) => (prev >= FINAL_IDX ? 0 : prev + 1));
      setTick((t) => t + 1);
    }, delay);
    return () => window.clearTimeout(id);
  }, [inView, idx, reduce]);

  useEffect(() => {
    if (reduce) setIdx(FINAL_IDX);
  }, [reduce]);

  const tokenPct = Math.min(100, (tokens / 620) * 100);
  const sweetSpot = level.id === 'L1';

  return (
    <figure className="cs-demo" ref={rootRef}>
      <div className="cs-demo-panel">
        <div className="cs-demo-head">
          <p className="cs-demo-kicker">Skeletonization ladder</p>
          <span className="cs-demo-badge">{MINI_REPO.label}</span>
        </div>

        <div className="cs-ladder-rail" aria-hidden="true">
          {LADDER.map((l, i) => (
            <span
              key={l.id}
              className={`cs-ladder-step${i === idx ? ' is-on' : ''}${i < idx ? ' is-done' : ''}`}
            >
              {l.short}
            </span>
          ))}
        </div>

        <div className="cs-demo-stats" aria-live="polite">
          <span className="cs-stat">
            level <strong>{level.id}</strong>
          </span>
          <span className={`cs-stat${sweetSpot ? ' is-accent' : ''}`}>
            pass <strong>{level.pass}%</strong>
          </span>
          <span className="cs-stat">
            demo tokens <strong>~{tokens}</strong>
          </span>
          {sweetSpot ? (
            <span className="cs-stat is-accent">
              <strong>first real gain</strong>
            </span>
          ) : null}
          {level.id === 'full' ? (
            <span className="cs-stat">
              <strong>+tokens, little gain</strong>
            </span>
          ) : null}
        </div>

        <div className="cs-demo-split cs-demo-split--ladder">
          <ul className="cs-file-list cs-file-list--static" aria-label="mini repo files">
            {MINI_REPO.files.map((f) => (
              <li key={f.path}>
                <span className={level.id === 'L0' || f.imports.length || f.signature || f.body ? 'is-in' : ''}>
                  {f.path.split('/').pop()}
                </span>
              </li>
            ))}
          </ul>
          <pre
            key={`${level.id}-${tick}`}
            className={`cs-code cs-code--morph${reduce ? '' : ' is-anim'}`}
            aria-live="polite"
          >
            {view}
          </pre>
        </div>

        <div
          className={`cs-token-bar${sweetSpot || level.pass >= 61 ? ' is-hot' : ''}`}
          aria-hidden="true"
        >
          <span style={{ width: `${tokenPct}%` }} />
        </div>
      </div>
      <figcaption>
        The model needs structure (imports / signatures), not every line — past the first level,
        more detail mostly adds tokens. Pass rates from the study; token counts and mini-repo are
        a simplified illustration.
      </figcaption>
    </figure>
  );
}
