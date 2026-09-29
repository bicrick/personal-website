import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SEO from './SEO';
import StructuredData from './StructuredData';
import LandingNavBar from './LandingNavBar';
import SiteNav from './SiteNav';
import { getPageSeo, normalizePagePath } from '../constants/pages';

export default function SiteLayout() {
  const { pathname } = useLocation();
  const seo = getPageSeo(normalizePagePath(pathname));

  return (
    <div className="App_mainContainer landing-page">
      <SEO {...seo} />
      <StructuredData />
      <LandingNavBar>
        <SiteNav />
      </LandingNavBar>
      <main className="App_mainColumn landing">
        <Outlet />
      </main>
    </div>
  );
}
