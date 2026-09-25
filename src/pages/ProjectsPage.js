import React, { useState } from 'react';
import TypewriterHeading from '../components/TypewriterHeading';
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
      title: 'experimenting with auto research',
      description: 'agentic loops on cart-pole and pendulums',
      timelineDescription:
        'Agentic loops on cart-pole. PPO, then the double pendulum, then MPPI in the browser.',
      livePreview: 'cartpole',
      blogLink: '/projects/auto-research',
      appLink: 'https://cart-pole-autoresearch.vercel.app/#triple',
      appLabel: 'demo',
      relevanceRank: 2,
      dateRank: 1,
      date: 'September 2026',
    },
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
      dateRank: 3,
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
      relevanceRank: 6,
      dateRank: 4,
      date: 'March 2026',
    },
    {
      title: 'qwop-python',
      description: 'QWOP gym in pure Python + grok bot',
      timelineDescription:
        'A QWOP gym written in pure Python, used with an autonomous grok bot research loop to achieve a world record of 45.167 seconds.',
      livePreview: 'qwop',
      blogLink: '/projects/qwop-python',
      appLink: '/demos/qwop',
      appLabel: 'demo',
      relevanceRank: 3,
      dateRank: 2,
      date: 'September 2026',
    },
    {
      title: 'gd-visualizer',
      description: 'compare optimizer performance in 3d',
      timelineDescription:
        'A 3D race track for gradient descent. Compare Batch, Momentum, Adam, and SGD on the same loss landscape.',
      image: `${process.env.PUBLIC_URL}/images/gd-visualizer/testing-it.gif`,
      blogLink: '/projects/gd-visualizer',
      appLink: 'https://gd.bicrick.com',
      relevanceRank: 4,
      dateRank: 5,
      date: 'November 2025',
    },
    {
      title: 'artificial intelligence masters',
      description: 'coursework and takeaways',
      timelineDescription:
        'Notes and takeaways from the UT Austin MSAI program. Coursework highlights across the degree.',
      image: `${process.env.PUBLIC_URL}/images/ai-masters/ut-water.gif`,
      blogLink: '/projects/ai-masters',
      relevanceRank: 5,
      dateRank: 7,
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
      relevanceRank: 7,
      dateRank: 6,
      date: 'December 2025',
    },
  ];

  const sortedProjects = [...projects].sort((a, b) => (
    isTimeline
      ? a.dateRank - b.dateRank
      : a.relevanceRank - b.relevanceRank
  ));

  return (
    <section
      id="projects"
      data-chapter="projects"
      className="page-section"
      aria-label="projects"
    >
      <div className="page-section-inner">
        <div className="projects-header-row">
          <TypewriterHeading as="h2" className="projects-heading">
            selected projects
          </TypewriterHeading>
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
