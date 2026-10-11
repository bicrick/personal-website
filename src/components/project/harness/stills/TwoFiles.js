import React from 'react';
import Fig from '../Fig';
import Critter from '../Critter';
import useInView from '../useInView';
import { TWO_FILES } from '../why';

// django-14376: five harnesses fixed one file; Cursor looked wider and fixed both.
export default function TwoFiles() {
  const { ref, on } = useInView();
  return (
    <Fig
      innerRef={ref}
      className={`tf${on ? ' is-on' : ''}`}
      title={TWO_FILES.task}
      aside="one bug, two files"
      caption="The old setting was used in two files. Cursor's first search covered the whole folder, so it found both."
    >
      {TWO_FILES.files.map((f, n) => (
        <div key={f} className="tf-file">
          <div className="tf-name">{f}</div>
          <div className="tf-crowd">
            {n === 0 && TWO_FILES.others.map((o, j) => (
              <Critter key={j} className="tf-critter" outfit={o} style={{ '--d': `${j * 0.15}s` }} />
            ))}
            <Critter className="tf-critter is-cursor" outfit="cursor" mood={n === 1 ? 'happy' : 'open'} style={{ '--d': `${0.9 + n * 0.8}s` }} />
          </div>
        </div>
      ))}
      <div className="tf-result">
        <span>five others: one file fixed · <b>failed</b></span>
        <span>Cursor: both fixed · <b>passed</b></span>
      </div>
    </Fig>
  );
}
