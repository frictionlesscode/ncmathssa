import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

interface Context {
  noun: string;
  symbol: string;
}

const CONTEXTS: Context[] = [
  { noun: 'tiles', symbol: '■' },
  { noun: 'buttons', symbol: '●' },
  { noun: 'stickers', symbol: '★' },
  { noun: 'stamps', symbol: '▲' },
];

/**
 * NC.2.OA.4 — "Use addition to find the total number of objects arranged in
 * rectangular arrays with UP TO 5 ROWS AND UP TO 5 COLUMNS" — stated twice
 * in the source and zero times in the task brief (ruling 17-3). The total is
 * found by ADDING equal rows, never by multiplying (that is Grade 3's
 * NC.3.OA.1, which this bank's sibling `../../grade3/templates/
 * oa1-equal-groups-array.ts` already owns with a wider 3-10 by 2-10 draw and
 * a product in the answer, not a sum).
 *
 * Rows r are drawn from 3-5 and columns c from 2-5 — asymmetric on purpose,
 * to keep the four option values distinct (below). A 2-row array is still
 * covered in this standard's curriculum: the authored bank's g2-oa4-02 uses
 * one. The brief named "counting a shared row or column twice" as an error
 * to cover; ruling 17-3 found it unconstructible in a rectangular array,
 * where no row or column is shared between two others, and replaced it with
 * two errors that ARE constructible here: adding the row and column counts
 * instead of adding equal rows, and skip-counting one row short.
 *
 * Distinctness: the four option values are total = r*c, wrongOp = r + c,
 * oneShort = (r-1)*c, oneRow = c.
 *
 *   oneShort = oneRow  =>  (r-1)c = c  =>  r = 2 (for c != 0) — this is WHY
 *     r starts at 3: at r=2, "one row short" of a 2-row array IS one row,
 *     so the two distractors would be the same value AND the same text.
 *   total = wrongOp  =>  rc = r+c  =>  (r-1)(c-1) = 1  =>  r = c = 2,
 *     already excluded by r >= 3.
 *   total = oneShort  =>  c = 0, outside c >= 2.
 *   total = oneRow  =>  r = 1, outside r >= 3.
 *   wrongOp = oneShort  =>  r + c = (r-1)c  =>  r = c(r-2)  =>
 *     c = r/(r-2), a whole number only at (r,c) = (3,3) and (4,2). Both are
 *     EXCLUDED below.
 *   wrongOp = oneRow  =>  r = 0, outside r >= 3.
 *
 * So two pairs are removed by construction. The remaining 10 pairs are swept
 * in full by the sibling test.
 */
const EXCLUDED = new Set(['3,3', '4,2']);

const PAIRS: { r: number; c: number }[] = [];
for (let r = 3; r <= 5; r++) {
  for (let c = 2; c <= 5; c++) {
    if (!EXCLUDED.has(`${r},${c}`)) PAIRS.push({ r, c });
  }
}

export const oa4ArrayRepeatedAddition: QuestionTemplate = {
  id: 'g2.oa4.array-repeated-addition',
  standardCode: 'NC.2.OA.4',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const ctx = rng.pick(CONTEXTS);
    const { r, c } = rng.pick(PAIRS);

    const total = r * c;
    const wrongOp = r + c;
    const oneShort = (r - 1) * c;
    const oneRow = c;

    const answerText = `${total} ${ctx.noun}`;
    const row = Array.from({ length: c }, () => ctx.symbol).join(' ');
    const figure = Array.from({ length: r }, () => row).join('\n');

    const candidates = [
      { text: answerText, isCorrect: true },
      // r + c: added the row count and the column count instead of adding
      // one row's worth for every row.
      {
        text: `${wrongOp} ${ctx.noun}`,
        isCorrect: false,
        misconception: 'added-rows-and-columns-instead-of-repeated-addition',
      },
      // (r-1)*c: skip-counted the rows but left one row out.
      { text: `${oneShort} ${ctx.noun}`, isCorrect: false, misconception: 'skip-counted-one-group-short' },
      // c: counted a single row and reported that instead of the total.
      { text: `${oneRow} ${ctx.noun}`, isCorrect: false, misconception: 'counted-only-one-group' },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.oa4.array-repeated-addition: option collision [${texts.join(' | ')}]`);
    }

    const addends = Array.from({ length: r }, () => c).join(' + ');

    return {
      prompt: `The ${ctx.noun} below are arranged in equal rows. Find the total by adding, not by counting one by one.`,
      promptDetails: figure,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Count the rows. There are ${r} equal rows.`,
          `Step 2: Count one row. There are ${c} ${ctx.noun} in each row.`,
          `Step 3: Add one row for every row: ${addends}.`,
          `Step 4: ${addends} = ${total}, so there are ${answerText} in all.`,
        ],
        conceptSummary:
          'A rectangular array can be found by adding equal rows together, without counting every object one by one.',
        commonMisconception: `Adding the number of rows to the number in a row, ${r} + ${c}, mixes up two different counts and is not the same as adding a row for every row.`,
      },
    };
  },
};
