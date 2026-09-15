import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.NBT.7 — "Add and subtract, within 1000, relating the strategy to a
 * written method."
 *
 * The SUBTRACTION half of the computation. `./nbt7-add-within-1000.ts` is the
 * addition half, and the two are SEPARATE TEMPLATES on purpose. A review key is
 * seedless (`{kind:'generated', templateId}` in
 * `../../../engine/questionModel.ts`, no seed), so one template spanning both
 * operations would let a child who cannot trade across a column here be
 * re-served an addition item under the identical key, answer it correctly, and
 * have the borrowing failure retired as mastered without ever being retested.
 * The two halves also emit disjoint misconception sets — borrow errors here,
 * carry errors there — which is the spec's own tell that they are two skills.
 * Grade 3 splits the same two operations for the same reason
 * (`../../grade3/templates/nbt2-subtract-within-1000.ts` and its addition
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
 *   TENS      at in [1,8], bt in [0, at-1] with at + bt <= 8
 *   ONES      ao in [0,8], bo in [ao+1, 9] with bo - ao != 5
 *
 *   The ones always regroup; `bt <= at - 1` means the tens never need a second
 *   trade after the first one costs them a ten; `ah + bh <= 8` and
 *   `at + bt <= 8` keep a + b at most 897.
 *
 *     answer                        d = a - b
 *     subtracted-without-regrouping 100(ah-bh) + 10(at-bt) + (bo-ao) = d + 2(bo-ao)
 *     borrowed-without-reducing-the-next-column   d + 10
 *     added-instead-of-subtracted   a + b
 *
 *   Distinctness: d and the no-regroup value differ by 2(bo-ao) > 0; the
 *   no-regroup value equals d + 10 exactly when bo - ao = 5, which the ones
 *   list excludes; and a + b exceeds the no-regroup value by
 *   200.bh + 20.bt + 2.ao >= 200, exceeds d by 2b and exceeds d + 10 by
 *   2b - 10 >= 192. Nothing is resampled. The sibling test walks every
 *   component list in full.
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

/** Tens: bt <= at - 1 (one trade out of the tens is enough) and at + bt <= 8
 *  (so a + b stays under 1,000). */
export const TENS_PAIRS: DigitPair[] = [];
for (let hi = 1; hi <= 8; hi++) {
  for (let lo = 0; lo <= hi - 1 && lo <= 8 - hi; lo++) TENS_PAIRS.push({ hi, lo });
}

/** Ones: ao < bo, so the ones must regroup; bo - ao != 5, the one gap that
 *  would make two distractors collide. */
export const ONES_PAIRS: DigitPair[] = [];
for (let hi = 0; hi <= 8; hi++) {
  for (let lo = hi + 1; lo <= 9; lo++) {
    if (lo - hi !== 5) ONES_PAIRS.push({ hi, lo });
  }
}

export const nbt7SubtractWithin1000: QuestionTemplate = {
  id: 'g2.nbt7.subtract-within-1000',
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

    const diff = a - b;
    const answerText = `${diff}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // The smaller digit taken from the larger in every column, whichever
      // number it belonged to.
      {
        text: `${100 * (h.hi - h.lo) + 10 * (t.hi - t.lo) + (o.lo - o.hi)}`,
        isCorrect: false,
        misconception: 'subtracted-without-regrouping',
      },
      // Regrouped into the ones but never took the ten off the tens column it
      // came from: one ten too large.
      {
        text: `${diff + 10}`,
        isCorrect: false,
        misconception: 'borrowed-without-reducing-the-next-column',
      },
      // Added instead of subtracting.
      { text: `${a + b}`, isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.nbt7.subtract-within-1000: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Line the numbers up by place value, then subtract.',
      promptDetails: `${a} − ${b}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Ones: ${o.hi} − ${o.lo} will not go, so trade one ten from the ${plural(t.hi, 'ten')}.`,
          `Step 2: The tens drop to ${t.hi - 1} and the ones become ${o.hi + 10}. Now ${o.hi + 10} − ${o.lo} = ${o.hi + 10 - o.lo}.`,
          `Step 3: Tens: ${t.hi - 1} − ${t.lo} = ${plural(t.hi - 1 - t.lo, 'ten')}. Hundreds: ${h.hi} − ${h.lo} = ${plural(h.hi - h.lo, 'hundred')}.`,
          `Step 4: ${a} − ${b} = ${answerText}.`,
        ],
        conceptSummary:
          'Regrouping is a trade, and a trade has a cost: one ten leaves the tens column and arrives in the ones as ten ones. The written method records that cost by crossing the tens digit out, which is the half most easily skipped.',
        commonMisconception: `A column whose top digit is smaller cannot simply be turned round. Taking ${o.hi} from ${o.lo} instead of ${o.lo} from ${o.hi} gives ${100 * (h.hi - h.lo) + 10 * (t.hi - t.lo) + (o.lo - o.hi)}, and adding ${b} back to that does not return ${a}.`,
      },
    };
  },
};
