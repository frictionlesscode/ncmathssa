import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { fmt } from './numberFormat';

const render = (xs: number[]): string => xs.map(fmt).join('; ');

/**
 * NC.4.NBT.7 — compare multi-digit whole numbers to 100,000 based on the value
 * of the digits in each place.
 *
 * Three numbers are built so that each wrong ordering is the output of ONE
 * named comparison habit rather than a shuffle:
 *
 *   S  a four-digit number whose leading digit is LARGER than the leading
 *      digit the two five-digit numbers share
 *   A  five digits: ten thousands t, thousands p
 *   B  five digits: ten thousands t, thousands q, with p < q
 *
 * so the true order is always S < A < B: S has four places and the other two
 * have five, and A and B are separated at the thousands place. The ones digits
 * are drawn as o1 < o2 < o3 and handed out as ones(B) = o1, ones(S) = o2,
 * ones(A) = o3, so ordering by the ones digit alone yields B, S, A.
 *
 *   answer         S; A; B     place value, greatest place first
 *   wrong end      B; A; S     the right order run backwards
 *   leading digit  A; B; S     S pushed to the end because its first digit is
 *                              the biggest one on the page
 *   ones digit     B; S; A     the comparison started at the right-hand end
 *
 * Those are four DIFFERENT permutations of three PAIRWISE DISTINCT numbers, so
 * the four rendered strings differ at every seed — the argument is structural
 * and needs no algebra over the digits. The only thing that could break it is
 * S, A and B failing to be distinct, and S < A < B is forced above.
 *
 * The exhaustive sweep therefore covers exactly the parameters that could
 * disturb that ordering: (t, s4) with 1 <= t <= 8 and t < s4 <= 9 gives 36
 * pairs, (p, q) with 0 <= p < q <= 9 gives 45, and the ones triples
 * o1 < o2 < o3 drawn from 0..9 give C(10,3) = 120 — 36 * 45 * 120 = 194,400
 * combinations, all checked, no collision. The six free hundreds and tens
 * digits are excluded from that space on purpose and not by omission: S is
 * four-digit and A and B already differ at the thousands place, so no value
 * of those six digits can change which of the three is largest.
 *
 * Largest number reachable: 89,999, inside the standard's ceiling of 100,000.
 */
export const nbt7CompareNumbers: QuestionTemplate = {
  id: 'g4.nbt7.compare-numbers',
  standardCode: 'NC.4.NBT.7',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const t = rng.int(1, 8);
    const s4 = rng.int(t + 1, 9);

    const p = rng.int(0, 8);
    const q = rng.int(p + 1, 9);

    // Three distinct ones digits, smallest to largest.
    const o1 = rng.int(0, 7);
    const o2 = rng.int(o1 + 1, 8);
    const o3 = rng.int(o2 + 1, 9);

    const small = s4 * 1000 + rng.int(0, 9) * 100 + rng.int(0, 9) * 10 + o2;
    const middle = t * 10000 + p * 1000 + rng.int(0, 9) * 100 + rng.int(0, 9) * 10 + o3;
    const large = t * 10000 + q * 1000 + rng.int(0, 9) * 100 + rng.int(0, 9) * 10 + o1;

    const answerText = render([small, middle, large]);

    const candidates = [
      { text: answerText, isCorrect: true },
      // The right order, run from greatest to least instead of least to
      // greatest.
      {
        text: render([large, middle, small]),
        isCorrect: false,
        misconception: 'ordered-from-the-wrong-end',
      },
      // The leading digits compared without counting places first: s4 > t, so
      // the four-digit number was called the largest of the three.
      {
        text: render([middle, large, small]),
        isCorrect: false,
        misconception: 'compared-leading-digits-without-place-value',
      },
      // Ordered by the ones digit: ones(large) < ones(small) < ones(middle).
      {
        text: render([large, small, middle]),
        isCorrect: false,
        misconception: 'compared-the-wrong-place-first',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nbt7.compare-numbers: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Order these numbers from LEAST to GREATEST.',
      // Presented in a different order again, so no option can be picked by
      // matching the order they were listed in.
      promptDetails: render([middle, small, large]),
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Count the places first. ${fmt(small)} has four digits and the other two have five, so ${fmt(small)} is the smallest no matter which digit it starts with.`,
          `Step 2: ${fmt(middle)} and ${fmt(large)} both have ${t} in the ten thousands place, so that place does not settle it.`,
          `Step 3: Move one place right: ${p} thousands against ${q} thousands, and ${p} is less than ${q}, so ${fmt(middle)} is less than ${fmt(large)}.`,
          `Step 4: From least to greatest: ${answerText}.`,
        ],
        conceptSummary:
          'Comparing multi-digit numbers means counting places first and then working from the greatest place toward the ones, stopping at the first place where the digits differ. The digits further right never overturn a difference further left.',
        commonMisconception:
          `A big first digit is not a big number: ${fmt(small)} starts with ${s4} and is still the smallest of the three, because it has one fewer place than the others.`,
      },
    };
  },
};
