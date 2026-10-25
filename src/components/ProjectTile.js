import React, { useEffect, useId, useRef } from 'react';
import { Link } from 'react-router-dom';
import QwopTilePreview from './QwopTilePreview';
import HarnessTilePreview from './HarnessTilePreview';
import TapestryTilePreview from './TapestryTilePreview';
import { MonocleTilePreview } from './project/monocle';
import { CartPoleTilePreview } from './CartPoleEmbed';
import NotepadableTilePreview from './notepadable-tile/NotepadableTilePreview';
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
  hideMeta = false,
}) {
  const cardRef = useRef(null);
  const panelId = useId();
  const fineHover = useFineHover();
  const hasApp = Boolean(project.appLink);
  const hasRepo = Boolean(project.repoLink);
  const appLabel = project.appLabel || 'app';
  const blogLink = project.blogLink || project.link;
  const blogIsExternal = Boolean(project.blogExternal || project.external);
  const appIsExternal = /^https?:\/\//i.test(project.appLink || '');
  const repoIsExternal = /^https?:\/\//i.test(project.repoLink || '');
  const hoverChoices = [
    hasApp ? appLabel : null,
    hasRepo ? 'repo' : null,
    'blog',
  ].filter(Boolean);
  const hoverChoiceLabel = hoverChoices.length > 2
    ? `${hoverChoices.slice(0, -1).join(', ')}, and ${hoverChoices[hoverChoices.length - 1]}`
    : hoverChoices.join(' and ');
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

  const media = project.livePreview === 'tapestry' ? (
    <TapestryTilePreview />
  ) : project.livePreview === 'qwop' ? (
    <QwopTilePreview title={project.title} />
  ) : project.livePreview === 'harness' ? (
    <HarnessTilePreview />
  ) : project.livePreview === 'monocle' ? (
    <MonocleTilePreview />
  ) : project.livePreview === 'cartpole' ? (
    <CartPoleTilePreview />
  ) : project.livePreview === 'notepadable' ? (
    <NotepadableTilePreview />
  ) : project.image ? (
    <img src={project.image} alt={project.title} width="1200" height="600" />
  ) : (
    <div className="project-card-placeholder" aria-hidden="true" />
  );
  const fitContain = project.imageFit === 'contain';

  return (
    <div
      ref={cardRef}
      className={`project-card project-card--choosable${hasApp ? '' : ' project-card--blog-only'}${panelOpen ? ' is-expanded' : ''}${fineHover ? ' is-hoverable' : ''}${fitContain ? ' project-card--contain' : ''}`}
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
            ? `${project.title}. Hover for ${hoverChoiceLabel} options.`
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
        <div className={`project-choice-row${hasRepo ? ' has-repo' : ''}`}>
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
          {hasRepo && (
            <ChoiceLink
              to={project.repoLink}
              external={repoIsExternal}
              className="project-choice project-choice--repo"
              tabIndex={choiceTabIndex}
              onClick={onCollapse}
            >
              <span>repo</span>
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
        {!hideMeta && (
          <ProjectMeta title={project.title} description={project.description} />
        )}
      </div>
    </div>
  );
}
