import React, { useRef } from 'react';
import useReducedMotion from '../project/useReducedMotion';
import { HEAD, LEFT_EYE, RIGHT_EYE } from '../project/loop/GrokBot';
import useBotFollow from './useBotFollow';

// The marketplace bot from the loop diagram, free of any card. It follows
// the cursor, looks around when idle, and casts a small shadow.
export default function GrokBotMark() {
  const svgRef = useRef(null);
  const reduce = useReducedMotion();
  useBotFollow(svgRef, reduce);

  return (
    <svg
      ref={svgRef}
      className="writing-bot"
      viewBox="-30 -20 289 285"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="writing-bot-head">
          <path d={HEAD} />
        </clipPath>
      </defs>
      <ellipse className="writing-bot-shadow" cx="114.5" cy="246" rx="78" ry="9" />
      <g className="writing-bot-body">
        <path className="writing-bot-head" d={HEAD} />
        <g clipPath="url(#writing-bot-head)">
          <g className="writing-bot-eyes">
            <path className="writing-bot-eye" d={LEFT_EYE} />
            <path className="writing-bot-eye" d={RIGHT_EYE} />
          </g>
        </g>
      </g>
    </svg>
  );
}
