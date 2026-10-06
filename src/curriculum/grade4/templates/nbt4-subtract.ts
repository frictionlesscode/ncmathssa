import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { fmt } from './numberFormat';

/**
 * Ones-digit gaps that are admissible for a given top digit. The gap
 * d = m0 - n0 must be at least 1 (so the ones column really does need a
 * regrouping) and must not carry the bottom digit past 9. It must also avoid
 * exactly 5, for the reason given in the collision algebra below. d = 1 always
 * survives, so this list is never empty.
 */
function admissibleOnesGaps(topOnes: number): number[] {
  const out: number[] = [];
  for (let d = 1; d <= 9 - topOnes; d++) {
    if (d !== 5) out.push(d);
  }
  return out;
}

/** Precomputed once per top digit rather than on every generate() call. */
const ONES_GAPS: number[][] = Array.from({ length: 9 }, (_, topOnes) =>
  admissibleOnesGaps(topOnes),
);

/**
 * NC.4.NBT.4 — SUBTRACT multi-digit whole numbers to 100,000 by the standard
 * algorithm.
 *
 * Subtraction and addition are separate templates on purpose, even though
 * NC.4.NBT.4 names both. `ReviewKey` is seedless (see questionModel.ts), and
 * the session composer re-realizes a due review at a fresh random seed — so one
 * template covering both operations files ONE review key for two skills. A
 * child who misses a borrow would be handed an addition item at review half the
 * time, answer it correctly, promote the Leitner box, and after enough
 * promotions retire the key as mastered with the borrowing never retested. The
 * app would report a repair it had not made. The tell is that the two modes
 * emit disjoint misconception sets. Mastery is tracked per standard, so
 * splitting costs nothing there.
 *
 * The numbers are built digit by digit so that exactly ONE column needs a
 * regrouping — the ones column. That is what makes each distractor a single
 * identifiable slip rather than a mystery number: there is only one place the
 * slip can happen.
 *
 * Digits are drawn so that n0 < m0 (the ones column needs a borrow) and every
 * other column of n is at least the matching column of m (no other column
 * does). Write d = m0 - n0, so 1 <= d <= 9.
 *
 *   answer     n - m
 *   no borrow  answer + 2d    every column took the smaller digit from the
 *                             larger one, so the ones column gave d instead
 *                             of 10 - d, and the tens column was never
 *                             reduced: (d - (10 - d)) + 10 = 2d
 *   kept ten   answer + 10    the ten WAS borrowed into the ones but the tens
 *                             digit above was never reduced by one
 *   added      answer + 2m    subtraction read as addition
 *
 * Pairwise, writing each gap as a difference from the answer:
 *   no borrow = answer  =>  2d = 0, and d >= 1
 *   kept ten  = answer  =>  10 = 0
 *   added     = answer  =>  2m = 0, and m >= 1000
 *   no borrow = kept ten =>  2d = 10  =>  d = 5.  EXCLUDED by construction:
 *                            admissibleOnesGaps() never offers d = 5.
 *   no borrow = added   =>  2d = 2m  =>  m = d <= 9, and m >= 1000
 *   kept ten  = added   =>  2m = 10  =>  m = 5, and m >= 1000
 * So d != 5 is the single exclusion, and it is applied by filtering the draw,
 * not by resampling.
 *
 * Every gap above is a function of (d, m) alone — the answer cancels out of
 * all six — so the collision space is exactly {1,2,3,4,6,7,8,9} x [1000,9999].
 * An exhaustive sweep of all 8 * 9,000 = 72,000 of those pairs finds no
 * collision; without the d != 5 rule, 9,000 of them collide.
 *
 * The ten thousands digit of n stops at 8 so that NOTHING printed in the item
 * runs past the standard's ceiling of 100,000 — not the answer, and not the
 * "added instead" distractor, which is n + m and is the largest number the
 * item can show. With n <= 89,999 and m <= 9,999 that sum is at most 99,998.
 * A five-digit bound on the answer alone is not the same bound: a child is
 * handed every option, not only the right one.
 */
export const nbt4Subtract: QuestionTemplate = {
  id: 'g4.nbt4.subtract',
  standardCode: 'NC.4.NBT.4',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const n0 = rng.int(0, 8);
    const gap = rng.pick(ONES_GAPS[n0]);
    const m0 = n0 + gap;

    const n1 = rng.int(1, 9);
    const m1 = rng.int(0, n1 - 1);
    const n2 = rng.int(0, 9);
    const m2 = rng.int(0, n2);
    const n3 = rng.int(1, 9);
    const m3 = rng.int(1, n3);
    // Capped at 8 so that n + m, the largest number this item can print,
    // stays inside 100,000.
    const n4 = rng.int(1, 8);

    const n = n4 * 10000 + n3 * 1000 + n2 * 100 + n1 * 10 + n0;
    const m = m3 * 1000 + m2 * 100 + m1 * 10 + m0;

    const answer = n - m;
    const noBorrow = answer + 2 * gap;
    const keptTheTen = answer + 10;
    const addedInstead = n + m;

    const answerText = fmt(answer);

    const candidates = [
      { text: answerText, isCorrect: true },
      // Every column took the smaller digit from the larger one: the ones
      // column gave |n0 - m0| = gap instead of (10 + n0) - m0, and the tens
      // digit was never reduced by the borrow it should have paid for.
      {
        text: fmt(noBorrow),
        isCorrect: false,
        misconception: 'subtracted-without-regrouping',
      },
      // The ten was taken into the ones column and used there, but the tens
      // digit it came from was left as it was, so the answer is a full ten
      // too large.
      {
        text: fmt(keptTheTen),
        isCorrect: false,
        misconception: 'borrowed-without-reducing-the-next-column',
      },
      // n + m: the two numbers were added.
      {
        text: fmt(addedInstead),
        isCorrect: false,
        misconception: 'added-instead-of-subtracted',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nbt4.subtract: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Subtract.',
      promptDetails: `${fmt(n)} − ${fmt(m)}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Line the numbers up by place value and start at the ones: ${n0} is less than ${m0}, so the ones column needs a ten from the tens column.`,
          `Step 2: Regroup: the ${n1} tens become ${n1 - 1} tens, and the ones become ${n0 + 10}. Then ${n0 + 10} − ${m0} = ${10 - gap}.`,
          `Step 3: Now every other column subtracts without regrouping: ${n1 - 1} − ${m1} = ${n1 - 1 - m1} tens, ${n2} − ${m2} = ${n2 - m2} hundreds, ${n3} − ${m3} = ${n3 - m3} thousands, and ${n4} ten thousands is untouched.`,
          `Step 4: ${fmt(n)} − ${fmt(m)} = ${answerText}.`,
        ],
        conceptSummary:
          'Regrouping is not a trick: the ten moved into the ones column has to be taken FROM the tens column, so the tens digit goes down by one at the same moment the ones digit goes up by ten. Both halves, every time.',
        commonMisconception:
          `Adding the answer back to ${fmt(m)} should return ${fmt(n)} exactly — the check that catches a borrow that was taken but never paid for, and a column subtracted the wrong way round.`,
      },
    };
  },
};
