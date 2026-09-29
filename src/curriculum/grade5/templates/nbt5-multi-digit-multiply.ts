import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.5.NBT.5 — three digits times two digits by the standard algorithm.
 *
 * With b = 10*t + o (t >= 1, o >= 1 by Ruling F7) the four values are
 *
 *   answer      a*(10t + o)
 *   no zero     a*(t + o)        placeholder zero left off the tens row
 *   stopped     a*o              only the ones row was written
 *   added ones  10*a*t + o       tens row multiplied, ones digit added
 *
 * Pairwise:
 *   answer = no zero  => 9at = 0, impossible (a >= 112, t >= 1)
 *   answer = stopped  => 10at = 0, impossible
 *   no zero = stopped => at = 0, impossible
 *   added ones = answer  => o = a*o => o(a - 1) = 0, impossible
 *   added ones = no zero => 9at = o(a - 1); o(a - 1) < 9a <= 9at, impossible
 *   added ones = stopped => 10at = o(a - 1); o(a - 1) < 10a <= 10at, impossible
 *
 * so the four are distinct by construction for every (a, b) in range. An
 * exhaustive sweep of all 70,240 admissible pairs confirms it.
 */
export const nbt5MultiDigitMultiply: QuestionTemplate = {
  id: 'g5.nbt5.multi-digit-multiply',
  standardCode: 'NC.5.NBT.5',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const a = rng.int(112, 989);
    // Ruling F7: a multiplier ending in 0 makes the "stopped after the ones
    // row" distractor 0, which no student would write as a product.
    const drawn = rng.int(12, 99);
    const b = drawn % 10 === 0 ? drawn + 1 : drawn;

    const tens = Math.floor(b / 10);
    const ones = b % 10;

    const onesRow = a * ones;
    const tensRow = a * tens * 10;
    const answer = onesRow + tensRow;

    const missingPlaceholderZero = onesRow + a * tens;
    const stoppedAfterOnesRow = onesRow;
    const addedTheOnesDigit = tensRow + ones;

    const candidates = [
      { text: `${answer}`, isCorrect: true },
      {
        text: `${missingPlaceholderZero}`,
        isCorrect: false,
        misconception: 'dropped-partial-product-zero',
      },
      { text: `${stoppedAfterOnesRow}`, isCorrect: false, misconception: 'forgot-the-final-step' },
      {
        text: `${addedTheOnesDigit}`,
        isCorrect: false,
        misconception: 'added-the-ones-digit-instead-of-multiplying',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g5.nbt5.multi-digit-multiply: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Multiply.',
      promptDetails: `${a} × ${b}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: `${answer}`,
      explanation: {
        stepByStep: [
          `Step 1: Split ${b} into ${tens * 10} + ${ones}.`,
          `Step 2: Multiply by the ones digit: ${a} × ${ones} = ${onesRow}.`,
          `Step 3: Multiply by the tens digit, keeping the placeholder zero: ${a} × ${tens * 10} = ${tensRow}.`,
          `Step 4: Add the two partial products: ${onesRow} + ${tensRow} = ${answer}.`,
        ],
        conceptSummary:
          'Multiplying by a two-digit number is two multiplications added together. The second row is multiplied by tens, so it needs a placeholder zero to sit in the right places.',
        commonMisconception:
          'A quick estimate catches a dropped placeholder zero: the product should land near the rounded multiplication, not at a tenth of it.',
      },
    };
  },
};
