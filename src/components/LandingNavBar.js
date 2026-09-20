import React from 'react';

export default function LandingNavBar({ children }) {
  return (
    <header className="App_header landing-nav">
      <div className="App_mainColumn landing-nav-inner">
        {children}
      </div>
    </header>
  );
}
