import RangeRatSheetFigure from './RangeRatSheetFigure';

const IDLE_SHEET = `${process.env.PUBLIC_URL}/images/golf-incremental/range-rat-idle-sheet.png`;

function RangeRatIdle() {
  return (
    <RangeRatSheetFigure
      sheet={IDLE_SHEET}
      loopLabel="Range Rat idle animation, 17 frames at 6 frames per second"
      sheetAlt="Range Rat idle sprite sheet, 17 frames in a 5 by 4 grid"
      caption="The idle sheet, playing at 6 fps. 17 frames, 52×52, real pixels."
    />
  );
}

export default RangeRatIdle;
