import React from 'react';
import ProjectDetail from '../components/ProjectDetail';

function FightingBalls() {
  return (
    <ProjectDetail title="fighting balls">
      <img 
        src={`${process.env.PUBLIC_URL}/images/fighting-balls/fighting-balls-1200x600.png`} 
        alt="Fighting Balls" 
        style={{ width: '100%', marginBottom: '2rem' }}
      />
      
      <h1>/ Fighting Balls</h1>
      
      <p>
        A physics-based simulation where colorful balls battle it out in an arena. Watch them collide, bounce, and compete for dominance. It's oddly mesmerizing.
      </p>

      <h2>/ the concept</h2>
      
      <p>
        Sometimes you just want to watch things bounce around and interact. Fighting Balls is a simple physics simulation with emergent behavior - each ball follows basic rules, but the interactions create complex and entertaining dynamics.
      </p>

      <h2>/ how it works</h2>
      
      <h3>physics engine</h3>
      
      <p>
        Built with a custom 2D physics engine that handles:
      </p>

      <ul>
        <li>Elastic collisions between balls</li>
        <li>Boundary collisions with the arena walls</li>
        <li>Velocity and acceleration calculations</li>
        <li>Energy transfer during impacts</li>
      </ul>

      <h3>battle mechanics</h3>
      
      <p>
        Each ball has properties that affect the simulation:
      </p>

      <ul>
        <li>Mass - affects momentum and collision outcomes</li>
        <li>Velocity - determines movement speed and impact force</li>
        <li>Size - larger balls have more mass but move slower</li>
        <li>Color - purely aesthetic but helps track individuals</li>
      </ul>

      <h2>/ implementation details</h2>
      
      <p>
        The simulation runs in the browser using HTML5 Canvas for rendering. The physics calculations happen in JavaScript with requestAnimationFrame for smooth 60 FPS animation.
      </p>

      <h3>optimization challenges</h3>
      
      <p>
        With many balls on screen, collision detection becomes expensive. I implemented spatial partitioning to avoid checking every ball against every other ball, significantly improving performance.
      </p>

      <h2>/ why i built this</h2>
      
      <p>
        This project started as a way to learn canvas rendering and physics simulation. It evolved into an exploration of emergent behavior and optimization techniques.
      </p>

      <p>
        Plus, it's genuinely fun to watch. Sometimes that's reason enough.
      </p>

      <h2>/ features</h2>
      
      <ul>
        <li>Adjustable number of balls</li>
        <li>Variable ball sizes and masses</li>
        <li>Configurable arena size</li>
        <li>Pause and reset controls</li>
        <li>FPS counter for performance monitoring</li>
      </ul>

      <p>
        <a href="https://bicrick.github.io/fighting-balls/" target="_blank" rel="noopener noreferrer">Watch the balls fight!</a>
      </p>
    </ProjectDetail>
  );
}

export default FightingBalls;
