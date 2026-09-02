import React from 'react';
import { Link } from 'react-router-dom';
import ProjectTile from './ProjectTile';
import './ProjectTimeline.css';

function TimelineCopy({ project }) {
  const blogLink = project.blogLink || project.link;
  const external = Boolean(project.blogExternal || project.external);
  const body = (
    <>
      <h3 className="project-timeline-title">{project.title}</h3>
      {project.date ? (
        <p className="project-timeline-date">{project.date}</p>
      ) : null}
      {(project.timelineDescription || project.description) ? (
        <p className="project-timeline-desc">
          {project.timelineDescription || project.description}
        </p>
      ) : null}
    </>
  );

  if (external) {
    return (
      <a
        href={blogLink}
        target="_blank"
        rel="noopener noreferrer"
        className="project-timeline-copy-link"
      >
        {body}
      </a>
    );
  }

  return (
    <Link to={blogLink} className="project-timeline-copy-link">
      {body}
    </Link>
  );
}

export default function ProjectTimeline({
  projects,
  expandedKey,
  onToggle,
  onCollapse,
}) {
  return (
    <div className="project-timeline">
      {projects.map((project, index) => {
        const key = project.blogLink || project.link || project.title;
        const flipped = index % 2 === 1;

        return (
          <article
            key={key}
            className={`project-timeline-row${flipped ? ' is-flip' : ''}`}
          >
            <div className="project-timeline-media">
              <ProjectTile
                project={project}
                isExpanded={expandedKey === key}
                onToggle={() => onToggle(key)}
                onCollapse={onCollapse}
                hideMeta
              />
            </div>
            <div className="project-timeline-spine" aria-hidden="true">
              <span className="project-timeline-node" />
              <span className="project-timeline-connector" />
            </div>
            <div className="project-timeline-copy">
              <TimelineCopy project={project} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
