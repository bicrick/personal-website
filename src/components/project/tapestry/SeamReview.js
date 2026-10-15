import React from 'react';
import './tapestry.css';

const IMG = `${process.env.PUBLIC_URL}/images/infinite-tapestry`;

export default function SeamReview({
  before = 3.71,
  after = 2.3,
}) {
  return (
    <div className="it-demo">
      <div className="it-seam">
        <figure>
          <img
            src={`${IMG}/seam-review-1.webp`}
            alt="Join bake-off review sheet one, comparing latent blend arms"
            width="900"
            height="1222"
            loading="lazy"
          />
          <figcaption>review sheet 1</figcaption>
        </figure>
        <figure>
          <img
            src={`${IMG}/seam-review-2.webp`}
            alt="Join bake-off review sheet two, comparing latent blend arms"
            width="900"
            height="1222"
            loading="lazy"
          />
          <figcaption>review sheet 2</figcaption>
        </figure>
      </div>
      <p className="it-seam-metric">
        <span>
          seam roughness <strong>{before.toFixed(2)}</strong> →{' '}
          <strong>{after.toFixed(2)}</strong>
        </span>
        <span>lower is smoother</span>
        <span>latent blend inside the model, then repaint</span>
      </p>
    </div>
  );
}
