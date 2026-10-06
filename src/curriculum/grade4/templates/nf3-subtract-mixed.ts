import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/** The like denominators NC.4.NF.3 names, less 2 and 100. Thirds contribute
 *  nothing — no pair of distinct thirds has a sum small enough for the
 *  added-instead-of-subtracted option to stay a proper mixed number — and they
 *  fall out of the table below on their own rather than being special-cased. */
const DENOMINATORS = [3, 4, 5, 6, 8, 10, 12];

/**
 * The fraction parts (d, f1, f2) this template will use, with f1 < f2 so the
 * subtraction always needs regrouping, and f1 + f2 < d so the
 * added-instead-of-subtracted option stays a proper mixed number too.
 *
 * Writing W for W1 - W2, the four option values are
 *
 *   answer      (W-1) + (f1 + d - f2)/d   =  W + (f1 - f2)/d
 *   noRegroup   W     + (f2 - f1)/d
 *   noReduce    W     + (f1 + d - f2)/d   =  answer + 1
 *   added       (W1 + W2) + (f1 + f2)/d
 *
 * and the six pairs:
 *
 *   answer    = noReduce   => 0 = 1, impossible
 *   answer    = noRegroup  => (f1-f2)/d = (f2-f1)/d => f1 = f2. EXCLUDED: f1 < f2.
 *   noRegroup = noReduce   => 2(f2-f1)/d = 1 => f2 - f1 = d/2. EXCLUDED below.
 *   added - answer    = 2*W2 + 2*f2/d      > 0, since W2 >= 1
 *   added - noRegroup = 2*W2 + 2*f1/d      > 0, since W2 >= 1
 *   added - noReduce  = 2*W2 - 1 + 2*f2/d  > 0, since W2 >= 1 makes 2*W2-1 >= 1
 *
 * So one exclusion carries the whole argument: f2 - f1 must not be half the
 * denominator. 57 (d, f1, f2) triples satisfy the ranges and 51 survive it.
 * Crossed with the 15 admissible (W1, W2) pairs that gives 765 of 855
 * combinations; the sibling test sweeps all 855 and confirms that each of the
 * 90 barred ones really would have put two options on the same number.
 */
export function admissibleParts(): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (const d of DENOMINATORS) {
    for (let f1 = 1; f1 < d; f1++) {
      for (let f2 = f1 + 1; f2 < d; f2++) {
        if (f1 + f2 > d - 1) continue;
        if (2 * (f2 - f1) === d) continue;
        out.push([d, f1, f2]);
      }
    }
  }
  return out;
}

/** (W1, W2) with W2 >= 1 and W1 >= W2 + 2, so the answer's whole-number part
 *  is at least 1 and every option prints as a mixed number rather than
 *  sometimes as a bare fraction. */
export function admissibleWholes(): [number, number][] {
  const out: [number, number][] = [];
  for (let w2 = 1; w2 <= 3; w2++) {
    for (let w1 = w2 + 2; w1 <= 8; w1++) out.push([w1, w2]);
  }
  return out;
}

const PARTS = admissibleParts();
const WHOLES = admissibleWholes();

/**
 * NC.4.NF.3 — subtract mixed numbers with like denominators, "by replacing
 * each mixed number with an equivalent fraction, and/or by using properties of
 * operations", in the standard's own words.
 *
 * One template, one skill (spec 6.5). This is NOT a mode of ./nf3-add-like.ts.
 * A ReviewKey is seedless and a due review is re-realized at a fresh random
 * seed, so a single template that branched between adding and subtracting
 * would file one review key for two procedures: a child who failed at
 * regrouping could be reviewed with an addition item, promoted for answering
 * it, and retired as mastered with the regrouping never retested. The two also
 * emit disjoint misconception sets — forgot-to-regroup and
 * borrowed-without-reducing-the-whole cannot arise in the addition template at
 * all — which is the spec's own test for when two modes are two skills.
 *
 * Every draw needs regrouping, by construction: f1 < f2 always.
 *
 * Largest numbers printed: in the question and the options, whole number 11
 * (W1 + W2 in the added-instead-of-subtracted option) and denominator 12; in
 * the worked solution, the regrouped numerator f1 + d, which tops out at 17
 * because f1 + f2 < d forces f1 <= (d - 2) / 2.
 */
export const nf3SubtractMixed: QuestionTemplate = {
  id: 'g4.nf3.subtract-mixed',
  standardCode: 'NC.4.NF.3',
  domainId: 'NF',
  difficulty: 'advanced',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const [d, f1, f2] = rng.pick(PARTS);
    const [w1, w2] = rng.pick(WHOLES);

    const regrouped = f1 + d; // one whole traded in for d parts
    const answer = `${w1 - w2 - 1} ${regrouped - f2}/${d}`;

    const candidates = [
      { text: answer, isCorrect: true },
      // The fraction parts subtracted smaller-from-larger to dodge the
      // regrouping: f2 - f1 over d, with the wholes left at w1 - w2.
      {
        text: `${w1 - w2} ${f2 - f1}/${d}`,
        isCorrect: false,
        misconception: 'forgot-to-regroup',
      },
      // One whole regrouped into the fraction part correctly, but the
      // whole-number part still worked out as w1 - w2 instead of w1 - w2 - 1.
      {
        text: `${w1 - w2} ${regrouped - f2}/${d}`,
        isCorrect: false,
        misconception: 'borrowed-without-reducing-the-whole',
      },
      // Both parts added instead of subtracted.
      {
        text: `${w1 + w2} ${f1 + f2}/${d}`,
        isCorrect: false,
        misconception: 'added-instead-of-subtracted',
      },
    ];

    // Distinct BY CONSTRUCTION; a collision means the exclusion in
    // admissibleParts() and these four expressions have drifted apart.
    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nf3.subtract-mixed: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Subtract the mixed numbers.',
      promptDetails: `${w1} ${f1}/${d} - ${w2} ${f2}/${d}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: Both fractions are counted in ${d}ths, so the parts already match and only the counts have to be worked out.`,
          `Step 2: ${f1}/${d} is not enough to take ${f2}/${d} from, so regroup one whole into ${d}ths: ${w1} ${f1}/${d} = ${w1 - 1} ${regrouped}/${d}.`,
          `Step 3: Now subtract each part: ${regrouped}/${d} - ${f2}/${d} = ${regrouped - f2}/${d}, and ${w1 - 1} - ${w2} = ${w1 - w2 - 1}.`,
          `Step 4: ${w1} ${f1}/${d} - ${w2} ${f2}/${d} = ${answer}.`,
        ],
        conceptSummary:
          'Regrouping a mixed number trades one whole for its equivalent in parts — one whole is exactly d of them — so the number does not change, only the way it is written. The whole-number part must drop by one at the same moment.',
        commonMisconception:
          'Taking the smaller fraction from the larger one to avoid regrouping gives an answer that is too big by twice the difference, and leaves the whole-number part one too high as well.',
      },
    };
  },
};
