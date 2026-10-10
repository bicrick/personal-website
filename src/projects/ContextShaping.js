import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import {
  HeadlineCompare,
  HarnessScoreboard,
  SkeletonDemo,
  LayoutDemo,
  AgentToolsDemo,
  CompactionDemo,
  SkillDemo,
} from '../components/project/context-shaping';

function ContextShaping() {
  return (
    <ProjectDetail
      title="is your harness making your model dumber?"
      date="October 2026"
      backHref="/"
      backLabel="home"
      linkHref="https://github.com/bicrick/context-shaping"
      linkLabel="view repo"
      abstract="Same cheap model, only the harness changed: Claude Haiku 5.5 went from 63% to 100% on multi-file refactors at about 1/32 the cost per solved task."
    >
      <p>
        Same model. Same 25 multi-file refactors. Change only the harness and Haiku 5.5 goes from 63% to 100%, at $0.0510 → $0.0016 per solve (~1/32). Below: live demos of each switch on a simplified marshmallow-shaped <code>ValidationError</code> rename. Pass rates are from the study; the mini repo is labeled where simplified.
      </p>

      <HeadlineCompare />

      <h2>/ skeletonization</h2>
      <p>How much structure do you ship before the model opens a file?</p>
      <SkeletonDemo />

      <h2>/ context layout</h2>
      <p>Which files and lines actually enter the window?</p>
      <LayoutDemo />

      <h2>/ agent loop + tools</h2>
      <p>
        Grep-and-edit vs a real find-references / rename tool on the hard rename (study: 468 lines, 19 files).
      </p>
      <AgentToolsDemo />

      <h2>/ compaction</h2>
      <p>What disappears when the window fills—and what that does to the cache.</p>
      <CompactionDemo />

      <h2>/ skill file</h2>
      <p>A five-step procedure in context. Same pass rate, slightly cheaper.</p>
      <SkillDemo />

      <h2>/ scoreboard</h2>
      <p>Same tasks, real harnesses, Haiku 5.5. Combined config won the final 125/125.</p>
      <HarnessScoreboard />

      <h2>/ caveats</h2>
      <p>
        Author-made Python renames, one model, config picked on the same 25 tasks. Code-only grading lifts naive from 63% to about 75%. Real-harness cells are thin. $28.53 ·{' '}
        <a href="https://github.com/bicrick/context-shaping" target="_blank" rel="noopener noreferrer">github.com/bicrick/context-shaping</a>.
      </p>
    </ProjectDetail>
  );
}

export default ContextShaping;
