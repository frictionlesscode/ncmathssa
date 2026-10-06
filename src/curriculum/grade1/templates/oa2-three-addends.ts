import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.1.OA.2 — "Represent and solve word problems that call for addition of
 * three whole numbers whose sum is less than or equal to 20".
 *
 * SUM <= 20 IS A HARD BOUND (ruling 22-3), asserted by the sibling test over
 * its 300-run sweep and over the whole draw table. Every addend is 2 to 9:
 * one-digit, so the item stays a first-grade one, and at least 2, which is
 * what keeps the options apart (below).
 *
 * The worked solution writes the problem as an equation with a symbol for the
 * unknown (the standard's third keyConcept), then groups two addends that make
 * 10 when the draw has such a pair, and adds left to right when it does not.
 * The branch is computed from the numbers drawn, so it is never offered where
 * it is false.
 *
 * ---------------------------------------------------------------------------
 *   answer                               s = a + b + c
 *   left-one-of-the-addends-out          a + b          (the green c never added)
 *   added-one-number-twice               s + a          (the red a added again)
 *   counted-the-start-number-as-a-hop    s − 1          (counting on the last
 *                                                       number and saying the
 *                                                       one it started from)
 *   or counted-on-by-ones-one-too-many   s + 1          (coin flip)
 *
 * Distinctness, with every addend at least 2:
 *
 *   a + b = s − 1  =>  c = 1.   Never.     s + a = s + 1  =>  a = 1.   Never.
 *   a + b = s + a  =>  c = −a.  Never.     s ± 1 and s never meet the others'
 *                                          fixed offsets (−c <= −2, +a >= 2).
 *
 * Nothing is excluded and nothing is resampled.
 *
 * NO SIZE TELL. The left-out total is always lowest and the doubled one always
 * highest, but the counting slip lands below the key half the time and above
 * it the other half, so the key is the second or the third option by size.
 */
export const ADDEND_TRIPLES: [number, number, number][] = [];
for (let a = 2; a <= 9; a++) {
  for (let b = 2; b <= 9; b++) {
    for (let c = 2; c <= 9; c++) {
      if (a + b + c <= 20) ADDEND_TRIPLES.push([a, b, c]);
    }
  }
}

const NAMES = ['Ana', 'Ben', 'Kim', 'Leo', 'Max', 'Mia', 'Sam', 'Zoe'];
const NOUNS = ['beads', 'cars', 'blocks', 'balls', 'kites', 'cups'];

/** Two of the three that make 10, looked for in the order (a,b), (a,c),
 *  (b,c), with the third returned last. */
function tenPair(a: number, b: number, c: number): [number, number, number] | null {
  if (a + b === 10) return [a, b, c];
  if (a + c === 10) return [a, c, b];
  if (b + c === 10) return [b, c, a];
  return null;
}

export const oa2ThreeAddends: QuestionTemplate = {
  id: 'g1.oa2.three-addends',
  standardCode: 'NC.1.OA.2',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const [a, b, c] = rng.pick(ADDEND_TRIPLES);
    const slip = rng.pick(['hop', 'over'] as const);
    const name = rng.pick(NAMES);
    const noun = rng.pick(NOUNS);
    const sum = a + b + c;

    const answerText = `${sum}`;
    const candidates = [
      { text: answerText, isCorrect: true },
      // a + b: the red and blue ones added, the green ones never joined.
      { text: `${a + b}`, isCorrect: false, misconception: 'left-one-of-the-addends-out' },
      // s + a: the red ones counted into the total a second time.
      { text: `${sum + a}`, isCorrect: false, misconception: 'added-one-number-twice' },
      slip === 'hop'
        ? // Counting on the last number and saying the one it started from
          // as the first count lands one short.
          { text: `${sum - 1}`, isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' }
        : { text: `${sum + 1}`, isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.oa2.three-addends: option collision [${texts.join(' | ')}]`);
    }

    const pair = tenPair(a, b, c);
    const middle = pair
      ? [`Step 2: ${pair[0]} + ${pair[1]} = 10, so add those two first.`, `Step 3: 10 + ${pair[2]} = ${sum}.`]
      : [`Step 2: Add the first two: ${a} + ${b} = ${a + b}.`, `Step 3: Add the last one: ${a + b} + ${c} = ${sum}.`];

    return {
      prompt: `${name} has ${a} red, ${b} blue, and ${c} green ${noun}. How many ${noun} does ${name} have in all?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Write it as ${a} + ${b} + ${c} = ☐.`,
          ...middle,
          `Step 4: ${name} has ${sum} ${noun} in all.`,
        ],
        conceptSummary:
          'Three numbers can be added in any order and grouped in any way, and the total stays the same. When two of them make 10, adding those first makes the last step easy.',
        commonMisconception: `Adding only the red and blue ${noun}, ${a} + ${b} = ${a + b}, leaves out the ${c} green ones.`,
      },
    };
  },
};
