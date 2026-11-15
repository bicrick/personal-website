import React from 'react';
import { Link } from 'react-router-dom';
import QwopTilePreview from './QwopTilePreview';
import HarnessTilePreview from './HarnessTilePreview';
import TapestryTilePreview from './TapestryTilePreview';
import { MonocleTilePreview } from './project/monocle';
import { CartPoleTilePreview } from './CartPoleEmbed';
import NotepadableTilePreview from './notepadable-tile/NotepadableTilePreview';
import './ProjectTile.css';

function ProjectMedia({ project }) {
  if (project.livePreview === 'tapestry') {
    return <TapestryTilePreview />;
  }
  if (project.livePreview === 'qwop') {
    return <QwopTilePreview title={project.title} />;
  }
  if (project.livePreview === 'harness') {
    return <HarnessTilePreview />;
  }
  if (project.livePreview === 'monocle') {
    return <MonocleTilePreview />;
  }
  if (project.livePreview === 'cartpole') {
    return <CartPoleTilePreview />;
  }
  if (project.livePreview === 'notepadable') {
    return <NotepadableTilePreview />;
  }
  if (project.video) {
    return (
      <span className="project-card-theme-media" aria-hidden="true">
        <video
          className="project-card-theme-light"
          src={project.video}
          poster={project.poster || project.image}
          width="768"
          height="432"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <video
          className="project-card-theme-dark"
          src={project.videoDark || project.video}
          poster={project.posterDark || project.poster || project.image}
          width="768"
          height="432"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </span>
    );
  }
  if (project.image) {
    return (
      <img src={project.image} alt={project.title} width="1200" height="600" />
    );
  }
  return <div className="project-card-placeholder" aria-hidden="true" />;
}

export default function ProjectTile({ project }) {
  const blogLink = project.blogLink || project.link;
  const blogIsExternal = Boolean(project.blogExternal || project.external);
  const fitContain = project.imageFit === 'contain';
  const className = `project-card project-tile-link${fitContain ? ' project-card--contain' : ''}`;

  const media = <ProjectMedia project={project} />;

  if (blogIsExternal) {
    return (
      <a
        href={blogLink}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={project.title}
      >
        {media}
      </a>
    );
  }

  return (
    <Link to={blogLink} className={className} aria-label={project.title}>
      {media}
    </Link>
  );
}
