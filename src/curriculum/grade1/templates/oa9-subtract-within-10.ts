import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.1.OA.9 — "Demonstrate fluency with addition and subtraction within 10."
 * The subtraction half; see `./oa9-add-within-10.ts` for why the two halves
 * are separate templates and why this is OA.9 and not OA.6 (ruling 22-1).
 *
 * ---------------------------------------------------------------------------
 * 10 >= a > b >= 1: 45 facts. Taking away 0 and taking a number from itself
 * are left to the authored bank (g1-oa9-03 is 7 − 7), because 0 as an answer
 * is its own idea and its own trap.
 *
 *   answer                                        d = a − b
 *   added-instead-of-subtracted                   a + b
 *   restated-a-known-number-instead-of-solving    b         (the number taken
 *                                                           away)
 *   counted-the-start-number-as-a-hop             d + 1     (counting back b
 *                                                           from a, saying a)
 *   or counted-on-by-ones-one-too-many            d − 1     (coin flip; 0 when
 *                                                           d = 1, a real count)
 *
 * Collisions, solved:
 *
 *   a + b vs d, d ± 1:      needs 2b = 0 or ±1.            Never.
 *   a + b vs b:             needs a = 0.                   Never.
 *   b vs d:                 a = 2b.      EXCLUDED always (5 facts).
 *   b vs d + 1 (hop):       a = 2b − 1.  EXCLUDED from the hop: 3−2, 5−3,
 *                                        7−4, 9−5 (4).
 *   b vs d − 1 (over):      a = 2b + 1.  EXCLUDED from the over-count: 3−1,
 *                                        5−2, 7−3, 9−4 (4).
 *
 * 36 facts remain for each coin side, removed when the lists are built and
 * never by resampling; the sibling test shows each removed fact collides.
 *
 * NO SIZE TELL. Adding always overshoots, but the number taken away sits above
 * the key or below it, and so does the counting slip, so the key is the
 * smallest, second or third option depending on the draw.
 */
export interface SubtractFact {
  a: number;
  b: number;
}

export const ALL_SUBTRACT_FACTS: SubtractFact[] = [];
for (let a = 2; a <= 10; a++) {
  for (let b = 1; b < a; b++) ALL_SUBTRACT_FACTS.push({ a, b });
}

export const SUBTRACT_DRAWS: Record<'hop' | 'over', SubtractFact[]> = {
  hop: ALL_SUBTRACT_FACTS.filter(({ a, b }) => a !== 2 * b && a !== 2 * b - 1),
  over: ALL_SUBTRACT_FACTS.filter(({ a, b }) => a !== 2 * b && a !== 2 * b + 1),
};

export const oa9SubtractWithin10: QuestionTemplate = {
  id: 'g1.oa9.subtract-within-10',
  standardCode: 'NC.1.OA.9',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const slip = rng.pick(['hop', 'over'] as const);
    const { a, b } = rng.pick(SUBTRACT_DRAWS[slip]);
    const diff = a - b;

    const answerText = `${diff}`;
    const candidates = [
      { text: answerText, isCorrect: true },
      // The two numbers added.
      { text: `${a + b}`, isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // The number taken away, given back as the answer.
      { text: `${b}`, isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      slip === 'hop'
        ? // Counting back b from a, saying a as the first count.
          { text: `${diff + 1}`, isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' }
        : { text: `${diff - 1}`, isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.oa9.subtract-within-10: option collision [${texts.join(' | ')}]`);
    }

    const counts = Array.from({ length: diff }, (_, i) => b + 1 + i);

    return {
      prompt: `What is ${a} − ${b}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Think addition: ${b} + ☐ = ${a}.`,
          `Step 2: Count on from ${b} to ${a}: ${counts.join(', ')}. That is ${diff} ${diff === 1 ? 'count' : 'counts'}.`,
          `Step 3: ${a} − ${b} = ${diff}.`,
        ],
        conceptSummary:
          'Every take-away fact within 10 has an adding fact that undoes it, so knowing 3 + 4 = 7 means knowing 7 − 4 = 3. Facts within 10 are worth knowing by heart.',
        commonMisconception:
          slip === 'hop'
            ? `Counting back from ${a} and saying ${a} as the first count lands on ${diff + 1}. The first number to say is ${a - 1}.`
            : `Counting back one time too many from ${a} lands on ${diff - 1}. Stop after ${b} ${b === 1 ? 'count' : 'counts'} back, at ${diff}.`,
      },
    };
  },
};
