import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

export interface Frac {
  n: number;
  d: number;
  v: number;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

/** The denominators NC.4.NF.2 names, less 100 — hundredths against thirds is a
 *  comparison no Grade 4 child is asked to reason about with a model. */
const DENOMINATORS = [2, 3, 4, 5, 6, 8, 10, 12];

/** Every proper fraction in lowest terms over those denominators. Lowest terms
 *  matters: 2/4 and 1/2 are the same quantity written two ways, and a pool
 *  holding both could put both in front of a child in one question. */
const POOL: Frac[] = DENOMINATORS.flatMap((d) =>
  Array.from({ length: d - 1 }, (_, i) => i + 1)
    .filter((n) => gcd(n, d) === 1)
    .map((n) => ({ n, d, v: n / d })),
);

const render = (fs: readonly Frac[]): string => fs.map((f) => `${f.n}/${f.d}`).join('; ');

const byNumerator = (t: readonly Frac[]): Frac[] => [...t].sort((x, y) => x.n - y.n);
const byDenominatorAsc = (t: readonly Frac[]): Frac[] => [...t].sort((x, y) => x.d - y.d);
const byDenominatorDesc = (t: readonly Frac[]): Frac[] => [...t].sort((x, y) => y.d - x.d);

/** The four orderings this template offers, always in this order. */
export function orderingsOf(t: readonly Frac[]): string[] {
  return [render(t), render(byNumerator(t)), render(byDenominatorAsc(t)), render(byDenominatorDesc(t))];
}

/**
 * The triples that make four DIFFERENT orderings, built by exhaustive
 * enumeration rather than filtered at generate() time. Admitted only when:
 *
 *   - the three values strictly increase, so "least to greatest" has one answer
 *   - consecutive values differ by at least 1/12, the smallest part size in
 *     the standard's own denominator list, so no comparison turns on a margin
 *     a child cannot see on a length model
 *   - the three numerators are pairwise distinct and so are the three
 *     denominators, which is what makes "ordered by numerator" and "ordered by
 *     denominator" single, unambiguous orderings
 *   - the four orderings — true, by numerator, by denominator ascending, by
 *     denominator descending — are four DISTINCT permutations
 *
 * That last condition is the whole collision argument. The four options are
 * four permutations of three fractions that are pairwise distinct in value and
 * in lowest terms, so no two of them can name the same quantity unless they
 * are the same permutation, which this filter forbids. No algebra over the
 * digits is needed and none is possible: the exclusion is structural.
 *
 * The sweep is the construction itself. All 23^3 = 12,167 ordered triples from
 * the pool are examined and 81 are admitted; the sibling test re-runs that
 * sweep and pins both numbers.
 */
function buildTriples(): Frac[][] {
  const out: Frac[][] = [];
  for (const a of POOL) {
    for (const b of POOL) {
      for (const c of POOL) {
        if (!(a.v < b.v && b.v < c.v)) continue;
        if (b.v - a.v < 1 / 12 - 1e-12 || c.v - b.v < 1 / 12 - 1e-12) continue;
        const t = [a, b, c];
        if (new Set(t.map((f) => f.n)).size !== 3) continue;
        if (new Set(t.map((f) => f.d)).size !== 3) continue;
        if (new Set(orderingsOf(t)).size !== 4) continue;
        out.push(t);
      }
    }
  }
  return out;
}

export const TRIPLES: readonly Frac[][] = buildTriples();

/** The permutations of a triple that this template does NOT offer as options,
 *  so the three fractions can be listed in the prompt in an order that matches
 *  no answer. Three items give 6 permutations and 4 are spoken for, so there
 *  are always exactly 2 to choose from. */
function unusedOrderings(t: readonly Frac[]): Frac[][] {
  const [a, b, c] = t;
  const all = [
    [a, b, c],
    [a, c, b],
    [b, a, c],
    [b, c, a],
    [c, a, b],
    [c, b, a],
  ];
  const taken = new Set(orderingsOf(t));
  return all.filter((p) => !taken.has(render(p)));
}

/**
 * NC.4.NF.2 — compare fractions with different numerators AND different
 * denominators, recording the result and justifying the conclusion.
 *
 * Each wrong ordering is what ONE named rule produces, and each rule is one a
 * Grade 4 child really uses:
 *
 *   answer        place the fractions by size, using a common denominator
 *   by numerator  ordered by the count of parts alone
 *   denom asc     ordered by denominator, bigger denominator read as the
 *                 bigger fraction — the 1/8 > 1/3 error
 *   denom desc    ordered by denominator the other way, on the rule "bigger
 *                 denominator, smaller fraction". That rule is TRUE for unit
 *                 fractions and false here, where the numerators differ
 *
 * The reverse of the true order is deliberately not offered. Its tag,
 * ordered-from-the-wrong-end, sits in the place-value-and-decimals family,
 * and a child who mixed up the direction on a fractions item would have been
 * reported to a parent as having a place-value problem.
 *
 * Largest numbers printed: denominator 12 in the question, and up to 120 in
 * the worked solution, which is the largest common denominator three of these
 * denominators can need.
 */
export const nf2OrderFractions: QuestionTemplate = {
  id: 'g4.nf2.order-fractions',
  standardCode: 'NC.4.NF.2',
  domainId: 'NF',
  difficulty: 'advanced',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const triple = rng.pick(TRIPLES);
    const [a, b, c] = triple;
    const [answer, numeratorOrder, denomAscOrder, denomDescOrder] = orderingsOf(triple);

    const candidates = [
      { text: answer, isCorrect: true },
      // Ordered by the count of parts alone, with no account taken of how big
      // those parts are.
      { text: numeratorOrder, isCorrect: false, misconception: 'compared-numerators-only' },
      // Ordered by denominator, smallest first, on the rule that the bigger
      // denominator is the bigger fraction.
      {
        text: denomAscOrder,
        isCorrect: false,
        misconception: 'larger-denominator-means-larger-fraction',
      },
      // Ordered by denominator, largest first, on the unit-fraction rule
      // "bigger denominator, smaller fraction" — true only when the numerators
      // match, which here they do not.
      {
        text: denomDescOrder,
        isCorrect: false,
        misconception: 'applied-the-unit-fraction-rule-to-unlike-numerators',
      },
    ];

    // Distinct BY CONSTRUCTION — buildTriples() admits a triple only when its
    // four orderings differ. A collision here means the filter and the options
    // have drifted apart, so fail loudly rather than resampling.
    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nf2.order-fractions: option collision [${texts.join(' | ')}]`);
    }

    const common = lcm(lcm(a.d, b.d), c.d);
    const scaled = triple.map((f) => `${(f.n * common) / f.d}/${common}`);

    return {
      prompt: 'These fractions all describe parts of the same size whole. Order them from LEAST to GREATEST.',
      // Listed in an order that matches none of the four options, so no answer
      // can be picked by matching the order they were presented in.
      promptDetails: render(rng.pick(unusedOrderings(triple))),
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: The denominators ${a.d}, ${b.d} and ${c.d} all divide ${common}, so rewrite each fraction in ${common}ths and the parts will all be the same size.`,
          `Step 2: ${a.n}/${a.d} = ${scaled[0]}, ${b.n}/${b.d} = ${scaled[1]}, and ${c.n}/${c.d} = ${scaled[2]}.`,
          `Step 3: Now the numerators can be compared directly: ${(a.n * common) / a.d} < ${(b.n * common) / b.d} < ${(c.n * common) / c.d}.`,
          `Step 4: From least to greatest: ${answer}.`,
        ],
        conceptSummary:
          'A fraction carries two numbers and neither orders it alone: the numerator counts the parts and the denominator sizes them. Renaming every fraction in the same-size parts turns the comparison into one between whole numbers.',
        commonMisconception:
          'A bigger denominator means MORE parts in the whole and so SMALLER parts, which is why 1/8 is less than 1/3. But that rule only settles a comparison when the numerators match.',
      },
    };
  },
};
