import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.NF.2 — "Interpret fractions with denominators of 2, 3, 4, 6, and 8 using
 * area and length models", whose second keyConcept is: "Using a NUMBER LINE,
 * explain that the numerator of a fraction represents the number of lengths of
 * the unit fraction FROM 0."
 *
 * That sentence is the whole design of this generator. The line from 0 to 1 is
 * divided into d equal spaces, a point sits n spaces along, and the child has
 * to count SPACES from 0 — not tick marks, and not from the first mark after 0.
 * Those are the two errors the standard produces and they are two of the three
 * distractors here.
 *
 * The area-model half of NC.3.NF.2 is authored (`../authored.nf.ts`,
 * g3-nf2-01), so the two halves of the standard cannot be confused for each
 * other by a seedless review key.
 *
 * ---------------------------------------------------------------------------
 * Construction. d is the number of equal spaces between 0 and 1; n is how many
 * of them the point sits past 0, so the point names n/d.
 *
 *   d in {3, 4, 6, 8}
 *   n in {2, 3, 4, 6} with n <= d - 1
 *
 * The lower bound n >= 2 is needed twice over: it keeps (n-1)/d a real fraction
 * rather than 0/d, and it keeps d/n out of the denominator 1. Restricting n to
 * {2, 3, 4, 6} is what keeps the flipped distractor d/n inside the Grade 3
 * denominators (ruling 13-2) — an option printed as 8/5 or 6/7 would teach
 * fifths and sevenths, which are NC.4.NF content, in a distractor.
 *
 * HALVES ARE NOT DRAWN HERE, and that is the one deliberate gap: d = 2 leaves
 * no n with 2 <= n <= 1. A number line in halves has exactly one interior tick
 * and nothing to miscount, so it is carried by an authored item (g3-nf2-02 uses
 * fourths; g3-nf1-03 reasons about halves and eighths) rather than by forcing
 * this generator into a degenerate case.
 *
 * The four option values:
 *
 *   answer                            n/d
 *   counted-tick-marks-not-intervals  (n+1)/d  counted the MARKS from 0 to the
 *                                              point, including the one at 0
 *   started-the-count-at-the-first-   (n-1)/d  began counting at the first tick
 *     tick-not-at-zero                         after 0 instead of at 0
 *   wrote-the-fraction-upside-down    d/n      the two numbers swapped
 *
 * Distinctness, exhaustively. The first three share the denominator d and have
 * numerators n-1, n, n+1, which are three different numbers. So only d/n can
 * collide, and since 1 <= n <= d-1:
 *
 *   d/n = n/d        =>  d² = n².        Never, n < d.
 *   d/n = (n+1)/d    =>  d² = n(n+1) <= (d-1)d < d².   Never.
 *   d/n = (n-1)/d    =>  d² = n(n-1) < d².             Never.
 *
 * Nothing is excluded and nothing is resampled. The draw space is the full 10
 * (d, n) pairs, swept by the sibling test, which also checks that every
 * denominator printed on every option is one of {2, 3, 4, 6, 8}.
 */
interface Point {
  d: number;
  n: number;
}

const DENOMINATORS = [3, 4, 6, 8];
/** n must itself be a legal Grade 3 denominator, because it becomes one in the
 *  upside-down distractor d/n. */
const NUMERATORS = [2, 3, 4, 6];

export const POINTS: Point[] = [];
for (const d of DENOMINATORS) {
  for (const n of NUMERATORS) {
    if (n <= d - 1) POINTS.push({ d, n });
  }
}

/** The number line as three stacked lines: the 0 and 1 labels, the ticks, and
 *  the marker under the tick the point sits on. Each space is four characters
 *  wide, so tick i sits at column 5i and nothing can drift. */
function numberLine(d: number, n: number): string {
  const ticks = `|${'----|'.repeat(d)}`;
  const labels = `0${' '.repeat(5 * d - 1)}1`;
  const marker = `${' '.repeat(5 * n)}P`;
  return `${labels}\n${ticks}\n${marker}`;
}

export const nf2FractionOnANumberLine: QuestionTemplate = {
  id: 'g3.nf2.fraction-on-a-number-line',
  standardCode: 'NC.3.NF.2',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { d, n } = rng.pick(POINTS);

    const answerText = `${n}/${d}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // (n+1)/d: counted the tick marks from 0 up to P. There is always one
      // more mark than there are spaces, because 0 gets a mark of its own.
      {
        text: `${n + 1}/${d}`,
        isCorrect: false,
        misconception: 'counted-tick-marks-not-intervals',
      },
      // (n-1)/d: started counting at the first tick after 0 rather than at 0.
      {
        text: `${n - 1}/${d}`,
        isCorrect: false,
        misconception: 'started-the-count-at-the-first-tick-not-at-zero',
      },
      // d/n: the number of parts in the whole written on top, the count below.
      { text: `${d}/${n}`, isCorrect: false, misconception: 'wrote-the-fraction-upside-down' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.nf2.fraction-on-a-number-line: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Which fraction does point P name?',
      promptDetails: numberLine(d, n),
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: The distance from 0 to 1 is cut into ${d} equal spaces, so one space is 1/${d} long.`,
          `Step 2: Count the SPACES from 0 over to P, not the tick marks. There are ${n} of them.`,
          `Step 3: ${n} spaces of 1/${d} each is ${n} copies of 1/${d}.`,
          `Step 4: So point P names ${answerText}.`,
        ],
        conceptSummary:
          'On a number line a fraction is a distance from 0, measured in unit-fraction steps. The bottom number says how long one step is and the top number says how many steps were taken.',
        commonMisconception: `There is always one more tick mark than there are spaces, because 0 gets a mark of its own — so counting marks here gives ${n + 1}/${d} instead of ${answerText}.`,
      },
    };
  },
};
