import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.NBT.5 — "Demonstrate fluency with addition and subtraction, within
 * 100."
 *
 * This generator is the SUBTRACTION half of the fluency practice.
 * `./nbt5-add-within-100.ts` is the addition half, and the two are SEPARATE
 * TEMPLATES on purpose. A review key is seedless
 * (`{kind:'generated', templateId}` in `../../../engine/questionModel.ts`, no
 * seed), so one template spanning both operations would let a child who cannot
 * regroup across a ten here be re-served an addition item under the identical
 * key, answer it correctly, and have the borrowing failure retired as mastered
 * without ever being retested. The two halves also emit disjoint misconception
 * sets — borrow errors here, carry errors there — which is the spec's own tell
 * that they are two skills. Grade 3 splits the same two operations for the same
 * reason (`../../grade3/templates/nbt2-subtract-within-1000.ts` and its addition
 * sibling), and so does Grade 4's NC.4.NBT.4.
 *
 * The standard's three keyConcepts are using strategies flexibly, COMPARING
 * strategies and explaining why they work, and SELECTING an appropriate one —
 * and none of those three can be asked by swapping numbers, because the
 * question is about the strategy rather than the answer. They are authored by
 * hand in `../authored.nbt.ts` (g2-nbt5-02 selects, g2-nbt5-04 compares and
 * explains), per ruling 18-7. What is left for a generator is fluency itself,
 * which is precisely the thing that needs numbers a child has not seen before,
 * and the worked solution below always does it the standard's way: by place
 * value, with the traded ten named out loud.
 *
 * ---------------------------------------------------------------------------
 * Ranges. Every question regroups exactly once, and every number printed stays
 * inside the standard's 100.
 *
 * a = 10.ta + oa, b = 10.tb + ob with
 *     ta > tb >= 1, ta + tb <= 8                   (12 pairs)
 *     0 <= oa < ob <= 9 and ob - oa != 5           (40 pairs)
 *   so the ones always regroup and the tens never need to after it. The tens
 *   gap ta - tb is at most 7 - 1 = 6 under `ta + tb <= 8`, and the ones
 *   contribute oa - ob in [-9,-1], so d = a - b is in [1,59]; a + b is at most
 *   97.
 *
 *     answer                       d = a - b
 *     subtracted-without-regrouping  10(ta-tb) + (ob-oa) = d + 2(ob-oa)
 *     borrowed-without-reducing-the-next-column   d + 10
 *     added-instead-of-subtracted    a + b
 *
 *   Distinctness. d vs the no-regroup value differ by 2(ob-oa) > 0. The
 *   no-regroup value equals d + 10 exactly when ob - oa = 5, which the pair
 *   list excludes — that single exclusion is the whole reason ONES_PAIRS is
 *   40 long and not 45. a + b = d forces b = 0, a + b = d + 10 forces b = 5,
 *   and a + b = d + 2(ob-oa) forces tb = 0 and oa = 0 together; b >= 11 and
 *   tb >= 1 rule all three out. The sibling test walks the draw space whole.
 */
interface DigitPair {
  hi: number;
  lo: number;
}

/** Tens: ta > tb >= 1 (a - b stays two-digit-ish and positive) and ta + tb <= 8
 *  (so the added-instead-of-subtracted distractor stays under 100). */
export const TENS_PAIRS: DigitPair[] = [];
for (let hi = 2; hi <= 7; hi++) {
  for (let lo = 1; lo < hi && lo <= 8 - hi; lo++) TENS_PAIRS.push({ hi, lo });
}

/** Ones: oa < ob, so the ones must regroup; and ob - oa != 5, which is the one
 *  gap that would make two distractors collide. */
export const ONES_PAIRS: DigitPair[] = [];
for (let hi = 0; hi <= 8; hi++) {
  for (let lo = hi + 1; lo <= 9; lo++) {
    if (lo - hi !== 5) ONES_PAIRS.push({ hi, lo });
  }
}

export const nbt5SubtractWithin100: QuestionTemplate = {
  id: 'g2.nbt5.subtract-within-100',
  standardCode: 'NC.2.NBT.5',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    // A seven-year-old reads these, so "1 tens" is not acceptable output.
    const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

    const t = rng.pick(TENS_PAIRS);
    const o = rng.pick(ONES_PAIRS);
    const a = 10 * t.hi + o.hi;
    const b = 10 * t.lo + o.lo;

    const diff = a - b;
    const answerText = `${diff}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // The smaller digit taken from the larger in each column, whichever
      // number it belonged to.
      {
        text: `${10 * (t.hi - t.lo) + (o.lo - o.hi)}`,
        isCorrect: false,
        misconception: 'subtracted-without-regrouping',
      },
      // Regrouped into the ones but never took the ten off the tens column it
      // came from, so the answer is one ten too large.
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
      throw new Error(`g2.nbt5.subtract-within-100: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Subtract these numbers in your head.',
      promptDetails: `${a} − ${b}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Ones first: ${o.hi} − ${o.lo} will not go, so trade one ten from the ${plural(t.hi, 'ten')}.`,
          `Step 2: The tens drop to ${t.hi - 1} and the ones become ${o.hi + 10}. Now ${o.hi + 10} − ${o.lo} = ${o.hi + 10 - o.lo}.`,
          `Step 3: Tens: ${t.hi - 1} − ${t.lo} = ${plural(t.hi - 1 - t.lo, 'ten')}.`,
          `Step 4: ${a} − ${b} = ${answerText}.`,
        ],
        conceptSummary:
          'Regrouping takes one ten and hands it to the ones as ten ones. The tens column must lose that one — the trade costs something, and forgetting the cost is what leaves the answer a whole ten too big.',
        commonMisconception: `The ones column asks for ${o.hi} − ${o.lo}, not ${o.lo} − ${o.hi}. Flipping it round because it is easier that way gives ${10 * (t.hi - t.lo) + (o.lo - o.hi)}, and adding ${b} back to that does not return ${a}.`,
      },
    };
  },
};
