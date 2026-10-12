import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';
import Critter from '../components/project/harness/Critter';
import { ROSTER, harnessHref, cents } from '../components/project/harness/roster';
import '../components/project/harness';

export function HarnessIndex() {
  return (
    <ProjectDetail
      title="the five harnesses"
      date="October 2026"
      backHref="/writing/context-shaping"
      backLabel="same model, five harnesses"
      abstract="Same model inside each. One idea apiece, and what a fix cost."
    >
      <div className="hx-list">
        {ROSTER.map((h) => (
          <div key={h.id} className="hx-item">
            <Link to={harnessHref(h)}><Critter className="hx-critter" outfit={h.outfit} /></Link>
            <Link to={harnessHref(h)} className="hx-text"><span className="hx-name">{h.label}</span><span className="hx-line">{h.line}</span></Link>
            <span className="hx-num">{cents(h.usd)}<small>per fix</small></span>
            <a className="hx-visit" href={h.site} target="_blank" rel="noopener noreferrer" aria-label={`${h.label} official site`}>visit ↗</a>
          </div>
        ))}
      </div>
    </ProjectDetail>
  );
}

export function HarnessProfile() {
  const { slug } = useParams();
  const h = ROSTER.find((x) => x.slug === slug);
  if (!h) return <Navigate to="/writing/context-shaping/harnesses" replace />;
  return (
    <ProjectDetail
      title={h.label.toLowerCase()}
      date="October 2026"
      backHref="/writing/context-shaping/harnesses"
      backLabel="the five harnesses"
      abstract={h.line}
    >
      <Critter className="hx-hero" outfit={h.outfit} hop />
      <a className="hx-visit hx-profile-visit" href={h.site} target="_blank" rel="noopener noreferrer">visit {h.label} ↗</a>
      <div className="hx-stats">
        <div><b>{h.solved}/50</b><span>bugs fixed</span></div>
        <div><b>{cents(h.usd)}</b><span>cost per fix</span></div>
        <div><b>{Math.round(h.tok / 1000)}k</b><span>tokens per fix</span></div>
        <div><b>{h.min} min</b><span>time per fix</span></div>
      </div>
      <p className="hs-note">A fuller profile, with its tools and how it works a bug, is coming.</p>
    </ProjectDetail>
  );
}
