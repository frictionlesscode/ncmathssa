import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { assertNoOptionCollision } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.1.MD.4 — "Organize, represent, and interpret data with up to three
 * categories."
 *
 * RULING 24-5: the standard's three keyConcept bullets — the total; how many
 * are in each category; how many more or less are in one category than
 * another — ARE the standard, so this one template branches on the seed to
 * ask all three, rather than drilling only one of them. `./index.test.ts`'s
 * sentinel proves each of the three question shapes is unique to this
 * template. Every draw uses exactly three categories (never more, per the
 * standard's own ceiling).
 *
 * ---------------------------------------------------------------------------
 * DRAW SPACE: three distinct counts 1-9, sorted ascending [c1 < c2 < c3],
 * assigned to three category names drawn at random from a themed pool.
 *
 *   type 'total'    answer = c1+c2+c3
 *                   left-one-of-the-addends-out   c2+c3, c1+c3 (leaves out
 *                                                  the smallest or middle
 *                                                  category)
 *                   forgot-the-final-step          the largest count alone
 *   type 'category' answer = the asked category's own count
 *                   used-the-wrong-given-quantity  either OTHER category's
 *                                                   count
 *                   summed-all-data-points         c1+c2+c3
 *   type 'compare'  answer = c3-c2 (the two LARGEST categories, always)
 *                   added-instead-of-subtracted    c3+c2
 *                   gave-an-amount-instead-of-the-difference   c2, and c3
 *
 * Draws where c3 = 2*c2 are excluded (never resampled) because they would
 * make the 'compare' type's answer (c3-c2) collide with c2 itself; the
 * sibling test proves the excluded draws really do collide. Every other value
 * above is provably distinct from the others in its own type because all
 * three counts are positive and distinct (see the sibling test's algebraic
 * check).
 */
export type DataTriple = readonly [number, number, number];

export const ALL_DATA_DRAWS: DataTriple[] = [];
for (let a = 1; a <= 9; a++) {
  for (let b = a + 1; b <= 9; b++) {
    for (let c = b + 1; c <= 9; c++) {
      ALL_DATA_DRAWS.push([a, b, c]);
    }
  }
}

export const DATA_DRAWS: DataTriple[] = ALL_DATA_DRAWS.filter(([, b, c]) => c !== 2 * b);

interface Topic {
  noun: string;
  categories: [string, string, string];
}

const TOPICS: Topic[] = [
  { noun: 'fruit', categories: ['apples', 'bananas', 'grapes'] },
  { noun: 'pet', categories: ['dogs', 'cats', 'fish'] },
  { noun: 'color', categories: ['red', 'blue', 'green'] },
  { noun: 'sport', categories: ['soccer', 'tennis', 'biking'] },
];

type DataType = 'total' | 'category' | 'compare';

export const md4ReadTheData: QuestionTemplate = {
  id: 'g1.md4.read-the-data',
  standardCode: 'NC.1.MD.4',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const type = rng.pick<DataType>(['total', 'category', 'compare']);
    const topic = rng.pick(TOPICS);
    const [c1, c2, c3] = rng.pick(DATA_DRAWS);
    const catNames = rng.shuffle(topic.categories);
    const counts = rng.shuffle([c1, c2, c3]);
    const pairs = catNames.map((name, i) => ({ name, count: counts[i] }));
    const sum = c1 + c2 + c3;
    const promptDetails = `A graph shows favorite ${topic.noun}: ${pairs
      .map((p) => `${p.count} picked ${p.name}`)
      .join(', ')}.`;

    if (type === 'total') {
      const smallest = [...pairs].sort((x, y) => x.count - y.count)[0];
      const middle = [...pairs].sort((x, y) => x.count - y.count)[1];
      const largest = [...pairs].sort((x, y) => x.count - y.count)[2];
      const answerText = `${sum}`;
      const candidates = [
        { text: answerText, isCorrect: true },
        { text: `${sum - smallest.count}`, isCorrect: false, misconception: 'left-one-of-the-addends-out' },
        { text: `${sum - middle.count}`, isCorrect: false, misconception: 'left-one-of-the-addends-out' },
        { text: `${largest.count}`, isCorrect: false, misconception: 'forgot-the-final-step' },
      ];
      assertNoOptionCollision('g1.md4.read-the-data (total)', candidates.map((c) => c.text));
      return {
        prompt: 'How many students answered in all?',
        promptDetails,
        options: labelOptions(rng.shuffle(candidates)),
        answerText,
        explanation: {
          stepByStep: [
            `Step 1: The graph shows ${pairs.map((p) => `${p.count} for ${p.name}`).join(', ')}.`,
            `Step 2: "In all" adds every category together: ${c1} + ${c2} + ${c3}.`,
            `Step 3: ${c1} + ${c2} + ${c3} = ${sum}.`,
            `Step 4: ${sum} students answered in all.`,
          ],
          conceptSummary:
            'The total is every category added together. Leaving one category out gives a smaller number than the real total.',
          commonMisconception: `Reporting just ${largest.count}, the largest category, stops after reading one row instead of adding all of them.`,
        },
      };
    }

    if (type === 'category') {
      const target = rng.pick(pairs);
      const others = pairs.filter((p) => p !== target);
      const answerText = `${target.count}`;
      const candidates = [
        { text: answerText, isCorrect: true },
        { text: `${others[0].count}`, isCorrect: false, misconception: 'used-the-wrong-given-quantity' },
        { text: `${others[1].count}`, isCorrect: false, misconception: 'used-the-wrong-given-quantity' },
        { text: `${sum}`, isCorrect: false, misconception: 'summed-all-data-points' },
      ];
      assertNoOptionCollision('g1.md4.read-the-data (category)', candidates.map((c) => c.text));
      return {
        prompt: `How many students picked ${target.name}?`,
        promptDetails,
        options: labelOptions(rng.shuffle(candidates)),
        answerText,
        explanation: {
          stepByStep: [
            `Step 1: Find ${target.name} on the graph.`,
            `Step 2: ${target.count} students picked ${target.name}.`,
            `Step 3: ${others[0].name} and ${others[1].name} are different categories, not this one.`,
            `Step 4: ${target.count} students picked ${target.name}.`,
          ],
          conceptSummary:
            'Each category on a graph has its own count. Answering a question about one category means reading that category\'s own row, not another one.',
          commonMisconception: `Reading ${others[0].name}'s count instead answers about the wrong category.`,
        },
      };
    }

    // type === 'compare': always the two LARGEST categories.
    const sorted = [...pairs].sort((x, y) => y.count - x.count);
    const big = sorted[0];
    const small = sorted[1];
    const diff = big.count - small.count;
    const answerText = `${diff}`;
    const candidates = [
      { text: answerText, isCorrect: true },
      { text: `${big.count + small.count}`, isCorrect: false, misconception: 'added-instead-of-subtracted' },
      { text: `${small.count}`, isCorrect: false, misconception: 'gave-an-amount-instead-of-the-difference' },
      { text: `${big.count}`, isCorrect: false, misconception: 'gave-an-amount-instead-of-the-difference' },
    ];
    assertNoOptionCollision('g1.md4.read-the-data (compare)', candidates.map((c) => c.text));
    return {
      prompt: `How many more students picked ${big.name} than ${small.name}?`,
      promptDetails,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: ${big.count} students picked ${big.name}. ${small.count} students picked ${small.name}.`,
          `Step 2: "How many more" asks for the difference: ${big.count} − ${small.count}.`,
          `Step 3: ${big.count} − ${small.count} = ${diff}.`,
          `Step 4: ${diff} more students picked ${big.name} than ${small.name}.`,
        ],
        conceptSummary:
          '"How many more" compares two categories by subtracting the smaller count from the larger one.',
        commonMisconception: `Adding ${big.count} + ${small.count} = ${big.count + small.count} puts the two counts together instead of comparing them.`,
      },
    };
  },
};
