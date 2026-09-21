import { animate, scroll } from 'motion';

/**
 * Motion only hands an animation to a native ViewTimeline when its offset
 * matches one of the named ranges exactly. Anything else silently drops to a
 * main-thread loop, which is the thing we are trying to get away from.
 */
const ENTRY_RANGE = [[0, 1], [1, 1]];
const EXIT_RANGE = [[0, 0], [1, 0]];

/**
 * Transform is written as a whole CSS string rather than Motion's `scale` /
 * `y` shorthands. The shorthands are composed in JavaScript and would land
 * back on the main thread; a plain `transform` goes straight to WAAPI and
 * rides the same native timeline as opacity.
 */
const FAR = 'translateY(52px) scale(0.52)';
const NEAR = 'translateY(0px) scale(1)';
const GONE = 'translateY(-16px) scale(0.52)';
const FAR_OPACITY = 0.08;

/**
 * Arrival finishes before the entry range is over, and departure does not
 * start until part-way through the exit range. That gap is what keeps a long
 * chapter sharp while you are reading it.
 */
const ARRIVE_TIMES = [0, 0.7, 1];
const LEAVE_TIMES = [0, 0.35, 1];

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clear(el) {
  if (!el) return;
  el.style.opacity = '';
  el.style.transform = '';
}

/**
 * Scrub every chapter's arrival and departure off scroll position.
 *
 * Arrival rides the "entry" range on `.chapter-arrive`, departure rides the
 * "exit" range on the section itself. Two elements, because a single element
 * cannot hold two competing transform animations, and two ranges because each
 * one maps to a native ViewTimeline. Only opacity and transform are touched,
 * so once attached this runs on the compositor and stays smooth even while
 * the main thread is busy.
 *
 * The timeline subject is the untransformed `.chapter-stage`, so the
 * animation's own scale can never feed back into its progress.
 */
export function initChapterMotion() {
  const stages = Array.from(document.querySelectorAll('.chapter-stage'));
  if (!stages.length) return () => {};

  const parts = stages.map((stage) => ({
    stage,
    arrive: stage.querySelector('.chapter-arrive'),
    section: stage.querySelector('.page-section[data-chapter]'),
  }));

  if (prefersReducedMotion()) {
    parts.forEach(({ arrive, section }) => {
      clear(arrive);
      clear(section);
    });
    return () => {};
  }

  const teardowns = [];

  parts.forEach(({ stage, arrive, section }) => {
    if (!arrive || !section) return;

    teardowns.push(scroll(
      animate(
        arrive,
        {
          opacity: [FAR_OPACITY, 1, 1],
          transform: [FAR, NEAR, NEAR],
        },
        { ease: 'linear', times: ARRIVE_TIMES },
      ),
      { target: stage, offset: ENTRY_RANGE },
    ));

    teardowns.push(scroll(
      animate(
        section,
        {
          opacity: [1, 1, FAR_OPACITY],
          transform: [NEAR, NEAR, GONE],
        },
        { ease: 'linear', times: LEAVE_TIMES },
      ),
      { target: stage, offset: EXIT_RANGE },
    ));
  });

  return () => {
    teardowns.forEach((stop) => {
      if (typeof stop === 'function') stop();
    });
    parts.forEach(({ arrive, section }) => {
      clear(arrive);
      clear(section);
    });
  };
}
