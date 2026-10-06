import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.MD.5 — "Find the area of a rectangle with whole-number side lengths by
 * TILING WITHOUT GAPS OR OVERLAPS AND COUNTING UNIT SQUARES."
 *
 * RULING 14-5, and it is the reason this file exists apart from
 * ./md7-area-by-multiplying-side-lengths.ts. "6 × 4 = 24 square units"
 * satisfies NC.3.MD.5 and NC.3.MD.7 as a STRING and neither of them as a
 * SKILL. MD.5 is the year a child learns that area is a count of unit squares
 * at all; MD.7 is the year they learn they need not count them one by one. One
 * generator answering both would put one question under two review keys, so a
 * child who could multiply would be retired from the standard that is about
 * counting.
 *
 * THE SEPARATION IS BY CONSTRUCTION, not by wording:
 *
 *   this file   prints NO NUMBERS AT ALL in its question. The prompt is a
 *               fixed sentence and the figure is `r` rows of `c` drawn tiles.
 *               The only route to the answer is to count the tiles - there is
 *               no pair of side lengths anywhere to multiply.
 *   md7         prints the two side lengths as numerals in a sentence and
 *               draws no tiles at all.
 *
 * A child cannot answer this one by multiplying because this one never tells
 * them what to multiply, and ./index.test.ts pins both prompt shapes.
 *
 * ---------------------------------------------------------------------------
 * Construction. r rows of c tiles, both in 2..8.
 *
 *   answer                                r*c      every tile counted
 *   added-instead-of-multiplied           r + c    counted one row and one
 *                                                  column and added them
 *   counted-only-one-group                c        counted the first row and
 *                                                  stopped
 *   used-perimeter-formula                2(r+c)   counted around the outside
 *                                                  edge instead of the inside
 *
 * Collisions, over r, c in 2..8:
 *
 *   r*c = r + c        =>  (r-1)(c-1) = 1  =>  r = c = 2.        EXCLUDED.
 *   r*c = c            =>  c(r-1) = 0      =>  r = 1.            Never.
 *   r*c = 2(r+c)       =>  r(c-2) = 2c     =>  r = 2c/(c-2),
 *                          which is 6, 4, 10/3, 3, 14/5, 8/3 for
 *                          c = 3..8 and undefined at c = 2. The
 *                          whole-number solutions in range are
 *                          (6,3), (4,4) and (3,6).                EXCLUDED.
 *   r + c = c          =>  r = 0.                                Never.
 *   r + c = 2(r+c)     =>  r + c = 0.                            Never.
 *   c = 2(r+c)         =>  -c = 2r.                              Never.
 *
 * Four pairs are excluded and the rest of the 7 x 7 space is kept. The
 * exclusion is a filter applied once when the list below is built, not a
 * resample inside generate(), and the sibling test asserts that the pairs
 * missing from TILINGS are exactly those four.
 */
export interface Tiling {
  /** Rows of tiles. */
  r: number;
  /** Tiles in each row. */
  c: number;
}

function optionValues({ r, c }: Tiling): number[] {
  return [r * c, r + c, c, 2 * (r + c)];
}

export const TILINGS: Tiling[] = [];
for (let r = 2; r <= 8; r++) {
  for (let c = 2; c <= 8; c++) {
    const values = optionValues({ r, c });
    if (new Set(values).size !== values.length) continue;
    TILINGS.push({ r, c });
  }
}

function squares(n: number): string {
  return `${n} unit square${n === 1 ? '' : 's'}`;
}

export const md5TileAndCountUnitSquares: QuestionTemplate = {
  id: 'g3.md5.tile-and-count-unit-squares',
  standardCode: 'NC.3.MD.5',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { r, c } = rng.pick(TILINGS);

    const total = r * c;
    const answerText = squares(total);
    const figure = Array.from({ length: r }, () =>
      Array.from({ length: c }, () => '[]').join(' '),
    ).join('\n');

    const candidates = [
      { text: answerText, isCorrect: true },
      // r + c: counted the tiles down one side and across one side, then added
      // the two counts instead of covering the whole rectangle.
      { text: squares(r + c), isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // c: counted the first row of tiles and reported that.
      { text: squares(c), isCorrect: false, misconception: 'counted-only-one-group' },
      // 2(r + c): counted around the outside edge of the rectangle - the
      // perimeter - instead of the tiles filling it.
      { text: squares(2 * (r + c)), isCorrect: false, misconception: 'used-perimeter-formula' },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.md5.tile-and-count-unit-squares: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'The rectangle below is covered with unit squares that do not overlap. How many unit squares cover it?',
      promptDetails: figure,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          'Step 1: The tiles are laid with no gaps and no overlaps, so counting them counts the whole rectangle exactly once.',
          `Step 2: Count one row across: there are ${c} unit squares in each row.`,
          `Step 3: Count the rows down: there are ${r} rows.`,
          `Step 4: Counting every row, ${r} rows of ${c} is ${total}, so ${answerText} cover the rectangle.`,
        ],
        conceptSummary:
          'Area is a COUNT of unit squares. A unit square is a square one unit on each side, and the area of a shape is how many of them cover it with no gaps and no overlapping.',
        commonMisconception: `Answering ${squares(2 * (r + c))} counts around the OUTSIDE edge of the rectangle. That is its perimeter, which measures how far it is around, not how many squares fit inside.`,
      },
    };
  },
};
