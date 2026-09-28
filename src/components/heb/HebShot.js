import React from 'react';

function HebShot({ label, note }) {
  return (
    <figure className="heb-shot">
      <div className="heb-shot-frame" role="img" aria-label={`${label} screenshot coming`}>
        <span className="heb-shot-label">{label}</span>
        {note ? <span className="heb-shot-note">{note}</span> : null}
      </div>
    </figure>
  );
}

export default HebShot;
