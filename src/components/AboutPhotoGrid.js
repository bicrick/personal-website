import React from 'react';
import './AboutPhotoGrid.css';

const PRINTS = [
  { src: `${process.env.PUBLIC_URL}/about/img-4149.jpg`, alt: 'With puppy', x: '0%', y: '12%', turn: '-2.4deg', z: 1 },
  { src: `${process.env.PUBLIC_URL}/about/img-5095.jpg`, alt: 'Outdoor selfie', x: '15.6%', y: '0%', turn: '1.7deg', z: 2 },
  { src: `${process.env.PUBLIC_URL}/about/golf-swing.gif`, alt: 'Golf swing', x: '48%', y: '0%', turn: '2.1deg', z: 2 },
  { src: `${process.env.PUBLIC_URL}/about/img-5371.png`, alt: 'Portrait', x: '63%', y: '12%', turn: '-1.8deg', z: 2 },
  { src: `${process.env.PUBLIC_URL}/about/img-4643.gif`, alt: 'Track race', x: '78%', y: '0%', turn: '1.4deg', z: 1 },
  { src: `${process.env.PUBLIC_URL}/about/img-5482.jpg`, alt: 'Pumpkin Open', x: '31%', y: '16%', turn: '-1.2deg', z: 3 },
];

export default function AboutPhotoGrid() {
  return (
    <div className="about-prints">
      {PRINTS.map((photo) => (
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          className="about-print"
          style={{ '--x': photo.x, '--y': photo.y, '--turn': photo.turn, '--z': photo.z }}
          width="200"
          height="200"
          draggable={false}
        />
      ))}
    </div>
  );
}
