import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.NBT.4 — "Compare two three-digit numbers based on the value of the
 * hundreds, tens, and ones digits, using >, =, and < symbols."
 *
 * Every option carries its REASON as well as its symbol, which is not
 * decoration: the standard says "based on the value of the … digits", and a
 * bare `638 < 683` is answered correctly by a child who compared nothing and
 * guessed. It is also what makes four options possible at all. With a single
 * pair of numbers there are only three symbols, and `a > b` and `b < a` are
 * the same claim written twice — so a fourth bare-symbol option would have to
 * repeat one of the first three. Attaching reasons gives four genuinely
 * different sentences of which exactly one is true.
 *
 * ---------------------------------------------------------------------------
 * Construction. Both numbers are given the SAME hundreds digit, so the
 * hundreds place cannot settle the comparison and the tens have to. The ones
 * digits are then ordered the OPPOSITE way round from the true answer, so the
 * child who compares ones first reaches the wrong conclusion rather than the
 * right one by luck.
 *
 *   h  in [1,9]            the shared hundreds digit
 *   ta in [1,9], tb in [0, ta-1]     ta > tb, so a > b
 *   oa in [0,8], ob in [oa+1, 9]     oa < ob, so the ones point the other way
 *
 *   a = 100h + 10ta + oa,  b = 100h + 10tb + ob,  both in [100, 999], a > b.
 *
 * Every question therefore turns on the tens place, exactly once, and the
 * three named errors each have a sentence on offer:
 *
 *   answer                               a < b is false; a > b BECAUSE ta > tb
 *   compared-the-wrong-place-first        a < b because oa ones < ob ones
 *   stopped-comparing-too-soon            a = b because both have h hundreds
 *   compared-by-digit-count-not-place-value  a = b because both have 3 digits
 *
 * All four strings begin `${a} > ` or `${a} < ` or `${a} = ` and then differ in
 * their reason, so no two can collide; the two `=` sentences differ from the
 * fourth word on. The draw space is 9 x 45 x 45 = 18,225 questions and the
 * sibling test sweeps the tens and ones pair lists in full.
 */
interface DigitPair {
  hi: number;
  lo: number;
}

/** ta > tb: the tens decide the comparison. */
export const TENS_PAIRS: DigitPair[] = [];
for (let hi = 1; hi <= 9; hi++) {
  for (let lo = 0; lo < hi; lo++) TENS_PAIRS.push({ hi, lo });
}

/** oa < ob: the ones point the opposite way from the true answer. */
export const ONES_PAIRS: DigitPair[] = [];
for (let hi = 0; hi <= 8; hi++) {
  for (let lo = hi + 1; lo <= 9; lo++) ONES_PAIRS.push({ hi, lo });
}

export const nbt4CompareThreeDigit: QuestionTemplate = {
  id: 'g2.nbt4.compare-three-digit',
  standardCode: 'NC.2.NBT.4',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const h = rng.int(1, 9);
    const t = rng.pick(TENS_PAIRS);
    // `hi` here is the ones digit of the GREATER number, which is the smaller
    // of the two ones digits — that is the point of the construction.
    const o = rng.pick(ONES_PAIRS);

    const a = 100 * h + 10 * t.hi + o.hi;
    const b = 100 * h + 10 * t.lo + o.lo;

    // A seven-year-old reads these, so "1 tens" is not acceptable output.
    const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

    const answerText = `${a} > ${b}, because ${plural(t.hi, 'ten')} is more than ${plural(t.lo, 'ten')}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // Compared the ones digits, which the construction points the other way.
      {
        text: `${a} < ${b}, because ${plural(o.hi, 'one')} is less than ${plural(o.lo, 'one')}`,
        isCorrect: false,
        misconception: 'compared-the-wrong-place-first',
      },
      // Stopped at the hundreds place, where the two digits match.
      {
        text: `${a} = ${b}, because both numbers have ${plural(h, 'hundred')}`,
        isCorrect: false,
        misconception: 'stopped-comparing-too-soon',
      },
      // Counted digits instead of comparing places — and both have three.
      {
        text: `${a} = ${b}, because both numbers have three digits`,
        isCorrect: false,
        misconception: 'compared-by-digit-count-not-place-value',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.nbt4.compare-three-digit: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Which sentence is true?',
      promptDetails: `Compare ${a} and ${b}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Start at the greatest place. Both numbers have ${plural(h, 'hundred')}, so the hundreds cannot decide it.`,
          `Step 2: Move right to the tens. ${a} has ${plural(t.hi, 'ten')} and ${b} has ${plural(t.lo, 'ten')}.`,
          `Step 3: ${plural(t.hi, 'ten')} is ${10 * t.hi} and ${plural(t.lo, 'ten')} is ${10 * t.lo}, so ${a} is the greater number. The ones never get a turn.`,
          `Step 4: ${answerText}.`,
        ],
        conceptSummary:
          'Comparing runs left to right: hundreds, then tens, then ones. The first place where the digits differ settles it, and nothing to the right of that place can change the answer.',
        commonMisconception: `${a} has ${plural(o.hi, 'one')} and ${b} has ${plural(o.lo, 'one')}, so starting from the ones points the wrong way. A bigger ones digit cannot rescue a number that is already behind in the tens.`,
      },
    };
  },
};
