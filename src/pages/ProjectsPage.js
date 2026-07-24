import React, { useState } from 'react';
import ProjectTile from '../components/ProjectTile';

function SortDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const options = [
    { value: 'relevance', label: 'relevance' },
    { value: 'date', label: 'newest first' },
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
        <div className="sort-dropdown-menu" role="listbox" aria-label="sort projects">
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
  const [sortBy, setSortBy] = useState('relevance');
  const [expandedKey, setExpandedKey] = useState(null);

  const projects = [
    {
      title: 'notepadable',
      description: 'text editor encoded in the URL',
      image: `${process.env.PUBLIC_URL}/images/notepadable/notepadable-logo.png`,
      blogLink: '/projects/notepadable',
      appLink: 'https://notepadable.com',
      relevanceRank: 4,
      dateRank: 1,
    },
    {
      title: 'qwop-python',
      description: 'reinforcement learning gym environment for QWOP',
      image: `${process.env.PUBLIC_URL}/images/qwop-python/qwop-python-1200x600.png`,
      blogLink: '/projects/qwop-python',
      appLink: '/demos/qwop',
      appLabel: 'demo',
      relevanceRank: 1,
      dateRank: 2,
    },
    {
      title: 'gd-visualizer',
      description: 'compare optimizer performance in 3d',
      image: `${process.env.PUBLIC_URL}/images/gd-visualizer/gd-visualizer-1200x600.png`,
      blogLink: '/projects/gd-visualizer',
      appLink: 'https://gd.bicrick.com',
      relevanceRank: 2,
      dateRank: 3,
    },
    {
      title: 'artificial intelligence masters',
      description: 'coursework and takeaways',
      image: `${process.env.PUBLIC_URL}/images/ai-masters/ut-msai-1200x600.png`,
      blogLink: '/projects/ai-masters',
      relevanceRank: 3,
      dateRank: 5,
    },
    {
      title: 'docprep',
      description: 'msoffice plaintext extractor',
      image: `${process.env.PUBLIC_URL}/images/docprep/docprep-1200x600.png`,
      blogLink: '/projects/docprep',
      appLink: 'https://docprep.site',
      relevanceRank: 5,
      dateRank: 4,
    },
  ];

  const sortedProjects = [...projects].sort((a, b) => (
    sortBy === 'date'
      ? a.dateRank - b.dateRank
      : a.relevanceRank - b.relevanceRank
  ));

  return (
    <section className="page-section" aria-label="projects">
      <div className="page-section-inner">
        <div className="projects-header-row">
          <h2 className="projects-heading">selected projects</h2>
          <div className="projects-sort">
            <span>sort</span>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>
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
        <hr className="separator projects-separator" />
        <p>
          to see other work{' '}
          <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">click here</a>
        </p>
      </div>
    </section>
  );
}
