import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { fmt } from './numberFormat';

/**
 * Ones-digit gaps that are admissible for a given top digit in SUBTRACT mode.
 * The gap d = m0 - n0 must be at least 1 (so the ones column really does need
 * a regrouping) and must not carry the bottom digit past 9. It must also avoid
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
 * NC.4.NBT.4 — add and subtract whole numbers to 100,000 by the standard
 * algorithm. One generator, two modes, because the standard is one standard:
 * a student who can carry but cannot borrow has not met it.
 *
 * Both modes build a five-digit number n and a four-digit number m digit by
 * digit, so that exactly ONE column needs regrouping — the ones column. That
 * is what makes each distractor a single identifiable slip rather than a
 * mystery number: there is only one place the slip can happen.
 *
 * ── SUBTRACT mode ─────────────────────────────────────────────────────────
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
 * ── ADD mode ──────────────────────────────────────────────────────────────
 * Digits are drawn so the ones column carries (n0 + m0 >= 10) and no other
 * column does. The hundreds column is held to n2 + m2 <= 8 so that a carry
 * misplaced INTO it cannot cascade further.
 *
 *   answer      n + m
 *   no carry    answer - 10    the ten was never carried into the tens column
 *   wrong column answer + 90   the carry was written above the hundreds column
 *                              instead of the tens: -10 in the tens, +100 in
 *                              the hundreds
 *   subtracted  answer - 2m    addition read as subtraction
 *
 * Pairwise: -10, +90 and -2m are three non-zero gaps from the answer (m >= 1000);
 * -10 != 90; -10 = -2m needs m = 5; 90 = -2m needs m negative. So the four are
 * distinct for every m >= 1000 with nothing excluded at all. The gaps are
 * functions of m alone, so the collision space is m in [1000, 9999] and an
 * exhaustive sweep of all 9,000 values confirms it.
 */
export const nbt4AddSubtract: QuestionTemplate = {
  id: 'g4.nbt4.add-subtract',
  standardCode: 'NC.4.NBT.4',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const subtracting = rng.int(0, 1) === 0;

    if (subtracting) {
      const n0 = rng.int(0, 8);
      const gap = rng.pick(ONES_GAPS[n0]);
      const m0 = n0 + gap;

      const n1 = rng.int(1, 9);
      const m1 = rng.int(0, n1 - 1);
      const n2 = rng.int(0, 9);
      const m2 = rng.int(0, n2);
      const n3 = rng.int(1, 9);
      const m3 = rng.int(1, n3);
      const n4 = rng.int(1, 9);

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
        throw new Error(`g4.nbt4.add-subtract: option collision [${texts.join(' | ')}]`);
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
            `Adding the answer back to ${fmt(m)} should return ${fmt(n)} exactly — the check that catches a borrow that was taken but never paid for.`,
        },
      };
    }

    // ── ADD mode ────────────────────────────────────────────────────────────
    const n0 = rng.int(1, 9);
    const m0 = rng.int(10 - n0, 9);
    const n1 = rng.int(0, 8);
    const m1 = rng.int(0, 8 - n1);
    const n2 = rng.int(0, 8);
    const m2 = rng.int(0, 8 - n2);
    const m3 = rng.int(1, 9);
    const n3 = rng.int(0, 9 - m3);
    const n4 = rng.int(1, 9);

    const n = n4 * 10000 + n3 * 1000 + n2 * 100 + n1 * 10 + n0;
    const m = m3 * 1000 + m2 * 100 + m1 * 10 + m0;

    const answer = n + m;
    const noCarry = answer - 10;
    const wrongColumn = answer + 90;
    const subtractedInstead = n - m;

    const answerText = fmt(answer);

    const candidates = [
      { text: answerText, isCorrect: true },
      // The ones column gave ${n0 + m0}, so its ten belonged in the tens
      // column; the tens column was added as ${n1} + ${m1} with nothing
      // carried in, leaving the total ten short.
      { text: fmt(noCarry), isCorrect: false, misconception: 'added-without-carrying' },
      // The carried ten was written above the hundreds column instead of the
      // tens: the tens come out ten too small and the hundreds a hundred too
      // large, a net ninety too much.
      {
        text: fmt(wrongColumn),
        isCorrect: false,
        misconception: 'carried-into-the-wrong-column',
      },
      // n - m: the two numbers were subtracted.
      {
        text: fmt(subtractedInstead),
        isCorrect: false,
        misconception: 'subtracted-instead-of-added',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nbt4.add-subtract: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Add.',
      promptDetails: `${fmt(n)} + ${fmt(m)}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Line the numbers up by place value and start at the ones: ${n0} + ${m0} = ${n0 + m0}.`,
          `Step 2: That is more than 9, so write ${n0 + m0 - 10} in the ones place and carry the ten into the TENS column.`,
          `Step 3: ${n1} + ${m1} + 1 = ${n1 + m1 + 1} tens; then ${n2} + ${m2} = ${n2 + m2} hundreds, ${n3} + ${m3} = ${n3 + m3} thousands, and ${n4} ten thousands.`,
          `Step 4: ${fmt(n)} + ${fmt(m)} = ${answerText}.`,
        ],
        conceptSummary:
          'A carry is ten ones becoming one ten, so it lands in the column immediately to the left — never one further along. Which column it lands in is the whole of what place value means here.',
        commonMisconception:
          `Rounding gives a fast check: ${fmt(n)} + ${fmt(m)} is near ${fmt(Math.round(n / 1000) * 1000 + Math.round(m / 1000) * 1000)}, so an answer ninety or a hundred away from the total is worth re-adding.`,
      },
    };
  },
};
