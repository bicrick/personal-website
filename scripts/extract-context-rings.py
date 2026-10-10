#!/usr/bin/env python3
"""Rebuild per-segment context-window composition from the context-shaping study.

Reads the study's results (read-only) and writes
src/components/project/context-shaping/ringData.json for the ContextRing demos.

Segment split: each prompt is rebuilt from the run transcript and split with the
study's own chars/4 estimator, then scaled so the run's largest prompt matches the
token count the API reported (notes.max_prompt_tokens for agent runs,
input + cache_read + cache_write for single-shot calls).

usage: python3 -I scripts/extract-context-rings.py /path/to/context-shaping
"""
import ast
import json
import sys
from collections import Counter
from pathlib import Path

STUDY = Path(sys.argv[1] if len(sys.argv) > 1 else "/workspace/context-shaping")
OUT = Path(__file__).resolve().parent.parent / "src/components/project/context-shaping/ringData.json"

H03 = "marshmallow-h03-rename-validationerror"
COMPACT_TASK, COMPACT_SEED = "marshmallow-t04_rename_registryerror", 0
# tool_use / tool_result blocks each carry a toolu_ id and wrapper the text estimate misses
BLOCK_OVERHEAD = 15
SEGS = ("system", "tools", "procedure", "repo", "messages", "toolout", "summary")


def literals():
    """Pull SYSTEM, TOOLS, STRUCTURED_TOOLS, SKILL out of strategies.py without importing it."""
    tree = ast.parse((STUDY / "cshape/strategies.py").read_text())
    vals = {}
    for node in tree.body:
        if isinstance(node, ast.Assign) and isinstance(node.targets[0], ast.Name):
            name = node.targets[0].id
            if name in ("SYSTEM", "TOOLS", "SKILL"):
                vals[name] = ast.literal_eval(node.value)
            elif name == "STRUCTURED_TOOLS":
                vals["_extra"] = ast.literal_eval(node.value.right)
    vals["STRUCTURED_TOOLS"] = [t for t in vals["TOOLS"] if t["name"] != "grep"] + vals.pop("_extra")
    return vals


L = literals()


def est(text):
    return len(text) // 4


def rows():
    out = {}
    for f in ("main", "hard2", "final"):
        for line in open(STUDY / f"results/{f}.jsonl"):
            r = json.loads(line)
            out[r["transcript_path"].split("/")[-1]] = r
    return out


ROWS = rows()


def load(name):
    return json.loads((STUDY / "results/transcripts" / name).read_text())["transcript"]


def find(prefix, strategy, task, seed=None, run=None):
    for name, r in ROWS.items():
        if name.startswith(f"{prefix}__{strategy}__{task}-") and (seed is None or r["seed"] == seed):
            if run is None or run in name:
                return name, r
    raise SystemExit(f"missing {prefix} {strategy} {task}")


def empty():
    return {k: 0 for k in SEGS}


def split_first(text, seg):
    """First user message: [procedure][repo skeleton]### TASK ... [### PROGRESS SO FAR summary]."""
    summary_at = text.find("### PROGRESS SO FAR")
    if summary_at >= 0:
        seg["summary"] += est(text[summary_at:])
        text = text[:summary_at]
    task_at = text.find("### TASK")
    pre, rest = text[:task_at], text[task_at:]
    skel_at = pre.find("### REPO SKELETON")
    if skel_at >= 0:
        seg["procedure"] += est(pre[:skel_at])
        seg["repo"] += est(pre[skel_at:])
    else:
        seg["procedure"] += est(pre)
    seg["messages"] += est(rest)


def msg_segments(msg, seg, first):
    c = msg["content"]
    if isinstance(c, str):
        if first:
            split_first(c, seg)
        else:
            seg["messages"] += est(c)
        return
    for b in c:
        t = b.get("type")
        if t == "tool_result":
            seg["toolout"] += BLOCK_OVERHEAD + est(b["content"] if isinstance(b["content"], str) else json.dumps(b["content"]))
        elif t == "tool_use":
            seg["messages"] += BLOCK_OVERHEAD + est(b["name"] + json.dumps(b["input"]))
        elif t == "text":
            seg["messages"] += est(b["text"])
        elif t == "thinking":
            seg["messages"] += est(b.get("thinking", ""))


def tools_for(strategy):
    return L["STRUCTURED_TOOLS"] if strategy in ("agentic_tools", "combined") else L["TOOLS"]


def tool_label(msg):
    names = Counter(b["name"] for b in msg["content"] if isinstance(b, dict) and b.get("type") == "tool_use")
    return " · ".join(f"{n} ×{c}" if c > 1 else n for n, c in names.most_common())


def agent_frames(transcript, strategy, real_peak, mode=None):
    """One frame per API call, rebuilt from the message history (and pre-compaction snapshots)."""
    snaps = transcript["pre_compaction_histories"] + [transcript["messages"]]
    base = {"system": est(transcript["system"]), "tools": est(json.dumps(tools_for(strategy)))}
    frames, prev, start = [], None, 1
    for j, hist in enumerate(snaps):
        for n in range(start, len(hist), 2):
            if hist[n]["role"] != "assistant":
                continue
            prompt = hist[:n]
            seg = empty()
            seg.update(base)
            for i, m in enumerate(prompt):
                msg_segments(m, seg, i == 0)
            shared, shared_turns = 0, 0
            if prev is not None:
                shared = base["system"] + base["tools"]
                for a, b in zip(prev, prompt):
                    if a != b:
                        break
                    s = empty()
                    msg_segments(b, s, b is prompt[0])
                    shared += sum(s.values())
                    shared_turns += b["role"] == "assistant"
            frame = {"seg": seg, "cached": shared, "sharedTurns": shared_turns,
                     "turns": sum(m["role"] == "assistant" for m in prompt),
                     "did": tool_label(prompt[-2]) if n >= 2 else "task"}
            if frames and frames[-1].get("pendingEvent"):
                frame["event"] = frames[-1].pop("pendingEvent")
            frames.append(frame)
            prev = prompt
        if j < len(snaps) - 1:
            frames[-1]["pendingEvent"] = "summarized" if mode == "summary" else "dropped old tool outputs"
            start = 1 if mode == "summary" else len(hist)
    for f in frames:
        f.pop("pendingEvent", None)
    # cumulative tool calls: count tool_use blocks already answered in each prompt is
    # not recoverable across summaries, so count from the frame labels instead
    total = 0
    for f in frames:
        if f["did"] != "task":
            total += sum(int(p.split("×")[1]) if "×" in p else 1 for p in f["did"].split(" · "))
        f["calls"] = total
    # Visible text is scaled by the measured code tokenization factor. Whatever the API
    # counted beyond that at the peak call is the model's own carried-over turns (hidden
    # thinking is kept through a tool loop), spread over turns in proportion to turn count.
    peak = max(frames, key=lambda f: sum(f["seg"].values()))
    resid = real_peak - CODE_FACTOR * sum(peak["seg"].values())
    k, per_turn = CODE_FACTOR, 0.0
    if resid < 0 or not peak["turns"]:
        k = real_peak / sum(peak["seg"].values())
    else:
        per_turn = resid / peak["turns"]
    for f in frames:
        seg = {s: v * k for s, v in f["seg"].items() if v}
        f["reasoning"] = round(per_turn * f["turns"])
        if f["reasoning"]:
            seg["messages"] = seg.get("messages", 0) + f["reasoning"]
        f["seg"] = {s: round(v) for s, v in seg.items()}
        f["total"] = sum(f["seg"].values())
        f["cached"] = round(f["cached"] * k + per_turn * f.pop("sharedTurns"))
        f.pop("turns")
    return frames, round(k, 3)


def single_frames(transcript, row):
    """Single-shot (and skeleton select-then-edit) prompts, scaled to the API-reported total."""
    frames = []
    for call in transcript:
        text = call["request"][0]["content"]
        seg = empty()
        seg["system"] = est(L["SYSTEM"])
        task_at = text.find("### TASK")
        seg["repo"] = est(text[:task_at])
        seg["messages"] = est(text[task_at:])
        frames.append(seg)
    t = row["tokens"]
    real = t["input"] + t["cache_read"] + t["cache_write"]
    k = real / sum(sum(s.values()) for s in frames)
    out = []
    for s in frames:
        s = {key: round(v * k) for key, v in s.items() if v}
        out.append({"seg": s, "total": sum(s.values())})
    return out, round(k, 3)


def run_meta(name, r):
    n = r["notes"]
    return {
        "run": name.rsplit("-", 1)[-1].replace(".json", ""),
        "passed": r["passed"],
        "toolCalls": n.get("tool_calls"),
        "steps": n.get("steps"),
        "hitStepCap": n.get("hit_step_cap"),
        "compactions": n.get("compactions", 0),
        "missedCallers": r["missed_callers"],
        "costUsd": round(r["cost_usd"], 5),
    }


CODE_FACTOR = 1.0


def main():
    global CODE_FACTOR
    out = {
        "window": 1_000_000,
        "model": "claude-haiku-5-5",
        "task": {"id": H03, "label": "rename ValidationError → SchemaValidationError", "repo": "marshmallow", "files": 19, "lines": 468},
        "scenarios": {},
    }
    sc = out["scenarios"]
    for strat in ("full", "touched", "skel_L0", "skel_L1", "skel_L2", "skel_L3"):
        name, r = find("hard2", strat, H03)
        frames, k = single_frames(load(name), r)
        sc[strat] = {**run_meta(name, r), "frames": frames, "scale": k}
        if strat == "full":
            CODE_FACTOR = k  # API tokens per chars/4 estimate on this repo's code
    for strat, run in (("agentic", "05399428"), ("agentic_tools", "99d45084"), ("skel_retrieval", "ea7504bd")):
        name, r = find("hard2", strat, H03, run=run)
        frames, k = agent_frames(load(name), strat, r["notes"]["max_prompt_tokens"])
        sc[strat] = {**run_meta(name, r), "frames": frames, "scale": k, "peak": r["notes"]["max_prompt_tokens"]}
    name, r = find("final", "combined", H03, run="fd8eb7b5")
    frames, k = agent_frames(load(name), "combined", r["notes"]["max_prompt_tokens"])
    sc["combined"] = {**run_meta(name, r), "frames": frames, "scale": k, "peak": r["notes"]["max_prompt_tokens"]}

    comp = {"task": COMPACT_TASK, "seed": COMPACT_SEED, "budget": 12_000, "policies": {}}
    for key, strat, mode in (("none", "agentic", None), ("sum50", "agentic_c50_tight", "summary"),
                             ("sum90", "agentic_c90_tight", "summary"), ("drop", "agentic_mask_tight", "mask")):
        name, r = find("main", strat, COMPACT_TASK, seed=COMPACT_SEED)
        frames, k = agent_frames(load(name), strat, r["notes"]["max_prompt_tokens"], mode)
        comp["policies"][key] = {**run_meta(name, r), "frames": frames, "scale": k, "peak": r["notes"]["max_prompt_tokens"]}
    out["compaction"] = comp

    proc = {}
    for key, strat in (("none", "agentic"), ("skill", "agentic_skill"), ("agentsmd", "agentic_agentsmd")):
        name, r = find("main", strat, COMPACT_TASK, seed=COMPACT_SEED)
        frames, k = agent_frames(load(name), strat, r["notes"]["max_prompt_tokens"])
        proc[key] = {**run_meta(name, r), "first": frames[0], "peak": r["notes"]["max_prompt_tokens"]}
    out["procedure"] = {"task": COMPACT_TASK, "seed": COMPACT_SEED, "runs": proc, "skillTokensEst": est(L["SKILL"])}

    final = [r for r in ROWS.values() if r["strategy"] in ("full", "combined") and r["transcript_path"].startswith("results/transcripts/final__")]
    agg = {}
    for strat in ("full", "combined"):
        rs = [r for r in final if r["strategy"] == strat]
        if strat == "full":
            vals = [r["tokens"]["input"] + r["tokens"]["cache_read"] + r["tokens"]["cache_write"] for r in rs]
        else:
            vals = [r["notes"]["max_prompt_tokens"] for r in rs]
        agg[strat] = {"n": len(rs), "meanPrompt": round(sum(vals) / len(vals)), "maxPrompt": max(vals)}
    out["final"] = agg

    OUT.write_text(json.dumps(out, indent=1) + "\n")
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
