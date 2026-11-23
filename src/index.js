import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './fonts.css';
import './theme.css';
import './index.css';
import 'katex/dist/katex.min.css';
import App from './App';

// Mark iframes once their page has loaded (load doesn't bubble, so capture).
// index.css keeps unloaded iframes transparent to avoid a white flash.
document.addEventListener(
  'load',
  (e) => {
    if (e.target instanceof HTMLIFrameElement) {
      e.target.setAttribute('data-loaded', '');
    }
  },
  true
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
