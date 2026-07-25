import React, { useEffect, useId, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ProjectTile.css';

function useFineHover() {
  const [fineHover, setFineHover] = React.useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onChange = () => setFineHover(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return fineHover;
}

function ProjectMeta({ title, description }) {
  return (
    <div className="project-choice-meta">
      <span className="project-choice-meta-title">{title}</span>
      {description ? (
        <span className="project-choice-meta-desc"> — {description}</span>
      ) : null}
    </div>
  );
}

function ChoiceLink({
  to,
  external,
  className,
  tabIndex,
  onClick,
  children,
}) {
  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        tabIndex={tabIndex}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className} tabIndex={tabIndex} onClick={onClick}>
      {children}
    </Link>
  );
}

export default function ProjectTile({
  project,
  isExpanded,
  onToggle,
  onCollapse,
}) {
  const cardRef = useRef(null);
  const panelId = useId();
  const fineHover = useFineHover();
  const hasApp = Boolean(project.appLink);
  const appLabel = project.appLabel || 'app';
  const blogLink = project.blogLink || project.link;
  const blogIsExternal = Boolean(project.blogExternal || project.external);
  const appIsExternal = /^https?:\/\//i.test(project.appLink || '');
  const panelOpen = fineHover ? false : isExpanded;
  const choiceTabIndex = fineHover || isExpanded ? 0 : -1;

  useEffect(() => {
    if (!isExpanded || fineHover) return undefined;

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
  }, [isExpanded, onCollapse, fineHover]);

  const media = project.image ? (
    <img src={project.image} alt={project.title} width="1200" height="600" />
  ) : (
    <div className="project-card-placeholder" aria-hidden="true" />
  );

  return (
    <div
      ref={cardRef}
      className={`project-card project-card--choosable${hasApp ? '' : ' project-card--blog-only'}${panelOpen ? ' is-expanded' : ''}${fineHover ? ' is-hoverable' : ''}`}
      onMouseLeave={fineHover ? onCollapse : undefined}
    >
      <button
        type="button"
        className="project-card-trigger"
        aria-expanded={fineHover ? undefined : isExpanded}
        aria-controls={fineHover ? undefined : panelId}
        aria-haspopup={fineHover ? undefined : 'true'}
        tabIndex={fineHover ? -1 : 0}
        onClick={() => {
          if (!fineHover) onToggle();
        }}
      >
        {media}
        <span className="visually-hidden">
          {fineHover
            ? `${project.title}. Hover for ${hasApp ? `${appLabel} and blog` : 'blog'} options.`
            : isExpanded
              ? `Hide options for ${project.title}`
              : `Choose where to open ${project.title}`}
        </span>
      </button>

      <div
        id={panelId}
        className={`project-choice-panel${panelOpen ? ' is-open' : ''}`}
        aria-hidden={fineHover ? undefined : !isExpanded}
      >
        <div className="project-choice-row">
          {hasApp && (
            <ChoiceLink
              to={project.appLink}
              external={appIsExternal}
              className="project-choice project-choice--app"
              tabIndex={choiceTabIndex}
              onClick={onCollapse}
            >
              <span>{appLabel}</span>
            </ChoiceLink>
          )}
          <ChoiceLink
            to={blogLink}
            external={blogIsExternal}
            className={`project-choice project-choice--blog${hasApp ? '' : ' project-choice--solo'}`}
            tabIndex={choiceTabIndex}
            onClick={onCollapse}
          >
            <span>blog</span>
          </ChoiceLink>
        </div>
        <ProjectMeta title={project.title} description={project.description} />
      </div>
    </div>
  );
}
