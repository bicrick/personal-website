import React from 'react';
import ProjectDetail from '../components/ProjectDetail';

function BallisticGD() {
  return (
    <ProjectDetail title="ballistic optimizer research">
      <img 
        src={`${process.env.PUBLIC_URL}/images/ballistic-gd/ballistic-gd-1200x600.png`} 
        alt="Ballistic Gradient Descent" 
        style={{ width: '100%', marginBottom: '2rem' }}
      />
      
      <h1>/ Ballistic Gradient Descent</h1>
      
      <p>
        Research into novel optimization methods that could potentially rival or surpass Adam and SGD. This project explores momentum-based optimization with a physics-inspired approach.
      </p>

      <h2>/ the motivation</h2>
      
      <p>
        Gradient descent optimizers are fundamental to training neural networks. While Adam and SGD have dominated the field for years, there's always room for improvement. I was curious: what if we approached optimization from a different angle?
      </p>

      <h2>/ the concept</h2>
      
      <p>
        Ballistic Gradient Descent takes inspiration from projectile motion in physics. Instead of treating optimization as a simple downhill walk, we model it as a ballistic trajectory where the gradient provides acceleration rather than velocity.
      </p>

      <h3>key ideas</h3>
      
      <ul>
        <li>Momentum accumulation based on ballistic physics</li>
        <li>Adaptive learning rates that respond to curvature</li>
        <li>Natural handling of saddle points through inertia</li>
        <li>Reduced hyperparameter sensitivity</li>
      </ul>

      <h2>/ implementation</h2>
      
      <p>
        The optimizer is implemented in PyTorch and tested on standard benchmark problems. Initial results show promising convergence characteristics, particularly on non-convex landscapes with many saddle points.
      </p>

      <h2>/ experiments</h2>
      
      <p>
        I tested Ballistic GD against Adam and SGD on several tasks:
      </p>

      <ul>
        <li>Standard test functions (Rosenbrock, Rastrigin, etc.)</li>
        <li>Small neural network training (MNIST, CIFAR-10)</li>
        <li>Comparison of convergence speed and stability</li>
      </ul>

      <h2>/ results</h2>
      
      <p>
        While Ballistic GD shows interesting properties, it's not a universal replacement for Adam. However, it performs notably well in certain scenarios, particularly when the loss landscape has complex topology.
      </p>

      <p>
        This research demonstrates that there's still room for innovation in optimization methods, and physics-inspired approaches can offer fresh perspectives.
      </p>

      <p>
        <a href="https://github.com/bicrick/ballistic-gd" target="_blank" rel="noopener noreferrer">View on GitHub</a>
      </p>
    </ProjectDetail>
  );
}

export default BallisticGD;
