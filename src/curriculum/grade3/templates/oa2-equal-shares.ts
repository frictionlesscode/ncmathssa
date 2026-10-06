import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

interface Context {
  /** Plural noun for the objects being shared. */
  noun: string;
  /** The container the objects are shared into. */
  one: string;
  many: string;
}

const CONTEXTS: Context[] = [
  { noun: 'counters', one: 'bag', many: 'bags' },
  { noun: 'crayons', one: 'box', many: 'boxes' },
  { noun: 'apples', one: 'basket', many: 'baskets' },
  { noun: 'marbles', one: 'jar', many: 'jars' },
];

/**
 * NC.3.OA.2 — "Interpret whole-number quotients of whole numbers with a
 * one-digit divisor and a one-digit quotient", whose keyConcepts read the
 * divisor and quotient as "the number of equal groups and the number of
 * objects in each group".
 *
 * The question shape is an EQUAL-GROUPS FIGURE with the share unknown: the
 * total and the empty groups are drawn, and the child has to find how many go
 * in each. That is this standard's shape and no other Grade 3 OA generator's
 * (ruling 12-4).
 *
 * Divisor d in 2..9 and quotient q in 3..9 — one digit each, as the sourced
 * text says in so many words, and inside the 1-10 cap of ruling 12-5. The
 * total is n = d * q, at most 81.
 *
 * The four option values:
 *
 *   answer                              q
 *   subtracted-instead-of-divided       n - d  =  d * (q - 1)
 *   answered-with-the-number-of-groups  d      the divisor reported as the
 *                                              share (the wrong unknown)
 *   skip-counted-one-group-short        q - 1  stopped one skip early
 *
 * There is deliberately NO "division is commutative" option here. Reading
 * 12 / 3 as 3 / 12 gives 0.25, and a Grade 3 child has no decimals, so it is
 * not a value any student reaches and cannot honestly be printed (ruling
 * 12-3). The two replacements above are both whole numbers a child really
 * arrives at.
 *
 * Distinctness, exhaustively:
 *   q = q - 1                never.
 *   q = d                    EXCLUDED by d != q.
 *   q = d(q - 1)             d >= 2 gives d(q-1) >= 2q - 2 > q for q >= 3.
 *   d = q - 1                EXCLUDED by d != q - 1.
 *   d = d(q - 1)             =>  q = 2, outside q >= 3.
 *   q - 1 = d(q - 1)         =>  d = 1, outside d >= 2.
 *
 * So the only exclusions are d != q and d != q - 1, applied by construction.
 * Nothing is resampled. The draw space is 7 * 8 - 14 = 42 pairs, swept in full
 * by the sibling test.
 */
const PAIRS: { d: number; q: number }[] = [];
for (let q = 3; q <= 9; q++) {
  for (let d = 2; d <= 9; d++) {
    if (d === q || d === q - 1) continue;
    PAIRS.push({ d, q });
  }
}

export const oa2EqualShares: QuestionTemplate = {
  id: 'g3.oa2.equal-shares',
  standardCode: 'NC.3.OA.2',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const ctx = rng.pick(CONTEXTS);
    const { d, q } = rng.pick(PAIRS);
    const n = d * q;

    const answerText = `${q} ${ctx.noun}`;
    const figure =
      `${n} ${ctx.noun} in all\n\n` +
      Array.from({ length: d }, (_unused, i) => `[ ${ctx.one} ${i + 1} ]`).join('  ');

    const candidates = [
      { text: answerText, isCorrect: true },
      // n - d: took one groupful away once instead of dividing.
      {
        text: `${n - d} ${ctx.noun}`,
        isCorrect: false,
        misconception: 'subtracted-instead-of-divided',
      },
      // d: reported how many groups there are, which is the number the
      // question already gave, instead of how many go in each group.
      {
        text: `${d} ${ctx.noun}`,
        isCorrect: false,
        misconception: 'answered-with-the-number-of-groups',
      },
      // q - 1: skip counted by d up towards n but stopped one group short.
      {
        text: `${q - 1} ${ctx.noun}`,
        isCorrect: false,
        misconception: 'skip-counted-one-group-short',
      },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.oa2.equal-shares: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `${n} ${ctx.noun} are shared equally among ${d} ${ctx.many}. How many ${ctx.noun} go in each ${ctx.one}?`,
      promptDetails: figure,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: There are ${n} ${ctx.noun} and ${d} equal ${ctx.many}.`,
          `Step 2: Sharing equally means dividing, so the equation is ${n} ÷ ${d} = ?`,
          `Step 3: Skip count by ${d} until you reach ${n}: ${d} × ${q} = ${n}.`,
          `Step 4: ${n} ÷ ${d} = ${q}, so each ${ctx.one} gets ${answerText}.`,
        ],
        conceptSummary:
          'In a division, the divisor tells how many equal groups there are and the quotient tells how many objects are in each group. Finding the quotient is the same as finding the missing factor that multiplies with the divisor to give the total.',
        commonMisconception: `Answering ${d} reports how many ${ctx.many} there are, which the question already told you, instead of how many ${ctx.noun} go in each one.`,
      },
    };
  },
};
