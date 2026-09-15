import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.NBT.5 — "Demonstrate fluency with addition and subtraction, within
 * 100."
 *
 * This generator is the ADDITION half of the fluency practice.
 * `./nbt5-subtract-within-100.ts` is the subtraction half, and the two are
 * SEPARATE TEMPLATES on purpose. A review key is seedless
 * (`{kind:'generated', templateId}` in `../../../engine/questionModel.ts`, no
 * seed), so one template spanning both operations would let a child who cannot
 * regroup across a ten in subtraction be re-served an addition item under the
 * identical key, answer it correctly, and have the borrowing failure retired as
 * mastered without ever being retested. The two halves also emit disjoint
 * misconception sets — carry errors here, borrow errors there — which is the
 * spec's own tell that they are two skills. Grade 3 splits the same two
 * operations for the same reason (`../../grade3/templates/nbt2-add-within-1000.ts`
 * and its subtraction sibling), and so does Grade 4's NC.4.NBT.4.
 *
 * The standard's three keyConcepts are using strategies flexibly, COMPARING
 * strategies and explaining why they work, and SELECTING an appropriate one —
 * and none of those three can be asked by swapping numbers, because the
 * question is about the strategy rather than the answer. They are authored by
 * hand in `../authored.nbt.ts` (g2-nbt5-02 selects, g2-nbt5-04 compares and
 * explains), per ruling 18-7. What is left for a generator is fluency itself,
 * which is precisely the thing that needs numbers a child has not seen before,
 * and the worked solution below always does it the standard's way: by place
 * value, with the regrouped ten named out loud.
 *
 * ---------------------------------------------------------------------------
 * Ranges. Every question regroups exactly once, and every number printed stays
 * inside the standard's 100 except the deliberately-far-off "wrote the digits
 * side by side" distractor.
 *
 * a = 10.ta + oa, b = 10.tb + ob with
 *     ta, tb in [1,7], ta + tb <= 8, ta != tb      (24 pairs)
 *     oa, ob in [1,9], oa + ob >= 10               (45 pairs)
 *   so a and b are in [11,79] and the sum 10(ta+tb) + (oa+ob) is in [40,98].
 *   ta != tb guarantees a != b, so the wrong-operation distractor is never 0.
 *
 *     answer                   s = a + b
 *     added-without-carrying   s - 10   the ten inside the ones sum is lost
 *     subtracted-instead-of-added   |a - b|
 *     wrote-the-digits-side-by-side-instead-of-adding-the-values
 *                              the tens total and the ones total written next
 *                              to each other, e.g. 5 and 15 written "515"
 *
 *   Distinctness. The side-by-side value is 100(ta+tb) + (oa+ob) >= 310, above
 *   every other option (all <= 98). s and s-10 differ by 10. |a-b| = s forces
 *   min(a,b) = 0 and |a-b| = s-10 forces min(a,b) = 5; both are impossible for
 *   two-digit addends. Nothing is resampled. The sibling test walks the whole
 *   draw space.
 */
interface DigitPair {
  hi: number;
  lo: number;
}

/** Tens: ta + tb <= 8 (sum stays under 100 after the carry) and ta != tb (so
 *  a != b and the wrong-operation distractor is never 0). */
export const TENS_PAIRS: DigitPair[] = [];
for (let hi = 1; hi <= 7; hi++) {
  for (let lo = 1; lo <= 8 - hi; lo++) {
    if (lo !== hi) TENS_PAIRS.push({ hi, lo });
  }
}

/** Ones: oa + ob >= 10, so the ones column always regroups. */
export const ONES_PAIRS: DigitPair[] = [];
for (let hi = 1; hi <= 9; hi++) {
  for (let lo = 1; lo <= 9; lo++) {
    if (hi + lo >= 10) ONES_PAIRS.push({ hi, lo });
  }
}

export const nbt5AddWithin100: QuestionTemplate = {
  id: 'g2.nbt5.add-within-100',
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

    const sum = a + b;
    const tensTotal = t.hi + t.lo;
    const onesTotal = o.hi + o.lo;
    const answerText = `${sum}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // The ten inside the ones total was written down with the ones and
      // never joined the tens.
      { text: `${sum - 10}`, isCorrect: false, misconception: 'added-without-carrying' },
      // The two numbers were subtracted instead of added.
      { text: `${Math.abs(a - b)}`, isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // The tens total and the ones total written next to each other as
      // digits, instead of being added together.
      {
        text: `${tensTotal}${onesTotal}`,
        isCorrect: false,
        misconception: 'wrote-the-digits-side-by-side-instead-of-adding-the-values',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.nbt5.add-within-100: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Add these numbers in your head.',
      promptDetails: `${a} + ${b}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Break both numbers by place value: ${a} is ${10 * t.hi} and ${o.hi}, and ${b} is ${10 * t.lo} and ${o.lo}.`,
          `Step 2: The tens add to ${10 * tensTotal}, and the ones add to ${onesTotal}.`,
          `Step 3: ${onesTotal} is more than 9, so it is 1 ten and ${plural(onesTotal - 10, 'one')}. That ten joins the tens: ${10 * tensTotal} + 10 = ${10 * tensTotal + 10}.`,
          `Step 4: ${a} + ${b} = ${answerText}.`,
        ],
        conceptSummary:
          'Splitting both numbers into tens and ones turns one hard addition into two easy ones. The last step is the one that finishes it: the ten made in the ones has to be added into the tens.',
        commonMisconception: `The ones total ${onesTotal} is not ${onesTotal - 10}. It holds a ten, and leaving that ten behind makes the answer exactly 10 too small.`,
      },
    };
  },
};
