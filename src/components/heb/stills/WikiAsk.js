import React from 'react';

function WikiAsk() {
  return (
    <div className="heb-window" aria-hidden="true">
      <div className="heb-window-bar">ask the wiki</div>
      <div className="heb-window-body heb-chat">
        <p className="heb-chat-q">where is the extract runbook?</p>
        <p className="heb-chat-a">
          Filter the control room to your team. The failed row links the runbook.
        </p>
        <p className="heb-chat-src">Confluence</p>
      </div>
    </div>
  );
}

export default WikiAsk;
