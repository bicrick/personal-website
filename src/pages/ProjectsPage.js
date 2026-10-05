import React, { useState } from 'react';
import TypewriterHeading from '../components/TypewriterHeading';
import ProjectTile from '../components/ProjectTile';
import ProjectTimeline from '../components/ProjectTimeline';
import { listedProjects } from '../constants/projects';

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
  const sortedProjects = listedProjects();

  return (
    <section
      id="projects"
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
          Outside of work I like to do a lot of hobby coding. Lately I have been using grok bot and agentic research loops to do RL training. More on{' '}
          <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">GitHub</a>.
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
