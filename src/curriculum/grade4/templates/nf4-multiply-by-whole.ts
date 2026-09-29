import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/** The denominators NC.4.NF.2 names, less 100. */
const DENOMINATORS = [2, 3, 4, 5, 6, 8, 10, 12];

/**
 * Every (w, n, d) this template will use: a whole number w times a fraction
 * n/d that is less than one, which is the whole of what NC.4.NF.4 asks.
 *
 * The four option values are
 *
 *   answer     w*n/d
 *   bothParts  (w*n)/(w*d)   the denominator scaled by w as well  = n/d
 *   mixed      w + n/d       the two written side by side
 *   added      (w+n)/d       w added to the numerator
 *
 * and all six pairs:
 *
 *   answer    = bothParts  => w*n/d = n/d => w = 1. EXCLUDED: w >= 2.
 *   answer    = mixed      => w*n = w*d + n => n = w*d/(w-1). Impossible:
 *                             w/(w-1) > 1 for w >= 2, so that value exceeds d,
 *                             while n <= d - 1.
 *   answer    = added      => w*n = w + n => (w-1)(n-1) = 1 => w = n = 2.
 *                             EXCLUDED below.
 *   bothParts = mixed      => n/d = w + n/d => w = 0. Impossible.
 *   bothParts = added      => n = w + n => w = 0. Impossible.
 *   mixed     = added      => w*d + n = w + n => w(d-1) = 0. Impossible.
 *
 * So one exclusion carries it: (w, n) must not be (2, 2). 210 (w, n, d)
 * triples satisfy the ranges and 203 survive; the sibling test sweeps all 210
 * and confirms that each of the 7 barred ones really would have put two
 * options on the same number.
 *
 * NOTE for anyone adding a distractor here: bothParts is (w*n)/(w*d), which is
 * exactly n/d. An option tagged forgot-to-scale-by-the-whole-number would also
 * be n/d, so the two can never appear in the same item — they are the same
 * quantity written two ways, and a child picking either would be marked wrong
 * for being right. The authored bank keeps them apart for the same reason; see
 * g4-nf4-03.
 */
export function admissibleProducts(): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let w = 2; w <= 6; w++) {
    for (const d of DENOMINATORS) {
      for (let n = 1; n <= d - 1; n++) {
        if (w === 2 && n === 2) continue;
        out.push([w, n, d]);
      }
    }
  }
  return out;
}

const PRODUCTS = admissibleProducts();

/**
 * NC.4.NF.4 — multiply a whole number by a unit fraction, and by any fraction
 * less than one.
 *
 * One template, one skill (spec 6.5): every draw is the same procedure, a
 * whole number scaling a proper fraction, with the unit-fraction case (n = 1)
 * arising naturally inside it rather than as a branch. The product is always
 * left as a fraction over d, never converted to a mixed number, because
 * converting is a different skill and one of the distractors here is precisely
 * a mixed number.
 *
 * Largest numbers printed: 72, which is 6 x 12 in the scaled-denominator
 * distractor.
 */
export const nf4MultiplyByWhole: QuestionTemplate = {
  id: 'g4.nf4.multiply-by-whole',
  standardCode: 'NC.4.NF.4',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const [w, n, d] = rng.pick(PRODUCTS);
    const answer = `${w * n}/${d}`;

    const candidates = [
      { text: answer, isCorrect: true },
      // The denominator multiplied by w as well as the numerator, which leaves
      // the amount exactly where it started.
      {
        text: `${w * n}/${w * d}`,
        isCorrect: false,
        misconception: 'multiplied-the-denominator-too',
      },
      // The whole number and the fraction written side by side, which adds
      // them instead of taking w copies of the fraction.
      {
        text: `${w} ${n}/${d}`,
        isCorrect: false,
        misconception: 'wrote-the-product-as-a-mixed-number',
      },
      // w added to the numerator rather than multiplied through it.
      {
        text: `${w + n}/${d}`,
        isCorrect: false,
        misconception: 'added-instead-of-multiplied',
      },
    ];

    // Distinct BY CONSTRUCTION; a collision means the exclusion in
    // admissibleProducts() and these four expressions have drifted apart.
    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nf4.multiply-by-whole: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Multiply the whole number by the fraction.',
      promptDetails: `${w} × ${n}/${d}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: ${w} × ${n}/${d} means ${w} copies of ${n}/${d} added together.`,
          `Step 2: Every copy is measured in ${d}ths, so the answer is measured in ${d}ths too — taking more parts does not make each part smaller.`,
          `Step 3: Count the parts: ${w} × ${n} = ${w * n} of them, still over ${d}.`,
          `Step 4: ${w} × ${n}/${d} = ${answer}.`,
        ],
        conceptSummary:
          'A whole number times a fraction repeats that fraction, so only the count of parts changes. The denominator names the size of one part, and repetition cannot change it.',
        commonMisconception:
          'Scaling the denominator as well is how a fraction is RENAMED, not multiplied — do it and the product comes back equal to the fraction you started with, as if the whole number were never there.',
      },
    };
  },
};
