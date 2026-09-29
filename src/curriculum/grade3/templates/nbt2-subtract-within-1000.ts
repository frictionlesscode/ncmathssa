import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.NBT.2 — "Add and subtract whole numbers up to and including 1,000."
 *
 * This generator is the SUBTRACTION half; `./nbt2-add-within-1000.ts` is the
 * addition half. They are two templates rather than one because a review key is
 * seedless: a single template spanning both operations would let a child who
 * cannot subtract be re-served an addition question and retired as having
 * mastered the standard.
 *
 * Every question here subtracts ACROSS A ZERO — the top number always has a 0
 * in its tens place, and its ones digit is always smaller than the bottom
 * number's. That is the one subtraction a Grade 3 student reliably gets wrong,
 * because the tens place has nothing to lend and the trade has to come from the
 * hundreds and stop in the tens on the way. The two named errors it produces
 * are the two distractors this generator is built around.
 *
 * There is deliberately NO ROUNDING anywhere in Grade 3 NBT. CCSS 3.NBT.A.1 is
 * rounding; NC has it at no grade in this plan.
 *
 * ---------------------------------------------------------------------------
 * Construction. Write a = 100·a2 + 0·10 + a0 and b = 100·b2 + 10·b1 + b0.
 *
 *   HUNDREDS  a2 - 1 > b2 and a2 + b2 <= 8
 *   TENS      a1 = 0 always; b1 is free in 0..9
 *   ONES      b0 > a0
 *
 * `a2 - 1 > b2` makes the difference positive, leaves a hundred available to
 * trade, AND leaves a hundreds digit behind after the trade — so the answer and
 * both subtraction distractors are three-digit numbers. Merely `a2 > b2` also
 * works arithmetically, but at a2 = 2, b2 = 1 it can print an option as a bare
 * "8" beside an answer of "98", and an option a child can rule out on length
 * alone is not a distractor. `a2 + b2 <= 8` caps a + b at 907, so the
 * added-instead-of-subtracted distractor stays inside the standard's "up to and
 * including 1,000". `b0 > a0` forces the regroup, and the 0 in the tens forces
 * it to come from the hundreds.
 *
 * The four option values:
 *
 *   answer                          d  = a - b
 *   subtracted-without-regrouping   V1 = 100(a2-b2) + 10·b1 + (b0-a0)
 *                                        every column done smaller-from-larger
 *   lost-the-regrouping-across-a-0  V2 = 100(a2-1-b2) + 10·b1 + (a0+10-b0)
 *                                        a hundred traded straight into the
 *                                        ones, leaving the 0 untouched
 *   added-instead-of-subtracted     a + b
 *
 * Distinctness, exhaustively, with d = 100(a2-b2) - 10·b1 + (a0-b0):
 *
 *   V1 - d  = 20·b1 + 2(b0 - a0).  b0 > a0, so this is >= 2. Never 0.
 *   V2 - d  = 10(2·b1 - 9).        b1 is a whole number, so never 0.
 *   V1 - V2 = 90 + 2(b0 - a0).     >= 92. Never 0.
 *   a + b   exceeds all three: (a+b) - V1 = 200·b2 + 2·a0 >= 200, and
 *           (a+b) - V2 = 100(2·b2 + 1) + 2·b0 - 10 >= 92, and a+b > a-b
 *           because b >= 100.
 *
 * Nothing is excluded and nothing is resampled. The draw space is
 * 9 hundreds pairs x 10 tens digits x 45 ones pairs = 4,050 questions, swept
 * in full by the sibling test.
 */
interface DigitPair {
  hi: number;
  lo: number;
}

/** a2 - 1 > b2 (a positive difference, a hundred to trade, and a hundreds digit
 *  still standing afterwards) and a2 + b2 <= 8 (so a + b stays under 1,000). */
export const HUNDREDS_PAIRS: DigitPair[] = [];
for (let hi = 3; hi <= 7; hi++) {
  for (let lo = 1; lo < hi - 1; lo++) {
    if (hi + lo <= 8) HUNDREDS_PAIRS.push({ hi, lo });
  }
}

/** "1 ten" but "9 tens". Every count in the worked solution runs through this,
 *  because a solution that reads "1 hundreds" is read by an eight-year-old. */
function count(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? '' : 's'}`;
}

/** b0 > a0, so the ones column always has to regroup. */
export const ONES_PAIRS: DigitPair[] = [];
for (let top = 0; top <= 8; top++) {
  for (let bottom = top + 1; bottom <= 9; bottom++) ONES_PAIRS.push({ hi: top, lo: bottom });
}

export const nbt2SubtractWithin1000: QuestionTemplate = {
  id: 'g3.nbt2.subtract-within-1000',
  standardCode: 'NC.3.NBT.2',
  domainId: 'NBT',
  difficulty: 'advanced',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const h = rng.pick(HUNDREDS_PAIRS);
    const b1 = rng.int(0, 9);
    const o = rng.pick(ONES_PAIRS);

    const a = 100 * h.hi + o.hi;
    const b = 100 * h.lo + 10 * b1 + o.lo;

    const difference = a - b;
    const noRegroup = 100 * (h.hi - h.lo) + 10 * b1 + (o.lo - o.hi);
    const lostAcrossZero = 100 * (h.hi - 1 - h.lo) + 10 * b1 + (o.hi + 10 - o.lo);
    const answerText = `${difference}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // Every column done smaller-from-larger, so no trade ever happens.
      { text: `${noRegroup}`, isCorrect: false, misconception: 'subtracted-without-regrouping' },
      // A hundred traded straight down into the ones, past the 0, so the tens
      // digit was never turned into a 9.
      {
        text: `${lostAcrossZero}`,
        isCorrect: false,
        misconception: 'lost-the-regrouping-across-a-zero',
      },
      // a + b: added instead of taking away.
      { text: `${a + b}`, isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.nbt2.subtract-within-1000: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Subtract.',
      promptDetails: `${a} − ${b}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Start at the ones. There ${o.hi === 1 ? 'is' : 'are'} ${count(o.hi, 'one')} and ${o.lo} are needed, so a ten has to be traded in — but the tens place is a 0 and has none to lend.`,
          `Step 2: Trade one hundred first. ${a} is ${count(h.hi, 'hundred')} and ${count(o.hi, 'one')}, which becomes ${count(h.hi - 1, 'hundred')}, 10 tens and ${count(o.hi, 'one')}.`,
          `Step 3: Now trade one of those tens: ${count(h.hi - 1, 'hundred')}, 9 tens and ${count(o.hi + 10, 'one')}. Subtract each place: ${o.hi + 10} − ${o.lo} = ${count(o.hi + 10 - o.lo, 'one')}, 9 − ${b1} = ${count(9 - b1, 'ten')}, ${h.hi - 1} − ${h.lo} = ${count(h.hi - 1 - h.lo, 'hundred')}.`,
          `Step 4: ${a} − ${b} = ${answerText}.`,
        ],
        conceptSummary:
          'A 0 in the tens has nothing to lend, so the trade has to come from the hundreds — and it stops in the tens on the way. One hundred becomes ten tens, and then one of those tens becomes ten ones, which is why the 0 ends up as a 9.',
        commonMisconception: `Taking the hundred straight down to the ones and leaving the 0 alone skips the middle of the trade, and lands ${Math.abs(lostAcrossZero - difference)} away from ${answerText}.`,
      },
    };
  },
};
