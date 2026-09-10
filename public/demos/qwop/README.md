# QWOP demo assets

Pose-replay page at `/demos/qwop` loads `best-run.json` plus sprite atlases.

## `best-run.json`

Current trajectory: PPO early1 `model_118M` (~43.7s Python finish, `settle_spawn=false` dive-start highlight for the site). Official browser WR keep was **45.167 HUD** (under human 45.530) on settle + official physics.

To swap the recording: replace this file, then bump `ASSET_VERSION` in `src/demos/qwopReplayEngine.js` so browsers/CDN pick up the new trajectory.

Useful meta fields for HUD labels:

- `model_label` — e.g. `"PPO early1"`
- `model_file` — path containing `early1` / `model_118M`
- `final_time` / `score_time_seconds`, `seed`, `source`, `settle_spawn`
