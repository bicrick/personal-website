import React from 'react';
import useReducedMotion from '../project/useReducedMotion';
import { HEAD, LEFT_EYE, RIGHT_EYE } from '../project/loop/GrokBot';

// The writing bot in a fitting room for harnesses. Three rigs come down in
// turn on a 12s SMIL loop: an overbuilt one that squashes it flat, a hoist
// that leaves it dangling and swinging, and a slim one it wiggles into and
// hops about. Reduced motion gets the last rig, still.
const DUR = '12s';
const EASE = '0.42 0 0.58 1';
const OFF = -280;

// The bot sits on its bottom edge, and swings from a point far overhead.
const FOOT = '114 218';
const PIVOT = '114 -260';

function track(pairs) {
  return {
    keyTimes: pairs.map(([t]) => t).join(';'),
    values: pairs.map(([, v]) => v).join(';'),
    keySplines: pairs.slice(1).map(() => EASE).join(';'),
  };
}

function Anim({ type, pairs }) {
  return (
    <animateTransform
      attributeName="transform"
      type={type}
      dur={DUR}
      repeatCount="indefinite"
      calcMode="spline"
      {...track(pairs)}
    />
  );
}

const SWING = [
  [0, `0 ${PIVOT}`], [0.4, `0 ${PIVOT}`], [0.43, `6 ${PIVOT}`],
  [0.465, `-5 ${PIVOT}`], [0.5, `3.5 ${PIVOT}`], [0.53, `-1.5 ${PIVOT}`],
  [0.55, `0 ${PIVOT}`], [1, `0 ${PIVOT}`],
];

const LIFT = [
  [0, '0 0'], [0.36, '0 0'], [0.4, '0 -20'], [0.53, '0 -20'], [0.555, '0 0'],
  [0.74, '0 0'], [0.765, '0 -18'], [0.79, '0 0'], [1, '0 0'],
];

const SQUASH = [
  [0, '1 1'], [0.055, '1 1'], [0.065, '1.04 0.94'], [0.09, '1.08 0.86'],
  [0.2, '1.08 0.86'], [0.21, '1.1 0.84'], [0.22, '1.08 0.86'],
  [0.25, '0.96 1.07'], [0.28, '1 1'], [0.545, '1 1'], [0.56, '1.06 0.92'],
  [0.58, '1 1'], [0.72, '1 1'], [0.735, '1.06 0.92'], [0.75, '0.95 1.06'],
  [0.785, '1 1'], [0.795, '1.06 0.93'], [0.82, '1 1'], [1, '1 1'],
];

const WIGGLE = [
  [0, `0 ${FOOT}`], [0.13, `0 ${FOOT}`], [0.15, `-2 ${FOOT}`],
  [0.17, `2 ${FOOT}`], [0.19, `0 ${FOOT}`], [0.655, `0 ${FOOT}`],
  [0.67, `-5 ${FOOT}`], [0.685, `5 ${FOOT}`], [0.7, `-4 ${FOOT}`],
  [0.715, `4 ${FOOT}`], [0.73, `-2 ${FOOT}`], [0.74, `0 ${FOOT}`],
  [0.86, `0 ${FOOT}`], [0.875, `3 ${FOOT}`], [0.89, `0 ${FOOT}`],
  [1, `0 ${FOOT}`],
];

const LOOK = [
  [0, '0 0'], [0.06, '0 0'], [0.09, '-4 12'], [0.22, '-4 12'], [0.26, '0 0'],
  [0.35, '0 0'], [0.37, '0 -8'], [0.42, '8 -4'], [0.46, '-8 -2'],
  [0.5, '6 -2'], [0.54, '0 0'], [0.6, '0 0'], [0.62, '0 -10'],
  [0.66, '0 -10'], [0.68, '0 0'], [1, '0 0'],
];

const BLINKS = [0.15, 0.3, 0.58, 0.81, 0.94];
const BLINK = [
  [0, '1 1'],
  ...BLINKS.flatMap((b) => [[b - 0.008, '1 1'], [b, '1 0.1'], [b + 0.008, '1 1']]),
  [1, '1 1'],
];

const rig = (down, up, extra = []) => [
  [0, `0 ${OFF}`], [down[0], `0 ${OFF}`], [down[1], '0 0'], ...extra,
  [up[0], '0 0'], [up[1], `0 ${OFF}`], [1, `0 ${OFF}`],
];

const HEAVY = rig([0, 0.055], [0.22, 0.28]).slice(1);
const HOIST = rig([0.3, 0.35], [0.555, 0.6]);
const FIT = [
  [0, `0 ${OFF}`], [0.6, `0 ${OFF}`], [0.65, '0 -40'], [0.67, '0 -40'],
  [0.685, '0 -28'], [0.7, '0 -28'], [0.715, '0 -14'], [0.73, '0 -6'],
  [0.74, '0 0'], [0.92, '0 0'], [0.98, `0 ${OFF}`], [1, `0 ${OFF}`],
];

const SHADOW_RX = [
  [0, 78], [0.055, 78], [0.09, 86], [0.2, 86], [0.25, 76], [0.28, 78],
  [0.36, 78], [0.4, 60], [0.53, 60], [0.56, 80], [0.58, 78], [0.74, 78],
  [0.765, 66], [0.79, 80], [0.82, 78], [1, 78],
];

// Each rig's straps are clipped to the head so they wrap it; ropes and hooks
// sit outside the clip and fade out above the frame.
function HeavyStraps() {
  return (
    <>
      <path className="harness-bot-strap" d="M-10 140H240M-10 178H240M-10 206H240M20 40L210 218M210 40L20 218" />
      <rect className="harness-bot-buckle" x="102" y="120" width="26" height="18" rx="3" />
      <rect className="harness-bot-buckle" x="47" y="169" width="26" height="18" rx="3" />
      <rect className="harness-bot-buckle" x="157" y="169" width="26" height="18" rx="3" />
    </>
  );
}

function HeavyTop() {
  return (
    <>
      <path className="harness-bot-rope" d="M100 -320L104 0M128 -320L124 0" />
      <rect className="harness-bot-hook" x="94" y="-12" width="40" height="24" rx="8" />
    </>
  );
}

function HoistStraps() {
  return <path className="harness-bot-strap" d="M-10 172Q114 200 240 172M40 176L112 12M190 176L116 12" />;
}

function HoistTop() {
  return (
    <>
      <path className="harness-bot-rope" d="M114 -320V-6" />
      <circle className="harness-bot-ring" cx="114" cy="4" r="10" />
    </>
  );
}

function FitStraps() {
  return (
    <>
      <path className="harness-bot-strap" d="M-10 160H240M30 30L92 160" />
      <rect className="harness-bot-buckle" x="79" y="151" width="26" height="18" rx="3" />
    </>
  );
}

export default function HarnessBotMark() {
  const reduce = useReducedMotion();
  const anim = (type, pairs) => (reduce ? null : <Anim type={type} pairs={pairs} />);

  return (
    <svg
      className="writing-bot harness-bot"
      viewBox="-30 -20 289 285"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="harness-bot-head">
          <path d={HEAD} />
        </clipPath>
        <linearGradient id="harness-bot-fade" gradientUnits="userSpaceOnUse" x1="0" y1="-60" x2="0" y2="-12">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id="harness-bot-frame" maskUnits="userSpaceOnUse" x="-400" y="-60" width="1100" height="660">
          <rect x="-400" y="-60" width="1100" height="660" fill="url(#harness-bot-fade)" />
        </mask>
      </defs>
      <g mask="url(#harness-bot-frame)">
        <ellipse className="writing-bot-shadow" cx="114.5" cy="246" rx="78" ry="9">
          {!reduce && (
            <animate
              attributeName="rx"
              dur={DUR}
              repeatCount="indefinite"
              calcMode="spline"
              {...track(SHADOW_RX)}
            />
          )}
        </ellipse>
        <g className="harness-bot-cheer">
          <g>
            {anim('rotate', SWING)}
            <g>
              {anim('translate', LIFT)}
              <g transform={`translate(${FOOT})`}>
                <g>
                  {anim('scale', SQUASH)}
                  <g transform="translate(-114 -218)">
                    <g>
                      {anim('rotate', WIGGLE)}
                      <path className="writing-bot-head" d={HEAD} />
                      <g clipPath="url(#harness-bot-head)">
                        {!reduce && (
                          <>
                            <g>{anim('translate', HEAVY)}<HeavyStraps /></g>
                            <g>{anim('translate', HOIST)}<HoistStraps /></g>
                          </>
                        )}
                        <g>{anim('translate', FIT)}<FitStraps /></g>
                        <g>
                          {anim('translate', LOOK)}
                          <g transform="translate(0 92)">
                            <g>
                              {anim('scale', BLINK)}
                              <g transform="translate(0 -92)">
                                <path className="writing-bot-eye" d={LEFT_EYE} />
                                <path className="writing-bot-eye" d={RIGHT_EYE} />
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                      {!reduce && (
                        <>
                          <g>{anim('translate', HEAVY)}<HeavyTop /></g>
                          <g>{anim('translate', HOIST)}<HoistTop /></g>
                        </>
                      )}
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
