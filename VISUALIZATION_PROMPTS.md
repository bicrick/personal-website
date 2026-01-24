# Visualization Prompts for MSAI Projects

## 1. Model Compression Visualization

### Course & Assignment
**Course:** Advances in Deep Learning  
**Assignment:** Homework 1 - Low Memory Training and Inference

### Project Context
- Implemented memory-efficient training techniques for a 73MB neural network (BigNet - 18.9M parameters)
- Four compression approaches: Half-precision (FP16), LoRA, 4-bit quantization, QLoRA
- Achieved 7x memory reduction through 4-bit block quantization
- Maintained model accuracy while drastically reducing memory footprint

### Visualization Prompt
Create a clean, professional bar chart showing memory reduction across compression techniques:

**Data to visualize:**
- Full Precision (float32): 72.11 MB
- Half Precision (float16): 36.07 MB (50% reduction)
- LoRA (half-precision base + adapters): ~38 MB
- 4-bit Quantization: 11.36 MB (7x reduction)
- QLoRA (4-bit + LoRA): ~13 MB

**Style requirements:**
- Horizontal bar chart
- Bars colored in a gradient (darkest for full precision, lightest for QLoRA)
- Memory size in MB labeled on each bar
- Reduction percentage shown (e.g., "50% reduction", "7x reduction")
- Clean, minimal design with good contrast
- Title: "Memory Reduction Through Compression Techniques"
- Subtitle: "BigNet Model (18.9M parameters)"

**Technical details to include:**
- X-axis: Memory (MB)
- Y-axis: Compression technique names
- Add a vertical line at 72MB to show baseline
- Use a professional color scheme (blues/grays, avoid bright colors)

---

## 2. Transformer Attention Visualization

### Course & Assignment
**Course:** Natural Language Processing  
**Assignment:** Assignment 3 - Transformer Language Modeling (Part 1: Letter Counting Task)

### Project Context
- Built transformer from scratch without pre-built layers (no nn.TransformerEncoder)
- Letter counting task: predict how many times each character appeared before that position
- Self-attention mechanism learns to look back at previous occurrences
- Achieved 98% accuracy with positional encodings
- Trained on text8 dataset with 20-character sequences
- Example: "i like movies a lot" → model counts previous occurrences of each letter

### Visualization Prompt
Create an attention heatmap showing self-attention weights for the letter counting task:

**Example input string:** "i like movies"
**Task:** For each position, count how many times that character appeared before

**Visualization structure:**
- Heatmap matrix where rows are "query positions" and columns are "key positions"
- Show attention weights (0 to 1) as color intensity
- Warmer colors (yellow/orange) for high attention, cooler colors (blue) for low attention
- Character labels on both axes showing the actual letters
- Diagonal should be masked (can't attend to self in this task)
- Upper triangle should be masked (causal attention - can't look forward)

**Key patterns to show:**
- When predicting at position with 'i' (positions 0, 5), model should attend strongly to previous 'i' positions
- When predicting at position with 'e' (positions 4, 7, 10), model should attend to previous 'e' positions
- First occurrence of each letter should have low/zero attention (no previous occurrences)

**Style requirements:**
- Clean heatmap with color bar showing attention weights
- Character labels clearly visible on both axes
- Title: "Self-Attention Weights for Letter Counting"
- Subtitle: "Input: 'i like movies' - Model learns to count previous character occurrences"
- Use a perceptually uniform colormap (e.g., viridis, plasma, or yellow-orange-red)
- Grid lines between cells for clarity

**Technical implementation suggestion:**
```python
# Example attention pattern for "i like movies"
# Rows = query positions, Cols = key positions
# High attention (0.8-1.0) where same character appeared before
# Low attention (0.0-0.2) elsewhere
# Masked (NaN or 0) for diagonal and upper triangle
```

---

## 3. Alternative: Letter Counting Example Visualization

If the attention heatmap is too complex, here's a simpler alternative:

### Course & Assignment
**Course:** Natural Language Processing  
**Assignment:** Assignment 3 - Transformer Language Modeling (Part 1: Letter Counting Task)

### Visualization Prompt
Create a visual example showing the letter counting task with color-coded attention:

**Layout:**
- Top row: Input string "i like movies a lot" with each character in a box
- Below each character: The count label (0, 0, 0, 1, 0, 1, 0, 2, 0, 1, 0, 2, 0, 2, 0, 2, 1, 0, 2, 2)
- Below that: Visual arrows or highlights showing which previous positions the model attends to

**Example for position 7 (second 'i'):**
- Character: 'i'
- Count: 1 (one previous 'i' at position 0)
- Show arrow or highlight from position 7 back to position 0

**Example for position 11 (second 'e'):**
- Character: 'e'
- Count: 1 (one previous 'e' at position 4)
- Show arrow or highlight from position 11 back to position 4

**Style requirements:**
- Clean, educational diagram
- Use different colors for different characters
- Arrows or connecting lines to show attention
- Labels showing "Count: 0", "Count: 1", "Count: 2" below each position
- Title: "Transformer Letter Counting Task"
- Subtitle: "Model learns to attend to previous occurrences of the same character"

---

## General Style Guidelines for All Visualizations

- **Resolution:** At least 1200px wide for web display
- **Format:** PNG with transparency where appropriate
- **Color scheme:** Professional, accessible (consider colorblind-friendly palettes)
- **Typography:** Clear, readable fonts (sans-serif)
- **White space:** Don't overcrowd - leave breathing room
- **Annotations:** Minimal but informative
- **File naming:** 
  - model-compression.png
  - attention-heatmap.png
  - letter-counting-example.png

---

## Implementation Notes

These visualizations can be created using:
- **Python:** matplotlib, seaborn, plotly
- **JavaScript:** D3.js, Chart.js, Recharts
- **Design tools:** Figma, Adobe Illustrator (for more polished results)

For the attention heatmap, you may need to generate synthetic attention weights that demonstrate the expected behavior, since the actual model outputs may not be available.
