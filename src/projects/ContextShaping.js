import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import {
  HeadlineCompare,
  LayoutBars,
  SkeletonLadder,
  ToolsCompare,
  CompactionBars,
  HarnessScoreboard,
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
        Same model. Same 25 multi-file refactors. I changed nothing but the harness—the code wrapped around the model—and Claude Haiku 5.5 went from passing 63% of runs to passing 100%. Cost per solved task fell from $0.0510 to $0.0016, roughly 1/32 of what the naive setup paid.
      </p>

      <p>
        A model never sees your repo. It sees whatever the harness puts in front of it: which files land in the prompt, which tools exist, what happens when the context fills up, and whether a short how-to note is there. Every agent product makes those calls differently. I held one cheap model fixed and made each of those a switch.
      </p>

      <HeadlineCompare />

      <h2>/ what i tested</h2>

      <p>
        <strong>Tasks:</strong> 25 refactors on three small Python libraries—tinydb, itsdangerous, marshmallow. Mostly renames of a class, function, or method, plus a hard tier I added once agents started hitting the ceiling: ambiguous names, a method with 80 call sites across 8 files, and an exception class referenced on 468 lines across 19 files.
      </p>

      <p>
        <strong>Grader:</strong> tests must pass and no old-name leftovers may remain (each leftover is a <em>missed caller</em>). <strong>Model:</strong> Claude Haiku 5.5 only, costed from logged tokens. <strong>Arms:</strong> context layout (full repo, oracle files, skeleton ladder, agent loops), tools (raw grep/read/edit vs <code>find_references</code> / <code>rename_symbol</code>), compaction (none, summarize at 50% or 90%, drop old tool output), and a five-step skill vs an AGENTS.md. Then the same tasks on Claude Code, OpenCode, mini-swe-agent, and Aider. 1,632 graded runs. $28.53.
      </p>

      <h2>/ more context didn&apos;t help</h2>

      <LayoutBars />

      <p>
        Full-repo single-shot passed 69%. Showing only the files that needed edits passed 68%. Giving the model the answer key on where to look made no difference. Agent loops hit 93% with grep and 92% with a skeleton up front. 77% of single-shot failures were missed callers—often in files already sitting in the prompt.
      </p>

      <h2>/ skeletons alone fall flat</h2>

      <SkeletonLadder />

      <p>
        A bare file tree passed 45%. Adding imports got to 61%. Signatures (57%) and docstrings (59%) added nothing more. Bolting a skeleton onto an agent loop passed 92% vs 93% without it, and doubled cost per solve ($0.0174 vs $0.0085). On repos this small, extra structure just makes the prompt longer.
      </p>

      <h2>/ the loop and a real tool</h2>

      <ToolsCompare />

      <p>
        Let the model grep, run tests, and look again, and pass rate jumps from 69% at best to 93%. Same loop with <code>find_references</code> and <code>rename_symbol</code>: 97% at $0.0016 instead of $0.0085—5.2x cheaper, 9.2 vs 39.2 calls per run. The hard story is marshmallow&apos;s <code>ValidationError</code> rename (468 lines, 19 files): grep went 0/3, averaging 451 tool calls and ballooning to 122,762 tokens; structured went 3/3 in about 8 calls, never past 9,456 tokens.
      </p>

      <h2>/ compaction and the cache</h2>

      <CompactionBars />

      <p>
        At a 12k budget, summarize@50% fell to 79% ($0.0397), @90% held 88%, and dropping old tool outputs held 93% ($0.0143). Early summaries also wreck the prompt cache: 10% hit rate at 50% vs 85% with no compaction. A five-step skill was a cost trim only—93% either way ($0.0085 → $0.0080); AGENTS.md passed 91%.
      </p>

      <h2>/ real harnesses</h2>

      <HarnessScoreboard />

      <p>
        Stacking the winners—agent loop, structured tools, no compaction, skill—passed all 125 final runs at $0.0017 per solve. OpenCode 94% ($0.0043), mini-swe-agent 94% ($0.0031), Claude Code 91% ($0.0048), naive 64% ($0.0653), Aider headless 18% ($0.16). On the hard tier in the main runs: naive 28%, structured loop 100%. Claude Code cost 2.8x more per solve than the combined harness on matching seeds; Aider&apos;s low score mostly reflects a human-in-the-loop design run headless.
      </p>

      <h2>/ if you build agents</h2>

      <ol>
        <li>
          <strong>Ship semantic tools</strong> for the operations the model repeats—find references, rename symbol, replace-all with counts. Grep vs a real find-references tool was the biggest gap I measured.
        </li>
        <li>
          <strong>Let the agent explore</strong> instead of pre-loading context. Whole-repo prompts and skeletons cost more and helped less.
        </li>
        <li>
          <strong>Protect the prompt cache.</strong> If you compact, drop old tool output before you summarize, and trigger late.
        </li>
        <li>
          <strong>Keep procedures short and specific.</strong> A five-step skill trimmed waste; a generic conventions file didn&apos;t earn its tokens.
        </li>
      </ol>

      <h2>/ caveats</h2>

      <p>
        Small author-made Python renames, one model (Haiku 5.5 with extended thinking), and a combined config chosen on the same 25 tasks—so 100% is optimistic. Grade leftover names in comments too strictly and the naive harness rises from 63% to about 75% if you grade code-only; the lift shrinks to about 25 points. Real-harness cells are mostly one seed. Bill: $28.53. Logs and a $0 rebuild:{' '}
        <a href="https://github.com/bicrick/context-shaping" target="_blank" rel="noopener noreferrer">github.com/bicrick/context-shaping</a>.
      </p>
    </ProjectDetail>
  );
}

export default ContextShaping;
