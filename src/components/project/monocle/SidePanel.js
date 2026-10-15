import React, { useState } from 'react';
import { THEMES, THEME_BY_ID } from './themes';
import MonocleMark from './MonocleMark';

function Steps({ run }) {
  const theme = THEME_BY_ID[run.id];
  if (!theme.steps.length) return null;
  return (
    <ol className="mqd-steps">
      {theme.steps.slice(0, run.step).map((label, i) => {
        const active = !run.done && i === run.step - 1;
        return (
          <li key={label} className={active ? 'is-active' : 'is-done'}>
            <span className="mqd-step-dot" aria-hidden="true" />
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Session({ run, typed, onViewPatch }) {
  if (!run && !typed) {
    return (
      <div className="mqd-empty">
        Pick a prompt below. The page on the left is a real, playable word game,
        so you can type a guess before, during, or after a restyle.
      </div>
    );
  }
  if (!run) return null;
  const theme = THEME_BY_ID[run.id];
  return (
    <div className="mqd-session">
      <div className="mqd-msg mqd-msg-user">{run.prompt}</div>
      <Steps run={run} />
      {run.done ? (
        <div className="mqd-msg mqd-msg-bot">
          {theme.reply}
          {theme.patch ? (
            <button type="button" className="mqd-link" onClick={onViewPatch}>
              see what the agent returned
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const PATCH_SECTIONS = [
  { key: 'css', label: 'css', hint: 'restyles what is already on the page' },
  { key: 'overlay', label: 'overlay', hint: 'drawn on top, never blocks clicks' },
  { key: 'ops', label: 'ops', hint: 'targeted edits to specific elements' },
  { key: 'runtime', label: 'runtime', hint: 'optional motion, sandboxed' },
];

function PatchSection({ section, patch }) {
  const value = patch[section.key];
  if (!value) return null;
  return (
    <div className="mqd-psec">
      <div className="mqd-psec-head">
        <span className="mqd-psec-label">{section.label}</span>
        <span className="mqd-psec-hint">{section.hint}</span>
      </div>
      {section.key === 'css' ? (
        <div className="mqd-psec-code">
          {value.map((line) => <span key={line}>{line}</span>)}
        </div>
      ) : null}
      {section.key === 'ops' ? (
        <ul className="mqd-psec-ops">
          {value.map((op) => (
            <li key={`${op.type}-${op.selector}`}>
              <span className="mqd-op-type">{op.type}</span>
              <span className="mqd-op-sel">{op.selector}</span>
              <span className="mqd-op-note">{op.note}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {section.key === 'overlay' || section.key === 'runtime' ? (
        <div className="mqd-psec-text">{value}</div>
      ) : null}
    </div>
  );
}

function PatchView({ theme }) {
  if (!theme.patch) {
    return (
      <div className="mqd-empty">
        No patch applied. The tab is exactly as the site shipped it. Run a prompt to see
        what the agent sends back.
      </div>
    );
  }
  return (
    <div className="mqd-patch">
      <div className="mqd-patch-intro">
        The agent returns a patch like this (abridged). Monocle applies it to the tab and
        never edits the site itself.
      </div>
      {PATCH_SECTIONS.map((section) => (
        <PatchSection key={section.key} section={section} patch={theme.patch} />
      ))}
    </div>
  );
}

export default function SidePanel({ themeId, theme, run, typed, working, onPick }) {
  const [tab, setTab] = useState('session');

  return (
    <aside className="mqd-panel" aria-label="Monocle side panel">
      <div className="mqd-panel-inner">
        <div className="mqd-panel-head">
          <MonocleMark size={18} className="mqd-panel-mark" />
          <span className="mqd-panel-name">monocle</span>
          <span className="mqd-panel-pill">cursor cli · local</span>
        </div>

        <div className="mqd-tabs" role="tablist">
          {['session', 'patch'].map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              className={tab === name ? 'is-on' : ''}
              onClick={() => setTab(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="mqd-body">
          {tab === 'session'
            ? <Session run={run} typed={typed} onViewPatch={() => setTab('patch')} />
            : <PatchView theme={theme} />}
        </div>

        <div className="mqd-chips" role="group" aria-label="Example prompts">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={themeId === t.id ? 'is-current' : ''}
              disabled={working || themeId === t.id}
              onClick={() => {
                setTab('session');
                onPick(t.id);
              }}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            className="mqd-chip-undo"
            disabled={working || themeId === 'original'}
            onClick={() => {
              setTab('session');
              onPick('original');
            }}
          >
            undo
          </button>
        </div>

        <div className={`mqd-input${typed ? ' is-typing' : ''}`}>
          <span className="mqd-input-caret" aria-hidden="true">{'>'}</span>
          <span className="mqd-input-text">
            {typed || <em>describe how this tab should look</em>}
          </span>
        </div>
      </div>
    </aside>
  );
}
