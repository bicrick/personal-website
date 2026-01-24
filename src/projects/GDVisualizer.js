import React from 'react';
import ProjectDetail from '../components/ProjectDetail';

function GDVisualizer() {
  return (
    <ProjectDetail title="gd-visualizer">
      <img 
        src={`${process.env.PUBLIC_URL}/images/gd-visualizer/gd-visualizer-1200x600.png`} 
        alt="GD Visualizer" 
        style={{ width: '100%', marginBottom: '2rem' }}
      />
      
      <h1>/ Gradient Descent Visualizer</h1>
      
      <p>
        An interactive 3D visualization tool for comparing optimizer performance across different loss landscapes. Built to make optimization algorithms intuitive and observable.
      </p>

      <h2>/ the idea</h2>
      
      <p>
        Understanding how optimizers behave is crucial for machine learning practitioners, but it's hard to develop intuition from numbers alone. I wanted to see the optimizers in action, watch them navigate complex landscapes, and compare their paths side by side.
      </p>

      <h2>/ features</h2>
      
      <h3>multiple test functions</h3>
      
      <p>
        The visualizer includes several classic optimization test functions:
      </p>

      <ul>
        <li>Rosenbrock's Valley - tests performance in narrow curved valleys</li>
        <li>Rastrigin Function - highly multimodal with many local minima</li>
        <li>Ackley Function - nearly flat outer region with central peak</li>
        <li>Sphere Function - simple convex baseline</li>
        <li>Beale Function - tests handling of narrow valleys</li>
      </ul>

      <h3>optimizer comparison</h3>
      
      <p>
        Run multiple optimizers simultaneously and watch them compete:
      </p>

      <ul>
        <li>Stochastic Gradient Descent (SGD)</li>
        <li>SGD with Momentum</li>
        <li>Adam</li>
        <li>RMSprop</li>
        <li>Ballistic GD (custom optimizer)</li>
      </ul>

      <h2>/ technical implementation</h2>
      
      <p>
        Built with Three.js for 3D rendering and React for the UI. The optimization algorithms run in real-time, with configurable learning rates, momentum parameters, and starting positions.
      </p>

      <h3>visualization techniques</h3>
      
      <ul>
        <li>3D surface rendering of loss landscapes</li>
        <li>Animated optimizer trajectories</li>
        <li>Color-coded paths for each optimizer</li>
        <li>Interactive camera controls</li>
        <li>Real-time loss value tracking</li>
      </ul>

      <h2>/ what i learned</h2>
      
      <p>
        Building this visualizer gave me deep insights into optimizer behavior. You can see how momentum helps escape shallow local minima, how Adam adapts its step size, and where each optimizer struggles.
      </p>

      <p>
        It's one thing to read about these algorithms; it's another to watch them navigate a treacherous landscape in real-time.
      </p>

      <h2>/ use cases</h2>
      
      <ul>
        <li>Educational tool for understanding optimization</li>
        <li>Testing custom optimizer implementations</li>
        <li>Developing intuition for hyperparameter tuning</li>
        <li>Demonstrating optimizer behavior to others</li>
      </ul>

      <p>
        <a href="https://github.com/bicrick/gd-visualizer" target="_blank" rel="noopener noreferrer">View on GitHub</a>
      </p>
    </ProjectDetail>
  );
}

export default GDVisualizer;
