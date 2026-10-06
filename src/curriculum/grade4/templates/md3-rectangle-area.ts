import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/** Rectangles this template may draw, computed once so the sibling test can
 *  enumerate the whole space instead of sampling it.
 *
 *  With length L and width W the four options are
 *    area        = L x W
 *    perimeter   = 2(L + W)
 *    halfPerim   = L + W
 *    oneDoubled  = 2L + W
 *  and the only pair that can coincide over 4 <= L <= 12, 2 <= W <= 9, W < L
 *  is area against perimeter, when LW = 2L + 2W, i.e. (L - 2)(W - 2) = 4. Its
 *  integer solutions are (3,6), (4,4) and (6,3); W < L rules out the first
 *  two, so (6,3) is the single pair excluded here. Every other pairing is
 *  impossible: area = halfPerim needs (L-1)(W-1) = 1, area = oneDoubled needs
 *  W = 2L/(L-1) which is never a whole number for L >= 4, and the three
 *  perimeter-family values differ from each other whenever L and W are both
 *  above zero. */
export const RECTANGLES: { length: number; width: number }[] = (() => {
  const out: { length: number; width: number }[] = [];
  for (let l = 4; l <= 12; l++) {
    for (let w = 2; w <= 9; w++) {
      if (w >= l) continue;
      if (l === 6 && w === 3) continue;
      out.push({ length: l, width: w });
    }
  }
  return out;
})();

const NOUNS = [
  'patio',
  'vegetable plot',
  'tarpaulin',
  'playground mat',
  'mural panel',
  'sandbox',
];

/**
 * NC.4.MD.3 — the AREA of a rectangle, applied in a real-world problem.
 *
 * ONE TEMPLATE, ONE SKILL (spec 6.5). This standard covers area AND perimeter,
 * and they get separate templates for the same reason NC.4.NBT.4 splits
 * addition from subtraction: a review key is seedless, so a single template
 * that sometimes asked for area and sometimes for perimeter would let a child
 * who confuses the two be reviewed with whichever one they happen to be able
 * to do, promoted for answering it, and retired as mastered. The two skills
 * also have mirror-image misconception sets — `used-perimeter-formula` here,
 * `used-area-formula-for-perimeter` in ./md3-rectangle-perimeter.ts — which
 * only stay diagnostic if a child's record can tell which way round they went
 * wrong. See ./md3-rectangle-perimeter.ts for the other half.
 *
 * Bounds. Every printed number: the dimensions are at most 12 by 9, so the
 * largest value anywhere in the question is the area at its ceiling, 108.
 */
export const md3RectangleArea: QuestionTemplate = {
  id: 'g4.md3.rectangle-area',
  standardCode: 'NC.4.MD.3',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const noun = rng.pick(NOUNS);
    const { length, width } = rng.pick(RECTANGLES);

    const area = length * width;
    const answerText = `${area} square meters`;

    // Every option carries the unit of the CORRECT answer, so the label never
    // gives the answer away; a distractor is the NUMBER a wrong method
    // produces, not a claim that that number really is an area.
    const candidates = [
      { text: answerText, isCorrect: true },
      // Added all four sides, finding the perimeter: 2 x (L + W).
      {
        text: `${2 * (length + width)} square meters`,
        isCorrect: false,
        misconception: 'used-perimeter-formula',
      },
      // Added the length and the width once each: half a perimeter.
      {
        text: `${length + width} square meters`,
        isCorrect: false,
        misconception: 'added-only-the-two-given-sides',
      },
      // Doubled the length but not the width: 2L + W.
      {
        text: `${2 * length + width} square meters`,
        isCorrect: false,
        misconception: 'doubled-only-one-dimension',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.md3.rectangle-area: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `A rectangular ${noun} measures ${length} meters by ${width} meters. How many square meters is its area?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Area counts the square meters that COVER the ${noun}, so it comes from multiplying the two side lengths.`,
          `Step 2: Area = length × width = ${length} × ${width}.`,
          `Step 3: ${length} × ${width} = ${area}.`,
          `Step 4: The area is ${answerText}.`,
        ],
        conceptSummary:
          'Area is a covering and perimeter is a border. Area multiplies the two dimensions and is measured in SQUARE units; perimeter adds all four sides and is measured in plain length units.',
        commonMisconception:
          'Adding the sides gives the distance around the edge, which answers a different question: how much fencing or trim it needs, not how much surface it has.',
      },
    };
  },
};
