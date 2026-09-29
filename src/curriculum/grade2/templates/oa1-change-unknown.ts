import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

interface Context {
  /** The subject of the story, e.g. "Mia had 14 stickers." */
  subject: string;
  /** Plural noun for the objects. */
  noun: string;
  /** Past-tense form for the story, e.g. "gave away", "lost". */
  verbPast: string;
  /** Base form for the question, e.g. "give away", "lose". */
  verbBase: string;
}

const CONTEXTS: Context[] = [
  { subject: 'Mia', noun: 'stickers', verbPast: 'gave away', verbBase: 'give away' },
  { subject: 'Owen', noun: 'marbles', verbPast: 'lost', verbBase: 'lose' },
  { subject: 'Ravi', noun: 'baseball cards', verbPast: 'traded away', verbBase: 'trade away' },
  { subject: 'Elena', noun: 'shells', verbPast: 'gave away', verbBase: 'give away' },
];

/**
 * NC.2.OA.1 — "Represent and solve addition and subtraction word problems,
 * within 100, with unknowns in all positions." The authored bank
 * (../authored.oa.ts) already covers one-step Start Unknown, one-step
 * Compare-Bigger Unknown, one-step Compare-Smaller Unknown, and both
 * two-step types by hand, per ruling 17-1. This generator covers the one
 * remaining common CGI type neither authored item uses: a ONE-STEP
 * TAKE-FROM, CHANGE UNKNOWN problem — "X had a, gave some away, now has b;
 * how many did X give away?" — so fresh numbers exercise a shape the
 * authored bank does not already drill.
 *
 * Start amount `start` is drawn from 10-80 and the change `change` from
 * 2-20, with `change < start` enforced so the end amount stays positive; the
 * end amount `end = start - change` is therefore always in [1, 78], and
 * every quantity stays within the standard's "within 100" bound. `change`'s
 * floor of 2 (not 1) keeps `change - 1` at 1 or above, so the "stopped one
 * count short" distractor is never zero or negative.
 *
 * Two of the four option values collide algebraically unless `change` is
 * kept well below `start`: `correct` (= change) equals `restated` (= end)
 * when start = 2*change, and `restated` equals `shortByOne` (= change - 1)
 * when start = 2*change - 1. Both are excluded at the draw by requiring
 * `start >= 2*change + 5`, i.e. change <= floor((start - 5) / 2); the
 * remaining pair, `added` (= 2*start - change) vs `shortByOne`, never
 * collides at all: 2*start - change is always even-or-odd opposite to
 * change - 1 (2*start - change and change - 1 differ in parity because
 * 2*start is even and -1 flips it), so no exclusion is needed there.
 */
const STARTS = Array.from({ length: 71 }, (_, i) => i + 10); // 10..80

export const oa1ChangeUnknown: QuestionTemplate = {
  id: 'g2.oa1.change-unknown',
  standardCode: 'NC.2.OA.1',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const ctx = rng.pick(CONTEXTS);
    const start = rng.pick(STARTS);
    const change = rng.int(2, Math.min(20, Math.floor((start - 5) / 2)));
    const end = start - change;

    const answerText = `${change} ${ctx.noun}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // start + end: added the two known numbers instead of subtracting.
      {
        text: `${start + end} ${ctx.noun}`,
        isCorrect: false,
        misconception: 'added-instead-of-subtracted',
      },
      // Restated the end amount instead of solving for the change.
      {
        text: `${end} ${ctx.noun}`,
        isCorrect: false,
        misconception: 'restated-a-known-number-instead-of-solving',
      },
      // Counted back by ones but stopped one count short.
      {
        text: `${change - 1} ${ctx.noun}`,
        isCorrect: false,
        misconception: 'counted-on-by-ones-and-stopped-one-short',
      },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.oa1.change-unknown: option collision [${texts.join(' | ')}]`);
    }

    // Fix 1 (whole-branch review, Important): the original five-sentence
    // prompt (start, change, result, equation, question as separate
    // sentences) failed assertGradeTwoReadable at some seeds — up to 175
    // characters and 6 sentences for the authored sibling this mirrors,
    // g2-oa1-04. Folding the result and the equation into the question
    // keeps the first two sentences the `templates/index.test.ts` sentinel
    // pins ("X had N noun. X verbPast some of them.") untouched and brings
    // every seed to 3 sentences.
    return {
      prompt: `${ctx.subject} had ${start} ${ctx.noun}. ${ctx.subject} ${ctx.verbPast} some of them. In ${start} − ☐ = ${end}, how many ${ctx.noun} did ${ctx.subject} ${ctx.verbBase}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: The ☐ stands for how many ${ctx.noun} ${ctx.subject} ${ctx.verbPast}.`,
          `Step 2: ${ctx.subject} started with ${start} ${ctx.noun} and ended with ${end} ${ctx.noun}.`,
          `Step 3: Find the difference: ${start} − ${end} = ${change}.`,
          `Step 4: ${ctx.subject} ${ctx.verbPast} ${answerText}.`,
        ],
        conceptSummary:
          'When the change in a story is missing, subtracting the end amount from the start amount finds it — the start amount always equals the end amount plus whatever changed.',
        commonMisconception: `Adding ${start} and ${end} gives ${start + end}, which is bigger than ${ctx.subject} ever had.`,
      },
    };
  },
};
