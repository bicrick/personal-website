import React from 'react';

function WikiAsk() {
  return (
    <div className="heb-fig heb-chatbox" aria-hidden="true">
      <div className="heb-bubble is-user">how do I configure a new extract?</div>
      <div className="heb-bubble is-bot">
        Add your configuration YAML to <span className="heb-chat-link">extracts/store_inventory.yaml</span>.
        <span className="heb-chat-src">Confluence</span>
      </div>
      <div className="heb-chat-input">
        Ask the wiki
        <i />
      </div>
    </div>
  );
}

export default WikiAsk;
