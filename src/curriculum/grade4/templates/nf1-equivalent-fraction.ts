import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * The (denominator, new denominator) pairs this template rescales between.
 * Both members come from the list NC.4.NF.2 names — 2, 3, 4, 5, 6, 8, 10, 12
 * and 100 — and the second is a multiple of the first, so the rescaling factor
 * k = D / b is a whole number.
 *
 * One absence is deliberate: (2, 4). With b = 2 the only proper numerator is 1,
 * and with k = 2 that single value is excluded by the algebra below, so the
 * pair would leave nothing to pick from.
 */
const RESCALINGS: readonly (readonly [number, number])[] = [
  [2, 6],
  [2, 8],
  [2, 10],
  [2, 12],
  [2, 100],
  [3, 6],
  [3, 12],
  [4, 8],
  [4, 12],
  [4, 100],
  [5, 10],
  [5, 100],
  [6, 12],
  [10, 100],
];

/**
 * The individual (b, D, a) draws the authored bank already owns.
 *
 * These are not collisions between options — they are collisions between this
 * generator and `../authored.nf.ts`. Each renaming listed here appears there
 * with the SAME three distractors, so a seed drawing it would hand a child a
 * question the scheduler also holds under {authored, id}, and the child would
 * meet it twice under two identities.
 *
 * Barred one DRAW at a time, not one pair at a time. An earlier version
 * dropped the whole (10, 100) pair for the sake of a single clash at a = 6,
 * which cost seven perfectly good questions for one bad one.
 *
 * Note what is NOT listed. g4-nf1-04 renames 3/4 as 9/12 with these same three
 * distractors, and (4, 12, 3) stays drawable, because that item asks "which
 * EQUATION is true" and offers four equations — '3/4 = 9/12' and so on. A child
 * never sees the four strings this template prints, and the task is a
 * different one.
 */
const OWNED_BY_AUTHORED_BANK: readonly string[] = [
  '10,100,6', // g4-nf6-02: 6/10 = 60/100, distractors 6/100, 10/100, 96/100
  '3,12,2', //   g4-nf1-02: 2/3 = 8/12,   distractors 2/12, 3/12, 11/12
];

/**
 * The numerators that keep all four options distinct, for one rescaling.
 * Exported so the test can sweep the whole space rather than sample it.
 *
 * With k = D / b, the four option numerators (all written over D) are
 *
 *   answer      a*k
 *   denomOnly   a              denominator scaled, numerator copied across
 *   addedBoth   a + b(k-1)     the difference D - b added to both parts
 *   oldDenom    b              the old denominator used as the new numerator
 *
 * and because every option carries the SAME denominator D, two options name
 * the same quantity exactly when their numerators are equal. All six pairs:
 *
 *   a*k = a           => k = 1, excluded: every pair above has k >= 2
 *   a*k = a + b(k-1)  => a(k-1) = b(k-1) => a = b, excluded: a <= b - 1
 *   a*k = b           => a = b/k. THE ONLY LIVE COLLISION, excluded here.
 *   a = a + b(k-1)    => b(k-1) = 0, impossible for b >= 2, k >= 2
 *   a = b             => excluded: a <= b - 1
 *   a + b(k-1) = b    => a = b(2-k), which is 0 at k = 2 and negative beyond,
 *                        and a >= 1, so impossible
 *
 * Of the 40 (b, D, a) combinations in range, 3 are barred by that collision —
 * (4, 8) at a = 2, (6, 12) at a = 3 and (10, 100) at a = 1 — and 2 more by
 * OWNED_BY_AUTHORED_BANK above, leaving 35. The sibling test sweeps all 40 and
 * checks that each of the 3 algebraically barred ones really would have put
 * two options on the same number; nothing is excluded for tidiness.
 */
export function admissibleNumerators(b: number, D: number): number[] {
  const k = D / b;
  const out: number[] = [];
  for (let a = 1; a <= b - 1; a++) {
    if (a * k === b) continue;
    if (OWNED_BY_AUTHORED_BANK.includes(`${b},${D},${a}`)) continue;
    out.push(a);
  }
  return out;
}

/**
 * NC.4.NF.1 — explain why a fraction is equivalent to another fraction, with
 * attention to how the number and the size of the parts both change.
 *
 * One template, one skill (spec 6.5): this generator only ever rescales UP,
 * from larger parts to smaller ones. Renaming in the other direction is a
 * different procedure — it needs a common factor to be found rather than
 * supplied by the target denominator — and its errors are different ones, so
 * it would want a template id of its own rather than a branch inside this one.
 *
 * Largest numbers printed: denominator 100, numerator 99.
 */
export const nf1EquivalentFraction: QuestionTemplate = {
  id: 'g4.nf1.equivalent-fraction',
  standardCode: 'NC.4.NF.1',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const [b, D] = rng.pick(RESCALINGS);
    const k = D / b;
    const a = rng.pick(admissibleNumerators(b, D));

    const answer = `${a * k}/${D}`;

    const candidates = [
      { text: answer, isCorrect: true },
      // The denominator was multiplied by k and the numerator carried across
      // unchanged.
      {
        text: `${a}/${D}`,
        isCorrect: false,
        misconception: 'scaled-the-denominator-only',
      },
      // D - b = b(k-1) added to the numerator as well as the denominator,
      // instead of multiplying both by k.
      {
        text: `${a + b * (k - 1)}/${D}`,
        isCorrect: false,
        misconception: 'added-to-both-parts-instead-of-multiplying',
      },
      // The old denominator written down as the new numerator.
      {
        text: `${b}/${D}`,
        isCorrect: false,
        misconception: 'used-the-denominator-as-the-new-numerator',
      },
    ];

    // Distinct BY CONSTRUCTION; a collision here means a generator bug (an
    // option's tag no longer describes the value attached to it), so fail
    // loudly rather than silently resampling.
    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nf1.equivalent-fraction: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Which fraction names the same amount, written in smaller parts?',
      promptDetails: `${a}/${b} = ?/${D}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: Find how the parts change size: ${D} / ${b} = ${k}, so each of the ${b} parts splits into ${k} smaller parts.`,
          `Step 2: Splitting every part into ${k} also splits each of the ${a} parts being counted into ${k}: ${a} x ${k} = ${a * k}.`,
          `Step 3: Both the numerator and the denominator were multiplied by ${k}, which is the factor ${k}/${k} — one whole — so the amount did not change.`,
          `Step 4: ${a}/${b} = ${answer}.`,
        ],
        conceptSummary:
          'Equivalent fractions name the same amount with parts of a different size. The number of parts and the size of the parts change by the same factor, in opposite directions, so the amount stays put.',
        commonMisconception:
          'Rescaling only the denominator shrinks the fraction, and adding the same number to both parts changes it too. Only multiplying both by the same factor renames it.',
      },
    };
  },
};
