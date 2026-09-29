import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.MD.8 — "...including finding the perimeter given the side lengths, and
 * FINDING AN UNKNOWN SIDE LENGTH", whose second keyConcept says the same thing
 * again: "Find an unknown side length given the perimeter."
 *
 * RULING 14-6. This is the backwards direction, and it is a separate template
 * from ./md8-perimeter-of-a-rectangle.ts because the two directions go wrong
 * differently. Forwards, a child multiplies the sides instead of adding them.
 * Backwards, a child forgets that the perimeter already contains FOUR sides:
 * they halve it and stop, or they take the one given side off the whole
 * perimeter as though only one side were left. Neither of those errors can be
 * made on a forwards question, so a single template could not diagnose them,
 * and a seedless review key would have retired the standard on the easy half.
 *
 * Units are customary (ruling 14-1): inches, feet or yards.
 *
 * ---------------------------------------------------------------------------
 * Construction. L in 4..14 and W in 2..L-1, so the long side really is the
 * longer one. The perimeter given to the child is P = 2(L + W), so it is
 * always even and always consistent with a real rectangle.
 *
 *   answer                                W         = P/2 - L
 *   used-half-the-perimeter-as-each-      P/2 = L+W  halved the perimeter and
 *     side                                           called that a side, as if
 *                                                    a rectangle had two sides
 *   forgot-the-final-step                 P - 2L     took the two long sides
 *                                           = 2W     off correctly, then
 *                                                    reported BOTH short sides
 *                                                    instead of one
 *   subtracted-one-side-from-the-whole-   P - L      took the one given side
 *     perimeter                             = L+2W   off the whole perimeter
 *
 * Collisions, writing everything in L and W:
 *
 *   W = L + W      =>  L = 0.                        Never: L >= 4.
 *   W = 2W         =>  W = 0.                        Never: W >= 2.
 *   W = L + 2W     =>  L + W = 0.                    Never.
 *   L + W = 2W     =>  L = W.                        Never: L > W.
 *   L + W = L + 2W =>  W = 0.                        Never.
 *   2W = L + 2W    =>  L = 0.                        Never.
 *
 * Nothing collides anywhere in the space, so nothing is excluded and nothing is
 * resampled: every (L, W) with 4 <= L <= 14 and 2 <= W < L is drawable. The
 * sibling test sweeps the whole space and asserts that.
 */
export interface UnknownSideCase {
  L: number;
  W: number;
}

export const UNKNOWN_SIDE_CASES: UnknownSideCase[] = [];
for (let L = 4; L <= 14; L++) {
  for (let W = 2; W < L; W++) UNKNOWN_SIDE_CASES.push({ L, W });
}

/** Customary length units only (ruling 14-1). */
const UNITS = ['inches', 'feet', 'yards'];

export const md8UnknownSideLength: QuestionTemplate = {
  id: 'g3.md8.unknown-side-length',
  standardCode: 'NC.3.MD.8',
  domainId: 'MD',
  difficulty: 'advanced',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const unit = rng.pick(UNITS);
    const { L, W } = rng.pick(UNKNOWN_SIDE_CASES);

    const perimeter = 2 * (L + W);
    const answerText = `${W} ${unit}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // P / 2: halved the perimeter and called that a side length, as though
      // a rectangle had only two sides to go around.
      {
        text: `${perimeter / 2} ${unit}`,
        isCorrect: false,
        misconception: 'used-half-the-perimeter-as-each-side',
      },
      // P - 2L: took both long sides off correctly, then reported what is left
      // - which is BOTH short sides together, not one of them.
      {
        text: `${perimeter - 2 * L} ${unit}`,
        isCorrect: false,
        misconception: 'forgot-the-final-step',
      },
      // P - L: took the one given side off the whole perimeter, as if the rest
      // of the trip around were a single side.
      {
        text: `${perimeter - L} ${unit}`,
        isCorrect: false,
        misconception: 'subtracted-one-side-from-the-whole-perimeter',
      },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.md8.unknown-side-length: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `A rectangle has a perimeter of ${perimeter} ${unit}. Its long side is ${L} ${unit}. How long is its short side?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          'Step 1: Going around the rectangle uses four sides: the long side twice and the short side twice.',
          `Step 2: The two long sides use ${L} + ${L} = ${2 * L} ${unit} of the ${perimeter} ${unit}.`,
          `Step 3: That leaves ${perimeter} - ${2 * L} = ${perimeter - 2 * L} ${unit} for the TWO short sides together.`,
          `Step 4: One short side is half of that: ${perimeter - 2 * L} ÷ 2 = ${W}, so the short side is ${answerText}.`,
        ],
        conceptSummary:
          'A perimeter is a total made of every side, so working backwards means taking away the sides you know and then sharing what is left between the sides you do not. The last sharing step is the one most easily skipped.',
        commonMisconception: `Answering ${perimeter / 2} ${unit} halves the perimeter and stops. Half the way around a rectangle is one long side AND one short side together, not either one of them on its own.`,
      },
    };
  },
};
