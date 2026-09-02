import React, { useState } from 'react';
import ProjectTile from '../components/ProjectTile';
import ProjectTimeline from '../components/ProjectTimeline';

const SHOW_PROJECT_VIEW_SELECTOR = false;

function getDefaultView() {
  if (!SHOW_PROJECT_VIEW_SELECTOR) {
    return 'timeline';
  }
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'timeline';
  }
  return window.matchMedia('(max-width: 800px)').matches ? 'tiles' : 'timeline';
}

function ViewDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const options = [
    { value: 'timeline', label: 'timeline' },
    { value: 'tiles', label: 'tiles' },
  ];
  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div
      className="sort-dropdown"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="sort-dropdown-button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{selectedOption.label}</span>
        <span className="sort-dropdown-caret" aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="sort-dropdown-menu" role="listbox" aria-label="view projects">
          {options.filter((option) => option.value !== value).map((option) => (
            <button
              key={option.value}
              type="button"
              className={`sort-dropdown-option${option.value === value ? ' active' : ''}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState(getDefaultView);
  const [expandedKey, setExpandedKey] = useState(null);
  const isTimeline = viewMode === 'timeline';

  const projects = [
    {
      title: 'range rat',
      description: 'golf incremental video game, built with agents',
      timelineDescription:
        'A golf incremental video game built with coding agents. Godot gameplay plus gen-ai sprites and music.',
      image: `${process.env.PUBLIC_URL}/images/golf-incremental/range-rat-preview.gif`,
      blogLink: '/projects/golf-incremental',
      appLink: 'https://golf.bicrick.com',
      appLabel: 'play',
      relevanceRank: 1,
      dateRank: 1,
      date: 'August 2026',
    },
    {
      title: 'notepadable',
      description: 'text editor encoded in the URL',
      timelineDescription:
        'A minimalist text editor that encodes the whole document into the URL. Share a link, share the doc.',
      image: `${process.env.PUBLIC_URL}/images/notepadable/notepadable-header.gif`,
      imageFit: 'contain',
      blogLink: '/projects/notepadable',
      appLink: 'https://notepadable.com',
      relevanceRank: 5,
      dateRank: 2,
      date: 'March 2026',
    },
    {
      title: 'qwop-python',
      description: 'reinforcement learning gym environment for QWOP',
      timelineDescription:
        'A highly performant reinforcement learning gym for QWOP. Train RL agents in a highly parallelized fashion.',
      image: `${process.env.PUBLIC_URL}/images/qwop-python/qwop-python-25-35.gif`,
      blogLink: '/projects/qwop-python',
      appLink: '/demos/qwop',
      appLabel: 'demo',
      relevanceRank: 2,
      dateRank: 3,
      date: 'February 2026',
    },
    {
      title: 'gd-visualizer',
      description: 'compare optimizer performance in 3d',
      timelineDescription:
        'A 3D race track for gradient descent. Compare Batch, Momentum, Adam, and SGD on the same loss landscape.',
      image: `${process.env.PUBLIC_URL}/images/gd-visualizer/testing-it.gif`,
      blogLink: '/projects/gd-visualizer',
      appLink: 'https://gd.bicrick.com',
      relevanceRank: 3,
      dateRank: 4,
      date: 'November 2025',
    },
    {
      title: 'artificial intelligence masters',
      description: 'coursework and takeaways',
      timelineDescription:
        'Notes and takeaways from the UT Austin MSAI program. Coursework highlights across the degree.',
      image: `${process.env.PUBLIC_URL}/images/ai-masters/ut-water.gif`,
      blogLink: '/projects/ai-masters',
      relevanceRank: 4,
      dateRank: 6,
      date: 'Fall 2024 – Fall 2025',
    },
    {
      title: 'docprep',
      description: 'msoffice plaintext extractor',
      timelineDescription:
        'Extract clean plaintext from Microsoft Office docs. Built for feeding documents into LLM workflows.',
      image: `${process.env.PUBLIC_URL}/images/docprep/docprep-extract.gif`,
      blogLink: '/projects/docprep',
      appLink: 'https://docprep.site',
      relevanceRank: 6,
      dateRank: 5,
      date: 'December 2025',
    },
  ];

  const sortedProjects = [...projects].sort((a, b) => (
    isTimeline
      ? a.dateRank - b.dateRank
      : a.relevanceRank - b.relevanceRank
  ));

  return (
    <section className="page-section" aria-label="projects">
      <div className="page-section-inner">
        <div className="projects-header-row">
          <h2 className="projects-heading">selected projects</h2>
          {SHOW_PROJECT_VIEW_SELECTOR ? (
            <div className="projects-sort">
              <span>view</span>
              <ViewDropdown value={viewMode} onChange={setViewMode} />
            </div>
          ) : null}
        </div>
        <p className="projects-intro">
          These are some of the projects I am proud of. I have much more on my{' '}
          <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
        {isTimeline ? (
          <ProjectTimeline
            projects={sortedProjects}
            expandedKey={expandedKey}
            onToggle={(key) => {
              setExpandedKey((current) => (current === key ? null : key));
            }}
            onCollapse={() => setExpandedKey(null)}
          />
        ) : (
          <div className="projects-grid">
            {sortedProjects.map((project) => {
              const key = project.blogLink || project.link || project.title;
              return (
                <ProjectTile
                  key={key}
                  project={project}
                  isExpanded={expandedKey === key}
                  onToggle={() => {
                    setExpandedKey((current) => (current === key ? null : key));
                  }}
                  onCollapse={() => setExpandedKey(null)}
                />
              );
            })}
          </div>
        )}
        <hr className="separator projects-separator" />
        <p>
          to see other work{' '}
          <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">click here</a>
        </p>
      </div>
    </section>
  );
}
