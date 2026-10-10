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
      abstract="I held one cheap model fixed and changed only the code wrapped around it, to see how much the harness matters on multi-file refactors."
    >
      <p>
        Every few weeks there's a new argument about which model is best at coding. A benchmark
        drops, the leaderboard shuffles, everyone picks a side.
      </p>
      <p>
        I kept wondering about the other half of the system. A model never sees your repo. It sees
        whatever the harness puts in front of it: which files, which tools, what survives when the
        context window fills up.
      </p>
      <p>
        Every coding agent makes those calls differently, and almost nobody isolates them. So I
        wanted to know how much of an agent's performance comes from the model, and how much comes
        from the code around it.
      </p>

      <h2>/ the question</h2>
      <p>
        To answer that, I had to hold the model still. I picked Claude Haiku 5.5: capable enough to
        do real work, cheap enough to run over a thousand times. Only the harness changed, so any
        difference in results is the harness's doing.
      </p>
      <p>
        First I read how real tools handle context. Claude Code explores with grep and file reads
        and compacts near the context limit. Cursor adds semantic search over its own index. Aider
        ships an always-on repo map, a skeleton of the codebase. Codex CLI compacts at 90% of the
        window, Gemini CLI at 50%.
      </p>
      <p>
        Those are real design bets, and I couldn't find anyone testing them against each other
        with the model held fixed. Prior work like context rot and LongCodeBench mostly shows that
        long context hurts on its own. And most coding benchmarks, SWE-bench included, are bug
        fixes that touch one or two files.
      </p>
      <p>
        So I went with multi-file refactors. Rename a class used in 19 files and you either update
        every reference or you don't. Each leftover is a <em>missed caller</em>, and you can count
        them.
      </p>
      <p>
        I wrote 25 refactors on three small Python libraries: tinydb, itsdangerous and marshmallow.
        Mostly renames, plus a few moves. Six are a hard tier I added once the agents started
        acing the rest. A run passes only if the tests pass, no references to the old name remain,
        and a task-specific check passes. I wrote my hypotheses down before the main runs.
      </p>

      <h2>/ skeletons</h2>
      <p>
        The first idea is Aider's: show the model a skeleton of the repo instead of the full code.
        I built a ladder from the bare file tree up through imports, signatures and docstrings.
        The model picks files from the skeleton, then writes its edits in one shot.
      </p>
      <SkeletonDemo />

      <h2>/ context layout</h2>
      <p>
        Next, what goes into the window at all? The naive baseline dumps the whole repo into one
        prompt. The other extreme is a cheat: only the files the reference solution
        touches. Then there are agent loops that start with nothing and search for what they need.
      </p>
      <LayoutDemo />

      <h2>/ agent loop + tools</h2>
      <p>
        An agent loop lets the model act, check the result and try again, for up to 25 turns. I
        gave it two toolkits. One is the raw set most agents use: grep, read, edit. The other
        understands Python's syntax tree: <code>find_references</code> sorts hits into definitions,
        imports and calls, and <code>rename_symbol</code> renames every site at once. Same loop,
        same prompt.
      </p>
      <AgentToolsDemo />

      <h2>/ compaction</h2>
      <p>
        Long agent runs fill the window, so harnesses compact. I tried no compaction, summarizing
        at 50% or 90% of a budget (the Gemini CLI and Codex CLI triggers), and just dropping old
        tool outputs.
      </p>
      <CompactionDemo />

      <h2>/ skill file</h2>
      <p>
        Last, procedural context: a five-step refactor skill vs. a generic AGENTS.md-style
        conventions doc vs. nothing.
      </p>
      <SkillDemo />
      <p>
        I also ran four real harnesses on the same tasks and model: Claude Code, OpenCode,
        mini-swe-agent and Aider. In total, 1,632 graded runs for $28.53.
      </p>

      <h2>/ what happened</h2>
      <p>
        My first hypothesis died fast. The whole repo in one prompt passed 69% in the main runs.
        Only the files it needed: 68%. The problem wasn't finding files, it was getting every edit
        right in one pass. 77% of single-shot failures were missed callers.
      </p>
      <p>
        Skeletons didn't fix that. The file tree passed 45% and imports got it to 61%, but
        signatures (57%) and docstrings (59%) added nothing. In front of an agent loop, a skeleton
        doubled cost per solve ($0.0174 vs $0.0085) for no gain.
      </p>
      <p>
        The loop was the first big jump: from 69% at best for single shot to 93%.
      </p>
      <p>
        The tools were the second. Swapping grep for <code>find_references</code> and{' '}
        <code>rename_symbol</code> raised pass rate to 97%, cut cost per solve from $0.0085 to
        $0.0016 (5.2x cheaper), and took 4.3x fewer tool calls. That 4-point gap is within the
        noise. The hardest task is where it shows.
      </p>
      <p>
        Renaming marshmallow's <code>ValidationError</code> touches 468 lines in 19 files. The grep
        agent went 0 for 3. Every run hit the 25-turn cap, averaging 451 tool calls, with prompts up
        to 122,762 tokens. The structured agent went 3 for 3 in about 8 calls, and its prompt never
        passed 9,785 tokens.
      </p>
      <p>
        My favorite moment: a single-shot run on that task didn't even try. It said writing every
        edit "would mean reproducing most of the codebase" and handed me a{' '}
        <code>grep | xargs sed</code> one-liner. It was right. A rename tool puts that move inside
        the harness.
      </p>
      <p>
        Compaction backfired. At a tight 12k-token budget, summarizing at 50% fell to 79% and cost
        $0.0397 per solve. Summarizing at 90% held 88%. Dropping old tool outputs held 93% at
        $0.0143, the best and cheapest. The hidden cost is the prompt cache: every summary rewrites
        the start of the prompt, and summarizing at 50% took the cache hit rate from 85% to 10%.
      </p>
      <p>
        The skill file was a cost win, not an accuracy win: 93% either way, $0.0085 down to $0.0080
        per solve. The AGENTS.md doc passed 91% and cost more.
      </p>
      <p>
        The real harnesses landed in the low-to-mid 90s for a fraction of a cent per solve. Headless
        Aider passed 18%, but it's built for a human in the loop, so that's no verdict on Aider.
      </p>
      <HarnessScoreboard />

      <h2>/ the headline</h2>
      <p>
        Then I stacked the winners, picked by a rule fixed in advance: agent loop, structured
        tools, no compaction, skill file. In the final head-to-head, five seeds on all 25 tasks,
        the naive full-repo prompt passed 63%. The combined harness passed all 125 runs.
      </p>
      <p>
        It was also cheaper. Cost per solved task fell from $0.0510 to $0.0016, about 1/32.
      </p>
      <HeadlineCompare />

      <h2>/ what it means</h2>
      <p>If you build agents, here's what I'd take from this:</p>
      <ul>
        <li>
          Ship real tools for the operations your model repeats. That was the biggest gap I
          measured.
        </li>
        <li>Let the agent explore instead of preloading context.</li>
        <li>
          Protect the prompt cache. If you compact, drop old tool output before you summarize, and
          do it late.
        </li>
        <li>Keep procedure notes short and specific. A generic conventions file didn't earn its tokens.</li>
      </ul>

      <h2>/ caveats</h2>
      <p>
        These are 25 small Python refactors I wrote myself, on one model. On big repos, retrieval
        and skeletons may matter more. The combined config was picked on the same tasks it was
        tested on, so 100% is optimistic. The grader counts leftover names in comments too; grade
        code only and naive rises to about 75%, still a lift of about 25 points. The real-harness
        numbers are thin, since I hit my API usage limit partway through the second seed.
      </p>
      <p>
        Next I want to run a subset of SWE-bench Verified, to see whether this holds on bug fixes
        in real repos.
      </p>

      <h2>/ the close</h2>
      <p>
        Everyone's arguing about which model to use. But on these tasks, the same cheap model swung
        from 63% to 100% on decisions that live entirely outside it.
      </p>
      <p>
        Before you upgrade your model, check what your harness is feeding it. Every task, run log
        and transcript is at{' '}
        <a href="https://github.com/bicrick/context-shaping" target="_blank" rel="noopener noreferrer">github.com/bicrick/context-shaping</a>.
      </p>
    </ProjectDetail>
  );
}

export default ContextShaping;
