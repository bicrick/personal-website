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
import SiteLayout from './components/SiteLayout';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/projects/docprep" element={<Docprep />} />
        <Route path="/projects/qwop-python" element={<QwopPython />} />
        <Route path="/demos/qwop" element={<QwopReplay />} />
        <Route path="/projects/ai-masters" element={<AIMasters />} />
        <Route path="/projects/gd-visualizer" element={<GDVisualizer />} />
        <Route path="/projects/notepadable" element={<Notepadable />} />
        <Route path="/projects/golf-incremental" element={<GolfIncremental />} />
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
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
