import React from 'react';
import ProjectDetail from '../components/ProjectDetail';

function AIMasters() {
  return (
    <ProjectDetail title="artificial intelligence masters - coursework">
      <img 
        src={`${process.env.PUBLIC_URL}/images/ai-masters/ut-msai-1200x600.png`} 
        alt="UT Austin MSAI" 
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '2rem', fontSize: '0.9rem', textAlign: 'center' }}>
        Selected coursework from the Master of Science in Artificial Intelligence program at UT Austin
      </p>
      
      <h2>/ motivations</h2>
      
      <p>
        Senior year of undergrad, I took Data Science Principles. Our professor showed us GPT-3 before ChatGPT even existed. I watched it roleplay as Plato. Then ChatGPT dropped mid-semester. I asked it to build me a calculator app in HTML. It just worked. That was the moment. I knew I had to get in.
      </p>
      
      <p>
        After graduating, I've been working as a data engineer at HEB for two years. I use AI daily, but I wanted to push further. I can work on things in my spare time, but deadlines help. This master's was about staying current, understanding how it all works, and keeping myself accountable.
      </p>

      <h2>/ notable projects</h2>

      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Advances in Deep Learning - Model Compression</h3>
        {/* Placeholder for image */}
        <div style={{ width: '100%', height: '200px', background: '#e0e0e0', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          [Image: Model compression visualization]
        </div>
        <p style={{ marginBottom: '0.75rem' }}>
          Implemented memory-efficient training techniques for large neural networks. Built half-precision networks, LoRA adapters, 4-bit quantization, and QLoRA from scratch. The goal was to train and run large models on limited hardware without sacrificing accuracy.
        </p>
        <p style={{ marginBottom: '0.25rem' }}>
          Started with a 73MB network and implemented four compression approaches. Half-precision gave 50% memory reduction. LoRA added trainable low-rank adapters to frozen half-precision weights. 4-bit quantization used custom block quantization to achieve 7x memory reduction. QLoRA combined both techniques for maximum efficiency.
        </p>
        <p style={{ marginBottom: '0.25rem' }}>
          The quantization implementation used block-wise quantization where groups of weights share a normalization factor stored in float16. Each weight gets packed into 4 bits. Had to implement custom loading hooks since PyTorch doesn't natively support this format. Used straight-through gradient estimators to make everything differentiable.
        </p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Deep Learning - Multi-task Road Detection</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '50%' }}>
            <img 
              src={`${process.env.PUBLIC_URL}/images/ai-masters/00001_im.jpg`} 
              alt="Mario Kart racing game input" 
              style={{ width: '100%', objectFit: 'contain' }}
            />
            <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem' }}>
              Base Mario Kart image
            </p>
          </div>
          <div style={{ width: '50%' }}>
            <img 
              src={`${process.env.PUBLIC_URL}/images/ai-masters/00002_depth.png`} 
              alt="Depth map prediction" 
              style={{ width: '100%', objectFit: 'contain' }}
            />
            <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem' }}>
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
        <h3 style={{ marginBottom: '0.5rem' }}>NLP - Transformer Language Model from Scratch</h3>
        {/* Placeholder for image */}
        <div style={{ width: '100%', height: '200px', background: '#e0e0e0', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          [Image: Attention visualization]
        </div>
        <p style={{ marginBottom: '0.75rem' }}>
          Implemented a complete transformer architecture without using any pre-built attention layers. Built self-attention, positional encodings, and causal masking from the ground up. Trained it on two tasks - a letter counting task and character-level language modeling.
        </p>
        <p style={{ marginBottom: '0.25rem' }}>
          The letter counting task was designed to test if the model could learn to attend to relevant context. Given a string, predict how many times each character appeared before that position. This requires the model to look back through the sequence and count. Without positional encodings the model treats input as a bag of characters. With positional encodings it can distinguish position and achieved 98% accuracy.
        </p>
        <p style={{ marginBottom: '0.25rem' }}>
          For language modeling, trained on the text8 dataset - 100k characters from Wikipedia. Implemented causal masking so tokens can't attend to future positions. The model predicts the next character at each position simultaneously. Used perplexity as the evaluation metric. Final model achieved perplexity under 7, which corresponds to reasonable compression and generation quality for a character-level model.
        </p>
      </div>

      <h2>/ takeaway</h2>
      
      <p>
        The program gave me hands-on experience with modern AI techniques from the ground up. Building transformers from scratch, implementing quantization schemes, and working through formal verification all reinforced the fundamentals. The projects balanced theory with practical implementation, which is how I prefer to learn.
      </p>
    </ProjectDetail>
  );
}

export default AIMasters;
