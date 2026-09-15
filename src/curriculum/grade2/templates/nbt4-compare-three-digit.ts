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
 *   tg in [1,9], tl in [0, tg-1]     tg > tl, so g > l
 *   og in [0,8], ol in [og+1, 9]     og < ol, so the ones point the other way
 *
 *   g = 100h + 10tg + og,  l = 100h + 10tl + ol,  both in [100, 999], g > l.
 *
 * ORDER OF PRINTING. A coin flip then decides which of the two is printed
 * FIRST, and every sentence is written in that order. Without it the greater
 * number was always printed on the left and the correct symbol was always `>`,
 * across all 18,225 parameter combinations — so the whole item was answerable
 * by "pick the option with a `>` in it", which is exactly the guessing the
 * reason-clauses exist to stop. With the flip the answer is `>` on about half
 * the draws and `<` on the other half, and the symbol alone tells a child
 * nothing.
 *
 * Every question turns on the tens place, exactly once, and the three named
 * errors each have a sentence on offer. Written with the greater number first
 * (the flip mirrors all four):
 *
 *   answer                               g > l BECAUSE tg tens > tl tens
 *   compared-the-wrong-place-first        g < l because og ones < ol ones
 *   stopped-comparing-too-soon            g = l because both have h hundreds
 *   compared-by-digit-count-not-place-value  g = l because both have 3 digits
 *
 * All four strings open with the same two numbers in the same order and differ
 * from the symbol or the reason on, so no two can collide; the two `=`
 * sentences differ from the fourth word on. The draw space is
 * 9 x 45 x 45 x 2 = 36,450 questions and the sibling test sweeps the tens and
 * ones pair lists in full, in both orientations.
 */
interface DigitPair {
  hi: number;
  lo: number;
}

/** tg > tl: the tens decide the comparison. */
export const TENS_PAIRS: DigitPair[] = [];
for (let hi = 1; hi <= 9; hi++) {
  for (let lo = 0; lo < hi; lo++) TENS_PAIRS.push({ hi, lo });
}

/** og < ol: the ones point the opposite way from the true answer. */
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
    // Which of the two is printed first. Without this the greater number was
    // always on the left and `>` was always the correct symbol, so the item was
    // answerable without comparing anything.
    const greaterFirst = rng.pick([true, false]);

    const greater = 100 * h + 10 * t.hi + o.hi;
    const lesser = 100 * h + 10 * t.lo + o.lo;
    const first = greaterFirst ? greater : lesser;
    const second = greaterFirst ? lesser : greater;

    // A seven-year-old reads these, so "1 tens" is not acceptable output.
    const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

    const answerText = greaterFirst
      ? `${greater} > ${lesser}, because ${plural(t.hi, 'ten')} is more than ${plural(t.lo, 'ten')}`
      : `${lesser} < ${greater}, because ${plural(t.lo, 'ten')} is less than ${plural(t.hi, 'ten')}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // Compared the ones digits, which the construction points the other way.
      {
        text: greaterFirst
          ? `${greater} < ${lesser}, because ${plural(o.hi, 'one')} is less than ${plural(o.lo, 'one')}`
          : `${lesser} > ${greater}, because ${plural(o.lo, 'one')} is more than ${plural(o.hi, 'one')}`,
        isCorrect: false,
        misconception: 'compared-the-wrong-place-first',
      },
      // Stopped at the hundreds place, where the two digits match.
      {
        text: `${first} = ${second}, because both numbers have ${plural(h, 'hundred')}`,
        isCorrect: false,
        misconception: 'stopped-comparing-too-soon',
      },
      // Counted digits instead of comparing places — and both have three.
      {
        text: `${first} = ${second}, because both numbers have three digits`,
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
      promptDetails: `Compare ${first} and ${second}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Start at the greatest place. Both numbers have ${plural(h, 'hundred')}, so the hundreds cannot decide it.`,
          `Step 2: Move right to the tens. ${first} has ${plural(greaterFirst ? t.hi : t.lo, 'ten')} and ${second} has ${plural(greaterFirst ? t.lo : t.hi, 'ten')}.`,
          `Step 3: ${plural(t.hi, 'ten')} is ${10 * t.hi} and ${plural(t.lo, 'ten')} is ${10 * t.lo}, so ${greater} is the greater number. The ones never get a turn.`,
          `Step 4: ${answerText}.`,
        ],
        conceptSummary:
          'Comparing runs left to right: hundreds, then tens, then ones. The first place where the digits differ settles it, and nothing to the right of that place can change the answer.',
        commonMisconception: `${greater} has ${plural(o.hi, 'one')} and ${lesser} has ${plural(o.lo, 'one')}, so starting from the ones points the wrong way. A bigger ones digit cannot rescue a number that is already behind in the tens.`,
      },
    };
  },
};
