import React, { useEffect, useId, useState } from 'react';
import './AboutPhotoGrid.css';

const PHOTOS = [
  { src: `${process.env.PUBLIC_URL}/about/img-4149.jpg`, alt: 'With puppy' },
  { src: `${process.env.PUBLIC_URL}/about/img-5095.jpg`, alt: 'Outdoor selfie' },
  { src: `${process.env.PUBLIC_URL}/about/img-5482.jpg`, alt: 'Pumpkin Open' },
  { src: `${process.env.PUBLIC_URL}/about/golf-swing.gif`, alt: 'Golf swing' },
  { src: `${process.env.PUBLIC_URL}/about/img-5371.png`, alt: 'Portrait' },
  { src: `${process.env.PUBLIC_URL}/about/img-4643.gif`, alt: 'Track race' },
];

function AboutPhotoGrid() {
  const [activeIndex, setActiveIndex] = useState(null);
  const titleId = useId();
  const activePhoto = activeIndex != null ? PHOTOS[activeIndex] : null;

  useEffect(() => {
    if (activeIndex == null) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveIndex(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex]);

  return (
    <>
      <div className="about-pics">
        {PHOTOS.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            className="about-pic-button"
            onClick={() => setActiveIndex(index)}
            aria-label={`View larger: ${photo.alt}`}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="about-pic"
              width="400"
              height="400"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {activePhoto && (
        <div
          className="about-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => setActiveIndex(null)}
        >
          <p id={titleId} className="about-lightbox-title">
            {activePhoto.alt}
          </p>
          <button
            type="button"
            className="about-lightbox-close"
            onClick={() => setActiveIndex(null)}
            aria-label="Close photo preview"
          >
            Close
          </button>
          <img
            src={activePhoto.src}
            alt={activePhoto.alt}
            className="about-lightbox-image"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default AboutPhotoGrid;
