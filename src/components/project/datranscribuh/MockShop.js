import React, { forwardRef } from 'react';

/**
 * Tiny bakery.shop-style page with real grab targets.
 * Each [data-grab] element can be marquee-snapped and cloned into the collage.
 */
const MockShop = forwardRef(function MockShop({ activeGrabId }, ref) {
  return (
    <div className="dtd-shop" ref={ref}>
      <header className="dtd-shop-nav">
        <span className="dtd-shop-logo">bakery.shop</span>
        <span className="dtd-shop-nav-links">menu · about</span>
      </header>

      <div
        className={`dtd-shop-hero${activeGrabId === 'hero' ? ' is-grabbed' : ''}`}
        data-grab="hero"
      >
        <span className="dtd-shop-eyebrow">fresh today</span>
        <h3 className="dtd-shop-title">sourdough loaf</h3>
        <p className="dtd-shop-tag">crust, crumb, and a little butter.</p>
      </div>

      <div className="dtd-shop-row">
        <div
          className={`dtd-shop-price${activeGrabId === 'price' ? ' is-grabbed' : ''}`}
          data-grab="price"
        >
          <span className="dtd-shop-price-label">loaf</span>
          <span className="dtd-shop-price-amt">$4.50</span>
        </div>
        <button
          type="button"
          className={`dtd-shop-order${activeGrabId === 'order' ? ' is-grabbed' : ''}`}
          data-grab="order"
          tabIndex={-1}
        >
          order now
        </button>
      </div>
    </div>
  );
});

export default MockShop;

/** Mini replica of a grab target for the one-paste collage. */
export function GrabThumb({ id }) {
  if (id === 'order') {
    return (
      <span className="dtd-thumb dtd-thumb-order" title="order now">
        <span>order now</span>
      </span>
    );
  }
  if (id === 'price') {
    return (
      <span className="dtd-thumb dtd-thumb-price" title="price">
        <span className="dtd-thumb-price-label">loaf</span>
        <span className="dtd-thumb-price-amt">$4.50</span>
      </span>
    );
  }
  return (
    <span className="dtd-thumb dtd-thumb-hero" title="hero">
      <span className="dtd-thumb-hero-title">sourdough loaf</span>
      <span className="dtd-thumb-hero-tag">crust, crumb…</span>
    </span>
  );
}
