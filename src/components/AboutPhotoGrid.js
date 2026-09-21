import React from 'react';
import './AboutPhotoGrid.css';

const PHOTOS = [
  { src: `${process.env.PUBLIC_URL}/about/img-4149.jpg`, alt: 'With puppy' },
  { src: `${process.env.PUBLIC_URL}/about/img-5095.jpg`, alt: 'Outdoor selfie' },
  { src: `${process.env.PUBLIC_URL}/about/img-5482.jpg`, alt: 'Pumpkin Open' },
  { src: `${process.env.PUBLIC_URL}/about/golf-swing.gif`, alt: 'Golf swing' },
  { src: `${process.env.PUBLIC_URL}/about/img-5371.png`, alt: 'Portrait' },
  { src: `${process.env.PUBLIC_URL}/about/img-4643.gif`, alt: 'Track race' },
];

export default function AboutPhotoGrid() {
  return (
    <div className="about-pics">
      {PHOTOS.map((photo) => (
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          className="about-pic"
          width="400"
          height="400"
          loading="lazy"
          draggable={false}
        />
      ))}
    </div>
  );
}
