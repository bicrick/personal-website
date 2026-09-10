import React from 'react';

/**
 * Responsive 16:9 YouTube embed for project writeups.
 */
function ProjectYoutubeEmbed({ videoId, title, caption }) {
  return (
    <figure className="project-figure project-youtube">
      <div className="project-youtube-stage">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export default ProjectYoutubeEmbed;
