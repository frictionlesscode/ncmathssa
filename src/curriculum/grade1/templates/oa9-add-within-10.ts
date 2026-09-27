import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.1.OA.9 — "Demonstrate fluency with addition and subtraction within 10."
 * FLUENCY WITHIN 10 IS NC.1.OA.9, not NC.1.OA.6: NC renumbered the Common
 * Core standard here, and the Task 22 brief carried the Common Core number
 * (ruling 22-1). This is the addition half; the subtraction facts are
 * `./oa9-subtract-within-10.ts`, a separate template because a seedless
 * review key would otherwise let a child's failed take-away be retired by a
 * passed sum. The keyConcepts list them as two bullets for the same reason.
 *
 * ---------------------------------------------------------------------------
 * a, b >= 1 with a + b <= 10: 45 ordered facts. Adding 0 is left out; its
 * restated distractor would BE the answer.
 *
 *   answer                                        a + b
 *   subtracted-instead-of-added                   |a − b|
 *   restated-a-known-number-instead-of-solving    max(a, b)   (started at the
 *                                                 bigger number and stopped)
 *   counted-the-start-number-as-a-hop             a + b − 1   (counting on
 *                                                 from the bigger, saying it)
 *   or counted-on-by-ones-one-too-many            a + b + 1   (coin flip)
 *
 * Collisions, solved:
 *
 *   max vs a + b − 1 (hop):   min(a, b) = 1.   EXCLUDED from the hop: every
 *                                             fact with a 1 in it (17).
 *   max vs a + b, a + b + 1:  min = 0 or −1.   Never.
 *   |a − b| vs max:           min = 0.         Never.
 *   |a − b| vs a + b, ± 1:    2.min = 0, ±1.   Never.
 *
 * So the hop draws from 28 facts and the over-count from all 45. The facts
 * with a 1 are removed from the hop list when it is built, never by
 * resampling, and the sibling test shows each one really collides.
 *
 * THE KEY IS OFTEN THE BIGGEST OPTION, by the mathematics: a sum is at least
 * as big as either part, so the restated part, the difference and the hop all
 * sit below it. The over-count, drawn half the time, lands above it and keeps
 * "pick the biggest" right only half the time.
 */
export interface AddFact {
  a: number;
  b: number;
}

export const ALL_ADD_FACTS: AddFact[] = [];
for (let a = 1; a <= 9; a++) {
  for (let b = 1; a + b <= 10; b++) ALL_ADD_FACTS.push({ a, b });
}

export const ADD_DRAWS: Record<'hop' | 'over', AddFact[]> = {
  hop: ALL_ADD_FACTS.filter(({ a, b }) => Math.min(a, b) >= 2),
  over: ALL_ADD_FACTS,
};

export const oa9AddWithin10: QuestionTemplate = {
  id: 'g1.oa9.add-within-10',
  standardCode: 'NC.1.OA.9',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const slip = rng.pick(['hop', 'over'] as const);
    const { a, b } = rng.pick(ADD_DRAWS[slip]);
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    const sum = a + b;

    const answerText = `${sum}`;
    const candidates = [
      { text: answerText, isCorrect: true },
      // The bigger number minus the smaller.
      { text: `${big - small}`, isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // Started at the bigger number and never counted on.
      { text: `${big}`, isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      slip === 'hop'
        ? // Counting on from the bigger number, saying it as the first count.
          { text: `${sum - 1}`, isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' }
        : { text: `${sum + 1}`, isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.oa9.add-within-10: option collision [${texts.join(' | ')}]`);
    }

    const counts = Array.from({ length: small }, (_, i) => big + 1 + i);

    return {
      prompt: `What is ${a} + ${b}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          // A double (2 + 2 ... 5 + 5) has no bigger number to start from.
          a === b ? `Step 1: Both numbers are ${a}. Start at ${a}.` : `Step 1: Start at the bigger number, ${big}.`,
          `Step 2: Count on ${small} more: ${counts.join(', ')}.`,
          `Step 3: ${a} + ${b} = ${sum}.`,
        ],
        conceptSummary:
          a === b
            ? 'Facts within 10 are worth knowing by heart, so the answer comes without counting. Until then, start at one of the numbers and count on the other: the first number to say is one more than where you start.'
            : 'Facts within 10 are worth knowing by heart, so the answer comes without counting. Until then, start at the bigger number and count on: the first number to say is one more than where you start.',
        commonMisconception: `Saying ${big} as the first count lands on ${sum - 1}, one short. The first number to say is ${big + 1}.`,
      },
    };
  },
};
