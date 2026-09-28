import React from 'react';
import TypewriterHeading from '../components/TypewriterHeading';
import CareerTimeline from '../components/CareerTimeline';

const CAREER = [
  {
    image: `${process.env.PUBLIC_URL}/images/ai-masters/ut-water.gif`,
    title: 'university of texas at austin',
    date: 'B.S. Computer Engineering, M.S. Artificial Intelligence',
    description: 'ECE, then the MSAI. Classical ML through transformers, compression, and reinforcement learning.',
    href: '/projects/ai-masters',
  },
  {
    image: `${process.env.PUBLIC_URL}/images/heb/heb-logo.png`,
    fit: 'contain',
    title: 'data engineering',
    date: 'H-E-B, 2023 – present',
    description: 'The control room for data engineering at H-E-B, from the first AWS dashboard through the move to GCP.',
    href: '/heb',
  },
];

export default function CareerPage() {
  return (
    <section
      id="career"
      className="page-section career-page"
      aria-label="career"
    >
      <div className="page-section-inner">
        <TypewriterHeading as="h2" className="projects-heading">
          career
        </TypewriterHeading>
        <p className="projects-intro">
          Computer engineering and the AI masters at UT Austin, then data engineering at H-E-B.
        </p>
        <CareerTimeline items={CAREER} />
      </div>
    </section>
  );
}
