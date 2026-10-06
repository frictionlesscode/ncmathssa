import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.1.NBT.1 — "Count to 150, starting at any number less than 150."
 *
 * RULING 23-1 / 23-3: this is COUNTING, not writing a numeral (that is
 * NC.1.NBT.7, `./nbt7-write-the-numeral.ts`), and NC's ceiling is 150, not
 * the Common Core's 120. Every draw crosses "across a decade boundary" (the
 * standard's own third keyConcept), and the sibling test sweeps every seed
 * to show a count never prints a number past 150 and that 150 itself is
 * reachable.
 *
 * A draw is a ten the count crosses (20, 30, ..., 150), which of the three
 * counted numbers the ten falls on (1st, 2nd or 3rd), a TEN slip (going back
 * to the start of the ten just crossed, or skipping a whole ten), and a
 * COUNT slip (listing the starting number as the first count, or skipping a
 * number). Both slips keep counting on from the wrong number after the slip,
 * the way a child who makes that slip actually would.
 *
 * ---------------------------------------------------------------------------
 *   answer                                              start+1, start+2, start+3
 *   restarted-the-count-at-the-start-of-the-ten         ...counted on from ten-10
 *   or skipped-a-ten-while-counting                     ...counted on from ten+10
 *   listed-the-starting-number-as-the-first-count       start, start+1, start+2
 *   or skipped-a-number-while-counting                  ...counted on from ten+1
 *   said-the-same-number-twice-while-counting
 *     the second number of the count said again: 20, 21, 21 for a count of
 *     20, 21, 22. It never equals a list that counts on, because those all
 *     increase, so it cannot collide with another option.
 *
 * NO SIZE TELL. A draw whose printed numbers would exceed 150 is left out of
 * the pool entirely (never resampled), which the sibling test proves reaches
 * exactly the 153 of 168 possible draws that stay in range.
 */
export interface CountDraw {
  /** The multiple of 10 this count crosses: 20, 30, ..., 150. */
  ten: number;
  /** Which of the three counted numbers (1st, 2nd or 3rd) is the ten. */
  at: 1 | 2 | 3;
  tenSlip: 'back' | 'skip';
  countSlip: 'early' | 'omit';
}

const TENS: number[] = [];
for (let t = 20; t <= 150; t += 10) TENS.push(t);

export const ALL_COUNT_DRAWS: CountDraw[] = [];
for (const ten of TENS) {
  for (const at of [1, 2, 3] as const) {
    for (const tenSlip of ['back', 'skip'] as const) {
      for (const countSlip of ['early', 'omit'] as const) {
        ALL_COUNT_DRAWS.push({ ten, at, tenSlip, countSlip });
      }
    }
  }
}

function lists(d: CountDraw) {
  const start = d.ten - d.at;
  const at0 = d.at - 1;
  const key = [start + 1, start + 2, start + 3];
  const from = (first: number) => key.map((n, i) => (i < at0 ? n : first + (i - at0)));
  const tenList = d.tenSlip === 'back' ? from(d.ten - 10) : from(d.ten + 10);
  const countList = d.countSlip === 'early' ? [start, start + 1, start + 2] : from(d.ten + 1);
  const repeated = [key[0], key[1], key[1]];
  return { start, at0, key, tenList, countList, repeated };
}

export const COUNT_DRAWS: CountDraw[] = ALL_COUNT_DRAWS.filter((d) => {
  const { key, tenList, countList } = lists(d);
  return [...key, ...tenList, ...countList].every((n) => n <= 150);
});

export const nbt1CountPastATen: QuestionTemplate = {
  id: 'g1.nbt1.count-past-a-ten',
  standardCode: 'NC.1.NBT.1',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,
  contentVersion: 2, // the side-by-side distractor was replaced

  generate(rng: Rng): GeneratedQuestion {
    const d = rng.pick(COUNT_DRAWS);
    const { start, key, tenList, countList, repeated } = lists(d);

    const answerText = key.join(', ');
    const candidates = [
      { text: answerText, isCorrect: true },
      d.tenSlip === 'back'
        ? { text: tenList.join(', '), isCorrect: false, misconception: 'restarted-the-count-at-the-start-of-the-ten' }
        : { text: tenList.join(', '), isCorrect: false, misconception: 'skipped-a-ten-while-counting' },
      d.countSlip === 'early'
        ? { text: countList.join(', '), isCorrect: false, misconception: 'listed-the-starting-number-as-the-first-count' }
        : { text: countList.join(', '), isCorrect: false, misconception: 'skipped-a-number-while-counting' },
      { text: repeated.join(', '), isCorrect: false, misconception: 'said-the-same-number-twice-while-counting' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.nbt1.count-past-a-ten: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `Count on from ${start}. What are the next three numbers?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Count on by ones from ${start}: ${key.join(', ')}.`,
          `Step 2: ${d.ten - 1} is followed by ${d.ten}.`,
          `Step 3: The next three numbers are ${key.join(', ')}.`,
        ],
        conceptSummary:
          'Counting on keeps going by ones across a ten without going back or skipping one, even when the numbers get to three digits.',
        commonMisconception:
          d.tenSlip === 'back'
            ? `It feels like going back to ${d.ten - 10} instead of moving on, but ${d.ten - 10} already happened.`
            : `It is easy to think jumping to ${d.ten + 10} keeps the count going, but ${d.ten} comes right after ${d.ten - 1}, and jumping to ${d.ten + 10} skips a whole ten.`,
      },
    };
  },
};
