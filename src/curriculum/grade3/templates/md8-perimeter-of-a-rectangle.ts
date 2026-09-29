import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.MD.8 — "Solve problems involving perimeters of polygons, INCLUDING
 * FINDING THE PERIMETER GIVEN THE SIDE LENGTHS, and finding an unknown side
 * length."
 *
 * RULING 14-6: those are TWO templates, not one. This file is the first
 * direction — every side is given and the perimeter is the answer. The second
 * direction lives in ./md8-unknown-side-length.ts, because the two go wrong in
 * completely different ways: forwards, a child multiplies instead of adding;
 * backwards, a child forgets that the perimeter holds FOUR sides and not two.
 * One template spanning both would file both failures under one review key, and
 * a child who could only do it forwards would be retired from the standard.
 *
 * Grade 3 is where area and perimeter first collide, so the collision is named
 * here rather than left as a wrong number: the used-area-formula-for-perimeter
 * option is L*W exactly.
 *
 * Every side length is drawn in the figure (ruling: a figure must be text a
 * screen reader can read and must be enough to answer the item), all four of
 * them, in the same customary unit — inches, feet or yards, never metric
 * (ruling 14-1).
 *
 * ---------------------------------------------------------------------------
 * Construction. L in 3..12 and W in 2..L-1, so L > W and the rectangle is not
 * a square.
 *
 *   answer                                2(L+W)
 *   used-area-formula-for-perimeter       L*W       multiplied the two numbers
 *   added-only-the-two-given-sides        L + W     added each different
 *                                                   number once, forgetting
 *                                                   the two sides opposite
 *   doubled-only-one-dimension            2L + W    doubled the long side but
 *                                                   counted the short one once
 *
 * Collisions, over L > W >= 2:
 *
 *   2(L+W) = L + W       =>  L + W = 0.                        Never.
 *   2(L+W) = 2L + W      =>  W = 0.                            Never.
 *   2(L+W) = L*W         =>  L(W-2) = 2W  =>  L = 2W/(W-2),
 *                            which is 6, 4, 10/3, 3, ... for
 *                            W = 3, 4, 5, 6, ... and undefined
 *                            at W = 2. With L > W the only
 *                            solution in range is (L,W) = (6,3). EXCLUDED.
 *   L + W = 2L + W       =>  L = 0.                            Never.
 *   L + W = L*W          =>  (L-1)(W-1) = 1  =>  L = W = 2.    Never: L > W.
 *   2L + W = L*W         =>  L(W-2) = W  =>  L = W/(W-2),
 *                            which is 3, 2, 5/3, ... for
 *                            W = 3, 4, 5. With L > W, none.    Never.
 *
 * Exactly one pair is excluded, (6,3), and it is excluded when the list below
 * is built rather than resampled inside generate(). The sibling test sweeps the
 * whole space and asserts the excluded set is exactly {(6,3)}.
 */
export interface SidePair {
  L: number;
  W: number;
}

function optionValues({ L, W }: SidePair): number[] {
  return [2 * (L + W), L * W, L + W, 2 * L + W];
}

export const SIDE_PAIRS: SidePair[] = [];
for (let L = 3; L <= 12; L++) {
  for (let W = 2; W < L; W++) {
    const values = optionValues({ L, W });
    if (new Set(values).size !== values.length) continue;
    SIDE_PAIRS.push({ L, W });
  }
}

/** Customary length units only (ruling 14-1). */
const UNITS = ['inches', 'feet', 'yards'];

export const md8PerimeterOfARectangle: QuestionTemplate = {
  id: 'g3.md8.perimeter-of-a-rectangle',
  standardCode: 'NC.3.MD.8',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const unit = rng.pick(UNITS);
    const { L, W } = rng.pick(SIDE_PAIRS);

    const perimeter = 2 * (L + W);
    const answerText = `${perimeter} ${unit}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // L * W: multiplied the two side lengths, which finds the area.
      {
        text: `${L * W} ${unit}`,
        isCorrect: false,
        misconception: 'used-area-formula-for-perimeter',
      },
      // L + W: added each different number once and stopped, leaving the two
      // opposite sides off the trip around.
      {
        text: `${L + W} ${unit}`,
        isCorrect: false,
        misconception: 'added-only-the-two-given-sides',
      },
      // 2L + W: doubled the long side but counted the short side only once.
      {
        text: `${2 * L + W} ${unit}`,
        isCorrect: false,
        misconception: 'doubled-only-one-dimension',
      },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.md8.perimeter-of-a-rectangle: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'The rectangle below has all four of its sides labeled. What is its perimeter?',
      promptDetails: [
        `Top side: ${L} ${unit}`,
        `Right side: ${W} ${unit}`,
        `Bottom side: ${L} ${unit}`,
        `Left side: ${W} ${unit}`,
      ].join('\n'),
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          'Step 1: Perimeter is the distance all the way around, so walk around the rectangle and add every side.',
          `Step 2: Across the top is ${L}, down the right is ${W}, back along the bottom is ${L}, and up the left is ${W}.`,
          `Step 3: ${L} + ${W} + ${L} + ${W} = ${perimeter}.`,
          `Step 4: The perimeter is ${answerText}.`,
        ],
        conceptSummary:
          'A rectangle has two pairs of equal sides, so every side length is used twice on the trip around. Perimeter is measured in the same unit as the sides, because it is a distance.',
        commonMisconception: `Answering ${L * W} ${unit} multiplies the two side lengths, which finds the AREA - the space inside. Perimeter is the distance around the edge, and this is the year the two start looking alike.`,
      },
    };
  },
};
