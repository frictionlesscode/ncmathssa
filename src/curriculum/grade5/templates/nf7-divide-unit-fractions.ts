import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

function simplify(n: number, d: number): string {
  const g = gcd(n, d) || 1;
  const sn = n / g;
  const sd = d / g;
  return sd === 1 ? `${sn}` : `${sn}/${sd}`;
}

const DENOMINATORS = [2, 3, 4, 5, 6, 8];
const WHOLES = [2, 3, 4, 5, 6, 7, 8];

/**
 * NC.5.NF.7 — dividing a whole number by a unit fraction and the reverse.
 *
 * For whole w and unit fraction 1/d the item draws on the same four values
 * in both directions:
 *
 *   w * d          how many d-ths fit inside w
 *   1/(w * d)      one d-th split into w equal parts
 *   w/d            multiplied instead of divided
 *   (w+1)/(d+1)    added straight across, reading w as w/1
 *
 * Whichever direction is asked, one of the first two is the answer and the
 * other is the "flipped the dividend instead of the divisor" distractor, so
 * the same distinctness argument covers both:
 *
 *   w*d = 1/(w*d)      => (wd)^2 = 1, and wd >= 4
 *   w/d = w*d          => d^2 = 1
 *   w/d = 1/(w*d)      => w^2 = 1
 *   (w+1)/(d+1) = w*d  => w+1 = wd(d+1) >= 12, and w+1 <= 9
 *   (w+1)/(d+1) = 1/(w*d) => wd(w+1) = d+1 >= 12 against d+1 <= 9
 *   (w+1)/(d+1) = w/d  => d(w+1) = w(d+1) => d = w
 *
 * The last line is the only reachable collision, so w is drawn from the
 * whole numbers with d removed. An exhaustive sweep of the 36 remaining
 * (w, d) pairs confirms no collision; without the constraint, 6 of 42
 * collide.
 */
export const nf7DivideUnitFractions: QuestionTemplate = {
  id: 'g5.nf7.divide-unit-fractions',
  standardCode: 'NC.5.NF.7',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const denominator = rng.pick(DENOMINATORS);
    const whole = rng.pick(WHOLES.filter((w) => w !== denominator));
    const fractionFirst = rng.next() < 0.5;

    const groupsInWhole = `${whole * denominator}`;
    const sharedPiece = simplify(1, whole * denominator);

    const answer = fractionFirst ? sharedPiece : groupsInWhole;
    const flippedDividend = fractionFirst ? groupsInWhole : sharedPiece;
    const multiplied = simplify(whole, denominator);
    const addedAcross = simplify(whole + 1, denominator + 1);

    const candidates = [
      { text: answer, isCorrect: true },
      { text: flippedDividend, isCorrect: false, misconception: 'inverted-wrong-factor' },
      { text: multiplied, isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      { text: addedAcross, isCorrect: false, misconception: 'added-numerators-and-denominators' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g5.nf7.divide-unit-fractions: option collision [${texts.join(' | ')}]`);
    }

    const steps = fractionFirst
      ? [
          `Step 1: 1/${denominator} ÷ ${whole} splits one ${denominator}th into ${whole} equal parts.`,
          `Step 2: Splitting a ${denominator}th into ${whole} parts makes pieces ${whole} times smaller, so each one is a ${denominator * whole}th.`,
          `Step 3: Check it: ${whole} × 1/${denominator * whole} = 1/${denominator}.`,
          `Step 4: 1/${denominator} ÷ ${whole} = ${answer}.`,
        ]
      : [
          `Step 1: ${whole} ÷ 1/${denominator} asks how many ${denominator}ths fit inside ${whole}.`,
          `Step 2: Each whole holds ${denominator} of them.`,
          `Step 3: ${whole} wholes hold ${whole} × ${denominator} = ${whole * denominator}.`,
          `Step 4: ${whole} ÷ 1/${denominator} = ${answer}.`,
        ];

    return {
      prompt: 'Divide.',
      promptDetails: fractionFirst
        ? `1/${denominator} ÷ ${whole}`
        : `${whole} ÷ 1/${denominator}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: steps,
        conceptSummary:
          'Dividing by a unit fraction asks how many of those small pieces fit, so the answer grows. Dividing a unit fraction by a whole number cuts one piece into smaller pieces, so the answer shrinks.',
        commonMisconception:
          'Deciding which way the answer should move before computing catches most errors here: dividing by a number smaller than one always makes the result larger.',
      },
    };
  },
};
