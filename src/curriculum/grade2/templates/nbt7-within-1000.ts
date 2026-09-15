import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.NBT.7 — "Add and subtract, within 1000, relating the strategy to a
 * written method."
 *
 * The COMPUTATION half. Like NC.2.NBT.5, this is a strategy standard: its
 * keyConcepts are concrete models or drawings, strategies based on place
 * value, properties of operations, and the relationship between addition and
 * subtraction. Relating a strategy to a written method, choosing between two
 * of them, and reading a drawing are all questions about wording, and they are
 * authored by hand (g2-nbt7-01 ties blocks to the algorithm, g2-nbt7-03 counts
 * up, g2-nbt7-04 selects a strategy), per ruling 18-7. What a generator adds
 * is the arithmetic itself on numbers a child has not seen, and the worked
 * solution below always names the trade rather than just performing it.
 *
 * Addition and subtraction are drawn with equal probability, matching the
 * Grade 2 house style set by `./oa2-fluency-fact.ts`. Grade 3 splits the same
 * mathematics into two templates; Grade 2 has one generator per standard.
 *
 * ---------------------------------------------------------------------------
 * Ranges. Write a = 100.ah + 10.at + ao and b = 100.bh + 10.bt + bo.
 *
 * ADDITION
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
 *   respectively, all impossible for b >= 101.
 *
 * SUBTRACTION
 *   HUNDREDS  the same list: ah in [3,7], bh in [1, ah-2], ah + bh <= 8
 *   TENS      at in [1,9], bt in [0, at-1] with at + bt <= 8
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

/** Shared by both branches: ah - bh >= 2 and ah + bh <= 8. */
export const HUNDREDS_PAIRS: DigitPair[] = [];
for (let hi = 3; hi <= 7; hi++) {
  for (let lo = 1; lo <= hi - 2; lo++) {
    if (hi + lo <= 8) HUNDREDS_PAIRS.push({ hi, lo });
  }
}

/** Addition tens: at + bt <= 8, so the tens do not regroup after the carry. */
export const ADD_TENS_PAIRS: DigitPair[] = [];
for (let hi = 0; hi <= 8; hi++) {
  for (let lo = 0; hi + lo <= 8; lo++) ADD_TENS_PAIRS.push({ hi, lo });
}

/** Addition ones: ao + bo >= 10, so the ones always regroup. */
export const ADD_ONES_PAIRS: DigitPair[] = [];
for (let hi = 1; hi <= 9; hi++) {
  for (let lo = 1; lo <= 9; lo++) {
    if (hi + lo >= 10) ADD_ONES_PAIRS.push({ hi, lo });
  }
}

/** Subtraction tens: bt <= at - 1 (one trade out of the tens is enough) and
 *  at + bt <= 8 (so a + b stays under 1,000). */
export const SUB_TENS_PAIRS: DigitPair[] = [];
for (let hi = 1; hi <= 8; hi++) {
  for (let lo = 0; lo <= hi - 1 && lo <= 8 - hi; lo++) SUB_TENS_PAIRS.push({ hi, lo });
}

/** Subtraction ones: ao < bo, so the ones must regroup; bo - ao != 5, the one
 *  gap that would make two distractors collide. */
export const SUB_ONES_PAIRS: DigitPair[] = [];
for (let hi = 0; hi <= 8; hi++) {
  for (let lo = hi + 1; lo <= 9; lo++) {
    if (lo - hi !== 5) SUB_ONES_PAIRS.push({ hi, lo });
  }
}

export const nbt7Within1000: QuestionTemplate = {
  id: 'g2.nbt7.within-1000',
  standardCode: 'NC.2.NBT.7',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    // A seven-year-old reads these, so "1 tens" is not acceptable output.
    const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
    const isAddition = rng.pick([true, false]);
    const h = rng.pick(HUNDREDS_PAIRS);

    if (isAddition) {
      const t = rng.pick(ADD_TENS_PAIRS);
      const o = rng.pick(ADD_ONES_PAIRS);
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
        throw new Error(`g2.nbt7.within-1000: option collision [${texts.join(' | ')}]`);
      }

      return {
        prompt: 'Line the numbers up by place value, then work it out.',
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
    }

    const t = rng.pick(SUB_TENS_PAIRS);
    const o = rng.pick(SUB_ONES_PAIRS);
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
      throw new Error(`g2.nbt7.within-1000: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Line the numbers up by place value, then work it out.',
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
