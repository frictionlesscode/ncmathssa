import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { assertNoOptionCollision } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.1.MD.2 — "Measure lengths with non-standard units."
 *
 * RULING 24-9: the figure (the row of units laid end to end, with no gaps or
 * overlaps) lives in `promptDetails`, which the readability guard does not
 * length-check, keeping `prompt` itself to the bare question. Writing "no
 * gaps or overlaps" into the prompt itself would blow the 90-character cap —
 * dropping the exact words the standard is about to fit the budget is the
 * failure this ruling exists to prevent.
 *
 * One skill: read off a count of non-standard units already laid out
 * correctly. The authored bank (`../authored.md.ts`) covers the standard's
 * OTHER named error — what happens when gaps or overlaps are actually
 * present — because judging a description as correct or incorrect is not a
 * shape a fresh-numbers generator adds anything to.
 *
 * ---------------------------------------------------------------------------
 * DRAW SPACE: N (the target object's count) in 3-12, M (a second, unrelated
 * object's count, read out to build the "wrong object" distractor) in 3-12
 * with M != N, M != N-1, M != N+1 (so all four option texts stay distinct).
 */
export interface MeasureDraw {
  n: number;
  m: number;
}

const UNITS = ['paper clip', 'cube', 'eraser', 'button'];
const OBJECTS = ['ribbon', 'crayon', 'string', 'pencil', 'spoon'];

export const ALL_MEASURE_DRAWS: MeasureDraw[] = [];
for (let n = 3; n <= 12; n++) {
  for (let m = 3; m <= 12; m++) {
    ALL_MEASURE_DRAWS.push({ n, m });
  }
}

export const MEASURE_DRAWS: MeasureDraw[] = ALL_MEASURE_DRAWS.filter(
  ({ n, m }) => m !== n && m !== n - 1 && m !== n + 1,
);

export const md2MeasureWithUnits: QuestionTemplate = {
  id: 'g1.md2.measure-with-units',
  standardCode: 'NC.1.MD.2',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { n, m } = rng.pick(MEASURE_DRAWS);
    const unit = rng.pick(UNITS);
    const [object, object2] = rng.shuffle(OBJECTS).slice(0, 2);
    const unitPlural = `${unit}s`;
    const answerText = `${n}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      { text: `${n + 1}`, isCorrect: false, misconception: 'counted-a-unit-that-was-not-there' },
      { text: `${n - 1}`, isCorrect: false, misconception: 'left-out-the-last-unit-while-counting' },
      { text: `${m}`, isCorrect: false, misconception: 'read-the-count-for-the-wrong-object' },
    ];

    assertNoOptionCollision('g1.md2.measure-with-units', candidates.map((c) => c.text));

    return {
      prompt: `How many ${unitPlural} long is the ${object}?`,
      promptDetails: `${n} ${unitPlural} are laid end to end with no gaps or overlaps to measure the ${object}. Nearby, ${m} ${unitPlural} measure a different ${object2} the same way.`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: The ${object} is measured with ${unitPlural} laid end to end, with no gaps or overlaps.`,
          `Step 2: Count the ${unitPlural} laid along the ${object}: there are ${n}.`,
          `Step 3: The ${m} ${unitPlural} measure the ${object2}, not the ${object}.`,
          `Step 4: The ${object} is ${n} ${unitPlural} long.`,
        ],
        conceptSummary:
          'When units are laid end to end with no gaps or overlaps, the number of units it takes to reach the end is the length, in those units.',
        commonMisconception: `Reading the ${object2}'s count of ${m} answers the wrong question — it measures a different object.`,
      },
    };
  },
};
