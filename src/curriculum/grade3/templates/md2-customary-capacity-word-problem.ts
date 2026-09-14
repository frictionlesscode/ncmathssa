import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.MD.2 — "Solve problems involving CUSTOMARY measurement", whose third
 * keyConcept is "Add, subtract, multiply, or divide to solve one-step word
 * problems involving whole number measurements of length, weight, and capacity
 * IN THE SAME CUSTOMARY UNITS."
 *
 * RULING 14-1, the most serious finding in the Grade 3 pre-flight. The task
 * brief called this standard "mass or volume word problems". That is Common
 * Core 3.MD.A.2's vocabulary — grams, kilograms, liters — and it is not NC's.
 * NC's metric work is Grade 4 (NC.4.MD.1) and already ships as
 * ../../grade4/templates/md2-metric-convert.ts. This generator prints cups,
 * pints, quarts and gallons and nothing else, and ../authored.md.test.ts
 * sweeps everything it can emit for a metric unit.
 *
 * TWO further boundaries, both one careless line away:
 *
 *  - ONE UNIT PER PROBLEM. "In the same customary units" forecloses conversion.
 *    A question that starts in quarts and answers in gallons is NC.4.MD.1.
 *    Here the container, the amount poured out and the answer all carry the
 *    same unit word, drawn once.
 *
 *  - THIS IS A MEASUREMENT QUESTION, NOT AN NBT ONE. It is a one-step word
 *    problem about how much is left in a container, which is what the third
 *    keyConcept asks for. ./nbt2-subtract-within-1000.ts asks a bare
 *    "Subtract." over a vertical figure; nothing about the two questions looks
 *    alike to a child, and ./index.test.ts pins that.
 *
 * ---------------------------------------------------------------------------
 * Construction. Write A = 10*a1 + a0 for what the container holds and
 * B = 10*b1 + b0 for what is poured out, with
 *
 *   a1 in 3..9,  b1 in 1..a1-1      so the tens of A exceed the tens of B
 *   a0 in 0..8,  b0 in a0+1..9      so the ones of A are SHORT of the ones of
 *                                   B, which is what forces a regroup
 *   and b0 - a0 != 5                (see the collision below)
 *
 * A > B always, because a1 > b1 means A - B >= 10 - 9 > 0. The subtraction
 * always needs a regroup, which is what makes the two algorithm distractors
 * reachable rather than decorative.
 *
 *   answer                                    A - B
 *   added-instead-of-subtracted               A + B
 *   subtracted-without-regrouping             10*(a1-b1) + (b0-a0)
 *                                               — took the smaller digit from
 *                                                 the larger in each column
 *   borrowed-without-reducing-the-next-        (A - B) + 10
 *     column                                    — traded ten into the ones but
 *                                                 left the tens digit alone
 *
 * Let g = b0 - a0, which is in 1..9. Then A - B = 10*(a1-b1) - g, and:
 *
 *   (A-B) = A+B                  =>  B = 0.                    Never: B >= 10.
 *   (A-B) = 10(a1-b1) + g        =>  2g = 0.                   Never: g >= 1.
 *   (A-B) = (A-B) + 10           =>  0 = 10.                   Never.
 *   A+B   = 10(a1-b1) + g        =>  A + B = (A-B) + 2g
 *                                =>  B = g.  But B >= 10 and g <= 9. Never.
 *   A+B   = (A-B) + 10           =>  2B = 10 => B = 5.  Never: B >= 10.
 *   10(a1-b1) + g = (A-B) + 10   =>  (A-B) + 2g = (A-B) + 10
 *                                =>  g = 5.  EXCLUDED on the draw.
 *
 * One exclusion, g = 5, and it is excluded by construction: the pair list
 * below never contains it, and the sibling test asserts that the pairs left
 * out are exactly those. Nothing is resampled.
 */
export interface PourPair {
  A: number;
  B: number;
}

export const POUR_PAIRS: PourPair[] = [];
for (let a1 = 3; a1 <= 9; a1++) {
  for (let b1 = 1; b1 < a1; b1++) {
    for (let a0 = 0; a0 <= 8; a0++) {
      for (let b0 = a0 + 1; b0 <= 9; b0++) {
        if (b0 - a0 === 5) continue;
        POUR_PAIRS.push({ A: 10 * a1 + a0, B: 10 * b1 + b0 });
      }
    }
  }
}

/** Container, unit and contents drawn together so the three always agree —
 *  and so the unit is CUSTOMARY CAPACITY every time (ruling 14-1). */
interface Vessel {
  container: string;
  unit: string;
  liquid: string;
}

const VESSELS: Vessel[] = [
  { container: 'water tank', unit: 'gallons', liquid: 'water' },
  { container: 'rain barrel', unit: 'gallons', liquid: 'rain water' },
  { container: 'soup pot', unit: 'quarts', liquid: 'soup' },
  { container: 'cooler', unit: 'quarts', liquid: 'lemonade' },
  { container: 'juice jug', unit: 'pints', liquid: 'juice' },
  { container: 'milk can', unit: 'pints', liquid: 'milk' },
];

const NAMES = ['Maya', 'Omar', 'Priya', 'Diego', 'Lena', 'Jonah'];

/** "1 quart" but "13 quarts". A > B by at least 1, so the amount left can be a
 *  single unit, and "1 quarts" is a prompt an eight-year-old has to read. */
function amount(n: number, unit: string): string {
  return `${n} ${n === 1 ? unit.replace(/s$/, '') : unit}`;
}

export const md2CustomaryCapacityWordProblem: QuestionTemplate = {
  id: 'g3.md2.customary-capacity-word-problem',
  standardCode: 'NC.3.MD.2',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { container, unit, liquid } = rng.pick(VESSELS);
    const name = rng.pick(NAMES);
    const { A, B } = rng.pick(POUR_PAIRS);

    const a1 = Math.floor(A / 10);
    const a0 = A % 10;
    const b1 = Math.floor(B / 10);
    const b0 = B % 10;

    const left = A - B;
    const answerText = amount(left, unit);

    const candidates = [
      { text: answerText, isCorrect: true },
      // A + B: put the two amounts together instead of taking one away.
      { text: amount(A + B, unit), isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // 10(a1-b1) + (b0-a0): took the smaller digit from the larger in the
      // ones column rather than trading a ten across.
      {
        text: amount(10 * (a1 - b1) + (b0 - a0), unit),
        isCorrect: false,
        misconception: 'subtracted-without-regrouping',
      },
      // (A - B) + 10: traded a ten into the ones column but never crossed out
      // the ten it came from, so the tens digit is one too many.
      {
        text: amount(left + 10, unit),
        isCorrect: false,
        misconception: 'borrowed-without-reducing-the-next-column',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(
        `g3.md2.customary-capacity-word-problem: option collision [${texts.join(' | ')}]`,
      );
    }

    return {
      prompt: `A ${container} holds ${A} ${unit} of ${liquid}. ${name} pours out ${B} ${unit}. How many ${unit} of ${liquid} are left in the ${container}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Something is being taken away, so subtract: ${A} - ${B}.`,
          `Step 2: There are only ${a0} ones in ${A} and ${b0} ones are needed, so trade one ten from the ${a1} tens. That leaves ${a1 - 1} tens and makes ${a0 + 10} ones.`,
          `Step 3: ${a0 + 10} - ${b0} = ${a0 + 10 - b0} ones, and ${a1 - 1} - ${b1} = ${a1 - 1 - b1} tens.`,
          `Step 4: Both amounts are already in ${unit}, so the answer keeps that unit: ${answerText} left.`,
        ],
        conceptSummary:
          'A measurement word problem is solved the same way as any other word problem - the measuring units just come along for the ride. When both amounts are already in the same customary unit, subtract the numbers and keep the unit.',
        commonMisconception: `Answering ${amount(10 * (a1 - b1) + (b0 - a0), unit)} comes from taking the smaller digit away from the larger one in the ones column. ${a0} ones is not enough to take ${b0} away from, so a ten has to be traded first.`,
      },
    };
  },
};
