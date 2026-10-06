import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.1.OA.8 — "Determine the unknown whole number in an addition or
 * subtraction equation involving three whole numbers", with the unknown where
 * a take-away STARTS: ☐ − b = c, or c = ☐ − b with the equal sign first.
 *
 * Split from `./oa8-missing-part.ts` because it is a different skill with a
 * different wrong operation. A missing part is found by taking away, and the
 * error is adding everything; a missing start is found by ADDING the two
 * parts back together, and the error is obeying the minus sign. One template
 * drawing both would let a seedless review key retire one with the other.
 *
 * ---------------------------------------------------------------------------
 * b (taken away) >= 2, c (left) >= 1, and the whole b + c <= 20. 171 pairs.
 *
 *   answer                                         x = b + c
 *   subtracted-instead-of-added                    |c − b|  (saw the minus
 *                                                  sign, took the smaller
 *                                                  number from the bigger)
 *   restated-a-known-number-instead-of-solving     c
 *   counted-the-start-number-as-a-hop              x − 1    (counting on b from
 *                                                  c, saying c first)
 *   or counted-on-by-ones-one-too-many             x + 1    (coin flip)
 *
 * Collisions, solved:
 *
 *   |c − b| vs x, x ± 1:   needs b or c to be 0 or 1/2.        Never.
 *   c vs x, x + 1:         needs b = 0 or −1.                  Never.
 *   c vs x − 1:            needs b = 1.                        Never: b >= 2.
 *   |c − b| vs c:          c − b = c needs b = 0 (never); b − c = c needs
 *                          b = 2c.   EXCLUDED: b = 2, 4, ... 12 (6 pairs).
 *
 * The exclusion does not depend on the coin, so there is one list. It is
 * built once, never resampled, and the sibling test shows each removed pair
 * really collides. b = c is kept: its |c − b| distractor is 0, a real value a
 * child who subtracts 5 − 5 reaches.
 *
 * THE KEY IS OFTEN THE BIGGEST OPTION, by the mathematics: the start of a
 * take-away is bigger than both numbers in it, so the restated c, the
 * subtraction and the hop all sit below it. The over-count, drawn half the
 * time, is the one error that lands above, which keeps "pick the biggest"
 * right only half the time.
 */
export interface WholePair {
  b: number;
  c: number;
}

export const ALL_WHOLE_PAIRS: WholePair[] = [];
for (let b = 2; b <= 19; b++) {
  for (let c = 1; b + c <= 20; c++) ALL_WHOLE_PAIRS.push({ b, c });
}

export const WHOLE_DRAWS: WholePair[] = ALL_WHOLE_PAIRS.filter(({ b, c }) => b !== 2 * c);

export const oa8MissingWhole: QuestionTemplate = {
  id: 'g1.oa8.missing-whole',
  standardCode: 'NC.1.OA.8',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { b, c } = rng.pick(WHOLE_DRAWS);
    const slip = rng.pick(['hop', 'over'] as const);
    const equalsFirst = rng.pick([true, false]);
    const x = b + c;
    const hi = Math.max(b, c);
    const lo = Math.min(b, c);

    const answerText = `${x}`;
    const candidates = [
      { text: answerText, isCorrect: true },
      // The minus sign obeyed: the smaller number taken from the bigger.
      { text: `${hi - lo}`, isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // c: the number left over, written into the box.
      { text: `${c}`, isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      slip === 'hop'
        ? // Counting on b from c, saying c as the first count.
          { text: `${x - 1}`, isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' }
        : { text: `${x + 1}`, isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ];

    const texts = candidates.map((o) => o.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.oa8.missing-whole: option collision [${texts.join(' | ')}]`);
    }

    const equation = equalsFirst ? `${c} = ☐ − ${b}` : `☐ − ${b} = ${c}`;

    return {
      prompt: `What number makes ${equation} true?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: The ☐ is the number you start with. Take ${b} away and ${c} is left.`,
          `Step 2: Put the two parts back together: ${c} + ${b} = ${x}.`,
          `Step 3: Check: ${x} − ${b} = ${c}.`,
          `Step 4: The number in the ☐ is ${x}.`,
        ],
        conceptSummary:
          'When the number a take-away starts from is missing, adding the part taken away back to the part that is left finds it.',
        commonMisconception: `The minus sign makes taking away feel right, but ${hi} − ${lo} = ${hi - lo} cannot be the start: the ☐ has to be bigger than ${b === c ? `${b}` : `both ${b} and ${c}`}.`,
      },
    };
  },
};
