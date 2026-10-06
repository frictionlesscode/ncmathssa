import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.NBT.6 — "Add up to three two-digit numbers using strategies based on
 * place value and properties of operations."
 *
 * UP TO THREE. The Common Core standard that shares this number, 2.NBT.B.6,
 * says four; NC cut it to three, `../standards.ts` is the ground truth, and
 * this generator draws 2 or 3 addends and never 4 (ruling 18-1).
 *
 * Every addend is a two-digit number, 10 to 99, so the standard's own words
 * bound the draw. The total is deliberately kept ABOVE 100: a three-addend
 * sum that lands under 100 is a question NC.2.NBT.5 already owns, and one
 * with a three-digit addend is NC.2.NBT.7's. This standard is the narrow
 * strip between them, and the generator stays inside it.
 *
 * ---------------------------------------------------------------------------
 * Ranges. Write each addend as 10.t + o.
 *
 *   TWO addends    t1, t2 in [1,9] with 10 <= t1 + t2 <= 17
 *                  o1, o2 in [1,9] with 10 <= o1 + o2 <= 18
 *                  -> each addend 11..99, total 110..188
 *   THREE addends  t1..t3 in [1,9] with 10 <= t1 + t2 + t3 <= 18
 *                  o1..o3 in [1,9] with 10 <= o1 + o2 + o3 <= 19
 *                  -> each addend 11..99, total 110..199
 *
 * The ones total is capped at 19 so the ones column always carries EXACTLY one
 * ten. That is what keeps the two carry distractors one arithmetic step apart
 * instead of two, and it is why the ones total has an upper bound at all.
 *
 *   answer                        s = the total
 *   added-without-carrying        s - 10   the ten from the ones never added
 *   carried-into-the-wrong-column s + 90   that ten written in the hundreds
 *                                          instead of the tens (-10, +100)
 *   left-one-of-the-addends-out   s - (last addend)
 *
 * Distinctness. The first three differ by the fixed non-zero offsets 10, 90
 * and 100. The fourth differs from all of them because the last addend is a
 * two-digit number: it is never 0 (which would match s), never 10 (which would
 * match s - 10, and cannot happen since every ones digit is at least 1), and
 * never -90. Nothing is resampled and nothing is excluded, and the sibling
 * test recomputes all four values across both whole draw spaces.
 */
export const TENS_PAIRS: number[][] = [];
for (let a = 1; a <= 9; a++) {
  for (let b = 1; b <= 9; b++) {
    if (a + b >= 10 && a + b <= 17) TENS_PAIRS.push([a, b]);
  }
}

export const ONES_PAIRS: number[][] = [];
for (let a = 1; a <= 9; a++) {
  for (let b = 1; b <= 9; b++) {
    if (a + b >= 10 && a + b <= 18) ONES_PAIRS.push([a, b]);
  }
}

export const TENS_TRIPLES: number[][] = [];
for (let a = 1; a <= 9; a++) {
  for (let b = 1; b <= 9; b++) {
    for (let c = 1; c <= 9; c++) {
      if (a + b + c >= 10 && a + b + c <= 18) TENS_TRIPLES.push([a, b, c]);
    }
  }
}

export const ONES_TRIPLES: number[][] = [];
for (let a = 1; a <= 9; a++) {
  for (let b = 1; b <= 9; b++) {
    for (let c = 1; c <= 9; c++) {
      if (a + b + c >= 10 && a + b + c <= 19) ONES_TRIPLES.push([a, b, c]);
    }
  }
}

export const nbt6ThreeAddendSum: QuestionTemplate = {
  id: 'g2.nbt6.three-addend-sum',
  standardCode: 'NC.2.NBT.6',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const useThree = rng.pick([true, false]);
    const tens = useThree ? rng.pick(TENS_TRIPLES) : rng.pick(TENS_PAIRS);
    const ones = useThree ? rng.pick(ONES_TRIPLES) : rng.pick(ONES_PAIRS);

    const addends = tens.map((t, i) => 10 * t + ones[i]);
    const tensTotal = tens.reduce((x, y) => x + y, 0);
    const onesTotal = ones.reduce((x, y) => x + y, 0);
    const sum = addends.reduce((x, y) => x + y, 0);
    const last = addends[addends.length - 1];
    const answerText = `${sum}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // The ten made in the ones column was written down with the ones and
      // never added into the tens.
      { text: `${sum - 10}`, isCorrect: false, misconception: 'added-without-carrying' },
      // That same ten carried into the hundreds instead of the tens.
      { text: `${sum + 90}`, isCorrect: false, misconception: 'carried-into-the-wrong-column' },
      // One addend never joined the total at all.
      { text: `${sum - last}`, isCorrect: false, misconception: 'left-one-of-the-addends-out' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.nbt6.three-addend-sum: option collision [${texts.join(' | ')}]`);
    }

    // A seven-year-old reads these, so "1 ones" is not acceptable output.
    const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

    return {
      prompt: 'Add all of the numbers.',
      promptDetails: addends.join(' + '),
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Add the ones: ${ones.join(' + ')} = ${onesTotal}.`,
          `Step 2: ${onesTotal} is 1 ten and ${plural(onesTotal - 10, 'one')}. Write the ${onesTotal - 10} and carry the ten into the TENS column, right next door.`,
          `Step 3: Add the tens with that carried ten: ${tens.join(' + ')} + 1 = ${tensTotal + 1} tens, which is ${10 * (tensTotal + 1)}.`,
          `Step 4: ${addends.join(' + ')} = ${answerText}.`,
        ],
        conceptSummary:
          'Adding three two-digit numbers works exactly like adding two: every ones digit into the ones column, every tens digit into the tens column, and any ten made in the ones carried into the column immediately beside it. Looking first for two addends whose ones make ten makes the whole thing easier, and the total does not care what order they are taken in.',
        commonMisconception: `Both carry slips leave the ones digit right, so re-adding the ones will not find either. The check that does is to ask where the ten from ${onesTotal} went: it belongs in the tens, making ${tensTotal} + 1 = ${tensTotal + 1} tens.`,
      },
    };
  },
};
