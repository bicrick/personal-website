import RangeRatSpriteLoop from './RangeRatSpriteLoop';
import './RangeRatIdle.css';

function RangeRatSheetFigure({ sheet, caption, loopLabel, sheetAlt }) {
  return (
    <figure className="project-figure range-rat-idle-figure">
      <div className="range-rat-idle-row">
        <RangeRatSpriteLoop sheet={sheet} ariaLabel={loopLabel} />
        <img
          className="range-rat-idle-sheet"
          src={sheet}
          alt={sheetAlt}
          width={260}
          height={208}
        />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export default RangeRatSheetFigure;
