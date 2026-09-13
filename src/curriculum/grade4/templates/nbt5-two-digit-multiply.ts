import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { fmt } from './numberFormat';

/**
 * NC.4.NBT.5 — two two-digit numbers multiplied together, through partial
 * products. This is the Grade 5 generator g5.nbt5.multi-digit-multiply at the
 * range NC.4.NBT.5 sets: Grade 4 multiplies two TWO-digit numbers (or three
 * digits by one digit), and three digits by two is NC.5.NBT.5, a grade above.
 *
 * With a in 12..99 and b = 10t + o (t >= 1, and o >= 1 by construction) the
 * four values are
 *
 *   answer       a*(10t + o)
 *   no zero      a*(t + o)        the placeholder zero left off the tens row
 *   stopped      a*o              only the ones row was written down
 *   added ones   10*a*t + o       the tens row multiplied, the ones digit then
 *                                 added instead of multiplied
 *
 * Pairwise, with a >= 12 and t, o >= 1:
 *   answer = no zero   =>  9at = 0, impossible
 *   answer = stopped   =>  10at = 0, impossible
 *   no zero = stopped  =>  at = 0, impossible
 *   added ones = answer  =>  o = a*o  =>  o(a - 1) = 0, impossible
 *   added ones = no zero =>  9at = o(a - 1); o(a-1) <= 9(a-1) < 9a <= 9at
 *   added ones = stopped =>  10at = o(a - 1); o(a-1) < 9a < 10a <= 10at
 * so the four are distinct by construction at every admissible (a, b) and
 * nothing is excluded beyond o >= 1.
 *
 * o >= 1 is not cosmetic: at o = 0 the "stopped after the ones row" value is
 * a*0 = 0, which no student ever writes as a product, and it would also tie
 * with nothing else honestly. Multiples of ten are therefore filtered out of
 * the multiplier pool by construction rather than resampled away.
 *
 * An exhaustive sweep of all 88 * 80 = 7,040 admissible (a, b) pairs — a from
 * 12 to 99, b from 12 to 99 excluding the eight multiples of ten — finds no
 * collision. The parameter space is small enough to check in full, so the
 * 300-seed property test is a regression guard rather than the argument.
 */
const MULTIPLIERS: number[] = (() => {
  const out: number[] = [];
  for (let b = 12; b <= 99; b++) {
    if (b % 10 !== 0) out.push(b);
  }
  return out;
})();

export const nbt5TwoDigitMultiply: QuestionTemplate = {
  id: 'g4.nbt5.two-digit-multiply',
  standardCode: 'NC.4.NBT.5',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const a = rng.int(12, 99);
    const b = rng.pick(MULTIPLIERS);

    const tens = Math.floor(b / 10);
    const ones = b % 10;

    const onesRow = a * ones;
    const tensRow = a * tens * 10;
    const answer = onesRow + tensRow;

    const missingPlaceholderZero = onesRow + a * tens;
    const stoppedAfterOnesRow = onesRow;
    const addedTheOnesDigit = tensRow + ones;

    const answerText = fmt(answer);

    const candidates = [
      { text: answerText, isCorrect: true },
      // The tens row was written as a*tens instead of a*tens*10, so the
      // second partial product is a tenth of what it should be.
      {
        text: fmt(missingPlaceholderZero),
        isCorrect: false,
        misconception: 'dropped-partial-product-zero',
      },
      // a*ones only: the ones row was found and reported as the product,
      // with the tens row never written.
      {
        text: fmt(stoppedAfterOnesRow),
        isCorrect: false,
        misconception: 'forgot-the-final-step',
      },
      // a*tens*10 + ones: the tens digit was multiplied and the ones digit
      // was then ADDED rather than multiplied.
      {
        text: fmt(addedTheOnesDigit),
        isCorrect: false,
        misconception: 'added-the-ones-digit-instead-of-multiplying',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nbt5.two-digit-multiply: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Multiply.',
      promptDetails: `${a} × ${b}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Break ${b} apart by place value: ${b} = ${tens * 10} + ${ones}.`,
          `Step 2: Multiply by the ones: ${a} × ${ones} = ${fmt(onesRow)}.`,
          `Step 3: Multiply by the tens, keeping the place: ${a} × ${tens * 10} = ${fmt(tensRow)}.`,
          `Step 4: Add the two partial products: ${fmt(onesRow)} + ${fmt(tensRow)} = ${answerText}.`,
        ],
        conceptSummary:
          'Multiplying by a two-digit number is two multiplications added together, one for each place of the second factor. The tens row counts TENS of the first factor, which is exactly what the placeholder zero records.',
        commonMisconception:
          `An estimate catches a dropped placeholder zero: ${a} × ${b} should land near ${fmt(Math.round(a / 10) * 10 * (Math.round(b / 10) * 10))}, not near a tenth of it.`,
      },
    };
  },
};
