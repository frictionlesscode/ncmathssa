import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.MD.7 — "Tell and write time from analog and digital clocks to the
 * nearest five minutes, using a.m. and p.m."
 *
 * RULING 19-1: this is MD.7. The brief filed time under MD.6, which is the
 * number line; a clock generator carrying NC.2.MD.6 would pass every other
 * test and record a child who cannot read a clock as weak on number lines.
 *
 * The clock face is described in words in `promptDetails` — no image — and
 * the part of the day is named in the prompt, so every option carries a.m. or
 * p.m. (ruling 19-3) and it is always the right one for that part of the day.
 * Every option carries the SAME label, so the label never marks the key;
 * choosing between a.m. and p.m. is its own question, asked in the authored
 * items (g2-md7-01..03), where a wrong label is a distractor of its own.
 *
 * LATE IN THE HOUR ONLY: the minute hand points at the 7 to the 11, so the
 * time is :35 to :55 and the hour hand sits NEARER THE NEXT NUMBER. That is
 * where reading the hour is genuinely hard, and it is what makes the
 * next-hour error a live option at every seed rather than at half of them.
 * The earlier part of the hour — :05 to :30 — is read in the authored items.
 *
 * ---------------------------------------------------------------------------
 * THE DRAW SPACE
 *
 *   part of day  morning (a.m., hour 6-10), afternoon (p.m., hour 1-4),
 *                evening (p.m., hour 5-8)
 *   hand         the number the minute hand points at, 7..11
 *   with hand != hour.
 *
 * Write H for the hour and k for the minute-hand number.
 *
 *   answer                                         H : 5k
 *   read-the-minute-hand-as-the-number-it-points-to   H : k     (k is 07-11)
 *   swapped-the-hour-and-minute-hands               k : 5H    (long hand as
 *                                                             the hour, short
 *                                                             hand's number
 *                                                             as the minutes)
 *   read-the-next-hour-from-the-hour-hand       (H+1) : 5k
 *
 * Pairwise distinctness, with k in 7..11 and H in 1..10:
 *
 *   H:5k  vs H:k       =>  5k = k, k = 0.                 Never.
 *   H:5k  vs k:5H      =>  k = H.                         EXCLUDED.
 *   H:5k  vs (H+1):5k  =>  H = H+1.                       Never.
 *   H:k   vs k:5H      =>  H = k and k = 5H.              Never together.
 *   H:k   vs (H+1):5k  =>  H = H+1.                       Never.
 *   k:5H  vs (H+1):5k  =>  k = H+1 and H = k.             Never together.
 *
 * So the one exclusion is a minute hand pointing at the hour's own number
 * (7:35, 8:40, 9:45, 10:50 in the morning; 7:35, 8:40 in the evening), where
 * swapping the hands reads back the right time. Those six readings are left
 * out of the list; nothing is resampled. 25 + 20 + 20 = 65 readings less 6
 * leaves 59.
 *
 * NO ORDER TELL. In clock order the minute-hand reading always comes before
 * the key and the next-hour reading after it, but the swapped reading comes
 * before when k < H and after when k > H, so the key is second or third.
 */
export interface ClockReading {
  part: 'morning' | 'afternoon' | 'evening';
  hour: number;
  /** The number the long minute hand points at. */
  hand: number;
}

const PARTS: { part: ClockReading['part']; from: number; to: number }[] = [
  { part: 'morning', from: 6, to: 10 },
  { part: 'afternoon', from: 1, to: 4 },
  { part: 'evening', from: 5, to: 8 },
];

export const CLOCK_READINGS: ClockReading[] = [];
for (const { part, from, to } of PARTS) {
  for (let hour = from; hour <= to; hour++) {
    for (let hand = 7; hand <= 11; hand++) {
      if (hand === hour) continue; // swapping the hands would read back the key
      CLOCK_READINGS.push({ part, hour, hand });
    }
  }
}

const NAMES = ['Ava', 'Ben', 'Jada', 'Luis', 'Mei', 'Sam'];

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export const md7ClockToFiveMinutes: QuestionTemplate = {
  id: 'g2.md7.clock-to-five-minutes',
  standardCode: 'NC.2.MD.7',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const name = rng.pick(NAMES);
    const { part, hour, hand } = rng.pick(CLOCK_READINGS);
    const suffix = part === 'morning' ? 'a.m.' : 'p.m.';
    const time = (h: number, m: number) => `${h}:${pad(m)} ${suffix}`;

    const minutes = 5 * hand;
    const answerText = time(hour, minutes);

    const candidates = [
      { text: answerText, isCorrect: true },
      // The minute hand at the 8 read as 8 minutes.
      {
        text: time(hour, hand),
        isCorrect: false,
        misconception: 'read-the-minute-hand-as-the-number-it-points-to',
      },
      // The long hand read as the hour, and the short hand's number as the
      // minutes.
      {
        text: time(hand, 5 * hour),
        isCorrect: false,
        misconception: 'swapped-the-hour-and-minute-hands',
      },
      // The hour hand is nearly at the next number, and that number was read.
      {
        text: time(hour + 1, minutes),
        isCorrect: false,
        misconception: 'read-the-next-hour-from-the-hour-hand',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.md7.clock-to-five-minutes: option collision [${texts.join(' | ')}]`);
    }

    const fives = Array.from({ length: hand }, (_, i) => 5 * (i + 1)).join(', ');

    return {
      prompt: `It is ${part}. ${name} looks at the clock. What time is it?`,
      promptDetails: `A clock with two hands. The short hour hand is between the ${hour} and the ${hour + 1}, closer to the ${hour + 1}. The long minute hand points straight at the ${hand}.`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: The short hand tells the hour. It has passed the ${hour} but has not reached the ${hour + 1}, so the hour is still ${hour}.`,
          `Step 2: The long hand tells the minutes. Count by fives up to the ${hand}: ${fives}.`,
          `Step 3: It is ${part}. Times from midnight to noon are a.m., and times from noon to midnight are p.m., so this time is ${suffix}`,
          // answerText already ends in the full stop of a.m. or p.m.
          `Step 4: The clock shows ${answerText}`,
        ],
        conceptSummary:
          'The short hand names the hour it has most recently passed, and the long hand counts minutes in fives around the clock. Late in the hour the short hand is close to the next number, but the hour does not change until the long hand reaches the 12.',
        commonMisconception: `The hour hand is close to the ${hour + 1}, but it has not got there yet. Reading ${time(hour + 1, minutes)} jumps ahead a whole hour.`,
      },
    };
  },
};
