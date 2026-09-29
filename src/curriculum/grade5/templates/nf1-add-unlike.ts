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

export const nf1AddUnlike: QuestionTemplate = {
  id: 'g5.nf1.add-unlike',
  standardCode: 'NC.5.NF.1',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    // NC.5.NF.1 restricts grade 5 to related denominators, so build the
    // larger denominator as a multiple of the smaller one.
    const dSmall = rng.pick([2, 3, 4, 5, 6]);
    const factor = rng.int(2, 4);
    const dLarge = dSmall * factor;

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
