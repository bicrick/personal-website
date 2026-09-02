import RangeRatSheetFigure from './RangeRatSheetFigure';

const YAWN_SHEET = `${process.env.PUBLIC_URL}/images/golf-incremental/range-rat-idle-out-of-balls-sheet.png`;

function RangeRatYawn() {
  return (
    <RangeRatSheetFigure
      sheet={YAWN_SHEET}
      loopLabel="Range Rat yawn animation when the bucket is empty"
      sheetAlt="Range Rat out-of-balls sprite sheet, 17 frames in a 5 by 4 grid"
      caption="Out of balls. Same grid, a yawn while you walk the range and pick up."
    />
  );
}

export default RangeRatYawn;
