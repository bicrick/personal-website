# MSAI Coursework Summary - Detailed Exploration

This document provides a comprehensive overview of the coursework completed during the Master of Science in Artificial Intelligence program at UT Austin.

---

## Course Overview

### 1. Advances in Deep Learning

**Focus:** Cutting-edge deep learning techniques including model optimization, compression, and fine-tuning

#### Homework 1: Low Memory Training and Inference
- **Objective:** Implement memory-efficient training techniques for large neural networks
- **Key Implementations:**
  - Half-precision networks (FP16) - 50% memory reduction
  - LoRA (Low-Rank Adaptation) with half-precision base network
  - 4-bit quantization using block quantization techniques
  - QLoRA (Quantized LoRA) combining both approaches
- **Technical Achievements:**
  - Achieved ~7x memory reduction through 4-bit quantization
  - Implemented custom quantization/dequantization functions
  - Maintained model accuracy while drastically reducing memory footprint
- **Technologies:** PyTorch, custom quantization, gradient checkpointing

#### Homework 2: Auto-regressive Image Generation
- **Objective:** Build an auto-regressive image generation model from scratch
- **Key Components:**
  1. Patch-level auto-encoder for SuperTuxKart images (150x100 pixels)
  2. Binary Spherical Quantization (BSQ) for efficient tokenization
  3. Transformer-based auto-regressive model for generation
  4. Optional: Entropy coding for compression
- **Technical Achievements:**
  - Compressed 500MB dataset to 76MB through tokenization
  - Achieved 4000-4500 bits per image compression rate
  - Implemented differentiable binarization with straight-through estimators
- **Technologies:** PyTorch, Transformers, quantization, image compression

#### Homework 3: Well-Reasoned Unit Conversion with LLMs
- **Objective:** Train language models to perform unit conversions with reasoning
- **Key Implementations:**
  1. Generation and batched generation for SmolLM2
  2. Chain-of-thought (CoT) prompting for in-context learning
  3. Supervised fine-tuning (SFT) with LoRA adapters
  4. Rejection Sampling Fine-Tuning (RFT) for improved reasoning
- **Technical Achievements:**
  - Implemented batched inference with proper padding/masking
  - Achieved 90%+ success rate in generating correct reasoning chains
  - Combined CoT reasoning with supervised learning
- **Technologies:** HuggingFace Transformers, LoRA/PEFT, SmolLM2, prompt engineering

#### Homework 4: Vision-Language Model Fine-tuning
- **Objective:** Fine-tune vision-language models for multimodal understanding
- **Key Components:**
  - Base VLM implementation
  - Question-answer generation from images
  - Fine-tuning pipeline for vision-language tasks
- **Technologies:** PyTorch, Vision Transformers, multimodal learning

---

### 2. Deep Learning (Foundational Course)

**Focus:** Core deep learning concepts, CNNs, and practical implementation

#### Homework 1: PyTorch Basics
- **Objective:** Master PyTorch tensor operations and basic ML algorithms
- **Components:**
  1. PyTorch tensor manipulation (12 problems)
  2. Nearest neighbor classifier implementation
  3. Weather forecasting model for Austin, Texas
- **Technical Skills:** Efficient tensor operations, vectorization, PyTorch fundamentals

#### Homework 2: Deep Networks for Classification
- **Objective:** Train deep networks on SuperTuxKart dataset (6 classes)
- **Implementations:**
  1. Linear classifier baseline
  2. Multi-layer perceptron (MLP)
  3. Deep MLP (4+ layers)
  4. Deep MLP with residual connections
- **Technical Achievements:**
  - Achieved 80%+ validation accuracy
  - Implemented residual connections for deep networks
  - Used TensorBoard for experiment tracking
- **Technologies:** PyTorch, CNNs, ResNets, data augmentation

#### Homework 3: Computer Vision Tasks
- **Objective:** Implement CNNs for classification, segmentation, and detection
- **Part 1 - Classification:**
  - Convolutional neural network for SuperTuxKart classification
  - Data augmentation pipeline
  - Achieved 92% validation accuracy
- **Part 2 - Road Detection:**
  - Multi-task learning: depth estimation + semantic segmentation
  - U-Net style architecture with skip connections
  - Predicted road boundaries for autonomous driving
  - Metrics: IoU > 0.75, Depth MAE < 0.05
- **Technologies:** PyTorch, CNNs, U-Net, multi-task learning, semantic segmentation

#### Homework 4: Path Planning
- **Objective:** Implement end-to-end path planning for autonomous racing
- **Components:**
  - Road dataset with depth and segmentation
  - Planning model for trajectory prediction
  - Integration with SuperTuxKart simulator
- **Technologies:** PyTorch, computer vision, path planning

---

### 3. Natural Language Processing

**Focus:** Text processing, neural networks for NLP, transformers, and language models

#### Assignment 1: Sentiment Classification
- **Objective:** Build sentiment classifiers for movie reviews (binary classification)
- **Implementations:**
  1. Perceptron with bag-of-words features (74%+ accuracy)
  2. Logistic regression (77%+ accuracy)
  3. Bigram features
  4. Advanced feature engineering
- **Technical Skills:** Feature extraction, sparse vectors, text preprocessing, n-grams
- **Dataset:** Rotten Tomatoes movie reviews (Socher et al. 2013)

#### Assignment 2: Deep Averaging Networks
- **Objective:** Neural sentiment classification with word embeddings
- **Part 1 - Optimization:**
  - Manual SGD implementation for quadratic functions
  - Gradient computation and step size tuning
- **Part 2 - Deep Averaging Network:**
  - Feedforward network with averaged word embeddings
  - Batched training implementation
  - GloVe embeddings (50d and 300d)
  - Achieved 77%+ accuracy
- **Part 3 - Typo Handling:**
  - Spelling correction using edit distance
  - Prefix embeddings (first 3 characters)
  - Achieved 74%+ accuracy on corrupted data
- **Technologies:** PyTorch, GloVe embeddings, neural networks

#### Assignment 3: Transformer Language Modeling
- **Objective:** Implement transformers from scratch
- **Part 1 - Letter Counting Task:**
  - Built transformer encoder from scratch
  - Self-attention mechanism implementation
  - Positional encodings
  - Achieved 98%+ accuracy on counting task
- **Part 2 - Character-level Language Model:**
  - Transformer LM on text8 dataset (100k characters)
  - Causal masking for auto-regressive prediction
  - Achieved perplexity < 7
- **Technical Skills:** Self-attention, transformers, language modeling, perplexity
- **Technologies:** PyTorch, Transformers (custom implementation)

#### Assignment 4: Fact-checking ChatGPT Outputs
- **Objective:** Verify factual accuracy of LLM-generated biographies
- **Part 1 - Word Overlap:**
  - Bag-of-words similarity metrics
  - TF-IDF, Jaccard similarity, ROUGE/BLEU
  - Achieved 75%+ accuracy
- **Part 2 - Textual Entailment:**
  - DeBERTa-v3 model fine-tuned on MNLI, FEVER, ANLI
  - Premise-hypothesis entailment checking
  - Sentence-level comparison with max pooling
  - Achieved 83%+ accuracy
- **Part 3 - Error Analysis:**
  - Manual categorization of false positives/negatives
  - Identified systematic error patterns
- **Dataset:** FActScore (Min et al. 2023) - ChatGPT biographies vs Wikipedia
- **Technologies:** HuggingFace Transformers, DeBERTa, NLI models

#### Final Project: NLI Dataset Artifacts and Debiasing
- **Objective:** Address dataset biases in Natural Language Inference
- **Implementations:**
  - Baseline BERT model training
  - Hypothesis-only model to identify artifacts
  - Product-of-Experts (PoE) debiasing technique
  - HANS evaluation for robustness testing
- **Technical Achievements:**
  - Identified and mitigated annotation artifacts
  - Improved model generalization to adversarial examples
  - Comprehensive error analysis and reporting
- **Technologies:** BERT, PyTorch, Google Colab (A100 GPU), debiasing techniques

---

### 4. Reinforcement Learning

**Focus:** RL algorithms from Sutton & Barto, from bandits to policy gradients

#### PA1: Multi-Armed Bandits
- **Objective:** Implement non-stationary bandit algorithms
- **Implementations:**
  - 10-armed testbed simulation
  - Sample average Q-estimates
  - Constant step-size Q-estimates
  - Epsilon-greedy exploration
- **Concepts:** Exploration vs exploitation, non-stationary environments

#### PA2: Dynamic Programming
- **Objective:** Solve MDPs with full model knowledge
- **Implementations:**
  - Value iteration for optimal V, Q, and policy
  - Policy evaluation for given policies
  - Deterministic greedy policy
- **Environments:** FrozenLake, Taxi (OpenAI Gym)
- **Concepts:** Bellman equations, optimal policies, value functions

#### PA3: Monte Carlo Methods
- **Objective:** Off-policy evaluation using importance sampling
- **Implementations:**
  - Ordinary importance sampling
  - Weighted importance sampling
  - Every-visit Monte Carlo
- **Concepts:** Off-policy learning, importance sampling, variance reduction

#### PA4: Temporal Difference Learning
- **Objective:** N-step bootstrapping methods
- **Implementations:**
  - On-policy n-step TD for policy evaluation
  - Off-policy n-step SARSA for control
- **Concepts:** TD learning, n-step returns, bootstrapping

#### PA5: Function Approximation
- **Objective:** Value function approximation with neural networks
- **Implementations:**
  - Semi-gradient n-step TD
  - Linear and neural network approximators
  - Gradient descent updates
- **Concepts:** Function approximation, semi-gradient methods, neural networks in RL

#### PA6: Policy Gradient Methods
- **Objective:** Direct policy optimization
- **Implementations:**
  - REINFORCE algorithm
  - SARSA with function approximation
- **Concepts:** Policy gradients, actor-critic methods, baseline functions

---

### 5. Automated Logical Reasoning

**Focus:** SAT solving, SMT, and formal verification

#### PA1: CDCL SAT Solver
- **Objective:** Implement Conflict-Driven Clause Learning
- **Components:**
  - Boolean constraint propagation
  - Conflict analysis and learning
  - Non-chronological backtracking
  - VSIDS heuristic
- **Technologies:** Java, SAT solving algorithms
- **Files:** 71 files including parser, solver core, and test cases

#### PA2: Congruence Closure
- **Objective:** Implement congruence closure algorithm for equality logic
- **Components:**
  - Union-find data structure
  - Congruence relation maintenance
  - Equality reasoning
- **Technologies:** Java, SMT solving
- **Files:** 35 files including implementation and tests

#### PA3: Dafny Verification
- **Objective:** Develop verified procedures for sequence operations
- **Implementations:**
  1. `sreverse(s)` - sequence reversal
  2. `ssubreverse(s, start, end)` - subsequence reversal
  3. `srotate(s, k)` - sequence rotation
  4. Array-based implementations with in-place operations
- **Verification Requirements:**
  - Functional specifications with `requires`/`ensures`
  - Loop invariants for correctness proofs
  - Imperative implementations with constant space
- **Technologies:** Dafny 3.5.0, formal verification, proof annotations
- **Key Concepts:** Pre/postconditions, loop invariants, verification conditions

---

### 6. Optimization

**Focus:** Convex optimization theory and algorithms

#### Homeworks 1-9: Theoretical Foundations
- **Topics Covered:**
  - Convex sets and functions
  - Gradient descent and convergence analysis
  - Newton's method and quasi-Newton methods
  - Constrained optimization (KKT conditions)
  - Duality theory
  - Interior point methods
  - Stochastic gradient descent
  - Proximal methods
  - Coordinate descent
- **Format:** Theoretical problem sets with LaTeX writeups
- **Homework 9:** Practical implementation in Python (optimization algorithms)

---

### 7. Online Learning and Optimization

**Focus:** Online algorithms, bandits, and game theory

#### Problem Sets 1-14:
- **Topics Covered:**
  - Online convex optimization
  - Regret bounds and analysis
  - Follow-the-leader algorithms
  - Exponential weights
  - Multi-armed bandits
  - Upper Confidence Bound (UCB)
  - EXP3 algorithm
  - Linear bandits (LinUCB)
  - Thompson Sampling
  - Contextual bandits
- **Implementations:**
  - Homework 3-6: Gradient descent, optimization algorithms (NumPy)
  - Homework 10-14: Bandit algorithms (Jupyter notebooks)
- **Technologies:** NumPy, Jupyter, online learning algorithms

---

### 8. Machine Learning (Foundational Course)

**Focus:** Classical ML algorithms and theory

#### Homeworks 0-6:
- **Topics Covered:**
  - Linear regression and regularization
  - Logistic regression
  - Decision trees and ensemble methods
  - Support Vector Machines
  - Neural networks (basics)
  - Clustering algorithms
  - Dimensionality reduction (PCA)
  - Bias-variance tradeoff
  - Cross-validation
- **Format:** Mix of theory (LaTeX) and programming (Jupyter notebooks)
- **Technologies:** NumPy, scikit-learn, Jupyter notebooks

---

## Technical Skills Demonstrated

### Programming Languages & Frameworks
- **Python:** Primary language for all implementations
- **PyTorch:** Deep learning framework (extensive use)
- **HuggingFace Transformers:** Pre-trained models and fine-tuning
- **NumPy:** Numerical computing
- **Java:** SAT/SMT solver implementation
- **Dafny:** Formal verification

### Machine Learning Techniques
- **Deep Learning:**
  - CNNs, ResNets, U-Net architectures
  - Transformers (custom and pre-trained)
  - Vision-language models
  - Multi-task learning
  - Transfer learning and fine-tuning
  
- **Optimization:**
  - Model compression (quantization, pruning)
  - LoRA/QLoRA for efficient fine-tuning
  - Memory-efficient training techniques
  - Gradient checkpointing
  
- **NLP:**
  - Sentiment analysis
  - Language modeling
  - Fact-checking and entailment
  - Prompt engineering
  - Debiasing techniques
  
- **Reinforcement Learning:**
  - Value-based methods (Q-learning, SARSA)
  - Policy gradient methods (REINFORCE)
  - Function approximation
  - Monte Carlo and TD learning

### Software Engineering
- **Version Control:** Git/GitHub
- **Experiment Tracking:** TensorBoard, logging
- **Testing:** Unit tests, integration tests
- **Documentation:** Comprehensive README files, code comments
- **Reproducibility:** Requirements files, environment management

### Research & Analysis
- **Error Analysis:** Systematic categorization of model failures
- **Ablation Studies:** Component-wise performance evaluation
- **Hyperparameter Tuning:** Grid search, learning rate schedules
- **Metrics:** Accuracy, perplexity, IoU, MAE, F1, BLEU, ROUGE

---

## Notable Projects for Deep Dive

Based on technical complexity and real-world applicability, these projects stand out:

### 1. **Advances in Deep Learning - HW3: LLM Fine-tuning with RFT**
- Combines multiple advanced techniques (LoRA, CoT, RFT)
- Real-world application (reasoning in LLMs)
- Novel approach to improving model reasoning

### 2. **Deep Learning - HW3: Multi-task Road Detection**
- Practical autonomous driving application
- Multi-task learning (depth + segmentation)
- U-Net architecture with skip connections

### 3. **NLP Final Project: Dataset Debiasing**
- Research-oriented project
- Addresses important problem in ML fairness
- Product-of-Experts implementation

### 4. **Advances in Deep Learning - HW1: Model Compression**
- Critical for deployment (edge devices, mobile)
- Multiple compression techniques
- Significant memory reduction achievements

### 5. **NLP - Assignment 4: Fact-checking LLM Outputs**
- Highly relevant to current AI safety concerns
- Combines multiple NLP techniques
- Real-world dataset (ChatGPT outputs)

### 6. **Automated Logical Reasoning - PA1: CDCL SAT Solver**
- Foundational algorithm in CS
- Complex implementation (71 files)
- Theoretical and practical depth

---

## Summary Statistics

- **Total Courses:** 8
- **Programming Assignments:** 30+
- **Theoretical Problem Sets:** 25+
- **Primary Language:** Python (PyTorch)
- **Secondary Languages:** Java, Dafny
- **Lines of Code:** Estimated 10,000+ across all projects
- **Key Frameworks:** PyTorch, HuggingFace, OpenAI Gym, NumPy
- **Domains Covered:** Computer Vision, NLP, RL, Optimization, Formal Methods

---

## Conclusion

This coursework demonstrates comprehensive coverage of modern AI/ML techniques, from theoretical foundations to practical implementations. The projects showcase:

1. **Depth:** Multiple advanced topics in each domain
2. **Breadth:** Coverage across CV, NLP, RL, and formal methods
3. **Practical Skills:** Production-ready code with proper engineering practices
4. **Research Exposure:** Cutting-edge techniques (LoRA, RFT, debiasing)
5. **Problem Solving:** Complex algorithmic implementations (SAT solvers, transformers)

The combination of theoretical understanding and practical implementation makes this a well-rounded AI/ML education suitable for both research and industry roles.
