import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import PrivacyPolicy from './PrivacyPolicy';

function Home() {
  return (
    <div className="container">
      <header>
        <img src={`${process.env.PUBLIC_URL}/casual_logo.png`} alt="Patrick Brown" className="profile-pic" />
        <div className="header-content">
          <h1>Patrick Brown</h1>
          <p className="subtitle">
            Data Engineer II at <a href="https://www.heb.com/" target="_blank" rel="noopener noreferrer">H-E-B</a> • Based in Austin, TX
          </p>
          <p className="subtitle">
            MS Artificial Intelligence Fall '25<br />
            BS Computer Engineering '23<br />
            <a href="https://www.utexas.edu/" target="_blank" rel="noopener noreferrer">University of Texas at Austin</a>
          </p>
          <div className="social-links">
            <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/patrick-brown-470617195/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://x.com/patrickbbrown" target="_blank" rel="noopener noreferrer" aria-label="X">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </header>

      <hr />

      <section>
        <h2>About</h2>
        <p>
          I thrive on diving into new challenges and novel tech stacks. Part of being a great engineer is learning on the fly, and I'm a self-starter who can quickly pick up new skills.
        </p>
      </section>

      <hr />

      <section>
        <h2>Experience</h2>
        <p>
          Proficient in both GCP and AWS cloud platforms.
        </p>
        <p>
          Built full ETL pipelines using Kafka, Spark, and Databricks. Designed workflows with complex job dependencies, cron schedules, and conditional triggers.
        </p>
        <p>
          Built the full-stack Data Engineering Dashboard using React, FastAPI, Python, Docker, and PostgreSQL. Onboarded 10+ Data Engineering teams. The dashboard tracks ETL metadata including SLAs, run history, cost metrics, and stale jobs across multiple platforms like Databricks, Argo, and Informatica.
        </p>
        <p>
          Leverage AI tools like <a href="https://cursor.com" target="_blank" rel="noopener noreferrer">Cursor</a> to prototype faster, debug more efficiently, and ship quality code quickly.
        </p>
      </section>

      <hr />

      <section>
        <h2>University of Texas AI Masters - <a href="https://cdso.utexas.edu/msai" target="_blank" rel="noopener noreferrer">See Program</a></h2>
        <p>
          The rapid pace of AI innovation caught my attention. I completed my AI master's at UT Austin while working full-time. I learned the full lifecycle from dataset curation to model training to inference optimization. This made me a more complete engineer. I can now bridge traditional data engineering with modern AI systems and build end-to-end solutions.
        </p>
      </section>

      <hr />

      <section>
        <h2>Projects</h2>
        
        <div className="project">
          <h3 className="docprep-logo">docprep</h3>
          <p>Extract clean text from PDFs, Word, Excel, and PowerPoint files to make documents AI-ready.</p>
          <p>
            <a href="https://docprep.site" target="_blank" rel="noopener noreferrer">Visit Site</a>
          </p>
        </div>

        <div className="project">
          <h3>Ballistic Optimizer Research</h3>
          <p>Experimental research creating and benchmarking novel optimization algorithms. Designed physics-inspired optimizers including Ballistic Gradient Descent and compared performance against SGD, Adam, and other standard optimizers on MNIST and CIFAR-10.</p>
          <p>
            <a href="https://github.com/bicrick/ballistic-gd" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </div>

        <div className="project">
          <h3>Gradient Descent Visualizer</h3>
          <p>A visualization tool for various gradient based optimization algorithms.</p>
          <p>
            <a href="https://github.com/bicrick/gd-visualizer" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </div>

        <div className="project-more">
          <p>⋮</p>
          <p>
            <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">Click here for full list of projects</a>
          </p>
        </div>
      </section>


      <section>
        <h2>Games</h2>
        <p>I like to tinker and code up games that me and my friends can play.</p>
        <ul>
          <li>
            <strong>Multiplayer Backgammon</strong> — <a href="https://multiplayer-backgammon.vercel.app/" target="_blank" rel="noopener noreferrer">Play</a> • <a href="https://github.com/bicrick/multiplayer-backgammon" target="_blank" rel="noopener noreferrer">GitHub</a>
          </li>
          <li>
            <strong>Multiplayer Connect 4</strong> — <a href="https://multiplayer-connect-4-xi.vercel.app/" target="_blank" rel="noopener noreferrer">Play</a> • <a href="https://github.com/bicrick/multiplayer-connect-4" target="_blank" rel="noopener noreferrer">GitHub</a>
          </li>
          <li>
            <strong>Fighting Balls</strong> — <a href="https://bicrick.github.io/fighting-balls/" target="_blank" rel="noopener noreferrer">Play</a> • <a href="https://github.com/bicrick/fighting-balls" target="_blank" rel="noopener noreferrer">GitHub</a>
          </li>
        </ul>
      </section>

      <hr />

      <section>
        <h2>Hobbies</h2>
        <p>
          I am a serial hobbyist. I love precision-based games like golf, billiards, darts, disc-golf, tennis, and pickleball. I also enjoy video games (Minecraft, Factorio, Rainbow Six Siege, Fortnite). I am a big college football fan. I prefer guac over queso.
        </p>
      </section>

      <hr />

      <section>
        <h2>Contact</h2>
        <p>
          <strong>Personal:</strong> <a href="mailto:patrickbrownai@gmail.com">patrickbrownai@gmail.com</a>
        </p>
        <p>
          <strong>Work:</strong> <a href="mailto:patrickbrown@heb.com">patrickbrown@heb.com</a>
        </p>
      </section>

      <footer>
        <p>© 2025 Patrick Brown • <Link to="/privacy">Privacy Policy</Link></p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;
