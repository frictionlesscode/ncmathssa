import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.5.NBT.6 — four digits divided by a two-digit divisor, with a leftover.
 *
 * The item is built backwards from divisor d, quotient q and remainder r, so
 * the dividend n = d*q + r is exact. Ruling F5 draws r from 1..d-1: at r = 0
 * the ignored-remainder distractor IS the answer.
 *
 *   answer      "q R r"
 *   no leftover "q"                  remainder thrown away
 *   multiplied  "n*d"                multiplied instead of dividing
 *   shifted     "10q R r"            quotient digits one place too far left
 *
 * Two of the four carry " R ", two do not, so the only pairs that could
 * collide are (answer, shifted) and (no leftover, multiplied):
 *   q = 10q       needs q = 0, and q >= 11
 *   q = n*d       needs q = (dq + r)*d > q, since d >= 12
 * Both impossible, so the four are distinct by construction. An exhaustive
 * sweep of all 83,215 admissible (d, q, r) triples confirms it.
 */
export const nbt6DivideTwoDigit: QuestionTemplate = {
  id: 'g5.nbt6.divide-two-digit',
  standardCode: 'NC.5.NBT.6',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const divisor = rng.int(12, 45);
    const quotient = rng.int(11, 99);
    // Ruling F5: never 0.
    const remainder = rng.int(1, divisor - 1);
    const dividend = divisor * quotient + remainder;

    const product = divisor * quotient;

    const answer = `${quotient} R ${remainder}`;
    const remainderIgnored = `${quotient}`;
    const multiplied = `${dividend * divisor}`;
    const quotientShifted = `${quotient * 10} R ${remainder}`;

    const candidates = [
      { text: answer, isCorrect: true },
      { text: remainderIgnored, isCorrect: false, misconception: 'ignored-remainder' },
      { text: multiplied, isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      { text: quotientShifted, isCorrect: false, misconception: 'decimal-point-misplaced' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g5.nbt6.divide-two-digit: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Divide. Give the quotient and the remainder.',
      promptDetails: `${dividend} ÷ ${divisor}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: Ask how many groups of ${divisor} fit inside ${dividend}.`,
          `Step 2: ${divisor} × ${quotient} = ${product}, the largest multiple of ${divisor} that is not more than ${dividend}.`,
          `Step 3: ${dividend} − ${product} = ${remainder}. Since ${remainder} is less than ${divisor}, no further group fits, so ${remainder} is the remainder.`,
          `Step 4: ${dividend} ÷ ${divisor} = ${answer}.`,
        ],
        conceptSummary:
          'Dividing asks how many equal groups fit, and the remainder is what is left over when no further whole group can be made. A remainder must always be smaller than the divisor.',
        commonMisconception:
          'Multiplying the quotient by the divisor and adding the remainder should rebuild the original dividend exactly — a check that catches both a dropped remainder and a misplaced quotient digit.',
      },
    };
  },
};
