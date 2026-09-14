import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.OA.7 — "Demonstrate fluency with multiplication and division with
 * factors, quotients and divisors up to and including 10", whose first
 * keyConcept is "Know from memory all products with factors up to and
 * including 10".
 *
 * This is the one Grade 3 OA generator that is BARE FACT RECALL, and
 * deliberately the only one (ruling 12-4): OA.1 draws an array, OA.2 draws
 * equal groups, OA.3 tells a story, OA.6 shows an equation with a box. Fluency
 * is the single standard where a naked `a × b` is the right question, because
 * the thing being measured is recall with nothing else attached.
 *
 * It covers the standard's MULTIPLICATION half. Division fluency and the
 * unknown-in-an-equation keyConcept are authored (g3-oa7-01 .. g3-oa7-03),
 * because a review key is seedless: one template spanning multiplication and
 * division facts would let a child who cannot divide be reviewed with a
 * multiplication fact and retired as mastered.
 *
 * Factors a and b both in 2..10 (ruling 12-5). The four option values:
 *
 *   answer                          a * b
 *   added-instead-of-multiplied     a + b
 *   skip-counted-one-group-short    (a - 1) * b   one group of b left out
 *   skip-counted-one-group-too-many (a + 1) * b   one group of b too many
 *
 * The two skip-count distractors are the neighbouring products in the b times
 * table, which is exactly what a child who is reciting rather than recalling
 * lands on.
 *
 * Distinctness, exhaustively:
 *   ab = a + b          =>  (a-1)(b-1) = 1  =>  a = b = 2. EXCLUDED.
 *   ab = (a±1)b         =>  b = 0. Never (b >= 2).
 *   (a-1)b = (a+1)b     =>  2b = 0. Never.
 *   a + b = (a-1)b      =>  a = b(a - 2)  =>  b = a / (a - 2), whole only at
 *                           (a, b) = (3, 3) and (4, 2). Both EXCLUDED.
 *   a + b = (a+1)b      =>  a = ab  =>  b = 1. Out of range (b >= 2).
 *
 * Three pairs are removed by construction, leaving 9 * 9 - 3 = 78, swept in
 * full by the sibling test. Nothing is resampled.
 */
const EXCLUDED = new Set(['2,2', '3,3', '4,2']);

const PAIRS: { a: number; b: number }[] = [];
for (let a = 2; a <= 10; a++) {
  for (let b = 2; b <= 10; b++) {
    if (!EXCLUDED.has(`${a},${b}`)) PAIRS.push({ a, b });
  }
}

export const oa7MultiplicationFact: QuestionTemplate = {
  id: 'g3.oa7.multiplication-fact',
  standardCode: 'NC.3.OA.7',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { a, b } = rng.pick(PAIRS);

    const product = a * b;
    const answerText = `${product}`;
    const skipCounts = Array.from({ length: a }, (_unused, i) => b * (i + 1)).join(', ');

    const candidates = [
      { text: answerText, isCorrect: true },
      // a + b: the two factors were added instead of multiplied.
      { text: `${a + b}`, isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // (a - 1) * b: the product one step back in the b times table, reached
      // by stopping the skip count a group early.
      {
        text: `${(a - 1) * b}`,
        isCorrect: false,
        misconception: 'skip-counted-one-group-short',
      },
      // (a + 1) * b: the product one step on in the b times table, reached by
      // counting one group too many.
      {
        text: `${(a + 1) * b}`,
        isCorrect: false,
        misconception: 'skip-counted-one-group-too-many',
      },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.oa7.multiplication-fact: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `What is ${a} × ${b}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: ${a} × ${b} means ${a} equal groups with ${b} in each group.`,
          `Step 2: Skip count by ${b}, ${a} times: ${skipCounts}.`,
          `Step 3: The ${a}th number in that count is the product.`,
          `Step 4: ${a} × ${b} = ${answerText}.`,
        ],
        conceptSummary:
          'A multiplication fact is a count of equal groups. Knowing the facts to 10 × 10 from memory is what makes every other kind of multiplication and division problem quick enough to think about.',
        commonMisconception: `Landing on ${(a - 1) * b} or ${(a + 1) * b} means the skip count stopped one group early or ran one group past ${product}.`,
      },
    };
  },
};
