import React from 'react';
import TypewriterHeading from '../components/TypewriterHeading';
import CareerTimeline from '../components/CareerTimeline';

const CAREER = [
  {
    image: `${process.env.PUBLIC_URL}/images/heb/heb-logo.png`,
    fit: 'contain',
    title: 'H-E-B · Data Engineer II',
    date: 'April 2025 – present',
    bullets: [
      'Kafka event bus across Composer, Argo, and Databricks.',
      'Dependency service for cross-platform lineage.',
      'Owned delivery end to end; mentored junior engineers.',
    ],
    href: '/heb',
  },
  {
    image: `${process.env.PUBLIC_URL}/images/heb/heb-logo.png`,
    fit: 'contain',
    title: 'H-E-B · Data Engineer I',
    date: 'June 2023 – April 2025',
    bullets: [
      'Full-stack product (React, FastAPI) used by 10+ teams.',
      'Confluence RAG assistant, before Atlassian shipped Rovo.',
    ],
    href: '/heb',
  },
  {
    image: `${process.env.PUBLIC_URL}/images/career/ut-austin.svg`,
    fit: 'contain',
    title: 'UT Austin · M.S. Artificial Intelligence',
    date: 'GPA 3.84 · Aug 2024 – Dec 2025',
    description: 'Transformers, QLoRA, and RL built from scratch.',
    href: '/projects/ai-masters',
  },
  {
    image: `${process.env.PUBLIC_URL}/images/career/ut-austin.svg`,
    fit: 'contain',
    title: 'UT Austin · B.S. Electrical and Computer Eng.',
    date: 'GPA 3.87 · May 2023',
    description: 'ECE with a senior-year turn toward ML.',
  },
  {
    image: `${process.env.PUBLIC_URL}/images/career/open-lending.svg`,
    fit: 'contain',
    title: 'Open Lending · Software Engineering Intern',
    date: 'May 2022 – Aug 2022',
    description: 'TypeScript ingest of dealership loan data on AWS.',
  },
  {
    image: `${process.env.PUBLIC_URL}/images/career/datto.svg`,
    fit: 'contain',
    title: 'Datto · Cybersecurity Pentest Intern',
    date: 'Summer 2021',
    description: 'Metasploit pentests on EC2 VMs, with automation scripts.',
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
          Data Engineer II at H-E-B. Computer engineering and an AI master&apos;s at UT Austin.
        </p>
        <CareerTimeline items={CAREER} />
      </div>
    </section>
  );
}
