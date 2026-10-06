import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.OA.6 — "Solve an unknown-factor problem, by using division strategies
 * and/or changing it to a multiplication problem", whose keyConcepts also name
 * multiplication and division as inverse operations.
 *
 * The question shape is a BARE EQUATION WITH A BOX, `a × ☐ = p` — this
 * standard's shape and no other Grade 3 OA generator's (ruling 12-4). It is
 * deliberately not a word problem (that is OA.3) and not a fact recited in one
 * direction (that is OA.7): what an unknown-factor item tests is that a child
 * can turn `a × ☐ = p` into `p ÷ a` at all.
 *
 * Known factor a in 2..10 and missing factor b in 2..10, p = a * b (ruling
 * 12-5: factors 1-10; the largest product is 100). The four option values:
 *
 *   answer                          b
 *   skip-counted-one-group-short    b - 1   stopped one jump early
 *   skip-counted-one-group-too-many b + 1   counted the starting 0 as a jump
 *   subtracted-instead-of-divided   p - a   undid the multiplication by
 *                                           subtracting once
 *
 * The two skip-count distractors are the pair a child actually produces when
 * counting a, 2a, 3a, ... up to p and losing track of how many jumps that
 * took. There is no "p × a" option: at a = b = 10 that is 1,000, a number no
 * Grade 3 child would weigh for a second, so it would be a filler dressed as a
 * distractor.
 *
 * Distinctness, exhaustively, with p - a = a(b - 1):
 *   b vs b - 1, b vs b + 1, b - 1 vs b + 1   never equal.
 *   b = a(b - 1)        =>  b = a / (a - 1), whole only at a = 2, b = 2.
 *                           EXCLUDED.
 *   b - 1 = a(b - 1)    =>  a = 1, out of range (a >= 2).
 *   b + 1 = a(b - 1)    =>  (a - 1)(b - 1) = 2  =>  (a, b) = (2, 3) or (3, 2).
 *                           Both EXCLUDED.
 *
 * Three pairs are removed by construction and nothing is resampled, leaving
 * 9 * 9 - 3 = 78 pairs, swept in full by the sibling test.
 */
const EXCLUDED = new Set(['2,2', '2,3', '3,2']);

const PAIRS: { a: number; b: number }[] = [];
for (let a = 2; a <= 10; a++) {
  for (let b = 2; b <= 10; b++) {
    if (!EXCLUDED.has(`${a},${b}`)) PAIRS.push({ a, b });
  }
}

export const oa6MissingFactor: QuestionTemplate = {
  id: 'g3.oa6.missing-factor',
  standardCode: 'NC.3.OA.6',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { a, b } = rng.pick(PAIRS);
    const p = a * b;

    const answerText = `${b}`;
    const skipCounts = Array.from({ length: b }, (_unused, i) => a * (i + 1)).join(', ');

    const candidates = [
      { text: answerText, isCorrect: true },
      // b - 1: skip counted by a but stopped one jump short of p.
      {
        text: `${b - 1}`,
        isCorrect: false,
        misconception: 'skip-counted-one-group-short',
      },
      // b + 1: counted the 0 the skip count starts from as a jump of its own.
      {
        text: `${b + 1}`,
        isCorrect: false,
        misconception: 'skip-counted-one-group-too-many',
      },
      // p - a: undid the multiplication by subtracting the known factor once
      // instead of dividing by it.
      {
        text: `${p - a}`,
        isCorrect: false,
        misconception: 'subtracted-instead-of-divided',
      },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.oa6.missing-factor: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `What number goes in the box to make the equation ${a} × ☐ = ${p} true?`,
      promptDetails: `${a} × ☐ = ${p}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: The box holds the missing factor: ${a} times what number gives ${p}?`,
          `Step 2: A missing factor is found by dividing, so the box is ${p} ÷ ${a}.`,
          `Step 3: Skip count by ${a} and keep track of the jumps: ${skipCounts}. That is ${b} jumps to reach ${p}.`,
          `Step 4: ${a} × ${b} = ${p}, so the number that goes in the box is ${answerText}.`,
        ],
        conceptSummary:
          'Multiplication and division undo each other, so an unknown factor can be found either by dividing the product by the known factor or by asking which multiplication fact reaches the product.',
        commonMisconception: `Subtracting gives ${p - a}, which takes one group away once instead of finding how many groups of ${a} make ${p}.`,
      },
    };
  },
};
