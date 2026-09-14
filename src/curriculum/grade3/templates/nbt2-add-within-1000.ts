import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.NBT.2 — "Add and subtract whole numbers up to and including 1,000."
 *
 * This generator is the ADDITION half. `./nbt2-subtract-within-1000.ts` is the
 * subtraction half, and the two are separate templates on purpose: a review key
 * is seedless, so one template spanning both operations would let a child who
 * cannot subtract across a zero be re-served an addition question and retired
 * as having mastered the standard.
 *
 * The standard's three keyConcepts are estimation for reasonableness, the
 * addition/subtraction inverse relationship, and EXPANDED FORM decomposition —
 * not "carry out the algorithm". Those three live in `../authored.nbt.ts`,
 * where the wording is the mathematics. What is left for a generator is the
 * computation itself, and the worked solution here does it the standard's way:
 * hundreds, tens and ones added separately, with the ten that comes out of the
 * ones column named explicitly.
 *
 * There is deliberately NO ROUNDING anywhere in Grade 3 NBT. CCSS 3.NBT.A.1 is
 * rounding; NC has it at no grade in this plan.
 *
 * ---------------------------------------------------------------------------
 * Construction. Write a = 100·a2 + 10·a1 + a0 and b = 100·b2 + 10·b1 + b0.
 *
 *   HUNDREDS  a2 - 1 > b2 and a2 + b2 <= 8
 *   TENS      a1 + b1 <= 8
 *   ONES      a0 + b0 >= 10
 *
 * `a2 - 1 > b2` makes a - b at least 101, so the subtracted-instead-of-added
 * distractor is a three-digit whole number rather than one a child could rule
 * out on length alone. `a2 + b2 <= 8` keeps the sum at most 899 and the largest
 * distractor at most 989, so nothing on offer leaves the standard's "up to and
 * including 1,000". `a0 + b0 >= 10` makes the ones column regroup, which is the
 * whole point of the item, and
 * `a1 + b1 <= 8` means the tens column does NOT regroup even after the carry
 * lands in it — which is what makes the two carry distractors exactly one
 * arithmetic step apart instead of two.
 *
 * With exactly one carry, out of the ones and into the tens:
 *
 *   answer                        s = a + b
 *   added-without-carrying        s - 10    the ten from the ones never added
 *   carried-into-the-wrong-column s + 90    that ten written in the hundreds
 *                                           instead of the tens (-10, +100)
 *   subtracted-instead-of-added   a - b
 *
 * Distinctness, exhaustively. The first three differ by fixed nonzero offsets
 * (10, 90, 100), so only a - b can collide:
 *
 *   a - b = a + b        =>  b = 0.    Never, b >= 100.
 *   a - b = a + b - 10   =>  b = 5.    Never, b >= 100.
 *   a - b = a + b + 90   =>  b = -45.  Never.
 *
 * Nothing is excluded and nothing is resampled. The draw space is
 * 9 hundreds pairs x 45 tens pairs x 45 ones pairs = 18,225 questions, and
 * the sibling test sweeps all three component lists in full.
 */
interface DigitPair {
  hi: number;
  lo: number;
}

/** a2 - 1 > b2 (so a - b is a three-digit number) and a2 + b2 <= 8 (so every
 *  option stays under 1,000). */
export const HUNDREDS_PAIRS: DigitPair[] = [];
for (let hi = 3; hi <= 7; hi++) {
  for (let lo = 1; lo < hi - 1; lo++) {
    if (hi + lo <= 8) HUNDREDS_PAIRS.push({ hi, lo });
  }
}

/** a1 + b1 <= 8, so the tens column does not regroup even after the carry. */
export const TENS_PAIRS: DigitPair[] = [];
for (let hi = 0; hi <= 8; hi++) {
  for (let lo = 0; hi + lo <= 8; lo++) TENS_PAIRS.push({ hi, lo });
}

/** a0 + b0 >= 10, so the ones column always regroups. */
export const ONES_PAIRS: DigitPair[] = [];
for (let hi = 1; hi <= 9; hi++) {
  for (let lo = 1; lo <= 9; lo++) {
    if (hi + lo >= 10) ONES_PAIRS.push({ hi, lo });
  }
}

export const nbt2AddWithin1000: QuestionTemplate = {
  id: 'g3.nbt2.add-within-1000',
  standardCode: 'NC.3.NBT.2',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const h = rng.pick(HUNDREDS_PAIRS);
    const t = rng.pick(TENS_PAIRS);
    const o = rng.pick(ONES_PAIRS);

    const a = 100 * h.hi + 10 * t.hi + o.hi;
    const b = 100 * h.lo + 10 * t.lo + o.lo;

    const sum = a + b;
    const onesSum = o.hi + o.lo;
    const answerText = `${sum}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // sum - 10: the ten inside the ones column was written down as part of
      // the ones digit and never added into the tens.
      { text: `${sum - 10}`, isCorrect: false, misconception: 'added-without-carrying' },
      // sum + 90: that same ten was carried, but written above the hundreds
      // instead of the tens, so the tens are 10 short and the hundreds 100 long.
      { text: `${sum + 90}`, isCorrect: false, misconception: 'carried-into-the-wrong-column' },
      // a - b: the two numbers were subtracted instead of added.
      { text: `${a - b}`, isCorrect: false, misconception: 'subtracted-instead-of-added' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.nbt2.add-within-1000: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Add.',
      promptDetails: `${a} + ${b}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Line the numbers up by place value and start at the ones: ${o.hi} + ${o.lo} = ${onesSum}.`,
          `Step 2: ${onesSum} is more than 9, so write ${onesSum - 10} in the ones place and carry the ten into the TENS column, right next door.`,
          `Step 3: Add the tens with that carried ten: ${t.hi} + ${t.lo} + 1 = ${t.hi + t.lo + 1} tens. Then add the hundreds: ${h.hi} + ${h.lo} = ${h.hi + h.lo} hundreds.`,
          `Step 4: ${a} + ${b} = ${answerText}.`,
        ],
        conceptSummary:
          'Ten of one place is worth one of the next place to the left. That is the whole of carrying: ten ones become one ten, so the carried digit lands in the column immediately beside the one it came from and never one column further along.',
        commonMisconception: `Both carry slips leave the ones digit right and something else wrong, so re-adding the ones will not find either one. The check that does is to ask where the ten from ${o.hi} + ${o.lo} went: it belongs in the tens, making ${t.hi} + ${t.lo} + 1 = ${t.hi + t.lo + 1}.`,
      },
    };
  },
};
