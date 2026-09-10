# QWOP demo assets

Pose-replay page at `/demos/qwop` loads `best-run.json` plus sprite atlases.

## `best-run.json`

Current file may still be an older QRDQN trajectory. A follow-up should replace it with the PPO early1 (~44s Python / WR-hunt) pose recording — **swapping that one file is enough** for the demo to show the new run.

After replacing `best-run.json`, bump `ASSET_VERSION` in `src/demos/qwopReplayEngine.js` so browsers/CDN pick up the new trajectory.

Expected meta fields (optional but useful for HUD labels):

- `model_label` — e.g. `"PPO early1"`
- `model_file` — e.g. path containing `early1` / `model_118M`
- `seed`, `final_time` / `score_time_seconds`, `source`
