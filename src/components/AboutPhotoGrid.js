import React from 'react';
import LoopingVideo from './LoopingVideo';
import './AboutPhotoGrid.css';

const PHOTOS = [
  { src: `${process.env.PUBLIC_URL}/about/img-4149.jpg`, alt: 'With puppy' },
  { src: `${process.env.PUBLIC_URL}/about/img-5095.jpg`, alt: 'Outdoor selfie' },
  { src: `${process.env.PUBLIC_URL}/about/img-5482.jpg`, alt: 'Pumpkin Open' },
  {
    src: `${process.env.PUBLIC_URL}/about/golf-swing.mp4`,
    poster: `${process.env.PUBLIC_URL}/about/golf-swing-poster.jpg`,
    alt: 'Golf swing',
    video: true,
    size: 200,
  },
  { src: `${process.env.PUBLIC_URL}/about/img-5371.png`, alt: 'Portrait' },
  {
    src: `${process.env.PUBLIC_URL}/about/img-4643.mp4`,
    poster: `${process.env.PUBLIC_URL}/about/img-4643-poster.jpg`,
    alt: 'Track race',
    video: true,
    size: 400,
  },
];

export default function AboutPhotoGrid() {
  return (
    <div className="about-pics">
      {PHOTOS.map((photo) => (photo.video ? (
        <LoopingVideo
          key={photo.src}
          src={photo.src}
          poster={photo.poster}
          width={photo.size}
          height={photo.size}
          className="about-pic"
        />
      ) : (
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
      )))}
    </div>
  );
}
