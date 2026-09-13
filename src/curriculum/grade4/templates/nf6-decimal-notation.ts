import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * The draw `../authored.nf.ts` already owns.
 *
 * g4-nf6-01 asks for 18 hundredths and offers 0.18, 1.8, 0.018 and 0.81 —
 * exactly the four numbers this template prints at t = 1, u = 8. The prompts
 * differ, so the mechanical duplicate check would not catch it, but a child
 * would meet the same question under two review keys. Barred as one draw, not
 * as a whole row of the space.
 */
const OWNED_BY_AUTHORED_BANK: readonly string[] = ['1,8'];

/**
 * Every (t, u) this template will use: a two-digit count of shaded hundredths,
 * n = 10t + u, with both digits non-zero.
 *
 * The four option values are
 *
 *   answer     (10t + u)/100     0.tu
 *   tooFarDown (10t + u)/1000    0.0tu   a denominator of 100 read as needing
 *                                        three decimal places
 *   tooFarUp   t + u/10          t.u     the point put one place to the right
 *   swapped    (10u + t)/100     0.ut    the two digits in each other's places
 *
 * and all six pairs, with t and u both in 1..9:
 *
 *   answer = tooFarDown  => 10t + u = 0. Impossible.
 *   answer = swapped     => 10t + u = 10u + t => t = u. EXCLUDED below.
 *   answer = tooFarUp    => answer < 1 and tooFarUp >= 1 (t >= 1). Impossible.
 *   tooFarDown = tooFarUp=> tooFarDown < 0.1 and tooFarUp >= 1. Impossible.
 *   tooFarDown = swapped => 10t + u = 100u + 10t => u = 0. EXCLUDED: u >= 1.
 *   tooFarUp = swapped   => tooFarUp >= 1 and swapped <= 0.98. Impossible.
 *
 * So one exclusion carries the collision argument: t must not equal u. 81
 * (t, u) pairs are in range, 9 are barred by that, and 1 more is owned by the
 * authored bank, leaving 71. The sibling test sweeps all 81 and checks that
 * each of the 9 collision-barred pairs really would have put two options on
 * the same number.
 *
 * Both digits are non-zero on purpose. A zero in the tenths place would make
 * the answer a single hundredth (0.09), whose distractor set is a different
 * one — it turns on the placeholder zero rather than on where the point goes —
 * and two distractor sets in one template is two skills. That case is the
 * authored item g4-nf6-04.
 */
export function admissiblePairs(): [number, number][] {
  const out: [number, number][] = [];
  for (let t = 1; t <= 9; t++) {
    for (let u = 1; u <= 9; u++) {
      if (t === u) continue;
      if (OWNED_BY_AUTHORED_BANK.includes(`${t},${u}`)) continue;
      out.push([t, u]);
    }
  }
  return out;
}

const PAIRS = admissiblePairs();

/**
 * NC.4.NF.6 — "use decimal notation to represent fractions", and the third of
 * its keyConcepts, "represent tenths and hundredths with models, making
 * connections between fractions and decimals". The 10 by 10 grid is that
 * model: one column of ten squares is a tenth, one square is a hundredth.
 *
 * One template, one skill (spec 6.5). The other NC.4.NF.6 generator,
 * ./nf6-add-tenths-hundredths.ts, is the standard's second keyConcept — adding
 * two fractions with denominators of 10 or 100 — and its misconception set is
 * disjoint from this one's. Notation and addition are two procedures, so they
 * are two template ids and two review keys.
 *
 * Largest number printed: 100, the number of squares in the grid.
 */
export const nf6DecimalNotation: QuestionTemplate = {
  id: 'g4.nf6.decimal-notation',
  standardCode: 'NC.4.NF.6',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const [t, u] = rng.pick(PAIRS);
    const shaded = 10 * t + u;
    const answer = `0.${t}${u}`;

    const candidates = [
      { text: answer, isCorrect: true },
      // The 18 of 18/100 shifted one place further right, as though a
      // denominator of 100 needed three decimal places instead of two.
      { text: `0.0${t}${u}`, isCorrect: false, misconception: 'wrong-power-of-ten' },
      // The same digits shifted one place the other way, which multiplies the
      // amount by ten and makes a part of one grid bigger than the whole grid.
      { text: `${t}.${u}`, isCorrect: false, misconception: 'wrong-power-of-ten' },
      // The two digits written in each other's places: u tenths and t
      // hundredths instead of t tenths and u hundredths.
      {
        text: `0.${u}${t}`,
        isCorrect: false,
        misconception: 'swapped-the-decimal-place-values',
      },
    ];

    // Distinct BY CONSTRUCTION; a collision means t !== u stopped holding.
    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nf6.decimal-notation: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'A 10 by 10 grid represents 1 whole. Which decimal names the shaded part of the grid?',
      promptDetails: `${shaded} of the 100 small squares are shaded.`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: The grid has 100 equal squares and ${shaded} are shaded, so the shaded part is ${shaded}/100 of the whole.`,
          `Step 2: A denominator of 100 means hundredths, and hundredths live in the SECOND place after the decimal point — so the number needs exactly two decimal places.`,
          `Step 3: ${shaded} hundredths is ${t} full columns of ten squares and ${u} squares over, which is ${t} tenths and ${u} hundredths.`,
          `Step 4: The shaded part of the grid is ${answer}.`,
        ],
        conceptSummary:
          'The grid shows both places at once: a column of ten squares is one tenth, a single square is one hundredth. Reading the shading by columns and leftovers gives the two decimal digits directly.',
        commonMisconception:
          'Counting the decimal places by the zeros in 100 is what produces a third place. The denominator says which place the LAST digit lands in, not how many digits to write.',
      },
    };
  },
};
