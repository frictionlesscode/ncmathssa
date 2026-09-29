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

interface FactorPair {
  n1: number;
  d1: number;
  n2: number;
  d2: number;
}

/**
 * Every pair of proper fractions over the grade 5 denominators whose four
 * option values are pairwise distinct.
 *
 * Writing p = n1*n2/(d1*d2) for the answer, the distractors are the mediant
 * (n1+n2)/(d1+d2), the cross product (n1*d2)/(d1*n2) and the double
 * reciprocal (d1*d2)/(n1*n2). Three of the six pairs are impossible outright:
 *
 *   answer = cross       => n2^2 = d2^2, and n2 < d2
 *   cross  = flip both   => n1^2 = d1^2, and n1 < d1
 *   answer = flip both   => the answer is a proper product, so below 1,
 *                           while its reciprocal is above 1
 *
 * The mediant is the only value that can tie anything, and an exhaustive
 * sweep of all 484 pairs shows it ties only the cross product, for exactly
 * seven draws (1/2 x 3/4, 1/3 x 2/3, 2/4 x 6/8, 1/6 x 3/6, 2/6 x 4/6,
 * 1/8 x 2/4, 3/8 x 3/4). Those satisfy (n1+n2)*d1*n2 === (d1+d2)*n1*d2 and
 * are left out of this table, so a colliding draw is unreachable rather than
 * merely unlikely.
 */
const FACTOR_PAIRS: FactorPair[] = DENOMINATORS.flatMap((d1) =>
  Array.from({ length: d1 - 1 }, (_, i) => i + 1).flatMap((n1) =>
    DENOMINATORS.flatMap((d2) =>
      Array.from({ length: d2 - 1 }, (_, i) => i + 1)
        .filter((n2) => (n1 + n2) * d1 * n2 !== (d1 + d2) * n1 * d2)
        .map((n2) => ({ n1, d1, n2, d2 })),
    ),
  ),
);

export const nf4MultiplyFractions: QuestionTemplate = {
  id: 'g5.nf4.multiply-fractions',
  standardCode: 'NC.5.NF.4',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { n1, d1, n2, d2 } = rng.pick(FACTOR_PAIRS);

    const answer = simplify(n1 * n2, d1 * d2);
    const addedAcross = simplify(n1 + n2, d1 + d2);
    const crossMultiplied = simplify(n1 * d2, d1 * n2);
    const flippedBoth = simplify(d1 * d2, n1 * n2);

    const candidates = [
      { text: answer, isCorrect: true },
      { text: addedAcross, isCorrect: false, misconception: 'added-numerators-and-denominators' },
      { text: crossMultiplied, isCorrect: false, misconception: 'multiplied-crosswise' },
      { text: flippedBoth, isCorrect: false, misconception: 'inverted-both-fractions' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g5.nf4.multiply-fractions: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Multiply the fractions and write the product in simplest form:',
      promptDetails: `${n1}/${d1} × ${n2}/${d2}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: Multiplying fractions needs no common denominator — multiply straight across.`,
          `Step 2: Numerators: ${n1} × ${n2} = ${n1 * n2}.`,
          `Step 3: Denominators: ${d1} × ${d2} = ${d1 * d2}.`,
          `${n1 * n2}/${d1 * d2}` === answer
            ? `Step 4: ${n1 * n2}/${d1 * d2} has no common factor left to remove, so the product is ${answer}.`
            : `Step 4: ${n1 * n2}/${d1 * d2} simplifies to ${answer}.`,
        ],
        conceptSummary:
          'Multiplying by a fraction less than one takes a part of a part, so the product is smaller than either factor. Numerators multiply together and denominators multiply together, with no common denominator needed.',
        commonMisconception:
          'Keep-change-flip belongs to division. Applied to a multiplication problem it turns the answer upside down, giving a product larger than both factors.',
      },
    };
  },
};
