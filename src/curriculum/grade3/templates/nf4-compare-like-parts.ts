import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.NF.4 — "Compare two fractions WITH THE SAME NUMERATOR OR THE SAME
 * DENOMINATOR by reasoning about their size, using area and length models, and
 * using the >, <, and = symbols... with denominators: halves, fourths and
 * eighths; thirds and sixths."
 *
 * Ruling 13-1, built into the construction rather than trusted to review: every
 * comparison this generator can emit puts two fractions side by side that share
 * a numerator or share a denominator, and both denominators always come from
 * ONE related family. Comparing 2/3 to 3/4 is NC.4.NF.2 — next year's content,
 * with a landed Grade 4 generator of its own (`../../grade4/templates/
 * nf2-order-fractions.ts`). "Equivalence and comparison" is the single most
 * natural phrase to write a general comparator from, and a general comparator
 * here would file Grade 4 mathematics under a Grade 3 code, which every other
 * test in the suite would pass.
 *
 * The question shape is "which comparison is true?" over four complete
 * statements, so the >, < and = symbols the standard asks a child to RECORD
 * comparisons with are on the page and being read, rather than hidden behind a
 * "which is greater" that never prints a symbol.
 *
 * ---------------------------------------------------------------------------
 * Construction. A family F is one of {2, 4, 8} or {3, 6}; p < q are two of its
 * denominators; a is a numerator with 1 <= a < p, so a/p and a/q are both
 * proper; and b < c are two numerators over the common denominator q.
 *
 * Two of the four statements come from the SAME-NUMERATOR pair (a/p against
 * a/q, where p < q means a/p is greater) and two from the SAME-DENOMINATOR pair
 * (b/q against c/q, where b < c means b/q is smaller). Two draws then decide
 * which pair the true statement comes from and whether it is written with > or
 * with <, so the key is not always a > and not always the same half of the
 * standard.
 *
 * In every arrangement exactly one statement is true:
 *
 *   a/p > a/q   TRUE, p < q          a/q > a/p   larger-denominator-means-
 *   a/p = a/q   FALSE, p != q                    larger-fraction
 *   c/q > b/q   TRUE, b < c          b/q > c/q   compared-in-the-wrong-
 *   b/q = c/q   FALSE, b != c                    direction
 *
 * and the "=" statement is tagged by which part the two fractions share:
 * compared-numerators-only when the numerators match, compared-denominators-
 * only when the denominators do.
 *
 * Distinctness of the four option TEXTS is structural. Within one arrangement
 * the three statements about a given pair use three different symbol/order
 * combinations, and the fourth statement is about the other pair, which it can
 * never match because p != q. Nothing is excluded and nothing is resampled.
 *
 * The draw space is 107 (family, p, q, a, b, c) combinations x 2 halves x 2
 * symbol directions = 428 questions, and the sibling test sweeps every
 * (p, q, a, b, c) and checks the two ruling 13-1 properties by construction:
 * every statement compares fractions sharing a numerator or a denominator, and
 * every denominator printed is one of {2, 3, 4, 6, 8}.
 */
interface Pair {
  p: number;
  q: number;
}

/** The two related families the sourced text names, and only those. A pair
 *  never crosses between them. */
export const FAMILIES: number[][] = [
  [2, 4, 8],
  [3, 6],
];

export const DENOMINATOR_PAIRS: Pair[] = [];
for (const family of FAMILIES) {
  for (let i = 0; i < family.length; i++) {
    for (let j = i + 1; j < family.length; j++) {
      DENOMINATOR_PAIRS.push({ p: family[i], q: family[j] });
    }
  }
}

export const nf4CompareLikeParts: QuestionTemplate = {
  id: 'g3.nf4.compare-like-parts',
  standardCode: 'NC.3.NF.4',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { p, q } = rng.pick(DENOMINATOR_PAIRS);
    // a < p keeps both same-numerator fractions proper.
    const a = rng.int(1, p - 1);
    // b < c, both proper over q.
    const b = rng.int(1, q - 2);
    const c = rng.int(b + 1, q - 1);

    // The greater and lesser member of each pair, named so the statements below
    // read the same way whichever half of the standard is being asked.
    const sameNumerator = { more: `${a}/${p}`, less: `${a}/${q}` };
    const sameDenominator = { more: `${c}/${q}`, less: `${b}/${q}` };

    const keyIsSameDenominator = rng.next() < 0.5;
    const useGreaterThan = rng.next() < 0.5;

    const key = keyIsSameDenominator ? sameDenominator : sameNumerator;
    const other = keyIsSameDenominator ? sameNumerator : sameDenominator;

    const statement = (more: string, less: string): string =>
      useGreaterThan ? `${more} > ${less}` : `${less} < ${more}`;
    /** The same claim with the two fractions swapped: always false. */
    const reversed = (more: string, less: string): string =>
      useGreaterThan ? `${less} > ${more}` : `${more} < ${less}`;

    const answerText = statement(key.more, key.less);

    const candidates = [
      { text: answerText, isCorrect: true },
      // The key's own pair, claimed the other way round.
      {
        text: reversed(key.more, key.less),
        isCorrect: false,
        misconception: keyIsSameDenominator
          ? 'compared-in-the-wrong-direction'
          : 'larger-denominator-means-larger-fraction',
      },
      // The key's own pair, called equal because one of the two numbers matches.
      {
        text: `${key.more} = ${key.less}`,
        isCorrect: false,
        misconception: keyIsSameDenominator ? 'compared-denominators-only' : 'compared-numerators-only',
      },
      // The other pair, claimed the wrong way round.
      {
        text: reversed(other.more, other.less),
        isCorrect: false,
        misconception: keyIsSameDenominator
          ? 'larger-denominator-means-larger-fraction'
          : 'compared-in-the-wrong-direction',
      },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.nf4.compare-like-parts: option collision [${texts.join(' | ')}]`);
    }

    const why = keyIsSameDenominator
      ? [
          `Step 1: ${key.more} and ${key.less} have the same bottom number, so both count pieces of the same size.`,
          `Step 2: When the pieces are the same size, more pieces means more of the whole.`,
          `Step 3: ${c} is more than ${b}, so ${key.more} is the greater fraction.`,
        ]
      : [
          `Step 1: ${key.more} and ${key.less} have the same top number, so both count ${a} ${a === 1 ? 'piece' : 'pieces'}.`,
          `Step 2: When the count is the same, the fraction with the bigger pieces is greater — and a whole cut into ${p} parts has bigger parts than the same whole cut into ${q}.`,
          `Step 3: ${p} is less than ${q}, so ${key.more} is the greater fraction.`,
        ];

    return {
      prompt: 'Which comparison is true?',
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [...why, `Step 4: So the true comparison is ${answerText}.`],
        conceptSummary:
          'Two fractions can be compared by reasoning alone when they share a part. Same bottom number means same-sized pieces, so count them. Same top number means the same number of pieces, so the one with the bigger pieces wins.',
        commonMisconception: `A bigger bottom number makes a SMALLER fraction, because the whole is being shared out among more parts. That is why ${sameNumerator.less} is less than ${sameNumerator.more} even though ${q} is more than ${p}.`,
      },
    };
  },
};
