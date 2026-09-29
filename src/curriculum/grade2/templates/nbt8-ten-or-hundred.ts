import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.NBT.8 — "Mentally add 10 or 100 to a given number 100–900, and mentally
 * subtract 10 or 100 from a given number 100–900."
 *
 * "10 OR 100", not "10 and 100" (ruling 18-6). Each question names ONE of the
 * two amounts and one direction, so the child has to work out WHICH place
 * moves; the other amount is always on offer as a distractor, because
 * answering 572 for "10 more than 472" is the error this standard exists to
 * catch. All four combinations — 10 more, 10 less, 100 more, 100 less — are
 * drawn with equal probability.
 *
 * ---------------------------------------------------------------------------
 * Ranges. The starting number is drawn from [200, 800]. That is narrower than
 * the standard's own 100–900 on purpose: every number this generator PRINTS,
 * the correct answer and all three distractors included, must itself be a
 * number 100–900, and the widest move any option makes is 100 in either
 * direction. A start of 200..800 makes that automatic, with no rejection and
 * no clamping:
 *
 *   n + 100 <= 900, n - 100 >= 100, n + 99 <= 899, n - 99 >= 101.
 *
 * With `delta` the amount asked for and `other` the amount that was not:
 *
 *   answer                              n +/- delta
 *   wrong-power-of-ten                  n +/- other   (10 used for 100, or
 *                                                      100 used for 10)
 *   subtracted-instead-of-added, or
 *   added-instead-of-subtracted         n -/+ delta   (right amount, wrong way)
 *   counted-by-ones-and-lost-the-count  n +/- (delta - 1)
 *
 * The last one is the error the standard names in its own first keyConcept —
 * "adding 10 or 100 mentally, WITHOUT COUNTING ON". A child who counts rather
 * than jumps lands a step short, which is why it is delta - 1 and not some
 * arbitrary near miss.
 *
 * Distinctness. Taking "more" as the case (the "less" case is its mirror), the
 * four values are n + delta, n + other, n - delta and n + delta - 1, so the
 * four offsets are delta, other, -delta and delta - 1. delta is 10 or 100 and
 * other is the one it is not, so delta != other; delta != -delta and
 * other != -delta because both are positive; delta != delta - 1; and
 * delta - 1 (9 or 99) is neither other (100 or 10) nor -delta. All four differ
 * for every draw, so the whole 601 x 4 = 2,404-question draw space is
 * collision-free, and the sibling test checks it exhaustively.
 */
export const nbt8TenOrHundred: QuestionTemplate = {
  id: 'g2.nbt8.ten-or-hundred',
  standardCode: 'NC.2.NBT.8',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    // A seven-year-old reads these, so "1 tens" is not acceptable output.
    const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
    const n = rng.int(200, 800);
    const delta = rng.pick([10, 100]);
    const isMore = rng.pick([true, false]);

    const other = delta === 10 ? 100 : 10;
    const sign = isMore ? 1 : -1;
    const word = isMore ? 'more than' : 'less than';
    const place = delta === 10 ? 'tens' : 'hundreds';

    const answer = n + sign * delta;
    const answerText = `${answer}`;

    // Step 3's leading sentence "Only the X change" must itself be
    // conditioned on whether a rollover/borrow actually happens at THIS
    // seed, not just have a hedge tacked onto a second sentence — a hedge
    // attached only to the second sentence leaves the first sentence
    // standing alone as an unqualified (and sometimes false) claim. At
    // seed 7 (n=207, tens digit 0, subtracting 10) the hundreds digit DOES
    // change (207 -> 197, 2 -> 1), so "Only the tens change" would be
    // literally false there. The hundreds place never rolls over in this
    // generator's bounded range (n in [200,800], delta in {10,100}), so
    // that branch is always the plain, unconditioned statement. (Task 20
    // fix round 2, I1's unmet half of X1.)
    const tensDigit = Math.floor(n / 10) % 10;
    const crossesHundred = place === 'tens' && (isMore ? tensDigit === 9 : tensDigit === 0);
    const step3 =
      place === 'hundreds'
        ? 'Only the hundreds change. The tens and the ones stay exactly where they are.'
        : crossesHundred
          ? isMore
            ? 'The tens digit is already 9, so it rolls over into a new hundred — the hundreds change too, and the ones stay exactly where they are.'
            : 'The tens digit is already 0, so it borrows a ten from the hundreds — the hundreds change too, and the ones stay exactly where they are.'
          : 'Only the tens change. The hundreds and the ones stay exactly where they are.';

    const candidates = [
      { text: answerText, isCorrect: true },
      // Moved the wrong place: used 100 where 10 was asked for, or the reverse.
      { text: `${n + sign * other}`, isCorrect: false, misconception: 'wrong-power-of-ten' },
      // Right amount, wrong direction.
      {
        text: `${n - sign * delta}`,
        isCorrect: false,
        misconception: isMore ? 'subtracted-instead-of-added' : 'added-instead-of-subtracted',
      },
      // Counted by ones instead of jumping the whole amount, and stopped a
      // count short.
      {
        text: `${n + sign * (delta - 1)}`,
        isCorrect: false,
        misconception: 'counted-by-ones-and-lost-the-count',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.nbt8.ten-or-hundred: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Do this in your head. No counting on.',
      promptDetails: `What is ${delta} ${word} ${n}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: ${delta} ${word} means one ${delta === 10 ? 'ten' : 'hundred'} ${isMore ? 'added to' : 'taken from'} the number, so look at the ${place} place.`,
          `Step 2: ${n} is ${plural(Math.floor(n / 100), 'hundred')}, ${plural(Math.floor(n / 10) % 10, 'ten')}, and ${plural(n % 10, 'one')}.`,
          `Step 3: ${step3}`,
          `Step 4: ${delta} ${word} ${n} is ${answerText}.`,
        ],
        conceptSummary:
          'Adding or taking away 10 touches the tens place; adding or taking away 100 touches the hundreds place. Knowing which digit moves turns this into one thought instead of a long count.',
        commonMisconception: `Using ${other} where ${delta} was asked for gives ${n + sign * other}, which is ${Math.abs(other - delta)} out. And counting by ones from ${n} is exactly what this standard asks a child NOT to do: it is slow and it loses the count, landing on ${n + sign * (delta - 1)}.`,
      },
    };
  },
};
