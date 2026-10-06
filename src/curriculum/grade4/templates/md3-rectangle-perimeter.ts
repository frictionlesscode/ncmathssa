import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { RECTANGLES } from './md3-rectangle-area';

const NOUNS = [
  'notice board',
  'raised bed',
  'window frame',
  'banner',
  'picture mount',
  'skating rink',
];

/**
 * NC.4.MD.3 — the PERIMETER of a rectangle, applied in a real-world problem.
 *
 * ONE TEMPLATE, ONE SKILL (spec 6.5) — the second half of the split explained
 * in ./md3-rectangle-area.ts. Area and perimeter are the two skills this
 * standard names, their characteristic errors are mirror images of each other
 * (`used-perimeter-formula` there, `used-area-formula-for-perimeter` here),
 * and a seedless review key means one template covering both would let a child
 * be retired as mastered having only ever been retested on the half they could
 * already do.
 *
 * The rectangle pool is imported from the area template rather than restated.
 * The four option VALUES are the same four in both templates — area, whole
 * perimeter, half perimeter, and one dimension doubled — so a pool that is
 * collision-free for one is collision-free for the other, and two copies of
 * the exclusion rule could drift apart without anything going red.
 *
 * Bounds. Every printed number: the dimensions are at most 12 by 9, so the
 * largest value anywhere in the question is the area distractor at its
 * ceiling, 108.
 */
export const md3RectanglePerimeter: QuestionTemplate = {
  id: 'g4.md3.rectangle-perimeter',
  standardCode: 'NC.4.MD.3',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const noun = rng.pick(NOUNS);
    const { length, width } = rng.pick(RECTANGLES);

    const perimeter = 2 * (length + width);
    const answerText = `${perimeter} meters`;

    // Every option carries the unit of the CORRECT answer, so the label never
    // gives the answer away; a distractor is the NUMBER a wrong method
    // produces, not a claim that that number really is a length.
    const candidates = [
      { text: answerText, isCorrect: true },
      // Multiplied the two sides, finding the area instead of the border.
      {
        text: `${length * width} meters`,
        isCorrect: false,
        misconception: 'used-area-formula-for-perimeter',
      },
      // Added the length and the width once each: half a perimeter.
      {
        text: `${length + width} meters`,
        isCorrect: false,
        misconception: 'added-only-the-two-given-sides',
      },
      // Doubled the length but not the width, leaving one side out: 2L + W.
      {
        text: `${2 * length + width} meters`,
        isCorrect: false,
        misconception: 'doubled-only-one-dimension',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.md3.rectangle-perimeter: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `A rectangular ${noun} measures ${length} meters by ${width} meters. What is the distance all the way around its edge?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: The distance around the edge is the perimeter, so every side counts once.`,
          `Step 2: A rectangle has two lengths and two widths: ${length} + ${width} + ${length} + ${width}, or 2 × (${length} + ${width}).`,
          `Step 3: 2 × ${length + width} = ${perimeter}.`,
          `Step 4: The distance around the ${noun} is ${answerText}.`,
        ],
        conceptSummary:
          'Perimeter is the border and area is the covering. A rectangle has four sides but only two different lengths, so doubling their sum is the same as adding all four.',
        commonMisconception:
          'Multiplying the two dimensions gives the area — the number of square meters of surface — which answers how much material fills the shape, not how far it is around it.',
      },
    };
  },
};
