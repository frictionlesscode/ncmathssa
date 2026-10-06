import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.1.OA.8 — "Determine the unknown whole number in an addition or
 * subtraction equation involving three whole numbers." keyConcepts: "The
 * unknown can be in any position" and "Addition and subtraction equations
 * alike".
 *
 * This template hides a PART when the whole is shown, in all six places a part
 * can sit, with the equal sign on either side:
 *
 *   K + ☐ = W     ☐ + K = W     W = K + ☐     W = ☐ + K     W − ☐ = K     K = W − ☐
 *
 * All six are ONE skill with ONE set of errors — take the known part from the
 * whole — so they share a template. The missing WHOLE (☐ − b = c) is a
 * different skill, answered by ADDING, with a different wrong operation, and
 * lives in `./oa8-missing-whole.ts` so a seedless review key never lets one
 * stand in for the other. A missing RESULT (a + b = ☐) is plain fact recall,
 * which NC.1.OA.9 and NC.1.OA.6 drill; the authored bank carries it with the
 * box on the left (☐ = 9 − 3), and carries 0 as an unknown, which this draw
 * never produces.
 *
 * `W = K + ☐` is the brief's own example of the Grade 1 equal-sign error:
 * 8 = 3 + ☐ answered 11 by a child who adds every number in sight.
 *
 * ---------------------------------------------------------------------------
 * whole W <= 20, known part K >= 2, missing part x = W − K >= 2, so the short
 * count x − 1 is at least 1. 153 (W, K) pairs.
 *
 *   answer                                         x = W − K
 *   added-every-number-in-the-equation             W + K
 *   restated-a-known-number-instead-of-solving     K
 *   counted-the-start-number-as-a-hop              x + 1   (counting up from K
 *                                                  to W, saying K first)
 *   or counted-on-by-ones-and-stopped-one-short    x − 1   (coin flip)
 *
 * Collisions, solved:
 *
 *   W + K vs x, x ± 1, K:   W + K > W >= x + 2, and W + K > K.   Never.
 *   K vs x:                 W = 2K.       EXCLUDED always (9 pairs).
 *   K vs x + 1 (hop):       W = 2K − 1.   EXCLUDED from the hop (8 pairs).
 *   K vs x − 1 (short):     W = 2K + 1.   EXCLUDED from the short count (8).
 *
 * Removed when the lists are built, never by resampling; the sibling test
 * shows each removed pair really collides.
 *
 * NO SIZE TELL. W + K always overshoots, but K sits above the key when K > x
 * and below it when K < x, and the counting slip lands on either side, so the
 * key is the smallest, second or third option depending on the draw.
 */
export interface PartPair {
  whole: number;
  known: number;
}

export const ALL_PART_PAIRS: PartPair[] = [];
for (let whole = 4; whole <= 20; whole++) {
  for (let known = 2; known <= whole - 2; known++) ALL_PART_PAIRS.push({ whole, known });
}

export const PART_DRAWS: Record<'hop' | 'short', PartPair[]> = {
  hop: ALL_PART_PAIRS.filter(({ whole, known }) => whole !== 2 * known && whole !== 2 * known - 1),
  short: ALL_PART_PAIRS.filter(({ whole, known }) => whole !== 2 * known && whole !== 2 * known + 1),
};

const FORMS: ((k: number, w: number) => string)[] = [
  (k, w) => `${k} + ☐ = ${w}`,
  (k, w) => `☐ + ${k} = ${w}`,
  (k, w) => `${w} = ${k} + ☐`,
  (k, w) => `${w} = ☐ + ${k}`,
  (k, w) => `${w} − ☐ = ${k}`,
  (k, w) => `${k} = ${w} − ☐`,
];

export const oa8MissingPart: QuestionTemplate = {
  id: 'g1.oa8.missing-part',
  standardCode: 'NC.1.OA.8',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const slip = rng.pick(['hop', 'short'] as const);
    const { whole, known } = rng.pick(PART_DRAWS[slip]);
    const formIndex = rng.int(0, FORMS.length - 1);
    const equation = FORMS[formIndex](known, whole);
    const isTakeAway = formIndex >= 4;
    const x = whole - known;

    const answerText = `${x}`;
    const candidates = [
      { text: answerText, isCorrect: true },
      // W + K: every number in the equation added together.
      { text: `${whole + known}`, isCorrect: false, misconception: 'added-every-number-in-the-equation' },
      // K: the part already given, written into the box.
      { text: `${known}`, isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      slip === 'hop'
        ? // Counting up from K to W, saying K as the first count.
          { text: `${x + 1}`, isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' }
        : { text: `${x - 1}`, isCorrect: false, misconception: 'counted-on-by-ones-and-stopped-one-short' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.oa8.missing-part: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `What number makes ${equation} true?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          isTakeAway
            ? `Step 1: ${whole} take away the ☐ leaves ${known}, so ${known} and the ☐ make ${whole}.`
            : `Step 1: ${known} and the ☐ make ${whole}.`,
          `Step 2: Count on from ${known} up to ${whole}. The first number to say is ${known + 1}.`,
          `Step 3: That is ${x} counts, so ${whole} − ${known} = ${x}.`,
          `Step 4: The number in the ☐ is ${x}.`,
        ],
        conceptSummary:
          'The equal sign means both sides are the same amount, whichever side the ☐ is on. When a part is missing, take the part you know away from the whole.',
        commonMisconception: `Adding every number, ${whole} + ${known} = ${whole + known}, makes the ☐ bigger than ${whole}, the whole.`,
      },
    };
  },
};
