import React from 'react';
import TypewriterHeading from '../components/TypewriterHeading';
import CareerTimeline from '../components/CareerTimeline';

const JOBS = [
  {
    logo: `${process.env.PUBLIC_URL}/images/heb/heb-logo.png`,
    org: 'H-E-B',
    role: 'Data Engineer II',
    dates: 'Apr 2025 – present',
    href: '/heb',
  },
  {
    logo: `${process.env.PUBLIC_URL}/images/heb/heb-logo.png`,
    org: 'H-E-B',
    role: 'Data Engineer I',
    dates: 'Jun 2023 – Apr 2025',
    href: '/heb',
  },
  {
    logo: `${process.env.PUBLIC_URL}/images/career/open-lending.svg`,
    org: 'Open Lending',
    role: 'Software Engineering Intern',
    dates: 'May 2022 – Aug 2022',
    note: 'TypeScript ingest of dealership loan data on AWS.',
  },
  {
    logo: `${process.env.PUBLIC_URL}/images/career/datto.svg`,
    org: 'Datto',
    role: 'Cybersecurity Pentest Intern',
    dates: 'Summer 2021',
    note: 'Metasploit pentests on EC2 VMs, with automation scripts.',
  },
];

const EDUCATION = [
  {
    logo: `${process.env.PUBLIC_URL}/images/career/ut-austin.svg`,
    org: 'UT Austin',
    role: 'M.S. Artificial Intelligence',
    dates: 'Aug 2024 – Dec 2025',
    note: 'GPA 3.84',
    href: '/projects/ai-masters',
  },
  {
    logo: `${process.env.PUBLIC_URL}/images/career/ut-austin.svg`,
    org: 'UT Austin',
    role: 'B.S. Electrical and Computer Engineering',
    dates: 'May 2023',
    note: 'GPA 3.87. ECE with a senior-year turn toward ML.',
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
        <CareerTimeline items={JOBS} />
        <h3 className="career-section-label">education</h3>
        <CareerTimeline items={EDUCATION} />
      </div>
    </section>
  );
}
