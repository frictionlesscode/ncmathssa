import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { fmt } from './numberFormat';

/** Place names by exponent, ones first. Only 1..3 are ever used as the LOW
 *  place, but the array is indexed up to 4 because the high place is lo + 1. */
const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];

/**
 * NC.4.NBT.1 — a digit in one place represents 10 times as much as the same
 * digit in the place to its right, for whole numbers up to 100,000.
 *
 * The number carries the digit d in two ADJACENT places, lo and hi = lo + 1,
 * which is the only relationship the standard's own wording covers ("the
 * place to its right"). The student is told the 10-times relationship and
 * asked for the value of the digit in the lower of the two places, so the
 * item tests what a place is WORTH rather than what it is called.
 *
 * With lo in {1, 2} the four option values are
 *
 *   answer        d * 10^lo
 *   wrong way     d * 10^(lo+1)    the OTHER of the two places, the one that
 *                                  is ten times bigger
 *   two places    d * 10^(lo+2)    the shift counted twice
 *   the digit     d * 10^0         the digit reported instead of its value
 *
 * Every pair: d*10^i = d*10^j with d >= 2 forces 10^i = 10^j, hence i = j.
 * The four exponents are {lo, lo+1, lo+2, 0}, which is {1,2,3,0} when lo = 1
 * and {2,3,4,0} when lo = 2 — four distinct values in both cases. So the
 * options are distinct by construction for every admissible (d, lo), and
 * nothing has to be excluded.
 *
 * The option VALUES depend only on (d, lo), so the exhaustive sweep is over
 * the 8 x 2 = 16 admissible (d, lo) pairs: no collision. The three free digits
 * of the numeral (and the ten-thousands digit) appear in the prompt only and
 * cannot create one.
 *
 * lo is capped at 2 so the largest value printed anywhere in the item is
 * d * 10^4 <= 90,000, inside the standard's own ceiling of 100,000; the
 * numeral itself is at most 99,889 — d = 8 sitting in the tens and hundreds,
 * with 9s in the three free places.
 */
export const nbt1TenTimes: QuestionTemplate = {
  id: 'g4.nbt1.ten-times',
  standardCode: 'NC.4.NBT.1',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const d = rng.int(2, 9);
    const lo = rng.int(1, 2);
    const hi = lo + 1;

    // The three places that are not lo or hi. The leading digit must be
    // non-zero, and no other place may hold d, so that "the digit d is in the
    // <hi> place and also in the <lo> place" names exactly two places.
    const digits = [0, 0, 0, 0, 0];
    digits[lo] = d;
    digits[hi] = d;
    for (let place = 0; place <= 4; place++) {
      if (place === lo || place === hi) continue;
      const low = place === 4 ? 1 : 0;
      let x = rng.int(low, 8);
      if (x >= d) x += 1; // skip d, keeping the draw uniform over 9 - low values
      digits[place] = x;
    }
    const n = digits.reduce((acc, digit, place) => acc + digit * 10 ** place, 0);

    const answer = d * 10 ** lo;
    const higherPlace = d * 10 ** hi;
    const twoPlaces = d * 10 ** (lo + 2);

    const answerText = fmt(answer);

    const candidates = [
      { text: answerText, isCorrect: true },
      // d * 10^(lo+1): the value of the OTHER d, the one in the place to the
      // left. The 10-times relationship was read from right to left.
      {
        text: fmt(higherPlace),
        isCorrect: false,
        misconception: 'place-value-shift-wrong-direction',
      },
      // d * 10^(lo+2): the shift was counted twice, so the digit was placed
      // two columns further left than the one it is actually in.
      { text: fmt(twoPlaces), isCorrect: false, misconception: 'wrong-power-of-ten' },
      // d on its own: the digit was reported where the value it stands for
      // was asked for.
      { text: fmt(d), isCorrect: false, misconception: 'wrote-the-digit-not-its-value' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nbt1.ten-times: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt:
        `In ${fmt(n)}, the digit ${d} is in the ${PLACE_NAMES[hi]} place and again in the ` +
        `${PLACE_NAMES[lo]} place. The ${d} in the ${PLACE_NAMES[hi]} place is worth 10 times ` +
        `as much as the ${d} in the ${PLACE_NAMES[lo]} place. What is the value of the ${d} in ` +
        `the ${PLACE_NAMES[lo]} place?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: A digit's value is the digit multiplied by what its place is worth.`,
          `Step 2: The ${PLACE_NAMES[lo]} place is worth ${fmt(10 ** lo)}.`,
          `Step 3: ${d} × ${fmt(10 ** lo)} = ${fmt(answer)}.`,
          `Step 4: The ${d} in the ${PLACE_NAMES[lo]} place is worth ${answerText} ` +
            `(and the ${d} beside it, in the ${PLACE_NAMES[hi]} place, is worth ` +
            `${fmt(higherPlace)} — ten times as much).`,
        ],
        conceptSummary:
          'The same digit is worth a different amount in every place, and each place is worth ten times the place to its right. That is why moving one column left multiplies a digit\'s value by 10.',
        commonMisconception:
          `The digit and its value are not the same thing: the digit here is ${d}, but what it is WORTH in the ${PLACE_NAMES[lo]} place is ${answerText}.`,
      },
    };
  },
};
