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

/**
 * NC-R6: "using related fractions: halves, fourths and eighths; thirds,
 * sixths, and twelfths; fifths, tenths, and hundredths". Every pair below is
 * two denominators from one family where the larger is a multiple of the
 * smaller, so the larger one is the common denominator.
 *
 * The four options stay distinct by construction. With small denominator s,
 * large denominator L = f * s, numerators a (over s) and b (over L), and
 * a != b: the answer is (f*a + b)/L, the added-across value is
 * (a + b)/(s + L), the not-scaled value is (a + b)/L and the wrong-addend
 * value is (a + f*b)/L. Setting any two equal and clearing denominators leaves
 * a positive term equal to zero, except answer = wrong-addend, which needs
 * (f - 1)(b - a) = 0, and a != b is enforced below.
 */
const RELATED_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [2, 4],
  [2, 8],
  [4, 8],
  [3, 6],
  [3, 12],
  [6, 12],
  [5, 10],
  [5, 100],
  [10, 100],
];

export const nf1AddUnlike: QuestionTemplate = {
  id: 'g5.nf1.add-unlike',
  standardCode: 'NC.5.NF.1',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,
  contentVersion: 2, // the math changed at the same seed

  generate(rng: Rng): GeneratedQuestion {
    // NC.5.NF.1 restricts grade 5 to related denominators (RELATED_PAIRS).
    const [dSmall, dLarge] = rng.pick(RELATED_PAIRS);
    const factor = dLarge / dSmall;

    const nSmall = rng.int(1, dSmall - 1);
    let nLarge = rng.int(1, dLarge - 1);
    // wrongAddend (below) equals the correct answer exactly when
    // nLarge === nSmall, so nudge it off that value deterministically.
    if (nLarge === nSmall) nLarge = nSmall === dLarge - 1 ? nSmall - 1 : nSmall + 1;

    // Rescale the small-denominator fraction up to the common denominator.
    const scaled = nSmall * factor;
    const sumNum = scaled + nLarge;

    const answer = simplify(sumNum, dLarge);

    // Each distractor is the result of one specific error.
    const addedAcross = simplify(nSmall + nLarge, dSmall + dLarge);
    const notScaled = simplify(nSmall + nLarge, dLarge);
    // Scales the wrong addend: multiplies the SECOND fraction's numerator by
    // the factor instead of the first's (nSmall's numerator, which is what
    // actually needs rescaling to the common denominator).
    const wrongAddend = simplify(nSmall + nLarge * factor, dLarge);

    const candidates = [
      { text: answer, isCorrect: true },
      { text: addedAcross, isCorrect: false, misconception: 'added-numerators-and-denominators' },
      { text: notScaled, isCorrect: false, misconception: 'common-denominator-numerator-not-scaled' },
      { text: wrongAddend, isCorrect: false, misconception: 'scaled-the-wrong-addend' },
    ];

    // Distractors must be distinct BY CONSTRUCTION. A collision here means a
    // generator bug (an option's tag no longer describes the value it's
    // attached to), so fail loudly rather than silently nudging the value.
    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`nf1AddUnlike: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `Add the fractions and write the sum in simplest form:`,
      promptDetails: `${nSmall}/${dSmall} + ${nLarge}/${dLarge}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: ${dLarge} is a multiple of ${dSmall}, so use ${dLarge} as the common denominator.`,
          `Step 2: Rescale ${nSmall}/${dSmall} by ${factor}/${factor} to get ${scaled}/${dLarge}.`,
          `Step 3: Add the numerators over the common denominator: ${scaled}/${dLarge} + ${nLarge}/${dLarge} = ${sumNum}/${dLarge}.`,
          `Step 4: In simplest form, the sum is ${answer}.`,
        ],
        conceptSummary:
          'Fractions can only be added once they name parts of the same size. Rescale to a common denominator, then add the numerators only.',
        commonMisconception:
          'Adding denominators as well as numerators produces a sum smaller than one of the addends — a fast sanity check.',
      },
    };
  },
};
