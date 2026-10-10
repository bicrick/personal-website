import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import ProjectFigure from '../components/project/ProjectFigure';
import ResultTable from '../components/project/ResultTable';

const img = (name) => `${process.env.PUBLIC_URL}/images/context-shaping/${name}`;

function ContextShaping() {
  return (
    <ProjectDetail
      title="same model, better harness"
      date="October 2026"
      abstract="How far can context management and tool design push a cheap model on multi-file refactors? I held Claude Haiku 5.5 fixed and changed only the harness."
    >
      <p>
        <strong>
          Same model, same 25 tasks: the naive harness passed 63% of runs, and the best harness passed 100%. That&apos;s +37 points, and cost per solved task dropped from $0.0510 to $0.0016, about 32x cheaper.
        </strong>
      </p>

      <ProjectFigure
        src={img('headline.png')}
        alt="Headline: naive full-repo prompt vs best combined harness"
        caption="Final run, 125 runs per arm (25 tasks × 5 seeds). The 95% Wilson intervals are 54%–71% for the naive harness and 97.0%–100% for the combined one."
      />

      <p>
        People argue a lot about which model writes the best code. I wanted to measure the other half: everything around the model. That&apos;s what goes into the context window, which tools the model gets, what happens when the context fills up, and whether a short how-to note helps. I picked one cheap model, wrote a small harness where each of those choices is a switch, and ran 1,632 graded runs for $28.53 in API spend.
      </p>

      <p>
        The short version: on this kind of task, the harness matters more than I expected, and two choices do most of the work: letting the model explore in a loop instead of answering in one shot, and giving it a real find-references tool instead of grep.
      </p>

      <h2>/ the setup</h2>

      <p>
        <strong>Tasks.</strong> 25 refactors on three small, pinned, pure-Python libraries: tinydb (9 tasks), itsdangerous (6) and marshmallow (10). Most are renames of a class, function or method, plus a signature change, function moves and a module move. 6 of them form a hard tier I added once the agents started hitting the ceiling. That tier has ambiguous names (renaming <code>Table.search</code> while unrelated <code>search</code> methods must survive), a method with 80 call sites across 8 files, and an exception class referenced on 468 lines across 19 files.
      </p>

      <p>
        <strong>Grader.</strong> A run passes only if three things hold: the repo&apos;s tests pass, no references to the old name remain (each leftover counts as a <em>missed caller</em>), and a task-specific check passes. Every task has a reference solution that passes the grader, and the unmodified repo fails it (<code>python -m cshape verify</code>).
      </p>

      <p>
        <strong>Model and cost.</strong> Only <code>claude-haiku-5-5</code>, with prompt caching on, and every run costed at list price from its logged token counts. A hard cap in the harness refuses API calls past $50.
      </p>

      <p>
        <strong>What I varied</strong> (one arm at a time, with plain grep/read/edit as the agentic base):
      </p>

      <ul>
        <li>
          <strong>Context layout:</strong> the whole repo in one prompt (<code>full</code>, the naive baseline), only the files the reference solution touches (an oracle), a skeleton ladder from file tree (L0) to imports (L1), signatures (L2) and docstrings (L3), and agent loops that explore on their own.
        </li>
        <li>
          <strong>Tool design:</strong> raw <code>grep</code> / <code>read_file</code> / <code>edit</code> vs structured <code>find_references</code> (AST-aware, grouped into definitions, imports, code and comments), <code>rename_symbol</code> with a dry-run preview, and a replace-all edit that reports match counts.
        </li>
        <li>
          <strong>Compaction:</strong> none, summarize at 50% or 90% of a context budget, or drop old tool outputs. I ran it at a 24k budget and again at 12k.
        </li>
        <li>
          <strong>Procedural context:</strong> nothing, a five-step refactor skill (&quot;find all references, change, test, search again, then finish&quot;), or an AGENTS.md-style conventions doc.
        </li>
      </ul>

      <p>
        I wrote down seven hypotheses before the main runs (<code>docs/HYPOTHESES.md</code>) and fixed the rule for building the combined config in advance: for each arm, take the option with the highest pass rate, and break ties on cost. That rule picked <strong>layout = agentic, tools = structured, compaction = none, procedural = skill</strong>. The combined config then got a fresh final run against the naive baseline, 5 seeds on every task.
      </p>

      <h2>/ finding 1: showing the model the right files doesn&apos;t fix single-shot</h2>

      <ProjectFigure
        src={img('arm_layout.png')}
        alt="Pass rate by context layout"
      />

      <p>
        Every single-shot layout tops out around 69%: the naive full-repo prompt passed 69%, and an oracle that sees only the files the reference solution touches passed 68%. So the bottleneck isn&apos;t finding the right files. It&apos;s writing every edit correctly in one pass. 77% of single-shot failures are missed callers, and with the full repo in the prompt, the Python files it failed to update were already in front of it.
      </p>

      <p>
        Agent loops that can grep, run the tests and look again land at 93% (<code>agentic</code>) and 92% (<code>skeleton + tools</code>, the same loop with an L2 skeleton up front). The skeleton bought nothing on pass rate and doubled cost per solve ($0.0174 vs $0.0085).
      </p>

      <ProjectFigure
        src={img('arm_ladder.png')}
        alt="Skeleton ladder"
      />

      <p>
        On the ladder itself, a bare file tree isn&apos;t enough (L0, 45%) and adding imports helps (L1, 61%). Signatures (L2, 57%) and docstrings (L3, 59%) add nothing more. On repos this small, the extra detail just makes the prompt longer.
      </p>

      <h2>/ finding 2: once the agent can explore, a real find-references tool is the biggest lever</h2>

      <ProjectFigure
        src={img('arm_tools.png')}
        alt="Raw grep/edit vs structured tools"
      />

      <p>
        Same agent loop and same prompt; only the tools changed. Raw grep/read/edit passed 93% at $0.0085 per solve. With <code>find_references</code> and <code>rename_symbol</code> it passed 97% at $0.0016, which is 5.2x cheaper. The structured agent also made 4.3x fewer tool calls (9.2 vs 39.2 per run).
      </p>

      <p>
        The pass-rate gap is inside the confidence intervals over all tasks. It shows up clearly on the biggest refactor, though. On the <code>ValidationError</code> rename (468 referencing lines), the grep agent passed 0/3 and the structured agent passed 3/3. Doing that rename with grep means hundreds of small edits. All 3 grep-agent runs used up the 25 model turns the harness allows. They averaged 451 tool calls, since the model can call several tools in one turn, and the prompt grew to as much as 122,762 tokens. The structured agent finished in about 8 calls, and its prompt never went past 9,456 tokens.
      </p>

      <p>
        The cost drop is about more than fewer calls. Each grep-and-read step adds tool output that later calls carry along as context. A tool that answers &quot;where is this used?&quot; exactly keeps the context small and focused on the task.
      </p>

      <h2>/ finding 3: compaction only matters when it fires, and then summarizing early hurts</h2>

      <ProjectFigure
        src={img('arm_compaction.png')}
        alt="Compaction at a 24k budget"
      />

      <p>
        At a 24k-token budget, compaction barely fired: about 1.0 compactions per run when summarizing at 50%, and 0.4 at 90%. All three variants landed within a few points of no compaction (92%, 92% and 92% vs 93%), so I re-ran them at 12k.
      </p>

      <ProjectFigure
        src={img('arm_compaction_tight.png')}
        alt="Compaction at a 12k budget"
      />

      <p>
        At 12k they separate. Summarizing at 50% fired 6.6 times per run and dropped to 79% at $0.0397 per solve. Summarizing at 90% held 88%. Dropping old tool outputs held 93% at $0.0143, the best and cheapest of the three. That&apos;s what I pre-registered, and it lines up with JetBrains Research&apos;s{' '}
        <a href="https://arxiv.org/abs/2508.21433" target="_blank" rel="noopener noreferrer">The Complexity Trap</a>
        : on SWE-bench Verified, across five model configurations, plain observation masking matched LLM summarization&apos;s solve rate and was cheaper in four of the five.
      </p>

      <p>
        Part of the cost is the prompt cache. Every summary rewrites the prompt prefix, so summarizing at 50% dropped the cache hit rate to 10%, against 85% with no compaction.
      </p>

      <h2>/ finding 4: a five-step skill is a cost win, not an accuracy win</h2>

      <ProjectFigure
        src={img('arm_skills.png')}
        alt="Skill file vs AGENTS.md"
      />

      <p>
        The refactor skill passed 93%, the same as no skill (93%). It did cut cost per solve from $0.0085 to $0.0080, which is why the selection rule kept it. The generic AGENTS.md conventions doc passed 91% and cost more ($0.0092). A specific procedure beat general advice, but neither changed much.
      </p>

      <h2>/ where the configs separate: the hard tier</h2>

      <ResultTable
        caption="Main runs. Base = the 19 original tasks, hard = the 6 hard-tier tasks."
        columns={['Config', 'Base tasks', 'Hard tasks']}
        rows={[
          ['full repo (naive)', '82% (n=57)', '28% (n=18)'],
          ['touched files (oracle)', '79% (n=57)', '33% (n=18)'],
          ['L1 +imports', '71% (n=56)', '28% (n=18)'],
          ['skeleton + tools', '95% (n=57)', '83% (n=18)'],
          ['agentic grep/read', '96% (n=57)', '83% (n=18)'],
          ['agentic + structured tools', '96% (n=57)', '100% (n=18)'],
          ['refactor skill', '96% (n=57)', '83% (n=18)'],
          ['drop old output (12k)', '97% (n=38)', '83% (n=18)'],
        ]}
      />

      <p>
        On the base tasks, any agent loop scores in the 90s, and the configs look interchangeable. The hard tier pulls them apart. High fan-out renames break single-shot outright, and the grep agent slips on the largest one.
      </p>

      <h2>/ the frontier</h2>

      <ProjectFigure
        src={img('pareto.png')}
        alt="Cost per solved task vs pass rate, every config"
      />

      <p>
        Plotting every config by cost per solve against pass rate, the combined harness is the only point on the frontier. Nothing else is both cheaper and more accurate. Agentic + structured tools sits just below it, and everything single-shot is in the expensive, inaccurate corner.
      </p>

      <p>
        In the final head-to-head, the naive harness failed every seed on 6 of 25 tasks and passed every seed on 11. The combined harness passed all 125 runs.
      </p>

      <details>
        <summary>Per-task results, final run</summary>
        <ResultTable
          columns={['Task', 'Tier', 'Naive (full repo)', 'Combined harness']}
          rows={[
            ['marshmallow-h02_rename_load_default', 'hard', '0/5', '5/5'],
            ['marshmallow-h03-rename-validationerror', 'hard', '0/5', '5/5'],
            ['marshmallow-t03_rename_orderedset_class', 'base', '0/5', '5/5'],
            ['marshmallow-t04_rename_registryerror', 'base', '0/5', '5/5'],
            ['tinydb-h02-rename-table-insert', 'hard', '0/5', '5/5'],
            ['tinydb-t05-rename-freeze', 'base', '0/5', '5/5'],
            ['marshmallow-h01-rename-utils-get-value', 'hard', '2/5', '5/5'],
            ['tinydb-h01-rename-table-search', 'hard', '2/5', '5/5'],
            ['tinydb-t07_rename_jsonstorage', 'base', '2/5', '5/5'],
            ['marshmallow-t05_rename_get_class', 'base', '3/5', '5/5'],
            ['tinydb-t04-rename-frozendict', 'base', '3/5', '5/5'],
            ['itsdangerous-h01-rename-serializer-loads', 'hard', '4/5', '5/5'],
            ['marshmallow-t07-move-orderedset-module', 'base', '4/5', '5/5'],
            ['tinydb-t01-rename-lrucache', 'base', '4/5', '5/5'],
            ['itsdangerous-t01_rename_want_bytes', 'base', '5/5', '5/5'],
            ['itsdangerous-t02_rename_make_keys_list', 'base', '5/5', '5/5'],
            ['itsdangerous-t03_rename_compactjson', 'base', '5/5', '5/5'],
            ['itsdangerous-t04_rename_derive_key', 'base', '5/5', '5/5'],
            ['itsdangerous-t05-move-int-codec', 'base', '5/5', '5/5'],
            ['marshmallow-t01_rename_is_collection', 'base', '5/5', '5/5'],
            ['marshmallow-t02_rename_set_value', 'base', '5/5', '5/5'],
            ['marshmallow-t06_rename_stringnotcollection', 'base', '5/5', '5/5'],
            ['tinydb-t02-rename-next-id', 'base', '5/5', '5/5'],
            ['tinydb-t03-touch-signature', 'base', '5/5', '5/5'],
            ['tinydb-t06-move-with-typehint', 'base', '5/5', '5/5'],
          ]}
        />
      </details>

      <h2>/ how the runs failed</h2>

      <ProjectFigure
        src={img('failures.png')}
        alt="Failure categories per config"
      />

      <p>
        Every failed run gets an automatic tag from the grader output and the transcript.
      </p>

      <ResultTable
        columns={['Config', 'Failed runs', 'missed caller', 'broken import', 'output truncated', 'no edit']}
        rows={[
          ['full repo (naive)', '23 of 75', '19', '1', '3', '0'],
          ['touched files (oracle)', '24 of 75', '20', '1', '3', '0'],
          ['skeleton L0 tree', '41 of 75', '17', '20', '4', '0'],
          ['L2 +signatures', '32 of 75', '29', '0', '3', '0'],
          ['skeleton + tools', '6 of 75', '6', '0', '0', '0'],
          ['agentic grep/read', '5 of 75', '4', '1', '0', '0'],
          ['agentic + structured tools', '2 of 75', '2', '0', '0', '0'],
          ['summarize @50% (12k)', '12 of 56', '9', '3', '0', '0'],
        ]}
      />

      <p>
        Here are four real examples from the logs.
      </p>

      <p>
        <strong>Missed callers (naive, full repo).</strong> Renaming <code>Table.insert</code> to <code>insert_document</code> means touching 80 call sites. In the final run (seed 0), the full-repo prompt left 37 references behind. Here are the first few:
      </p>

      <pre><code>{`    tests/test_queries.py:204: db.insert({'name': 'John'})
    tests/test_queries.py:205: db.insert({'name': 'johnny'})
    tests/test_tinydb.py:140: db.insert(object())  # type: ignore
    tests/test_tinydb.py:158: db.insert(CustomDocument({'int': 1, 'char': 'a'}))`}</code></pre>

      <p>
        <strong>Giving up (L3 skeleton, the 468-line <code>ValidationError</code> rename).</strong> Single-shot SEARCH/REPLACE output hits the 16k output cap on the biggest rename. In one run (seed 2) the model didn&apos;t attempt the edits at all. It explained why and handed back a <code>grep | xargs sed</code> one-liner for me to run instead:
      </p>

      <blockquote>
        I can&apos;t return a complete set of edit blocks for this rename. <code>ValidationError</code> appears roughly 400 times across about 20 files, including <code>fields.py</code>, <code>schema.py</code>, <code>validate.py</code>, the test suite, and the examples. Writing every occurrence as a SEARCH/REPLACE block would mean reproducing most of the codebase, and a partial set would leave imports broken. A mechanical rename is the reliable way to do this.
      </blockquote>

      <p>
        That&apos;s a sensible answer, and it&apos;s exactly the move a <code>rename_symbol</code> tool makes available inside the harness.
      </p>

      <p>
        <strong>Missed caller, or a grader that&apos;s too strict? (agent with AGENTS.md).</strong> The grader counts every whole-word match of the old name, comments included. Here the leftover was <code>tinydb/queries.py:82: # Contains something we can&apos;t freeze (e.g. a numpy array) --</code>, which uses &quot;freeze&quot; as a verb, and the agent said so (seed 2):
      </p>

      <blockquote>
        All 228 tests pass. The only remaining &quot;freeze&quot; match is a prose comment in <code>queries.py</code> (&quot;something we can&apos;t freeze&quot;), which is a verb rather than a reference to the function, so I left it alone.
      </blockquote>

      <p>
        I count that as a fail because the task asks for zero matches and the reference solution manages it, but the agent&apos;s reading is reasonable. The limitations section shows how much the headline depends on this.
      </p>

      <p>
        <strong>Waiting for a human (Aider).</strong> In headless single-message mode, Aider edits only the files its repo map pulled into the chat. On the <code>LRUCache</code> rename it left 3 missed callers and ended with:
      </p>

      <blockquote>
        If the grep finds matches in other files, such as <code>docs/</code>, add them to the chat
        <br />
        and I&apos;ll update them.
      </blockquote>

      <p>
        That&apos;s not a bug in Aider. It&apos;s built for a person in the loop who adds files when asked. With nobody there, missed callers are what you&apos;d expect.
      </p>

      <h2>/ real harnesses on the same tasks</h2>

      <ProjectFigure
        src={img('arm_E_real_harnesses.png')}
        alt="Real harnesses vs naive and combined"
      />

      <p>
        I ran four real harnesses headless on Haiku 5.5, behind a logging proxy so all of them are costed the same way and graded by the same grader: Claude Code (closed source, as a reference), OpenCode, mini-swe-agent and Aider.
      </p>

      <ResultTable
        columns={['Harness', 'Pass rate', 'n', 'Cost per solve']}
        rows={[
          ['Combined harness (same seeds)', '100%', '50', '$0.0017'],
          ['OpenCode', '94%', '33', '$0.0043'],
          ['mini-swe-agent', '94%', '33', '$0.0031'],
          ['Claude Code', '91%', '34', '$0.0048'],
          ['Aider (single-message mode)', '18%', '33', '$0.16'],
          ['Naive full repo (same seeds)', '64%', '50', '$0.0653'],
        ]}
      />

      <p>
        The three autonomous agents land in the low-to-mid 90s for a fraction of a cent per solve: well above the naive harness, a little below a harness built for this one job. Claude Code cost 2.8x more per solve than the combined harness on matching seeds. My guess is that&apos;s the price of being general (a bigger system prompt, tools for everything rather than just renames), but I didn&apos;t measure it. Aider&apos;s low score mostly reflects the human-in-the-loop design described above. Even on its 16 runs with no rate-limit errors, it passed just 19%.
      </p>

      <p>
        Treat these numbers as indicative. My Anthropic account hit its monthly usage limit partway through a second seed, so most cells have one seed and a few have two. Some runs also overlapped heavy traffic from the main experiment and hit 429 retries (18 of mini-swe-agent&apos;s runs and 17 of Aider&apos;s).
      </p>

      <h2>/ how this maps to the tools people actually use</h2>

      <p>
        From my notes on each tool (<code>docs/research/</code>):
      </p>

      <ul>
        <li>
          <strong>Claude Code</strong> explores on demand with grep, glob and read, loads CLAUDE.md up front, compacts near the context limit and clears old tool results. That&apos;s close to the agent-loop-plus-drop-old-output corner that did well here.
        </li>
        <li>
          <strong>Cursor</strong> pairs grep with semantic search over its own embedding index, and reports that the pair beats grep alone, with bigger gains on repos of 1,000+ files. My repos are small, so this setup probably understates retrieval. I didn&apos;t run Cursor here.
        </li>
        <li>
          <strong>Aider</strong> is the main tool that ships an always-on skeleton, a tree-sitter repo map ranked with PageRank. My ladder suggests a map helps a single-shot model a little but can&apos;t replace a search loop.
        </li>
        <li>
          <strong>Codex CLI</strong> compacts at 90% of the window and <strong>Gemini CLI</strong> at 50%. At a tight budget in my runs, the earlier trigger cost the most and passed the least.
        </li>
        <li>
          <strong>SWE-agent</strong>&apos;s classic setup keeps only the last few tool outputs (observation masking), the cheapest kind of compaction and the strongest variant here.
        </li>
      </ul>

      <p>
        Most of these tools find usages with grep or the shell. Symbol-aware tooling, where it exists, tends to be an add-on (Claude Code&apos;s LSP plugins, for example). That&apos;s a pattern from my notes, not an audit of every default. For a cheap model doing refactors, grep versus a real find-references tool was the biggest gap I measured.
      </p>

      <h2>/ what I&apos;d build into a harness, based on this</h2>

      <ol>
        <li>
          Give the model semantic tools for the operations it repeats: find references, rename symbol, replace-all with counts. Don&apos;t make it do those with grep.
        </li>
        <li>
          Let the agent explore instead of pre-loading context. Skeletons and whole-repo prompts cost more and helped less.
        </li>
        <li>
          If you have to compact, drop old tool output before you summarize, and trigger late. Keep the prompt prefix stable so the cache keeps working.
        </li>
        <li>
          A short task-specific procedure is cheap and trims wasted steps. A generic conventions file didn&apos;t earn its tokens.
        </li>
      </ol>

      <h2>/ pre-registered hypotheses: how they held up</h2>

      <ul>
        <li>
          <strong>H1 (the oracle beats the naive full-repo prompt):</strong> not supported. Touched files passed 68% and the full repo passed 69%. Full repo was the most expensive config ($0.0833 per solve, with almost no cache hits).
        </li>
        <li>
          <strong>H2 (pass rate rises from L0 to L2):</strong> partly. L0 to L1 was the big step (45% to 61%), and L2 and L3 added nothing.
        </li>
        <li>
          <strong>H3 (agent loops beat every single-shot layout):</strong> supported, 93% and 92% vs at most 69%. The skeleton did not reduce tool calls (39.1 vs 39.2).
        </li>
        <li>
          <strong>H4 (structured tools beat raw tools at equal or lower cost):</strong> supported on cost (5.2x) and on the hardest task. The overall pass-rate gap is within noise.
        </li>
        <li>
          <strong>H5 (dropping tool output beats summarizing; 50% is worse than 90%):</strong> supported at the 12k budget, untestable at 24k.
        </li>
        <li>
          <strong>H6 (a skill file helps more than AGENTS.md):</strong> partly. The skill beat AGENTS.md but matched no skill on pass rate, and won only on cost.
        </li>
        <li>
          <strong>H7 (+20 points or more at lower cost):</strong> supported, +36.8 points at 32x lower cost per solve.
        </li>
      </ul>

      <h2>/ limitations</h2>

      <ul>
        <li>
          <strong>Small, author-made tasks.</strong> 25 refactors on three small Python repos, written by me. Renames dominate. Retrieval and skeletons may matter more on large repos, and other kinds of edits may favor other configs.
        </li>
        <li>
          <strong>The combined config was chosen on the same tasks it was tested on.</strong> The final run was a separate run, but it used the same 25 tasks, so 100% is optimistic. The selection rule was fixed in advance, which limits the damage but doesn&apos;t remove it.
        </li>
        <li>
          <strong>The grader is strict about comments.</strong> If I grade only code (tests pass, check passes, no leftover reference outside comments and strings), the naive harness rises from 63% to 75% (15 of its failures were comment-only), and the combined harness stays at 100%. The lift shrinks to about 25 points but is still large.
        </li>
        <li>
          <strong>The naive baseline&apos;s cost depends on the prompt cache.</strong> Its whole-repo prompt is the same for every seed of a task, so it&apos;s cheap when seeds run close together and expensive when they don&apos;t. In the main runs the cache hit rate was 3% and it cost $0.0833 per solve. In the final run it was 54% and $0.0510. The headline uses the final run, so the 32x cost gap is the conservative number. Against the main-run baseline it would be about 51x.
        </li>
        <li>
          <strong>One model.</strong> Haiku 5.5 always uses extended thinking. A model without it, or a bigger one, could respond differently to the same harness changes.
        </li>
        <li>
          <strong>The real-harness comparison is thin.</strong> Mostly one seed, a partial second seed, out-of-the-box settings, and some rate-limit noise (see above).
        </li>
        <li>
          <strong>Bookkeeping.</strong> The ledger shows $28.53 spent, and the per-run logs (including retried and duplicate rows) account for $27.52. The remaining $1.01 is API spend from runs I killed and restarted during the night, which never wrote a row. 36 runs were logged twice by overlapping jobs ($1.80); the stats keep one copy of each. One cell (L1 skeleton, one marshmallow task, seed 0) is missing, so that config has n=74.
        </li>
      </ul>

      <h2>/ what&apos;s next</h2>

      <ul>
        <li>
          <strong>A SWE-bench Verified subset</strong> to check whether the tool-design result holds on real bug fixes. It needs Docker, which this box doesn&apos;t have yet.
        </li>
        <li>
          <strong>Bigger repos</strong>, where retrieval should start to pay off, and{' '}
          <a href="https://arxiv.org/abs/2503.07832" target="_blank" rel="noopener noreferrer">RefactorBench</a>
          -style tasks I didn&apos;t write myself (its baseline agent solved none of the tasks that needed edits in more than six files, the same high-fan-out regime where structured tools made the biggest difference here).
        </li>
        <li>
          <strong>The RL-environment angle.</strong> Each task plus its grader is a small, cheap environment. &quot;Missed callers&quot; is a dense, verifiable signal instead of a single pass/fail bit, and an episode with the combined harness costs about $0.0016. At that price, the same setup could be a training environment, not just an eval.
        </li>
      </ul>

      <h2>/ reproduce it</h2>

      <pre><code>{`make reproduce   # every run in this article (needs ANTHROPIC_API_KEY; I spent $28.53 including restarts; hard-capped at $50)
make figures     # rebuild every number, chart and this article from the committed logs, $0`}</code></pre>

      <p>
        Every number in this article is filled in by <code>python -m cshape.article</code> from <code>results/article_numbers.json</code> and <code>results/article_extras.json</code>, which are rebuilt from the raw run logs in <code>results/*.jsonl</code>. Full transcripts for all 1,632 runs are in <code>results/transcripts/</code>.
      </p>
    </ProjectDetail>
  );
}

export default ContextShaping;
