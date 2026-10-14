import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { featuredProjects } from '../../constants/projects';
import QwopTilePreview from '../QwopTilePreview';
import HarnessTilePreview from '../HarnessTilePreview';
import TapestryTilePreview, { THUMB_VARIANTS } from '../TapestryTilePreview';
import { CartPoleTilePreview } from '../CartPoleEmbed';
import './FeaturedProjects.css';

function FeaturedMedia({ project, tapestryThumb }) {
  if (project.livePreview === 'tapestry') {
    return <TapestryTilePreview variant={tapestryThumb || project.tapestryThumb || 'a'} />;
  }
  if (project.livePreview === 'qwop') {
    return <QwopTilePreview />;
  }
  if (project.livePreview === 'harness') {
    return <HarnessTilePreview />;
  }
  if (project.livePreview === 'cartpole') {
    return <CartPoleTilePreview />;
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
  const [params] = useSearchParams();
  const thumbParam = (params.get('thumb') || '').toLowerCase();
  const tapestryThumb = THUMB_VARIANTS.includes(thumbParam) ? thumbParam : undefined;

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
                <FeaturedMedia project={project} tapestryThumb={tapestryThumb} />
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
