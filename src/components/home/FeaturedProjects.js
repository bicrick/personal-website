import React from 'react';
import { Link } from 'react-router-dom';
import { featuredProjects } from '../../constants/projects';
import QwopTilePreview from '../QwopTilePreview';
import HarnessTilePreview from '../HarnessTilePreview';
import TapestryTilePreview from '../TapestryTilePreview';
import { MonocleTilePreview } from '../project/monocle';
import { CartPoleTilePreview } from '../CartPoleEmbed';
import NotepadableTilePreview from '../notepadable-tile/NotepadableTilePreview';
import './FeaturedProjects.css';

function FeaturedMedia({ project }) {
  if (project.livePreview === 'tapestry') {
    return <TapestryTilePreview />;
  }
  if (project.livePreview === 'qwop') {
    return <QwopTilePreview />;
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
      <img
        src={project.image}
        alt=""
        className={project.imageFit === 'contain' ? 'is-contain' : undefined}
      />
    );
  }
  return null;
}

export default function FeaturedProjects() {
  const projects = featuredProjects();

  return (
    <section className="home-block" aria-label="featured projects">
      <div className="home-block-head">
        <h2>featured</h2>
        <Link to="/projects">all projects</Link>
      </div>
      <ul className="featured-list">
        {projects.map((project) => (
          <li key={project.blogLink}>
            <Link to={project.blogLink} className="featured-card">
              <div className="featured-media" aria-hidden="true">
                <FeaturedMedia project={project} />
              </div>
              <div className="featured-copy">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
