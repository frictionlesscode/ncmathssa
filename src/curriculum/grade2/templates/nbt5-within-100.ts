import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.NBT.5 — "Demonstrate fluency with addition and subtraction, within
 * 100."
 *
 * This generator is the FLUENCY half only. The standard's three keyConcepts
 * are using strategies flexibly, COMPARING strategies and explaining why they
 * work, and SELECTING an appropriate one — and none of those three can be
 * asked by swapping numbers, because the question is about the strategy rather
 * than the answer. They are authored by hand in `../authored.nbt.ts`
 * (g2-nbt5-02 selects, g2-nbt5-04 compares and explains), per ruling 18-7.
 * What is left for a generator is fluency itself, which is precisely the thing
 * that needs numbers a child has not seen before, and the worked solution
 * below always does it the standard's way: by place value, with the regrouped
 * ten named out loud.
 *
 * Addition and subtraction are drawn with equal probability from one template,
 * matching the Grade 2 house style set by `./oa2-fluency-fact.ts`.
 *
 * ---------------------------------------------------------------------------
 * Ranges. Every question regroups exactly once, and every number printed stays
 * inside the standard's 100 except the deliberately-far-off "wrote the digits
 * side by side" distractor.
 *
 * ADDITION. a = 10.ta + oa, b = 10.tb + ob with
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
 *   two-digit addends. Nothing is resampled.
 *
 * SUBTRACTION. a = 10.ta + oa, b = 10.tb + ob with
 *     ta > tb >= 1, ta + tb <= 8                   (12 pairs)
 *     0 <= oa < ob <= 9 and ob - oa != 5           (40 pairs)
 *   so the ones always regroup, the tens never need to after it, a - b is in
 *   [1,69] and a + b is at most 97.
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
 *   tb >= 1 rule all three out. The sibling test walks both draw spaces whole.
 */
interface DigitPair {
  hi: number;
  lo: number;
}

/** Addition tens: ta + tb <= 8 (sum stays under 100 after the carry) and
 *  ta != tb (so a != b and the wrong-operation distractor is never 0). */
export const ADD_TENS_PAIRS: DigitPair[] = [];
for (let hi = 1; hi <= 7; hi++) {
  for (let lo = 1; lo <= 8 - hi; lo++) {
    if (lo !== hi) ADD_TENS_PAIRS.push({ hi, lo });
  }
}

/** Addition ones: oa + ob >= 10, so the ones column always regroups. */
export const ADD_ONES_PAIRS: DigitPair[] = [];
for (let hi = 1; hi <= 9; hi++) {
  for (let lo = 1; lo <= 9; lo++) {
    if (hi + lo >= 10) ADD_ONES_PAIRS.push({ hi, lo });
  }
}

/** Subtraction tens: ta > tb >= 1 (a - b stays two-digit-ish and positive) and
 *  ta + tb <= 8 (so the added-instead-of-subtracted distractor stays under
 *  100). */
export const SUB_TENS_PAIRS: DigitPair[] = [];
for (let hi = 2; hi <= 7; hi++) {
  for (let lo = 1; lo < hi && lo <= 8 - hi; lo++) SUB_TENS_PAIRS.push({ hi, lo });
}

/** Subtraction ones: oa < ob, so the ones must regroup; and ob - oa != 5,
 *  which is the one gap that would make two distractors collide. */
export const SUB_ONES_PAIRS: DigitPair[] = [];
for (let hi = 0; hi <= 8; hi++) {
  for (let lo = hi + 1; lo <= 9; lo++) {
    if (lo - hi !== 5) SUB_ONES_PAIRS.push({ hi, lo });
  }
}

export const nbt5Within100: QuestionTemplate = {
  id: 'g2.nbt5.within-100',
  standardCode: 'NC.2.NBT.5',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    // A seven-year-old reads these, so "1 tens" is not acceptable output.
    const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
    const isAddition = rng.pick([true, false]);

    if (isAddition) {
      const t = rng.pick(ADD_TENS_PAIRS);
      const o = rng.pick(ADD_ONES_PAIRS);
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
        throw new Error(`g2.nbt5.within-100: option collision [${texts.join(' | ')}]`);
      }

      return {
        prompt: 'Work this out in your head.',
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
    }

    const t = rng.pick(SUB_TENS_PAIRS);
    const o = rng.pick(SUB_ONES_PAIRS);
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
      throw new Error(`g2.nbt5.within-100: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Work this out in your head.',
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
