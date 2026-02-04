import React from 'react';
import ProjectDetail from '../components/ProjectDetail';

function AIMasters() {
  return (
    <ProjectDetail 
      title={<>artificial intelligence masters - <a href="https://cdso.utexas.edu/msai" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>see program info</a></>}
      seoTitle="UT Austin AI Masters - Coursework by bicrick"
      seoDescription="UT Austin Master's in Artificial Intelligence coursework by bicrick (Patrick Brown) - Deep learning, NLP, transformers, model compression, reinforcement learning projects and takeaways."
      seoKeywords="bicrick, Patrick Brown, UT Austin, AI Masters, Machine Learning, Deep Learning, NLP, Transformers, Artificial Intelligence"
      seoUrl="https://bicrick.com/projects/ai-masters"
      seoImage="https://bicrick.com/images/ai-masters/ut-msai-1200x600.png"
    >
      <img 
        src={`${process.env.PUBLIC_URL}/images/ai-masters/ut-msai-1200x600.png`} 
        alt="UT Austin MSAI" 
        width="1200"
        height="600"
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '2rem', fontSize: '0.9rem', textAlign: 'center' }}>
        Motivations, coursework, and takeaways from my time at UT Austin
      </p>
      
      <h2>/ motivations</h2>
      
      <p>
        Senior year of undergrad, I took Data Science Principles. Our professor showed us GPT-3. I watched it roleplay as Plato. Pretty cool. Halfway through the semester, GPT-3.5 dropped in a tool called ChatGPT. I asked it to build me a calculator app in HTML. It just worked. That was the moment. I knew I had to get in.
      </p>
      
      <p>
        After graduating, I've been working as a data engineer at HEB for two years. I use AI daily, but I wanted to push further. I can work on things in my spare time, but deadlines help. This master's was about staying current, understanding how it all works, and keeping myself accountable.
      </p>

      <h2>/ notable projects</h2>

      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Deep Learning: Multi-task Road Detection</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ width: '50%' }}>
            <img 
              src={`${process.env.PUBLIC_URL}/images/ai-masters/00001_im.jpg`} 
              alt="Mario Kart racing game input" 
              width="400"
              height="300"
              style={{ width: '100%', objectFit: 'contain', marginBottom: '0.5rem' }}
            />
            <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
              Base Mario Kart image
            </p>
          </div>
          <div style={{ width: '50%' }}>
            <img 
              src={`${process.env.PUBLIC_URL}/images/ai-masters/00002_depth.png`} 
              alt="Depth map prediction" 
              width="400"
              height="300"
              style={{ width: '100%', objectFit: 'contain', marginBottom: '0.5rem' }}
            />
            <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
              Predicted depth map
            </p>
          </div>
        </div>
        <p style={{ marginBottom: '0.75rem' }}>
          Built a U-Net style architecture for autonomous driving that simultaneously predicts depth and road segmentation. The model takes Mario Kart-style racing game footage and outputs both a depth map and lane boundary segmentation mask.
        </p>
        <p style={{ marginBottom: '0.25rem' }}>
          Used an encoder-decoder architecture with skip connections. The encoder progressively downsamples the image while increasing channels. The decoder upsamples back to full resolution. Skip connections between encoder and decoder help preserve fine boundary details that would otherwise be lost in the bottleneck.
        </p>
        <p style={{ marginBottom: '0.25rem' }}>
          Trained on SuperTuxKart racing data with two loss functions - cross-entropy for segmentation and absolute error for depth. The model had to handle class imbalance since most pixels are background. Used IoU metric instead of raw accuracy. Final model achieved IoU over 0.75 and depth MAE under 0.05 on both overall pixels and lane boundaries specifically.
        </p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Advances in Deep Learning: Model Compression</h3>
        <img 
          src={`${process.env.PUBLIC_URL}/images/ai-masters/memory_compression_visualization.png`} 
          alt="Memory reduction through compression techniques" 
          width="1200"
          height="600"
          style={{ width: '75%', marginBottom: '0.5rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        />
        <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>
          Memory footprint comparison: QLoRA achieves 4.5x compression while 4-bit quantization reaches 6.3x reduction
        </p>
        <p style={{ marginBottom: '0.75rem' }}>
          Implemented memory-efficient training techniques for large neural networks. Built half-precision networks, LoRA adapters, 4-bit quantization, and QLoRA from scratch. The goal was to train and run large models on limited hardware without sacrificing accuracy.
        </p>
        <p style={{ marginBottom: '0.25rem' }}>
          Started with a 73MB network and implemented four compression approaches. Half-precision gave 50% memory reduction. LoRA added trainable low-rank adapters to frozen half-precision weights. 4-bit quantization used custom block quantization to achieve 7x memory reduction. QLoRA combined both techniques for maximum efficiency.
        </p>
        <p style={{ marginBottom: '0.25rem' }}>
          The quantization implementation used block-wise quantization where groups of weights share a normalization factor stored in float16. Each weight gets packed into 4 bits. Had to implement custom loading hooks since PyTorch doesn't natively support this format. The quantized weights remain frozen during training - for trainability, QLoRA adds full-precision LoRA adapters on top of the frozen 4-bit base.
        </p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>NLP: Transformer Language Model from Scratch</h3>
        <img 
          src={`${process.env.PUBLIC_URL}/images/ai-masters/positional_encoding_comparison.png`} 
          alt="Impact of positional encodings on self-attention" 
          width="1200"
          height="600"
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>
          Adding positional encodings teaches the model where to look. Instead of treating input as a bag of characters, it learns to attend precisely to previous positions containing the same character.
        </p>
        <p style={{ marginBottom: '0.75rem' }}>
          Implemented a complete transformer architecture without using any pre-built attention layers. Built self-attention, positional encodings, and causal masking from the ground up. Trained it on two tasks - a letter counting task and character-level language modeling.
        </p>
        <p style={{ marginBottom: '0.25rem' }}>
          The letter counting task was designed to test if the model could learn to attend to relevant context. Given a string, predict how many times each character appeared before that position. This requires the model to look back through the sequence and count. Without positional encodings the model treats input as a bag of characters. With positional encodings it can distinguish position and achieved 98% accuracy.
        </p>
        <p style={{ marginBottom: '0.25rem' }}>
          For language modeling, trained on the text8 dataset (100k characters from Wikipedia). Implemented causal masking so tokens can't attend to future positions. The model predicts the next character at each position simultaneously. Used perplexity as the evaluation metric. Final model achieved perplexity under 7, which corresponds to reasonable compression and generation quality for a character-level model.
        </p>
      </div>

      <h2>/ takeaway</h2>
      
      <p>
        This program let me understand the mathematical and theoretical principles behind modern AI. I got to implement models from the ground up - building transformers without pre-built attention layers, coding quantization schemes from scratch, and proving program correctness with formal methods. It's one thing to use a library, but implementing these algorithms yourself forces you to understand what's actually happening under the hood.
      </p>
      
      <p>
        There's still more learning to be done in this area. AI is an ever-changing space, and new techniques emerge constantly. But having this foundation in the core principles makes it easier to understand and adapt to whatever comes next.
      </p>

      <h2>/ course list</h2>
      
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>deep learning:</strong> core concepts like CNNs, residual networks, and computer vision tasks. built classifiers and segmentation models for racing games.
      </p>
      
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>ethics in ai:</strong> explored ethical frameworks from different cultures and applied them to AI design decisions around fairness, accountability, and transparency.
      </p>
      
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>machine learning:</strong> classical algorithms like linear regression, decision trees, SVMs, and neural networks. covered theory and practical implementation.
      </p>
      
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>planning, search, and reasoning under uncertainty:</strong> algorithms for path planning, adversarial search, bayesian state estimation, and markov decision processes.
      </p>
      
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>reinforcement learning:</strong> everything from multi-armed bandits to policy gradients. implemented Q-learning, SARSA, and REINFORCE from Sutton & Barto.
      </p>
      
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>advances in deep generative models:</strong> modern generative techniques including GANs, diffusion models, flow-based models, and autoregressive language models.
      </p>
      
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>automated logical reasoning:</strong> built SAT solvers with conflict-driven clause learning and SMT solvers. used Dafny for formal verification of programs.
      </p>
      
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>natural language processing:</strong> sentiment analysis, language modeling, transformers, and fact-checking. worked with BERT, DeBERTa, and custom transformer implementations.
      </p>
      
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>online learning and optimization:</strong> online algorithms, regret bounds, multi-armed bandits, and contextual bandits. implemented UCB, EXP3, and Thompson sampling.
      </p>
      
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>optimization:</strong> convex optimization theory covering gradient descent, Newton's method, duality, KKT conditions, and interior point methods.
      </p>
      
      <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
        <a href="https://cdso.utexas.edu/msai" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>
          UT Austin Master's in Artificial Intelligence Program
        </a>
      </p>
    </ProjectDetail>
  );
}

export default AIMasters;
