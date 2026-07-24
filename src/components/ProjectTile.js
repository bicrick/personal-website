import React, { useEffect, useId, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ProjectTile.css';

export default function ProjectTile({
  project,
  isExpanded,
  onToggle,
  onCollapse,
}) {
  const cardRef = useRef(null);
  const panelId = useId();
  const hasApp = Boolean(project.appLink);
  const blogLink = project.blogLink || project.link;
  const blogIsExternal = Boolean(project.blogExternal || project.external);
  const appIsExternal = /^https?:\/\//i.test(project.appLink || '');

  useEffect(() => {
    if (!isExpanded) return undefined;

    const handlePointerDown = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        onCollapse();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCollapse();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, onCollapse]);

  const media = project.image ? (
    <img src={project.image} alt={project.title} width="1200" height="600" />
  ) : (
    <div className="project-card-placeholder" aria-hidden="true" />
  );

  const caption = (
    <div className="project-overlay">
      <div>
        {project.title}
        {' - '}
        {project.description}
      </div>
    </div>
  );

  if (!hasApp) {
    if (blogIsExternal) {
      return (
        <a
          href={blogLink}
          target="_blank"
          rel="noopener noreferrer"
          className="project-tile-link"
        >
          <div className="project-card">
            {media}
            {caption}
          </div>
        </a>
      );
    }

    return (
      <Link to={blogLink} className="project-tile-link">
        <div className="project-card">
          {media}
          {caption}
        </div>
      </Link>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`project-card project-card--choosable${isExpanded ? ' is-expanded' : ''}`}
    >
      <button
        type="button"
        className="project-card-trigger"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={() => onToggle()}
      >
        {media}
        {caption}
        <span className="visually-hidden">
          {isExpanded ? `Hide options for ${project.title}` : `Choose where to open ${project.title}`}
        </span>
      </button>

      <div
        id={panelId}
        className={`project-choice-panel${isExpanded ? ' is-open' : ''}`}
        aria-hidden={!isExpanded}
      >
        {appIsExternal ? (
          <a
            href={project.appLink}
            target="_blank"
            rel="noopener noreferrer"
            className="project-choice project-choice--app"
            tabIndex={isExpanded ? 0 : -1}
            onClick={onCollapse}
          >
            <span>app</span>
          </a>
        ) : (
          <Link
            to={project.appLink}
            className="project-choice project-choice--app"
            tabIndex={isExpanded ? 0 : -1}
            onClick={onCollapse}
          >
            <span>app</span>
          </Link>
        )}
        {blogIsExternal ? (
          <a
            href={blogLink}
            target="_blank"
            rel="noopener noreferrer"
            className="project-choice project-choice--blog"
            tabIndex={isExpanded ? 0 : -1}
            onClick={onCollapse}
          >
            <span>blog</span>
          </a>
        ) : (
          <Link
            to={blogLink}
            className="project-choice project-choice--blog"
            tabIndex={isExpanded ? 0 : -1}
            onClick={onCollapse}
          >
            <span>blog</span>
          </Link>
        )}
      </div>
    </div>
  );
}
