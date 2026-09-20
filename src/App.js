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
import ThemeToggle from './components/ThemeToggle';
import ScrollToTop from './components/ScrollToTop';

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
        {/* SiteLayout owns continuous landing content; child routes are path markers only */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={null} />
          <Route path="/about" element={null} />
          <Route path="/projects" element={null} />
          <Route path="/contact" element={null} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
