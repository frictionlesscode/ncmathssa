import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { fmt } from './numberFormat';

/**
 * NC.4.NBT.6 — whole-number quotients and remainders, up to three-digit
 * dividends and ONE-digit divisors. Two-digit divisors are NC.5.NBT.6, a grade
 * above, so the divisor here never leaves 2..9.
 *
 * The item is built backwards from divisor d, quotient q and remainder r, so
 * the dividend n = d*q + r is exact and needs no rounding anywhere. The
 * remainder is drawn from 1..d-1: at r = 0 the "remainder thrown away" option
 * IS the answer, and d >= 2 guarantees that range is never empty. The largest
 * dividend reachable is 9*99 + 8 = 899, inside the standard's three digits.
 *
 *   answer      "q R r"
 *   no leftover "q"          the remainder dropped
 *   multiplied  "n*d"        multiplied where the problem divided
 *   shifted     "10q R r"    the quotient digits recorded one column too far
 *                            left
 *
 * Two of the four texts carry " R " and two do not, so only two pairs can
 * collide at all:
 *   answer = shifted        =>  q = 10q  =>  q = 0, and q >= 12
 *   no leftover = multiplied =>  q = n*d = d(dq + r) = d^2*q + d*r >= 4q > q,
 *                               since d >= 2 and q >= 12 > 0
 * Both impossible, so the four are distinct by construction and nothing is
 * excluded. An exhaustive sweep of every admissible (d, q, r) triple —
 * sum over d in 2..9 of 88 * (d - 1) = 88 * 36 = 3,168 of them — confirms it.
 */
export const nbt6DivideOneDigit: QuestionTemplate = {
  id: 'g4.nbt6.divide-one-digit',
  standardCode: 'NC.4.NBT.6',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const divisor = rng.int(2, 9);
    const quotient = rng.int(12, 99);
    // Never 0: a remainder of nothing makes "dropped the remainder" correct.
    const remainder = rng.int(1, divisor - 1);
    const dividend = divisor * quotient + remainder;

    const product = divisor * quotient;

    const answerText = `${quotient} R ${remainder}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // The groups were counted correctly and the leftover was thrown away.
      { text: `${quotient}`, isCorrect: false, misconception: 'ignored-remainder' },
      // n × d: the two numbers in the problem were multiplied.
      {
        text: fmt(dividend * divisor),
        isCorrect: false,
        misconception: 'multiplied-instead-of-divided',
      },
      // The quotient's digits written one place-value column too far left, so
      // the answer comes out ten times too big while the leftover is right.
      {
        // Not decimal-point-misplaced: no decimal point appears anywhere in
        // this item. The slip is a quotient digit recorded in the wrong
        // column, which is what this tag names.
        text: `${quotient * 10} R ${remainder}`,
        isCorrect: false,
        misconception: 'misplaced-digits-in-the-quotient',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nbt6.divide-one-digit: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Divide. Write the quotient and the remainder.',
      promptDetails: `${fmt(dividend)} ÷ ${divisor}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Ask how many groups of ${divisor} fit inside ${fmt(dividend)}.`,
          `Step 2: ${divisor} × ${quotient} = ${fmt(product)}, the largest multiple of ${divisor} that is not more than ${fmt(dividend)}.`,
          `Step 3: ${fmt(dividend)} − ${fmt(product)} = ${remainder}, and ${remainder} is less than ${divisor}, so no further whole group fits.`,
          `Step 4: ${fmt(dividend)} ÷ ${divisor} = ${answerText}.`,
        ],
        conceptSummary:
          'Dividing asks how many equal groups fit and what is left when no further whole group can be made. A remainder is always smaller than the divisor — if it is not, another group still fits.',
        commonMisconception:
          `Multiplying the quotient by ${divisor} and adding the remainder should rebuild ${fmt(dividend)} exactly. That check catches both a dropped remainder and a quotient digit written in the wrong column.`,
      },
    };
  },
};
