import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.NF.3 — "Represent equivalent fractions with area and length models",
 * whose FIRST keyConcept is "composing and decomposing fractions into
 * equivalent fractions using RELATED FRACTIONS: halves, fourths and eighths;
 * thirds and sixths".
 *
 * "Related fractions" is the constraint that makes this a Grade 3 standard and
 * not a Grade 4 one, so it is built into the draw space: the only rescalings
 * this generator can produce are 2 -> 4, 2 -> 8, 4 -> 8 and 3 -> 6. It can never
 * cross from one family to the other, and it can never reach a fifth, a tenth
 * or a twelfth.
 *
 * NC.3.NF.3 has TWO MORE keyConcepts that no generator covers and that this one
 * deliberately does not pretend to: "a fraction with the same numerator and
 * denominator equals one whole" (g3-nf3-02) and "expressing whole numbers as
 * fractions" (g3-nf3-03). Both are authored, because both are a single idea
 * rather than a calculation with numbers to vary.
 *
 * ---------------------------------------------------------------------------
 * Construction. The base fraction is n/d and the target denominator is
 * D = k·d, both inside one related family, with n < d so the base is proper.
 * The complete list of legal (n, d, D) is short enough to enumerate, and it is
 * enumerated rather than sampled.
 *
 *   answer                              n·k / D
 *   changed-the-denominator-but-not-    n / D        recut the whole but
 *     the-numerator                                  carried the old count over
 *   added-to-both-parts-instead-of-     (n + D - d) / D
 *     multiplying                                    added the same amount to
 *                                                    top and bottom
 *   scaled-the-numerator-but-not-the-   n·k / d      multiplied the top and
 *     denominator                                    left the bottom alone
 *
 * Distinctness. The first three share the denominator D, with numerators n·k,
 * n and n + D - d. Those differ unless k = 1 (excluded, D > d) or d = n
 * (excluded, n < d). The fourth, n·k/d, has a different denominator, so it has
 * to be checked by value:
 *
 *   n·k/d = n·k/D    =>  d = D.                                  Never.
 *   n·k/d = n/D      =>  k·D = d  =>  k²= 1.                     Never.
 *   n·k/d = (n + D - d)/D.  Multiply out with D = k·d:
 *                    d(n + k·d - d) = n·k·d  =>  d(k-1) = n(k²-1)
 *                                             =>  d = n(k+1).
 *
 * That last one is a real collision and it happens exactly once in the family
 * list: n = 1, d = 3, k = 2 gives d = n(k+1) = 3, and 2/3 would be printed both
 * as the key's neighbour and as a distractor. It is EXCLUDED BY CONSTRUCTION
 * below rather than resampled, which is why 1/3 -> sixths is absent from
 * BASES while 2/3 -> sixths is present.
 *
 * The remaining draw space is 6 (n, d, D) triples, swept in full by the sibling
 * test, which also checks that every denominator printed anywhere is one of
 * {2, 3, 4, 6, 8}.
 */
interface Base {
  n: number;
  d: number;
  /** Target denominator, always a multiple of d inside the same family. */
  target: number;
}

export const BASES: Base[] = [
  { n: 1, d: 2, target: 4 },
  { n: 1, d: 2, target: 8 },
  { n: 1, d: 4, target: 8 },
  { n: 2, d: 4, target: 8 },
  { n: 3, d: 4, target: 8 },
  // { n: 1, d: 3, target: 6 } is EXCLUDED: d = n(k+1) there, so the
  // added-to-both-parts distractor 4/6 and the scaled-numerator distractor 2/3
  // are the same amount. See the algebra above.
  { n: 2, d: 3, target: 6 },
];

/** The base fraction as a shaded bar, 24 characters wide whatever d is, so the
 *  parts of a bar in halves are visibly twice the parts of a bar in fourths. */
function shadedBar(n: number, d: number): string {
  const width = 24 / d;
  const cells = Array.from({ length: d }, (_unused, i) =>
    (i < n ? '█' : ' ').repeat(width),
  );
  return `|${cells.join('|')}|`;
}

export const nf3EquivalentFraction: QuestionTemplate = {
  id: 'g3.nf3.equivalent-fraction',
  standardCode: 'NC.3.NF.3',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { n, d, target } = rng.pick(BASES);
    const k = target / d;

    const answerText = `${n * k}/${target}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // n/target: the whole was recut into smaller parts, but the old count of
      // shaded parts was carried straight over, so half as much is shaded.
      {
        text: `${n}/${target}`,
        isCorrect: false,
        misconception: 'changed-the-denominator-but-not-the-numerator',
      },
      // (n + target - d)/target: the same amount added to the top and to the
      // bottom, which looks fair but does not keep the amount the same.
      {
        text: `${n + target - d}/${target}`,
        isCorrect: false,
        misconception: 'added-to-both-parts-instead-of-multiplying',
      },
      // (n*k)/d: the top number multiplied, the bottom one left alone.
      {
        text: `${n * k}/${d}`,
        isCorrect: false,
        misconception: 'scaled-the-numerator-but-not-the-denominator',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.nf3.equivalent-fraction: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `Which fraction names the same amount as ${n}/${d}?`,
      promptDetails: `${shadedBar(n, d)}\nThe bar is cut into ${d} equal parts, and ${n} of them ${n === 1 ? 'is' : 'are'} shaded.`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Cutting each of the ${d} parts into ${k} pieces makes ${target} parts in the same bar, so each part is now 1/${target}.`,
          `Step 2: Every shaded part was cut into ${k} pieces as well, so each shaded part became ${k} shaded parts.`,
          `Step 3: ${n} ${n === 1 ? 'part was' : 'parts were'} shaded before, so now ${n} × ${k} = ${n * k} parts are shaded.`,
          `Step 4: The same amount is shaded, so ${n}/${d} = ${answerText}.`,
        ],
        conceptSummary:
          'Equivalent fractions are one amount described with different-sized parts. Cutting every part into the same number of pieces makes that many times as many parts AND that many times as many shaded ones, so the top and bottom numbers grow by the same factor.',
        commonMisconception: `Adding ${target - d} to both numbers gives ${n + target - d}/${target}, which shades more of the bar than ${n}/${d} did. Equal amounts come from multiplying both numbers, not from adding to both.`,
      },
    };
  },
};
