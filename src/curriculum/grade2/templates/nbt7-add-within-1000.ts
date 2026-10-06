import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.NBT.7 — "Add and subtract, within 1000, relating the strategy to a
 * written method."
 *
 * The ADDITION half of the computation. `./nbt7-subtract-within-1000.ts` is the
 * subtraction half, and the two are SEPARATE TEMPLATES on purpose. A review key
 * is seedless (`{kind:'generated', templateId}` in
 * `../../../engine/questionModel.ts`, no seed), so one template spanning both
 * operations would let a child who cannot trade across a column in subtraction
 * be re-served an addition item under the identical key, answer it correctly,
 * and have the borrowing failure retired as mastered without ever being
 * retested. The two halves also emit disjoint misconception sets — carry errors
 * here, borrow errors there — which is the spec's own tell that they are two
 * skills. Grade 3 splits the same two operations for the same reason
 * (`../../grade3/templates/nbt2-add-within-1000.ts` and its subtraction
 * sibling), and so does Grade 4's NC.4.NBT.4.
 *
 * Like NC.2.NBT.5, this is a strategy standard: its keyConcepts are concrete
 * models or drawings, strategies based on place value, properties of
 * operations, and the relationship between addition and subtraction. Relating a
 * strategy to a written method, choosing between two of them, and reading a
 * drawing are all questions about wording, and they are authored by hand
 * (g2-nbt7-01 ties blocks to the algorithm, g2-nbt7-03 counts up, g2-nbt7-04
 * selects a strategy), per ruling 18-7. What a generator adds is the arithmetic
 * itself on numbers a child has not seen, and the worked solution below always
 * names the trade rather than just performing it.
 *
 * ---------------------------------------------------------------------------
 * Ranges. Write a = 100.ah + 10.at + ao and b = 100.bh + 10.bt + bo.
 *
 *   HUNDREDS  ah in [3,7], bh in [1, ah-2], ah + bh <= 8
 *   TENS      at, bt in [0,8] with at + bt <= 8
 *   ONES      ao, bo in [1,9] with ao + bo >= 10
 *
 *   `bh <= ah - 2` makes a - b at least a three-digit number, so the
 *   wrong-operation distractor cannot be ruled out on length alone.
 *   `ah + bh <= 8` keeps the sum at most 898 and the largest distractor at
 *   most 988, inside the standard's 1,000. `ao + bo >= 10` makes the ones
 *   regroup (the point of the item) and `at + bt <= 8` stops the tens
 *   regrouping even after the carry lands, so the two carry distractors are
 *   exactly one step apart.
 *
 *     answer                        s = a + b
 *     added-without-carrying        s - 10
 *     carried-into-the-wrong-column s + 90
 *     subtracted-instead-of-added   a - b
 *
 *   Distinctness: the first three differ by fixed offsets 10, 90, 100, and
 *   a - b = a + b, a + b - 10, a + b + 90 force b = 0, b = 5 and b = -45
 *   respectively, all impossible for b >= 101. Nothing is resampled, and the
 *   sibling test walks every component list in full.
 */
interface DigitPair {
  hi: number;
  lo: number;
}

/** Hundreds: ah - bh >= 2 and ah + bh <= 8. */
export const HUNDREDS_PAIRS: DigitPair[] = [];
for (let hi = 3; hi <= 7; hi++) {
  for (let lo = 1; lo <= hi - 2; lo++) {
    if (hi + lo <= 8) HUNDREDS_PAIRS.push({ hi, lo });
  }
}

/** Tens: at + bt <= 8, so the tens do not regroup after the carry. */
export const TENS_PAIRS: DigitPair[] = [];
for (let hi = 0; hi <= 8; hi++) {
  for (let lo = 0; hi + lo <= 8; lo++) TENS_PAIRS.push({ hi, lo });
}

/** Ones: ao + bo >= 10, so the ones always regroup. */
export const ONES_PAIRS: DigitPair[] = [];
for (let hi = 1; hi <= 9; hi++) {
  for (let lo = 1; lo <= 9; lo++) {
    if (hi + lo >= 10) ONES_PAIRS.push({ hi, lo });
  }
}

export const nbt7AddWithin1000: QuestionTemplate = {
  id: 'g2.nbt7.add-within-1000',
  standardCode: 'NC.2.NBT.7',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    // A seven-year-old reads these, so "1 tens" is not acceptable output.
    const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

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
      // The ten inside the ones sum was written with the ones and never
      // added into the tens.
      { text: `${sum - 10}`, isCorrect: false, misconception: 'added-without-carrying' },
      // That same ten written above the hundreds instead of the tens.
      { text: `${sum + 90}`, isCorrect: false, misconception: 'carried-into-the-wrong-column' },
      // Subtracted instead of adding.
      { text: `${a - b}`, isCorrect: false, misconception: 'subtracted-instead-of-added' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.nbt7.add-within-1000: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Line the numbers up by place value, then add.',
      promptDetails: `${a} + ${b}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Start at the ones: ${o.hi} + ${o.lo} = ${onesSum}.`,
          `Step 2: ${onesSum} is more than 9, so write ${onesSum - 10} in the ones place and trade the ten into the TENS column, right next door.`,
          `Step 3: Tens: ${t.hi} + ${t.lo} + 1 = ${plural(t.hi + t.lo + 1, 'ten')}. Hundreds: ${h.hi} + ${h.lo} = ${plural(h.hi + h.lo, 'hundred')}.`,
          `Step 4: ${a} + ${b} = ${answerText}.`,
        ],
        conceptSummary:
          'Ten of one place is worth one of the place to its left. Writing the numbers in columns and carrying is just that trade, done on paper — blocks on a table would do exactly the same thing.',
        commonMisconception: `Both carry slips leave the ones digit right, so re-checking the ones finds neither. Ask instead where the ten from ${o.hi} + ${o.lo} went: into the tens, making ${t.hi} + ${t.lo} + 1 = ${t.hi + t.lo + 1}.`,
      },
    };
  },
};
