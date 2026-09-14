import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.MD.1 — "Tell and write time to the nearest minute. Solve word problems
 * involving addition and subtraction of time intervals WITHIN THE SAME HOUR."
 *
 * RULING 14-4, and it is the whole shape of this generator. An interval that
 * crosses an hour boundary is NC.4.MD.8 — a different grade, with its own
 * shipped Grade 4 content and its own misconception tags
 * (used-the-minutes-past-the-hour-not-the-minutes-left, counted-past-sixty-
 * minutes). This generator must never emit one, and it must not get there by
 * drawing freely and resampling until the draw happens to fit: the plan's
 * Content Contract requires colliding parameters to be excluded BY
 * CONSTRUCTION with the algebra written down.
 *
 * ---------------------------------------------------------------------------
 * WITHIN THE SAME HOUR, BY CONSTRUCTION
 *
 * The generator draws ONE hour `h` and TWO minute values `s` (start) and `e`
 * (end) in 0..59, and prints `h:s` and `h:e`. Both printed times name the same
 * hour because the same `h` is substituted into both; there is no arithmetic
 * anywhere that can carry into the hour, because the answer is `e - s` and
 * `e <= 59` is enforced on the DRAW rather than on the result. The interval
 * therefore lies inside [h:00, h:59] for every seed, and the worked solution
 * never trades 60 minutes for an hour.
 *
 * The elapsed time is `d = e - s`, which is positive because the draw space
 * only holds pairs with `e - s >= 10`.
 *
 * ---------------------------------------------------------------------------
 * THE DRAW SPACE
 *
 *   s  a multiple of 5 in 5..40    — classes and practices start on a
 *                                     five-minute mark, and it is what makes
 *                                     the "read it to the nearest five" error
 *                                     below reachable at all
 *   e  in 16..59 with e mod 5 != 0 — the END time is NOT on a five-minute
 *                                     mark, which is precisely what "tell time
 *                                     to the nearest MINUTE" asks a child to
 *                                     read
 *   with e - s >= 10.
 *
 * Write r = e mod 5, so r is in 1..4.
 *
 *   answer                                    d     = e - s
 *   read-the-clock-time-as-the-interval       e             the ending clock
 *                                                           reading, reported
 *                                                           as the length
 *   added-instead-of-subtracted               s + e
 *   read-the-clock-to-the-nearest-            d - r         read h:47 as
 *     five-minutes                                          h:45 and counted
 *                                                           from there
 *
 * Pairwise distinctness, for every pair in the draw space (s >= 5, r >= 1):
 *
 *   d = e          =>  s = 0.                         Never: s >= 5.
 *   d = s + e      =>  -2s = 0.                       Never: s >= 5.
 *   d = d - r      =>  r = 0.                         Never: e is not a
 *                                                     multiple of 5.
 *   e = s + e      =>  s = 0.                         Never.
 *   e = d - r      =>  s + r = 0.                     Never: both positive.
 *   s + e = d - r  =>  2s + r = 0.                    Never: both positive.
 *
 * So nothing is excluded and nothing is resampled — every (s, e) pair meeting
 * the three conditions above is legal, and the sibling test sweeps all of them.
 * `d - r >= 1` also holds, because `d >= 10` and `r <= 4`, so no option is ever
 * zero or negative.
 */
export interface TimePair {
  /** Minutes past the hour at the start. Always a multiple of 5. */
  s: number;
  /** Minutes past the hour at the end. Never a multiple of 5. */
  e: number;
}

export const TIME_PAIRS: TimePair[] = [];
for (let s = 5; s <= 40; s += 5) {
  for (let e = 16; e <= 59; e++) {
    if (e % 5 === 0) continue;
    if (e - s < 10) continue;
    TIME_PAIRS.push({ s, e });
  }
}

/** Activities an eight-year-old's day is actually made of, each one a phrase
 *  that can start a sentence and be referred back to as "it". */
const ACTIVITIES = [
  'Art class',
  'Recess',
  'Band practice',
  'Story time',
  'Swim practice',
  'Choir practice',
  'Gym class',
  'Silent reading',
];

function clock(h: number, m: number): string {
  return `${h}:${m < 10 ? `0${m}` : m}`;
}

function minutes(n: number): string {
  return `${n} minute${n === 1 ? '' : 's'}`;
}

export const md1ElapsedTimeWithinTheHour: QuestionTemplate = {
  id: 'g3.md1.elapsed-time-within-the-hour',
  standardCode: 'NC.3.MD.1',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const activity = rng.pick(ACTIVITIES);
    const h = rng.int(1, 12);
    const { s, e } = rng.pick(TIME_PAIRS);

    const d = e - s;
    const r = e % 5;
    const nearestFive = e - r;
    const answerText = minutes(d);

    const candidates = [
      { text: answerText, isCorrect: true },
      // e: read the ENDING clock time as the length of the interval - "it
      // ended at 47 past, so it was 47 minutes long."
      {
        text: minutes(e),
        isCorrect: false,
        misconception: 'read-the-clock-time-as-the-interval',
      },
      // s + e: added the two clock readings instead of finding the difference.
      { text: minutes(s + e), isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // d - r: read the end time only to the nearest five-minute mark, which
      // is exactly what "to the nearest minute" asks a child not to do.
      {
        text: minutes(d - r),
        isCorrect: false,
        misconception: 'read-the-clock-to-the-nearest-five-minutes',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(
        `g3.md1.elapsed-time-within-the-hour: option collision [${texts.join(' | ')}]`,
      );
    }

    return {
      prompt: `${activity} started at ${clock(h, s)} and ended at ${clock(h, e)}. How many minutes long was it?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Both times are in the same hour, so only the minutes change: ${s} minutes past ${h} o'clock to ${e} minutes past ${h} o'clock.`,
          `Step 2: Count on from ${clock(h, s)} to ${clock(h, nearestFive)}. That is ${minutes(nearestFive - s)}.`,
          `Step 3: The clock does not stop there. Count the last ${minutes(r)} on to ${clock(h, e)}.`,
          `Step 4: ${nearestFive - s} + ${r} = ${d}, so it lasted ${answerText}.`,
        ],
        conceptSummary:
          'Elapsed time is the distance between two times, not either time itself. When both times are in the same hour, count on from the earlier one to the later one - first to the nearest five-minute mark, then the last few minutes one at a time.',
        commonMisconception: `Answering ${minutes(e)} reports the clock READING at the end. ${clock(h, e)} says what time it was, not how long it took.`,
      },
    };
  },
};
