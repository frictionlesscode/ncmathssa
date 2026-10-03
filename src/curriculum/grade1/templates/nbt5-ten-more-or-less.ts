import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { unitCount } from './placeValue';

/**
 * NC.1.NBT.5 — "Given a two-digit number, mentally find 10 more or 10 less
 * than the number, without having to count; explain the reasoning used."
 *
 * Ruling 23-8: draws a two-digit number from 10 to 99. "10 more" or "10
 * less" is a coin flip, and 10 more or 10 less always changes only the TENS
 * digit — the standard's own point, "without having to count" — so the ones
 * digit of every distractor still matches the ones digit of the number.
 *
 * "10 more" is only drawn for 10 to 89, so the answer stays a two-digit number
 * (84 -> 94): trading 10 tens for a new hundred is Grade 2 place value, not
 * NC.1.NBT.5. 10 less of a number in the teens or twenties can reach single
 * digits (13 -> 3) but never goes below 0, since the smallest draw is 10 (10
 * less than 10 is 0).
 *
 * ---------------------------------------------------------------------------
 *   answer                                          n + 10  or  n - 10
 *   gave-10-less-instead-of-10-more (or the reverse)  n - 10  or  n + 10
 *   changed-the-ones-digit-instead-of-the-tens-digit  n's ones digit changed
 *                                                      by 1 instead of the
 *                                                      tens digit by 1
 *   restated-a-known-number-instead-of-solving        n itself
 */
export interface TenMoreOrLessDraw {
  n: number;
  direction: 'more' | 'less';
}

export const ALL_TEN_DRAWS: TenMoreOrLessDraw[] = [];
for (let n = 10; n <= 99; n++) {
  for (const direction of ['more', 'less'] as const) {
    ALL_TEN_DRAWS.push({ n, direction });
  }
}

function optionsFor(n: number, direction: 'more' | 'less'): string[] {
  const answer = direction === 'more' ? n + 10 : n - 10;
  const opposite = direction === 'more' ? n - 10 : n + 10;
  const onesShift = direction === 'more' ? n + 1 : n - 1;
  return [`${answer}`, `${opposite}`, `${onesShift}`, `${n}`];
}

export const TEN_DRAWS: TenMoreOrLessDraw[] = ALL_TEN_DRAWS.filter(
  (d) =>
    new Set(optionsFor(d.n, d.direction)).size === 4 &&
    optionsFor(d.n, d.direction).every((t) => Number(t) >= 0) &&
    // Stay two-digit: 10 more than 90 or more would be a hundred.
    (d.direction === 'less' || d.n + 10 <= 99),
);

export const nbt5TenMoreOrLess: QuestionTemplate = {
  id: 'g1.nbt5.ten-more-or-less',
  standardCode: 'NC.1.NBT.5',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,
  contentVersion: 2, // "10 more" no longer reaches 100 or more

  generate(rng: Rng): GeneratedQuestion {
    const { n, direction } = rng.pick(TEN_DRAWS);
    const [answerText, oppositeText, onesShiftText, sameText] = optionsFor(n, direction);

    const candidates = [
      { text: answerText, isCorrect: true },
      {
        text: oppositeText,
        isCorrect: false,
        misconception: 'gave-10-less-instead-of-10-more',
      },
      { text: onesShiftText, isCorrect: false, misconception: 'changed-the-ones-digit-instead-of-the-tens-digit' },
      { text: sameText, isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.nbt5.ten-more-or-less: option collision [${texts.join(' | ')}]`);
    }

    const tens = Math.floor(n / 10);
    const ones = n % 10;

    return {
      prompt: `What is 10 ${direction} than ${n}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: ${n} is ${unitCount(tens, 'ten')} and ${unitCount(ones, 'one')}.`,
          direction === 'more'
            ? `Step 2: 10 more is ${unitCount(tens + 1, 'ten')} and ${unitCount(ones, 'one')}.`
            : `Step 2: 10 less is ${unitCount(tens - 1, 'ten')} and ${unitCount(ones, 'one')}.`,
          `Step 3: The ones digit stays ${ones}, and only the tens digit changes.`,
          `Step 4: 10 ${direction} than ${n} is ${answerText}.`,
        ],
        conceptSummary:
          '10 more or 10 less than a two-digit number only changes the tens digit. The ones digit never changes, so there is no need to count.',
        commonMisconception: `Changing the ones digit instead of the tens digit gives ${onesShiftText}, which is only 1 more or less, not 10.`,
      },
    };
  },
};
