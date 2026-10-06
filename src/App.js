import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './App.css';
import Docprep from './projects/Docprep';
import QwopPython from './projects/QwopPython';
import QwopReplay from './demos/QwopReplay';
import GDVisualizer from './projects/GDVisualizer';
import AIMasters from './projects/AIMasters';
import Notepadable from './projects/Notepadable';
import GolfIncremental from './projects/GolfIncremental';
import AutoResearch from './projects/AutoResearch';
import Heb from './projects/Heb';
import Monocle from './projects/Monocle';
import Tracebench from './projects/Tracebench';
import AgentResearchLoops from './projects/AgentResearchLoops';
import SiteLayout from './components/SiteLayout';
import ThemeToggle from './components/ThemeToggle';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import CareerPage from './pages/CareerPage';
import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <>
      <ThemeToggle />
      <ScrollToTop />
      <Routes>
        <Route path="/projects/docprep" element={<Docprep />} />
        <Route path="/projects/qwop-python" element={<QwopPython />} />
        <Route path="/demos/qwop" element={<QwopReplay />} />
        <Route path="/projects/ai-masters" element={<AIMasters />} />
        <Route path="/projects/gd-visualizer" element={<GDVisualizer />} />
        <Route path="/projects/notepadable" element={<Notepadable />} />
        <Route path="/projects/golf-incremental" element={<GolfIncremental />} />
        <Route path="/projects/auto-research" element={<AutoResearch />} />
        <Route path="/projects/monocle" element={<Monocle />} />
        <Route path="/projects/tracebench" element={<Tracebench />} />
        <Route path="/writing/agent-research-loops" element={<AgentResearchLoops />} />
        <Route path="/projects/agent-research-loops" element={<Navigate to="/writing/agent-research-loops" replace />} />
        <Route path="/heb" element={<Heb />} />
        <Route path="/build" element={<Navigate to="/about" replace />} />
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
