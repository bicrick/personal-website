import React from 'react';
import HomePage from './HomePage';
import AboutPage from './AboutPage';
import ProjectsPage from './ProjectsPage';
import ContactPage from './ContactPage';
import ChapterBreak from '../components/ChapterBreak';
import ChapterAnchor from '../components/ChapterAnchor';
import useLandingSection from '../hooks/useLandingSection';
import { LandingNavContext } from '../hooks/landingNavContext';

export { useLandingNav } from '../hooks/landingNavContext';

export function LandingProvider({ children }) {
  const landing = useLandingSection();
  return (
    <LandingNavContext.Provider value={landing}>
      {children}
    </LandingNavContext.Provider>
  );
}

export function LandingSections() {
  return (
    <>
      <ChapterAnchor id="home" />
      <HomePage />
      <ChapterBreak />
      <ChapterAnchor id="about" />
      <AboutPage />
      <ChapterBreak />
      <ChapterAnchor id="projects" />
      <ProjectsPage />
      <ChapterBreak />
      <ChapterAnchor id="contact" />
      <ContactPage />
    </>
  );
}

export default function LandingPage() {
  return (
    <LandingProvider>
      <LandingSections />
    </LandingProvider>
  );
}
