import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.1.OA.6 — "Add and subtract, within 20, using strategies." The
 * subtraction half, drilled with the strategy its keyConcepts call
 * "decomposing a number leading to a ten": in a first-grader's words, GET TO
 * 10 FIRST. 14 − 6: break the 6 into 4 and 2, 14 − 4 = 10, 10 − 2 = 8. The
 * first step of every worked solution names it (ruling 22-4).
 *
 * Its own template, split from `./oa6-make-ten-add.ts`, for the seedless
 * review key reason given there.
 *
 * ---------------------------------------------------------------------------
 * a = 10 + ones with ones in 1..8, and b in ones+1..9, so the take-away
 * always crosses 10 and there is a ten to get to. rest = b − ones (1..8).
 * 36 facts.
 *
 *   answer                                          a − b = 10 − rest
 *   added-the-rest-after-getting-to-ten             10 + rest   (got to 10,
 *                                                   then ADDED the rest)
 *   used-the-whole-number-after-breaking-it-apart   10 − b      (got to 10,
 *                                                   then took all of b again)
 *   counted-the-start-number-as-a-hop               a − b + 1   (counting back
 *                                                   b from a, saying a first)
 *   or counted-on-by-ones-one-too-many              a − b − 1   (coin flip)
 *
 * Collisions, solved:
 *
 *   10 + rest vs 10 − rest, or 10 − rest ± 1  =>  rest = 0 or ±1/2.   Never.
 *   10 + rest vs 10 − b                      =>  rest = −b.         Never.
 *   10 − b    vs 10 − rest                   =>  ones = 0.          Never.
 *   10 − b    vs a − b + 1                   =>  b = rest − 1.      Never: b > rest.
 *   10 − b    vs a − b − 1                   =>  b = rest + 1, ones = 1.
 *                                                EXCLUDED from the over-count:
 *                                                11 − 2 ... 11 − 9 (8).
 *
 * Every option is at least 1: 10 − b >= 1 since b <= 9, and a − b − 1 >= 1
 * since rest <= 8.
 *
 * NO SIZE TELL. 10 − b always undershoots and 10 + rest always overshoots, but
 * the counting slip sits above the key half the time and below it the other
 * half, so the key is the second or the third option by size.
 */
export interface TeenFact {
  a: number;
  b: number;
}

export const ALL_TEEN_FACTS: TeenFact[] = [];
for (let ones = 1; ones <= 8; ones++) {
  for (let b = ones + 1; b <= 9; b++) ALL_TEEN_FACTS.push({ a: 10 + ones, b });
}

export const GET_TO_TEN_DRAWS: Record<'hop' | 'over', TeenFact[]> = {
  hop: ALL_TEEN_FACTS,
  over: ALL_TEEN_FACTS.filter((f) => f.a !== 11),
};

export const oa6GetToTenSubtract: QuestionTemplate = {
  id: 'g1.oa6.get-to-ten-subtract',
  standardCode: 'NC.1.OA.6',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const slip = rng.pick(['hop', 'over'] as const);
    const { a, b } = rng.pick(GET_TO_TEN_DRAWS[slip]);
    const ones = a - 10;
    const rest = b - ones;
    const diff = a - b;

    const answerText = `${diff}`;
    const candidates = [
      { text: answerText, isCorrect: true },
      // Got to 10, then added the rest instead of taking it away too.
      { text: `${10 + rest}`, isCorrect: false, misconception: 'added-the-rest-after-getting-to-ten' },
      // Got to 10, then took all of b away again instead of just the rest.
      { text: `${10 - b}`, isCorrect: false, misconception: 'used-the-whole-number-after-breaking-it-apart' },
      slip === 'hop'
        ? // Counting back b from a, saying a as the first count.
          { text: `${diff + 1}`, isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' }
        : { text: `${diff - 1}`, isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.oa6.get-to-ten-subtract: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `Get to 10 first. What is ${a} − ${b}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Get to 10 first. Break ${b} into ${ones} and ${rest}.`,
          `Step 2: ${a} − ${ones} = 10.`,
          `Step 3: 10 − ${rest} = ${diff}.`,
          `Step 4: ${a} − ${b} = ${diff}.`,
        ],
        conceptSummary:
          'Taking away in two jumps, first down to 10 and then the rest, turns a hard take-away into two easy ones.',
        commonMisconception: `Getting to 10 and then adding the ${rest} gives ${10 + rest}. The ${rest} is part of the ${b} being taken away, so it comes off too: 10 − ${rest} = ${diff}.`,
      },
    };
  },
};
