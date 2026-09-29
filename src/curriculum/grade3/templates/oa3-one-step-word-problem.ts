import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

interface Context {
  actor: string;
  /** The equal groups. */
  one: string;
  many: string;
  /** Verb joining a group to what it contains. */
  verb: string;
  /** What is being counted. */
  item: string;
}

const CONTEXTS: Context[] = [
  { actor: 'Mr. Patel', one: 'shelf', many: 'shelves', verb: 'holds', item: 'books' },
  { actor: 'Rosa', one: 'basket', many: 'baskets', verb: 'holds', item: 'peaches' },
  { actor: 'Ms. Kim', one: 'table', many: 'tables', verb: 'seats', item: 'students' },
  { actor: 'Dev', one: 'tray', many: 'trays', verb: 'holds', item: 'muffins' },
];

/**
 * NC.3.OA.3 — "Represent, interpret, and solve ONE-STEP problems involving
 * multiplication and division", with factors up to and including 10.
 *
 * The question shape here is a one-step WORD PROBLEM in plain prose with no
 * figure and no equation printed — this standard's shape and no other Grade 3
 * OA generator's (ruling 12-4). What it tests that a bare fact cannot is the
 * choice of operation: the two headline distractors are the two wrong choices
 * the wording invites, adding the numbers and subtracting them.
 *
 * This generator covers the standard's MULTIPLICATION half only. Its division
 * half is authored (see ../authored.oa.ts, g3-oa3-01 and g3-oa3-03), because a
 * review key is seedless: one template spanning both would let a child who
 * cannot choose division be reviewed with a multiplication item, promoted for
 * answering it, and retired as mastered with the division never retested. One
 * template, one skill — the rule Grade 4 set in templates/nbt4-subtract.ts.
 *
 * Group size k in 2..10 and group count m in 2..10. The four option values:
 *
 *   answer                          k * m
 *   added-instead-of-multiplied     k + m
 *   subtracted-instead-of-multiplied |k - m|
 *   skip-counted-one-group-short    (m - 1) * k   one whole group left out
 *
 * Distinctness, exhaustively:
 *   km = k + m        =>  (k-1)(m-1) = 1  =>  k = m = 2, EXCLUDED by k != m.
 *   km = |k - m|      km >= 2 * max(k, m) > |k - m| for k, m >= 2. Never.
 *   km = (m-1)k       =>  k = 0. Never.
 *   k + m = |k - m|   =>  min(k, m) = 0. Never.
 *   k + m = (m-1)k    =>  2k = m(k - 1)  =>  m = 2k / (k - 1), whole only at
 *                     k = 2 (m = 4) and k = 3 (m = 3). (3, 3) is already out
 *                     by k != m; (k, m) = (2, 4) is EXCLUDED below.
 *   |k - m| = (m-1)k  if m > k:  m - k = mk - k  =>  m = mk  =>  k = 1, out of
 *                     range. If k > m:  k - m = mk - k  =>  2k = m(k + 1)  =>
 *                     m = 2k/(k+1) < 2, out of range. Never.
 *
 * So k != m and (k, m) != (2, 4), applied by construction; nothing is
 * resampled. The draw space is 9 * 9 - 9 - 1 = 71 pairs, swept in full by the
 * sibling test. The largest product is 10 * 9 = 90, inside the standard's cap
 * of factors up to 10.
 */
const PAIRS: { k: number; m: number }[] = [];
for (let k = 2; k <= 10; k++) {
  for (let m = 2; m <= 10; m++) {
    if (k === m) continue;
    if (k === 2 && m === 4) continue;
    PAIRS.push({ k, m });
  }
}

export const oa3OneStepWordProblem: QuestionTemplate = {
  id: 'g3.oa3.one-step-word-problem',
  standardCode: 'NC.3.OA.3',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const ctx = rng.pick(CONTEXTS);
    const { k, m } = rng.pick(PAIRS);

    const product = k * m;
    const summed = k + m;
    const differenced = Math.abs(k - m);
    const oneGroupShort = (m - 1) * k;

    const answerText = `${product} ${ctx.item}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // k + m: the two numbers in the story were added instead of multiplied.
      {
        text: `${summed} ${ctx.item}`,
        isCorrect: false,
        misconception: 'added-instead-of-multiplied',
      },
      // |k - m|: the two numbers were subtracted, answering "how many more"
      // rather than "how many in all".
      {
        text: `${differenced} ${ctx.item}`,
        isCorrect: false,
        misconception: 'subtracted-instead-of-multiplied',
      },
      // (m - 1) * k: skip counted by k but left one group out of the count.
      {
        text: `${oneGroupShort} ${ctx.item}`,
        isCorrect: false,
        misconception: 'skip-counted-one-group-short',
      },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.oa3.one-step-word-problem: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt:
        `${ctx.actor} has ${m} ${ctx.many}. Each ${ctx.one} ${ctx.verb} ${k} ${ctx.item}. ` +
        `How many ${ctx.item} are there in all?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: There are ${m} equal groups — the ${ctx.many} — with ${k} ${ctx.item} in each one.`,
          `Step 2: Equal groups are put together by multiplying. Write the equation with a symbol for the unknown: n = ${m} × ${k}.`,
          `Step 3: Skip count by ${k}, ${m} times, or use the fact ${m} × ${k} = ${product}.`,
          `Step 4: There are ${answerText} in all.`,
        ],
        conceptSummary:
          'A one-step problem about equal groups is solved by multiplying the number of groups by the size of each group. Deciding which operation the story calls for is the work; the fact itself comes after.',
        commonMisconception: `Adding gives ${summed}, which puts the number of ${ctx.many} together with the size of one ${ctx.one} instead of taking ${m} groups of ${k}.`,
      },
    };
  },
};
