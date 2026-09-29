import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { decimalString } from './decimalFormat';

/**
 * NC.5.NBT.1 — multiplying or dividing by a power of ten shifts every digit
 * by that many places.
 *
 * Every value in the item is `digits × 10^e` for the SAME three digits, so
 * two options are equal exactly when their exponents are equal. With
 * k = ±exp (exp >= 1) the four exponents are
 *
 *   answer      -p + k
 *   wrong way   -p - k
 *   one short   -p + k - s      (s = sign of k)
 *   one too far -p + k + s
 *
 * and no two of those can coincide: k = -k needs exp = 0; k = k ± s needs
 * s = 0; k - s = k + s needs s = 0; and k ± s = -k needs exp = ∓1/2. Every
 * case is impossible for integer exp >= 1, so the four options are distinct
 * by construction at every seed, with no constraint on the digits at all.
 */
export const nbt1PowersOfTen: QuestionTemplate = {
  id: 'g5.nbt1.powers-of-ten',
  standardCode: 'NC.5.NBT.1',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    // Draw the digits individually so the leading and trailing digits are
    // never zero: a base like 4.50 or 0.56 would print with a zero that
    // reads as a magnitude change rather than a digit.
    const d1 = rng.int(1, 9);
    const d2 = rng.int(0, 9);
    const d3 = rng.int(1, 9);
    const digits = d1 * 100 + d2 * 10 + d3;

    const places = rng.pick([1, 2]); // 45.6 or 4.56
    const exp = rng.int(1, 3);
    const multiplying = rng.next() < 0.5;

    // Signed shift: left (larger) when multiplying, right when dividing.
    const k = multiplying ? exp : -exp;
    const s = multiplying ? 1 : -1;

    const answer = decimalString(digits, -places + k);
    const wrongDirection = decimalString(digits, -places - k);
    // One place short of the required shift. At exp = 1 this is the starting
    // number itself, which is exactly what a student who moves "no places"
    // writes down, so it stays an honest value for the tag.
    const oneShort = decimalString(digits, -places + k - s);
    const oneTooFar = decimalString(digits, -places + k + s);

    const base = decimalString(digits, -places);
    const operator = multiplying ? '×' : '÷';

    const candidates = [
      { text: answer, isCorrect: true },
      { text: wrongDirection, isCorrect: false, misconception: 'place-value-shift-wrong-direction' },
      { text: oneShort, isCorrect: false, misconception: 'decimal-point-misplaced' },
      { text: oneTooFar, isCorrect: false, misconception: 'wrong-power-of-ten' },
    ];

    // Distinct by construction (see the exponent argument above); a collision
    // would mean a distractor's tag no longer names the error that produced
    // it, so fail loudly rather than patching the value.
    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g5.nbt1.powers-of-ten: option collision [${texts.join(' | ')}]`);
    }

    const direction = multiplying ? 'left' : 'right';
    const sizeWord = multiplying ? 'larger' : 'smaller';

    return {
      prompt: 'Find the value of this expression.',
      promptDetails: `${base} ${operator} 10^${exp}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: 10^${exp} is ${Array(exp).fill('10').join(' × ')}, so every digit moves ${exp} place${exp === 1 ? '' : 's'}.`,
          `Step 2: ${multiplying ? 'Multiplying' : 'Dividing'} by a power of ten makes the number ${sizeWord}, so the digits move ${exp} place${exp === 1 ? '' : 's'} to the ${direction}.`,
          `Step 3: The digits ${d1}, ${d2}, ${d3} stay in that order; only their place values change.`,
          `Step 4: ${base} ${operator} 10^${exp} = ${answer}.`,
        ],
        conceptSummary:
          'A power of ten never changes a number’s digits — it only changes what each digit is worth. Decide which way the value should move first, then count the places.',
        commonMisconception:
          'Checking the direction first catches the most common slip: the answer must be larger when multiplying and smaller when dividing, no matter how many places move.',
      },
    };
  },
};
