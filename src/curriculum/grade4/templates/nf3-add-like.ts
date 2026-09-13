import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/** The like denominators NC.4.NF.3 names, less 2 and 100. 2 is barred by the
 *  collision algebra below (it makes 2d and d*d the same number) and 100 is
 *  barred because two proper hundredths that also sum to a proper fraction are
 *  not an addition a Grade 4 child does without a calculator. */
const DENOMINATORS = [3, 4, 5, 6, 8, 10, 12];

/**
 * Every (d, a, b) this template will use, built by exhaustive enumeration.
 *
 * The four option values are
 *
 *   answer     (a+b)/d
 *   bothDenoms (a+b)/2d    the denominators added as well as the numerators
 *   multDenoms (a+b)/d^2   the denominators multiplied together
 *   difference (a-b)/d     subtracted instead of added
 *
 * and all six pairs are settled by algebra, not by sampling:
 *
 *   (a+b)/d   = (a+b)/2d   => d = 2d, impossible for d >= 1
 *   (a+b)/d   = (a+b)/d^2  => d = d^2, impossible for d >= 2
 *   (a+b)/2d  = (a+b)/d^2  => d^2 = 2d => d = 2. EXCLUDED: d >= 3 above.
 *   (a-b)/d   = (a+b)/d    => b = 0. EXCLUDED: b >= 1.
 *   (a-b)/d   = (a+b)/2d   => 2(a-b) = a+b => a = 3b. EXCLUDED below.
 *   (a-b)/d   = (a+b)/d^2  => d(a-b) = a+b => a(d-1) = b(d+1). EXCLUDED below.
 *
 * With a > b >= 1 and a + b <= d (so the sum stays a proper fraction and the
 * difference stays positive), 75 (d, a, b) triples satisfy the ranges and 63
 * survive the two exclusions. The sibling test sweeps all 75 and checks that
 * each of the 12 barred triples really would have put two options on the same
 * number — nothing is excluded for tidiness.
 */
export function admissibleAddends(): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (const d of DENOMINATORS) {
    for (let a = 2; a <= d - 1; a++) {
      for (let b = 1; b < a; b++) {
        if (a + b > d) continue;
        if (a === 3 * b) continue;
        if (a * (d - 1) === b * (d + 1)) continue;
        out.push([d, a, b]);
      }
    }
  }
  return out;
}

const ADDENDS = admissibleAddends();

/**
 * NC.4.NF.3 — add fractions with like denominators, understood as joining
 * parts that refer to the same whole.
 *
 * One template, one skill (spec 6.5). Subtraction lives in ./nf3-subtract-
 * mixed.ts under its own template id, not as a branch here: a ReviewKey is
 * seedless, so one template spanning both would let a child who failed at
 * regrouping be reviewed with an addition item, promoted for answering it, and
 * retired as mastered with the regrouping never retested. The two also emit
 * disjoint misconception sets, which is the test the spec gives.
 *
 * Largest numbers printed: 144, which is 12 x 12 in the multiplied-denominator
 * distractor. Numerators never exceed 12.
 */
export const nf3AddLike: QuestionTemplate = {
  id: 'g4.nf3.add-like',
  standardCode: 'NC.4.NF.3',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const [d, a, b] = rng.pick(ADDENDS);
    const sum = a + b;
    const answer = `${sum}/${d}`;

    const candidates = [
      { text: answer, isCorrect: true },
      // The denominators added along with the numerators: d + d = 2d, which
      // halves the size of every part.
      {
        text: `${sum}/${2 * d}`,
        isCorrect: false,
        misconception: 'operated-on-the-like-denominators-too',
      },
      // The denominators multiplied together, as if a common denominator had
      // to be built out of two that already matched.
      {
        text: `${sum}/${d * d}`,
        isCorrect: false,
        misconception: 'multiplied-the-denominators-instead-of-keeping-them',
      },
      // a - b: the parts separated instead of joined.
      {
        text: `${a - b}/${d}`,
        isCorrect: false,
        misconception: 'subtracted-instead-of-added',
      },
    ];

    // Distinct BY CONSTRUCTION; a collision means the exclusions in
    // admissibleAddends() and these four expressions have drifted apart.
    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nf3.add-like: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Add the fractions.',
      promptDetails: `${a}/${d} + ${b}/${d}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: Both fractions are already counted in ${d}ths, so the parts are the same size and nothing has to be renamed.`,
          `Step 2: Adding them joins ${a} of those parts to ${b} more of them.`,
          `Step 3: Count the parts: ${a} + ${b} = ${sum}. The parts themselves did not change size, so the denominator stays ${d}.`,
          `Step 4: ${a}/${d} + ${b}/${d} = ${answer}.`,
        ],
        conceptSummary:
          'Adding fractions with a common denominator is counting. The denominator names WHAT is being counted, so it travels through the addition unchanged while only the count goes up.',
        commonMisconception:
          'Adding the denominators too makes every part smaller and gives a sum below the larger addend — joining two amounts can never leave you with less than you started with.',
      },
    };
  },
};
