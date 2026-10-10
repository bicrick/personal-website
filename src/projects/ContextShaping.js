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

const img = (name) => `${process.env.PUBLIC_URL}/images/context-shaping/${name}`;

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
        Same model. Same 25 multi-file refactors. I changed nothing but the harness, the code wrapped around the model, and Claude Haiku 5.5 went from passing 63% of runs to passing 100%.
      </p>

      <p>
        The better harness was also cheaper. Cost per solved task fell from $0.0510 to $0.0016, roughly 1/32 of what the naive setup paid.
      </p>

      <p>
        No bigger model, no fine-tuning, no clever prompt. Just different decisions about what the model gets to see and what it gets to do.
      </p>

      <HeadlineCompare fallbackSrc={img('headline.png')} />

      <h2>/ why i cared</h2>

      <p>
        I spend a lot of time with coding agents, and most of the conversation around them is about models. Which one is smartest, which one tops the leaderboard this week, which one is worth paying for.
      </p>

      <p>
        But a model never sees your repo. It sees whatever the harness puts in front of it.
      </p>

      <p>
        The harness decides which files go into the prompt, which tools exist, what happens when the context window fills up, and whether there&apos;s a note telling the model how to approach the job. Every agent product makes those calls differently. I wanted to know how much they matter when you hold the model still.
      </p>

      <p>
        So I picked one cheap model and made every one of those decisions a switch.
      </p>

      <h2>/ what i went looking for</h2>

      <p>
        I started by reading how the tools people actually use handle context.
      </p>

      <p>
        <strong>Claude Code</strong> explores on demand with grep, glob and file reads, loads a CLAUDE.md file up front, and compacts (summarizes the conversation to free up space) near the context limit. <strong>Cursor</strong> pairs grep with semantic search over its own embedding index. <strong>Aider</strong> ships an always-on repo map: a skeleton of the codebase, built with tree-sitter and ranked with PageRank, so the model sees the shape of the code without the full text. <strong>Codex CLI</strong> compacts at 90% of the window. <strong>Gemini CLI</strong> does it at 50%.
      </p>

      <p>
        Those are real design bets: search vs. index, skeletons vs. exploration, early compaction vs. late. And most of these tools still find usages of a symbol with grep or the shell.
      </p>

      <p>
        Before the main runs I wrote down seven hypotheses. The ones that matter here:
      </p>

      <ul>
        <li>Showing the model only the right files beats dumping in the whole repo.</li>
        <li>More skeleton detail (signatures, docstrings) helps.</li>
        <li>Agent loops beat any single-shot prompt.</li>
        <li>Structured tools beat raw grep at equal or lower cost.</li>
        <li>Dropping old tool output beats summarizing, and summarizing early is worse than late.</li>
        <li>Stacking the best choices gives at least +20 points at lower cost.</li>
      </ul>

      <h2>/ how i tested it</h2>

      <p>
        <strong>The tasks:</strong> 25 refactors on three small Python libraries: tinydb, itsdangerous and marshmallow. Mostly renames of a class, function or method, plus a signature change and a few moves. Six of them are a hard tier I added once agents started acing everything: ambiguous names, a method with 80 call sites across 8 files, and an exception class referenced on 468 lines across 19 files.
      </p>

      <p>
        <strong>The grader:</strong> a run passes only if the repo&apos;s tests pass, no references to the old name remain, and a task-specific check passes. Every leftover reference counts as a <em>missed caller</em>. That&apos;s the failure you care about in real life: the rename compiles in the files you touched and breaks somewhere you didn&apos;t look.
      </p>

      <p>
        <strong>The model:</strong> Claude Haiku 5.5 only, every run costed from its logged tokens.
      </p>

      <p>
        <strong>The setups</strong>, one variable at a time:
      </p>

      <ul>
        <li>
          <strong>Context layout:</strong> the whole repo in one prompt (the naive baseline), only the files the reference solution touches (a cheat, basically), a skeleton ladder from bare file tree up to imports, signatures and docstrings, and agent loops that explore on their own.
        </li>
        <li>
          <strong>Tools:</strong> raw grep/read/edit vs. purpose-built <code>find_references</code> and <code>rename_symbol</code> tools that understand Python&apos;s syntax tree.
        </li>
        <li>
          <strong>Compaction:</strong> none, summarize at 50% or 90% of a context budget, or just drop old tool outputs.
        </li>
        <li>
          <strong>A skill file:</strong> a five-step refactor procedure, or a generic AGENTS.md conventions doc.
        </li>
      </ul>

      <p>
        Then I ran four real harnesses on the same tasks: Claude Code, OpenCode, mini-swe-agent and Aider.
      </p>

      <p>
        1,632 graded runs in total. $28.53 in API spend.
      </p>

      <h2>/ what happened</h2>

      <h3>1. More context didn&apos;t fix it</h3>

      <LayoutBars fallbackSrc={img('arm_layout.png')} />

      <p>
        My first hypothesis died fast. The whole repo in one prompt passed 69% in the main runs. Showing the model <em>only</em> the files it needed to change passed 68%.
      </p>

      <p>
        Giving it the answer key on where to look made no difference.
      </p>

      <p>
        The problem wasn&apos;t finding the files. It was writing every edit correctly in one pass. 77% of single-shot failures were missed callers, and with the full repo in the prompt, the files it forgot to update were sitting right there in front of it.
      </p>

      <p>
        On the <code>Table.insert</code> rename, which touches 80 call sites, the full-repo prompt left 37 references behind in one run.
      </p>

      <p>
        <strong>Takeaway: the model doesn&apos;t need to see more. It needs a way to check its work.</strong>
      </p>

      <h3>2. Skeletons alone fall flat</h3>

      <SkeletonLadder fallbackSrc={img('arm_ladder.png')} />

      <p>
        Repo maps are a popular idea, so I built a ladder. A bare file tree passed 45%. Adding imports got it to 61%. Adding signatures (57%) and docstrings (59%) did nothing more.
      </p>

      <p>
        Bolting a skeleton onto an agent loop didn&apos;t help either. The loop with a skeleton up front passed 92%, the loop without one passed 93%, and the skeleton doubled cost per solve ($0.0174 vs $0.0085).
      </p>

      <p>
        On repos this small, extra structure just makes the prompt longer.
      </p>

      <p>
        <strong>Takeaway: a map helps a single-shot model a little. It can&apos;t replace letting the model look around.</strong>
      </p>

      <h3>3. The loop and a real tool did the heavy lifting</h3>

      <ToolsCompare fallbackSrc={img('arm_tools.png')} />

      <p>
        Two changes carried this whole project.
      </p>

      <p>
        The first is the loop. Let the model grep, run the tests and look again, and pass rate jumps from 69% at best (single shot) to 93% for a plain agent with grep, read and edit.
      </p>

      <p>
        The second is the tool. Same loop, same prompt, but swap grep for <code>find_references</code> and <code>rename_symbol</code>. Pass rate went to 97%, cost per solve dropped from $0.0085 to $0.0016 (5.2x cheaper), and the agent made 4.3x fewer tool calls (9.2 vs 39.2 per run).
      </p>

      <p>
        That 93% vs 97% gap on its own is within the noise. The story is in the hardest task.
      </p>

      <p>
        Renaming marshmallow&apos;s <code>ValidationError</code> means changing 468 lines across 19 files. Here&apos;s what happened:
      </p>

      <p>
        The grep agent went 0 for 3. Doing that rename with grep means hundreds of tiny find-and-edit steps. All three runs burned through the 25 model turns the harness allows. They averaged 451 tool calls each. The prompt ballooned to as much as 122,762 tokens, because every grep result and file read gets carried forward into the next call.
      </p>

      <p>
        The agent with structured tools went 3 for 3. About 8 tool calls. Its prompt never went past 9,456 tokens.
      </p>

      <p>
        Same model. One of them drowned in its own search results. The other asked &quot;where is this used?&quot;, got an exact answer, and renamed it.
      </p>

      <p>
        My favorite moment came from a single-shot skeleton run on the same task. The model didn&apos;t even try. It explained that writing every occurrence as an edit block &quot;would mean reproducing most of the codebase&quot; and handed me a <code>grep | xargs sed</code> one-liner to run myself.
      </p>

      <p>
        It was right. A mechanical rename is the reliable way to do it. That&apos;s exactly the move a <code>rename_symbol</code> tool puts inside the harness.
      </p>

      <p>
        <strong>Takeaway: give the model the operation, not the raw materials.</strong>
      </p>

      <h3>4. Compaction backfired, and the prompt cache is why</h3>

      <CompactionBars fallbackSrc={img('arm_compaction_tight.png')} />

      <p>
        At a 24k-token budget, compaction barely fired, and every variant landed within a point of no compaction. So I squeezed the budget to 12k.
      </p>

      <p>
        Then they separated. Summarizing at 50% fired 6.6 times per run, dropped to 79% and cost $0.0397 per solve. Summarizing at 90% held 88%. Simply dropping old tool outputs held 93% at $0.0143, the best and cheapest of the three.
      </p>

      <p>
        The hidden cost is the prompt cache. Providers give you a big discount when the start of your prompt matches what they&apos;ve seen before. Every summary rewrites that start. Summarizing at 50% dropped the cache hit rate to 10%, against 85% with no compaction.
      </p>

      <p>
        So early summarization didn&apos;t just lose information. It also threw away the discount on every call after it.
      </p>

      <p>
        <strong>Takeaway: if you must compact, drop stale tool output first and do it late.</strong>
      </p>

      <p>
        (The skill file, if you&apos;re wondering, was a cost win, not an accuracy win: 93% either way, with cost per solve down from $0.0085 to $0.0080. The generic AGENTS.md doc passed 91% and cost more.)
      </p>

      <h3>5. The real-harness scoreboard</h3>

      <HarnessScoreboard fallbackSrc={img('arm_E_real_harnesses.png')} />

      <p>
        Stacking the winners (agent loop, structured tools, no compaction, the skill file) gave the combined harness. It passed all 125 runs in the final head-to-head. On the hard tier in the main runs, the naive prompt passed 28% and the loop with structured tools passed 100%.
      </p>

      <p>
        Then I put real tools on the same tasks, all on Haiku 5.5, all costed and graded the same way:
      </p>

      <ul>
        <li>Combined harness: 100%, $0.0017 per solve</li>
        <li>OpenCode: 94%, $0.0043</li>
        <li>mini-swe-agent: 94%, $0.0031</li>
        <li>Claude Code: 91%, $0.0048</li>
        <li>Naive full repo: 64%, $0.0653</li>
        <li>Aider (headless, single message): 18%, $0.16</li>
      </ul>

      <p>
        The autonomous agents all land in the low-to-mid 90s for a fraction of a cent. That&apos;s far above the naive setup and a little below a harness built for exactly this one job. Claude Code cost 2.8x more per solve than the combined harness. My guess is that&apos;s the price of being general-purpose, but I didn&apos;t measure it.
      </p>

      <p>
        Aider needs a fair note. In headless mode it only edits files its repo map pulled into the chat, and on one rename it ended by asking me to &quot;add them to the chat and I&apos;ll update them.&quot; It&apos;s built for a human in the loop. With nobody there, missed callers are what you&apos;d expect. This isn&apos;t a verdict on Aider as people actually use it.
      </p>

      <p>
        <strong>Takeaway: the general-purpose agents are good. A task-specific tool still beat them all.</strong>
      </p>

      <h2>/ what this means if you build agents</h2>

      <ol>
        <li>
          <strong>Ship semantic tools for the operations your model repeats.</strong> Find references, rename symbol, replace-all with match counts. Grep vs. a real find-references tool was the biggest gap I measured.
        </li>
        <li>
          <strong>Let the agent explore instead of pre-loading context.</strong> Whole-repo prompts and skeletons cost more and helped less.
        </li>
        <li>
          <strong>Protect the prompt cache.</strong> If you compact, drop old tool output before you summarize, trigger late, and keep the start of the prompt stable.
        </li>
        <li>
          <strong>Keep procedure notes short and specific.</strong> A five-step skill trimmed wasted steps. A generic conventions file didn&apos;t earn its tokens.
        </li>
      </ol>

      <h2>/ the honest caveats</h2>

      <ul>
        <li>
          <strong>Small tasks.</strong> 25 refactors on three small Python repos, written by me, mostly renames. On big repos, retrieval and skeletons may matter more.
        </li>
        <li>
          <strong>One model.</strong> Haiku 5.5 always uses extended thinking. Other models may react differently.
        </li>
        <li>
          <strong>Same tasks for picking and testing.</strong> The combined config was chosen with a rule fixed in advance, but on the same 25 tasks, so 100% is optimistic.
        </li>
        <li>
          <strong>Strict grading.</strong> The grader counts leftover names in comments too. Grade code only and the naive harness rises from 63% to about 75%. The lift shrinks to about 25 points. Still big.
        </li>
        <li>
          <strong>The real-harness numbers are a partial seed.</strong> I hit my monthly API usage limit partway through the second seed, so most cells have one seed, and some runs hit rate-limit retries.
        </li>
        <li>
          <strong>The bill:</strong> $28.53 for everything, including runs I killed and restarted.
        </li>
      </ul>

      <h2>/ the close</h2>

      <p>
        Everyone&apos;s arguing about which model to use. Fair enough. But on these tasks, the same cheap model swung from 63% to 100% based on decisions that live entirely outside it.
      </p>

      <p>
        Before you upgrade your model, check what your harness is feeding it.
      </p>

      <p>
        Every task, run log, transcript and figure is in the repo, along with one command to rebuild every number for $0:{' '}
        <a href="https://github.com/bicrick/context-shaping" target="_blank" rel="noopener noreferrer">github.com/bicrick/context-shaping</a>.
      </p>
    </ProjectDetail>
  );
}

export default ContextShaping;
