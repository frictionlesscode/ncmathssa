import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

interface Context {
  /** Plural noun for the objects in the array. */
  noun: string;
  /** The character the array is drawn with. */
  symbol: string;
}

const CONTEXTS: Context[] = [
  { noun: 'stickers', symbol: '★' },
  { noun: 'buttons', symbol: '●' },
  { noun: 'stamps', symbol: '■' },
  { noun: 'tiles', symbol: '▲' },
];

/**
 * NC.3.OA.1 — "Interpret products of whole numbers with two factors up to and
 * including 10", whose keyConcepts name the two factors as "the number of
 * equal groups and the number of objects in each group" and list ARRAYS first
 * among the strategies. So this generator draws the array and asks for the
 * product; the child has to read both factors off the picture before any
 * arithmetic happens. That is the question shape for this standard and no
 * other Grade 3 OA generator uses it (ruling 12-4): OA.2 shows equal groups
 * with the share unknown, OA.3 is a word problem, OA.6 is an equation with a
 * box, OA.7 is a bare fact. Five generators of one shape would file one
 * question under five review keys and mark a child mastered in all five.
 *
 * Rows r in 3..10 and per-row count c in 2..10 (ruling 12-5: factors 1-10).
 * The four option values, in terms of r and c:
 *
 *   answer                        r * c
 *   added-instead-of-multiplied   r + c
 *   skip-counted-one-group-short  (r - 1) * c   one whole row left out
 *   counted-only-one-group        c             one row counted, then stopped
 *
 * Distinctness, exhaustively:
 *   rc = r + c   =>  (r-1)(c-1) = 1  =>  r = c = 2, outside r >= 3.
 *   rc = (r-1)c  =>  c = 0, outside c >= 2.
 *   rc = c       =>  r = 1, outside r >= 3.
 *   r + c = c    =>  r = 0, outside r >= 3.
 *   (r-1)c = c   =>  r = 2, outside r >= 3.
 *   r + c = (r-1)c  =>  r = c(r - 2)  =>  c = r / (r - 2), whole only at
 *                   (r, c) = (3, 3) and (4, 2). Both are EXCLUDED below.
 *
 * So two pairs are removed by construction and nothing is resampled. The
 * remaining space is 8 * 9 - 2 = 70 pairs, swept in full by the sibling test
 * rather than sampled, so the 300-seed property run is a regression guard and
 * not the argument. The largest product is 10 * 10 = 100, the standard's cap.
 */
const EXCLUDED = new Set(['3,3', '4,2']);

const PAIRS: { r: number; c: number }[] = [];
for (let r = 3; r <= 10; r++) {
  for (let c = 2; c <= 10; c++) {
    if (!EXCLUDED.has(`${r},${c}`)) PAIRS.push({ r, c });
  }
}

export const oa1EqualGroupsArray: QuestionTemplate = {
  id: 'g3.oa1.equal-groups-array',
  standardCode: 'NC.3.OA.1',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const ctx = rng.pick(CONTEXTS);
    const { r, c } = rng.pick(PAIRS);

    const product = r * c;
    const summed = r + c;
    const oneRowShort = (r - 1) * c;
    const oneRowOnly = c;

    const answerText = `${product} ${ctx.noun}`;
    const row = Array.from({ length: c }, () => ctx.symbol).join(' ');
    const figure = Array.from({ length: r }, () => row).join('\n');

    const candidates = [
      { text: answerText, isCorrect: true },
      // r + c: the two numbers read off the picture were added instead of
      // multiplied, which is the error the array is drawn to expose.
      {
        text: `${summed} ${ctx.noun}`,
        isCorrect: false,
        misconception: 'added-instead-of-multiplied',
      },
      // (r - 1) * c: skip counted by c down the rows but left one row out.
      {
        text: `${oneRowShort} ${ctx.noun}`,
        isCorrect: false,
        misconception: 'skip-counted-one-group-short',
      },
      // c: counted a single row and reported that instead of the total.
      {
        text: `${oneRowOnly} ${ctx.noun}`,
        isCorrect: false,
        misconception: 'counted-only-one-group',
      },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.oa1.equal-groups-array: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `The ${ctx.noun} below are arranged in equal rows. How many ${ctx.noun} are there in all?`,
      promptDetails: figure,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Count the rows. There are ${r} equal rows.`,
          `Step 2: Count one row. There are ${c} ${ctx.noun} in each row.`,
          `Step 3: Equal groups are multiplied, so the number of rows times the number in each row is ${r} × ${c}.`,
          `Step 4: ${r} × ${c} = ${product}, so there are ${answerText} in all.`,
        ],
        conceptSummary:
          'In a multiplication, one factor tells how many equal groups there are and the other tells how many are in each group. An array shows both at once: the rows are the groups and the length of a row is the size of each group.',
        commonMisconception: `Adding the two numbers in the picture gives ${summed}, which counts one row and one column instead of all ${r} rows of ${c}.`,
      },
    };
  },
};
