import React from 'react';
import HomePage from './HomePage';
import AboutPage from './AboutPage';
import ProjectsPage from './ProjectsPage';
import ContactPage from './ContactPage';
import ChapterBreak from '../components/ChapterBreak';
import ChapterStage from '../components/ChapterStage';
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
      <ChapterStage><HomePage /></ChapterStage>
      <ChapterBreak />
      <ChapterStage><AboutPage /></ChapterStage>
      <ChapterBreak />
      <ChapterStage><ProjectsPage /></ChapterStage>
      <ChapterBreak />
      <ChapterStage><ContactPage /></ChapterStage>
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
