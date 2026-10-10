import React from 'react';
import Critter from '../Critter';
import { CcWindow, CcBar } from '../cc';

// The context panel from the Claude Code app, filled with a real session.
const ROWS = [
  { label: 'Messages', tone: 'c-msg', value: 408900, shown: '408.9k' },
  { label: 'System tools', tone: 'c-tool', value: 17000, shown: '17k' },
  { label: 'MCP tools', tone: 'c-mcp', value: 13700, shown: '13.7k' },
  { label: 'Skills', tone: 'c-skill', value: 6200, shown: '6.2k' },
  { label: 'System prompt', tone: 'c-sys', value: 5700, shown: '5.7k' },
  { label: 'Memory files', tone: 'c-sys', value: 61, shown: '61' },
  { label: 'Autocompact buffer', tone: 'c-buffer', value: 33000, shown: '33k' },
  { label: 'Free space', tone: 'c-free', value: 514600, shown: '514.6k' },
];
const TOTAL = 1000000;

export default function ContextPanel() {
  return (
    <div className="hs-peek-wrap">
      <Critter className="hs-peek" mood="open" />
      <CcWindow title="Context window" meta="452.4k / 1M (45%)" className="cc-panel">
        <CcBar total={TOTAL} segments={ROWS.filter((r) => r.tone !== 'c-free' && r.tone !== 'c-buffer')} />
        <ul className="cc-rows">
          {ROWS.map((row) => (
            <li key={row.label}>
              <span className={`cc-swatch ${row.tone}`} />
              <span className="cc-row-label">{row.label}</span>
              <span className="cc-row-num">{row.shown}</span>
              <span className="cc-row-pct">{((row.value / TOTAL) * 100).toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </CcWindow>
    </div>
  );
}
