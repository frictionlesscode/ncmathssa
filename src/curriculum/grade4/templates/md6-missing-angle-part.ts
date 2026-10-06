import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/** The rays of the figure. `a` and `c` are the outer rays, `b` the one drawn
 *  inside the angle, `v` the shared endpoint.
 *
 *  None of these letter sets can spell angle BPC or angle RST, the figures the
 *  authored items g4-md6-01 and g4-md6-03 use, so a child never meets the same
 *  named angle twice with different measures on it. */
const FIGURES: { a: string; v: string; b: string; c: string }[] = [
  { a: 'J', v: 'K', b: 'M', c: 'L' },
  { a: 'D', v: 'E', b: 'G', c: 'F' },
  { a: 'W', v: 'X', b: 'Z', c: 'Y' },
  { a: 'H', v: 'N', b: 'Q', c: 'V' },
];

/**
 * Every (whole, part) pair this template may draw, computed once so the
 * sibling test can enumerate the whole space instead of sampling it.
 *
 * Write the whole angle as W = 10*Wt + Wo and the given part as A = 10*At + Ao,
 * with
 *
 *   Wt in 4..9, Wo in 0..8      so 40 <= W <= 98
 *   At in 1..Wt-2, Ao in Wo+1..9 so A is two digits and A < W
 *
 * and set d = Wt - At (>= 2) and e = Ao - Wo (>= 1). The four options are
 *
 *   answer    = W - A   = 10d - e     the missing part
 *   sum       = W + A                 added instead of subtracting
 *   noRegroup = 10d + e               each column's smaller digit taken from
 *                                     its larger, so the borrow never happened
 *   straight  = 180 - A               the whole angle assumed to be straight
 *
 * Ao > Wo is required by construction, which is what makes noRegroup a REAL
 * error rather than a manufactured one: the ones column genuinely needs a
 * borrow at every draw. At <= Wt - 2 keeps d >= 2, so the answer is at least
 * 20 - 9 = 11 degrees and the figure is never a sliver.
 *
 * Pairwise distinctness:
 *
 *   answer vs noRegroup   differ by 2e >= 2.
 *   answer vs sum         2A = 0, and A >= 11.
 *   answer vs straight    W = 180, and W <= 98.
 *   sum vs noRegroup      noRegroup = answer + 2e, so equality needs e = A;
 *                         e <= 9 and A >= 11.
 *   noRegroup vs straight 180 = W + 2e, and W + 2e <= 98 + 18 = 116.
 *   sum vs straight       W + 2A = 180. This one HAS solutions in range, so
 *                         those seven pairs are excluded below by
 *                         construction rather than resampled: 70-55, 72-54,
 *                         82-49, 84-48, 86-47, 90-45 and 92-44.
 *
 * That leaves 1,215 - 7 = 1,208 pairs, which the sibling test drives
 * generate() over.
 */
export const ANGLE_PAIRS: { whole: number; part: number }[] = (() => {
  const out: { whole: number; part: number }[] = [];
  for (let wt = 4; wt <= 9; wt++) {
    for (let wo = 0; wo <= 8; wo++) {
      const whole = 10 * wt + wo;
      for (let at = 1; at <= wt - 2; at++) {
        for (let ao = wo + 1; ao <= 9; ao++) {
          const part = 10 * at + ao;
          // The only collision the ranges above do not already rule out:
          // 180 - part would equal whole + part.
          if (whole + 2 * part === 180) continue;
          out.push({ whole, part });
        }
      }
    }
  }
  return out;
})();

/**
 * NC.4.MD.6 — find an unknown angle on a diagram, where a ray drawn inside an
 * angle splits it into two non-overlapping parts and one part is missing.
 *
 * ONE TEMPLATE, ONE SKILL (spec 6.5). NC.4.MD.6's sourced keyConcepts cover
 * three things: what an angle is, measuring one with a protractor, and adding
 * and subtracting to find unknown angles on a diagram. Only the third is here,
 * and only its subtraction half. A review key is seedless, so a template that
 * sometimes handed a child a protractor reading and sometimes a decomposition
 * would let a child who cannot do one be reviewed with the other, promoted for
 * answering it, and retired as mastered. Reading a protractor (g4-md6-02) and
 * composing two parts into a whole (g4-md6-03) are carried by the authored
 * bank, which reaches the scheduler under its own {authored, id} keys.
 *
 * FIGURES ARE TEXT. This app has no image assets. The whole diagram is in
 * promptDetails, written so a screen reader can read it aloud, and the
 * question is answerable from the words alone — nothing depends on seeing
 * where the rays are drawn, only on which one lies between the others.
 *
 * Bounds. Every printed number: the whole angle is at most 98 degrees and the
 * given part at most 79, so the largest value anywhere in the item is the
 * added-instead-of-subtracted distractor at its ceiling, 177, and the largest
 * numeral printed at all is the 180 the straight-angle distractor is built
 * from. Nothing here leaves a protractor.
 */
export const md6MissingAnglePart: QuestionTemplate = {
  id: 'g4.md6.missing-angle-part',
  standardCode: 'NC.4.MD.6',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const f = rng.pick(FIGURES);
    const { whole, part } = rng.pick(ANGLE_PAIRS);

    const answer = whole - part;
    const answerText = `${answer} degrees`;
    // Each column's smaller digit taken from its larger, so the borrow the
    // ones column needs never happens.
    const noRegroup =
      10 * (Math.floor(whole / 10) - Math.floor(part / 10)) + ((part % 10) - (whole % 10));
    // Counting up from the part to the next whole ten, then on to the whole.
    const nextTen = 10 * (Math.floor(part / 10) + 1);

    const whole3 = `${f.a}${f.v}${f.c}`;
    const given3 = `${f.a}${f.v}${f.b}`;
    const asked3 = `${f.b}${f.v}${f.c}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // Added the two given measures instead of subtracting them.
      {
        text: `${whole + part} degrees`,
        isCorrect: false,
        misconception: 'added-instead-of-subtracted',
      },
      // Took the subtraction column by column without regrouping.
      {
        text: `${noRegroup} degrees`,
        isCorrect: false,
        misconception: 'subtracted-without-regrouping',
      },
      // Used 180 as the whole angle instead of the measure the figure gives.
      {
        text: `${180 - part} degrees`,
        isCorrect: false,
        misconception: 'assumed-a-straight-angle',
      },
    ];

    // Distinct BY CONSTRUCTION; a collision means the ranges ANGLE_PAIRS draws
    // from and the algebra in its docstring have drifted apart.
    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.md6.missing-angle-part: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `The diagram shows angle ${whole3} cut into two smaller angles by ray ${f.v}${f.b}. What is the measure of angle ${asked3}?`,
      promptDetails:
        `Angle description: ray ${f.v}${f.a} and ray ${f.v}${f.c} share the endpoint ${f.v}, ` +
        `and angle ${whole3} measures ${whole} degrees. ` +
        `Ray ${f.v}${f.b} also starts at ${f.v} and lies inside angle ${whole3}, so angle ${given3} ` +
        `and angle ${asked3} do not overlap and together make angle ${whole3}. ` +
        `Angle ${given3} measures ${part} degrees.`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Ray ${f.v}${f.b} lies inside angle ${whole3}, so the two parts add up to the whole: angle ${given3} + angle ${asked3} = angle ${whole3}.`,
          `Step 2: That is ${part} + angle ${asked3} = ${whole}, so angle ${asked3} = ${whole} − ${part}.`,
          `Step 3: Count up from ${part}: ${part} to ${nextTen} is ${nextTen - part}, and ${nextTen} to ${whole} is ${whole - nextTen}, so ${whole} − ${part} = ${answer}.`,
          `Step 4: Angle ${asked3} measures ${answerText}.`,
        ],
        conceptSummary:
          'When a ray is drawn inside an angle, the two parts it makes add up to the whole angle. Finding a missing part is therefore subtraction, and counting up from the part you already know never needs any borrowing.',
        commonMisconception:
          'Two rays that share an endpoint do not have to point in opposite directions, so the whole angle is whatever the figure says it is and not 180 degrees. A part can never be larger than the whole it sits inside, which rules out any answer bigger than the angle given.',
      },
    };
  },
};
