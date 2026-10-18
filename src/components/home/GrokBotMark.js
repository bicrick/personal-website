import React, { useRef } from 'react';
import useReducedMotion from '../project/useReducedMotion';
import BloubFace from '../project/loop/bloub/BloubFace';
import useBotFollow from './useBotFollow';

// The loop's bot, free of any card. The face is the bloub idle avatar.
// The body still leans toward the pointer and the shadow slides back.
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
      <ellipse className="writing-bot-shadow" cx="114.5" cy="246" rx="78" ry="9" />
      <g className="writing-bot-body">
        <BloubFace headClass="writing-bot-head" mode="follow" />
      </g>
    </svg>
  );
}
