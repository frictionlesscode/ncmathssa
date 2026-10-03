import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { decimalString } from './decimalFormat';

/** One multiplier or divisor NC.5.NBT.1 names, and `k`, the signed number of
 *  places the number's digits move: positive moves them left (the number
 *  grows), negative moves them right (the number shrinks). */
interface Move {
  op: '×' | '÷';
  label: string;
  k: number;
}

/**
 * NC-R4: "multiplied by 1,000, 100, 10, 0.1, and 0.01 and/or divided by 10
 * and 100". Nothing else is drawn: no division by 1,000, none by 0.1 or 0.01,
 * and no exponent notation.
 */
const MOVES: readonly Move[] = [
  { op: '×', label: '1,000', k: 3 },
  { op: '×', label: '100', k: 2 },
  { op: '×', label: '10', k: 1 },
  { op: '×', label: '0.1', k: -1 },
  { op: '×', label: '0.01', k: -2 },
  { op: '÷', label: '10', k: -1 },
  { op: '÷', label: '100', k: -2 },
];

/**
 * NC.5.NBT.1 — multiplying or dividing by a power of ten shifts every digit
 * by that many places.
 *
 * Every value in the item is `digits × 10^e` for the SAME three digits, so
 * two options are equal exactly when their exponents are equal. With the
 * signed shift k of the drawn move (k is 1, 2 or 3 in size, never 0) and
 * s = sign of k, the four exponents are
 *
 *   answer      -p + k
 *   wrong way   -p - k
 *   one short   -p + k - s
 *   one too far -p + k + s
 *
 * and no two of those can coincide: k = -k needs k = 0; k = k ± s needs
 * s = 0; k - s = k + s needs s = 0; and k ± s = -k needs k = ∓1/2. Every
 * case is impossible for a non-zero integer k, so the four options are
 * distinct by construction at every seed, with no constraint on the digits.
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
    const { op, label, k } = rng.pick(MOVES);
    const s = Math.sign(k);
    const n = Math.abs(k);
    const larger = k > 0;

    const answer = decimalString(digits, -places + k);
    const wrongDirection = decimalString(digits, -places - k);
    // One place short of the required shift. At |k| = 1 this is the starting
    // number itself, which is exactly what a student who moves "no places"
    // writes down, so it stays an honest value for the tag.
    const oneShort = decimalString(digits, -places + k - s);
    const oneTooFar = decimalString(digits, -places + k + s);

    const base = decimalString(digits, -places);

    const candidates = [
      { text: answer, isCorrect: true },
      { text: wrongDirection, isCorrect: false, misconception: 'place-value-shift-wrong-direction' },
      { text: oneShort, isCorrect: false, misconception: 'decimal-point-misplaced' },
      { text: oneTooFar, isCorrect: false, misconception: 'wrong-power-of-ten' },
    ];

    // Distinct by construction (see the argument above); a collision would
    // mean a distractor's tag no longer names the error that produced it, so
    // fail loudly rather than patching the value.
    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g5.nbt1.powers-of-ten: option collision [${texts.join(' | ')}]`);
    }

    const plural = n === 1 ? '' : 's';
    const verb = op === '×' ? 'Multiplying' : 'Dividing';

    return {
      prompt: 'Find the value of this expression.',
      promptDetails: `${base} ${op} ${label}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: ${verb} by ${label} makes the number ${larger ? 'larger' : 'smaller'}.`,
          `Step 2: Every digit moves ${n} place${plural} to the ${larger ? 'left' : 'right'}, so the decimal point moves ${n} place${plural} to the ${larger ? 'right' : 'left'}.`,
          `Step 3: The digits ${d1}, ${d2}, ${d3} stay in that order; only their place values change.`,
          `Step 4: ${base} ${op} ${label} = ${answer}.`,
        ],
        conceptSummary:
          'A power of ten never changes a number’s digits — it only changes what each digit is worth. Decide which way the value should move first, then count the places.',
        commonMisconception:
          'Checking the direction first catches a wrong-way answer: multiplying by 10, 100 or 1,000 makes the number larger, while multiplying by 0.1 or 0.01 and dividing by 10 or 100 make it smaller.',
      },
    };
  },
};
