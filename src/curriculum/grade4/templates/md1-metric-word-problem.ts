import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

interface Context {
  /** Builds the word problem. `each` is the per-item measurement, `n` the
   *  number of items. */
  frame(each: number, n: number): string;
  unit: string;
  /** Plural noun for the repeated object, used in the worked solution. */
  items: string;
}

/**
 * The six metric units NC.4.MD.1 names, and only those six: centimeter,
 * meter, gram, kilogram, liter, milliliter. No customary unit appears, and
 * neither does the kilometer, which the sourced keyConcepts do not list.
 */
const CONTEXTS: Context[] = [
  {
    frame: (each, n) =>
      `Each shelf bracket is ${each} centimeters long. Laid end to end, how many centimeters do ${n} brackets reach?`,
    unit: 'centimeters',
    items: 'brackets',
  },
  {
    frame: (each, n) =>
      `A school hallway is being marked with tape in equal sections ${each} meters long. How many meters of tape are needed for ${n} sections?`,
    unit: 'meters',
    items: 'sections',
  },
  {
    frame: (each, n) =>
      `Each bag of rice has a mass of ${each} grams. What is the total mass of ${n} bags?`,
    unit: 'grams',
    items: 'bags',
  },
  {
    frame: (each, n) =>
      `Each crate of books has a mass of ${each} kilograms. What is the total mass of ${n} crates?`,
    unit: 'kilograms',
    items: 'crates',
  },
  {
    frame: (each, n) =>
      `Each watering can holds ${each} liters. How many liters do ${n} full watering cans hold altogether?`,
    unit: 'liters',
    items: 'watering cans',
  },
  {
    frame: (each, n) =>
      `Each juice box holds ${each} milliliters. How many milliliters do ${n} juice boxes hold altogether?`,
    unit: 'milliliters',
    items: 'juice boxes',
  },
];

/**
 * The (tens, count) pairs this template draws from, computed once so the whole
 * space is enumerable by the sibling test rather than sampled.
 *
 * The measurement is always a whole number of TENS — 20, 30, ... 90 — because
 * that is what makes the `wrong-power-of-ten` distractor a real error rather
 * than a manufactured one: a child who multiplies 3 by 6 and forgets that the
 * 3 stood for 30 gets a product exactly ten times too small.
 *
 * One pair is excluded. With each = 10t and n items the four options are
 *   answer   = 10tn
 *   added    = 10t + n
 *   subtract = 10t - n
 *   tenth    = tn
 * and `tenth` collides with `subtract` exactly when tn = 10t - n, i.e. when
 * n = 10t / (t + 1). Over t in 2..9 and n in 3..9 that happens at (4, 8) —
 * 4 x 8 = 32 = 40 - 8 — and at (9, 9) — 81 = 90 - 9. Every other pairing is
 * provably distinct: answer vs added needs n(10t - 1) = 10t, answer vs
 * subtract needs n(10t + 1) = 10t and answer vs tenth needs 9tn = 0, none of
 * which has a solution in range; added vs subtract needs n = 0; and added vs
 * tenth needs n = 10t / (t - 1), which is never less than 11 over this range.
 */
export const PAIRS: { tens: number; count: number }[] = (() => {
  const out: { tens: number; count: number }[] = [];
  for (let t = 2; t <= 9; t++) {
    for (let n = 3; n <= 9; n++) {
      if (t * n === 10 * t - n) continue;
      out.push({ tens: t, count: n });
    }
  }
  return out;
})();

/**
 * NC.4.MD.1 — one-step metric word problems with whole-number measurements.
 *
 * ONE TEMPLATE, ONE SKILL (spec 6.5). NC.4.MD.1's sourced text covers all four
 * operations, but a review key is seedless: one template that sometimes
 * multiplied and sometimes divided would let a child who cannot divide be
 * reviewed with a multiplication item, promoted for answering it, and retired
 * as mastered with the division never retested. This template multiplies, and
 * nothing else. Division, subtraction and unit choice under the same standard
 * are carried by the authored bank (g4-md1-01, g4-md1-02, g4-md1-03), whose
 * items reach the scheduler under their own {authored, id} keys.
 *
 * Every printed number is bounded, not just the answer. The largest value this
 * template can emit is the answer at its ceiling, 90 x 9 = 810; the largest
 * quantity named in any prompt is 90. Nothing here approaches the 100,000 cap
 * that Grade 4 Base Ten works within, let alone crosses it.
 */
export const md1MetricWordProblem: QuestionTemplate = {
  id: 'g4.md1.metric-word-problem',
  standardCode: 'NC.4.MD.1',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const ctx = rng.pick(CONTEXTS);
    const { tens, count } = rng.pick(PAIRS);
    const each = tens * 10;

    const answer = each * count;
    const answerText = `${answer} ${ctx.unit}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // Added the two numbers instead of multiplying them.
      {
        text: `${each + count} ${ctx.unit}`,
        isCorrect: false,
        misconception: 'added-instead-of-multiplied',
      },
      // Subtracted the two numbers instead of multiplying them.
      {
        text: `${each - count} ${ctx.unit}`,
        isCorrect: false,
        misconception: 'subtracted-instead-of-multiplied',
      },
      // Multiplied the tens digit alone and lost the place value with it:
      // tens x count is the product ten times too small.
      {
        text: `${tens * count} ${ctx.unit}`,
        isCorrect: false,
        misconception: 'wrong-power-of-ten',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.md1.metric-word-problem: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: ctx.frame(each, count),
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: There are ${count} ${ctx.items}, and each one measures the same ${each} ${ctx.unit}. Equal groups mean multiplying.`,
          `Step 2: ${each} is ${tens} tens, so ${each} × ${count} is ${tens} × ${count} = ${tens * count} tens.`,
          `Step 3: ${tens * count} tens is ${answer}.`,
          `Step 4: The total is ${answerText}.`,
        ],
        conceptSummary:
          'A measurement repeated in equal groups is multiplied, and the unit of the answer is the unit each group was measured in. Multiplying by tens is the one-digit fact with the place value put back.',
        commonMisconception:
          'Multiplying the tens digit and forgetting what it stood for gives an answer ten times too small. Checking the size of the answer against one group catches it: the total has to be bigger than a single group, by about as many times as there are groups.',
      },
    };
  },
};
