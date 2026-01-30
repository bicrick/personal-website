import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

function GDVisualizer() {
  return (
    <ProjectDetail 
      title="gd-visualizer"
      seoTitle="GD Visualizer - 3D Gradient Descent Optimizer Tool by bicrick"
      seoDescription="GD Visualizer by bicrick (Patrick Brown) - Interactive 3D tool to compare optimizer performance (SGD, Adam, Momentum) across different loss landscapes. Built with Three.js and React."
      seoKeywords="bicrick, Patrick Brown, gradient descent, optimizer, visualization, 3D, SGD, Adam, machine learning, Three.js"
      seoUrl="https://bicrick.com/projects/gd-visualizer"
      seoImage="https://bicrick.com/images/gd-visualizer/gd-visualizer-1200x600.png"
    >
      <img 
        src={`${process.env.PUBLIC_URL}/images/gd-visualizer/gd-visualizer-1200x600.png`} 
        alt="GD Visualizer" 
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '2rem', fontSize: '0.9rem', textAlign: 'center' }}>
        A 3D visualization tool for understanding how optimizers navigate loss landscapes
      </p>
      
      <h2>/ how it started</h2>
      
      <p>
        I saw this video of a cheese rolling contest in Britain where people chase a wheel of cheese down a steep hill. I was studying optimizers at the time in my master's program, and it got me thinking about how different optimizers use physical analogues to reach the bottom of a loss landscape. But more specifically, it got me thinking about a wheel rolling down a hill and how that's different from a ball or sliding object.
      </p>

      <div style={{ width: '100%', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <iframe 
          width="100%" 
          height="600" 
          src="https://www.youtube.com/embed/I7_ttSQw62A" 
          title="Cheese Rolling Contest" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          style={{ maxWidth: '100%' }}
        />
      </div>

      <p>
        Gradient descent with momentum, for example, can escape local minima by having enough speed to get over little hills and bumps. That physical intuition stuck with me. I started thinking about a wheel-based optimizer. When a wheel spins fast, it resists turning. That gyroscopic stability could help maintain direction through small perturbations in a loss landscape. But I needed a way to test this intuition without actually implementing it in a neural network and running it on CIFAR10 or MNIST.
      </p>

      <p>
        So I built a visualizer where I could test new optimizer ideas on parametrizable 3D loss landscapes to see if they'd even be viable before committing to a full implementation.
      </p>

      <h2>/ the real problem</h2>
      
      <p>
        Most people don't realize that gradient descent is very close to physical analogues. Seeing it this way gives you a real understanding of what's actually happening inside the computer when we're optimizing.
      </p>

      <p>
        It also makes understanding local minima pretty plain to see. Some optimizers get stuck easily. Some run really quickly but are more prone to getting trapped. Some go slow and are computationally heavy but tend to find better solutions. Without visualization, these trade-offs are just abstract concepts.
      </p>

      <h2>/ the solution</h2>
      
      <p>
        The visualizer renders a 3D topology, like the Gaussian Wells example where you can adjust the parameters to change the landscape. Instead of actually running gradient descent on a real ML model, we simulate it as if this was a real loss landscape.
      </p>

      <p>
        In real ML, we don't actually know what the loss landscape looks like. That's precisely why we're optimizing. Otherwise we could just go to the bottom instantly. But this visualizes it in a way that makes intuitive sense. You can see the terrain, watch multiple optimizers race down the same hill, and understand why they end up in different places.
      </p>

      <h2>/ building it</h2>
      
      <p>
        I went with Three.js for the 3D rendering and React for the UI. There's a Python backend that handles all the trajectory computation. The architecture is straightforward. The backend calculates the optimizer paths, passes them to the frontend, and Three.js renders everything in real-time.
      </p>

      <p>
        I'm still adding more optimizers and topologies, but the core is solid. You can select a starting position, run multiple optimizers simultaneously, and watch them navigate the same landscape. The tool currently focuses on two highly parametrizable loss landscapes: Gaussian Wells and Ackley. Gaussian Wells lets you adjust the global scale, well width, well depth, and number of wells. Ackley lets you tune the amplitude, decay rate, frequency, and vertical scale. This parametrization creates diverse test environments - you can vary the depth of local minima, how many there are, and where they're placed to systematically test optimizer behavior.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1 }}>
          <img 
            src={`${process.env.PUBLIC_URL}/images/gd-visualizer/gaussian-well.png`} 
            alt="Gaussian Wells" 
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
          <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
            Gaussian Wells: adjustable depth, width, and number of local minima
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <img 
            src={`${process.env.PUBLIC_URL}/images/gd-visualizer/ackley.png`} 
            alt="Ackley Function" 
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
          <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
            Ackley: highly corrugated surface with deep central minimum
          </p>
        </div>
      </div>

      <p>
        To test new optimizer ideas, I first needed solid baselines. I implemented four standard optimizers: Batch Gradient Descent, Momentum GD, Adam, and Stochastic Gradient Descent (SGD). Batch GD is the vanilla version. It computes gradients over the full dataset and updates parameters. Momentum GD adds velocity accumulation, which helps it push through small hills and escape shallow local minima. Adam uses adaptive learning rates with running averages of both gradients and squared gradients, making it more sophisticated in how it adjusts step sizes. SGD updates after each sample or mini-batch, giving it more frequent updates and typically faster convergence than batch methods. These four give you a good spread of approaches, from simple to adaptive, from batch to stochastic.
      </p>

      <h2>/ testing it</h2>

      <img 
        src={`${process.env.PUBLIC_URL}/images/gd-visualizer/testing-it.gif`} 
        alt="Testing Four Base Optimizers" 
        style={{ width: '100%', marginTop: '1.5rem', marginBottom: '0.5rem' }}
      />
      <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '2rem', fontSize: '0.9rem', textAlign: 'center' }}>
        Comparing Batch GD, Momentum GD, Adam, and SGD on Gaussian Wells
      </p>

      <p>
        I ran all four optimizers from the same starting position on a Gaussian Wells landscape to see how their different mechanics would affect where they ended up. The results were revealing. Same start, same landscape, four completely different destinations.
      </p>

      <p>
        Batch GD and SGD both converged to the same local minimum in the center. The key difference was speed. SGD got there significantly faster. This makes sense because SGD updates parameters after each mini-batch rather than waiting for the full dataset, giving it many more optimization steps in the same amount of computation. Batch GD is more stable but slower.
      </p>

      <p>
        Momentum GD took a completely different path. It built up enough velocity to carry past the central minimum and landed in a local minimum on the opposite side. This is momentum doing exactly what it's designed to do. The accumulated velocity let it push through the shallow barriers that stopped the other optimizers. The downside is it overshot the central solution entirely.
      </p>

      <p>
        Adam ended up in yet another location, off to the left side of the landscape. This happened because Adam computes adaptive learning rates per parameter. It maintains running averages of both gradients and squared gradients, then divides by the square root of the second moment. This means the x and y dimensions get scaled differently based on their gradient history. Even starting from the same point, Adam takes steps with different proportions in each direction compared to the other optimizers, leading it to explore a different basin entirely.
      </p>

      <p>
        This is why I built the visualizer. Same starting point, same loss landscape, four different final solutions. Optimizer choice isn't just about speed. It fundamentally affects which solution you find. Being able to see this happen in real-time makes the abstract concrete. You can watch the exact moment when momentum carries an optimizer past a minimum, or when Adam's adaptive rates steer it in a different direction.
      </p>

      <h2>/ wheel optimizer mechanics</h2>

      <p>
        Now that I have the basic optimizers working I wanted to start working on my own optimizer. The wheel optimizer implements that rolling wheel physics I wanted to test from the start. A wheel doesn't just slide down a hill. It rolls, and that distinction matters. When a wheel is spinning fast, it has gyroscopic stability that resists turning. The faster it spins, the more it wants to maintain its current trajectory.
      </p>

      <p>
        Standard momentum-based gradient descent is like a ball rolling down a hill. The gradient pushes the velocity directly, and the ball follows the slope. But a wheel is different. Try to turn a fast-spinning wheel, and it resists. This gyroscopic effect means the wheel maintains its trajectory through small perturbations in the landscape, exactly what you want when trying to avoid getting trapped in shallow local minima.
      </p>

      <p>
        The wheel optimizer models this behavior. Instead of just tracking velocity like momentum-based methods, it tracks two things: velocity vector <InlineMath math="\mathbf{v}" /> (direction and speed) and angular momentum <InlineMath math="L" /> (how fast the wheel is spinning). The gradient gets decomposed into two components:
      </p>

      <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
        <li><strong>Parallel component</strong> (along the direction of movement): affects how fast the wheel spins</li>
        <li><strong>Perpendicular component</strong> (across the direction of movement): tries to turn the wheel</li>
      </ul>

      <p>
        The key insight is the gyroscopic resistance. When the wheel is spinning, the perpendicular component of the gradient has to fight against this resistance to change direction. The resistance formula is <InlineMath math="R = I(1 + L)" />, where <InlineMath math="I" /> is the moment of inertia. Higher angular momentum means more resistance to turning.
      </p>

      <p>
        The update rules are:
      </p>

      <div style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
        <BlockMath math="L_{\text{new}} = \beta L + g_{\parallel}" />
        <BlockMath math="\Delta \hat{\mathbf{v}} = \frac{\mathbf{g}_{\perp}}{R}" />
        <BlockMath math="\text{speed} = \frac{L}{I}" />
      </div>

      <p style={{ marginLeft: '2rem', fontSize: '0.9rem', color: '#555' }}>
        Where <InlineMath math="L" /> is angular momentum, <InlineMath math="\beta" /> is momentum decay, <InlineMath math="g_{\parallel}" /> is the gradient component parallel to velocity, <InlineMath math="g_{\perp}" /> is the gradient component perpendicular to velocity, <InlineMath math="\hat{\mathbf{v}}" /> is the velocity direction, <InlineMath math="R = I(1 + L)" /> is gyroscopic resistance, and <InlineMath math="I" /> is moment of inertia.
      </p>

      <p>
        The parameters are similar to standard momentum: <InlineMath math="\beta" /> controls momentum decay (default 0.95), <InlineMath math="I" /> controls how much inertia the wheel has (default 1.0), and learning rate <InlineMath math="\alpha" /> sets the step size. The rolling constraint couples the spin speed to the wheel's velocity - faster spin means faster movement.
      </p>

      <p>
        The visualizer also lets you tune hyperparameters. Learning rate controls how aggressively the optimizer steps. Too high and it overshoots, too low and it barely moves. Beta (momentum decay) determines how quickly the wheel loses its spin. Higher values mean the wheel maintains momentum longer, which helps escape shallow minima but can cause more orbiting around the final solution. Moment of inertia is the most interesting parameter. Low values make the wheel light and responsive, turning easily with the gradient. High values make it heavy and stable, resisting directional changes even when the gradient shifts dramatically. This is where the gyroscopic effect really shines. Crank up the moment of inertia and watch the wheel barrel through local minima that would trap lighter optimizers.
      </p>

      <p>
        You can also control convergence behavior. Run until convergence mode stops when the gradient magnitude drops below a threshold (default 1e-4), which is useful for comparing how quickly different optimizers actually reach a minimum. Or set a fixed iteration count if you want to see long-term behavior. Max iterations caps the run to prevent infinite loops when an optimizer gets stuck orbiting.
      </p>

      <h2>/ wheel optimizer results</h2>

      <img 
        src={`${process.env.PUBLIC_URL}/images/gd-visualizer/loop.gif`} 
        alt="Wheel Optimizer Spiral" 
        style={{ width: '100%', marginTop: '1.5rem', marginBottom: '0.5rem' }}
      />
      <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '2rem', fontSize: '0.9rem', textAlign: 'center' }}>
        Wheel optimizer spiraling around the local minima (learning rate: 0.001, β: 0.98, I: 10.0)
      </p>

      <p>
        The results are interesting. You may have noticed the sharp turns at the beginning of the animation above. This happens when the optimizer runs out of spin from fighting the gradient. The wheel almost comes to a complete stop, at which point the gradient overtakes it and the wheel can turn very sharply. Once it builds momentum again in a new direction, the gyroscopic effect kicks back in.
      </p>

      <p>
        One thing worth clarifying about the physics model: unlike a real wheel that would fall down due to gravity, this wheel is essentially glued to the topology. It stays on the loss surface with gravity only acting through the differentials. The gradient provides the directional force along the surface itself. This is a 2D constraint, not true 3D physics, but it captures the essential rolling and gyroscopic behavior we want.
      </p>

      <p>
        A major downside is that when the wheel approaches the minimum, it tends to orbit around it rather than settling quickly. Too much gyroscopic stability means it overshoots and circles instead of stopping. This is the classic exploration vs exploitation tradeoff. The same property that helps escape local minima also makes it harder to settle at the global one.
      </p>

      <h2>/ what i learned</h2>
      
      <p>
        Playing with this tool showed me just how different all the optimizers behave. You can select the same starting spot and watch three optimizers end up in completely different minima. That's pretty amazing when you see it happen in real-time.
      </p>

      <p>
        Developing the wheel optimizer taught me the value of physics intuition in algorithm design. You can derive optimizers from first principles and mathematical theory, but starting with a physical analogue gives you immediate intuition about behavior. The gyroscopic resistance wasn't something I would have thought to add if I was just manipulating equations. It came from thinking about how real wheels behave.
      </p>

      <p>
        That said, the wheel optimizer turned out to be a terrible optimizer in practice. The gyroscopic precession that makes it interesting to watch also makes it painfully slow to converge. It doesn't actually follow the gradient properly. Often times, it fights against it, building up momentum in directions that aren't aligned with the steepest descent. The result is a lot of spiraling and circling rather than efficient movement toward the minimum. It's a cool visualization of physics-inspired optimization, but you'd never want to use it for actual training.
      </p>

      <p>
        This isn't a tool for understanding what's happening under the hood of ML models. There are other visual tools for that. But for the optimization portion specifically, it makes the abstract concrete. You can see why momentum matters, why learning rate tuning is critical, and why some optimizers work better for certain problems.
      </p>

      <p>
        It's also been useful for explaining optimization to others. Showing someone a 3D landscape with optimizers racing down it is a lot more effective than showing them equations.
      </p>

      <p>
        <a href="https://gd.bicrick.com" target="_blank" rel="noopener noreferrer">try the visualizer</a>
        {' | '}
        <a href="https://github.com/bicrick/gd-visualizer" target="_blank" rel="noopener noreferrer">see the repo</a>
      </p>
    </ProjectDetail>
  );
}

export default GDVisualizer;
