import React from 'react';
import { Link } from 'react-router-dom';
import { WRITING } from '../../constants/writing';
import GrokBotMark from './GrokBotMark';
import SwingMark from './SwingMark';
import './WritingBlock.css';

const MARKS = { harness: SwingMark };

export default function WritingBlock() {
  return (
    <section className="home-block" aria-label="writing">
      <div className="home-block-head">
        <h2>writing</h2>
      </div>
      <ul className="writing-list">
        {WRITING.map((piece) => {
          const Mark = MARKS[piece.mark] || GrokBotMark;
          return (
            <li key={piece.path}>
              <Link to={piece.path} className="writing-row">
                <span className="writing-media" aria-hidden="true">
                  <Mark />
                </span>
                <span className="writing-copy">
                  <span className="writing-title">{piece.title}</span>
                  <span className="writing-description">{piece.description}</span>
                  <span className="writing-date">{piece.date}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
