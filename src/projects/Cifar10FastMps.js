import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import ResultTable from '../components/project/ResultTable';

function Cifar10FastMps() {
  return (
    <ProjectDetail
      title="cifar10-fast-mps"
      date="December 2025"
      linkHref="https://github.com/bicrick/cifar10-fast-mps"
      linkLabel="view repo"
      abstract="A reimplementation of Keller Jordan's 94% on CIFAR-10 in seconds, ported to Apple Silicon with MPS. Absolute times are slower than an A100. Relative speedups still hold."
    >
      <h2>/ paper</h2>

      <p>
        <a href="https://arxiv.org/abs/2404.00498" target="_blank" rel="noopener noreferrer">
          94% on CIFAR-10 in 3.29 Seconds on a Single GPU
        </a>
        {' '}by Keller Jordan. The paper hits 94% in a few seconds on an A100 with alternating flip, patch whitening, Dirac init, scaled BatchNorm biases, Lookahead, and multi-crop TTA. I wanted those techniques on a laptop, not a rented GPU.
      </p>

      <h2>/ m3 results</h2>

      <ResultTable
        caption="M3 MPS, eager execution. No torch.compile on MPS."
        columns={['method', 'epochs', 'accuracy', 'total time', 'vs baseline']}
        rows={[
          ['ResNet-18 baseline', '10', '89.56%', '339.08s', '—'],
          ['airbench94', '10', '93.82%', '67.04s', '5.1× faster, +4.3%'],
          ['airbench95', '15', '95.12%', '199.51s', '1.7× faster, +5.6%'],
        ]}
      />

      <p>
        An M3 is roughly 5–10× slower than an A100 for this workload, and MPS has no <code>torch.compile</code>. The techniques still do what they claim. Code is in{' '}
        <a href="https://github.com/bicrick/cifar10-fast-mps" target="_blank" rel="noopener noreferrer">bicrick/cifar10-fast-mps</a>.
      </p>
    </ProjectDetail>
  );
}

export default Cifar10FastMps;
